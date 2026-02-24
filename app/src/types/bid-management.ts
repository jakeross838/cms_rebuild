/**
 * Module 26: Bid Management Types
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type BidPackageStatus =
  | 'draft'
  | 'published'
  | 'closed'
  | 'awarded'
  | 'cancelled'

export type InvitationStatus =
  | 'invited'
  | 'viewed'
  | 'declined'
  | 'submitted'

export type AwardStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface BidPackage {
  id: string
  company_id: string
  job_id: string
  title: string
  description: string | null
  trade: string | null
  scope_of_work: string | null
  bid_due_date: string | null
  status: BidPackageStatus
  documents: unknown[]
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface BidInvitation {
  id: string
  company_id: string
  bid_package_id: string
  vendor_id: string
  status: InvitationStatus
  invited_at: string
  viewed_at: string | null
  responded_at: string | null
  decline_reason: string | null
  created_at: string
  updated_at: string
}

export interface BidResponse {
  id: string
  company_id: string
  bid_package_id: string
  vendor_id: string
  invitation_id: string | null
  total_amount: number
  breakdown: Record<string, unknown>
  notes: string | null
  attachments: unknown[]
  submitted_at: string | null
  is_qualified: boolean
  created_at: string
  updated_at: string
}

export interface BidComparison {
  id: string
  company_id: string
  bid_package_id: string
  name: string
  comparison_data: Record<string, unknown>
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface BidAward {
  id: string
  company_id: string
  bid_package_id: string
  vendor_id: string
  bid_response_id: string | null
  award_amount: number
  notes: string | null
  awarded_by: string | null
  awarded_at: string
  status: AwardStatus
  created_at: string
  updated_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const BID_PACKAGE_STATUSES: { value: BidPackageStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'closed', label: 'Closed' },
  { value: 'awarded', label: 'Awarded' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const INVITATION_STATUSES: { value: InvitationStatus; label: string }[] = [
  { value: 'invited', label: 'Invited' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'declined', label: 'Declined' },
  { value: 'submitted', label: 'Submitted' },
]

export const AWARD_STATUSES: { value: AwardStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
]
