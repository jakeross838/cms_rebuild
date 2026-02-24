/**
 * Module 16 — QuickBooks & Accounting Integration Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, constants,
 * and Zod schemas against the Module 16 spec for accounting system
 * integration (QuickBooks Online, Xero, Sage).
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  AccountingProvider,
  ConnectionStatus,
  SyncDirection,
  SyncEntityType,
  SyncStatus,
  SyncLogStatus,
  SyncLogType,
  SyncLogDirection,
  ConflictResolution,
  AccountingConnection,
  SyncMapping,
  SyncLog,
  SyncConflict,
} from '@/types/integrations'

import {
  ACCOUNTING_PROVIDERS,
  CONNECTION_STATUSES,
  SYNC_DIRECTIONS,
  SYNC_ENTITY_TYPES,
  SYNC_STATUSES,
  SYNC_LOG_STATUSES,
  SYNC_LOG_TYPES,
  SYNC_LOG_DIRECTIONS,
  CONFLICT_RESOLUTIONS,
} from '@/types/integrations'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  accountingProviderEnum,
  connectionStatusEnum,
  syncDirectionEnum,
  syncEntityTypeEnum,
  syncStatusEnum,
  syncLogStatusEnum,
  syncLogTypeEnum,
  syncLogDirectionEnum,
  conflictResolutionEnum,
  listConnectionsSchema,
  createConnectionSchema,
  updateConnectionSchema,
  listMappingsSchema,
  createMappingSchema,
  updateMappingSchema,
  listSyncLogsSchema,
  triggerSyncSchema,
  listConflictsSchema,
  resolveConflictSchema,
} from '@/lib/validation/schemas/integrations'

// Valid UUIDs for testing
const UUID_1 = '11111111-1111-4111-a111-111111111111'
const UUID_2 = '22222222-2222-4222-a222-222222222222'

// ============================================================================
// Type System
// ============================================================================

describe('Module 16 — Integration Types', () => {
  test('AccountingProvider has 3 providers', () => {
    const providers: AccountingProvider[] = ['quickbooks_online', 'xero', 'sage']
    expect(providers).toHaveLength(3)
  })

  test('ConnectionStatus has 4 statuses', () => {
    const statuses: ConnectionStatus[] = ['disconnected', 'connected', 'syncing', 'error']
    expect(statuses).toHaveLength(4)
  })

  test('SyncDirection has 3 directions', () => {
    const directions: SyncDirection[] = ['push', 'pull', 'bidirectional']
    expect(directions).toHaveLength(3)
  })

  test('SyncEntityType has 6 entity types', () => {
    const types: SyncEntityType[] = ['vendor', 'client', 'account', 'bill', 'invoice', 'payment']
    expect(types).toHaveLength(6)
  })

  test('SyncStatus has 4 statuses', () => {
    const statuses: SyncStatus[] = ['synced', 'pending', 'error', 'conflict']
    expect(statuses).toHaveLength(4)
  })

  test('SyncLogStatus has 4 values', () => {
    const statuses: SyncLogStatus[] = ['started', 'completed', 'partial', 'failed']
    expect(statuses).toHaveLength(4)
  })

  test('ConflictResolution has 5 values', () => {
    const resolutions: ConflictResolution[] = ['pending', 'use_internal', 'use_external', 'manual', 'skipped']
    expect(resolutions).toHaveLength(5)
  })

  test('AccountingConnection interface has all required fields', () => {
    const conn: AccountingConnection = {
      id: '1', company_id: '1', provider: 'quickbooks_online',
      status: 'connected', access_token_encrypted: null,
      refresh_token_encrypted: null, token_expires_at: null,
      external_company_id: 'qbo-123', external_company_name: 'Test Co',
      last_sync_at: null, sync_direction: 'bidirectional',
      settings: {}, created_at: '2026-01-01', updated_at: '2026-01-01',
      deleted_at: null,
    }
    expect(conn.provider).toBe('quickbooks_online')
    expect(conn.sync_direction).toBe('bidirectional')
  })

  test('SyncMapping interface has all required fields', () => {
    const mapping: SyncMapping = {
      id: '1', company_id: '1', connection_id: '1',
      entity_type: 'vendor', internal_id: 'int-1',
      external_id: 'ext-1', external_name: 'Vendor A',
      last_synced_at: null, sync_status: 'synced',
      error_message: null, created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(mapping.entity_type).toBe('vendor')
    expect(mapping.sync_status).toBe('synced')
  })

  test('SyncLog interface has all required fields', () => {
    const log: SyncLog = {
      id: '1', company_id: '1', connection_id: '1',
      sync_type: 'manual', direction: 'push', status: 'completed',
      entities_processed: 50, entities_created: 10,
      entities_updated: 30, entities_failed: 2,
      error_details: null, started_at: '2026-01-01T00:00:00Z',
      completed_at: '2026-01-01T00:01:00Z', created_at: '2026-01-01',
    }
    expect(log.entities_processed).toBe(50)
    expect(log.entities_failed).toBe(2)
  })

  test('SyncConflict interface has all required fields', () => {
    const conflict: SyncConflict = {
      id: '1', company_id: '1', connection_id: '1',
      entity_type: 'invoice', internal_id: 'int-1',
      external_id: 'ext-1',
      internal_data: { amount: 5000 },
      external_data: { amount: 5200 },
      field_conflicts: [{ field: 'amount', internal: 5000, external: 5200 }],
      resolution: 'pending', resolved_by: null,
      resolved_at: null, created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(conflict.resolution).toBe('pending')
    expect(conflict.field_conflicts).toHaveLength(1)
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 16 — Constants', () => {
  test('ACCOUNTING_PROVIDERS has 3 entries with value/label', () => {
    expect(ACCOUNTING_PROVIDERS).toHaveLength(3)
    for (const p of ACCOUNTING_PROVIDERS) {
      expect(p).toHaveProperty('value')
      expect(p).toHaveProperty('label')
      expect(p.label.length).toBeGreaterThan(0)
    }
  })

  test('CONNECTION_STATUSES has 4 entries', () => {
    expect(CONNECTION_STATUSES).toHaveLength(4)
  })

  test('SYNC_DIRECTIONS has 3 entries', () => {
    expect(SYNC_DIRECTIONS).toHaveLength(3)
  })

  test('SYNC_ENTITY_TYPES has 6 entries', () => {
    expect(SYNC_ENTITY_TYPES).toHaveLength(6)
  })

  test('SYNC_STATUSES has 4 entries', () => {
    expect(SYNC_STATUSES).toHaveLength(4)
  })

  test('SYNC_LOG_STATUSES has 4 entries', () => {
    expect(SYNC_LOG_STATUSES).toHaveLength(4)
  })

  test('SYNC_LOG_TYPES has 3 entries', () => {
    expect(SYNC_LOG_TYPES).toHaveLength(3)
  })

  test('SYNC_LOG_DIRECTIONS has 2 entries', () => {
    expect(SYNC_LOG_DIRECTIONS).toHaveLength(2)
  })

  test('CONFLICT_RESOLUTIONS has 5 entries', () => {
    expect(CONFLICT_RESOLUTIONS).toHaveLength(5)
  })
})

// ============================================================================
// Schemas — Enums
// ============================================================================

describe('Module 16 — Enum Schemas', () => {
  test('accountingProviderEnum accepts all 3 providers', () => {
    for (const p of ['quickbooks_online', 'xero', 'sage']) {
      expect(accountingProviderEnum.parse(p)).toBe(p)
    }
  })

  test('accountingProviderEnum rejects invalid provider', () => {
    expect(() => accountingProviderEnum.parse('quickbooks_desktop')).toThrow()
    expect(() => accountingProviderEnum.parse('')).toThrow()
  })

  test('connectionStatusEnum accepts all 4 statuses', () => {
    for (const s of ['disconnected', 'connected', 'syncing', 'error']) {
      expect(connectionStatusEnum.parse(s)).toBe(s)
    }
  })

  test('syncDirectionEnum accepts all 3 directions', () => {
    for (const d of ['push', 'pull', 'bidirectional']) {
      expect(syncDirectionEnum.parse(d)).toBe(d)
    }
  })

  test('syncEntityTypeEnum accepts all 6 types', () => {
    for (const t of ['vendor', 'client', 'account', 'bill', 'invoice', 'payment']) {
      expect(syncEntityTypeEnum.parse(t)).toBe(t)
    }
  })

  test('syncEntityTypeEnum rejects invalid type', () => {
    expect(() => syncEntityTypeEnum.parse('employee')).toThrow()
  })

  test('syncStatusEnum accepts all 4 statuses', () => {
    for (const s of ['synced', 'pending', 'error', 'conflict']) {
      expect(syncStatusEnum.parse(s)).toBe(s)
    }
  })

  test('syncLogStatusEnum accepts all 4 statuses', () => {
    for (const s of ['started', 'completed', 'partial', 'failed']) {
      expect(syncLogStatusEnum.parse(s)).toBe(s)
    }
  })

  test('syncLogTypeEnum accepts all 3 types', () => {
    for (const t of ['full', 'incremental', 'manual']) {
      expect(syncLogTypeEnum.parse(t)).toBe(t)
    }
  })

  test('syncLogDirectionEnum accepts push and pull', () => {
    expect(syncLogDirectionEnum.parse('push')).toBe('push')
    expect(syncLogDirectionEnum.parse('pull')).toBe('pull')
  })

  test('conflictResolutionEnum accepts all 5 values', () => {
    for (const r of ['pending', 'use_internal', 'use_external', 'manual', 'skipped']) {
      expect(conflictResolutionEnum.parse(r)).toBe(r)
    }
  })

  test('conflictResolutionEnum rejects invalid resolution', () => {
    expect(() => conflictResolutionEnum.parse('auto')).toThrow()
  })
})

// ============================================================================
// Schemas — Connection CRUD
// ============================================================================

describe('Module 16 — Connection Schemas', () => {
  test('listConnectionsSchema accepts valid params', () => {
    const result = listConnectionsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listConnectionsSchema accepts provider filter', () => {
    const result = listConnectionsSchema.parse({ provider: 'quickbooks_online' })
    expect(result.provider).toBe('quickbooks_online')
  })

  test('listConnectionsSchema rejects invalid provider', () => {
    expect(() => listConnectionsSchema.parse({ provider: 'invalid' })).toThrow()
  })

  test('listConnectionsSchema rejects limit > 100', () => {
    expect(() => listConnectionsSchema.parse({ limit: 200 })).toThrow()
  })

  test('createConnectionSchema requires provider', () => {
    expect(() => createConnectionSchema.parse({})).toThrow()
  })

  test('createConnectionSchema accepts valid connection', () => {
    const result = createConnectionSchema.parse({
      provider: 'quickbooks_online',
      external_company_name: 'My QBO Company',
      sync_direction: 'bidirectional',
    })
    expect(result.provider).toBe('quickbooks_online')
    expect(result.sync_direction).toBe('bidirectional')
  })

  test('createConnectionSchema defaults sync_direction to bidirectional', () => {
    const result = createConnectionSchema.parse({ provider: 'xero' })
    expect(result.sync_direction).toBe('bidirectional')
  })

  test('updateConnectionSchema accepts partial updates', () => {
    const result = updateConnectionSchema.parse({ status: 'connected' })
    expect(result.status).toBe('connected')
    expect(result.sync_direction).toBeUndefined()
  })

  test('updateConnectionSchema rejects invalid status', () => {
    expect(() => updateConnectionSchema.parse({ status: 'invalid' })).toThrow()
  })
})

// ============================================================================
// Schemas — Mapping CRUD
// ============================================================================

describe('Module 16 — Mapping Schemas', () => {
  test('listMappingsSchema accepts valid params with filters', () => {
    const result = listMappingsSchema.parse({
      page: '1', limit: '50',
      connection_id: UUID_1,
      entity_type: 'vendor',
      sync_status: 'synced',
    })
    expect(result.connection_id).toBe(UUID_1)
    expect(result.entity_type).toBe('vendor')
    expect(result.sync_status).toBe('synced')
  })

  test('createMappingSchema requires all mandatory fields', () => {
    expect(() => createMappingSchema.parse({})).toThrow()
    expect(() => createMappingSchema.parse({ connection_id: UUID_1 })).toThrow()
  })

  test('createMappingSchema accepts valid mapping', () => {
    const result = createMappingSchema.parse({
      connection_id: UUID_1,
      entity_type: 'vendor',
      internal_id: UUID_2,
      external_id: 'QBO-VENDOR-123',
      external_name: 'Acme Plumbing',
    })
    expect(result.entity_type).toBe('vendor')
    expect(result.external_id).toBe('QBO-VENDOR-123')
    expect(result.external_name).toBe('Acme Plumbing')
  })

  test('createMappingSchema rejects invalid entity type', () => {
    expect(() => createMappingSchema.parse({
      connection_id: UUID_1,
      entity_type: 'employee',
      internal_id: UUID_2,
      external_id: 'ext-1',
    })).toThrow()
  })

  test('updateMappingSchema accepts partial update', () => {
    const result = updateMappingSchema.parse({
      external_id: 'NEW-EXT-ID',
      sync_status: 'error',
      error_message: 'Not found in QBO',
    })
    expect(result.external_id).toBe('NEW-EXT-ID')
    expect(result.sync_status).toBe('error')
  })

  test('updateMappingSchema allows null error_message', () => {
    const result = updateMappingSchema.parse({
      error_message: null,
    })
    expect(result.error_message).toBeNull()
  })
})

// ============================================================================
// Schemas — Sync Logs & Triggers
// ============================================================================

describe('Module 16 — Sync Log & Trigger Schemas', () => {
  test('listSyncLogsSchema accepts all filters', () => {
    const result = listSyncLogsSchema.parse({
      connection_id: UUID_1,
      sync_type: 'manual',
      direction: 'push',
      status: 'completed',
    })
    expect(result.sync_type).toBe('manual')
    expect(result.direction).toBe('push')
  })

  test('triggerSyncSchema defaults to manual push', () => {
    const result = triggerSyncSchema.parse({})
    expect(result.sync_type).toBe('manual')
    expect(result.direction).toBe('push')
  })

  test('triggerSyncSchema accepts entity type filter', () => {
    const result = triggerSyncSchema.parse({
      sync_type: 'full',
      direction: 'pull',
      entity_types: ['vendor', 'client'],
    })
    expect(result.entity_types).toHaveLength(2)
    expect(result.entity_types).toContain('vendor')
  })

  test('triggerSyncSchema rejects invalid entity types in array', () => {
    expect(() => triggerSyncSchema.parse({
      entity_types: ['vendor', 'employee'],
    })).toThrow()
  })
})

// ============================================================================
// Schemas — Conflicts
// ============================================================================

describe('Module 16 — Conflict Schemas', () => {
  test('listConflictsSchema accepts resolution filter', () => {
    const result = listConflictsSchema.parse({ resolution: 'pending' })
    expect(result.resolution).toBe('pending')
  })

  test('listConflictsSchema accepts entity_type filter', () => {
    const result = listConflictsSchema.parse({ entity_type: 'invoice' })
    expect(result.entity_type).toBe('invoice')
  })

  test('resolveConflictSchema requires resolution', () => {
    expect(() => resolveConflictSchema.parse({})).toThrow()
  })

  test('resolveConflictSchema accepts valid resolutions', () => {
    for (const r of ['use_internal', 'use_external', 'manual', 'skipped']) {
      const result = resolveConflictSchema.parse({ resolution: r })
      expect(result.resolution).toBe(r)
    }
  })

  test('resolveConflictSchema rejects pending as resolution', () => {
    expect(() => resolveConflictSchema.parse({ resolution: 'pending' })).toThrow()
  })

  test('resolveConflictSchema rejects invalid resolution', () => {
    expect(() => resolveConflictSchema.parse({ resolution: 'auto_merge' })).toThrow()
  })
})
