/**
 * Module 32: Permitting & Inspections Types
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type PermitStatus =
  | 'draft'
  | 'applied'
  | 'issued'
  | 'active'
  | 'expired'
  | 'closed'
  | 'revoked'

export type PermitType =
  | 'building'
  | 'electrical'
  | 'plumbing'
  | 'mechanical'
  | 'demolition'
  | 'grading'
  | 'fire'
  | 'environmental'
  | 'zoning'
  | 'other'

export type InspectionStatus =
  | 'scheduled'
  | 'passed'
  | 'failed'
  | 'conditional'
  | 'cancelled'
  | 'no_show'

export type InspectionType =
  | 'rough_in'
  | 'final'
  | 'foundation'
  | 'framing'
  | 'electrical'
  | 'plumbing'
  | 'mechanical'
  | 'fire'
  | 'other'

export type InspectionResultType = 'pass' | 'fail' | 'conditional'

export type FeeStatus = 'pending' | 'paid' | 'waived' | 'refunded'

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface Permit {
  id: string
  company_id: string
  job_id: string
  permit_number: string | null
  permit_type: PermitType
  status: PermitStatus
  jurisdiction: string | null
  applied_date: string | null
  issued_date: string | null
  expiration_date: string | null
  conditions: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface PermitInspection {
  id: string
  company_id: string
  permit_id: string
  job_id: string
  inspection_type: InspectionType
  status: InspectionStatus
  scheduled_date: string | null
  scheduled_time: string | null
  inspector_name: string | null
  inspector_phone: string | null
  notes: string | null
  completed_at: string | null
  is_reinspection: boolean
  original_inspection_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface InspectionResult {
  id: string
  company_id: string
  inspection_id: string
  result: InspectionResultType
  result_notes: string | null
  deficiencies: unknown[]
  conditions_to_satisfy: string | null
  inspector_comments: string | null
  photos: unknown[]
  is_first_time_pass: boolean | null
  responsible_vendor_id: string | null
  recorded_by: string | null
  recorded_at: string
  created_at: string
  updated_at: string
}

export interface PermitDocument {
  id: string
  company_id: string
  permit_id: string
  document_type: string
  file_url: string
  file_name: string | null
  description: string | null
  uploaded_by: string | null
  uploaded_at: string
  created_at: string
}

export interface PermitFee {
  id: string
  company_id: string
  permit_id: string
  description: string
  amount: number
  status: FeeStatus
  due_date: string | null
  paid_date: string | null
  paid_by: string | null
  receipt_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const PERMIT_STATUSES: { value: PermitStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'applied', label: 'Applied' },
  { value: 'issued', label: 'Issued' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'closed', label: 'Closed' },
  { value: 'revoked', label: 'Revoked' },
]

export const PERMIT_TYPES: { value: PermitType; label: string }[] = [
  { value: 'building', label: 'Building' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'demolition', label: 'Demolition' },
  { value: 'grading', label: 'Grading' },
  { value: 'fire', label: 'Fire' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'zoning', label: 'Zoning' },
  { value: 'other', label: 'Other' },
]

export const INSPECTION_STATUSES: { value: InspectionStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'conditional', label: 'Conditional' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' },
]

export const INSPECTION_TYPES: { value: InspectionType; label: string }[] = [
  { value: 'rough_in', label: 'Rough-In' },
  { value: 'final', label: 'Final' },
  { value: 'foundation', label: 'Foundation' },
  { value: 'framing', label: 'Framing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'fire', label: 'Fire' },
  { value: 'other', label: 'Other' },
]

export const INSPECTION_RESULT_TYPES: { value: InspectionResultType; label: string }[] = [
  { value: 'pass', label: 'Pass' },
  { value: 'fail', label: 'Fail' },
  { value: 'conditional', label: 'Conditional' },
]

export const FEE_STATUSES: { value: FeeStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'waived', label: 'Waived' },
  { value: 'refunded', label: 'Refunded' },
]
