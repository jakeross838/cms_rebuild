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
