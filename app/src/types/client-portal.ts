/**
 * Module 12: Basic Client Portal Types
 */

// ── Union Types ──────────────────────────────────────────────────────────────

export type SenderType = 'builder' | 'client'

export type PostType =
  | 'general_update'
  | 'milestone'
  | 'photo_update'
  | 'schedule_update'
  | 'budget_update'

export type PortalAction =
  | 'viewed_update'
  | 'viewed_document'
  | 'sent_message'
  | 'viewed_photo'
  | 'logged_in'

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface PortalSettings {
  id: string
  company_id: string
  job_id: string
  is_enabled: boolean
  branding_logo_url: string | null
  branding_primary_color: string
  welcome_message: string | null
  show_budget: boolean
  show_schedule: boolean
  show_documents: boolean
  show_photos: boolean
  show_daily_logs: boolean
  created_at: string
  updated_at: string
}

export interface PortalMessage {
  id: string
  company_id: string
  job_id: string
  sender_id: string
  sender_type: SenderType
  subject: string | null
  body: string
  parent_message_id: string | null
  is_read: boolean
  created_at: string
  updated_at: string
}

export interface PortalUpdatePost {
  id: string
  company_id: string
  job_id: string
  title: string
  body: string
  post_type: PostType
  is_published: boolean
  published_at: string | null
  created_by: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface PortalSharedDocument {
  id: string
  company_id: string
  job_id: string
  document_id: string
  shared_by: string
  shared_at: string
  notes: string | null
  created_at: string
}

export interface PortalSharedPhoto {
  id: string
  company_id: string
  job_id: string
  storage_path: string
  caption: string | null
  album_name: string | null
  sort_order: number
  shared_by: string
  created_at: string
}

export interface PortalActivityLog {
  id: string
  company_id: string
  job_id: string
  client_id: string
  action: PortalAction
  metadata: Record<string, unknown>
  created_at: string
}

// ── Constants ────────────────────────────────────────────────────────────────

export const SENDER_TYPES: { value: SenderType; label: string }[] = [
  { value: 'builder', label: 'Builder' },
  { value: 'client', label: 'Client' },
]

export const POST_TYPES: { value: PostType; label: string }[] = [
  { value: 'general_update', label: 'General Update' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'photo_update', label: 'Photo Update' },
  { value: 'schedule_update', label: 'Schedule Update' },
  { value: 'budget_update', label: 'Budget Update' },
]

export const PORTAL_ACTIONS: { value: PortalAction; label: string }[] = [
  { value: 'viewed_update', label: 'Viewed Update' },
  { value: 'viewed_document', label: 'Viewed Document' },
  { value: 'sent_message', label: 'Sent Message' },
  { value: 'viewed_photo', label: 'Viewed Photo' },
  { value: 'logged_in', label: 'Logged In' },
]

/** Default branding primary color */
export const DEFAULT_PRIMARY_COLOR = '#1a1a2e'

/** Maximum welcome message length */
export const MAX_WELCOME_MESSAGE_LENGTH = 2000

/** Maximum message body length */
export const MAX_MESSAGE_BODY_LENGTH = 5000

/** Maximum post body length */
export const MAX_POST_BODY_LENGTH = 10000

/** Maximum album name length */
export const MAX_ALBUM_NAME_LENGTH = 100

/** Maximum caption length */
export const MAX_CAPTION_LENGTH = 500

// ============================================================================
// Module 29: Full Client Portal Types (extends Module 12)
// ============================================================================

// ── Union Types ──────────────────────────────────────────────────────────────

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired'

export type ApprovalType =
  | 'selection'
  | 'change_order'
  | 'draw'
  | 'invoice'
  | 'schedule'

export type MessageStatus = 'sent' | 'read' | 'archived'

export type MessageSenderType = 'client' | 'builder_team'

export type MessageCategory =
  | 'general'
  | 'selections'
  | 'change_orders'
  | 'schedule'
  | 'budget'
  | 'warranty'
  | 'other'

export type ExternalChannel = 'phone' | 'text' | 'email'

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked'

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'

export type PaymentMethod =
  | 'credit_card'
  | 'ach'
  | 'check'
  | 'wire'
  | 'other'

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface ClientPortalSettings {
  id: string
  company_id: string
  branding: Record<string, unknown>
  custom_domain: string | null
  feature_flags: Record<string, unknown>
  visibility_rules: Record<string, unknown>
  notification_rules: Record<string, unknown>
  approval_config: Record<string, unknown>
  email_templates: Record<string, unknown>
  footer_text: string | null
  privacy_policy_url: string | null
  terms_of_service_url: string | null
  created_at: string
  updated_at: string
}

export interface ClientPortalInvitation {
  id: string
  company_id: string
  job_id: string
  email: string
  client_name: string | null
  role: string
  status: InvitationStatus
  token: string
  invited_by: string
  accepted_at: string | null
  accepted_by: string | null
  expires_at: string
  message: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ClientApproval {
  id: string
  company_id: string
  job_id: string
  client_user_id: string
  approval_type: ApprovalType
  reference_id: string
  title: string
  description: string | null
  status: ApprovalStatus
  requested_at: string
  responded_at: string | null
  expires_at: string | null
  signature_data: string | null
  signature_ip: string | null
  signature_hash: string | null
  comments: string | null
  requested_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ClientMessage {
  id: string
  company_id: string
  job_id: string
  sender_user_id: string
  sender_type: MessageSenderType
  subject: string | null
  message_text: string
  thread_id: string | null
  topic: string | null
  category: MessageCategory
  attachments: unknown[]
  is_external_log: boolean
  external_channel: ExternalChannel | null
  read_at: string | null
  status: MessageStatus
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ClientPayment {
  id: string
  company_id: string
  job_id: string
  client_user_id: string | null
  payment_number: string | null
  amount: number
  payment_method: PaymentMethod
  status: PaymentStatus
  reference_number: string | null
  description: string | null
  draw_request_id: string | null
  invoice_id: string | null
  payment_date: string | null
  received_at: string | null
  received_by: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// ── Constants (Module 29) ────────────────────────────────────────────────────

export const APPROVAL_STATUSES: { value: ApprovalStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
]

export const APPROVAL_TYPES: { value: ApprovalType; label: string }[] = [
  { value: 'selection', label: 'Selection' },
  { value: 'change_order', label: 'Change Order' },
  { value: 'draw', label: 'Draw Request' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'schedule', label: 'Schedule' },
]

export const MESSAGE_STATUSES: { value: MessageStatus; label: string }[] = [
  { value: 'sent', label: 'Sent' },
  { value: 'read', label: 'Read' },
  { value: 'archived', label: 'Archived' },
]

export const MESSAGE_SENDER_TYPES: { value: MessageSenderType; label: string }[] = [
  { value: 'client', label: 'Client' },
  { value: 'builder_team', label: 'Builder Team' },
]

export const MESSAGE_CATEGORIES: { value: MessageCategory; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'selections', label: 'Selections' },
  { value: 'change_orders', label: 'Change Orders' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'budget', label: 'Budget' },
  { value: 'warranty', label: 'Warranty' },
  { value: 'other', label: 'Other' },
]

export const EXTERNAL_CHANNELS: { value: ExternalChannel; label: string }[] = [
  { value: 'phone', label: 'Phone' },
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
]

export const INVITATION_STATUSES: { value: InvitationStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'expired', label: 'Expired' },
  { value: 'revoked', label: 'Revoked' },
]

export const PAYMENT_STATUSES: { value: PaymentStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
]

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'ach', label: 'ACH Transfer' },
  { value: 'check', label: 'Check' },
  { value: 'wire', label: 'Wire Transfer' },
  { value: 'other', label: 'Other' },
]
