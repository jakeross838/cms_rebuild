/**
 * Module 48: Template Marketplace Validation Schemas
 */

import { z } from 'zod'

// -- Enums ────────────────────────────────────────────────────────────────────

export const publisherTypeEnum = z.enum(['builder', 'consultant', 'platform'])

export const templateTypeEnum = z.enum([
  'estimate', 'schedule', 'checklist', 'contract', 'report',
  'workflow', 'cost_code', 'selection', 'specification',
])

export const reviewStatusEnum = z.enum(['pending', 'approved', 'rejected'])

// -- Publishers ──────────────────────────────────────────────────────────────

export const listPublishersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  publisher_type: publisherTypeEnum.optional(),
  is_verified: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val,
    z.boolean().optional()
  ),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createPublisherSchema = z.object({
  user_id: z.string().uuid(),
  publisher_type: publisherTypeEnum.optional().default('builder'),
  display_name: z.string().trim().min(1).max(200),
  bio: z.string().trim().max(5000).nullable().optional(),
  credentials: z.string().trim().max(2000).nullable().optional(),
  website_url: z.string().trim().max(500).nullable().optional(),
  profile_image: z.string().trim().max(500).nullable().optional(),
})

export const updatePublisherSchema = z.object({
  publisher_type: publisherTypeEnum.optional(),
  display_name: z.string().trim().min(1).max(200).optional(),
  bio: z.string().trim().max(5000).nullable().optional(),
  credentials: z.string().trim().max(2000).nullable().optional(),
  website_url: z.string().trim().max(500).nullable().optional(),
  profile_image: z.string().trim().max(500).nullable().optional(),
  is_verified: z.boolean().optional(),
  revenue_share_pct: z.number().min(0).max(100).optional(),
})

// -- Templates ───────────────────────────────────────────────────────────────

export const listTemplatesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  template_type: templateTypeEnum.optional(),
  publisher_id: z.string().uuid().optional(),
  review_status: reviewStatusEnum.optional(),
  is_featured: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val,
    z.boolean().optional()
  ),
  is_free: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val,
    z.boolean().optional()
  ),
  min_rating: z.coerce.number().min(0).max(5).optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createTemplateSchema = z.object({
  publisher_id: z.string().uuid(),
  publisher_type: publisherTypeEnum.optional().default('builder'),
  template_type: templateTypeEnum,
  name: z.string().trim().min(1).max(255),
  slug: z.string().trim().min(1).max(255).regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must be lowercase alphanumeric with hyphens'
  ),
  description: z.string().trim().max(1000).nullable().optional(),
  long_description: z.string().trim().max(50000).nullable().optional(),
  screenshots: z.array(z.string().trim().max(500)).optional().default([]),
  tags: z.array(z.string().trim().min(1).max(100)).optional().default([]),
  region_tags: z.array(z.string().trim().min(1).max(100)).optional().default([]),
  construction_tags: z.array(z.string().trim().min(1).max(100)).optional().default([]),
  price: z.number().min(0).max(99999999.99).optional().default(0),
  currency: z.string().trim().min(1).max(10).optional().default('USD'),
  template_data: z.record(z.string(), z.unknown()).optional().default({}),
  required_modules: z.array(z.string().trim().min(1).max(100)).optional().default([]),
  version: z.string().trim().min(1).max(20).optional().default('1.0.0'),
  review_status: reviewStatusEnum.optional().default('pending'),
  is_featured: z.boolean().optional().default(false),
  is_active: z.boolean().optional().default(true),
})

export const updateTemplateSchema = z.object({
  template_type: templateTypeEnum.optional(),
  name: z.string().trim().min(1).max(255).optional(),
  slug: z.string().trim().min(1).max(255).regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must be lowercase alphanumeric with hyphens'
  ).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  long_description: z.string().trim().max(50000).nullable().optional(),
  screenshots: z.array(z.string().trim().max(500)).optional(),
  tags: z.array(z.string().trim().min(1).max(100)).optional(),
  region_tags: z.array(z.string().trim().min(1).max(100)).optional(),
  construction_tags: z.array(z.string().trim().min(1).max(100)).optional(),
  price: z.number().min(0).max(99999999.99).optional(),
  currency: z.string().trim().min(1).max(10).optional(),
  template_data: z.record(z.string(), z.unknown()).optional(),
  required_modules: z.array(z.string().trim().min(1).max(100)).optional(),
  version: z.string().trim().min(1).max(20).optional(),
  review_status: reviewStatusEnum.optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
})

// -- Template Versions ───────────────────────────────────────────────────────

export const listTemplateVersionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export const createTemplateVersionSchema = z.object({
  version: z.string().trim().min(1).max(20),
  changelog: z.string().trim().max(10000).nullable().optional(),
  template_data: z.record(z.string(), z.unknown()).optional().default({}),
})

// -- Installs ────────────────────────────────────────────────────────────────

export const listInstallsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  template_id: z.string().uuid().optional(),
  template_type: templateTypeEnum.optional(),
})

export const createInstallSchema = z.object({
  template_id: z.string().uuid(),
  template_version: z.string().trim().min(1).max(20),
  payment_id: z.string().uuid().nullable().optional(),
  payment_amount: z.number().min(0).max(99999999.99).nullable().optional(),
})

// -- Reviews ─────────────────────────────────────────────────────────────────

export const listReviewsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  template_id: z.string().uuid().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  is_verified_purchase: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val,
    z.boolean().optional()
  ),
})

export const createReviewSchema = z.object({
  template_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(200).nullable().optional(),
  review_text: z.string().trim().max(5000).nullable().optional(),
  is_verified_purchase: z.boolean().optional().default(true),
})

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().trim().max(200).nullable().optional(),
  review_text: z.string().trim().max(5000).nullable().optional(),
  is_flagged: z.boolean().optional(),
  publisher_response: z.string().trim().max(5000).nullable().optional(),
})
