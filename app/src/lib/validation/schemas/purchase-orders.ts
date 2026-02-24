/**
 * Module 18: Purchase Order Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────
export const purchaseOrderStatusEnum = z.enum([
  'draft', 'pending_approval', 'approved', 'sent',
  'partially_received', 'received', 'closed', 'voided',
])

// ── List Purchase Orders ─────────────────────────────────────────────────
export const listPurchaseOrdersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  vendor_id: z.string().uuid().optional(),
  status: purchaseOrderStatusEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

// ── Create Purchase Order ────────────────────────────────────────────────
export const createPurchaseOrderSchema = z.object({
  job_id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  po_number: z.string().trim().min(1).max(50),
  title: z.string().trim().min(1).max(255),
  status: purchaseOrderStatusEnum.optional().default('draft'),
  subtotal: z.number().min(0).optional().default(0),
  tax_amount: z.number().min(0).optional().default(0),
  shipping_amount: z.number().min(0).optional().default(0),
  total_amount: z.number().min(0).optional().default(0),
  budget_id: z.string().uuid().nullable().optional(),
  cost_code_id: z.string().uuid().nullable().optional(),
  delivery_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').nullable().optional(),
  shipping_address: z.string().trim().max(1000).nullable().optional(),
  terms: z.string().trim().max(5000).nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── Update Purchase Order ────────────────────────────────────────────────
export const updatePurchaseOrderSchema = z.object({
  vendor_id: z.string().uuid().optional(),
  po_number: z.string().trim().min(1).max(50).optional(),
  title: z.string().trim().min(1).max(255).optional(),
  status: purchaseOrderStatusEnum.optional(),
  subtotal: z.number().min(0).optional(),
  tax_amount: z.number().min(0).optional(),
  shipping_amount: z.number().min(0).optional(),
  total_amount: z.number().min(0).optional(),
  budget_id: z.string().uuid().nullable().optional(),
  cost_code_id: z.string().uuid().nullable().optional(),
  delivery_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').nullable().optional(),
  shipping_address: z.string().trim().max(1000).nullable().optional(),
  terms: z.string().trim().max(5000).nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── Create PO Line ───────────────────────────────────────────────────────
export const createPurchaseOrderLineSchema = z.object({
  description: z.string().trim().min(1).max(1000),
  quantity: z.number().positive().default(1),
  unit: z.string().trim().max(20).optional().default('each'),
  unit_price: z.number().min(0).default(0),
  amount: z.number().min(0).default(0),
  cost_code_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().min(0).optional().default(0),
})

// ── Update PO Line ───────────────────────────────────────────────────────
export const updatePurchaseOrderLineSchema = z.object({
  description: z.string().trim().min(1).max(1000).optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().trim().max(20).optional(),
  unit_price: z.number().min(0).optional(),
  amount: z.number().min(0).optional(),
  cost_code_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().min(0).optional(),
})

// ── List PO Lines ────────────────────────────────────────────────────────
export const listPurchaseOrderLinesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

// ── Create PO Receipt ────────────────────────────────────────────────────
export const createPoReceiptSchema = z.object({
  received_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
  document_id: z.string().uuid().nullable().optional(),
  lines: z.array(z.object({
    po_line_id: z.string().uuid(),
    quantity_received: z.number().positive(),
    notes: z.string().trim().max(1000).nullable().optional(),
  })).min(1, 'At least one receipt line is required'),
})

// ── List PO Receipts ─────────────────────────────────────────────────────
export const listPoReceiptsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

// ── Approve PO ───────────────────────────────────────────────────────────
export const approvePurchaseOrderSchema = z.object({
  notes: z.string().trim().max(1000).nullable().optional(),
})

// ── Send PO ──────────────────────────────────────────────────────────────
export const sendPurchaseOrderSchema = z.object({
  notes: z.string().trim().max(1000).nullable().optional(),
})
