/**
 * Module 43 — Subscription Billing Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 43 spec.
 */

import { describe, test, expect } from 'vitest'

// -- Types ────────────────────────────────────────────────────────────────────

import type {
  PlanTier,
  AddonType,
  SubscriptionStatus,
  BillingCycle,
  BillingEventType,
  MeterType,
  SubscriptionPlan,
  PlanAddon,
  CompanySubscription,
  UsageMeter,
  BillingEvent,
} from '@/types/subscription-billing'

import {
  PLAN_TIERS,
  ADDON_TYPES,
  SUBSCRIPTION_STATUSES,
  BILLING_CYCLES,
  BILLING_EVENT_TYPES,
  METER_TYPES,
} from '@/types/subscription-billing'

// -- Schemas ──────────────────────────────────────────────────────────────────

import {
  planTierEnum,
  addonTypeEnum,
  subscriptionStatusEnum,
  billingCycleEnum,
  billingEventTypeEnum,
  meterTypeEnum,
  listPlansSchema,
  createPlanSchema,
  updatePlanSchema,
  listAddonsSchema,
  createAddonSchema,
  updateAddonSchema,
  listSubscriptionsSchema,
  createSubscriptionSchema,
  updateSubscriptionSchema,
  listUsageMetersSchema,
  createUsageMeterSchema,
  updateUsageMeterSchema,
  listBillingEventsSchema,
} from '@/lib/validation/schemas/subscription-billing'

// ============================================================================
// Type System
// ============================================================================

describe('Module 43 — Subscription Billing Types', () => {
  test('PlanTier has 5 values', () => {
    const tiers: PlanTier[] = ['free', 'starter', 'professional', 'business', 'enterprise']
    expect(tiers).toHaveLength(5)
  })

  test('AddonType has 7 values', () => {
    const types: AddonType[] = [
      'module', 'storage', 'users', 'api_access', 'support', 'training', 'white_label',
    ]
    expect(types).toHaveLength(7)
  })

  test('SubscriptionStatus has 6 values', () => {
    const statuses: SubscriptionStatus[] = [
      'trialing', 'active', 'past_due', 'cancelled', 'suspended', 'expired',
    ]
    expect(statuses).toHaveLength(6)
  })

  test('BillingCycle has 2 values', () => {
    const cycles: BillingCycle[] = ['monthly', 'annual']
    expect(cycles).toHaveLength(2)
  })

  test('BillingEventType has 14 values', () => {
    const types: BillingEventType[] = [
      'subscription_created', 'subscription_updated', 'subscription_cancelled',
      'payment_succeeded', 'payment_failed',
      'invoice_created', 'invoice_paid',
      'refund', 'credit_applied',
      'trial_started', 'trial_ended',
      'plan_changed', 'addon_added', 'addon_removed',
    ]
    expect(types).toHaveLength(14)
  })

  test('MeterType has 4 values', () => {
    const types: MeterType[] = ['storage_gb', 'active_users', 'api_calls', 'ai_processing']
    expect(types).toHaveLength(4)
  })

  test('SubscriptionPlan interface has all required fields', () => {
    const plan: SubscriptionPlan = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Professional',
      slug: 'professional',
      description: null,
      tier: 'professional',
      price_monthly: 99.99,
      price_annual: 999.99,
      max_users: 25,
      max_projects: 50,
      features: { budgets: true },
      is_active: true,
      sort_order: 2,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }
    expect(plan.id).toBeDefined()
    expect(plan.name).toBe('Professional')
    expect(plan.tier).toBe('professional')
    expect(plan.features).toHaveProperty('budgets')
  })

  test('PlanAddon interface has all required fields', () => {
    const addon: PlanAddon = {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Extra Storage',
      slug: 'extra-storage',
      description: null,
      addon_type: 'storage',
      price_monthly: 9.99,
      price_annual: 99.99,
      is_metered: true,
      meter_unit: 'GB',
      meter_price_per_unit: 0.10,
      is_active: true,
      sort_order: 0,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }
    expect(addon.id).toBeDefined()
    expect(addon.addon_type).toBe('storage')
    expect(addon.is_metered).toBe(true)
    expect(addon.meter_unit).toBe('GB')
  })

  test('CompanySubscription interface has all required fields', () => {
    const sub: CompanySubscription = {
      id: '00000000-0000-0000-0000-000000000003',
      company_id: '00000000-0000-0000-0000-000000000010',
      plan_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'active',
      billing_cycle: 'monthly',
      current_period_start: '2026-01-01',
      current_period_end: '2026-02-01',
      trial_start: null,
      trial_end: null,
      cancelled_at: null,
      cancel_reason: null,
      stripe_subscription_id: null,
      stripe_customer_id: null,
      grandfathered_plan: null,
      metadata: {},
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }
    expect(sub.id).toBeDefined()
    expect(sub.company_id).toBeDefined()
    expect(sub.status).toBe('active')
    expect(sub.billing_cycle).toBe('monthly')
  })

  test('UsageMeter interface has all required fields', () => {
    const meter: UsageMeter = {
      id: '00000000-0000-0000-0000-000000000004',
      company_id: '00000000-0000-0000-0000-000000000010',
      addon_id: null,
      meter_type: 'storage_gb',
      period_start: '2026-01-01',
      period_end: '2026-02-01',
      quantity: 50,
      unit: 'GB',
      overage_quantity: 10,
      overage_cost: 1.00,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }
    expect(meter.id).toBeDefined()
    expect(meter.meter_type).toBe('storage_gb')
    expect(meter.quantity).toBe(50)
  })

  test('BillingEvent interface has all required fields', () => {
    const event: BillingEvent = {
      id: '00000000-0000-0000-0000-000000000005',
      company_id: '00000000-0000-0000-0000-000000000010',
      event_type: 'payment_succeeded',
      description: 'Monthly payment',
      amount: 99.99,
      currency: 'usd',
      stripe_event_id: null,
      metadata: {},
      created_at: '2026-01-15T00:00:00Z',
    }
    expect(event.id).toBeDefined()
    expect(event.event_type).toBe('payment_succeeded')
    expect(event.amount).toBe(99.99)
    expect(event.currency).toBe('usd')
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 43 — Subscription Billing Constants', () => {
  test('PLAN_TIERS has 5 entries with value and label', () => {
    expect(PLAN_TIERS).toHaveLength(5)
    for (const entry of PLAN_TIERS) {
      expect(entry).toHaveProperty('value')
      expect(entry).toHaveProperty('label')
    }
  })

  test('PLAN_TIERS includes all expected values', () => {
    const values = PLAN_TIERS.map((t) => t.value)
    expect(values).toContain('free')
    expect(values).toContain('starter')
    expect(values).toContain('professional')
    expect(values).toContain('business')
    expect(values).toContain('enterprise')
  })

  test('ADDON_TYPES has 7 entries with value and label', () => {
    expect(ADDON_TYPES).toHaveLength(7)
    for (const entry of ADDON_TYPES) {
      expect(entry).toHaveProperty('value')
      expect(entry).toHaveProperty('label')
    }
  })

  test('ADDON_TYPES includes all expected values', () => {
    const values = ADDON_TYPES.map((t) => t.value)
    expect(values).toContain('module')
    expect(values).toContain('storage')
    expect(values).toContain('users')
    expect(values).toContain('api_access')
    expect(values).toContain('support')
    expect(values).toContain('training')
    expect(values).toContain('white_label')
  })

  test('SUBSCRIPTION_STATUSES has 6 entries with value and label', () => {
    expect(SUBSCRIPTION_STATUSES).toHaveLength(6)
    for (const entry of SUBSCRIPTION_STATUSES) {
      expect(entry).toHaveProperty('value')
      expect(entry).toHaveProperty('label')
    }
  })

  test('SUBSCRIPTION_STATUSES includes all expected values', () => {
    const values = SUBSCRIPTION_STATUSES.map((s) => s.value)
    expect(values).toContain('trialing')
    expect(values).toContain('active')
    expect(values).toContain('past_due')
    expect(values).toContain('cancelled')
    expect(values).toContain('suspended')
    expect(values).toContain('expired')
  })

  test('BILLING_CYCLES has 2 entries with value and label', () => {
    expect(BILLING_CYCLES).toHaveLength(2)
    for (const entry of BILLING_CYCLES) {
      expect(entry).toHaveProperty('value')
      expect(entry).toHaveProperty('label')
    }
  })

  test('BILLING_EVENT_TYPES has 14 entries with value and label', () => {
    expect(BILLING_EVENT_TYPES).toHaveLength(14)
    for (const entry of BILLING_EVENT_TYPES) {
      expect(entry).toHaveProperty('value')
      expect(entry).toHaveProperty('label')
    }
  })

  test('BILLING_EVENT_TYPES includes all expected values', () => {
    const values = BILLING_EVENT_TYPES.map((e) => e.value)
    expect(values).toContain('subscription_created')
    expect(values).toContain('payment_succeeded')
    expect(values).toContain('payment_failed')
    expect(values).toContain('invoice_paid')
    expect(values).toContain('refund')
    expect(values).toContain('trial_started')
    expect(values).toContain('plan_changed')
    expect(values).toContain('addon_added')
  })

  test('METER_TYPES has 4 entries with value and label', () => {
    expect(METER_TYPES).toHaveLength(4)
    for (const entry of METER_TYPES) {
      expect(entry).toHaveProperty('value')
      expect(entry).toHaveProperty('label')
    }
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 43 — Enum Schemas', () => {
  test('planTierEnum accepts all 5 tiers', () => {
    for (const tier of ['free', 'starter', 'professional', 'business', 'enterprise']) {
      expect(planTierEnum.safeParse(tier).success).toBe(true)
    }
  })

  test('planTierEnum rejects invalid tier', () => {
    expect(planTierEnum.safeParse('premium').success).toBe(false)
  })

  test('addonTypeEnum accepts all 7 types', () => {
    for (const type of ['module', 'storage', 'users', 'api_access', 'support', 'training', 'white_label']) {
      expect(addonTypeEnum.safeParse(type).success).toBe(true)
    }
  })

  test('addonTypeEnum rejects invalid type', () => {
    expect(addonTypeEnum.safeParse('custom').success).toBe(false)
  })

  test('subscriptionStatusEnum accepts all 6 statuses', () => {
    for (const s of ['trialing', 'active', 'past_due', 'cancelled', 'suspended', 'expired']) {
      expect(subscriptionStatusEnum.safeParse(s).success).toBe(true)
    }
  })

  test('subscriptionStatusEnum rejects invalid status', () => {
    expect(subscriptionStatusEnum.safeParse('paused').success).toBe(false)
  })

  test('billingCycleEnum accepts both cycles', () => {
    expect(billingCycleEnum.safeParse('monthly').success).toBe(true)
    expect(billingCycleEnum.safeParse('annual').success).toBe(true)
  })

  test('billingCycleEnum rejects invalid cycle', () => {
    expect(billingCycleEnum.safeParse('quarterly').success).toBe(false)
  })

  test('billingEventTypeEnum accepts all 14 types', () => {
    for (const t of [
      'subscription_created', 'subscription_updated', 'subscription_cancelled',
      'payment_succeeded', 'payment_failed',
      'invoice_created', 'invoice_paid',
      'refund', 'credit_applied',
      'trial_started', 'trial_ended',
      'plan_changed', 'addon_added', 'addon_removed',
    ]) {
      expect(billingEventTypeEnum.safeParse(t).success).toBe(true)
    }
  })

  test('billingEventTypeEnum rejects invalid type', () => {
    expect(billingEventTypeEnum.safeParse('subscription_paused').success).toBe(false)
  })

  test('meterTypeEnum accepts all 4 types', () => {
    for (const t of ['storage_gb', 'active_users', 'api_calls', 'ai_processing']) {
      expect(meterTypeEnum.safeParse(t).success).toBe(true)
    }
  })

  test('meterTypeEnum rejects invalid type', () => {
    expect(meterTypeEnum.safeParse('bandwidth').success).toBe(false)
  })
})

// ============================================================================
// Plan Schemas
// ============================================================================

describe('Module 43 — Plan Schemas', () => {
  test('listPlansSchema accepts valid params', () => {
    const result = listPlansSchema.safeParse({ page: '1', limit: '20' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  test('listPlansSchema rejects limit > 100', () => {
    const result = listPlansSchema.safeParse({ page: '1', limit: '200' })
    expect(result.success).toBe(false)
  })

  test('listPlansSchema accepts filters', () => {
    const result = listPlansSchema.safeParse({
      tier: 'professional',
      is_active: 'true',
      q: 'starter',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tier).toBe('professional')
      expect(result.data.is_active).toBe(true)
      expect(result.data.q).toBe('starter')
    }
  })

  test('createPlanSchema accepts valid plan', () => {
    const result = createPlanSchema.safeParse({
      name: 'Professional',
      slug: 'professional',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Professional')
      expect(result.data.slug).toBe('professional')
      expect(result.data.tier).toBe('starter')
      expect(result.data.price_monthly).toBe(0)
      expect(result.data.price_annual).toBe(0)
      expect(result.data.is_active).toBe(true)
      expect(result.data.sort_order).toBe(0)
    }
  })

  test('createPlanSchema requires name and slug', () => {
    const result = createPlanSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toHaveProperty('name')
      expect(result.error.flatten().fieldErrors).toHaveProperty('slug')
    }
  })

  test('createPlanSchema rejects name > 100 chars', () => {
    const result = createPlanSchema.safeParse({
      name: 'x'.repeat(101),
      slug: 'test',
    })
    expect(result.success).toBe(false)
  })

  test('createPlanSchema validates slug format', () => {
    const result = createPlanSchema.safeParse({
      name: 'Test',
      slug: 'Invalid Slug!',
    })
    expect(result.success).toBe(false)
  })

  test('createPlanSchema accepts valid slug with hyphens', () => {
    const result = createPlanSchema.safeParse({
      name: 'Test',
      slug: 'my-test-plan',
    })
    expect(result.success).toBe(true)
  })

  test('createPlanSchema accepts all optional fields', () => {
    const result = createPlanSchema.safeParse({
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'Full platform access',
      tier: 'enterprise',
      price_monthly: 499.99,
      price_annual: 4999.99,
      max_users: 100,
      max_projects: null,
      features: { budgets: true, scheduling: true },
      is_active: true,
      sort_order: 4,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tier).toBe('enterprise')
      expect(result.data.price_monthly).toBe(499.99)
      expect(result.data.max_users).toBe(100)
      expect(result.data.max_projects).toBeNull()
    }
  })

  test('updatePlanSchema accepts partial updates', () => {
    const result = updatePlanSchema.safeParse({
      name: 'Pro Plus',
      price_monthly: 149.99,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Pro Plus')
      expect(result.data.price_monthly).toBe(149.99)
    }
  })

  test('updatePlanSchema accepts is_active toggle', () => {
    const result = updatePlanSchema.safeParse({ is_active: false })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.is_active).toBe(false)
    }
  })
})

// ============================================================================
// Add-on Schemas
// ============================================================================

describe('Module 43 — Add-on Schemas', () => {
  test('listAddonsSchema accepts valid params', () => {
    const result = listAddonsSchema.safeParse({ page: '1', limit: '20' })
    expect(result.success).toBe(true)
  })

  test('listAddonsSchema rejects limit > 100', () => {
    const result = listAddonsSchema.safeParse({ page: '1', limit: '200' })
    expect(result.success).toBe(false)
  })

  test('listAddonsSchema accepts filters', () => {
    const result = listAddonsSchema.safeParse({
      addon_type: 'storage',
      is_active: 'true',
      q: 'extra',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.addon_type).toBe('storage')
      expect(result.data.is_active).toBe(true)
    }
  })

  test('createAddonSchema accepts valid addon', () => {
    const result = createAddonSchema.safeParse({
      name: 'Extra Storage',
      slug: 'extra-storage',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Extra Storage')
      expect(result.data.slug).toBe('extra-storage')
      expect(result.data.addon_type).toBe('module')
      expect(result.data.price_monthly).toBe(0)
      expect(result.data.is_metered).toBe(false)
      expect(result.data.is_active).toBe(true)
      expect(result.data.sort_order).toBe(0)
    }
  })

  test('createAddonSchema requires name and slug', () => {
    const result = createAddonSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toHaveProperty('name')
      expect(result.error.flatten().fieldErrors).toHaveProperty('slug')
    }
  })

  test('createAddonSchema rejects name > 200 chars', () => {
    const result = createAddonSchema.safeParse({
      name: 'x'.repeat(201),
      slug: 'test',
    })
    expect(result.success).toBe(false)
  })

  test('createAddonSchema validates slug format', () => {
    const result = createAddonSchema.safeParse({
      name: 'Test',
      slug: 'INVALID',
    })
    expect(result.success).toBe(false)
  })

  test('createAddonSchema accepts metered addon with all fields', () => {
    const result = createAddonSchema.safeParse({
      name: 'API Access',
      slug: 'api-access',
      addon_type: 'api_access',
      price_monthly: 29.99,
      price_annual: 299.99,
      is_metered: true,
      meter_unit: 'calls',
      meter_price_per_unit: 0.001,
      is_active: true,
      sort_order: 5,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.is_metered).toBe(true)
      expect(result.data.meter_unit).toBe('calls')
      expect(result.data.meter_price_per_unit).toBe(0.001)
    }
  })

  test('updateAddonSchema accepts partial updates', () => {
    const result = updateAddonSchema.safeParse({
      price_monthly: 19.99,
      is_active: false,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.price_monthly).toBe(19.99)
      expect(result.data.is_active).toBe(false)
    }
  })
})

// ============================================================================
// Subscription Schemas
// ============================================================================

describe('Module 43 — Subscription Schemas', () => {
  test('listSubscriptionsSchema accepts valid params', () => {
    const result = listSubscriptionsSchema.safeParse({ page: '1', limit: '20' })
    expect(result.success).toBe(true)
  })

  test('listSubscriptionsSchema rejects limit > 100', () => {
    const result = listSubscriptionsSchema.safeParse({ page: '1', limit: '200' })
    expect(result.success).toBe(false)
  })

  test('listSubscriptionsSchema accepts all filters', () => {
    const result = listSubscriptionsSchema.safeParse({
      status: 'active',
      billing_cycle: 'monthly',
      plan_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('active')
      expect(result.data.billing_cycle).toBe('monthly')
    }
  })

  test('createSubscriptionSchema accepts valid subscription', () => {
    const result = createSubscriptionSchema.safeParse({
      plan_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.plan_id).toBeDefined()
      expect(result.data.status).toBe('trialing')
      expect(result.data.billing_cycle).toBe('monthly')
      expect(result.data.metadata).toEqual({})
    }
  })

  test('createSubscriptionSchema requires plan_id', () => {
    const result = createSubscriptionSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toHaveProperty('plan_id')
    }
  })

  test('createSubscriptionSchema rejects invalid plan_id UUID', () => {
    const result = createSubscriptionSchema.safeParse({ plan_id: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  test('createSubscriptionSchema validates date format', () => {
    const result = createSubscriptionSchema.safeParse({
      plan_id: '550e8400-e29b-41d4-a716-446655440000',
      current_period_start: '2026-01-01',
      current_period_end: '2026-02-01',
    })
    expect(result.success).toBe(true)
  })

  test('createSubscriptionSchema rejects invalid date format', () => {
    const result = createSubscriptionSchema.safeParse({
      plan_id: '550e8400-e29b-41d4-a716-446655440000',
      current_period_start: 'Jan 1, 2026',
    })
    expect(result.success).toBe(false)
  })

  test('createSubscriptionSchema accepts all optional fields', () => {
    const result = createSubscriptionSchema.safeParse({
      plan_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'active',
      billing_cycle: 'annual',
      current_period_start: '2026-01-01',
      current_period_end: '2027-01-01',
      trial_start: null,
      trial_end: null,
      stripe_subscription_id: 'sub_abc123',
      stripe_customer_id: 'cus_abc123',
      grandfathered_plan: 'legacy-pro',
      metadata: { referral: 'partner-001' },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('active')
      expect(result.data.billing_cycle).toBe('annual')
      expect(result.data.stripe_subscription_id).toBe('sub_abc123')
    }
  })

  test('updateSubscriptionSchema accepts partial updates', () => {
    const result = updateSubscriptionSchema.safeParse({
      status: 'cancelled',
      cancel_reason: 'Too expensive',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('cancelled')
      expect(result.data.cancel_reason).toBe('Too expensive')
    }
  })

  test('updateSubscriptionSchema accepts cancelled_at', () => {
    const result = updateSubscriptionSchema.safeParse({
      cancelled_at: '2026-02-15T10:00:00Z',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.cancelled_at).toBe('2026-02-15T10:00:00Z')
    }
  })

  test('updateSubscriptionSchema accepts null cancelled_at', () => {
    const result = updateSubscriptionSchema.safeParse({
      cancelled_at: null,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.cancelled_at).toBeNull()
    }
  })

  test('updateSubscriptionSchema rejects cancel_reason > 5000 chars', () => {
    const result = updateSubscriptionSchema.safeParse({
      cancel_reason: 'x'.repeat(5001),
    })
    expect(result.success).toBe(false)
  })
})

// ============================================================================
// Usage Meter Schemas
// ============================================================================

describe('Module 43 — Usage Meter Schemas', () => {
  test('listUsageMetersSchema accepts valid params', () => {
    const result = listUsageMetersSchema.safeParse({ page: '1', limit: '20' })
    expect(result.success).toBe(true)
  })

  test('listUsageMetersSchema rejects limit > 100', () => {
    const result = listUsageMetersSchema.safeParse({ page: '1', limit: '200' })
    expect(result.success).toBe(false)
  })

  test('listUsageMetersSchema accepts all filters', () => {
    const result = listUsageMetersSchema.safeParse({
      meter_type: 'storage_gb',
      addon_id: '550e8400-e29b-41d4-a716-446655440002',
      period_start: '2026-01-01',
      period_end: '2026-02-01',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.meter_type).toBe('storage_gb')
    }
  })

  test('listUsageMetersSchema rejects invalid date format', () => {
    const result = listUsageMetersSchema.safeParse({
      period_start: 'Jan 2026',
    })
    expect(result.success).toBe(false)
  })

  test('createUsageMeterSchema accepts valid meter', () => {
    const result = createUsageMeterSchema.safeParse({
      meter_type: 'storage_gb',
      period_start: '2026-01-01',
      period_end: '2026-02-01',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.meter_type).toBe('storage_gb')
      expect(result.data.quantity).toBe(0)
      expect(result.data.overage_quantity).toBe(0)
      expect(result.data.overage_cost).toBe(0)
    }
  })

  test('createUsageMeterSchema requires meter_type, period_start, period_end', () => {
    const result = createUsageMeterSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toHaveProperty('meter_type')
      expect(result.error.flatten().fieldErrors).toHaveProperty('period_start')
      expect(result.error.flatten().fieldErrors).toHaveProperty('period_end')
    }
  })

  test('createUsageMeterSchema rejects negative quantity', () => {
    const result = createUsageMeterSchema.safeParse({
      meter_type: 'api_calls',
      period_start: '2026-01-01',
      period_end: '2026-02-01',
      quantity: -5,
    })
    expect(result.success).toBe(false)
  })

  test('createUsageMeterSchema accepts all optional fields', () => {
    const result = createUsageMeterSchema.safeParse({
      addon_id: '550e8400-e29b-41d4-a716-446655440002',
      meter_type: 'active_users',
      period_start: '2026-01-01',
      period_end: '2026-02-01',
      quantity: 30,
      unit: 'users',
      overage_quantity: 5,
      overage_cost: 25.00,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.addon_id).toBeDefined()
      expect(result.data.quantity).toBe(30)
      expect(result.data.overage_quantity).toBe(5)
      expect(result.data.overage_cost).toBe(25.00)
    }
  })

  test('createUsageMeterSchema validates period_start format', () => {
    const result = createUsageMeterSchema.safeParse({
      meter_type: 'storage_gb',
      period_start: 'invalid-date',
      period_end: '2026-02-01',
    })
    expect(result.success).toBe(false)
  })

  test('updateUsageMeterSchema accepts partial updates', () => {
    const result = updateUsageMeterSchema.safeParse({
      quantity: 100,
      overage_quantity: 15,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.quantity).toBe(100)
      expect(result.data.overage_quantity).toBe(15)
    }
  })

  test('updateUsageMeterSchema accepts null addon_id', () => {
    const result = updateUsageMeterSchema.safeParse({
      addon_id: null,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.addon_id).toBeNull()
    }
  })
})

// ============================================================================
// Billing Events Schemas
// ============================================================================

describe('Module 43 — Billing Event Schemas', () => {
  test('listBillingEventsSchema accepts valid params', () => {
    const result = listBillingEventsSchema.safeParse({ page: '1', limit: '20' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  test('listBillingEventsSchema rejects limit > 100', () => {
    const result = listBillingEventsSchema.safeParse({ page: '1', limit: '200' })
    expect(result.success).toBe(false)
  })

  test('listBillingEventsSchema accepts event_type filter', () => {
    const result = listBillingEventsSchema.safeParse({
      event_type: 'payment_succeeded',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.event_type).toBe('payment_succeeded')
    }
  })

  test('listBillingEventsSchema rejects invalid event_type', () => {
    const result = listBillingEventsSchema.safeParse({
      event_type: 'invalid_event',
    })
    expect(result.success).toBe(false)
  })

  test('listBillingEventsSchema accepts date range filters', () => {
    const result = listBillingEventsSchema.safeParse({
      date_from: '2026-01-01',
      date_to: '2026-02-01',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.date_from).toBe('2026-01-01')
      expect(result.data.date_to).toBe('2026-02-01')
    }
  })

  test('listBillingEventsSchema rejects invalid date format', () => {
    const result = listBillingEventsSchema.safeParse({
      date_from: 'January 2026',
    })
    expect(result.success).toBe(false)
  })
})
