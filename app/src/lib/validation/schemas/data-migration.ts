/**
 * Module 42: Data Migration Validation Schemas
 */

import { z } from 'zod'

// -- Enums ────────────────────────────────────────────────────────────────────

export const sourcePlatformEnum = z.enum([
  'buildertrend', 'coconstruct', 'procore', 'quickbooks', 'excel', 'csv', 'sage', 'xero', 'other',
])

export const migrationStatusEnum = z.enum([
  'draft', 'mapping', 'validating', 'ready', 'running', 'completed', 'failed', 'rolled_back',
])

export const transformTypeEnum = z.enum([
  'direct', 'lookup', 'formula', 'default', 'concatenate', 'split', 'date_format', 'currency', 'skip',
])

export const validationTypeEnum = z.enum([
  'schema', 'data_type', 'required_field', 'uniqueness', 'referential', 'business_rule', 'format',
])

export const validationSeverityEnum = z.enum(['error', 'warning', 'info'])

export const reconciliationStatusEnum = z.enum([
  'pending', 'reconciling', 'reconciled', 'discrepant',
])

export const migrationEntityTypeEnum = z.enum([
  'vendor', 'client', 'job', 'invoice', 'cost_code', 'employee',
])

// -- Migration Jobs ──────────────────────────────────────────────────────────

export const listMigrationJobsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: migrationStatusEnum.optional(),
  source_platform: sourcePlatformEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createMigrationJobSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(10000).nullable().optional(),
  source_platform: sourcePlatformEnum.optional().default('other'),
  status: migrationStatusEnum.optional().default('draft'),
  source_file_url: z.string().trim().max(2000).nullable().optional(),
  source_file_name: z.string().trim().max(255).nullable().optional(),
  total_records: z.number().int().min(0).optional().default(0),
})

export const updateMigrationJobSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  source_platform: sourcePlatformEnum.optional(),
  status: migrationStatusEnum.optional(),
  source_file_url: z.string().trim().max(2000).nullable().optional(),
  source_file_name: z.string().trim().max(255).nullable().optional(),
  total_records: z.number().int().min(0).optional(),
  processed_records: z.number().int().min(0).optional(),
  failed_records: z.number().int().min(0).optional(),
  skipped_records: z.number().int().min(0).optional(),
  error_log: z.array(z.unknown()).optional(),
})

// -- Field Mappings ──────────────────────────────────────────────────────────

export const listFieldMappingsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  target_table: z.string().trim().max(100).optional(),
  transform_type: transformTypeEnum.optional(),
})

export const createFieldMappingSchema = z.object({
  source_field: z.string().trim().min(1).max(200),
  target_table: z.string().trim().min(1).max(100),
  target_field: z.string().trim().min(1).max(100),
  transform_type: transformTypeEnum.optional().default('direct'),
  transform_config: z.record(z.string(), z.unknown()).optional().default({}),
  is_required: z.boolean().optional().default(false),
  default_value: z.string().trim().max(1000).nullable().optional(),
  sample_source_value: z.string().trim().max(1000).nullable().optional(),
  sample_target_value: z.string().trim().max(1000).nullable().optional(),
  sort_order: z.number().int().min(0).optional().default(0),
})

export const updateFieldMappingSchema = z.object({
  source_field: z.string().trim().min(1).max(200).optional(),
  target_table: z.string().trim().min(1).max(100).optional(),
  target_field: z.string().trim().min(1).max(100).optional(),
  transform_type: transformTypeEnum.optional(),
  transform_config: z.record(z.string(), z.unknown()).optional(),
  is_required: z.boolean().optional(),
  default_value: z.string().trim().max(1000).nullable().optional(),
  sample_source_value: z.string().trim().max(1000).nullable().optional(),
  sample_target_value: z.string().trim().max(1000).nullable().optional(),
  sort_order: z.number().int().min(0).optional(),
})

// -- Mapping Templates ───────────────────────────────────────────────────────

export const listMappingTemplatesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  source_platform: sourcePlatformEnum.optional(),
  is_active: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val,
    z.boolean().optional()
  ),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createMappingTemplateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(10000).nullable().optional(),
  source_platform: sourcePlatformEnum,
  mappings: z.array(z.unknown()).optional().default([]),
  is_system: z.boolean().optional().default(false),
  is_active: z.boolean().optional().default(true),
})

export const updateMappingTemplateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  source_platform: sourcePlatformEnum.optional(),
  mappings: z.array(z.unknown()).optional(),
  is_active: z.boolean().optional(),
})

// -- Validation Results ──────────────────────────────────────────────────────

export const listValidationResultsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  validation_type: validationTypeEnum.optional(),
  severity: validationSeverityEnum.optional(),
  is_resolved: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val,
    z.boolean().optional()
  ),
})

export const createValidationResultSchema = z.object({
  validation_type: validationTypeEnum.optional().default('schema'),
  severity: validationSeverityEnum.optional().default('warning'),
  field_name: z.string().trim().max(200).nullable().optional(),
  record_index: z.number().int().min(0).nullable().optional(),
  source_value: z.string().trim().max(5000).nullable().optional(),
  message: z.string().trim().min(1).max(5000),
})

export const updateValidationResultSchema = z.object({
  is_resolved: z.boolean().optional(),
  severity: validationSeverityEnum.optional(),
  message: z.string().trim().min(1).max(5000).optional(),
})

// -- Reconciliation ──────────────────────────────────────────────────────────

export const listReconciliationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  entity_type: migrationEntityTypeEnum.optional(),
  status: reconciliationStatusEnum.optional(),
})

export const createReconciliationSchema = z.object({
  entity_type: migrationEntityTypeEnum,
  source_count: z.number().int().min(0).optional().default(0),
  imported_count: z.number().int().min(0).optional().default(0),
  matched_count: z.number().int().min(0).optional().default(0),
  unmatched_count: z.number().int().min(0).optional().default(0),
  discrepancies: z.array(z.unknown()).optional().default([]),
  status: reconciliationStatusEnum.optional().default('pending'),
  notes: z.string().trim().max(10000).nullable().optional(),
})

export const updateReconciliationSchema = z.object({
  source_count: z.number().int().min(0).optional(),
  imported_count: z.number().int().min(0).optional(),
  matched_count: z.number().int().min(0).optional(),
  unmatched_count: z.number().int().min(0).optional(),
  discrepancies: z.array(z.unknown()).optional(),
  status: reconciliationStatusEnum.optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
})
