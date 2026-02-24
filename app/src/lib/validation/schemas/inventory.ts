/**
 * Module 52: Inventory & Materials Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const locationTypeEnum = z.enum(['warehouse', 'job_site', 'vehicle', 'other'])

export const transactionTypeEnum = z.enum(['receive', 'transfer', 'consume', 'adjust', 'return'])

export const requestStatusEnum = z.enum(['draft', 'submitted', 'approved', 'partially_fulfilled', 'fulfilled', 'rejected'])

export const requestPriorityEnum = z.enum(['low', 'normal', 'high', 'urgent'])

// ── Inventory Items ───────────────────────────────────────────────────────

export const listInventoryItemsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.string().trim().min(1).max(100).optional(),
  is_active: z.coerce.boolean().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createInventoryItemSchema = z.object({
  name: z.string().trim().min(1).max(255),
  sku: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(5000).optional(),
  category: z.string().trim().min(1).max(100).optional(),
  unit_of_measure: z.string().trim().min(1).max(50).default('each'),
  unit_cost: z.number().min(0).max(999999999999999).default(0),
  reorder_point: z.number().min(0).max(9999999999).default(0),
  reorder_quantity: z.number().min(0).max(9999999999).default(0),
  is_active: z.boolean().default(true),
})

export const updateInventoryItemSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  sku: z.string().trim().min(1).max(100).nullable().optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  category: z.string().trim().min(1).max(100).nullable().optional(),
  unit_of_measure: z.string().trim().min(1).max(50).optional(),
  unit_cost: z.number().min(0).max(999999999999999).optional(),
  reorder_point: z.number().min(0).max(9999999999).optional(),
  reorder_quantity: z.number().min(0).max(9999999999).optional(),
  is_active: z.boolean().optional(),
})

// ── Inventory Locations ───────────────────────────────────────────────────

export const listInventoryLocationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  location_type: locationTypeEnum.optional(),
  job_id: z.string().uuid().optional(),
  is_active: z.coerce.boolean().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createInventoryLocationSchema = z.object({
  name: z.string().trim().min(1).max(200),
  location_type: locationTypeEnum.default('warehouse'),
  address: z.string().trim().max(1000).optional(),
  job_id: z.string().uuid().optional(),
  is_active: z.boolean().default(true),
})

export const updateInventoryLocationSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  location_type: locationTypeEnum.optional(),
  address: z.string().trim().max(1000).nullable().optional(),
  job_id: z.string().uuid().nullable().optional(),
  is_active: z.boolean().optional(),
})

// ── Inventory Stock ───────────────────────────────────────────────────────

export const listInventoryStockSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  item_id: z.string().uuid().optional(),
  location_id: z.string().uuid().optional(),
})

// ── Inventory Transactions ────────────────────────────────────────────────

export const listInventoryTransactionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  item_id: z.string().uuid().optional(),
  location_id: z.string().uuid().optional(),
  transaction_type: transactionTypeEnum.optional(),
  job_id: z.string().uuid().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
})

export const createInventoryTransactionSchema = z.object({
  item_id: z.string().uuid(),
  from_location_id: z.string().uuid().optional(),
  to_location_id: z.string().uuid().optional(),
  transaction_type: transactionTypeEnum,
  quantity: z.number().positive().max(9999999999),
  unit_cost: z.number().min(0).max(999999999999999).optional(),
  total_cost: z.number().min(0).max(999999999999999).optional(),
  reference_type: z.string().trim().min(1).max(50).optional(),
  reference_id: z.string().uuid().optional(),
  job_id: z.string().uuid().optional(),
  cost_code_id: z.string().uuid().optional(),
  notes: z.string().trim().max(2000).optional(),
})

// ── Material Requests ─────────────────────────────────────────────────────

export const listMaterialRequestsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  status: requestStatusEnum.optional(),
  priority: requestPriorityEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createMaterialRequestSchema = z.object({
  job_id: z.string().uuid().optional(),
  priority: requestPriorityEnum.default('normal'),
  needed_by: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  notes: z.string().trim().max(2000).optional(),
  items: z.array(z.object({
    item_id: z.string().uuid().optional(),
    description: z.string().trim().max(500).optional(),
    quantity_requested: z.number().positive().max(9999999999),
    unit: z.string().trim().min(1).max(50).optional(),
    notes: z.string().trim().max(500).optional(),
  })).min(1).max(100),
})

export const updateMaterialRequestSchema = z.object({
  job_id: z.string().uuid().nullable().optional(),
  priority: requestPriorityEnum.optional(),
  needed_by: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  status: requestStatusEnum.optional(),
  items: z.array(z.object({
    item_id: z.string().uuid().optional(),
    description: z.string().trim().max(500).optional(),
    quantity_requested: z.number().positive().max(9999999999),
    unit: z.string().trim().min(1).max(50).optional(),
    notes: z.string().trim().max(500).optional(),
  })).min(1).max(100).optional(),
})
