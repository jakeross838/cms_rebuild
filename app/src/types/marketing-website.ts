/**
 * Module 50: Marketing Website & Sales Pipeline Types
 */

// -- Enums ────────────────────────────────────────────────────────────────────

export type LeadSource =
  | 'website_trial'
  | 'demo_request'
  | 'contact_form'
  | 'referral'

export type PipelineStage =
  | 'captured'
  | 'qualified'
  | 'demo_scheduled'
  | 'demo_completed'
  | 'proposal_sent'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost'

export type ReferralStatus =
  | 'link_created'
  | 'clicked'
  | 'signed_up'
  | 'converted'

export type BlogCategory =
  | 'industry'
  | 'product'
  | 'how_to'
  | 'customer_spotlight'

export type ClosedReason =
  | 'won'
  | 'lost_price'
  | 'lost_features'
  | 'lost_competitor'
  | 'lost_timing'

// -- Interfaces ───────────────────────────────────────────────────────────────

export interface MarketingLead {
  id: string
  source: LeadSource
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  name: string
  email: string
  company_name: string | null
  phone: string | null
  company_size: string | null
  current_tools: string | null
  pipeline_stage: PipelineStage
  assigned_to: string | null
  deal_value: number
  close_probability: number
  closed_at: string | null
  closed_reason: ClosedReason | null
  competitor_name: string | null
  notes: string | null
  crm_id: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface MarketingReferral {
  id: string
  referrer_company_id: string
  referral_code: string
  referred_email: string
  referred_company_name: string | null
  referred_company_id: string | null
  status: ReferralStatus
  referrer_credit: number
  credit_applied: boolean
  clicked_at: string | null
  signed_up_at: string | null
  converted_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Testimonial {
  id: string
  company_id: string
  contact_name: string
  contact_title: string | null
  company_display_name: string | null
  quote_text: string
  rating: number | null
  video_url: string | null
  photo_url: string | null
  is_approved: boolean
  is_featured: boolean
  display_on: string[]
  collected_at: string
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface CaseStudy {
  id: string
  title: string
  slug: string
  company_name: string | null
  company_size: string | null
  challenge: string | null
  solution: string | null
  results: string | null
  metrics: Record<string, unknown>
  quote_text: string | null
  quote_author: string | null
  photos: string[]
  industry_tags: string[]
  region_tags: string[]
  is_published: boolean
  published_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  body_html: string | null
  author_name: string | null
  category: BlogCategory
  tags: string[]
  featured_image: string | null
  meta_title: string | null
  meta_description: string | null
  is_published: boolean
  published_at: string | null
  view_count: number
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// -- Constants ────────────────────────────────────────────────────────────────

export const LEAD_SOURCES: { value: LeadSource; label: string }[] = [
  { value: 'website_trial', label: 'Website Trial' },
  { value: 'demo_request', label: 'Demo Request' },
  { value: 'contact_form', label: 'Contact Form' },
  { value: 'referral', label: 'Referral' },
]

export const PIPELINE_STAGES: { value: PipelineStage; label: string }[] = [
  { value: 'captured', label: 'Captured' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'demo_scheduled', label: 'Demo Scheduled' },
  { value: 'demo_completed', label: 'Demo Completed' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' },
]

export const REFERRAL_STATUSES: { value: ReferralStatus; label: string }[] = [
  { value: 'link_created', label: 'Link Created' },
  { value: 'clicked', label: 'Clicked' },
  { value: 'signed_up', label: 'Signed Up' },
  { value: 'converted', label: 'Converted' },
]

export const BLOG_CATEGORIES: { value: BlogCategory; label: string }[] = [
  { value: 'industry', label: 'Industry' },
  { value: 'product', label: 'Product' },
  { value: 'how_to', label: 'How To' },
  { value: 'customer_spotlight', label: 'Customer Spotlight' },
]

export const CLOSED_REASONS: { value: ClosedReason; label: string }[] = [
  { value: 'won', label: 'Won' },
  { value: 'lost_price', label: 'Lost — Price' },
  { value: 'lost_features', label: 'Lost — Features' },
  { value: 'lost_competitor', label: 'Lost — Competitor' },
  { value: 'lost_timing', label: 'Lost — Timing' },
]
