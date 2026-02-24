/**
 * Module 13: AI Invoice Processing Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const extractionStatusEnum = z.enum([
  'pending', 'processing', 'completed', 'failed', 'needs_review',
])

export const fieldDataTypeEnum = z.enum(['string', 'number', 'date', 'currency'])

export const extractionRuleTypeEnum = z.enum([
  'field_mapping', 'auto_code', 'auto_approve', 'skip_review',
])

export const auditActionEnum = z.enum([
  'created', 'processing', 'completed', 'failed',
  'reviewed', 'approved', 'rejected', 'matched',
])

export const reviewDecisionEnum = z.enum(['approved', 'rejected'])

// ── Invoice Extractions ─────────────────────────────────────────────────────

export const listExtractionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: extractionStatusEnum.optional(),
  document_id: z.string().uuid().optional(),
  vendor_match_id: z.string().uuid().optional(),
  job_match_id: z.string().uuid().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createExtractionSchema = z.object({
  document_id: z.string().uuid(),
  extraction_model: z.string().trim().min(1).max(50).optional(),
})

export const updateExtractionSchema = z.object({
  status: extractionStatusEnum.optional(),
  extracted_data: z.record(z.string(), z.unknown()).optional(),
  confidence_score: z.number().min(0).max(100).optional(),
  vendor_match_id: z.string().uuid().nullable().optional(),
  job_match_id: z.string().uuid().nullable().optional(),
  matched_bill_id: z.string().uuid().nullable().optional(),
  extraction_model: z.string().trim().min(1).max(50).optional(),
  error_message: z.string().trim().max(2000).nullable().optional(),
})

// ── Review Decision ─────────────────────────────────────────────────────────

export const reviewExtractionSchema = z.object({
  decision: reviewDecisionEnum,
  notes: z.string().trim().max(2000).optional(),
  corrections: z.record(z.string(), z.unknown()).optional(),
})

// ── Create Bill from Extraction ─────────────────────────────────────────────

export const createBillFromExtractionSchema = z.object({
  vendor_id: z.string().uuid(),
  bill_number: z.string().trim().min(1).max(100),
  bill_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  amount: z.number().positive().max(999999999.99),
  job_id: z.string().uuid().optional(),
  description: z.string().trim().max(1000).optional(),
  lines: z.array(z.object({
    gl_account_id: z.string().uuid().optional(),
    amount: z.number().max(999999999.99),
    description: z.string().trim().max(500).optional(),
    job_id: z.string().uuid().optional(),
    cost_code_id: z.string().uuid().optional(),
  })).optional(),
})

// ── Extraction Field Mappings ───────────────────────────────────────────────

export const createFieldMappingSchema = z.object({
  field_name: z.string().trim().min(1).max(100),
  extraction_path: z.string().trim().min(1).max(500),
  data_type: fieldDataTypeEnum.default('string'),
  is_required: z.boolean().default(false),
  default_value: z.string().trim().max(500).nullable().optional(),
})

export const updateFieldMappingSchema = z.object({
  field_name: z.string().trim().min(1).max(100).optional(),
  extraction_path: z.string().trim().min(1).max(500).optional(),
  data_type: fieldDataTypeEnum.optional(),
  is_required: z.boolean().optional(),
  default_value: z.string().trim().max(500).nullable().optional(),
})

// ── Extraction Rules ────────────────────────────────────────────────────────

export const listExtractionRulesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  vendor_id: z.string().uuid().optional(),
  rule_type: extractionRuleTypeEnum.optional(),
  is_active: z.coerce.boolean().optional(),
})

export const createExtractionRuleSchema = z.object({
  vendor_id: z.string().uuid().nullable().optional(),
  rule_type: extractionRuleTypeEnum,
  conditions: z.record(z.string(), z.unknown()).default({}),
  actions: z.record(z.string(), z.unknown()).default({}),
  is_active: z.boolean().default(true),
  priority: z.number().int().min(0).max(9999).default(0),
})

export const updateExtractionRuleSchema = z.object({
  vendor_id: z.string().uuid().nullable().optional(),
  rule_type: extractionRuleTypeEnum.optional(),
  conditions: z.record(z.string(), z.unknown()).optional(),
  actions: z.record(z.string(), z.unknown()).optional(),
  is_active: z.boolean().optional(),
  priority: z.number().int().min(0).max(9999).optional(),
})
