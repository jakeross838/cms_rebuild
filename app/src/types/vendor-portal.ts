/**
 * Module 30: Vendor Portal Types
 */

// -- Enums ────────────────────────────────────────────────────────────────────

export type PortalAccessLevel = 'full' | 'limited' | 'readonly'

export type SubmissionType =
  | 'invoice'
  | 'lien_waiver'
  | 'insurance_cert'
  | 'w9'
  | 'schedule_update'
  | 'daily_report'

export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'

export type InvitationStatus =
  | 'pending'
  | 'accepted'
  | 'expired'
  | 'revoked'

export type MessageDirection = 'to_vendor' | 'from_vendor'

// -- Interfaces ───────────────────────────────────────────────────────────────

export interface VendorPortalSettings {
  id: string
  company_id: string
  portal_enabled: boolean
  allow_self_registration: boolean
  require_approval: boolean
  allowed_submission_types: string[]
  required_compliance_docs: string[]
  auto_approve_submissions: boolean
  portal_welcome_message: string | null
  portal_branding: Record<string, unknown>
  notification_settings: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface VendorPortalInvitation {
  id: string
  company_id: string
  vendor_id: string | null
  vendor_name: string
  contact_name: string | null
  email: string
  phone: string | null
  message: string | null
  status: InvitationStatus
  token: string
  expires_at: string
  accepted_at: string | null
  invited_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface VendorPortalAccess {
  id: string
  company_id: string
  vendor_id: string
  access_level: PortalAccessLevel
  can_submit_invoices: boolean
  can_submit_lien_waivers: boolean
  can_submit_daily_reports: boolean
  can_view_schedule: boolean
  can_view_purchase_orders: boolean
  can_upload_documents: boolean
  can_send_messages: boolean
  allowed_job_ids: string[]
  granted_by: string | null
  granted_at: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface VendorSubmission {
  id: string
  company_id: string
  vendor_id: string
  job_id: string | null
  submission_type: SubmissionType
  status: SubmissionStatus
  title: string
  description: string | null
  amount: number | null
  reference_number: string | null
  file_urls: string[]
  metadata: Record<string, unknown>
  rejection_reason: string | null
  submitted_at: string | null
  reviewed_at: string | null
  reviewed_by: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface VendorMessage {
  id: string
  company_id: string
  vendor_id: string
  job_id: string | null
  subject: string
  body: string
  direction: MessageDirection
  sender_id: string | null
  is_read: boolean
  read_at: string | null
  attachments: unknown[]
  parent_message_id: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// -- Constants ────────────────────────────────────────────────────────────────

export const PORTAL_ACCESS_LEVELS: { value: PortalAccessLevel; label: string }[] = [
  { value: 'full', label: 'Full Access' },
  { value: 'limited', label: 'Limited Access' },
  { value: 'readonly', label: 'Read Only' },
]

export const SUBMISSION_TYPES: { value: SubmissionType; label: string }[] = [
  { value: 'invoice', label: 'Invoice' },
  { value: 'lien_waiver', label: 'Lien Waiver' },
  { value: 'insurance_cert', label: 'Insurance Certificate' },
  { value: 'w9', label: 'W-9' },
  { value: 'schedule_update', label: 'Schedule Update' },
  { value: 'daily_report', label: 'Daily Report' },
]

export const SUBMISSION_STATUSES: { value: SubmissionStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export const INVITATION_STATUSES: { value: InvitationStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'expired', label: 'Expired' },
  { value: 'revoked', label: 'Revoked' },
]

export const MESSAGE_DIRECTIONS: { value: MessageDirection; label: string }[] = [
  { value: 'to_vendor', label: 'To Vendor' },
  { value: 'from_vendor', label: 'From Vendor' },
]
