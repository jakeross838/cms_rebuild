/**
 * Module 36: Lead Pipeline & CRM Types
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal_sent'
  | 'negotiating'
  | 'won'
  | 'lost'
  | 'on_hold'

export type LeadSource =
  | 'referral'
  | 'website'
  | 'social_media'
  | 'advertising'
  | 'trade_show'
  | 'cold_call'
  | 'partner'
  | 'other'

export type ActivityType =
  | 'call'
  | 'email'
  | 'meeting'
  | 'note'
  | 'site_visit'
  | 'proposal'
  | 'follow_up'

export type LeadPriority =
  | 'low'
  | 'normal'
  | 'high'
  | 'hot'

export type StageType =
  | 'lead'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'closed'

export type PreconstructionType = 'design_build' | 'plan_bid_build'

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface Lead {
  id: string
  company_id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  address: string | null
  lot_address: string | null
  source: string
  source_detail: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  project_type: string | null
  budget_range_low: number | null
  budget_range_high: number | null
  timeline: string | null
  lot_status: string | null
  financing_status: string | null
  preconstruction_type: PreconstructionType | null
  status: LeadStatus
  priority: LeadPriority
  pipeline_id: string | null
  stage_id: string | null
  score: number
  assigned_to: string | null
  expected_contract_value: number
  probability_pct: number
  lost_reason: string | null
  lost_competitor: string | null
  won_project_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface LeadActivity {
  id: string
  company_id: string
  lead_id: string
  activity_type: ActivityType
  subject: string | null
  description: string | null
  performed_by: string | null
  activity_date: string
  duration_minutes: number | null
  created_at: string
  updated_at: string
}

export interface LeadSourceRecord {
  id: string
  company_id: string
  name: string
  description: string | null
  source_type: LeadSource
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Pipeline {
  id: string
  company_id: string
  name: string
  description: string | null
  is_default: boolean
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface PipelineStage {
  id: string
  company_id: string
  pipeline_id: string
  name: string
  stage_type: StageType
  sequence_order: number
  probability_default: number
  color: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'on_hold', label: 'On Hold' },
]

export const LEAD_SOURCES: { value: LeadSource; label: string }[] = [
  { value: 'referral', label: 'Referral' },
  { value: 'website', label: 'Website' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'trade_show', label: 'Trade Show' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'partner', label: 'Partner' },
  { value: 'other', label: 'Other' },
]

export const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'note', label: 'Note' },
  { value: 'site_visit', label: 'Site Visit' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'follow_up', label: 'Follow Up' },
]

export const LEAD_PRIORITIES: { value: LeadPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'hot', label: 'Hot' },
]

export const STAGE_TYPES: { value: StageType; label: string }[] = [
  { value: 'lead', label: 'Lead' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed', label: 'Closed' },
]

export const PRECONSTRUCTION_TYPES: { value: PreconstructionType; label: string }[] = [
  { value: 'design_build', label: 'Design-Build' },
  { value: 'plan_bid_build', label: 'Plan-Bid-Build' },
]
