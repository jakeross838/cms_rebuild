/**
 * Module 45: API & Marketplace Validation Schemas
 */

import { z } from 'zod'

// -- Enums ────────────────────────────────────────────────────────────────────

export const apiKeyStatusEnum = z.enum(['active', 'revoked', 'expired'])

export const webhookStatusEnum = z.enum(['active', 'paused', 'disabled', 'failing'])

export const deliveryStatusEnum = z.enum(['pending', 'delivered', 'failed', 'retrying'])

export const integrationCategoryEnum = z.enum([
  'accounting', 'scheduling', 'communication', 'storage', 'payment',
  'analytics', 'field_ops', 'design', 'other',
])

export const integrationStatusEnum = z.enum([
  'draft', 'pending_review', 'published', 'rejected', 'archived',
])

export const pricingTypeEnum = z.enum(['free', 'paid', 'freemium', 'contact'])

export const installStatusEnum = z.enum(['installed', 'active', 'paused', 'uninstalled'])

// -- API Keys ─────────────────────────────────────────────────────────────────

export const listApiKeysSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: apiKeyStatusEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createApiKeySchema = z.object({
  name: z.string().trim().min(1).max(200),
  permissions: z.array(z.string().trim().min(1).max(100)).optional().default([]),
  rate_limit_per_minute: z.number().int().min(1).max(10000).optional().default(60),
  expires_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
})

export const updateApiKeySchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  permissions: z.array(z.string().trim().min(1).max(100)).optional(),
  rate_limit_per_minute: z.number().int().min(1).max(10000).optional(),
  status: apiKeyStatusEnum.optional(),
})

// -- Webhooks ─────────────────────────────────────────────────────────────────

export const listWebhooksSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: webhookStatusEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createWebhookSchema = z.object({
  url: z.string().trim().url().max(2000),
  events: z.array(z.string().trim().min(1).max(100)).min(1),
  description: z.string().trim().max(5000).nullable().optional(),
  status: webhookStatusEnum.optional().default('active'),
  max_retries: z.number().int().min(0).max(20).optional().default(5),
})

export const updateWebhookSchema = z.object({
  url: z.string().trim().url().max(2000).optional(),
  events: z.array(z.string().trim().min(1).max(100)).min(1).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  status: webhookStatusEnum.optional(),
  max_retries: z.number().int().min(0).max(20).optional(),
})

// -- Webhook Deliveries ──────────────────────────────────────────────────────

export const listWebhookDeliveriesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: deliveryStatusEnum.optional(),
  event_type: z.string().trim().min(1).max(100).optional(),
})

// -- Integration Listings ────────────────────────────────────────────────────

export const listIntegrationListingsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: integrationCategoryEnum.optional(),
  status: integrationStatusEnum.optional(),
  is_featured: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val,
    z.boolean().optional()
  ),
  q: z.string().trim().min(1).max(200).optional(),
})

// -- Integration Installs ────────────────────────────────────────────────────

export const listIntegrationInstallsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  listing_id: z.string().uuid().optional(),
  status: installStatusEnum.optional(),
})

export const createIntegrationInstallSchema = z.object({
  listing_id: z.string().uuid(),
  configuration: z.record(z.string(), z.unknown()).optional().default({}),
})

export const updateIntegrationInstallSchema = z.object({
  status: installStatusEnum.optional(),
  configuration: z.record(z.string(), z.unknown()).optional(),
})
