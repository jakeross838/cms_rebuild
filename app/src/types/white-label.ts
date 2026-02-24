/**
 * Module 44: White-Label & Branding Types
 */

// -- Enums ────────────────────────────────────────────────────────────────────

export type HeaderStyle = 'light' | 'dark' | 'gradient' | 'custom'

export type DomainStatus =
  | 'pending'
  | 'verifying'
  | 'active'
  | 'failed'
  | 'expired'

export type SslStatus =
  | 'pending'
  | 'issued'
  | 'expired'
  | 'failed'

export type TerminologyContext =
  | 'navigation'
  | 'reports'
  | 'forms'
  | 'notifications'
  | 'global'

export type ContentPageType =
  | 'welcome'
  | 'terms'
  | 'privacy'
  | 'help'
  | 'faq'
  | 'about'
  | 'custom'

// -- Interfaces ───────────────────────────────────────────────────────────────

export interface BuilderBranding {
  id: string
  company_id: string
  logo_url: string | null
  logo_dark_url: string | null
  favicon_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  font_family: string
  header_style: HeaderStyle
  login_background_url: string | null
  login_message: string | null
  powered_by_visible: boolean
  custom_css: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface BuilderCustomDomain {
  id: string
  company_id: string
  domain: string
  subdomain: string | null
  status: DomainStatus
  ssl_status: SslStatus | null
  verification_token: string | null
  verified_at: string | null
  ssl_issued_at: string | null
  ssl_expires_at: string | null
  is_primary: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface BuilderEmailConfig {
  id: string
  company_id: string
  from_name: string | null
  from_email: string | null
  reply_to_email: string | null
  email_header_html: string | null
  email_footer_html: string | null
  email_signature: string | null
  use_custom_smtp: boolean
  smtp_host: string | null
  smtp_port: number | null
  smtp_username: string | null
  smtp_encrypted_password: string | null
  is_verified: boolean
  verified_at: string | null
  created_at: string
  updated_at: string
}

export interface BuilderTerminology {
  id: string
  company_id: string
  default_term: string
  custom_term: string
  context: TerminologyContext
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BuilderContentPage {
  id: string
  company_id: string
  page_type: ContentPageType
  title: string
  slug: string
  content_html: string | null
  is_published: boolean
  published_at: string | null
  sort_order: number
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// -- Constants ────────────────────────────────────────────────────────────────

export const HEADER_STYLES: { value: HeaderStyle; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'custom', label: 'Custom' },
]

export const DOMAIN_STATUSES: { value: DomainStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'verifying', label: 'Verifying' },
  { value: 'active', label: 'Active' },
  { value: 'failed', label: 'Failed' },
  { value: 'expired', label: 'Expired' },
]

export const SSL_STATUSES: { value: SslStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'issued', label: 'Issued' },
  { value: 'expired', label: 'Expired' },
  { value: 'failed', label: 'Failed' },
]

export const TERMINOLOGY_CONTEXTS: { value: TerminologyContext; label: string }[] = [
  { value: 'navigation', label: 'Navigation' },
  { value: 'reports', label: 'Reports' },
  { value: 'forms', label: 'Forms' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'global', label: 'Global' },
]

export const CONTENT_PAGE_TYPES: { value: ContentPageType; label: string }[] = [
  { value: 'welcome', label: 'Welcome' },
  { value: 'terms', label: 'Terms of Service' },
  { value: 'privacy', label: 'Privacy Policy' },
  { value: 'help', label: 'Help' },
  { value: 'faq', label: 'FAQ' },
  { value: 'about', label: 'About' },
  { value: 'custom', label: 'Custom' },
]
