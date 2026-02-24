/**
 * Module 42 — Data Migration Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 42 spec.
 */

import { describe, test, expect } from 'vitest'

// -- Types ────────────────────────────────────────────────────────────────────

import type {
  SourcePlatform,
  MigrationStatus,
  TransformType,
  ValidationType,
  ValidationSeverity,
  ReconciliationStatus,
  MigrationEntityType,
  MigrationJob,
  MigrationFieldMapping,
  MigrationMappingTemplate,
  MigrationValidationResult,
  MigrationReconciliation,
} from '@/types/data-migration'

import {
  SOURCE_PLATFORMS,
  MIGRATION_STATUSES,
  TRANSFORM_TYPES,
  VALIDATION_TYPES,
  VALIDATION_SEVERITIES,
  RECONCILIATION_STATUSES,
  MIGRATION_ENTITY_TYPES,
} from '@/types/data-migration'

// -- Schemas ──────────────────────────────────────────────────────────────────

import {
  sourcePlatformEnum,
  migrationStatusEnum,
  transformTypeEnum,
  validationTypeEnum,
  validationSeverityEnum,
  reconciliationStatusEnum,
  migrationEntityTypeEnum,
  listMigrationJobsSchema,
  createMigrationJobSchema,
  updateMigrationJobSchema,
  listFieldMappingsSchema,
  createFieldMappingSchema,
  updateFieldMappingSchema,
  listMappingTemplatesSchema,
  createMappingTemplateSchema,
  updateMappingTemplateSchema,
  listValidationResultsSchema,
  createValidationResultSchema,
  updateValidationResultSchema,
  listReconciliationSchema,
  createReconciliationSchema,
  updateReconciliationSchema,
} from '@/lib/validation/schemas/data-migration'

// ============================================================================
// Type System
// ============================================================================

describe('Module 42 — Data Migration Types', () => {
  test('SourcePlatform has 9 values', () => {
    const platforms: SourcePlatform[] = [
      'buildertrend', 'coconstruct', 'procore', 'quickbooks', 'excel', 'csv', 'sage', 'xero', 'other',
    ]
    expect(platforms).toHaveLength(9)
  })

  test('MigrationStatus has 8 values', () => {
    const statuses: MigrationStatus[] = [
      'draft', 'mapping', 'validating', 'ready', 'running', 'completed', 'failed', 'rolled_back',
    ]
    expect(statuses).toHaveLength(8)
  })

  test('TransformType has 9 values', () => {
    const types: TransformType[] = [
      'direct', 'lookup', 'formula', 'default', 'concatenate', 'split', 'date_format', 'currency', 'skip',
    ]
    expect(types).toHaveLength(9)
  })

  test('ValidationType has 7 values', () => {
    const types: ValidationType[] = [
      'schema', 'data_type', 'required_field', 'uniqueness', 'referential', 'business_rule', 'format',
    ]
    expect(types).toHaveLength(7)
  })

  test('ValidationSeverity has 3 values', () => {
    const severities: ValidationSeverity[] = ['error', 'warning', 'info']
    expect(severities).toHaveLength(3)
  })

  test('ReconciliationStatus has 4 values', () => {
    const statuses: ReconciliationStatus[] = ['pending', 'reconciling', 'reconciled', 'discrepant']
    expect(statuses).toHaveLength(4)
  })

  test('MigrationEntityType has 6 values', () => {
    const types: MigrationEntityType[] = [
      'vendor', 'client', 'job', 'invoice', 'cost_code', 'employee',
    ]
    expect(types).toHaveLength(6)
  })

  test('MigrationJob interface has all required fields', () => {
    const job: MigrationJob = {
      id: '00000000-0000-0000-0000-000000000001',
      company_id: '00000000-0000-0000-0000-000000000002',
      name: 'Test Migration',
      description: null,
      source_platform: 'buildertrend',
      status: 'draft',
      source_file_url: null,
      source_file_name: null,
      total_records: 0,
      processed_records: 0,
      failed_records: 0,
      skipped_records: 0,
      error_log: [],
      started_at: null,
      completed_at: null,
      rolled_back_at: null,
      rolled_back_by: null,
      created_by: null,
      created_at: '2026-02-20T00:00:00Z',
      updated_at: '2026-02-20T00:00:00Z',
      deleted_at: null,
    }
    expect(job.id).toBeDefined()
    expect(job.company_id).toBeDefined()
    expect(job.name).toBe('Test Migration')
  })

  test('MigrationFieldMapping interface has all required fields', () => {
    const mapping: MigrationFieldMapping = {
      id: '00000000-0000-0000-0000-000000000001',
      company_id: '00000000-0000-0000-0000-000000000002',
      job_id: '00000000-0000-0000-0000-000000000003',
      source_field: 'vendor_name',
      target_table: 'vendors',
      target_field: 'name',
      transform_type: 'direct',
      transform_config: {},
      is_required: true,
      default_value: null,
      sample_source_value: null,
      sample_target_value: null,
      sort_order: 0,
      created_at: '2026-02-20T00:00:00Z',
      updated_at: '2026-02-20T00:00:00Z',
    }
    expect(mapping.source_field).toBe('vendor_name')
    expect(mapping.target_table).toBe('vendors')
  })

  test('MigrationMappingTemplate interface has all required fields', () => {
    const template: MigrationMappingTemplate = {
      id: '00000000-0000-0000-0000-000000000001',
      company_id: '00000000-0000-0000-0000-000000000002',
      name: 'Buildertrend Standard',
      description: null,
      source_platform: 'buildertrend',
      mappings: [],
      is_system: false,
      is_active: true,
      created_by: null,
      created_at: '2026-02-20T00:00:00Z',
      updated_at: '2026-02-20T00:00:00Z',
    }
    expect(template.name).toBe('Buildertrend Standard')
    expect(template.is_active).toBe(true)
  })

  test('MigrationValidationResult interface has all required fields', () => {
    const result: MigrationValidationResult = {
      id: '00000000-0000-0000-0000-000000000001',
      company_id: '00000000-0000-0000-0000-000000000002',
      job_id: '00000000-0000-0000-0000-000000000003',
      validation_type: 'schema',
      severity: 'warning',
      field_name: null,
      record_index: null,
      source_value: null,
      message: 'Test validation',
      is_resolved: false,
      resolved_at: null,
      resolved_by: null,
      created_at: '2026-02-20T00:00:00Z',
    }
    expect(result.message).toBe('Test validation')
    expect(result.is_resolved).toBe(false)
  })

  test('MigrationReconciliation interface has all required fields', () => {
    const rec: MigrationReconciliation = {
      id: '00000000-0000-0000-0000-000000000001',
      company_id: '00000000-0000-0000-0000-000000000002',
      job_id: '00000000-0000-0000-0000-000000000003',
      entity_type: 'vendor',
      source_count: 100,
      imported_count: 95,
      matched_count: 90,
      unmatched_count: 5,
      discrepancies: [],
      status: 'reconciled',
      reconciled_at: '2026-02-20T00:00:00Z',
      reconciled_by: null,
      notes: null,
      created_at: '2026-02-20T00:00:00Z',
      updated_at: '2026-02-20T00:00:00Z',
    }
    expect(rec.source_count).toBe(100)
    expect(rec.status).toBe('reconciled')
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 42 — Data Migration Constants', () => {
  test('SOURCE_PLATFORMS has 9 entries with value and label', () => {
    expect(SOURCE_PLATFORMS).toHaveLength(9)
    SOURCE_PLATFORMS.forEach((p) => {
      expect(p).toHaveProperty('value')
      expect(p).toHaveProperty('label')
    })
  })

  test('SOURCE_PLATFORMS includes all expected values', () => {
    const values = SOURCE_PLATFORMS.map((p) => p.value)
    expect(values).toContain('buildertrend')
    expect(values).toContain('coconstruct')
    expect(values).toContain('procore')
    expect(values).toContain('quickbooks')
    expect(values).toContain('excel')
    expect(values).toContain('csv')
    expect(values).toContain('sage')
    expect(values).toContain('xero')
    expect(values).toContain('other')
  })

  test('MIGRATION_STATUSES has 8 entries with value and label', () => {
    expect(MIGRATION_STATUSES).toHaveLength(8)
    MIGRATION_STATUSES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  test('MIGRATION_STATUSES includes all expected values', () => {
    const values = MIGRATION_STATUSES.map((s) => s.value)
    expect(values).toContain('draft')
    expect(values).toContain('mapping')
    expect(values).toContain('validating')
    expect(values).toContain('ready')
    expect(values).toContain('running')
    expect(values).toContain('completed')
    expect(values).toContain('failed')
    expect(values).toContain('rolled_back')
  })

  test('TRANSFORM_TYPES has 9 entries with value and label', () => {
    expect(TRANSFORM_TYPES).toHaveLength(9)
    TRANSFORM_TYPES.forEach((t) => {
      expect(t).toHaveProperty('value')
      expect(t).toHaveProperty('label')
    })
  })

  test('VALIDATION_TYPES has 7 entries with value and label', () => {
    expect(VALIDATION_TYPES).toHaveLength(7)
    VALIDATION_TYPES.forEach((t) => {
      expect(t).toHaveProperty('value')
      expect(t).toHaveProperty('label')
    })
  })

  test('VALIDATION_SEVERITIES has 3 entries with value and label', () => {
    expect(VALIDATION_SEVERITIES).toHaveLength(3)
    VALIDATION_SEVERITIES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  test('RECONCILIATION_STATUSES has 4 entries with value and label', () => {
    expect(RECONCILIATION_STATUSES).toHaveLength(4)
    RECONCILIATION_STATUSES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  test('MIGRATION_ENTITY_TYPES has 6 entries with value and label', () => {
    expect(MIGRATION_ENTITY_TYPES).toHaveLength(6)
    MIGRATION_ENTITY_TYPES.forEach((t) => {
      expect(t).toHaveProperty('value')
      expect(t).toHaveProperty('label')
    })
  })

  test('MIGRATION_ENTITY_TYPES includes all expected values', () => {
    const values = MIGRATION_ENTITY_TYPES.map((t) => t.value)
    expect(values).toContain('vendor')
    expect(values).toContain('client')
    expect(values).toContain('job')
    expect(values).toContain('invoice')
    expect(values).toContain('cost_code')
    expect(values).toContain('employee')
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 42 — Data Migration Enum Schemas', () => {
  test('sourcePlatformEnum accepts all 9 platforms', () => {
    const platforms = ['buildertrend', 'coconstruct', 'procore', 'quickbooks', 'excel', 'csv', 'sage', 'xero', 'other']
    platforms.forEach((p) => {
      expect(sourcePlatformEnum.parse(p)).toBe(p)
    })
  })

  test('sourcePlatformEnum rejects invalid platform', () => {
    expect(() => sourcePlatformEnum.parse('invalid')).toThrow()
  })

  test('migrationStatusEnum accepts all 8 statuses', () => {
    const statuses = ['draft', 'mapping', 'validating', 'ready', 'running', 'completed', 'failed', 'rolled_back']
    statuses.forEach((s) => {
      expect(migrationStatusEnum.parse(s)).toBe(s)
    })
  })

  test('migrationStatusEnum rejects invalid status', () => {
    expect(() => migrationStatusEnum.parse('invalid')).toThrow()
  })

  test('transformTypeEnum accepts all 9 types', () => {
    const types = ['direct', 'lookup', 'formula', 'default', 'concatenate', 'split', 'date_format', 'currency', 'skip']
    types.forEach((t) => {
      expect(transformTypeEnum.parse(t)).toBe(t)
    })
  })

  test('transformTypeEnum rejects invalid type', () => {
    expect(() => transformTypeEnum.parse('invalid')).toThrow()
  })

  test('validationTypeEnum accepts all 7 types', () => {
    const types = ['schema', 'data_type', 'required_field', 'uniqueness', 'referential', 'business_rule', 'format']
    types.forEach((t) => {
      expect(validationTypeEnum.parse(t)).toBe(t)
    })
  })

  test('validationTypeEnum rejects invalid type', () => {
    expect(() => validationTypeEnum.parse('invalid')).toThrow()
  })

  test('validationSeverityEnum accepts all 3 severities', () => {
    const severities = ['error', 'warning', 'info']
    severities.forEach((s) => {
      expect(validationSeverityEnum.parse(s)).toBe(s)
    })
  })

  test('validationSeverityEnum rejects invalid severity', () => {
    expect(() => validationSeverityEnum.parse('invalid')).toThrow()
  })

  test('reconciliationStatusEnum accepts all 4 statuses', () => {
    const statuses = ['pending', 'reconciling', 'reconciled', 'discrepant']
    statuses.forEach((s) => {
      expect(reconciliationStatusEnum.parse(s)).toBe(s)
    })
  })

  test('reconciliationStatusEnum rejects invalid status', () => {
    expect(() => reconciliationStatusEnum.parse('invalid')).toThrow()
  })

  test('migrationEntityTypeEnum accepts all 6 types', () => {
    const types = ['vendor', 'client', 'job', 'invoice', 'cost_code', 'employee']
    types.forEach((t) => {
      expect(migrationEntityTypeEnum.parse(t)).toBe(t)
    })
  })

  test('migrationEntityTypeEnum rejects invalid type', () => {
    expect(() => migrationEntityTypeEnum.parse('invalid')).toThrow()
  })
})

// ============================================================================
// Migration Job Schemas
// ============================================================================

describe('Module 42 — Migration Job Schemas', () => {
  test('listMigrationJobsSchema accepts valid params', () => {
    const result = listMigrationJobsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listMigrationJobsSchema rejects limit > 100', () => {
    expect(() => listMigrationJobsSchema.parse({ limit: 101 })).toThrow()
  })

  test('listMigrationJobsSchema accepts all filters', () => {
    const result = listMigrationJobsSchema.parse({
      page: '2',
      limit: '50',
      status: 'running',
      source_platform: 'buildertrend',
      q: 'test',
    })
    expect(result.page).toBe(2)
    expect(result.limit).toBe(50)
    expect(result.status).toBe('running')
    expect(result.source_platform).toBe('buildertrend')
    expect(result.q).toBe('test')
  })

  test('createMigrationJobSchema accepts valid job', () => {
    const result = createMigrationJobSchema.parse({ name: 'Test Migration' })
    expect(result.name).toBe('Test Migration')
    expect(result.source_platform).toBe('other')
    expect(result.status).toBe('draft')
    expect(result.total_records).toBe(0)
  })

  test('createMigrationJobSchema requires name', () => {
    expect(() => createMigrationJobSchema.parse({})).toThrow()
  })

  test('createMigrationJobSchema rejects name > 255 chars', () => {
    expect(() => createMigrationJobSchema.parse({ name: 'a'.repeat(256) })).toThrow()
  })

  test('createMigrationJobSchema accepts full job with all optional fields', () => {
    const result = createMigrationJobSchema.parse({
      name: 'Full Migration',
      description: 'Full description',
      source_platform: 'procore',
      status: 'mapping',
      source_file_url: 'https://example.com/file.csv',
      source_file_name: 'file.csv',
      total_records: 500,
    })
    expect(result.name).toBe('Full Migration')
    expect(result.source_platform).toBe('procore')
    expect(result.total_records).toBe(500)
  })

  test('createMigrationJobSchema rejects negative total_records', () => {
    expect(() => createMigrationJobSchema.parse({ name: 'Test', total_records: -1 })).toThrow()
  })

  test('updateMigrationJobSchema accepts partial updates', () => {
    const result = updateMigrationJobSchema.parse({ name: 'Updated Name' })
    expect(result.name).toBe('Updated Name')
  })

  test('updateMigrationJobSchema accepts status and record counts', () => {
    const result = updateMigrationJobSchema.parse({
      status: 'running',
      processed_records: 50,
      failed_records: 5,
      skipped_records: 3,
    })
    expect(result.status).toBe('running')
    expect(result.processed_records).toBe(50)
    expect(result.failed_records).toBe(5)
    expect(result.skipped_records).toBe(3)
  })

  test('updateMigrationJobSchema accepts error_log array', () => {
    const result = updateMigrationJobSchema.parse({
      error_log: [{ row: 1, error: 'bad data' }],
    })
    expect(result.error_log).toHaveLength(1)
  })
})

// ============================================================================
// Field Mapping Schemas
// ============================================================================

describe('Module 42 — Field Mapping Schemas', () => {
  test('listFieldMappingsSchema accepts valid params with defaults', () => {
    const result = listFieldMappingsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('listFieldMappingsSchema accepts filters', () => {
    const result = listFieldMappingsSchema.parse({
      target_table: 'vendors',
      transform_type: 'lookup',
    })
    expect(result.target_table).toBe('vendors')
    expect(result.transform_type).toBe('lookup')
  })

  test('createFieldMappingSchema accepts valid mapping', () => {
    const result = createFieldMappingSchema.parse({
      source_field: 'vendor_name',
      target_table: 'vendors',
      target_field: 'name',
    })
    expect(result.source_field).toBe('vendor_name')
    expect(result.transform_type).toBe('direct')
    expect(result.is_required).toBe(false)
    expect(result.sort_order).toBe(0)
  })

  test('createFieldMappingSchema requires source_field, target_table, target_field', () => {
    expect(() => createFieldMappingSchema.parse({})).toThrow()
    expect(() => createFieldMappingSchema.parse({ source_field: 'x' })).toThrow()
    expect(() => createFieldMappingSchema.parse({ source_field: 'x', target_table: 'y' })).toThrow()
  })

  test('createFieldMappingSchema rejects source_field > 200 chars', () => {
    expect(() => createFieldMappingSchema.parse({
      source_field: 'a'.repeat(201),
      target_table: 'vendors',
      target_field: 'name',
    })).toThrow()
  })

  test('createFieldMappingSchema accepts all optional fields', () => {
    const result = createFieldMappingSchema.parse({
      source_field: 'vendor_name',
      target_table: 'vendors',
      target_field: 'name',
      transform_type: 'lookup',
      transform_config: { table: 'lookup_table' },
      is_required: true,
      default_value: 'Unknown',
      sample_source_value: 'ACME Corp',
      sample_target_value: 'Acme Corporation',
      sort_order: 5,
    })
    expect(result.transform_type).toBe('lookup')
    expect(result.is_required).toBe(true)
    expect(result.default_value).toBe('Unknown')
    expect(result.sort_order).toBe(5)
  })

  test('updateFieldMappingSchema accepts partial updates', () => {
    const result = updateFieldMappingSchema.parse({ transform_type: 'formula' })
    expect(result.transform_type).toBe('formula')
  })

  test('updateFieldMappingSchema accepts is_required toggle', () => {
    const result = updateFieldMappingSchema.parse({ is_required: true })
    expect(result.is_required).toBe(true)
  })
})

// ============================================================================
// Mapping Template Schemas
// ============================================================================

describe('Module 42 — Mapping Template Schemas', () => {
  test('listMappingTemplatesSchema accepts valid params', () => {
    const result = listMappingTemplatesSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listMappingTemplatesSchema rejects limit > 100', () => {
    expect(() => listMappingTemplatesSchema.parse({ limit: 101 })).toThrow()
  })

  test('listMappingTemplatesSchema accepts all filters', () => {
    const result = listMappingTemplatesSchema.parse({
      source_platform: 'buildertrend',
      is_active: 'true',
      q: 'standard',
    })
    expect(result.source_platform).toBe('buildertrend')
    expect(result.is_active).toBe(true)
    expect(result.q).toBe('standard')
  })

  test('listMappingTemplatesSchema handles boolean preprocess for is_active', () => {
    const resultTrue = listMappingTemplatesSchema.parse({ is_active: 'true' })
    expect(resultTrue.is_active).toBe(true)
    const resultFalse = listMappingTemplatesSchema.parse({ is_active: 'false' })
    expect(resultFalse.is_active).toBe(false)
  })

  test('createMappingTemplateSchema accepts valid template', () => {
    const result = createMappingTemplateSchema.parse({
      name: 'Buildertrend Standard',
      source_platform: 'buildertrend',
    })
    expect(result.name).toBe('Buildertrend Standard')
    expect(result.source_platform).toBe('buildertrend')
    expect(result.mappings).toEqual([])
    expect(result.is_system).toBe(false)
    expect(result.is_active).toBe(true)
  })

  test('createMappingTemplateSchema requires name and source_platform', () => {
    expect(() => createMappingTemplateSchema.parse({})).toThrow()
    expect(() => createMappingTemplateSchema.parse({ name: 'Test' })).toThrow()
  })

  test('createMappingTemplateSchema rejects name > 200 chars', () => {
    expect(() => createMappingTemplateSchema.parse({
      name: 'a'.repeat(201),
      source_platform: 'buildertrend',
    })).toThrow()
  })

  test('createMappingTemplateSchema accepts all optional fields', () => {
    const result = createMappingTemplateSchema.parse({
      name: 'Full Template',
      source_platform: 'procore',
      description: 'A full template',
      mappings: [{ source: 'a', target: 'b' }],
      is_system: true,
      is_active: false,
    })
    expect(result.mappings).toHaveLength(1)
    expect(result.is_system).toBe(true)
    expect(result.is_active).toBe(false)
  })

  test('updateMappingTemplateSchema accepts partial updates', () => {
    const result = updateMappingTemplateSchema.parse({ name: 'Updated Name' })
    expect(result.name).toBe('Updated Name')
  })

  test('updateMappingTemplateSchema accepts is_active toggle', () => {
    const result = updateMappingTemplateSchema.parse({ is_active: false })
    expect(result.is_active).toBe(false)
  })
})

// ============================================================================
// Validation Result Schemas
// ============================================================================

describe('Module 42 — Validation Result Schemas', () => {
  test('listValidationResultsSchema accepts valid params with defaults', () => {
    const result = listValidationResultsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('listValidationResultsSchema accepts all filters', () => {
    const result = listValidationResultsSchema.parse({
      validation_type: 'schema',
      severity: 'error',
      is_resolved: 'false',
    })
    expect(result.validation_type).toBe('schema')
    expect(result.severity).toBe('error')
    expect(result.is_resolved).toBe(false)
  })

  test('listValidationResultsSchema handles boolean preprocess for is_resolved', () => {
    const resultTrue = listValidationResultsSchema.parse({ is_resolved: 'true' })
    expect(resultTrue.is_resolved).toBe(true)
    const resultFalse = listValidationResultsSchema.parse({ is_resolved: 'false' })
    expect(resultFalse.is_resolved).toBe(false)
  })

  test('createValidationResultSchema accepts valid result', () => {
    const result = createValidationResultSchema.parse({ message: 'Missing required field' })
    expect(result.message).toBe('Missing required field')
    expect(result.validation_type).toBe('schema')
    expect(result.severity).toBe('warning')
  })

  test('createValidationResultSchema requires message', () => {
    expect(() => createValidationResultSchema.parse({})).toThrow()
  })

  test('createValidationResultSchema rejects empty message', () => {
    expect(() => createValidationResultSchema.parse({ message: '' })).toThrow()
  })

  test('createValidationResultSchema rejects message > 5000 chars', () => {
    expect(() => createValidationResultSchema.parse({ message: 'a'.repeat(5001) })).toThrow()
  })

  test('createValidationResultSchema accepts all optional fields', () => {
    const result = createValidationResultSchema.parse({
      message: 'Data type mismatch',
      validation_type: 'data_type',
      severity: 'error',
      field_name: 'phone_number',
      record_index: 42,
      source_value: '555-CALL',
    })
    expect(result.validation_type).toBe('data_type')
    expect(result.severity).toBe('error')
    expect(result.field_name).toBe('phone_number')
    expect(result.record_index).toBe(42)
    expect(result.source_value).toBe('555-CALL')
  })

  test('createValidationResultSchema rejects negative record_index', () => {
    expect(() => createValidationResultSchema.parse({
      message: 'Test',
      record_index: -1,
    })).toThrow()
  })

  test('updateValidationResultSchema accepts partial updates', () => {
    const result = updateValidationResultSchema.parse({ is_resolved: true })
    expect(result.is_resolved).toBe(true)
  })

  test('updateValidationResultSchema accepts severity change', () => {
    const result = updateValidationResultSchema.parse({ severity: 'info' })
    expect(result.severity).toBe('info')
  })

  test('updateValidationResultSchema accepts message update', () => {
    const result = updateValidationResultSchema.parse({ message: 'Updated message' })
    expect(result.message).toBe('Updated message')
  })
})

// ============================================================================
// Reconciliation Schemas
// ============================================================================

describe('Module 42 — Reconciliation Schemas', () => {
  test('listReconciliationSchema accepts valid params with defaults', () => {
    const result = listReconciliationSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listReconciliationSchema accepts filters', () => {
    const result = listReconciliationSchema.parse({
      entity_type: 'vendor',
      status: 'reconciled',
    })
    expect(result.entity_type).toBe('vendor')
    expect(result.status).toBe('reconciled')
  })

  test('listReconciliationSchema rejects limit > 100', () => {
    expect(() => listReconciliationSchema.parse({ limit: 101 })).toThrow()
  })

  test('createReconciliationSchema accepts valid reconciliation', () => {
    const result = createReconciliationSchema.parse({ entity_type: 'vendor' })
    expect(result.entity_type).toBe('vendor')
    expect(result.source_count).toBe(0)
    expect(result.imported_count).toBe(0)
    expect(result.matched_count).toBe(0)
    expect(result.unmatched_count).toBe(0)
    expect(result.discrepancies).toEqual([])
    expect(result.status).toBe('pending')
  })

  test('createReconciliationSchema requires entity_type', () => {
    expect(() => createReconciliationSchema.parse({})).toThrow()
  })

  test('createReconciliationSchema rejects invalid entity_type', () => {
    expect(() => createReconciliationSchema.parse({ entity_type: 'invalid' })).toThrow()
  })

  test('createReconciliationSchema accepts all optional fields', () => {
    const result = createReconciliationSchema.parse({
      entity_type: 'client',
      source_count: 200,
      imported_count: 195,
      matched_count: 190,
      unmatched_count: 5,
      discrepancies: [{ id: 1, reason: 'no match' }],
      status: 'discrepant',
      notes: 'Some clients could not be matched',
    })
    expect(result.source_count).toBe(200)
    expect(result.imported_count).toBe(195)
    expect(result.status).toBe('discrepant')
    expect(result.notes).toBe('Some clients could not be matched')
  })

  test('createReconciliationSchema rejects negative counts', () => {
    expect(() => createReconciliationSchema.parse({
      entity_type: 'vendor',
      source_count: -1,
    })).toThrow()
  })

  test('updateReconciliationSchema accepts partial updates', () => {
    const result = updateReconciliationSchema.parse({
      status: 'reconciled',
      notes: 'All matched',
    })
    expect(result.status).toBe('reconciled')
    expect(result.notes).toBe('All matched')
  })

  test('updateReconciliationSchema accepts count updates', () => {
    const result = updateReconciliationSchema.parse({
      matched_count: 100,
      unmatched_count: 0,
    })
    expect(result.matched_count).toBe(100)
    expect(result.unmatched_count).toBe(0)
  })

  test('updateReconciliationSchema accepts discrepancies array', () => {
    const result = updateReconciliationSchema.parse({
      discrepancies: [{ id: 1 }, { id: 2 }],
    })
    expect(result.discrepancies).toHaveLength(2)
  })

  test('updateReconciliationSchema rejects invalid status', () => {
    expect(() => updateReconciliationSchema.parse({ status: 'invalid' })).toThrow()
  })

  test('updateReconciliationSchema rejects notes > 10000 chars', () => {
    expect(() => updateReconciliationSchema.parse({ notes: 'a'.repeat(10001) })).toThrow()
  })
})
