/**
 * Module 44: White-Label & Branding Validation Schemas
 */

import { z } from 'zod'

// -- Enums ────────────────────────────────────────────────────────────────────

export const headerStyleEnum = z.enum(['light', 'dark', 'gradient', 'custom'])

export const domainStatusEnum = z.enum(['pending', 'verifying', 'active', 'failed', 'expired'])

export const sslStatusEnum = z.enum(['pending', 'issued', 'expired', 'failed'])

export const terminologyContextEnum = z.enum(['navigation', 'reports', 'forms', 'notifications', 'global'])

export const contentPageTypeEnum = z.enum(['welcome', 'terms', 'privacy', 'help', 'faq', 'about', 'custom'])

// -- Hex color regex ──────────────────────────────────────────────────────────

const hexColorRegex = /^#[0-9a-fA-F]{6}$/

// -- Branding ─────────────────────────────────────────────────────────────────

export const updateBrandingSchema = z.object({
  logo_url: z.string().url().max(500).nullable().optional(),
  logo_dark_url: z.string().url().max(500).nullable().optional(),
  favicon_url: z.string().url().max(500).nullable().optional(),
  primary_color: z.string().regex(hexColorRegex, 'Must be a valid hex color (e.g. #2563eb)').optional(),
  secondary_color: z.string().regex(hexColorRegex, 'Must be a valid hex color (e.g. #1e40af)').optional(),
  accent_color: z.string().regex(hexColorRegex, 'Must be a valid hex color (e.g. #f59e0b)').optional(),
  font_family: z.string().trim().min(1).max(100).optional(),
  header_style: headerStyleEnum.optional(),
  login_background_url: z.string().url().max(500).nullable().optional(),
  login_message: z.string().trim().max(5000).nullable().optional(),
  powered_by_visible: z.boolean().optional(),
  custom_css: z.string().max(50000).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

// -- Custom Domains ───────────────────────────────────────────────────────────

export const listDomainsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: domainStatusEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createDomainSchema = z.object({
  domain: z.string().trim().min(1).max(255),
  subdomain: z.string().trim().max(100).nullable().optional(),
  is_primary: z.boolean().optional().default(false),
})

export const updateDomainSchema = z.object({
  domain: z.string().trim().min(1).max(255).optional(),
  subdomain: z.string().trim().max(100).nullable().optional(),
  status: domainStatusEnum.optional(),
  ssl_status: sslStatusEnum.optional(),
  is_primary: z.boolean().optional(),
  verification_token: z.string().trim().max(255).nullable().optional(),
})

// -- Email Config ─────────────────────────────────────────────────────────────

export const updateEmailConfigSchema = z.object({
  from_name: z.string().trim().max(200).nullable().optional(),
  from_email: z.string().trim().email().max(255).nullable().optional(),
  reply_to_email: z.string().trim().email().max(255).nullable().optional(),
  email_header_html: z.string().max(50000).nullable().optional(),
  email_footer_html: z.string().max(50000).nullable().optional(),
  email_signature: z.string().max(10000).nullable().optional(),
  use_custom_smtp: z.boolean().optional(),
  smtp_host: z.string().trim().max(255).nullable().optional(),
  smtp_port: z.number().int().min(1).max(65535).nullable().optional(),
  smtp_username: z.string().trim().max(255).nullable().optional(),
  smtp_encrypted_password: z.string().max(500).nullable().optional(),
})

// -- Terminology ──────────────────────────────────────────────────────────────

export const listTerminologySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  context: terminologyContextEnum.optional(),
  is_active: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val,
    z.boolean().optional()
  ),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createTerminologySchema = z.object({
  default_term: z.string().trim().min(1).max(100),
  custom_term: z.string().trim().min(1).max(100),
  context: terminologyContextEnum.optional().default('global'),
  is_active: z.boolean().optional().default(true),
})

export const updateTerminologySchema = z.object({
  default_term: z.string().trim().min(1).max(100).optional(),
  custom_term: z.string().trim().min(1).max(100).optional(),
  context: terminologyContextEnum.optional(),
  is_active: z.boolean().optional(),
})

// -- Content Pages ────────────────────────────────────────────────────────────

export const listContentPagesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  page_type: contentPageTypeEnum.optional(),
  is_published: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val,
    z.boolean().optional()
  ),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createContentPageSchema = z.object({
  page_type: contentPageTypeEnum.optional().default('custom'),
  title: z.string().trim().min(1).max(255),
  slug: z.string().trim().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  content_html: z.string().max(500000).nullable().optional(),
  is_published: z.boolean().optional().default(false),
  sort_order: z.number().int().min(0).optional().default(0),
})

export const updateContentPageSchema = z.object({
  page_type: contentPageTypeEnum.optional(),
  title: z.string().trim().min(1).max(255).optional(),
  slug: z.string().trim().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens').optional(),
  content_html: z.string().max(500000).nullable().optional(),
  is_published: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
})
