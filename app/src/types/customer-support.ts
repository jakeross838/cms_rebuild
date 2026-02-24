/**
 * Module 46: Customer Support Types
 */

// -- Enums ────────────────────────────────────────────────────────────────────

export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_on_customer'
  | 'waiting_on_agent'
  | 'resolved'
  | 'closed'

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'

export type TicketCategory =
  | 'general'
  | 'billing'
  | 'technical'
  | 'feature_request'
  | 'bug_report'
  | 'onboarding'
  | 'integration'
  | 'other'

export type TicketChannel = 'web' | 'email' | 'chat' | 'phone'

export type SenderType = 'customer' | 'agent' | 'system'

export type ArticleStatus = 'draft' | 'published' | 'archived'

export type FeatureRequestStatus =
  | 'submitted'
  | 'under_review'
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'declined'

// -- Interfaces ───────────────────────────────────────────────────────────────

export interface SupportTicket {
  id: string
  company_id: string
  user_id: string | null
  ticket_number: string
  subject: string
  description: string | null
  status: TicketStatus
  priority: TicketPriority
  category: TicketCategory
  channel: TicketChannel
  assigned_agent_id: string | null
  tags: string[]
  first_response_at: string | null
  resolved_at: string | null
  closed_at: string | null
  satisfaction_rating: number | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface TicketMessage {
  id: string
  company_id: string
  ticket_id: string
  sender_type: SenderType
  sender_id: string | null
  message_text: string
  attachments: unknown[]
  is_internal: boolean
  created_at: string
  updated_at: string
}

export interface KbArticle {
  id: string
  company_id: string | null
  title: string
  slug: string
  content: string | null
  category: string | null
  tags: string[]
  status: ArticleStatus
  view_count: number
  helpful_count: number
  not_helpful_count: number
  author_id: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface FeatureRequest {
  id: string
  company_id: string
  user_id: string | null
  title: string
  description: string | null
  status: FeatureRequestStatus
  priority: TicketPriority
  category: TicketCategory
  vote_count: number
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface FeatureRequestVote {
  id: string
  company_id: string
  feature_request_id: string
  user_id: string
  created_at: string
}

// -- Constants ────────────────────────────────────────────────────────────────

export const TICKET_STATUSES: { value: TicketStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting_on_customer', label: 'Waiting on Customer' },
  { value: 'waiting_on_agent', label: 'Waiting on Agent' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

export const TICKET_PRIORITIES: { value: TicketPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export const TICKET_CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'billing', label: 'Billing' },
  { value: 'technical', label: 'Technical' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'integration', label: 'Integration' },
  { value: 'other', label: 'Other' },
]

export const TICKET_CHANNELS: { value: TicketChannel; label: string }[] = [
  { value: 'web', label: 'Web' },
  { value: 'email', label: 'Email' },
  { value: 'chat', label: 'Chat' },
  { value: 'phone', label: 'Phone' },
]

export const SENDER_TYPES: { value: SenderType; label: string }[] = [
  { value: 'customer', label: 'Customer' },
  { value: 'agent', label: 'Agent' },
  { value: 'system', label: 'System' },
]

export const ARTICLE_STATUSES: { value: ArticleStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

export const FEATURE_REQUEST_STATUSES: { value: FeatureRequestStatus; label: string }[] = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'declined', label: 'Declined' },
]
