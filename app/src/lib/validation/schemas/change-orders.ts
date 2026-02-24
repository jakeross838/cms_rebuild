/**
 * Module 17: Change Order Management Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const changeTypeEnum = z.enum([
  'owner_requested', 'field_condition', 'design_change', 'regulatory', 'allowance', 'credit',
])

export const changeOrderStatusEnum = z.enum([
  'draft', 'pending_approval', 'approved', 'rejected', 'voided',
])

export const requesterTypeEnum = z.enum(['builder', 'client', 'vendor'])

export const changeOrderHistoryActionEnum = z.enum([
  'created', 'submitted', 'approved', 'rejected', 'voided', 'revised', 'client_approved',
])

// ── Change Orders ─────────────────────────────────────────────────────────

export const listChangeOrdersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  status: changeOrderStatusEnum.optional(),
  change_type: changeTypeEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createChangeOrderSchema = z.object({
  job_id: z.string().uuid(),
  co_number: z.string().trim().min(1).max(20),
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(10000).nullable().optional(),
  change_type: changeTypeEnum.optional().default('owner_requested'),
  status: changeOrderStatusEnum.optional().default('draft'),
  requested_by_type: requesterTypeEnum.nullable().optional(),
  requested_by_id: z.string().uuid().nullable().optional(),
  amount: z.number().min(-9999999999999.99).max(9999999999999.99).optional().default(0),
  cost_impact: z.number().min(-9999999999999.99).max(9999999999999.99).optional().default(0),
  schedule_impact_days: z.number().int().min(-365).max(365).optional().default(0),
  approval_chain: z.array(z.unknown()).optional().default([]),
  document_id: z.string().uuid().nullable().optional(),
  budget_id: z.string().uuid().nullable().optional(),
})

export const updateChangeOrderSchema = z.object({
  co_number: z.string().trim().min(1).max(20).optional(),
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  change_type: changeTypeEnum.optional(),
  status: changeOrderStatusEnum.optional(),
  requested_by_type: requesterTypeEnum.nullable().optional(),
  requested_by_id: z.string().uuid().nullable().optional(),
  amount: z.number().min(-9999999999999.99).max(9999999999999.99).optional(),
  cost_impact: z.number().min(-9999999999999.99).max(9999999999999.99).optional(),
  schedule_impact_days: z.number().int().min(-365).max(365).optional(),
  approval_chain: z.array(z.unknown()).optional(),
  document_id: z.string().uuid().nullable().optional(),
  budget_id: z.string().uuid().nullable().optional(),
})

// ── Submit (draft -> pending_approval) ────────────────────────────────────

export const submitChangeOrderSchema = z.object({
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── Approve ───────────────────────────────────────────────────────────────

export const approveChangeOrderSchema = z.object({
  notes: z.string().trim().max(5000).nullable().optional(),
  client_approved: z.boolean().optional(),
})

// ── Change Order Items ────────────────────────────────────────────────────

export const listChangeOrderItemsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export const createChangeOrderItemSchema = z.object({
  description: z.string().trim().min(1).max(2000),
  cost_code_id: z.string().uuid().nullable().optional(),
  quantity: z.number().min(0).max(9999999.999).optional().default(1),
  unit_price: z.number().min(-9999999999999.99).max(9999999999999.99).optional().default(0),
  amount: z.number().min(-9999999999999.99).max(9999999999999.99).optional().default(0),
  markup_pct: z.number().min(0).max(99.99).optional().default(0),
  markup_amount: z.number().min(0).max(9999999999999.99).optional().default(0),
  total: z.number().min(-9999999999999.99).max(9999999999999.99).optional().default(0),
  vendor_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().min(0).optional().default(0),
})

export const updateChangeOrderItemSchema = z.object({
  description: z.string().trim().min(1).max(2000).optional(),
  cost_code_id: z.string().uuid().nullable().optional(),
  quantity: z.number().min(0).max(9999999.999).optional(),
  unit_price: z.number().min(-9999999999999.99).max(9999999999999.99).optional(),
  amount: z.number().min(-9999999999999.99).max(9999999999999.99).optional(),
  markup_pct: z.number().min(0).max(99.99).optional(),
  markup_amount: z.number().min(0).max(9999999999999.99).optional(),
  total: z.number().min(-9999999999999.99).max(9999999999999.99).optional(),
  vendor_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().min(0).optional(),
})
