# Undo System Feature Specification

**Priority:** 3 - Medium
**Dependencies:** History Tracking System
**Status:** Planning

---

## Overview

Universal undo functionality allowing users to reverse their last 10 actions. The undo system leverages the existing History Tracking System to provide reliable, auditable rollbacks while maintaining data integrity.

---

## User Stories

1. **As a user**, I want to undo my last action immediately after making a mistake
2. **As a PM**, I want to see what will be undone before confirming
3. **As an admin**, I want certain critical actions to require confirmation before undo
4. **As a user**, I want to undo multiple sequential actions
5. **As a user**, I want to redo an action I accidentally undid

---

## Database Schema

```sql
-- Undo stack per user session
CREATE TABLE undo_stack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  user_id UUID NOT NULL REFERENCES users(id),
  session_id TEXT NOT NULL,

  -- Action info
  action_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'batch'
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,

  -- Data for reversal
  previous_state JSONB, -- For updates/deletes
  created_record JSONB, -- For creates (to delete)

  -- Related actions (for batch undo)
  batch_id UUID,
  batch_sequence INTEGER,

  -- Metadata
  description TEXT NOT NULL, -- Human-readable description
  is_critical BOOLEAN DEFAULT false, -- Requires confirmation

  -- Stack management
  stack_position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',

  -- Status
  status TEXT DEFAULT 'available', -- 'available', 'undone', 'expired', 'blocked'
  undone_at TIMESTAMPTZ,

  UNIQUE(user_id, session_id, stack_position)
);

-- Redo stack (populated when undo is executed)
CREATE TABLE redo_stack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  user_id UUID NOT NULL REFERENCES users(id),
  session_id TEXT NOT NULL,

  -- Link to original undo record
  undo_record_id UUID REFERENCES undo_stack(id),

  -- Data for redo
  action_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  redo_state JSONB NOT NULL,

  description TEXT NOT NULL,
  stack_position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour',

  UNIQUE(user_id, session_id, stack_position)
);

-- Actions that cannot be undone
CREATE TABLE undo_blocklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id), -- NULL for system-wide

  table_name TEXT NOT NULL,
  action_type TEXT, -- NULL means all actions
  reason TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default blocklist
INSERT INTO undo_blocklist (table_name, action_type, reason) VALUES
  ('payments', 'delete', 'Financial records cannot be deleted'),
  ('payments', 'update', 'Financial records require adjustment entries'),
  ('audit_logs', NULL, 'Audit logs are immutable'),
  ('record_history', NULL, 'History records are immutable'),
  ('users', 'delete', 'User deletion requires deactivation workflow');

-- Indexes
CREATE INDEX idx_undo_stack_user ON undo_stack(user_id, session_id, stack_position DESC);
CREATE INDEX idx_undo_stack_expires ON undo_stack(expires_at) WHERE status = 'available';
CREATE INDEX idx_redo_stack_user ON redo_stack(user_id, session_id, stack_position DESC);
```

---

## Core Implementation

### Undo Stack Manager

```typescript
// lib/undo/undo-manager.ts

interface UndoAction {
  id: string
  actionType: 'create' | 'update' | 'delete' | 'batch'
  tableName: string
  recordId: string
  previousState: Record<string, unknown> | null
  createdRecord: Record<string, unknown> | null
  description: string
  isCritical: boolean
  batchId?: string
  batchSequence?: number
}

interface UndoResult {
  success: boolean
  recordId: string
  restoredState?: Record<string, unknown>
  error?: string
}

const MAX_UNDO_STACK = 10

export class UndoManager {
  private userId: string
  private sessionId: string
  private companyId: string

  constructor(userId: string, sessionId: string, companyId: string) {
    this.userId = userId
    this.sessionId = sessionId
    this.companyId = companyId
  }

  /**
   * Push an action onto the undo stack
   */
  async pushAction(action: Omit<UndoAction, 'id'>): Promise<void> {
    // Check if action is on blocklist
    const blocked = await this.isBlocked(action.tableName, action.actionType)
    if (blocked) {
      console.log(`Action blocked from undo: ${blocked.reason}`)
      return
    }

    // Get current stack position
    const { data: currentTop } = await supabase
      .from('undo_stack')
      .select('stack_position')
      .eq('user_id', this.userId)
      .eq('session_id', this.sessionId)
      .eq('status', 'available')
      .order('stack_position', { ascending: false })
      .limit(1)
      .single()

    const newPosition = (currentTop?.stack_position ?? -1) + 1

    // If stack is full, remove oldest
    if (newPosition >= MAX_UNDO_STACK) {
      await this.pruneOldest()
    }

    // Clear redo stack on new action
    await this.clearRedoStack()

    // Insert new action
    await supabase.from('undo_stack').insert({
      company_id: this.companyId,
      user_id: this.userId,
      session_id: this.sessionId,
      action_type: action.actionType,
      table_name: action.tableName,
      record_id: action.recordId,
      previous_state: action.previousState,
      created_record: action.createdRecord,
      description: action.description,
      is_critical: action.isCritical,
      batch_id: action.batchId,
      batch_sequence: action.batchSequence,
      stack_position: newPosition,
    })
  }

  /**
   * Get the current undo stack
   */
  async getStack(): Promise<UndoAction[]> {
    const { data } = await supabase
      .from('undo_stack')
      .select('*')
      .eq('user_id', this.userId)
      .eq('session_id', this.sessionId)
      .eq('status', 'available')
      .order('stack_position', { ascending: false })
      .limit(MAX_UNDO_STACK)

    return data || []
  }

  /**
   * Preview what will be undone
   */
  async previewUndo(): Promise<{
    actions: UndoAction[]
    warnings: string[]
  }> {
    const stack = await this.getStack()
    if (stack.length === 0) {
      return { actions: [], warnings: [] }
    }

    const topAction = stack[0]
    const warnings: string[] = []

    // Check for batch actions
    if (topAction.batchId) {
      const batchActions = stack.filter(a => a.batchId === topAction.batchId)
      if (topAction.isCritical) {
        warnings.push('This action affects multiple records and cannot be undone again.')
      }
      return { actions: batchActions, warnings }
    }

    // Check for dependent records
    const dependents = await this.checkDependents(topAction)
    if (dependents.length > 0) {
      warnings.push(`This will also affect ${dependents.length} related record(s).`)
    }

    if (topAction.isCritical) {
      warnings.push('This is a critical action. Please confirm.')
    }

    return { actions: [topAction], warnings }
  }

  /**
   * Execute undo
   */
  async undo(): Promise<UndoResult> {
    const stack = await this.getStack()
    if (stack.length === 0) {
      return { success: false, recordId: '', error: 'Nothing to undo' }
    }

    const topAction = stack[0]

    try {
      // Start transaction
      let result: UndoResult

      switch (topAction.actionType) {
        case 'create':
          // Delete the created record
          result = await this.undoCreate(topAction)
          break

        case 'update':
          // Restore previous state
          result = await this.undoUpdate(topAction)
          break

        case 'delete':
          // Restore deleted record
          result = await this.undoDelete(topAction)
          break

        case 'batch':
          // Handle batch undo
          result = await this.undoBatch(topAction)
          break

        default:
          return { success: false, recordId: topAction.recordId, error: 'Unknown action type' }
      }

      if (result.success) {
        // Mark as undone
        await supabase
          .from('undo_stack')
          .update({ status: 'undone', undone_at: new Date().toISOString() })
          .eq('id', topAction.id)

        // Add to redo stack
        await this.pushToRedoStack(topAction, result.restoredState)
      }

      return result
    } catch (error) {
      return {
        success: false,
        recordId: topAction.recordId,
        error: error instanceof Error ? error.message : 'Undo failed',
      }
    }
  }

  /**
   * Execute redo
   */
  async redo(): Promise<UndoResult> {
    const { data: redoAction } = await supabase
      .from('redo_stack')
      .select('*')
      .eq('user_id', this.userId)
      .eq('session_id', this.sessionId)
      .order('stack_position', { ascending: false })
      .limit(1)
      .single()

    if (!redoAction) {
      return { success: false, recordId: '', error: 'Nothing to redo' }
    }

    try {
      // Re-apply the original action
      await supabase
        .from(redoAction.table_name)
        .upsert(redoAction.redo_state)

      // Remove from redo stack
      await supabase.from('redo_stack').delete().eq('id', redoAction.id)

      // Mark original undo record as available again
      await supabase
        .from('undo_stack')
        .update({ status: 'available', undone_at: null })
        .eq('id', redoAction.undo_record_id)

      return { success: true, recordId: redoAction.record_id }
    } catch (error) {
      return {
        success: false,
        recordId: redoAction.record_id,
        error: error instanceof Error ? error.message : 'Redo failed',
      }
    }
  }

  // Private methods

  private async undoCreate(action: UndoAction): Promise<UndoResult> {
    const { error } = await supabase
      .from(action.tableName)
      .delete()
      .eq('id', action.recordId)

    if (error) throw error

    return {
      success: true,
      recordId: action.recordId,
      restoredState: action.createdRecord || undefined,
    }
  }

  private async undoUpdate(action: UndoAction): Promise<UndoResult> {
    if (!action.previousState) {
      return { success: false, recordId: action.recordId, error: 'No previous state available' }
    }

    const { error } = await supabase
      .from(action.tableName)
      .update(action.previousState)
      .eq('id', action.recordId)

    if (error) throw error

    return {
      success: true,
      recordId: action.recordId,
      restoredState: action.previousState,
    }
  }

  private async undoDelete(action: UndoAction): Promise<UndoResult> {
    if (!action.previousState) {
      return { success: false, recordId: action.recordId, error: 'No previous state available' }
    }

    const { error } = await supabase
      .from(action.tableName)
      .insert(action.previousState)

    if (error) throw error

    return {
      success: true,
      recordId: action.recordId,
      restoredState: action.previousState,
    }
  }

  private async undoBatch(action: UndoAction): Promise<UndoResult> {
    if (!action.batchId) {
      return { success: false, recordId: action.recordId, error: 'Invalid batch action' }
    }

    // Get all actions in batch
    const { data: batchActions } = await supabase
      .from('undo_stack')
      .select('*')
      .eq('batch_id', action.batchId)
      .order('batch_sequence', { ascending: false }) // Reverse order

    if (!batchActions) {
      return { success: false, recordId: action.recordId, error: 'Batch actions not found' }
    }

    // Undo each action in reverse order
    for (const batchAction of batchActions) {
      let result: UndoResult

      switch (batchAction.action_type) {
        case 'create':
          result = await this.undoCreate(batchAction)
          break
        case 'update':
          result = await this.undoUpdate(batchAction)
          break
        case 'delete':
          result = await this.undoDelete(batchAction)
          break
        default:
          continue
      }

      if (!result.success) {
        return result // Return first failure
      }
    }

    return { success: true, recordId: action.recordId }
  }

  private async isBlocked(
    tableName: string,
    actionType: string
  ): Promise<{ reason: string } | null> {
    const { data } = await supabase
      .from('undo_blocklist')
      .select('reason')
      .or(`company_id.is.null,company_id.eq.${this.companyId}`)
      .eq('table_name', tableName)
      .or(`action_type.is.null,action_type.eq.${actionType}`)
      .limit(1)
      .single()

    return data
  }

  private async checkDependents(action: UndoAction): Promise<string[]> {
    // Check for foreign key relationships that would be affected
    // This is table-specific logic
    const dependencyMap: Record<string, string[]> = {
      jobs: ['daily_logs', 'change_orders', 'invoices', 'selections'],
      invoices: ['invoice_line_items', 'payments'],
      change_orders: ['co_line_items'],
    }

    const dependentTables = dependencyMap[action.tableName] || []
    const affected: string[] = []

    for (const table of dependentTables) {
      const { count } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq('job_id', action.recordId)

      if (count && count > 0) {
        affected.push(`${count} ${table}`)
      }
    }

    return affected
  }

  private async pruneOldest(): Promise<void> {
    // Delete oldest action beyond MAX_UNDO_STACK
    const { data: oldest } = await supabase
      .from('undo_stack')
      .select('id')
      .eq('user_id', this.userId)
      .eq('session_id', this.sessionId)
      .eq('status', 'available')
      .order('stack_position', { ascending: true })
      .limit(1)
      .single()

    if (oldest) {
      await supabase.from('undo_stack').delete().eq('id', oldest.id)
    }
  }

  private async clearRedoStack(): Promise<void> {
    await supabase
      .from('redo_stack')
      .delete()
      .eq('user_id', this.userId)
      .eq('session_id', this.sessionId)
  }

  private async pushToRedoStack(
    undoAction: UndoAction,
    currentState?: Record<string, unknown>
  ): Promise<void> {
    if (!currentState) return

    const { data: currentTop } = await supabase
      .from('redo_stack')
      .select('stack_position')
      .eq('user_id', this.userId)
      .eq('session_id', this.sessionId)
      .order('stack_position', { ascending: false })
      .limit(1)
      .single()

    await supabase.from('redo_stack').insert({
      company_id: this.companyId,
      user_id: this.userId,
      session_id: this.sessionId,
      undo_record_id: undoAction.id,
      action_type: undoAction.actionType,
      table_name: undoAction.tableName,
      record_id: undoAction.recordId,
      redo_state: currentState,
      description: undoAction.description,
      stack_position: (currentTop?.stack_position ?? -1) + 1,
    })
  }
}
```

---

## React Hook

```typescript
// hooks/use-undo.ts

import { useCallback, useEffect, useState } from 'react'
import { UndoManager } from '@/lib/undo/undo-manager'
import { useAuth } from '@/lib/auth'

export function useUndo() {
  const { user, session } = useAuth()
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [undoStack, setUndoStack] = useState<UndoAction[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const manager = useMemo(() => {
    if (!user || !session) return null
    return new UndoManager(user.id, session.id, user.companyId)
  }, [user, session])

  // Refresh stack state
  const refreshStack = useCallback(async () => {
    if (!manager) return
    const stack = await manager.getStack()
    setUndoStack(stack)
    setCanUndo(stack.length > 0)
    // Check redo availability separately
  }, [manager])

  // Execute undo
  const undo = useCallback(async () => {
    if (!manager || !canUndo) return { success: false }

    setIsLoading(true)
    try {
      const result = await manager.undo()
      await refreshStack()
      return result
    } finally {
      setIsLoading(false)
    }
  }, [manager, canUndo, refreshStack])

  // Execute redo
  const redo = useCallback(async () => {
    if (!manager || !canRedo) return { success: false }

    setIsLoading(true)
    try {
      const result = await manager.redo()
      await refreshStack()
      return result
    } finally {
      setIsLoading(false)
    }
  }, [manager, canRedo, refreshStack])

  // Preview undo
  const previewUndo = useCallback(async () => {
    if (!manager) return { actions: [], warnings: [] }
    return manager.previewUndo()
  }, [manager])

  // Register an action for undo
  const registerAction = useCallback(async (action: Omit<UndoAction, 'id'>) => {
    if (!manager) return
    await manager.pushAction(action)
    await refreshStack()
  }, [manager, refreshStack])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault()
          redo()
        } else {
          e.preventDefault()
          undo()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  // Initial load
  useEffect(() => {
    refreshStack()
  }, [refreshStack])

  return {
    canUndo,
    canRedo,
    undoStack,
    isLoading,
    undo,
    redo,
    previewUndo,
    registerAction,
    refreshStack,
  }
}
```

---

## UI Components

### Undo Button with Preview

```tsx
// components/undo/undo-button.tsx

'use client'

import { useState } from 'react'
import { Undo2, Redo2, AlertTriangle } from 'lucide-react'
import { useUndo } from '@/hooks/use-undo'

export function UndoButton() {
  const { canUndo, canRedo, undo, redo, previewUndo, isLoading } = useUndo()
  const [showPreview, setShowPreview] = useState(false)
  const [preview, setPreview] = useState<{ actions: any[]; warnings: string[] }>({
    actions: [],
    warnings: [],
  })

  const handleUndoHover = async () => {
    const result = await previewUndo()
    setPreview(result)
    setShowPreview(true)
  }

  const handleUndo = async () => {
    setShowPreview(false)
    const result = await undo()
    if (result.success) {
      // Show toast notification
    }
  }

  return (
    <div className="relative flex items-center gap-1">
      <div
        onMouseEnter={handleUndoHover}
        onMouseLeave={() => setShowPreview(false)}
      >
        <button
          onClick={handleUndo}
          disabled={!canUndo || isLoading}
          className="p-2 rounded-lg hover:bg-warm-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4 text-warm-600" />
        </button>

        {showPreview && preview.actions.length > 0 && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-warm-0 rounded-lg border border-warm-200 shadow-lg p-3 z-50">
            <p className="text-xs font-medium text-warm-700 mb-2">Undo:</p>
            {preview.actions.map((action, i) => (
              <p key={i} className="text-sm text-warm-600">{action.description}</p>
            ))}

            {preview.warnings.length > 0 && (
              <div className="mt-2 pt-2 border-t border-warm-200">
                {preview.warnings.map((warning, i) => (
                  <div key={i} className="flex items-start gap-1 text-xs text-warning">
                    <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    {warning}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => redo()}
        disabled={!canRedo || isLoading}
        className="p-2 rounded-lg hover:bg-warm-100 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 className="h-4 w-4 text-warm-600" />
      </button>
    </div>
  )
}
```

---

## Integration with Existing Components

### Form Wrapper for Auto-Registration

```tsx
// components/forms/undoable-form.tsx

interface UndoableFormProps<T> {
  tableName: string
  recordId?: string
  initialData?: T
  onSubmit: (data: T) => Promise<void>
  children: React.ReactNode
  actionDescription?: (data: T) => string
}

export function UndoableForm<T extends Record<string, unknown>>({
  tableName,
  recordId,
  initialData,
  onSubmit,
  children,
  actionDescription,
}: UndoableFormProps<T>) {
  const { registerAction } = useUndo()

  const handleSubmit = async (data: T) => {
    // Register for undo before submitting
    await registerAction({
      actionType: recordId ? 'update' : 'create',
      tableName,
      recordId: recordId || 'pending', // Will be updated after create
      previousState: initialData || null,
      createdRecord: recordId ? null : data,
      description: actionDescription?.(data) ||
        `${recordId ? 'Updated' : 'Created'} ${tableName} record`,
      isCritical: false,
    })

    await onSubmit(data)
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      // Extract form data and call handleSubmit
    }}>
      {children}
    </form>
  )
}
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` / `Cmd+Z` | Undo last action |
| `Ctrl+Shift+Z` / `Cmd+Shift+Z` | Redo last undone action |
| `Ctrl+Alt+Z` | Open undo history panel |

---

## Edge Cases

1. **Concurrent edits**: If another user modifies a record before undo, show conflict resolution
2. **Cascading deletes**: When undoing a create that has dependencies, restore those too
3. **Expired undo**: Actions expire after 24 hours
4. **Cross-tab sessions**: Undo stack is per-session, not shared across tabs
5. **Blocked actions**: Some tables/actions cannot be undone (payments, audit logs)

---

## Implementation Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1 | Week 1 | Database schema, UndoManager core |
| Phase 2 | Week 2 | React hook, UI components |
| Phase 3 | Week 3 | Integration with existing forms |
| Phase 4 | Week 4 | Testing, edge cases, polish |

---

*BuildDesk Feature Specification v1.0*
