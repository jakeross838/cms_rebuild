/**
 * Module 16: QuickBooks & Accounting Integration Types
 */

// ── Status & Enum Unions ────────────────────────────────────────────────────

export type AccountingProvider = 'quickbooks_online' | 'xero' | 'sage'

export type ConnectionStatus = 'disconnected' | 'connected' | 'syncing' | 'error'

export type SyncDirection = 'push' | 'pull' | 'bidirectional'

export type SyncEntityType = 'vendor' | 'client' | 'account' | 'bill' | 'invoice' | 'payment'

export type SyncStatus = 'synced' | 'pending' | 'error' | 'conflict'

export type SyncLogStatus = 'started' | 'completed' | 'partial' | 'failed'

export type SyncLogType = 'full' | 'incremental' | 'manual'

export type SyncLogDirection = 'push' | 'pull'

export type ConflictResolution = 'pending' | 'use_internal' | 'use_external' | 'manual' | 'skipped'

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface AccountingConnection {
  id: string
  company_id: string
  provider: AccountingProvider
  status: ConnectionStatus
  access_token_encrypted: string | null
  refresh_token_encrypted: string | null
  token_expires_at: string | null
  external_company_id: string | null
  external_company_name: string | null
  last_sync_at: string | null
  sync_direction: SyncDirection
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface SyncMapping {
  id: string
  company_id: string
  connection_id: string
  entity_type: SyncEntityType
  internal_id: string
  external_id: string
  external_name: string | null
  last_synced_at: string | null
  sync_status: SyncStatus
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface SyncLog {
  id: string
  company_id: string
  connection_id: string
  sync_type: SyncLogType
  direction: SyncLogDirection
  status: SyncLogStatus
  entities_processed: number
  entities_created: number
  entities_updated: number
  entities_failed: number
  error_details: Record<string, unknown> | null
  started_at: string
  completed_at: string | null
  created_at: string
}

export interface SyncConflict {
  id: string
  company_id: string
  connection_id: string
  entity_type: string
  internal_id: string
  external_id: string
  internal_data: Record<string, unknown>
  external_data: Record<string, unknown>
  field_conflicts: Record<string, unknown>[]
  resolution: ConflictResolution
  resolved_by: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

// ── Constants ───────────────────────────────────────────────────────────────

export const ACCOUNTING_PROVIDERS: { value: AccountingProvider; label: string }[] = [
  { value: 'quickbooks_online', label: 'QuickBooks Online' },
  { value: 'xero', label: 'Xero' },
  { value: 'sage', label: 'Sage' },
]

export const CONNECTION_STATUSES: { value: ConnectionStatus; label: string }[] = [
  { value: 'disconnected', label: 'Disconnected' },
  { value: 'connected', label: 'Connected' },
  { value: 'syncing', label: 'Syncing' },
  { value: 'error', label: 'Error' },
]

export const SYNC_DIRECTIONS: { value: SyncDirection; label: string }[] = [
  { value: 'push', label: 'Push (Platform to External)' },
  { value: 'pull', label: 'Pull (External to Platform)' },
  { value: 'bidirectional', label: 'Bidirectional' },
]

export const SYNC_ENTITY_TYPES: { value: SyncEntityType; label: string }[] = [
  { value: 'vendor', label: 'Vendor' },
  { value: 'client', label: 'Client' },
  { value: 'account', label: 'Account' },
  { value: 'bill', label: 'Bill' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'payment', label: 'Payment' },
]

export const SYNC_STATUSES: { value: SyncStatus; label: string }[] = [
  { value: 'synced', label: 'Synced' },
  { value: 'pending', label: 'Pending' },
  { value: 'error', label: 'Error' },
  { value: 'conflict', label: 'Conflict' },
]

export const SYNC_LOG_STATUSES: { value: SyncLogStatus; label: string }[] = [
  { value: 'started', label: 'Started' },
  { value: 'completed', label: 'Completed' },
  { value: 'partial', label: 'Partial' },
  { value: 'failed', label: 'Failed' },
]

export const SYNC_LOG_TYPES: { value: SyncLogType; label: string }[] = [
  { value: 'full', label: 'Full Sync' },
  { value: 'incremental', label: 'Incremental' },
  { value: 'manual', label: 'Manual' },
]

export const SYNC_LOG_DIRECTIONS: { value: SyncLogDirection; label: string }[] = [
  { value: 'push', label: 'Push' },
  { value: 'pull', label: 'Pull' },
]

export const CONFLICT_RESOLUTIONS: { value: ConflictResolution; label: string }[] = [
  { value: 'pending', label: 'Pending Review' },
  { value: 'use_internal', label: 'Use Platform Value' },
  { value: 'use_external', label: 'Use External Value' },
  { value: 'manual', label: 'Manual Resolution' },
  { value: 'skipped', label: 'Skipped' },
]
