/**
 * Module 21: Selection Management Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const selectionStatusEnum = z.enum([
  'pending', 'presented', 'selected', 'approved', 'ordered', 'received', 'installed', 'on_hold', 'cancelled',
])

export const pricingModelEnum = z.enum(['allowance', 'fixed', 'cost_plus'])

export const optionSourceEnum = z.enum(['builder', 'designer', 'client', 'catalog'])

export const selectionHistoryActionEnum = z.enum([
  'viewed', 'considered', 'selected', 'deselected', 'changed',
])

// ── Selection Categories ──────────────────────────────────────────────────

export const listSelectionCategoriesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  room: z.string().trim().min(1).max(200).optional(),
  status: selectionStatusEnum.optional(),
  pricing_model: pricingModelEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createSelectionCategorySchema = z.object({
  job_id: z.string().uuid(),
  name: z.string().trim().min(1).max(255),
  room: z.string().trim().max(200).nullable().optional(),
  sort_order: z.number().int().min(0).optional().default(0),
  pricing_model: pricingModelEnum.optional().default('allowance'),
  allowance_amount: z.number().min(0).max(9999999999999.99).optional().default(0),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  lead_time_buffer_days: z.number().int().min(0).max(365).optional().default(0),
  assigned_to: z.string().uuid().nullable().optional(),
  status: selectionStatusEnum.optional().default('pending'),
  designer_access: z.boolean().optional().default(false),
  notes: z.string().trim().max(5000).nullable().optional(),
})

export const updateSelectionCategorySchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  room: z.string().trim().max(200).nullable().optional(),
  sort_order: z.number().int().min(0).optional(),
  pricing_model: pricingModelEnum.optional(),
  allowance_amount: z.number().min(0).max(9999999999999.99).optional(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  lead_time_buffer_days: z.number().int().min(0).max(365).optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  status: selectionStatusEnum.optional(),
  designer_access: z.boolean().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── Selection Options ─────────────────────────────────────────────────────

export const listSelectionOptionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category_id: z.string().uuid().optional(),
  source: optionSourceEnum.optional(),
  is_recommended: z.coerce.boolean().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createSelectionOptionSchema = z.object({
  category_id: z.string().uuid(),
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).nullable().optional(),
  vendor_id: z.string().uuid().nullable().optional(),
  sku: z.string().trim().max(100).nullable().optional(),
  model_number: z.string().trim().max(100).nullable().optional(),
  unit_price: z.number().min(0).max(9999999999999.99).optional().default(0),
  quantity: z.number().min(0).max(9999999.999).optional().default(1),
  total_price: z.number().min(0).max(9999999999999.99).optional().default(0),
  lead_time_days: z.number().int().min(0).max(730).optional().default(0),
  availability_status: z.string().trim().max(100).nullable().optional(),
  source: optionSourceEnum.optional().default('builder'),
  is_recommended: z.boolean().optional().default(false),
  sort_order: z.number().int().min(0).optional().default(0),
})

export const updateSelectionOptionSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  vendor_id: z.string().uuid().nullable().optional(),
  sku: z.string().trim().max(100).nullable().optional(),
  model_number: z.string().trim().max(100).nullable().optional(),
  unit_price: z.number().min(0).max(9999999999999.99).optional(),
  quantity: z.number().min(0).max(9999999.999).optional(),
  total_price: z.number().min(0).max(9999999999999.99).optional(),
  lead_time_days: z.number().int().min(0).max(730).optional(),
  availability_status: z.string().trim().max(100).nullable().optional(),
  source: optionSourceEnum.optional(),
  is_recommended: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
})

// ── Selections (actual selection records) ─────────────────────────────────

export const listSelectionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  status: selectionStatusEnum.optional(),
  room: z.string().trim().min(1).max(200).optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createSelectionSchema = z.object({
  category_id: z.string().uuid(),
  option_id: z.string().uuid(),
  job_id: z.string().uuid(),
  room: z.string().trim().max(200).nullable().optional(),
  status: selectionStatusEnum.optional().default('selected'),
  change_reason: z.string().trim().max(2000).nullable().optional(),
})

export const updateSelectionSchema = z.object({
  option_id: z.string().uuid().optional(),
  status: selectionStatusEnum.optional(),
  room: z.string().trim().max(200).nullable().optional(),
  change_reason: z.string().trim().max(2000).nullable().optional(),
  confirmed_by: z.string().uuid().nullable().optional(),
  confirmed_at: z.string().nullable().optional(),
  superseded_by: z.string().uuid().nullable().optional(),
})

// ── Selection History ─────────────────────────────────────────────────────

export const listSelectionHistorySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})
