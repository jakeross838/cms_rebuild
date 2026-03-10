// Invoice statuses used throughout the system
export type InvoiceStatus = 'draft' | 'pm_pending' | 'accountant_pending' | 'owner_pending' | 'approved' | 'in_draw' | 'paid' | 'denied'
export type InvoiceType = 'standard' | 'progress' | 'final' | 'credit_memo' | 'retainage_release'
export type ContractType = 'lump_sum' | 'time_materials' | 'unit_price' | 'cost_plus'
export type LienWaiverStatus = 'not_required' | 'required' | 'pending' | 'received'
export type PaymentMethod = 'check' | 'ach' | 'wire' | 'credit_card' | 'cash' | 'other'
export type DisputeType = 'full' | 'partial'
export type DisputeReasonCategory = 'incorrect_amount' | 'incorrect_scope' | 'duplicate' | 'quality_issue' | 'missing_documentation' | 'unauthorized_work' | 'pricing_dispute' | 'other'
export type DisputeStatus = 'open' | 'in_review' | 'resolved_adjusted' | 'resolved_voided' | 'resolved_credit_memo' | 'resolved_as_is' | 'escalated' | 'closed'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'delegated' | 'skipped' | 'escalated'
export type VendorCreditStatus = 'active' | 'partially_applied' | 'fully_applied' | 'voided'

// Full invoice record (matches DB + new columns)
export interface Invoice {
  id: string
  company_id: string
  job_id: string | null
  vendor_id: string | null
  invoice_number: string | null
  amount: number
  tax_amount: number
  retainage_percent: number
  retainage_amount: number
  net_amount: number | null
  status: InvoiceStatus
  invoice_type: InvoiceType
  contract_type: ContractType
  invoice_date: string | null
  due_date: string | null
  description: string | null
  notes: string | null
  po_id: string | null
  cost_code_id: string | null
  change_order_id: string | null
  payment_terms: string | null
  payment_method: PaymentMethod | null
  paid_date: string | null
  paid_amount: number | null
  payment_reference: string | null
  current_approval_step: string | null
  approved_by: string | null
  approved_at: string | null
  draw_id: string | null
  draw_number: number | null
  lien_waiver_status: LienWaiverStatus
  ai_confidence: number | null
  ai_notes: string | null
  is_auto_coded: boolean
  extraction_id: string | null
  duplicate_hash: string | null
  is_duplicate: boolean
  duplicate_of_id: string | null
  pdf_url: string | null
  stamped_pdf_url: string | null
  stamped_at: string | null
  billing_period_start: string | null
  billing_period_end: string | null
  percent_complete: number | null
  cumulative_billed: number | null
  contract_value: number | null
  created_by: string | null
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
  // Joined fields (from select queries)
  jobs?: { name: string } | null
  vendors?: { name: string } | null
  cost_codes?: { code: string; name: string } | null
  purchase_orders?: { po_number: string } | null
}

export interface InvoiceLineItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit: string
  unit_price: number
  amount: number
  cost_code_id: string | null
  cost_code_label: string | null
  phase: string | null
  job_id: string | null
  po_line_id: string | null
  sort_order: number
  created_at: string
  updated_at: string
  // Joined
  cost_codes?: { code: string; name: string } | null
}

export interface InvoiceAllocation {
  id: string
  invoice_id: string
  job_id: string | null
  cost_code_id: string | null
  phase: string | null
  amount: number
  percent: number | null
  po_id: string | null
  change_order_id: string | null
  description: string | null
  sort_order: number
  created_at: string
  updated_at: string
  // Joined
  jobs?: { name: string } | null
  cost_codes?: { code: string; name: string } | null
  purchase_orders?: { po_number: string } | null
}

export interface InvoiceApproval {
  id: string
  invoice_id: string
  step_name: string
  step_order: number
  required_role: string | null
  threshold_min: number | null
  threshold_max: number | null
  assigned_to: string | null
  status: ApprovalStatus
  action_by: string | null
  action_at: string | null
  action_notes: string | null
  delegated_to: string | null
  escalated_at: string | null
  escalation_reason: string | null
  created_at: string
  // Joined
  assigned_user?: { name: string } | null
  action_user?: { name: string } | null
}

export interface InvoiceDispute {
  id: string
  invoice_id: string
  company_id: string
  dispute_type: DisputeType
  disputed_amount: number
  reason_category: DisputeReasonCategory
  reason_description: string
  status: DisputeStatus
  resolution_notes: string | null
  resolved_by: string | null
  resolved_at: string | null
  adjusted_amount: number | null
  credit_memo_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface DisputeCommunication {
  id: string
  dispute_id: string
  message: string
  is_internal: boolean
  sender_type: 'user' | 'vendor' | 'system'
  sender_id: string | null
  attachments: unknown[]
  created_at: string
  // Joined
  sender?: { name: string } | null
}

export interface VendorCredit {
  id: string
  company_id: string
  vendor_id: string
  credit_number: string | null
  original_invoice_id: string | null
  original_po_id: string | null
  amount: number
  remaining_amount: number
  reason: string
  status: VendorCreditStatus
  applied_to_invoices: unknown[]
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  // Joined
  vendors?: { name: string } | null
}

export interface RetainageRule {
  id: string
  company_id: string
  name: string
  scope: 'company' | 'project' | 'vendor' | 'contract'
  job_id: string | null
  vendor_id: string | null
  retainage_percent: number
  release_at_percent_complete: number | null
  auto_release: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PaymentPrerequisite {
  id: string
  company_id: string
  invoice_id: string
  prerequisite_type: 'coi' | 'lien_waiver' | 'w9' | 'contract' | 'inspection' | 'custom'
  label: string
  is_met: boolean
  met_at: string | null
  met_by: string | null
  notes: string | null
  created_at: string
}

// Status transition map
export const INVOICE_STATUS_TRANSITIONS: Record<InvoiceStatus, { label: string; next: InvoiceStatus; variant?: 'destructive' }[]> = {
  draft: [{ label: 'Submit for PM Review', next: 'pm_pending' }],
  pm_pending: [
    { label: 'Approve', next: 'approved' },
    { label: 'Escalate to Owner', next: 'owner_pending' },
    { label: 'Deny', next: 'denied', variant: 'destructive' },
  ],
  accountant_pending: [
    { label: 'Approve', next: 'approved' },
    { label: 'Deny', next: 'denied', variant: 'destructive' },
  ],
  owner_pending: [
    { label: 'Approve', next: 'approved' },
    { label: 'Deny', next: 'denied', variant: 'destructive' },
  ],
  approved: [
    { label: 'Add to Draw', next: 'in_draw' },
    { label: 'Mark as Paid', next: 'paid' },
  ],
  in_draw: [{ label: 'Mark as Paid', next: 'paid' }],
  paid: [],
  denied: [{ label: 'Reopen as Draft', next: 'draft' }],
}

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Draft', color: 'text-stone-700', bgColor: 'bg-stone-100' },
  pm_pending: { label: 'PM Review', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  accountant_pending: { label: 'Accountant Review', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  owner_pending: { label: 'Owner Review', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  approved: { label: 'Approved', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  in_draw: { label: 'In Draw', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  paid: { label: 'Paid', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  denied: { label: 'Denied', color: 'text-red-700', bgColor: 'bg-red-100' },
}

export const INVOICE_TYPE_CONFIG: Record<InvoiceType, { label: string; color: string }> = {
  standard: { label: 'Standard', color: 'bg-stone-100 text-stone-600' },
  progress: { label: 'Progress', color: 'bg-blue-100 text-blue-600' },
  final: { label: 'Final', color: 'bg-emerald-100 text-emerald-600' },
  credit_memo: { label: 'Credit Memo', color: 'bg-amber-100 text-amber-600' },
  retainage_release: { label: 'Retainage Release', color: 'bg-purple-100 text-purple-600' },
}

export const CONTRACT_TYPE_CONFIG: Record<ContractType, { label: string; abbrev: string }> = {
  lump_sum: { label: 'Lump Sum', abbrev: 'LS' },
  time_materials: { label: 'Time & Materials', abbrev: 'T&M' },
  unit_price: { label: 'Unit Price', abbrev: 'UP' },
  cost_plus: { label: 'Cost Plus', abbrev: 'C+' },
}

export const DISPUTE_REASON_OPTIONS = [
  { value: 'incorrect_amount', label: 'Incorrect Amount' },
  { value: 'incorrect_scope', label: 'Incorrect Scope' },
  { value: 'duplicate', label: 'Duplicate Invoice' },
  { value: 'quality_issue', label: 'Quality Issue' },
  { value: 'missing_documentation', label: 'Missing Documentation' },
  { value: 'unauthorized_work', label: 'Unauthorized Work' },
  { value: 'pricing_dispute', label: 'Pricing Dispute' },
  { value: 'other', label: 'Other' },
] as const
