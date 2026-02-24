/**
 * Module 23: Price Intelligence Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const skillLevelEnum = z.enum([
  'apprentice', 'journeyman', 'master', 'foreman',
])

export const unitOfMeasureEnum = z.enum([
  'each', 'linear_ft', 'sq_ft', 'cu_yd', 'ton', 'gallon',
  'bundle', 'box', 'sheet', 'roll', 'bag', 'pair',
])

export const itemCategoryEnum = z.enum([
  'lumber', 'electrical', 'plumbing', 'hvac', 'roofing', 'flooring',
  'paint', 'hardware', 'concrete', 'insulation', 'drywall', 'fixtures',
  'appliances', 'other',
])

// ── Price value helpers ───────────────────────────────────────────────────

const positivePrice = z.number().positive().multipleOf(0.01).max(9999999999.99)
const optionalPrice = z.number().min(0).multipleOf(0.01).max(9999999999.99)

// ── Master Items ──────────────────────────────────────────────────────────

export const listMasterItemsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: itemCategoryEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
  sort_by: z.enum(['name', 'category', 'created_at', 'updated_at', 'default_unit_price']).optional().default('name'),
  sort_order: z.enum(['asc', 'desc']).optional().default('asc'),
})

export const createMasterItemSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).nullable().optional(),
  category: itemCategoryEnum.optional().default('other'),
  unit_of_measure: unitOfMeasureEnum.optional().default('each'),
  default_unit_price: optionalPrice.optional().default(0),
  sku: z.string().trim().max(100).nullable().optional(),
})

export const updateMasterItemSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  category: itemCategoryEnum.optional(),
  unit_of_measure: unitOfMeasureEnum.optional(),
  default_unit_price: optionalPrice.optional(),
  sku: z.string().trim().max(100).nullable().optional(),
})

// ── Vendor Item Prices ────────────────────────────────────────────────────

export const listVendorItemPricesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  vendor_id: z.string().uuid().optional(),
  sort_by: z.enum(['unit_price', 'effective_date', 'created_at']).optional().default('effective_date'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
})

export const createVendorItemPriceSchema = z.object({
  vendor_id: z.string().uuid(),
  unit_price: positivePrice,
  lead_time_days: z.number().int().min(0).max(365).nullable().optional(),
  min_order_qty: z.number().positive().max(999999.999).nullable().optional(),
  effective_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
})

export const updateVendorItemPriceSchema = z.object({
  unit_price: positivePrice.optional(),
  lead_time_days: z.number().int().min(0).max(365).nullable().optional(),
  min_order_qty: z.number().positive().max(999999.999).nullable().optional(),
  effective_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
})

// ── Price History ─────────────────────────────────────────────────────────

export const listPriceHistorySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  vendor_id: z.string().uuid().optional(),
  sort_by: z.enum(['recorded_at', 'new_price', 'change_pct']).optional().default('recorded_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
})

// ── Labor Rates ───────────────────────────────────────────────────────────

export const listLaborRatesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  trade: z.string().trim().min(1).max(100).optional(),
  skill_level: skillLevelEnum.optional(),
  region: z.string().trim().min(1).max(100).optional(),
  q: z.string().trim().min(1).max(200).optional(),
  sort_by: z.enum(['trade', 'skill_level', 'hourly_rate', 'created_at', 'updated_at']).optional().default('trade'),
  sort_order: z.enum(['asc', 'desc']).optional().default('asc'),
})

export const createLaborRateSchema = z.object({
  trade: z.string().trim().min(1).max(100),
  skill_level: skillLevelEnum.optional().default('journeyman'),
  hourly_rate: positivePrice,
  overtime_rate: positivePrice.nullable().optional(),
  region: z.string().trim().max(100).nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

export const updateLaborRateSchema = z.object({
  trade: z.string().trim().min(1).max(100).optional(),
  skill_level: skillLevelEnum.optional(),
  hourly_rate: positivePrice.optional(),
  overtime_rate: positivePrice.nullable().optional(),
  region: z.string().trim().max(100).nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── Labor Rate History ────────────────────────────────────────────────────

export const listLaborRateHistorySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  sort_by: z.enum(['effective_date', 'new_rate', 'change_pct']).optional().default('effective_date'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
})
