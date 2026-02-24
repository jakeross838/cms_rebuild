/**
 * Module 27: RFI Management Types
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type RfiStatus =
  | 'draft'
  | 'open'
  | 'pending_response'
  | 'answered'
  | 'closed'
  | 'voided'

export type RfiPriority =
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent'

export type RfiCategory =
  | 'design'
  | 'structural'
  | 'mechanical'
  | 'electrical'
  | 'plumbing'
  | 'site'
  | 'finish'
  | 'general'

export type RoutingStatus =
  | 'pending'
  | 'viewed'
  | 'responded'
  | 'forwarded'

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface Rfi {
  id: string
  company_id: string
  job_id: string
  rfi_number: string
  subject: string
  question: string
  status: RfiStatus
  priority: RfiPriority
  category: RfiCategory
  assigned_to: string | null
  due_date: string | null
  cost_impact: number
  schedule_impact_days: number
  related_document_id: string | null
  created_by: string | null
  answered_at: string | null
  closed_at: string | null
  closed_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface RfiResponse {
  id: string
  rfi_id: string
  company_id: string
  response_text: string
  responded_by: string | null
  attachments: unknown[]
  is_official: boolean
  created_at: string
  updated_at: string
}

export interface RfiRouting {
  id: string
  rfi_id: string
  company_id: string
  routed_to: string | null
  routed_by: string | null
  routed_at: string
  status: RoutingStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface RfiTemplate {
  id: string
  company_id: string
  name: string
  category: RfiCategory
  subject_template: string | null
  question_template: string | null
  default_priority: RfiPriority
  is_active: boolean
  created_at: string
  updated_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const RFI_STATUSES: { value: RfiStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open' },
  { value: 'pending_response', label: 'Pending Response' },
  { value: 'answered', label: 'Answered' },
  { value: 'closed', label: 'Closed' },
  { value: 'voided', label: 'Voided' },
]

export const RFI_PRIORITIES: { value: RfiPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export const RFI_CATEGORIES: { value: RfiCategory; label: string }[] = [
  { value: 'design', label: 'Design' },
  { value: 'structural', label: 'Structural' },
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'site', label: 'Site' },
  { value: 'finish', label: 'Finish' },
  { value: 'general', label: 'General' },
]

export const ROUTING_STATUSES: { value: RoutingStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'responded', label: 'Responded' },
  { value: 'forwarded', label: 'Forwarded' },
]
