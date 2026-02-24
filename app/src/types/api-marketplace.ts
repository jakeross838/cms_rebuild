/**
 * Module 45: API & Marketplace Types
 */

// -- Enums ────────────────────────────────────────────────────────────────────

export type ApiKeyStatus = 'active' | 'revoked' | 'expired'

export type WebhookStatus = 'active' | 'paused' | 'disabled' | 'failing'

export type DeliveryStatus = 'pending' | 'delivered' | 'failed' | 'retrying'

export type IntegrationCategory =
  | 'accounting'
  | 'scheduling'
  | 'communication'
  | 'storage'
  | 'payment'
  | 'analytics'
  | 'field_ops'
  | 'design'
  | 'other'

export type IntegrationStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'rejected'
  | 'archived'

export type PricingType = 'free' | 'paid' | 'freemium' | 'contact'

export type InstallStatus = 'installed' | 'active' | 'paused' | 'uninstalled'

// -- Interfaces ───────────────────────────────────────────────────────────────

export interface ApiKey {
  id: string
  company_id: string
  name: string
  key_prefix: string
  key_hash: string
  permissions: string[]
  status: ApiKeyStatus
  rate_limit_per_minute: number
  last_used_at: string | null
  expires_at: string | null
  revoked_at: string | null
  revoked_by: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface WebhookSubscription {
  id: string
  company_id: string
  url: string
  events: string[]
  status: WebhookStatus
  secret: string
  description: string | null
  retry_count: number
  max_retries: number
  failure_count: number
  last_triggered_at: string | null
  last_success_at: string | null
  last_failure_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface WebhookDelivery {
  id: string
  company_id: string
  subscription_id: string
  event_type: string
  payload: Record<string, unknown>
  status: DeliveryStatus
  response_status_code: number | null
  response_body: string | null
  attempt_count: number
  next_retry_at: string | null
  delivered_at: string | null
  created_at: string
}

export interface IntegrationListing {
  id: string
  name: string
  slug: string
  description: string | null
  long_description: string | null
  logo_url: string | null
  screenshots: string[]
  category: IntegrationCategory
  developer_name: string | null
  developer_url: string | null
  documentation_url: string | null
  support_url: string | null
  pricing_type: PricingType
  price_monthly: number
  install_count: number
  avg_rating: number
  review_count: number
  status: IntegrationStatus
  is_featured: boolean
  required_plan_tier: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface IntegrationInstall {
  id: string
  company_id: string
  listing_id: string
  status: InstallStatus
  configuration: Record<string, unknown>
  installed_by: string | null
  installed_at: string
  uninstalled_at: string | null
  uninstalled_by: string | null
  created_at: string
  updated_at: string
}

// -- Constants ────────────────────────────────────────────────────────────────

export const API_KEY_STATUSES: { value: ApiKeyStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'revoked', label: 'Revoked' },
  { value: 'expired', label: 'Expired' },
]

export const WEBHOOK_STATUSES: { value: WebhookStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'disabled', label: 'Disabled' },
  { value: 'failing', label: 'Failing' },
]

export const DELIVERY_STATUSES: { value: DeliveryStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'failed', label: 'Failed' },
  { value: 'retrying', label: 'Retrying' },
]

export const INTEGRATION_CATEGORIES: { value: IntegrationCategory; label: string }[] = [
  { value: 'accounting', label: 'Accounting' },
  { value: 'scheduling', label: 'Scheduling' },
  { value: 'communication', label: 'Communication' },
  { value: 'storage', label: 'Storage' },
  { value: 'payment', label: 'Payment' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'field_ops', label: 'Field Operations' },
  { value: 'design', label: 'Design' },
  { value: 'other', label: 'Other' },
]

export const INTEGRATION_STATUSES: { value: IntegrationStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'published', label: 'Published' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'archived', label: 'Archived' },
]

export const PRICING_TYPES: { value: PricingType; label: string }[] = [
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'contact', label: 'Contact for Pricing' },
]

export const INSTALL_STATUSES: { value: InstallStatus; label: string }[] = [
  { value: 'installed', label: 'Installed' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'uninstalled', label: 'Uninstalled' },
]
