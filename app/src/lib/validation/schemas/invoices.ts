/**
 * Invoices (AP) Validation Schemas
 *
 * Covers: invoices CRUD, line items, allocations, approvals,
 * disputes, vendor credits, retainage rules, payment prerequisites.
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const invoiceStatusEnum = z.enum([
  'draft', 'pm_pending', 'accountant_pending', 'owner_pending', 'approved', 'in_draw', 'paid', 'denied',
])

export const invoiceTypeEnum = z.enum([
  'standard', 'progress', 'final', 'credit_memo', 'retainage_release',
])

export const contractTypeEnum = z.enum([
  'lump_sum', 'time_materials', 'unit_price', 'cost_plus',
])

export const lienWaiverStatusEnum = z.enum([
  'not_required', 'required', 'pending', 'received',
])

export const paymentMethodEnum = z.enum([
  'check', 'ach', 'wire', 'credit_card', 'cash', 'other',
])

export const disputeTypeEnum = z.enum(['full', 'partial'])

export const disputeReasonCategoryEnum = z.enum([
  'incorrect_amount', 'incorrect_scope', 'duplicate', 'quality_issue',
  'missing_documentation', 'unauthorized_work', 'pricing_dispute', 'other',
])

export const disputeStatusEnum = z.enum([
  'open', 'in_review', 'resolved_adjusted', 'resolved_voided',
  'resolved_credit_memo', 'resolved_as_is', 'escalated', 'closed',
])

export const approvalActionEnum = z.enum([
  'approved', 'rejected', 'delegated', 'escalated',
])

export const vendorCreditStatusEnum = z.enum([
  'active', 'partially_applied', 'fully_applied', 'voided',
])

export const retainageRuleScopeEnum = z.enum([
  'company', 'project', 'vendor', 'contract',
])

export const prerequisiteTypeEnum = z.enum([
  'coi', 'lien_waiver', 'w9', 'contract', 'inspection', 'custom',
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
  invoice_type: invoiceTypeEnum.optional(),
  contract_type: contractTypeEnum.optional(),
  po_id: z.string().uuid().optional(),
  cost_code_id: z.string().uuid().optional(),
  lien_waiver_status: lienWaiverStatusEnum.optional(),
  has_disputes: z.coerce.boolean().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createInvoiceSchema = z.object({
  amount: z.number().min(0),
  tax_amount: z.number().min(0).default(0),
  retainage_percent: z.number().min(0).max(100).default(0),
  retainage_amount: z.number().min(0).default(0),
  invoice_number: z.string().trim().max(100).nullable().optional(),
  invoice_date: dateString.nullable().optional(),
  due_date: dateString.nullable().optional(),
  job_id: z.string().uuid().nullable().optional(),
  vendor_id: z.string().uuid().nullable().optional(),
  status: invoiceStatusEnum.nullable().optional().default('draft'),
  invoice_type: invoiceTypeEnum.optional().default('standard'),
  contract_type: contractTypeEnum.optional().default('lump_sum'),
  description: z.string().trim().max(5000).nullable().optional(),
  notes: z.string().trim().max(50000).nullable().optional(),
  po_id: z.string().uuid().nullable().optional(),
  cost_code_id: z.string().uuid().nullable().optional(),
  change_order_id: z.string().uuid().nullable().optional(),
  payment_terms: z.string().trim().max(100).nullable().optional(),
  payment_method: paymentMethodEnum.nullable().optional(),
  lien_waiver_status: lienWaiverStatusEnum.optional().default('not_required'),
  billing_period_start: dateString.nullable().optional(),
  billing_period_end: dateString.nullable().optional(),
  percent_complete: z.number().min(0).max(100).nullable().optional(),
})

export const updateInvoiceSchema = z.object({
  amount: z.number().min(0).optional(),
  tax_amount: z.number().min(0).optional(),
  retainage_percent: z.number().min(0).max(100).optional(),
  retainage_amount: z.number().min(0).optional(),
  invoice_number: z.string().trim().max(100).nullable().optional(),
  invoice_date: dateString.nullable().optional(),
  due_date: dateString.nullable().optional(),
  job_id: z.string().uuid().nullable().optional(),
  vendor_id: z.string().uuid().nullable().optional(),
  status: invoiceStatusEnum.nullable().optional(),
  invoice_type: invoiceTypeEnum.optional(),
  contract_type: contractTypeEnum.optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  notes: z.string().trim().max(50000).nullable().optional(),
  po_id: z.string().uuid().nullable().optional(),
  cost_code_id: z.string().uuid().nullable().optional(),
  change_order_id: z.string().uuid().nullable().optional(),
  payment_terms: z.string().trim().max(100).nullable().optional(),
  payment_method: paymentMethodEnum.nullable().optional(),
  lien_waiver_status: lienWaiverStatusEnum.optional(),
  billing_period_start: dateString.nullable().optional(),
  billing_period_end: dateString.nullable().optional(),
  percent_complete: z.number().min(0).max(100).nullable().optional(),
})

// ── Line Items ──────────────────────────────────────────────────────────────

export const createLineItemSchema = z.object({
  description: z.string().trim().min(1).max(1000),
  quantity: z.number().min(0).default(1),
  unit: z.string().trim().max(50).default('ea'),
  unit_price: z.number().min(0),
  amount: z.number().min(0),
  cost_code_id: z.string().uuid().nullable().optional(),
  cost_code_label: z.string().trim().max(200).nullable().optional(),
  phase: z.string().trim().max(100).nullable().optional(),
  job_id: z.string().uuid().nullable().optional(),
  po_line_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().min(0).default(0),
})

export const updateLineItemSchema = z.object({
  description: z.string().trim().min(1).max(1000).optional(),
  quantity: z.number().min(0).optional(),
  unit: z.string().trim().max(50).optional(),
  unit_price: z.number().min(0).optional(),
  amount: z.number().min(0).optional(),
  cost_code_id: z.string().uuid().nullable().optional(),
  cost_code_label: z.string().trim().max(200).nullable().optional(),
  phase: z.string().trim().max(100).nullable().optional(),
  job_id: z.string().uuid().nullable().optional(),
  po_line_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().min(0).optional(),
})

// ── Allocations ─────────────────────────────────────────────────────────────

export const allocationItemSchema = z.object({
  id: z.string().uuid().optional(),
  job_id: z.string().uuid().nullable().optional(),
  cost_code_id: z.string().uuid().nullable().optional(),
  phase: z.string().trim().max(100).nullable().optional(),
  amount: z.number().min(0),
  percent: z.number().min(0).max(100).nullable().optional(),
  po_id: z.string().uuid().nullable().optional(),
  change_order_id: z.string().uuid().nullable().optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  sort_order: z.number().int().min(0).default(0),
})

export const saveAllocationsSchema = z.object({
  allocations: z.array(allocationItemSchema).min(1),
})

// ── Approvals ───────────────────────────────────────────────────────────────

export const approvalActionSchema = z.object({
  action: approvalActionEnum,
  notes: z.string().trim().max(5000).nullable().optional(),
  delegated_to: z.string().uuid().optional(),
  escalation_reason: z.string().trim().max(1000).optional(),
}).refine(
  (data) => {
    if (data.action === 'delegated' && !data.delegated_to) return false
    return true
  },
  { message: 'delegated_to is required when action is "delegated"', path: ['delegated_to'] },
).refine(
  (data) => {
    if (data.action === 'escalated' && !data.escalation_reason) return false
    return true
  },
  { message: 'escalation_reason is required when action is "escalated"', path: ['escalation_reason'] },
)

// ── Disputes ────────────────────────────────────────────────────────────────

export const createDisputeSchema = z.object({
  dispute_type: disputeTypeEnum,
  disputed_amount: z.number().min(0),
  reason_category: disputeReasonCategoryEnum,
  reason_description: z.string().trim().min(1).max(5000),
})

export const updateDisputeSchema = z.object({
  dispute_type: disputeTypeEnum.optional(),
  disputed_amount: z.number().min(0).optional(),
  reason_category: disputeReasonCategoryEnum.optional(),
  reason_description: z.string().trim().min(1).max(5000).optional(),
  status: disputeStatusEnum.optional(),
})

export const resolveDisputeSchema = z.object({
  status: z.enum([
    'resolved_adjusted', 'resolved_voided', 'resolved_credit_memo', 'resolved_as_is', 'closed',
  ]),
  resolution_notes: z.string().trim().min(1).max(5000),
  adjusted_amount: z.number().min(0).nullable().optional(),
  credit_memo_id: z.string().uuid().nullable().optional(),
})

export const addDisputeCommSchema = z.object({
  message: z.string().trim().min(1).max(10000),
  is_internal: z.boolean().default(false),
  sender_type: z.enum(['user', 'vendor', 'system']).default('user'),
  attachments: z.array(z.unknown()).default([]),
})

// ── Vendor Credits ──────────────────────────────────────────────────────────

export const listVendorCreditsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  vendor_id: z.string().uuid().optional(),
  status: vendorCreditStatusEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createVendorCreditSchema = z.object({
  vendor_id: z.string().uuid(),
  credit_number: z.string().trim().max(100).nullable().optional(),
  original_invoice_id: z.string().uuid().nullable().optional(),
  original_po_id: z.string().uuid().nullable().optional(),
  amount: z.number().min(0),
  reason: z.string().trim().min(1).max(5000),
})

export const updateVendorCreditSchema = z.object({
  credit_number: z.string().trim().max(100).nullable().optional(),
  amount: z.number().min(0).optional(),
  reason: z.string().trim().min(1).max(5000).optional(),
  status: vendorCreditStatusEnum.optional(),
})

// ── Retainage Rules ─────────────────────────────────────────────────────────

export const listRetainageRulesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  scope: retainageRuleScopeEnum.optional(),
  job_id: z.string().uuid().optional(),
  vendor_id: z.string().uuid().optional(),
  is_active: z.coerce.boolean().optional(),
})

export const createRetainageRuleSchema = z.object({
  name: z.string().trim().min(1).max(200),
  scope: retainageRuleScopeEnum,
  job_id: z.string().uuid().nullable().optional(),
  vendor_id: z.string().uuid().nullable().optional(),
  retainage_percent: z.number().min(0).max(100),
  release_at_percent_complete: z.number().min(0).max(100).nullable().optional(),
  auto_release: z.boolean().default(false),
  is_active: z.boolean().default(true),
})

export const updateRetainageRuleSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  scope: retainageRuleScopeEnum.optional(),
  job_id: z.string().uuid().nullable().optional(),
  vendor_id: z.string().uuid().nullable().optional(),
  retainage_percent: z.number().min(0).max(100).optional(),
  release_at_percent_complete: z.number().min(0).max(100).nullable().optional(),
  auto_release: z.boolean().optional(),
  is_active: z.boolean().optional(),
})

// ── Payment Prerequisites ───────────────────────────────────────────────────

export const createPaymentPrereqSchema = z.object({
  invoice_id: z.string().uuid(),
  prerequisite_type: prerequisiteTypeEnum,
  label: z.string().trim().min(1).max(200),
  notes: z.string().trim().max(5000).nullable().optional(),
})

export const togglePaymentPrereqSchema = z.object({
  is_met: z.boolean(),
})
