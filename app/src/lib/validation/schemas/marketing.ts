/**
 * Module 37: Marketing & Portfolio Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const projectShowcaseStatusEnum = z.enum([
  'draft', 'published', 'featured', 'archived',
])

export const photoTypeEnum = z.enum([
  'exterior', 'interior', 'before', 'after', 'progress', 'detail',
])

export const reviewStatusEnum = z.enum([
  'pending', 'approved', 'published', 'rejected',
])

export const reviewSourceEnum = z.enum([
  'google', 'houzz', 'facebook', 'yelp', 'bbb', 'angi', 'platform',
])

export const campaignStatusEnum = z.enum([
  'draft', 'active', 'paused', 'completed', 'cancelled',
])

export const campaignTypeEnum = z.enum([
  'email', 'social', 'print', 'referral', 'event', 'other',
])

export const contactStatusEnum = z.enum([
  'pending', 'sent', 'opened', 'clicked', 'converted', 'unsubscribed',
])

// ── Portfolio Projects ────────────────────────────────────────────────────

export const listPortfolioProjectsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: projectShowcaseStatusEnum.optional(),
  category: z.string().trim().min(1).max(100).optional(),
  style: z.string().trim().min(1).max(100).optional(),
  is_featured: z.preprocess(
    (v) => (v === 'true' ? true : v === 'false' ? false : v),
    z.boolean().optional()
  ),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createPortfolioProjectSchema = z.object({
  job_id: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(1).max(255),
  slug: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  highlights: z.array(z.unknown()).optional().default([]),
  category: z.string().trim().max(100).nullable().optional(),
  style: z.string().trim().max(100).nullable().optional(),
  status: projectShowcaseStatusEnum.optional().default('draft'),
  is_featured: z.boolean().optional().default(false),
  display_order: z.number().int().min(0).optional().default(0),
  cover_photo_url: z.string().trim().max(2000).nullable().optional(),
  square_footage: z.number().int().positive().nullable().optional(),
  bedrooms: z.number().int().min(0).nullable().optional(),
  bathrooms: z.number().min(0).nullable().optional(),
  build_duration_days: z.number().int().positive().nullable().optional(),
  completion_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  location: z.string().trim().max(200).nullable().optional(),
  custom_features: z.array(z.unknown()).optional().default([]),
  seo_title: z.string().trim().max(255).nullable().optional(),
  seo_description: z.string().trim().max(1000).nullable().optional(),
})

export const updatePortfolioProjectSchema = z.object({
  job_id: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(1).max(255).optional(),
  slug: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  highlights: z.array(z.unknown()).optional(),
  category: z.string().trim().max(100).nullable().optional(),
  style: z.string().trim().max(100).nullable().optional(),
  status: projectShowcaseStatusEnum.optional(),
  is_featured: z.boolean().optional(),
  display_order: z.number().int().min(0).optional(),
  cover_photo_url: z.string().trim().max(2000).nullable().optional(),
  square_footage: z.number().int().positive().nullable().optional(),
  bedrooms: z.number().int().min(0).nullable().optional(),
  bathrooms: z.number().min(0).nullable().optional(),
  build_duration_days: z.number().int().positive().nullable().optional(),
  completion_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  location: z.string().trim().max(200).nullable().optional(),
  custom_features: z.array(z.unknown()).optional(),
  seo_title: z.string().trim().max(255).nullable().optional(),
  seo_description: z.string().trim().max(1000).nullable().optional(),
})

// ── Portfolio Photos ──────────────────────────────────────────────────────

export const listPortfolioPhotosSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  photo_type: photoTypeEnum.optional(),
})

export const createPortfolioPhotoSchema = z.object({
  photo_url: z.string().trim().min(1).max(2000),
  caption: z.string().trim().max(500).nullable().optional(),
  photo_type: photoTypeEnum.optional().default('exterior'),
  room: z.string().trim().max(100).nullable().optional(),
  display_order: z.number().int().min(0).optional().default(0),
  is_cover: z.boolean().optional().default(false),
})

export const updatePortfolioPhotoSchema = z.object({
  photo_url: z.string().trim().min(1).max(2000).optional(),
  caption: z.string().trim().max(500).nullable().optional(),
  photo_type: photoTypeEnum.optional(),
  room: z.string().trim().max(100).nullable().optional(),
  display_order: z.number().int().min(0).optional(),
  is_cover: z.boolean().optional(),
})

// ── Client Reviews ────────────────────────────────────────────────────────

export const listClientReviewsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: reviewStatusEnum.optional(),
  source: reviewSourceEnum.optional(),
  job_id: z.string().uuid().optional(),
  is_featured: z.preprocess(
    (v) => (v === 'true' ? true : v === 'false' ? false : v),
    z.boolean().optional()
  ),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createClientReviewSchema = z.object({
  job_id: z.string().uuid().nullable().optional(),
  client_name: z.string().trim().min(1).max(200),
  client_email: z.string().email().max(255).nullable().optional(),
  rating: z.number().int().min(1).max(5).optional().default(5),
  review_text: z.string().trim().max(10000).nullable().optional(),
  source: reviewSourceEnum.optional().default('platform'),
  status: reviewStatusEnum.optional().default('pending'),
  display_name: z.string().trim().max(200).nullable().optional(),
  is_featured: z.boolean().optional().default(false),
  response_text: z.string().trim().max(5000).nullable().optional(),
})

export const updateClientReviewSchema = z.object({
  job_id: z.string().uuid().nullable().optional(),
  client_name: z.string().trim().min(1).max(200).optional(),
  client_email: z.string().email().max(255).nullable().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  review_text: z.string().trim().max(10000).nullable().optional(),
  source: reviewSourceEnum.optional(),
  status: reviewStatusEnum.optional(),
  display_name: z.string().trim().max(200).nullable().optional(),
  is_featured: z.boolean().optional(),
  response_text: z.string().trim().max(5000).nullable().optional(),
})

// ── Marketing Campaigns ───────────────────────────────────────────────────

export const listMarketingCampaignsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: campaignStatusEnum.optional(),
  campaign_type: campaignTypeEnum.optional(),
  channel: z.string().trim().min(1).max(100).optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createMarketingCampaignSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(10000).nullable().optional(),
  campaign_type: campaignTypeEnum.optional().default('other'),
  status: campaignStatusEnum.optional().default('draft'),
  channel: z.string().trim().max(100).nullable().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  budget: z.number().min(0).optional().default(0),
  actual_spend: z.number().min(0).optional().default(0),
  utm_source: z.string().trim().max(100).nullable().optional(),
  utm_medium: z.string().trim().max(100).nullable().optional(),
  utm_campaign: z.string().trim().max(100).nullable().optional(),
  leads_generated: z.number().int().min(0).optional().default(0),
  proposals_sent: z.number().int().min(0).optional().default(0),
  contracts_won: z.number().int().min(0).optional().default(0),
  contract_value_won: z.number().min(0).optional().default(0),
  target_audience: z.string().trim().max(5000).nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
})

export const updateMarketingCampaignSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  campaign_type: campaignTypeEnum.optional(),
  status: campaignStatusEnum.optional(),
  channel: z.string().trim().max(100).nullable().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  budget: z.number().min(0).optional(),
  actual_spend: z.number().min(0).optional(),
  utm_source: z.string().trim().max(100).nullable().optional(),
  utm_medium: z.string().trim().max(100).nullable().optional(),
  utm_campaign: z.string().trim().max(100).nullable().optional(),
  leads_generated: z.number().int().min(0).optional(),
  proposals_sent: z.number().int().min(0).optional(),
  contracts_won: z.number().int().min(0).optional(),
  contract_value_won: z.number().min(0).optional(),
  roi_pct: z.number().nullable().optional(),
  target_audience: z.string().trim().max(5000).nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
})

// ── Campaign Contacts ─────────────────────────────────────────────────────

export const listCampaignContactsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  status: contactStatusEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createCampaignContactSchema = z.object({
  contact_name: z.string().trim().min(1).max(200),
  contact_email: z.string().email().max(255).nullable().optional(),
  contact_phone: z.string().trim().max(50).nullable().optional(),
  status: contactStatusEnum.optional().default('pending'),
  lead_id: z.string().uuid().nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

export const updateCampaignContactSchema = z.object({
  contact_name: z.string().trim().min(1).max(200).optional(),
  contact_email: z.string().email().max(255).nullable().optional(),
  contact_phone: z.string().trim().max(50).nullable().optional(),
  status: contactStatusEnum.optional(),
  lead_id: z.string().uuid().nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})
