/**
 * Module 37: Marketing & Portfolio Types
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type ProjectShowcaseStatus = 'draft' | 'published' | 'featured' | 'archived'

export type PhotoType = 'exterior' | 'interior' | 'before' | 'after' | 'progress' | 'detail'

export type ReviewStatus = 'pending' | 'approved' | 'published' | 'rejected'

export type ReviewSource = 'google' | 'houzz' | 'facebook' | 'yelp' | 'bbb' | 'angi' | 'platform'

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'

export type CampaignType = 'email' | 'social' | 'print' | 'referral' | 'event' | 'other'

export type ContactStatus = 'pending' | 'sent' | 'opened' | 'clicked' | 'converted' | 'unsubscribed'

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface PortfolioProject {
  id: string
  company_id: string
  job_id: string | null
  title: string
  slug: string | null
  description: string | null
  highlights: unknown[]
  category: string | null
  style: string | null
  status: ProjectShowcaseStatus
  is_featured: boolean
  display_order: number
  cover_photo_url: string | null
  square_footage: number | null
  bedrooms: number | null
  bathrooms: number | null
  build_duration_days: number | null
  completion_date: string | null
  location: string | null
  custom_features: unknown[]
  seo_title: string | null
  seo_description: string | null
  published_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface PortfolioPhoto {
  id: string
  portfolio_project_id: string
  company_id: string
  photo_url: string
  caption: string | null
  photo_type: PhotoType
  room: string | null
  display_order: number
  is_cover: boolean
  uploaded_by: string | null
  created_at: string
  updated_at: string
}

export interface ClientReview {
  id: string
  company_id: string
  job_id: string | null
  client_name: string
  client_email: string | null
  rating: number
  review_text: string | null
  source: ReviewSource
  status: ReviewStatus
  display_name: string | null
  is_featured: boolean
  published_at: string | null
  approved_by: string | null
  approved_at: string | null
  requested_at: string | null
  submitted_at: string | null
  response_text: string | null
  response_by: string | null
  response_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface MarketingCampaign {
  id: string
  company_id: string
  name: string
  description: string | null
  campaign_type: CampaignType
  status: CampaignStatus
  channel: string | null
  start_date: string | null
  end_date: string | null
  budget: number
  actual_spend: number
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  leads_generated: number
  proposals_sent: number
  contracts_won: number
  contract_value_won: number
  roi_pct: number | null
  target_audience: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CampaignContact {
  id: string
  campaign_id: string
  company_id: string
  contact_name: string
  contact_email: string | null
  contact_phone: string | null
  status: ContactStatus
  sent_at: string | null
  opened_at: string | null
  clicked_at: string | null
  converted_at: string | null
  lead_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const PROJECT_SHOWCASE_STATUSES: { value: ProjectShowcaseStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'featured', label: 'Featured' },
  { value: 'archived', label: 'Archived' },
]

export const PHOTO_TYPES: { value: PhotoType; label: string }[] = [
  { value: 'exterior', label: 'Exterior' },
  { value: 'interior', label: 'Interior' },
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
  { value: 'progress', label: 'Progress' },
  { value: 'detail', label: 'Detail' },
]

export const REVIEW_STATUSES: { value: ReviewStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'published', label: 'Published' },
  { value: 'rejected', label: 'Rejected' },
]

export const REVIEW_SOURCES: { value: ReviewSource; label: string }[] = [
  { value: 'google', label: 'Google' },
  { value: 'houzz', label: 'Houzz' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'yelp', label: 'Yelp' },
  { value: 'bbb', label: 'BBB' },
  { value: 'angi', label: 'Angi' },
  { value: 'platform', label: 'Platform' },
]

export const CAMPAIGN_STATUSES: { value: CampaignStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const CAMPAIGN_TYPES: { value: CampaignType; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'social', label: 'Social Media' },
  { value: 'print', label: 'Print' },
  { value: 'referral', label: 'Referral' },
  { value: 'event', label: 'Event' },
  { value: 'other', label: 'Other' },
]

export const CONTACT_STATUSES: { value: ContactStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'sent', label: 'Sent' },
  { value: 'opened', label: 'Opened' },
  { value: 'clicked', label: 'Clicked' },
  { value: 'converted', label: 'Converted' },
  { value: 'unsubscribed', label: 'Unsubscribed' },
]
