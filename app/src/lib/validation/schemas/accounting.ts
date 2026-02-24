/**
 * Module 11: Native Accounting — GL / AP / AR Validation Schemas
 */

import { z } from 'zod'

// ── Enums ────────────────────────────────────────────────────────────────────

export const accountTypeEnum = z.enum(['asset', 'liability', 'equity', 'revenue', 'expense', 'cogs'])

export const normalBalanceEnum = z.enum(['debit', 'credit'])

export const journalEntryStatusEnum = z.enum(['draft', 'posted', 'voided'])

export const journalEntrySourceTypeEnum = z.enum(['manual', 'ap_payment', 'ar_receipt', 'payroll'])

export const billStatusEnum = z.enum(['draft', 'pending_approval', 'approved', 'partially_paid', 'paid', 'voided'])

export const paymentMethodEnum = z.enum(['check', 'ach', 'wire', 'credit_card', 'cash'])

export const paymentStatusEnum = z.enum(['pending', 'cleared', 'voided'])

export const invoiceStatusEnum = z.enum(['draft', 'sent', 'partially_paid', 'paid', 'overdue', 'voided'])

// ── Date helpers ─────────────────────────────────────────────────────────────

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format')

// ── GL Account Schemas ───────────────────────────────────────────────────────

export const listGlAccountsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  account_type: accountTypeEnum.optional(),
  is_active: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  parent_account_id: z.string().uuid().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createGlAccountSchema = z.object({
  account_number: z.string().trim().min(1).max(20),
  name: z.string().trim().min(1).max(255),
  account_type: accountTypeEnum,
  sub_type: z.string().trim().max(50).nullable().optional(),
  parent_account_id: z.string().uuid().nullable().optional(),
  is_active: z.boolean().optional().default(true),
  is_system: z.boolean().optional().default(false),
  description: z.string().trim().max(1000).nullable().optional(),
  normal_balance: normalBalanceEnum,
})

export const updateGlAccountSchema = z.object({
  account_number: z.string().trim().min(1).max(20).optional(),
  name: z.string().trim().min(1).max(255).optional(),
  account_type: accountTypeEnum.optional(),
  sub_type: z.string().trim().max(50).nullable().optional(),
  parent_account_id: z.string().uuid().nullable().optional(),
  is_active: z.boolean().optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  normal_balance: normalBalanceEnum.optional(),
})

// ── GL Journal Entry Schemas ─────────────────────────────────────────────────

const journalLineSchema = z.object({
  account_id: z.string().uuid(),
  debit_amount: z.number().min(0).default(0),
  credit_amount: z.number().min(0).default(0),
  memo: z.string().trim().max(500).nullable().optional(),
  job_id: z.string().uuid().nullable().optional(),
  cost_code_id: z.string().uuid().nullable().optional(),
  vendor_id: z.string().uuid().nullable().optional(),
  client_id: z.string().uuid().nullable().optional(),
})

export const listJournalEntriesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: journalEntryStatusEnum.optional(),
  source_type: journalEntrySourceTypeEnum.optional(),
  start_date: dateString.optional(),
  end_date: dateString.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createJournalEntrySchema = z.object({
  entry_date: dateString,
  reference_number: z.string().trim().max(50).nullable().optional(),
  memo: z.string().trim().max(2000).nullable().optional(),
  source_type: journalEntrySourceTypeEnum.optional().default('manual'),
  source_id: z.string().uuid().nullable().optional(),
  lines: z.array(journalLineSchema).min(2, 'Journal entry requires at least 2 lines'),
})

export const updateJournalEntrySchema = z.object({
  entry_date: dateString.optional(),
  reference_number: z.string().trim().max(50).nullable().optional(),
  memo: z.string().trim().max(2000).nullable().optional(),
  lines: z.array(journalLineSchema).min(2, 'Journal entry requires at least 2 lines').optional(),
})

// ── AP Bill Schemas ──────────────────────────────────────────────────────────

const billLineSchema = z.object({
  gl_account_id: z.string().uuid(),
  amount: z.number(),
  description: z.string().trim().max(500).nullable().optional(),
  job_id: z.string().uuid().nullable().optional(),
  cost_code_id: z.string().uuid().nullable().optional(),
})

export const listBillsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  vendor_id: z.string().uuid().optional(),
  job_id: z.string().uuid().optional(),
  status: billStatusEnum.optional(),
  start_date: dateString.optional(),
  end_date: dateString.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createBillSchema = z.object({
  vendor_id: z.string().uuid(),
  bill_number: z.string().trim().min(1).max(100),
  bill_date: dateString,
  due_date: dateString,
  amount: z.number().positive(),
  description: z.string().trim().max(2000).nullable().optional(),
  job_id: z.string().uuid().nullable().optional(),
  received_date: dateString.nullable().optional(),
  terms: z.string().trim().max(50).nullable().optional(),
  lines: z.array(billLineSchema).min(1, 'Bill requires at least 1 line item').optional(),
})

export const updateBillSchema = z.object({
  vendor_id: z.string().uuid().optional(),
  bill_number: z.string().trim().min(1).max(100).optional(),
  bill_date: dateString.optional(),
  due_date: dateString.optional(),
  amount: z.number().positive().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  job_id: z.string().uuid().nullable().optional(),
  received_date: dateString.nullable().optional(),
  terms: z.string().trim().max(50).nullable().optional(),
  status: billStatusEnum.optional(),
  lines: z.array(billLineSchema).min(1).optional(),
})

// ── AP Payment Schemas ───────────────────────────────────────────────────────

const paymentApplicationSchema = z.object({
  bill_id: z.string().uuid(),
  amount: z.number().positive(),
})

export const listPaymentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  vendor_id: z.string().uuid().optional(),
  status: paymentStatusEnum.optional(),
  start_date: dateString.optional(),
  end_date: dateString.optional(),
})

export const createPaymentSchema = z.object({
  vendor_id: z.string().uuid(),
  payment_date: dateString,
  amount: z.number().positive(),
  payment_method: paymentMethodEnum,
  reference_number: z.string().trim().max(100).nullable().optional(),
  memo: z.string().trim().max(2000).nullable().optional(),
  applications: z.array(paymentApplicationSchema).min(1, 'Payment requires at least 1 bill application'),
})

// ── AR Invoice Schemas ───────────────────────────────────────────────────────

const arInvoiceLineSchema = z.object({
  description: z.string().trim().min(1).max(500),
  quantity: z.number().positive().default(1),
  unit_price: z.number(),
  amount: z.number(),
  gl_account_id: z.string().uuid().nullable().optional(),
  job_id: z.string().uuid().nullable().optional(),
  cost_code_id: z.string().uuid().nullable().optional(),
})

export const listArInvoicesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  client_id: z.string().uuid().optional(),
  job_id: z.string().uuid().optional(),
  status: invoiceStatusEnum.optional(),
  start_date: dateString.optional(),
  end_date: dateString.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createArInvoiceSchema = z.object({
  client_id: z.string().uuid(),
  job_id: z.string().uuid().nullable().optional(),
  invoice_number: z.string().trim().min(1).max(100),
  invoice_date: dateString,
  due_date: dateString,
  amount: z.number().positive(),
  terms: z.string().trim().max(50).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  lines: z.array(arInvoiceLineSchema).min(1, 'Invoice requires at least 1 line item').optional(),
})

export const updateArInvoiceSchema = z.object({
  client_id: z.string().uuid().optional(),
  job_id: z.string().uuid().nullable().optional(),
  invoice_number: z.string().trim().min(1).max(100).optional(),
  invoice_date: dateString.optional(),
  due_date: dateString.optional(),
  amount: z.number().positive().optional(),
  terms: z.string().trim().max(50).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  status: invoiceStatusEnum.optional(),
  lines: z.array(arInvoiceLineSchema).min(1).optional(),
})

// ── AR Receipt Schemas ───────────────────────────────────────────────────────

const receiptApplicationSchema = z.object({
  invoice_id: z.string().uuid(),
  amount: z.number().positive(),
})

export const listReceiptsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  client_id: z.string().uuid().optional(),
  status: paymentStatusEnum.optional(),
  start_date: dateString.optional(),
  end_date: dateString.optional(),
})

export const createReceiptSchema = z.object({
  client_id: z.string().uuid(),
  receipt_date: dateString,
  amount: z.number().positive(),
  payment_method: paymentMethodEnum,
  reference_number: z.string().trim().max(100).nullable().optional(),
  memo: z.string().trim().max(2000).nullable().optional(),
  applications: z.array(receiptApplicationSchema).min(1, 'Receipt requires at least 1 invoice application'),
})
