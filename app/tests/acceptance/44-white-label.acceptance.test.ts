/**
 * Module 44 — White-Label & Branding Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 44 spec.
 */

import { describe, test, expect } from 'vitest'

// -- Types ────────────────────────────────────────────────────────────────────

import type {
  HeaderStyle,
  DomainStatus,
  SslStatus,
  TerminologyContext,
  ContentPageType,
  BuilderBranding,
  BuilderCustomDomain,
  BuilderEmailConfig,
  BuilderTerminology,
  BuilderContentPage,
} from '@/types/white-label'

import {
  HEADER_STYLES,
  DOMAIN_STATUSES,
  SSL_STATUSES,
  TERMINOLOGY_CONTEXTS,
  CONTENT_PAGE_TYPES,
} from '@/types/white-label'

// -- Schemas ──────────────────────────────────────────────────────────────────

import {
  headerStyleEnum,
  domainStatusEnum,
  sslStatusEnum,
  terminologyContextEnum,
  contentPageTypeEnum,
  updateBrandingSchema,
  listDomainsSchema,
  createDomainSchema,
  updateDomainSchema,
  updateEmailConfigSchema,
  listTerminologySchema,
  createTerminologySchema,
  updateTerminologySchema,
  listContentPagesSchema,
  createContentPageSchema,
  updateContentPageSchema,
} from '@/lib/validation/schemas/white-label'

// ============================================================================
// Type System
// ============================================================================

describe('Module 44 — White-Label & Branding Types', () => {
  test('HeaderStyle has 4 values', () => {
    const styles: HeaderStyle[] = ['light', 'dark', 'gradient', 'custom']
    expect(styles).toHaveLength(4)
  })

  test('DomainStatus has 5 values', () => {
    const statuses: DomainStatus[] = ['pending', 'verifying', 'active', 'failed', 'expired']
    expect(statuses).toHaveLength(5)
  })

  test('SslStatus has 4 values', () => {
    const statuses: SslStatus[] = ['pending', 'issued', 'expired', 'failed']
    expect(statuses).toHaveLength(4)
  })

  test('TerminologyContext has 5 values', () => {
    const contexts: TerminologyContext[] = ['navigation', 'reports', 'forms', 'notifications', 'global']
    expect(contexts).toHaveLength(5)
  })

  test('ContentPageType has 7 values', () => {
    const types: ContentPageType[] = ['welcome', 'terms', 'privacy', 'help', 'faq', 'about', 'custom']
    expect(types).toHaveLength(7)
  })

  test('BuilderBranding interface has all required fields', () => {
    const branding: BuilderBranding = {
      id: '1', company_id: '1',
      logo_url: null, logo_dark_url: null, favicon_url: null,
      primary_color: '#2563eb', secondary_color: '#1e40af', accent_color: '#f59e0b',
      font_family: 'Inter', header_style: 'light',
      login_background_url: null, login_message: null,
      powered_by_visible: true, custom_css: null, metadata: {},
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(branding.primary_color).toBe('#2563eb')
    expect(branding.powered_by_visible).toBe(true)
  })

  test('BuilderCustomDomain interface has all required fields', () => {
    const domain: BuilderCustomDomain = {
      id: '1', company_id: '1',
      domain: 'portal.mybuilder.com', subdomain: null,
      status: 'pending', ssl_status: 'pending',
      verification_token: 'abc123', verified_at: null,
      ssl_issued_at: null, ssl_expires_at: null,
      is_primary: false,
      created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(domain.domain).toBe('portal.mybuilder.com')
    expect(domain.status).toBe('pending')
  })

  test('BuilderEmailConfig interface has all required fields', () => {
    const config: BuilderEmailConfig = {
      id: '1', company_id: '1',
      from_name: 'Acme Builders', from_email: 'noreply@acmebuilders.com',
      reply_to_email: 'support@acmebuilders.com',
      email_header_html: null, email_footer_html: null, email_signature: null,
      use_custom_smtp: false,
      smtp_host: null, smtp_port: null, smtp_username: null,
      smtp_encrypted_password: null,
      is_verified: false, verified_at: null,
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(config.from_name).toBe('Acme Builders')
    expect(config.use_custom_smtp).toBe(false)
  })

  test('BuilderTerminology interface has all required fields', () => {
    const term: BuilderTerminology = {
      id: '1', company_id: '1',
      default_term: 'Job', custom_term: 'Project',
      context: 'global', is_active: true,
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(term.default_term).toBe('Job')
    expect(term.custom_term).toBe('Project')
  })

  test('BuilderContentPage interface has all required fields', () => {
    const page: BuilderContentPage = {
      id: '1', company_id: '1',
      page_type: 'welcome', title: 'Welcome', slug: 'welcome',
      content_html: '<h1>Welcome</h1>',
      is_published: true, published_at: '2026-01-15',
      sort_order: 0, created_by: '1',
      created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(page.title).toBe('Welcome')
    expect(page.is_published).toBe(true)
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 44 — White-Label & Branding Constants', () => {
  test('HEADER_STYLES has 4 entries with value and label', () => {
    expect(HEADER_STYLES).toHaveLength(4)
    HEADER_STYLES.forEach(s => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  test('HEADER_STYLES includes all expected values', () => {
    const values = HEADER_STYLES.map(s => s.value)
    expect(values).toContain('light')
    expect(values).toContain('dark')
    expect(values).toContain('gradient')
    expect(values).toContain('custom')
  })

  test('DOMAIN_STATUSES has 5 entries with value and label', () => {
    expect(DOMAIN_STATUSES).toHaveLength(5)
    DOMAIN_STATUSES.forEach(s => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  test('DOMAIN_STATUSES includes all expected values', () => {
    const values = DOMAIN_STATUSES.map(s => s.value)
    expect(values).toContain('pending')
    expect(values).toContain('verifying')
    expect(values).toContain('active')
    expect(values).toContain('failed')
    expect(values).toContain('expired')
  })

  test('SSL_STATUSES has 4 entries with value and label', () => {
    expect(SSL_STATUSES).toHaveLength(4)
    SSL_STATUSES.forEach(s => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  test('SSL_STATUSES includes all expected values', () => {
    const values = SSL_STATUSES.map(s => s.value)
    expect(values).toContain('pending')
    expect(values).toContain('issued')
    expect(values).toContain('expired')
    expect(values).toContain('failed')
  })

  test('TERMINOLOGY_CONTEXTS has 5 entries with value and label', () => {
    expect(TERMINOLOGY_CONTEXTS).toHaveLength(5)
    TERMINOLOGY_CONTEXTS.forEach(s => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  test('TERMINOLOGY_CONTEXTS includes all expected values', () => {
    const values = TERMINOLOGY_CONTEXTS.map(s => s.value)
    expect(values).toContain('navigation')
    expect(values).toContain('reports')
    expect(values).toContain('forms')
    expect(values).toContain('notifications')
    expect(values).toContain('global')
  })

  test('CONTENT_PAGE_TYPES has 7 entries with value and label', () => {
    expect(CONTENT_PAGE_TYPES).toHaveLength(7)
    CONTENT_PAGE_TYPES.forEach(s => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  test('CONTENT_PAGE_TYPES includes all expected values', () => {
    const values = CONTENT_PAGE_TYPES.map(s => s.value)
    expect(values).toContain('welcome')
    expect(values).toContain('terms')
    expect(values).toContain('privacy')
    expect(values).toContain('help')
    expect(values).toContain('faq')
    expect(values).toContain('about')
    expect(values).toContain('custom')
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 44 — White-Label & Branding Enum Schemas', () => {
  test('headerStyleEnum accepts all 4 styles', () => {
    const styles = ['light', 'dark', 'gradient', 'custom']
    styles.forEach(s => expect(headerStyleEnum.safeParse(s).success).toBe(true))
  })

  test('headerStyleEnum rejects invalid style', () => {
    expect(headerStyleEnum.safeParse('minimal').success).toBe(false)
  })

  test('domainStatusEnum accepts all 5 statuses', () => {
    const statuses = ['pending', 'verifying', 'active', 'failed', 'expired']
    statuses.forEach(s => expect(domainStatusEnum.safeParse(s).success).toBe(true))
  })

  test('domainStatusEnum rejects invalid status', () => {
    expect(domainStatusEnum.safeParse('suspended').success).toBe(false)
  })

  test('sslStatusEnum accepts all 4 statuses', () => {
    const statuses = ['pending', 'issued', 'expired', 'failed']
    statuses.forEach(s => expect(sslStatusEnum.safeParse(s).success).toBe(true))
  })

  test('sslStatusEnum rejects invalid status', () => {
    expect(sslStatusEnum.safeParse('revoked').success).toBe(false)
  })

  test('terminologyContextEnum accepts all 5 contexts', () => {
    const contexts = ['navigation', 'reports', 'forms', 'notifications', 'global']
    contexts.forEach(c => expect(terminologyContextEnum.safeParse(c).success).toBe(true))
  })

  test('terminologyContextEnum rejects invalid context', () => {
    expect(terminologyContextEnum.safeParse('dashboard').success).toBe(false)
  })

  test('contentPageTypeEnum accepts all 7 types', () => {
    const types = ['welcome', 'terms', 'privacy', 'help', 'faq', 'about', 'custom']
    types.forEach(t => expect(contentPageTypeEnum.safeParse(t).success).toBe(true))
  })

  test('contentPageTypeEnum rejects invalid type', () => {
    expect(contentPageTypeEnum.safeParse('blog').success).toBe(false)
  })
})

// ============================================================================
// Branding Schemas
// ============================================================================

describe('Module 44 — Branding Schemas', () => {
  test('updateBrandingSchema accepts valid branding', () => {
    const result = updateBrandingSchema.safeParse({
      primary_color: '#ff0000',
      font_family: 'Roboto',
    })
    expect(result.success).toBe(true)
  })

  test('updateBrandingSchema accepts empty object', () => {
    const result = updateBrandingSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  test('updateBrandingSchema validates hex color format', () => {
    const result = updateBrandingSchema.safeParse({
      primary_color: 'red',
    })
    expect(result.success).toBe(false)
  })

  test('updateBrandingSchema accepts valid hex colors', () => {
    const result = updateBrandingSchema.safeParse({
      primary_color: '#2563eb',
      secondary_color: '#1e40af',
      accent_color: '#f59e0b',
    })
    expect(result.success).toBe(true)
  })

  test('updateBrandingSchema rejects invalid hex color (no hash)', () => {
    const result = updateBrandingSchema.safeParse({
      primary_color: '2563eb',
    })
    expect(result.success).toBe(false)
  })

  test('updateBrandingSchema rejects invalid hex color (3 digits)', () => {
    const result = updateBrandingSchema.safeParse({
      primary_color: '#abc',
    })
    expect(result.success).toBe(false)
  })

  test('updateBrandingSchema accepts null logo_url', () => {
    const result = updateBrandingSchema.safeParse({
      logo_url: null,
    })
    expect(result.success).toBe(true)
  })

  test('updateBrandingSchema accepts header_style enum', () => {
    const result = updateBrandingSchema.safeParse({
      header_style: 'gradient',
    })
    expect(result.success).toBe(true)
  })

  test('updateBrandingSchema rejects invalid header_style', () => {
    const result = updateBrandingSchema.safeParse({
      header_style: 'minimal',
    })
    expect(result.success).toBe(false)
  })

  test('updateBrandingSchema accepts powered_by_visible boolean', () => {
    const result = updateBrandingSchema.safeParse({
      powered_by_visible: false,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.powered_by_visible).toBe(false)
    }
  })

  test('updateBrandingSchema accepts metadata object', () => {
    const result = updateBrandingSchema.safeParse({
      metadata: { theme: 'custom', version: 2 },
    })
    expect(result.success).toBe(true)
  })

  test('updateBrandingSchema accepts null custom_css', () => {
    const result = updateBrandingSchema.safeParse({
      custom_css: null,
    })
    expect(result.success).toBe(true)
  })

  test('updateBrandingSchema accepts all fields together', () => {
    const result = updateBrandingSchema.safeParse({
      logo_url: 'https://example.com/logo.png',
      logo_dark_url: 'https://example.com/logo-dark.png',
      favicon_url: 'https://example.com/favicon.ico',
      primary_color: '#2563eb',
      secondary_color: '#1e40af',
      accent_color: '#f59e0b',
      font_family: 'Inter',
      header_style: 'dark',
      login_background_url: 'https://example.com/bg.jpg',
      login_message: 'Welcome to our portal',
      powered_by_visible: false,
      custom_css: 'body { color: red; }',
      metadata: { key: 'value' },
    })
    expect(result.success).toBe(true)
  })
})

// ============================================================================
// Domain Schemas
// ============================================================================

describe('Module 44 — Domain Schemas', () => {
  test('listDomainsSchema accepts valid params', () => {
    const result = listDomainsSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  test('listDomainsSchema rejects limit > 100', () => {
    const result = listDomainsSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  test('listDomainsSchema accepts status filter', () => {
    const result = listDomainsSchema.safeParse({ status: 'active' })
    expect(result.success).toBe(true)
  })

  test('listDomainsSchema rejects invalid status', () => {
    const result = listDomainsSchema.safeParse({ status: 'suspended' })
    expect(result.success).toBe(false)
  })

  test('createDomainSchema accepts valid domain', () => {
    const result = createDomainSchema.safeParse({
      domain: 'portal.mybuilder.com',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.is_primary).toBe(false)
    }
  })

  test('createDomainSchema requires domain', () => {
    const result = createDomainSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  test('createDomainSchema rejects domain > 255 chars', () => {
    const result = createDomainSchema.safeParse({
      domain: 'a'.repeat(256),
    })
    expect(result.success).toBe(false)
  })

  test('createDomainSchema accepts subdomain and is_primary', () => {
    const result = createDomainSchema.safeParse({
      domain: 'portal.mybuilder.com',
      subdomain: 'portal',
      is_primary: true,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.is_primary).toBe(true)
      expect(result.data.subdomain).toBe('portal')
    }
  })

  test('updateDomainSchema accepts partial updates', () => {
    const result = updateDomainSchema.safeParse({
      status: 'active',
    })
    expect(result.success).toBe(true)
  })

  test('updateDomainSchema accepts ssl_status', () => {
    const result = updateDomainSchema.safeParse({
      ssl_status: 'issued',
    })
    expect(result.success).toBe(true)
  })

  test('updateDomainSchema rejects invalid ssl_status', () => {
    const result = updateDomainSchema.safeParse({
      ssl_status: 'revoked',
    })
    expect(result.success).toBe(false)
  })

  test('updateDomainSchema accepts is_primary toggle', () => {
    const result = updateDomainSchema.safeParse({
      is_primary: true,
    })
    expect(result.success).toBe(true)
  })
})

// ============================================================================
// Email Config Schemas
// ============================================================================

describe('Module 44 — Email Config Schemas', () => {
  test('updateEmailConfigSchema accepts valid email config', () => {
    const result = updateEmailConfigSchema.safeParse({
      from_name: 'Acme Builders',
      from_email: 'noreply@acmebuilders.com',
    })
    expect(result.success).toBe(true)
  })

  test('updateEmailConfigSchema accepts empty object', () => {
    const result = updateEmailConfigSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  test('updateEmailConfigSchema validates email format', () => {
    const result = updateEmailConfigSchema.safeParse({
      from_email: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })

  test('updateEmailConfigSchema validates reply_to_email format', () => {
    const result = updateEmailConfigSchema.safeParse({
      reply_to_email: 'invalid',
    })
    expect(result.success).toBe(false)
  })

  test('updateEmailConfigSchema accepts null from_name', () => {
    const result = updateEmailConfigSchema.safeParse({
      from_name: null,
    })
    expect(result.success).toBe(true)
  })

  test('updateEmailConfigSchema rejects from_name > 200 chars', () => {
    const result = updateEmailConfigSchema.safeParse({
      from_name: 'a'.repeat(201),
    })
    expect(result.success).toBe(false)
  })

  test('updateEmailConfigSchema accepts smtp settings', () => {
    const result = updateEmailConfigSchema.safeParse({
      use_custom_smtp: true,
      smtp_host: 'smtp.example.com',
      smtp_port: 587,
      smtp_username: 'user@example.com',
      smtp_encrypted_password: 'encrypted_password_here',
    })
    expect(result.success).toBe(true)
  })

  test('updateEmailConfigSchema validates smtp_port range', () => {
    const result = updateEmailConfigSchema.safeParse({
      smtp_port: 0,
    })
    expect(result.success).toBe(false)
  })

  test('updateEmailConfigSchema rejects smtp_port > 65535', () => {
    const result = updateEmailConfigSchema.safeParse({
      smtp_port: 65536,
    })
    expect(result.success).toBe(false)
  })

  test('updateEmailConfigSchema accepts null smtp fields', () => {
    const result = updateEmailConfigSchema.safeParse({
      smtp_host: null,
      smtp_port: null,
      smtp_username: null,
      smtp_encrypted_password: null,
    })
    expect(result.success).toBe(true)
  })

  test('updateEmailConfigSchema accepts email_header_html and email_footer_html', () => {
    const result = updateEmailConfigSchema.safeParse({
      email_header_html: '<div>Header</div>',
      email_footer_html: '<div>Footer</div>',
      email_signature: 'Best regards, Acme Builders',
    })
    expect(result.success).toBe(true)
  })
})

// ============================================================================
// Terminology Schemas
// ============================================================================

describe('Module 44 — Terminology Schemas', () => {
  test('listTerminologySchema accepts valid params', () => {
    const result = listTerminologySchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(50)
    }
  })

  test('listTerminologySchema rejects limit > 100', () => {
    const result = listTerminologySchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  test('listTerminologySchema accepts context filter', () => {
    const result = listTerminologySchema.safeParse({ context: 'navigation' })
    expect(result.success).toBe(true)
  })

  test('listTerminologySchema rejects invalid context', () => {
    const result = listTerminologySchema.safeParse({ context: 'dashboard' })
    expect(result.success).toBe(false)
  })

  test('listTerminologySchema accepts is_active filter with boolean preprocess', () => {
    const result = listTerminologySchema.safeParse({ is_active: 'true' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.is_active).toBe(true)
    }
  })

  test('createTerminologySchema accepts valid terminology', () => {
    const result = createTerminologySchema.safeParse({
      default_term: 'Job',
      custom_term: 'Project',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.context).toBe('global')
      expect(result.data.is_active).toBe(true)
    }
  })

  test('createTerminologySchema requires default_term and custom_term', () => {
    const result = createTerminologySchema.safeParse({})
    expect(result.success).toBe(false)
  })

  test('createTerminologySchema rejects default_term > 100 chars', () => {
    const result = createTerminologySchema.safeParse({
      default_term: 'a'.repeat(101),
      custom_term: 'Project',
    })
    expect(result.success).toBe(false)
  })

  test('createTerminologySchema rejects custom_term > 100 chars', () => {
    const result = createTerminologySchema.safeParse({
      default_term: 'Job',
      custom_term: 'a'.repeat(101),
    })
    expect(result.success).toBe(false)
  })

  test('createTerminologySchema accepts context and is_active', () => {
    const result = createTerminologySchema.safeParse({
      default_term: 'Job',
      custom_term: 'Project',
      context: 'navigation',
      is_active: false,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.context).toBe('navigation')
      expect(result.data.is_active).toBe(false)
    }
  })

  test('updateTerminologySchema accepts partial updates', () => {
    const result = updateTerminologySchema.safeParse({
      custom_term: 'Project',
    })
    expect(result.success).toBe(true)
  })

  test('updateTerminologySchema accepts is_active toggle', () => {
    const result = updateTerminologySchema.safeParse({
      is_active: false,
    })
    expect(result.success).toBe(true)
  })

  test('updateTerminologySchema accepts context change', () => {
    const result = updateTerminologySchema.safeParse({
      context: 'reports',
    })
    expect(result.success).toBe(true)
  })

  test('updateTerminologySchema rejects invalid context', () => {
    const result = updateTerminologySchema.safeParse({
      context: 'dashboard',
    })
    expect(result.success).toBe(false)
  })
})

// ============================================================================
// Content Page Schemas
// ============================================================================

describe('Module 44 — Content Page Schemas', () => {
  test('listContentPagesSchema accepts valid params', () => {
    const result = listContentPagesSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  test('listContentPagesSchema rejects limit > 100', () => {
    const result = listContentPagesSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  test('listContentPagesSchema accepts page_type filter', () => {
    const result = listContentPagesSchema.safeParse({ page_type: 'welcome' })
    expect(result.success).toBe(true)
  })

  test('listContentPagesSchema rejects invalid page_type', () => {
    const result = listContentPagesSchema.safeParse({ page_type: 'blog' })
    expect(result.success).toBe(false)
  })

  test('listContentPagesSchema accepts is_published filter with boolean preprocess', () => {
    const result = listContentPagesSchema.safeParse({ is_published: 'true' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.is_published).toBe(true)
    }
  })

  test('createContentPageSchema accepts valid page', () => {
    const result = createContentPageSchema.safeParse({
      title: 'Welcome',
      slug: 'welcome',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page_type).toBe('custom')
      expect(result.data.is_published).toBe(false)
      expect(result.data.sort_order).toBe(0)
    }
  })

  test('createContentPageSchema requires title and slug', () => {
    const result = createContentPageSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  test('createContentPageSchema rejects title > 255 chars', () => {
    const result = createContentPageSchema.safeParse({
      title: 'a'.repeat(256),
      slug: 'valid-slug',
    })
    expect(result.success).toBe(false)
  })

  test('createContentPageSchema rejects slug > 200 chars', () => {
    const result = createContentPageSchema.safeParse({
      title: 'Valid Title',
      slug: 'a'.repeat(201),
    })
    expect(result.success).toBe(false)
  })

  test('createContentPageSchema validates slug format (lowercase with hyphens)', () => {
    const result = createContentPageSchema.safeParse({
      title: 'Valid Title',
      slug: 'valid-slug-123',
    })
    expect(result.success).toBe(true)
  })

  test('createContentPageSchema rejects slug with uppercase', () => {
    const result = createContentPageSchema.safeParse({
      title: 'Valid Title',
      slug: 'Invalid-Slug',
    })
    expect(result.success).toBe(false)
  })

  test('createContentPageSchema rejects slug with spaces', () => {
    const result = createContentPageSchema.safeParse({
      title: 'Valid Title',
      slug: 'invalid slug',
    })
    expect(result.success).toBe(false)
  })

  test('createContentPageSchema rejects slug with special chars', () => {
    const result = createContentPageSchema.safeParse({
      title: 'Valid Title',
      slug: 'invalid_slug!',
    })
    expect(result.success).toBe(false)
  })

  test('createContentPageSchema accepts all optional fields', () => {
    const result = createContentPageSchema.safeParse({
      page_type: 'terms',
      title: 'Terms of Service',
      slug: 'terms-of-service',
      content_html: '<h1>Terms</h1><p>These are our terms.</p>',
      is_published: true,
      sort_order: 5,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page_type).toBe('terms')
      expect(result.data.is_published).toBe(true)
      expect(result.data.sort_order).toBe(5)
    }
  })

  test('createContentPageSchema accepts null content_html', () => {
    const result = createContentPageSchema.safeParse({
      title: 'Empty Page',
      slug: 'empty-page',
      content_html: null,
    })
    expect(result.success).toBe(true)
  })

  test('updateContentPageSchema accepts partial updates', () => {
    const result = updateContentPageSchema.safeParse({
      title: 'Updated Title',
    })
    expect(result.success).toBe(true)
  })

  test('updateContentPageSchema accepts is_published toggle', () => {
    const result = updateContentPageSchema.safeParse({
      is_published: true,
    })
    expect(result.success).toBe(true)
  })

  test('updateContentPageSchema validates slug format', () => {
    const result = updateContentPageSchema.safeParse({
      slug: 'valid-slug',
    })
    expect(result.success).toBe(true)
  })

  test('updateContentPageSchema rejects invalid slug format', () => {
    const result = updateContentPageSchema.safeParse({
      slug: 'Invalid Slug',
    })
    expect(result.success).toBe(false)
  })

  test('updateContentPageSchema accepts sort_order', () => {
    const result = updateContentPageSchema.safeParse({
      sort_order: 10,
    })
    expect(result.success).toBe(true)
  })

  test('updateContentPageSchema rejects negative sort_order', () => {
    const result = updateContentPageSchema.safeParse({
      sort_order: -1,
    })
    expect(result.success).toBe(false)
  })

  test('updateContentPageSchema accepts page_type change', () => {
    const result = updateContentPageSchema.safeParse({
      page_type: 'faq',
    })
    expect(result.success).toBe(true)
  })

  test('updateContentPageSchema rejects invalid page_type', () => {
    const result = updateContentPageSchema.safeParse({
      page_type: 'blog',
    })
    expect(result.success).toBe(false)
  })
})
