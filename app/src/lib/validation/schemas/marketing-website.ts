/**
 * Module 50: Marketing Website & Sales Pipeline Validation Schemas
 */

import { z } from 'zod'

// -- Enums ────────────────────────────────────────────────────────────────────

export const leadSourceEnum = z.enum([
  'website_trial', 'demo_request', 'contact_form', 'referral',
])

export const pipelineStageEnum = z.enum([
  'captured', 'qualified', 'demo_scheduled', 'demo_completed',
  'proposal_sent', 'negotiation', 'closed_won', 'closed_lost',
])

export const referralStatusEnum = z.enum([
  'link_created', 'clicked', 'signed_up', 'converted',
])

export const blogCategoryEnum = z.enum([
  'industry', 'product', 'how_to', 'customer_spotlight',
])

export const closedReasonEnum = z.enum([
  'won', 'lost_price', 'lost_features', 'lost_competitor', 'lost_timing',
])

// -- Marketing Leads ──────────────────────────────────────────────────────────

export const listMarketingLeadsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  source: leadSourceEnum.optional(),
  pipeline_stage: pipelineStageEnum.optional(),
  assigned_to: z.string().uuid().optional(),
  closed_reason: closedReasonEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createMarketingLeadSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().email().max(255),
  source: leadSourceEnum.optional().default('contact_form'),
  utm_source: z.string().trim().max(255).nullable().optional(),
  utm_medium: z.string().trim().max(255).nullable().optional(),
  utm_campaign: z.string().trim().max(255).nullable().optional(),
  company_name: z.string().trim().max(255).nullable().optional(),
  phone: z.string().trim().max(50).nullable().optional(),
  company_size: z.string().trim().max(50).nullable().optional(),
  current_tools: z.string().trim().max(5000).nullable().optional(),
  pipeline_stage: pipelineStageEnum.optional().default('captured'),
  assigned_to: z.string().uuid().nullable().optional(),
  deal_value: z.number().min(0).max(99999999.99).optional().default(0),
  close_probability: z.number().int().min(0).max(100).optional().default(0),
  competitor_name: z.string().trim().max(255).nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
  crm_id: z.string().trim().max(100).nullable().optional(),
})

export const updateMarketingLeadSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  email: z.string().trim().email().max(255).optional(),
  source: leadSourceEnum.optional(),
  utm_source: z.string().trim().max(255).nullable().optional(),
  utm_medium: z.string().trim().max(255).nullable().optional(),
  utm_campaign: z.string().trim().max(255).nullable().optional(),
  company_name: z.string().trim().max(255).nullable().optional(),
  phone: z.string().trim().max(50).nullable().optional(),
  company_size: z.string().trim().max(50).nullable().optional(),
  current_tools: z.string().trim().max(5000).nullable().optional(),
  pipeline_stage: pipelineStageEnum.optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  deal_value: z.number().min(0).max(99999999.99).optional(),
  close_probability: z.number().int().min(0).max(100).optional(),
  closed_at: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  closed_reason: closedReasonEnum.nullable().optional(),
  competitor_name: z.string().trim().max(255).nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
  crm_id: z.string().trim().max(100).nullable().optional(),
})

// -- Marketing Referrals ──────────────────────────────────────────────────────

export const listMarketingReferralsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: referralStatusEnum.optional(),
  credit_applied: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val,
    z.boolean().optional()
  ),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createMarketingReferralSchema = z.object({
  referral_code: z.string().trim().min(1).max(20),
  referred_email: z.string().trim().email().max(255),
  referred_company_name: z.string().trim().max(255).nullable().optional(),
  status: referralStatusEnum.optional().default('link_created'),
  referrer_credit: z.number().min(0).max(99999999.99).optional().default(0),
  notes: z.string().trim().max(10000).nullable().optional(),
})

export const updateMarketingReferralSchema = z.object({
  referred_email: z.string().trim().email().max(255).optional(),
  referred_company_name: z.string().trim().max(255).nullable().optional(),
  referred_company_id: z.string().uuid().nullable().optional(),
  status: referralStatusEnum.optional(),
  referrer_credit: z.number().min(0).max(99999999.99).optional(),
  credit_applied: z.boolean().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
})

// -- Testimonials ─────────────────────────────────────────────────────────────

export const listTestimonialsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  is_approved: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val,
    z.boolean().optional()
  ),
  is_featured: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val,
    z.boolean().optional()
  ),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createTestimonialSchema = z.object({
  contact_name: z.string().trim().min(1).max(200),
  contact_title: z.string().trim().max(200).nullable().optional(),
  company_display_name: z.string().trim().max(255).nullable().optional(),
  quote_text: z.string().trim().min(1).max(10000),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  video_url: z.string().trim().url().max(500).nullable().optional(),
  photo_url: z.string().trim().url().max(500).nullable().optional(),
  is_approved: z.boolean().optional().default(false),
  is_featured: z.boolean().optional().default(false),
  display_on: z.array(z.string().trim().min(1).max(100)).optional().default([]),
  collected_at: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
})

export const updateTestimonialSchema = z.object({
  contact_name: z.string().trim().min(1).max(200).optional(),
  contact_title: z.string().trim().max(200).nullable().optional(),
  company_display_name: z.string().trim().max(255).nullable().optional(),
  quote_text: z.string().trim().min(1).max(10000).optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  video_url: z.string().trim().url().max(500).nullable().optional(),
  photo_url: z.string().trim().url().max(500).nullable().optional(),
  is_approved: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  display_on: z.array(z.string().trim().min(1).max(100)).optional(),
})

// -- Case Studies ─────────────────────────────────────────────────────────────

export const listCaseStudiesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  is_published: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val,
    z.boolean().optional()
  ),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createCaseStudySchema = z.object({
  title: z.string().trim().min(1).max(255),
  slug: z.string().trim().min(1).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be a valid URL slug (lowercase alphanumeric with hyphens)'),
  company_name: z.string().trim().max(255).nullable().optional(),
  company_size: z.string().trim().max(50).nullable().optional(),
  challenge: z.string().trim().max(50000).nullable().optional(),
  solution: z.string().trim().max(50000).nullable().optional(),
  results: z.string().trim().max(50000).nullable().optional(),
  metrics: z.record(z.string(), z.unknown()).optional().default({}),
  quote_text: z.string().trim().max(5000).nullable().optional(),
  quote_author: z.string().trim().max(200).nullable().optional(),
  photos: z.array(z.string().trim().max(500)).optional().default([]),
  industry_tags: z.array(z.string().trim().min(1).max(100)).optional().default([]),
  region_tags: z.array(z.string().trim().min(1).max(100)).optional().default([]),
  is_published: z.boolean().optional().default(false),
})

export const updateCaseStudySchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  slug: z.string().trim().min(1).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be a valid URL slug').optional(),
  company_name: z.string().trim().max(255).nullable().optional(),
  company_size: z.string().trim().max(50).nullable().optional(),
  challenge: z.string().trim().max(50000).nullable().optional(),
  solution: z.string().trim().max(50000).nullable().optional(),
  results: z.string().trim().max(50000).nullable().optional(),
  metrics: z.record(z.string(), z.unknown()).optional(),
  quote_text: z.string().trim().max(5000).nullable().optional(),
  quote_author: z.string().trim().max(200).nullable().optional(),
  photos: z.array(z.string().trim().max(500)).optional(),
  industry_tags: z.array(z.string().trim().min(1).max(100)).optional(),
  region_tags: z.array(z.string().trim().min(1).max(100)).optional(),
  is_published: z.boolean().optional(),
})

// -- Blog Posts ───────────────────────────────────────────────────────────────

export const listBlogPostsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: blogCategoryEnum.optional(),
  is_published: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val,
    z.boolean().optional()
  ),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createBlogPostSchema = z.object({
  title: z.string().trim().min(1).max(255),
  slug: z.string().trim().min(1).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be a valid URL slug (lowercase alphanumeric with hyphens)'),
  excerpt: z.string().trim().max(5000).nullable().optional(),
  body_html: z.string().trim().max(500000).nullable().optional(),
  author_name: z.string().trim().max(200).nullable().optional(),
  category: blogCategoryEnum.optional().default('industry'),
  tags: z.array(z.string().trim().min(1).max(100)).optional().default([]),
  featured_image: z.string().trim().url().max(500).nullable().optional(),
  meta_title: z.string().trim().max(200).nullable().optional(),
  meta_description: z.string().trim().max(500).nullable().optional(),
  is_published: z.boolean().optional().default(false),
})

export const updateBlogPostSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  slug: z.string().trim().min(1).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be a valid URL slug').optional(),
  excerpt: z.string().trim().max(5000).nullable().optional(),
  body_html: z.string().trim().max(500000).nullable().optional(),
  author_name: z.string().trim().max(200).nullable().optional(),
  category: blogCategoryEnum.optional(),
  tags: z.array(z.string().trim().min(1).max(100)).optional(),
  featured_image: z.string().trim().url().max(500).nullable().optional(),
  meta_title: z.string().trim().max(200).nullable().optional(),
  meta_description: z.string().trim().max(500).nullable().optional(),
  is_published: z.boolean().optional(),
})
