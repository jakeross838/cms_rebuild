# History Tracking System

**Version:** 1.0
**Status:** Planning
**Scope:** All modules, all records

---

## Overview

Every record in BuildDesk maintains a complete history of who changed what, when, and the before/after values. This enables:

- **Audit trail** - Compliance and accountability
- **Undo/restore** - Revert changes
- **Dispute resolution** - "Who approved this?"
- **Activity feeds** - What happened on this project?
- **Debugging** - Track down data issues

---

## Database Architecture

### Core History Table

```sql
-- Single unified history table for all entities
CREATE TABLE record_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tenant isolation
  company_id UUID NOT NULL REFERENCES companies(id),

  -- What was changed
  table_name TEXT NOT NULL,           -- 'jobs', 'invoices', 'daily_logs', etc.
  record_id UUID NOT NULL,            -- Primary key of the changed record

  -- What type of change
  action TEXT NOT NULL,               -- 'INSERT', 'UPDATE', 'DELETE', 'RESTORE'

  -- Who made the change
  user_id UUID REFERENCES users(id),  -- NULL for system changes
  user_name TEXT,                     -- Denormalized for quick display
  user_role TEXT,                     -- Role at time of change

  -- Change details
  changed_fields TEXT[],              -- Array of field names that changed
  old_values JSONB,                   -- Previous values (NULL for INSERT)
  new_values JSONB,                   -- New values (NULL for DELETE)

  -- Context
  change_reason TEXT,                 -- Optional: why was this changed?
  source TEXT DEFAULT 'app',          -- 'app', 'api', 'import', 'system', 'migration'
  ip_address INET,                    -- For security auditing
  user_agent TEXT,                    -- Browser/device info

  -- Related context
  job_id UUID,                        -- If change is job-related
  parent_table TEXT,                  -- Parent entity if nested
  parent_id UUID,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Search optimization
  search_text TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english',
      COALESCE(table_name, '') || ' ' ||
      COALESCE(change_reason, '') || ' ' ||
      COALESCE(new_values::text, '')
    )
  ) STORED
);

-- Indexes for common queries
CREATE INDEX idx_history_company_date
  ON record_history(company_id, created_at DESC);

CREATE INDEX idx_history_table_record
  ON record_history(table_name, record_id, created_at DESC);

CREATE INDEX idx_history_user
  ON record_history(user_id, created_at DESC);

CREATE INDEX idx_history_job
  ON record_history(job_id, created_at DESC)
  WHERE job_id IS NOT NULL;

CREATE INDEX idx_history_search
  ON record_history USING gin(search_text);

-- Partitioning by month for scale
-- (At 100K companies, this table grows fast)
CREATE TABLE record_history_partitioned (
  LIKE record_history INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE record_history_2026_01
  PARTITION OF record_history_partitioned
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE record_history_2026_02
  PARTITION OF record_history_partitioned
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
-- ... auto-create future partitions via cron job
```

### Automatic Tracking via Triggers

```sql
-- Generic trigger function for any table
CREATE OR REPLACE FUNCTION track_record_history()
RETURNS TRIGGER AS $$
DECLARE
  v_old_values JSONB;
  v_new_values JSONB;
  v_changed_fields TEXT[];
  v_user_id UUID;
  v_user_name TEXT;
  v_company_id UUID;
  v_job_id UUID;
BEGIN
  -- Get current user from session
  v_user_id := current_setting('app.current_user_id', true)::UUID;
  v_user_name := current_setting('app.current_user_name', true);
  v_company_id := current_setting('app.current_company_id', true)::UUID;

  -- Determine job_id if applicable
  IF TG_TABLE_NAME = 'jobs' THEN
    v_job_id := COALESCE(NEW.id, OLD.id);
  ELSIF NEW.job_id IS NOT NULL THEN
    v_job_id := NEW.job_id;
  ELSIF OLD.job_id IS NOT NULL THEN
    v_job_id := OLD.job_id;
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_new_values := to_jsonb(NEW);
    v_changed_fields := ARRAY(SELECT jsonb_object_keys(v_new_values));

    INSERT INTO record_history (
      company_id, table_name, record_id, action,
      user_id, user_name, changed_fields, new_values,
      job_id, source
    ) VALUES (
      COALESCE(NEW.company_id, v_company_id),
      TG_TABLE_NAME,
      NEW.id,
      'INSERT',
      v_user_id,
      v_user_name,
      v_changed_fields,
      v_new_values,
      v_job_id,
      COALESCE(current_setting('app.change_source', true), 'app')
    );

    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    v_old_values := to_jsonb(OLD);
    v_new_values := to_jsonb(NEW);

    -- Find which fields actually changed
    SELECT ARRAY_AGG(key) INTO v_changed_fields
    FROM (
      SELECT key
      FROM jsonb_each(v_new_values)
      WHERE v_old_values->key IS DISTINCT FROM v_new_values->key
        AND key NOT IN ('updated_at', 'version') -- Ignore metadata fields
    ) changed;

    -- Only log if something actually changed
    IF v_changed_fields IS NOT NULL AND array_length(v_changed_fields, 1) > 0 THEN
      -- Filter to only changed fields
      v_old_values := (
        SELECT jsonb_object_agg(key, value)
        FROM jsonb_each(v_old_values)
        WHERE key = ANY(v_changed_fields)
      );
      v_new_values := (
        SELECT jsonb_object_agg(key, value)
        FROM jsonb_each(v_new_values)
        WHERE key = ANY(v_changed_fields)
      );

      INSERT INTO record_history (
        company_id, table_name, record_id, action,
        user_id, user_name, changed_fields, old_values, new_values,
        job_id, source, change_reason
      ) VALUES (
        COALESCE(NEW.company_id, v_company_id),
        TG_TABLE_NAME,
        NEW.id,
        'UPDATE',
        v_user_id,
        v_user_name,
        v_changed_fields,
        v_old_values,
        v_new_values,
        v_job_id,
        COALESCE(current_setting('app.change_source', true), 'app'),
        current_setting('app.change_reason', true)
      );
    END IF;

    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    v_old_values := to_jsonb(OLD);

    INSERT INTO record_history (
      company_id, table_name, record_id, action,
      user_id, user_name, old_values,
      job_id, source, change_reason
    ) VALUES (
      COALESCE(OLD.company_id, v_company_id),
      TG_TABLE_NAME,
      OLD.id,
      'DELETE',
      v_user_id,
      v_user_name,
      v_old_values,
      v_job_id,
      COALESCE(current_setting('app.change_source', true), 'app'),
      current_setting('app.change_reason', true)
    );

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to all tracked tables
DO $$
DECLARE
  t TEXT;
  tracked_tables TEXT[] := ARRAY[
    'jobs',
    'daily_logs',
    'invoices',
    'purchase_orders',
    'change_orders',
    'draws',
    'rfis',
    'submittals',
    'inspections',
    'punch_list_items',
    'selections',
    'photos',
    'documents',
    'contracts',
    'estimates',
    'proposals',
    'leads',
    'clients',
    'vendors',
    'contacts',
    'team_members',
    'schedules',
    'schedule_tasks',
    'budget_lines',
    'cost_codes',
    'permits',
    'warranties',
    'lien_waivers',
    'insurance_certificates',
    'communications',
    'meetings',
    'templates',
    'company_settings'
  ];
BEGIN
  FOREACH t IN ARRAY tracked_tables LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS track_history ON %I;
      CREATE TRIGGER track_history
        AFTER INSERT OR UPDATE OR DELETE ON %I
        FOR EACH ROW EXECUTE FUNCTION track_record_history();
    ', t, t);
  END LOOP;
END $$;
```

### RLS for History Access

```sql
-- Users can only see history for their company
ALTER TABLE record_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "history_company_isolation" ON record_history
  FOR SELECT
  USING (company_id = auth.jwt() ->> 'company_id');

-- Only admins can see all history
CREATE POLICY "history_admin_access" ON record_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'owner')
      AND company_id = record_history.company_id
    )
  );
```

---

## API Layer

### Edge Function: Get History

```typescript
// supabase/functions/get-history/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'

interface HistoryQuery {
  table_name?: string
  record_id?: string
  job_id?: string
  user_id?: string
  action?: string
  date_from?: string
  date_to?: string
  search?: string
  limit?: number
  offset?: number
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const {
    table_name,
    record_id,
    job_id,
    user_id,
    action,
    date_from,
    date_to,
    search,
    limit = 50,
    offset = 0
  }: HistoryQuery = await req.json()

  let query = supabase
    .from('record_history')
    .select(`
      id,
      table_name,
      record_id,
      action,
      user_id,
      user_name,
      changed_fields,
      old_values,
      new_values,
      change_reason,
      source,
      job_id,
      created_at
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (table_name) query = query.eq('table_name', table_name)
  if (record_id) query = query.eq('record_id', record_id)
  if (job_id) query = query.eq('job_id', job_id)
  if (user_id) query = query.eq('user_id', user_id)
  if (action) query = query.eq('action', action)
  if (date_from) query = query.gte('created_at', date_from)
  if (date_to) query = query.lte('created_at', date_to)
  if (search) query = query.textSearch('search_text', search)

  const { data, error, count } = await query

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    history: data,
    total: count,
    limit,
    offset
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### React Hook: useHistory

```typescript
// app/src/hooks/use-history.ts

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface HistoryEntry {
  id: string
  table_name: string
  record_id: string
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'RESTORE'
  user_id: string | null
  user_name: string | null
  changed_fields: string[] | null
  old_values: Record<string, any> | null
  new_values: Record<string, any> | null
  change_reason: string | null
  source: string
  job_id: string | null
  created_at: string
}

interface UseHistoryOptions {
  tableName?: string
  recordId?: string
  jobId?: string
  userId?: string
  limit?: number
}

export function useHistory(options: UseHistoryOptions) {
  const { tableName, recordId, jobId, userId, limit = 50 } = options

  return useQuery({
    queryKey: ['history', tableName, recordId, jobId, userId, limit],
    queryFn: async () => {
      let query = supabase
        .from('record_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (tableName) query = query.eq('table_name', tableName)
      if (recordId) query = query.eq('record_id', recordId)
      if (jobId) query = query.eq('job_id', jobId)
      if (userId) query = query.eq('user_id', userId)

      const { data, error } = await query

      if (error) throw error
      return data as HistoryEntry[]
    },
    staleTime: 30000, // 30 seconds
  })
}

// Hook for single record history
export function useRecordHistory(tableName: string, recordId: string) {
  return useHistory({ tableName, recordId })
}

// Hook for job activity
export function useJobHistory(jobId: string, limit = 100) {
  return useHistory({ jobId, limit })
}

// Hook for user activity
export function useUserHistory(userId: string, limit = 50) {
  return useHistory({ userId, limit })
}
```

---

## UI Components

### History Panel Component

```tsx
// app/src/components/history/history-panel.tsx

'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  History,
  User,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Filter,
  Search,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRecordHistory } from '@/hooks/use-history'

interface HistoryPanelProps {
  tableName: string
  recordId: string
  className?: string
}

const actionConfig = {
  INSERT: { icon: Plus, label: 'Created', color: 'text-green-600 bg-green-50' },
  UPDATE: { icon: Pencil, label: 'Updated', color: 'text-stone-600 bg-stone-50' },
  DELETE: { icon: Trash2, label: 'Deleted', color: 'text-red-600 bg-red-50' },
  RESTORE: { icon: RotateCcw, label: 'Restored', color: 'text-blue-600 bg-blue-50' },
}

const fieldLabels: Record<string, string> = {
  status: 'Status',
  amount: 'Amount',
  due_date: 'Due Date',
  description: 'Description',
  notes: 'Notes',
  assigned_to: 'Assigned To',
  priority: 'Priority',
  // Add more as needed
}

export function HistoryPanel({ tableName, recordId, className }: HistoryPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { data: history, isLoading, error } = useRecordHistory(tableName, recordId)

  if (isLoading) {
    return (
      <div className={cn('bg-warm-0 rounded-lg border border-warm-200 p-4', className)}>
        <div className="flex items-center gap-2 text-warm-500">
          <History className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading history...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('bg-red-50 rounded-lg border border-red-200 p-4', className)}>
        <p className="text-sm text-red-600">Failed to load history</p>
      </div>
    )
  }

  if (!history || history.length === 0) {
    return (
      <div className={cn('bg-warm-50 rounded-lg border border-warm-200 p-4', className)}>
        <div className="flex items-center gap-2 text-warm-500">
          <History className="h-4 w-4" />
          <span className="text-sm">No history available</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-warm-0 rounded-lg border border-warm-200', className)}>
      <div className="px-4 py-3 border-b border-warm-200 bg-warm-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-warm-500" />
            <h3 className="font-medium text-warm-900 text-sm">History</h3>
            <span className="text-xs bg-warm-200 text-warm-600 px-1.5 py-0.5 rounded">
              {history.length} changes
            </span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-warm-100 max-h-96 overflow-y-auto">
        {history.map((entry) => {
          const config = actionConfig[entry.action]
          const Icon = config.icon
          const isExpanded = expandedId === entry.id

          return (
            <div key={entry.id} className="px-4 py-3">
              <div
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              >
                <div className={cn('p-1.5 rounded-lg', config.color)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-warm-900">
                      {config.label}
                    </span>
                    {entry.changed_fields && entry.changed_fields.length > 0 && (
                      <span className="text-xs text-warm-500">
                        {entry.changed_fields.length} field
                        {entry.changed_fields.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1 text-xs text-warm-500">
                      <User className="h-3 w-3" />
                      <span>{entry.user_name || 'System'}</span>
                    </div>
                    <span className="text-xs text-warm-400">
                      {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  {entry.change_reason && (
                    <p className="text-xs text-warm-500 mt-1 italic">
                      "{entry.change_reason}"
                    </p>
                  )}
                </div>

                <button className="p-1 hover:bg-warm-100 rounded">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-warm-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-warm-400" />
                  )}
                </button>
              </div>

              {isExpanded && entry.changed_fields && (
                <div className="mt-3 ml-10 space-y-2">
                  {entry.changed_fields.map((field) => {
                    const oldValue = entry.old_values?.[field]
                    const newValue = entry.new_values?.[field]
                    const label = fieldLabels[field] || field.replace(/_/g, ' ')

                    return (
                      <div key={field} className="bg-warm-50 rounded-lg p-2">
                        <div className="text-xs font-medium text-warm-600 mb-1 capitalize">
                          {label}
                        </div>
                        <div className="flex items-center gap-2">
                          {oldValue !== undefined && (
                            <div className="flex-1 bg-red-50 text-red-700 text-xs px-2 py-1 rounded line-through">
                              {formatValue(oldValue)}
                            </div>
                          )}
                          {oldValue !== undefined && newValue !== undefined && (
                            <span className="text-warm-400">→</span>
                          )}
                          {newValue !== undefined && (
                            <div className="flex-1 bg-green-50 text-green-700 text-xs px-2 py-1 rounded">
                              {formatValue(newValue)}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return '(empty)'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') {
    if (value > 1000) return `$${value.toLocaleString()}`
    return value.toString()
  }
  if (typeof value === 'object') return JSON.stringify(value)
  if (value.length > 100) return value.substring(0, 100) + '...'
  return String(value)
}
```

### Activity Feed Component (Job-Level)

```tsx
// app/src/components/history/activity-feed.tsx

'use client'

import { useState } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import {
  Activity,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  FileText,
  DollarSign,
  Camera,
  Calendar,
  MessageSquare,
  ClipboardList,
  Filter,
  User,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useJobHistory } from '@/hooks/use-history'
import Link from 'next/link'

interface ActivityFeedProps {
  jobId: string
  className?: string
  limit?: number
}

const tableConfig: Record<string, { icon: any; label: string; color: string }> = {
  daily_logs: { icon: ClipboardList, label: 'Daily Log', color: 'bg-green-100 text-green-600' },
  invoices: { icon: DollarSign, label: 'Invoice', color: 'bg-amber-100 text-amber-600' },
  change_orders: { icon: FileText, label: 'Change Order', color: 'bg-red-100 text-red-600' },
  photos: { icon: Camera, label: 'Photo', color: 'bg-blue-100 text-blue-600' },
  schedule_tasks: { icon: Calendar, label: 'Schedule', color: 'bg-purple-100 text-purple-600' },
  selections: { icon: FileText, label: 'Selection', color: 'bg-pink-100 text-pink-600' },
  communications: { icon: MessageSquare, label: 'Message', color: 'bg-cyan-100 text-cyan-600' },
  draws: { icon: DollarSign, label: 'Draw', color: 'bg-emerald-100 text-emerald-600' },
  rfis: { icon: MessageSquare, label: 'RFI', color: 'bg-orange-100 text-orange-600' },
  punch_list_items: { icon: ClipboardList, label: 'Punch Item', color: 'bg-stone-100 text-stone-600' },
}

const actionLabels = {
  INSERT: 'created',
  UPDATE: 'updated',
  DELETE: 'deleted',
  RESTORE: 'restored',
}

export function ActivityFeed({ jobId, className, limit = 50 }: ActivityFeedProps) {
  const [filter, setFilter] = useState<string | null>(null)
  const { data: history, isLoading } = useJobHistory(jobId, limit)

  const filteredHistory = filter
    ? history?.filter((h) => h.table_name === filter)
    : history

  // Group by date
  const groupedHistory = filteredHistory?.reduce((groups, entry) => {
    const date = format(new Date(entry.created_at), 'yyyy-MM-dd')
    if (!groups[date]) groups[date] = []
    groups[date].push(entry)
    return groups
  }, {} as Record<string, typeof history>)

  if (isLoading) {
    return (
      <div className={cn('bg-warm-0 rounded-lg border border-warm-200 p-6', className)}>
        <div className="flex items-center gap-2 text-warm-500">
          <Activity className="h-5 w-5 animate-pulse" />
          <span>Loading activity...</span>
        </div>
      </div>
    )
  }

  const uniqueTables = [...new Set(history?.map((h) => h.table_name))]

  return (
    <div className={cn('bg-warm-0 rounded-lg border border-warm-200', className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-warm-200 bg-warm-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-warm-500" />
            <h3 className="font-medium text-warm-900">Activity</h3>
            <span className="text-xs bg-warm-200 text-warm-600 px-1.5 py-0.5 rounded">
              {filteredHistory?.length || 0}
            </span>
          </div>

          {/* Filter dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-warm-400" />
            <select
              value={filter || ''}
              onChange={(e) => setFilter(e.target.value || null)}
              className="text-xs border border-warm-200 rounded px-2 py-1 bg-warm-0"
            >
              <option value="">All Activity</option>
              {uniqueTables.map((table) => {
                const config = tableConfig[table]
                return (
                  <option key={table} value={table}>
                    {config?.label || table}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="max-h-[500px] overflow-y-auto">
        {groupedHistory && Object.entries(groupedHistory).map(([date, entries]) => (
          <div key={date}>
            {/* Date Header */}
            <div className="sticky top-0 bg-warm-100 px-4 py-1.5 text-xs font-medium text-warm-600">
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </div>

            {/* Entries */}
            <div className="divide-y divide-warm-50">
              {entries?.map((entry) => {
                const config = tableConfig[entry.table_name] || {
                  icon: FileText,
                  label: entry.table_name,
                  color: 'bg-warm-100 text-warm-600',
                }
                const Icon = config.icon

                return (
                  <div
                    key={entry.id}
                    className="px-4 py-3 hover:bg-warm-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('p-1.5 rounded-lg', config.color)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-warm-800">
                          <span className="font-medium">{entry.user_name || 'System'}</span>
                          {' '}
                          <span className="text-warm-600">
                            {actionLabels[entry.action]} a {config.label.toLowerCase()}
                          </span>
                          {entry.changed_fields && entry.changed_fields.length > 0 && (
                            <span className="text-warm-500">
                              {' '}({entry.changed_fields.join(', ')})
                            </span>
                          )}
                        </p>

                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-warm-400">
                            {format(new Date(entry.created_at), 'h:mm a')}
                          </span>

                          {entry.record_id && (
                            <Link
                              href={`/skeleton/jobs/${jobId}/${entry.table_name}?id=${entry.record_id}`}
                              className="text-xs text-stone-600 hover:text-stone-700 flex items-center gap-1"
                            >
                              View
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>

                        {entry.change_reason && (
                          <p className="text-xs text-warm-500 mt-1 italic">
                            "{entry.change_reason}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {(!filteredHistory || filteredHistory.length === 0) && (
          <div className="p-8 text-center text-warm-500">
            <Activity className="h-8 w-8 mx-auto mb-2 text-warm-300" />
            <p>No activity yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

### History Button (Add to Any Record)

```tsx
// app/src/components/history/history-button.tsx

'use client'

import { useState } from 'react'
import { History } from 'lucide-react'
import { HistoryPanel } from './history-panel'

interface HistoryButtonProps {
  tableName: string
  recordId: string
  className?: string
}

export function HistoryButton({ tableName, recordId, className }: HistoryButtonProps) {
  const [showHistory, setShowHistory] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setShowHistory(!showHistory)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 hover:text-warm-800 hover:bg-warm-100 rounded-lg transition-colors',
          showHistory && 'bg-warm-100',
          className
        )}
      >
        <History className="h-4 w-4" />
        <span>History</span>
      </button>

      {showHistory && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowHistory(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 z-50 shadow-lg">
            <HistoryPanel tableName={tableName} recordId={recordId} />
          </div>
        </>
      )}
    </div>
  )
}
```

---

## Integration Points

### Where History Appears

| Location | Component | Data |
|----------|-----------|------|
| Every record detail view | `<HistoryButton>` | Record-specific history |
| Job dashboard sidebar | `<ActivityFeed>` | All job activity |
| Company dashboard | `<ActivityFeed>` | Company-wide activity |
| User profile | `<ActivityFeed>` | User's activity |
| Admin panel | Full history search | All history |

### Adding History to Existing Pages

```tsx
// Example: Adding to Invoice Detail

import { HistoryButton } from '@/components/history/history-button'

function InvoiceDetail({ invoice }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1>Invoice #{invoice.number}</h1>

        {/* Add history button */}
        <HistoryButton tableName="invoices" recordId={invoice.id} />
      </div>

      {/* Rest of invoice detail */}
    </div>
  )
}
```

---

## Retention & Cleanup

```sql
-- Archive old history (after 2 years)
CREATE OR REPLACE FUNCTION archive_old_history()
RETURNS void AS $$
BEGIN
  -- Move to archive table
  INSERT INTO record_history_archive
  SELECT * FROM record_history
  WHERE created_at < NOW() - INTERVAL '2 years';

  -- Delete from main table
  DELETE FROM record_history
  WHERE created_at < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- Run monthly via pg_cron
SELECT cron.schedule('archive-history', '0 3 1 * *', 'SELECT archive_old_history()');

-- Retention policy per table type
CREATE TABLE history_retention_policies (
  table_name TEXT PRIMARY KEY,
  retention_days INTEGER DEFAULT 730, -- 2 years default
  archive BOOLEAN DEFAULT true
);

INSERT INTO history_retention_policies VALUES
  ('daily_logs', 1825, true),      -- 5 years
  ('invoices', 2555, true),        -- 7 years (tax)
  ('change_orders', 2555, true),   -- 7 years
  ('photos', 365, false),          -- 1 year, no archive
  ('communications', 365, false);  -- 1 year, no archive
```

---

## Summary

### What Gets Tracked

| Entity | Tracked Fields | History Depth |
|--------|---------------|---------------|
| Jobs | All fields | Forever |
| Daily Logs | All fields | 5 years |
| Invoices | All fields | 7 years |
| Change Orders | All fields | 7 years |
| Budget Lines | All fields | 7 years |
| Schedule Tasks | All fields | 2 years |
| Selections | Status, approval | 2 years |
| Communications | All fields | 1 year |
| Photos | Metadata only | 1 year |
| All other tables | All fields | 2 years |

### Performance Considerations

- **Partitioned by month** for fast queries
- **Indexed** on company, table, record, job, user
- **Compressed** old partitions
- **Async triggers** option for high-volume tables

### Implementation Order

1. Create `record_history` table
2. Add triggers to all tables
3. Build `<HistoryPanel>` component
4. Build `<ActivityFeed>` component
5. Add `<HistoryButton>` to all detail views
6. Add activity feed to job dashboard
7. Build admin history search

---

*History Tracking System v1.0 - Comprehensive audit trail for all records*
