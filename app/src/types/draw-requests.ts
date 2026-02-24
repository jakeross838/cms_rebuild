/**
 * Module 15: Draw Requests — Types
 *
 * AIA G702/G703 format draw request management for construction financing.
 */

// ── Status Enums ──────────────────────────────────────────────────────────────

export type DrawRequestStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'submitted_to_lender'
  | 'funded'
  | 'rejected'

export type DrawHistoryAction =
  | 'created'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'funded'
  | 'revised'

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface DrawRequest {
  id: string
  company_id: string
  job_id: string
  draw_number: number
  application_date: string
  period_to: string
  status: DrawRequestStatus
  contract_amount: number
  total_completed: number
  retainage_pct: number
  retainage_amount: number
  total_earned: number
  less_previous: number
  current_due: number
  balance_to_finish: number
  submitted_by: string | null
  submitted_at: string | null
  approved_by: string | null
  approved_at: string | null
  lender_reference: string | null
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface DrawRequestLine {
  id: string
  draw_request_id: string
  cost_code_id: string | null
  description: string
  scheduled_value: number
  previous_applications: number
  current_work: number
  materials_stored: number
  total_completed: number
  pct_complete: number
  balance_to_finish: number
  retainage: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface DrawRequestHistory {
  id: string
  draw_request_id: string
  action: DrawHistoryAction
  details: Record<string, unknown>
  performed_by: string | null
  created_at: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const DRAW_STATUSES: { value: DrawRequestStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'submitted_to_lender', label: 'Submitted to Lender' },
  { value: 'funded', label: 'Funded' },
  { value: 'rejected', label: 'Rejected' },
]

export const DRAW_HISTORY_ACTIONS: { value: DrawHistoryAction; label: string }[] = [
  { value: 'created', label: 'Created' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'funded', label: 'Funded' },
  { value: 'revised', label: 'Revised' },
]
