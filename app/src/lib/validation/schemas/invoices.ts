/**
 * Invoices (AP) Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const invoiceStatusEnum = z.enum([
  'draft', 'pm_pending', 'accountant_pending', 'owner_pending', 'approved', 'in_draw', 'paid', 'denied',
])

// ── Date helper ───────────────────────────────────────────────────────────

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format')

// ── Invoices ────────────────────────────────────────────────────────────────

export const listInvoicesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  vendor_id: z.string().uuid().optional(),
  status: invoiceStatusEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createInvoiceSchema = z.object({
  amount: z.number().min(0),
  invoice_number: z.string().trim().max(100).nullable().optional(),
  invoice_date: dateString.nullable().optional(),
  due_date: dateString.nullable().optional(),
  job_id: z.string().uuid().nullable().optional(),
  vendor_id: z.string().uuid().nullable().optional(),
  status: invoiceStatusEnum.nullable().optional().default('draft'),
  notes: z.string().trim().max(50000).nullable().optional(),
})

export const updateInvoiceSchema = z.object({
  amount: z.number().min(0).optional(),
  invoice_number: z.string().trim().max(100).nullable().optional(),
  invoice_date: dateString.nullable().optional(),
  due_date: dateString.nullable().optional(),
  job_id: z.string().uuid().nullable().optional(),
  vendor_id: z.string().uuid().nullable().optional(),
  status: invoiceStatusEnum.nullable().optional(),
  notes: z.string().trim().max(50000).nullable().optional(),
})
