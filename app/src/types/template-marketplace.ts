/**
 * Module 48: Template Marketplace Types
 */

// -- Enums ────────────────────────────────────────────────────────────────────

export type PublisherType = 'builder' | 'consultant' | 'platform'

export type TemplateType =
  | 'estimate'
  | 'schedule'
  | 'checklist'
  | 'contract'
  | 'report'
  | 'workflow'
  | 'cost_code'
  | 'selection'
  | 'specification'

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export type TemplateCategory = TemplateType

// -- Interfaces ───────────────────────────────────────────────────────────────

export interface MarketplacePublisher {
  id: string
  user_id: string
  publisher_type: PublisherType
  display_name: string
  bio: string | null
  credentials: string | null
  website_url: string | null
  profile_image: string | null
  is_verified: boolean
  total_installs: number
  avg_rating: number
  total_templates: number
  revenue_share_pct: number
  stripe_connect_id: string | null
  created_at: string
  updated_at: string
}

export interface MarketplaceTemplate {
  id: string
  publisher_id: string
  publisher_type: PublisherType
  template_type: TemplateType
  name: string
  slug: string
  description: string | null
  long_description: string | null
  screenshots: string[]
  tags: string[]
  region_tags: string[]
  construction_tags: string[]
  price: number
  currency: string
  template_data: Record<string, unknown>
  required_modules: string[]
  version: string
  install_count: number
  avg_rating: number
  review_count: number
  review_status: ReviewStatus
  is_featured: boolean
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface MarketplaceTemplateVersion {
  id: string
  template_id: string
  version: string
  changelog: string | null
  template_data: Record<string, unknown>
  published_at: string
  created_at: string
}

export interface MarketplaceInstall {
  id: string
  company_id: string
  template_id: string
  template_version: string
  installed_by: string
  installed_at: string
  uninstalled_at: string | null
  payment_id: string | null
  payment_amount: number | null
  created_at: string
}

export interface MarketplaceReview {
  id: string
  company_id: string
  template_id: string
  user_id: string
  rating: number
  title: string | null
  review_text: string | null
  publisher_response: string | null
  publisher_responded_at: string | null
  is_verified_purchase: boolean
  is_flagged: boolean
  created_at: string
  updated_at: string
}

// -- Constants ────────────────────────────────────────────────────────────────

export const PUBLISHER_TYPES: { value: PublisherType; label: string }[] = [
  { value: 'builder', label: 'Builder' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'platform', label: 'Platform' },
]

export const TEMPLATE_TYPES: { value: TemplateType; label: string }[] = [
  { value: 'estimate', label: 'Estimate' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'checklist', label: 'Checklist' },
  { value: 'contract', label: 'Contract' },
  { value: 'report', label: 'Report' },
  { value: 'workflow', label: 'Workflow' },
  { value: 'cost_code', label: 'Cost Code' },
  { value: 'selection', label: 'Selection' },
  { value: 'specification', label: 'Specification' },
]

export const REVIEW_STATUSES: { value: ReviewStatus; label: string }[] = [
  { value: 'pending', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export const TEMPLATE_CATEGORIES: { value: TemplateCategory; label: string }[] = TEMPLATE_TYPES
