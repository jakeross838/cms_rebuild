/**
 * Module 20: Estimating Engine Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const estimateStatusEnum = z.enum([
  'draft', 'pending_review', 'approved', 'rejected', 'revised', 'archived',
])

export const estimateTypeEnum = z.enum([
  'lump_sum', 'cost_plus', 'time_and_materials', 'unit_price', 'gmp', 'design_build',
])

export const contractTypeEnum = z.enum(['nte', 'gmp', 'cost_plus', 'fixed'])

export const markupTypeEnum = z.enum(['flat', 'tiered', 'per_line', 'built_in'])

export const lineItemTypeEnum = z.enum(['line', 'allowance', 'exclusion', 'alternate'])

export const aiConfidenceEnum = z.enum(['high', 'medium', 'low'])

// ── Estimates ─────────────────────────────────────────────────────────────

export const listEstimatesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  status: estimateStatusEnum.optional(),
  estimate_type: estimateTypeEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createEstimateSchema = z.object({
  job_id: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(10000).nullable().optional(),
  status: estimateStatusEnum.optional().default('draft'),
  estimate_type: estimateTypeEnum.optional().default('lump_sum'),
  contract_type: contractTypeEnum.nullable().optional(),
  markup_type: markupTypeEnum.nullable().optional(),
  markup_pct: z.number().min(0).max(99.99).optional().default(0),
  overhead_pct: z.number().min(0).max(99.99).optional().default(0),
  profit_pct: z.number().min(0).max(99.99).optional().default(0),
  valid_until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
})

export const updateEstimateSchema = z.object({
  job_id: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  status: estimateStatusEnum.optional(),
  estimate_type: estimateTypeEnum.optional(),
  contract_type: contractTypeEnum.nullable().optional(),
  markup_type: markupTypeEnum.nullable().optional(),
  markup_pct: z.number().min(0).max(99.99).optional(),
  overhead_pct: z.number().min(0).max(99.99).optional(),
  profit_pct: z.number().min(0).max(99.99).optional(),
  subtotal: z.number().min(0).max(9999999999999.99).optional(),
  total: z.number().min(0).max(9999999999999.99).optional(),
  valid_until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
})

// ── Estimate Sections ─────────────────────────────────────────────────────

export const listEstimateSectionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export const createEstimateSectionSchema = z.object({
  parent_id: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(1).max(255),
  sort_order: z.number().int().min(0).optional().default(0),
})

export const updateEstimateSectionSchema = z.object({
  parent_id: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(1).max(255).optional(),
  sort_order: z.number().int().min(0).optional(),
  subtotal: z.number().min(0).max(9999999999999.99).optional(),
})

// ── Estimate Line Items ───────────────────────────────────────────────────

export const listEstimateLineItemsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(50),
  section_id: z.string().uuid().optional(),
  item_type: lineItemTypeEnum.optional(),
})

export const createEstimateLineItemSchema = z.object({
  section_id: z.string().uuid().nullable().optional(),
  cost_code_id: z.string().uuid().nullable().optional(),
  assembly_id: z.string().uuid().nullable().optional(),
  description: z.string().trim().min(1).max(2000),
  item_type: lineItemTypeEnum.optional().default('line'),
  quantity: z.number().min(0).max(9999999.9999).optional().default(1),
  unit: z.string().trim().max(30).optional().default('each'),
  unit_cost: z.number().min(-9999999999999.99).max(9999999999999.99).optional().default(0),
  markup_pct: z.number().min(0).max(99.99).optional().default(0),
  total: z.number().min(-9999999999999.99).max(9999999999999.99).optional().default(0),
  alt_group: z.string().trim().max(50).nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
  sort_order: z.number().int().min(0).optional().default(0),
  ai_suggested: z.boolean().optional().default(false),
  ai_confidence: aiConfidenceEnum.nullable().optional(),
})

export const updateEstimateLineItemSchema = z.object({
  section_id: z.string().uuid().nullable().optional(),
  cost_code_id: z.string().uuid().nullable().optional(),
  assembly_id: z.string().uuid().nullable().optional(),
  description: z.string().trim().min(1).max(2000).optional(),
  item_type: lineItemTypeEnum.optional(),
  quantity: z.number().min(0).max(9999999.9999).optional(),
  unit: z.string().trim().max(30).optional(),
  unit_cost: z.number().min(-9999999999999.99).max(9999999999999.99).optional(),
  markup_pct: z.number().min(0).max(99.99).optional(),
  total: z.number().min(-9999999999999.99).max(9999999999999.99).optional(),
  alt_group: z.string().trim().max(50).nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
  sort_order: z.number().int().min(0).optional(),
  ai_suggested: z.boolean().optional(),
  ai_confidence: aiConfidenceEnum.nullable().optional(),
})

// ── Estimate Versions ─────────────────────────────────────────────────────

export const listEstimateVersionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const createEstimateVersionSchema = z.object({
  version_number: z.number().int().positive(),
  snapshot_json: z.record(z.string(), z.unknown()).optional().default({}),
  change_summary: z.string().trim().max(5000).nullable().optional(),
})

// ── Assemblies ────────────────────────────────────────────────────────────

export const listAssembliesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.string().trim().max(100).optional(),
  is_active: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val,
    z.boolean().optional()
  ),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createAssemblySchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(10000).nullable().optional(),
  category: z.string().trim().max(100).nullable().optional(),
  parameter_unit: z.string().trim().max(30).nullable().optional(),
  is_active: z.boolean().optional().default(true),
})

export const updateAssemblySchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  category: z.string().trim().max(100).nullable().optional(),
  parameter_unit: z.string().trim().max(30).nullable().optional(),
  is_active: z.boolean().optional(),
})

// ── Assembly Items ────────────────────────────────────────────────────────

export const listAssemblyItemsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export const createAssemblyItemSchema = z.object({
  cost_code_id: z.string().uuid().nullable().optional(),
  description: z.string().trim().min(1).max(2000),
  qty_per_unit: z.number().min(0).max(9999999.9999).optional().default(1),
  unit: z.string().trim().max(30).optional().default('each'),
  unit_cost: z.number().min(0).max(9999999999999.99).optional().default(0),
  sort_order: z.number().int().min(0).optional().default(0),
})

export const updateAssemblyItemSchema = z.object({
  cost_code_id: z.string().uuid().nullable().optional(),
  description: z.string().trim().min(1).max(2000).optional(),
  qty_per_unit: z.number().min(0).max(9999999.9999).optional(),
  unit: z.string().trim().max(30).optional(),
  unit_cost: z.number().min(0).max(9999999999999.99).optional(),
  sort_order: z.number().int().min(0).optional(),
})
