/**
 * Module 42: Data Migration Types
 */

// -- Enums ────────────────────────────────────────────────────────────────────

export type SourcePlatform =
  | 'buildertrend'
  | 'coconstruct'
  | 'procore'
  | 'quickbooks'
  | 'excel'
  | 'csv'
  | 'sage'
  | 'xero'
  | 'other'

export type MigrationStatus =
  | 'draft'
  | 'mapping'
  | 'validating'
  | 'ready'
  | 'running'
  | 'completed'
  | 'failed'
  | 'rolled_back'

export type TransformType =
  | 'direct'
  | 'lookup'
  | 'formula'
  | 'default'
  | 'concatenate'
  | 'split'
  | 'date_format'
  | 'currency'
  | 'skip'

export type ValidationType =
  | 'schema'
  | 'data_type'
  | 'required_field'
  | 'uniqueness'
  | 'referential'
  | 'business_rule'
  | 'format'

export type ValidationSeverity = 'error' | 'warning' | 'info'

export type ReconciliationStatus =
  | 'pending'
  | 'reconciling'
  | 'reconciled'
  | 'discrepant'

export type MigrationEntityType =
  | 'vendor'
  | 'client'
  | 'job'
  | 'invoice'
  | 'cost_code'
  | 'employee'

// -- Interfaces ───────────────────────────────────────────────────────────────

export interface MigrationJob {
  id: string
  company_id: string
  name: string
  description: string | null
  source_platform: SourcePlatform
  status: MigrationStatus
  source_file_url: string | null
  source_file_name: string | null
  total_records: number
  processed_records: number
  failed_records: number
  skipped_records: number
  error_log: unknown[]
  started_at: string | null
  completed_at: string | null
  rolled_back_at: string | null
  rolled_back_by: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface MigrationFieldMapping {
  id: string
  company_id: string
  job_id: string
  source_field: string
  target_table: string
  target_field: string
  transform_type: TransformType
  transform_config: Record<string, unknown>
  is_required: boolean
  default_value: string | null
  sample_source_value: string | null
  sample_target_value: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface MigrationMappingTemplate {
  id: string
  company_id: string
  name: string
  description: string | null
  source_platform: SourcePlatform
  mappings: unknown[]
  is_system: boolean
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface MigrationValidationResult {
  id: string
  company_id: string
  job_id: string
  validation_type: ValidationType
  severity: ValidationSeverity
  field_name: string | null
  record_index: number | null
  source_value: string | null
  message: string
  is_resolved: boolean
  resolved_at: string | null
  resolved_by: string | null
  created_at: string
}

export interface MigrationReconciliation {
  id: string
  company_id: string
  job_id: string
  entity_type: string
  source_count: number
  imported_count: number
  matched_count: number
  unmatched_count: number
  discrepancies: unknown[]
  status: ReconciliationStatus
  reconciled_at: string | null
  reconciled_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// -- Constants ────────────────────────────────────────────────────────────────

export const SOURCE_PLATFORMS: { value: SourcePlatform; label: string }[] = [
  { value: 'buildertrend', label: 'Buildertrend' },
  { value: 'coconstruct', label: 'CoConstruct' },
  { value: 'procore', label: 'Procore' },
  { value: 'quickbooks', label: 'QuickBooks' },
  { value: 'excel', label: 'Excel' },
  { value: 'csv', label: 'CSV' },
  { value: 'sage', label: 'Sage' },
  { value: 'xero', label: 'Xero' },
  { value: 'other', label: 'Other' },
]

export const MIGRATION_STATUSES: { value: MigrationStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'mapping', label: 'Mapping' },
  { value: 'validating', label: 'Validating' },
  { value: 'ready', label: 'Ready' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'rolled_back', label: 'Rolled Back' },
]

export const TRANSFORM_TYPES: { value: TransformType; label: string }[] = [
  { value: 'direct', label: 'Direct Copy' },
  { value: 'lookup', label: 'Lookup Table' },
  { value: 'formula', label: 'Formula' },
  { value: 'default', label: 'Default Value' },
  { value: 'concatenate', label: 'Concatenate' },
  { value: 'split', label: 'Split' },
  { value: 'date_format', label: 'Date Format' },
  { value: 'currency', label: 'Currency Conversion' },
  { value: 'skip', label: 'Skip' },
]

export const VALIDATION_TYPES: { value: ValidationType; label: string }[] = [
  { value: 'schema', label: 'Schema' },
  { value: 'data_type', label: 'Data Type' },
  { value: 'required_field', label: 'Required Field' },
  { value: 'uniqueness', label: 'Uniqueness' },
  { value: 'referential', label: 'Referential Integrity' },
  { value: 'business_rule', label: 'Business Rule' },
  { value: 'format', label: 'Format' },
]

export const VALIDATION_SEVERITIES: { value: ValidationSeverity; label: string }[] = [
  { value: 'error', label: 'Error' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
]

export const RECONCILIATION_STATUSES: { value: ReconciliationStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'reconciling', label: 'Reconciling' },
  { value: 'reconciled', label: 'Reconciled' },
  { value: 'discrepant', label: 'Discrepant' },
]

export const MIGRATION_ENTITY_TYPES: { value: MigrationEntityType; label: string }[] = [
  { value: 'vendor', label: 'Vendor' },
  { value: 'client', label: 'Client' },
  { value: 'job', label: 'Job' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'cost_code', label: 'Cost Code' },
  { value: 'employee', label: 'Employee' },
]
