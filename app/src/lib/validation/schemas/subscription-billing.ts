/**
 * Module 43: Subscription Billing Validation Schemas
 */

import { z } from 'zod'

// -- Enums ────────────────────────────────────────────────────────────────────

export const planTierEnum = z.enum(['free', 'starter', 'professional', 'business', 'enterprise'])

export const addonTypeEnum = z.enum([
  'module', 'storage', 'users', 'api_access', 'support', 'training', 'white_label',
])

export const subscriptionStatusEnum = z.enum([
  'trialing', 'active', 'past_due', 'cancelled', 'suspended', 'expired',
])

export const billingCycleEnum = z.enum(['monthly', 'annual'])

export const billingEventTypeEnum = z.enum([
  'subscription_created', 'subscription_updated', 'subscription_cancelled',
  'payment_succeeded', 'payment_failed',
  'invoice_created', 'invoice_paid',
  'refund', 'credit_applied',
  'trial_started', 'trial_ended',
  'plan_changed', 'addon_added', 'addon_removed',
])

export const meterTypeEnum = z.enum(['storage_gb', 'active_users', 'api_calls', 'ai_processing'])

// -- Subscription Plans ───────────────────────────────────────────────────────

export const listPlansSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  tier: planTierEnum.optional(),
  is_active: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val,
    z.boolean().optional()
  ),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createPlanSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().trim().max(5000).nullable().optional(),
  tier: planTierEnum.optional().default('starter'),
  price_monthly: z.number().min(0).max(99999999.99).optional().default(0),
  price_annual: z.number().min(0).max(99999999.99).optional().default(0),
  max_users: z.number().int().positive().nullable().optional(),
  max_projects: z.number().int().positive().nullable().optional(),
  features: z.record(z.string(), z.unknown()).optional().default({}),
  is_active: z.boolean().optional().default(true),
  sort_order: z.number().int().min(0).optional().default(0),
})

export const updatePlanSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens').optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  tier: planTierEnum.optional(),
  price_monthly: z.number().min(0).max(99999999.99).optional(),
  price_annual: z.number().min(0).max(99999999.99).optional(),
  max_users: z.number().int().positive().nullable().optional(),
  max_projects: z.number().int().positive().nullable().optional(),
  features: z.record(z.string(), z.unknown()).optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
})

// -- Plan Add-ons ─────────────────────────────────────────────────────────────

export const listAddonsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  addon_type: addonTypeEnum.optional(),
  is_active: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val,
    z.boolean().optional()
  ),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createAddonSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().trim().max(5000).nullable().optional(),
  addon_type: addonTypeEnum.optional().default('module'),
  price_monthly: z.number().min(0).max(99999999.99).optional().default(0),
  price_annual: z.number().min(0).max(99999999.99).optional().default(0),
  is_metered: z.boolean().optional().default(false),
  meter_unit: z.string().trim().max(50).nullable().optional(),
  meter_price_per_unit: z.number().min(0).max(999999.9999).optional().default(0),
  is_active: z.boolean().optional().default(true),
  sort_order: z.number().int().min(0).optional().default(0),
})

export const updateAddonSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens').optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  addon_type: addonTypeEnum.optional(),
  price_monthly: z.number().min(0).max(99999999.99).optional(),
  price_annual: z.number().min(0).max(99999999.99).optional(),
  is_metered: z.boolean().optional(),
  meter_unit: z.string().trim().max(50).nullable().optional(),
  meter_price_per_unit: z.number().min(0).max(999999.9999).optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
})

// -- Company Subscriptions ────────────────────────────────────────────────────

export const listSubscriptionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: subscriptionStatusEnum.optional(),
  billing_cycle: billingCycleEnum.optional(),
  plan_id: z.string().uuid().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createSubscriptionSchema = z.object({
  plan_id: z.string().uuid(),
  status: subscriptionStatusEnum.optional().default('trialing'),
  billing_cycle: billingCycleEnum.optional().default('monthly'),
  current_period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  current_period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  trial_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  trial_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  stripe_subscription_id: z.string().trim().max(100).nullable().optional(),
  stripe_customer_id: z.string().trim().max(100).nullable().optional(),
  grandfathered_plan: z.string().trim().max(100).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
})

export const updateSubscriptionSchema = z.object({
  plan_id: z.string().uuid().optional(),
  status: subscriptionStatusEnum.optional(),
  billing_cycle: billingCycleEnum.optional(),
  current_period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  current_period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  trial_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  trial_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  cancelled_at: z.string().nullable().optional(),
  cancel_reason: z.string().trim().max(5000).nullable().optional(),
  stripe_subscription_id: z.string().trim().max(100).nullable().optional(),
  stripe_customer_id: z.string().trim().max(100).nullable().optional(),
  grandfathered_plan: z.string().trim().max(100).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

// -- Usage Meters ─────────────────────────────────────────────────────────────

export const listUsageMetersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  meter_type: meterTypeEnum.optional(),
  addon_id: z.string().uuid().optional(),
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
})

export const createUsageMeterSchema = z.object({
  addon_id: z.string().uuid().nullable().optional(),
  meter_type: meterTypeEnum,
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  quantity: z.number().min(0).optional().default(0),
  unit: z.string().trim().max(50).nullable().optional(),
  overage_quantity: z.number().min(0).optional().default(0),
  overage_cost: z.number().min(0).max(99999999.99).optional().default(0),
})

export const updateUsageMeterSchema = z.object({
  addon_id: z.string().uuid().nullable().optional(),
  meter_type: meterTypeEnum.optional(),
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  quantity: z.number().min(0).optional(),
  unit: z.string().trim().max(50).nullable().optional(),
  overage_quantity: z.number().min(0).optional(),
  overage_cost: z.number().min(0).max(99999999.99).optional(),
})

// -- Billing Events ───────────────────────────────────────────────────────────

export const listBillingEventsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  event_type: billingEventTypeEnum.optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
})
