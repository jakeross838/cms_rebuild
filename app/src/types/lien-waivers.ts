/**
 * Module 14: Lien Waiver Management Types
 */

// ── Type Unions ──────────────────────────────────────────────────────────────

export type WaiverType =
  | 'conditional_progress'
  | 'unconditional_progress'
  | 'conditional_final'
  | 'unconditional_final'

export type WaiverStatus =
  | 'draft'
  | 'pending'
  | 'sent'
  | 'received'
  | 'approved'
  | 'rejected'

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface LienWaiver {
  id: string
  company_id: string
  job_id: string
  vendor_id: string | null
  waiver_type: WaiverType
  status: WaiverStatus
  amount: number | null
  through_date: string | null
  document_id: string | null
  payment_id: string | null
  check_number: string | null
  claimant_name: string | null
  notes: string | null
  requested_by: string | null
  requested_at: string | null
  received_at: string | null
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface LienWaiverTemplate {
  id: string
  company_id: string
  waiver_type: WaiverType
  template_name: string
  template_content: string | null
  state_code: string | null
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface LienWaiverTracking {
  id: string
  company_id: string
  job_id: string
  vendor_id: string | null
  period_start: string | null
  period_end: string | null
  expected_amount: number | null
  waiver_id: string | null
  is_compliant: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

// ── Constants ────────────────────────────────────────────────────────────────

export const WAIVER_TYPES: { value: WaiverType; label: string }[] = [
  { value: 'conditional_progress', label: 'Conditional Progress' },
  { value: 'unconditional_progress', label: 'Unconditional Progress' },
  { value: 'conditional_final', label: 'Conditional Final' },
  { value: 'unconditional_final', label: 'Unconditional Final' },
]

export const WAIVER_STATUSES: { value: WaiverStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'sent', label: 'Sent' },
  { value: 'received', label: 'Received' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]
