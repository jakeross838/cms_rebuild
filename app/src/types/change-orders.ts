/**
 * Module 17: Change Order Management Types
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type ChangeType =
  | 'owner_requested'
  | 'field_condition'
  | 'design_change'
  | 'regulatory'
  | 'allowance'
  | 'credit'

export type ChangeOrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'voided'

export type RequesterType = 'builder' | 'client' | 'vendor'

export type ChangeOrderHistoryAction =
  | 'created'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'voided'
  | 'revised'
  | 'client_approved'

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface ChangeOrder {
  id: string
  company_id: string
  job_id: string
  co_number: string
  title: string
  description: string | null
  change_type: ChangeType
  status: ChangeOrderStatus
  requested_by_type: RequesterType | null
  requested_by_id: string | null
  amount: number
  cost_impact: number
  schedule_impact_days: number
  approval_chain: unknown[]
  approved_by: string | null
  approved_at: string | null
  client_approved: boolean
  client_approved_at: string | null
  document_id: string | null
  budget_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ChangeOrderItem {
  id: string
  change_order_id: string
  description: string
  cost_code_id: string | null
  quantity: number
  unit_price: number
  amount: number
  markup_pct: number
  markup_amount: number
  total: number
  vendor_id: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ChangeOrderHistory {
  id: string
  change_order_id: string
  action: ChangeOrderHistoryAction
  previous_status: string | null
  new_status: string | null
  details: Record<string, unknown>
  performed_by: string | null
  created_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const CHANGE_TYPES: { value: ChangeType; label: string }[] = [
  { value: 'owner_requested', label: 'Owner Requested' },
  { value: 'field_condition', label: 'Field Condition' },
  { value: 'design_change', label: 'Design Change' },
  { value: 'regulatory', label: 'Regulatory' },
  { value: 'allowance', label: 'Allowance' },
  { value: 'credit', label: 'Credit' },
]

export const CHANGE_ORDER_STATUSES: { value: ChangeOrderStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'voided', label: 'Voided' },
]

export const REQUESTER_TYPES: { value: RequesterType; label: string }[] = [
  { value: 'builder', label: 'Builder' },
  { value: 'client', label: 'Client' },
  { value: 'vendor', label: 'Vendor' },
]

export const CHANGE_ORDER_HISTORY_ACTIONS: { value: ChangeOrderHistoryAction; label: string }[] = [
  { value: 'created', label: 'Created' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'voided', label: 'Voided' },
  { value: 'revised', label: 'Revised' },
  { value: 'client_approved', label: 'Client Approved' },
]
