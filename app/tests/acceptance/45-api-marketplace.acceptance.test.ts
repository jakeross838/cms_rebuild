/**
 * Module 45 — API & Marketplace Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 45 spec.
 */

import { describe, test, expect } from 'vitest'

// -- Types ────────────────────────────────────────────────────────────────────

import type {
  ApiKeyStatus,
  WebhookStatus,
  DeliveryStatus,
  IntegrationCategory,
  IntegrationStatus,
  PricingType,
  InstallStatus,
  ApiKey,
  WebhookSubscription,
  WebhookDelivery,
  IntegrationListing,
  IntegrationInstall,
} from '@/types/api-marketplace'

import {
  API_KEY_STATUSES,
  WEBHOOK_STATUSES,
  DELIVERY_STATUSES,
  INTEGRATION_CATEGORIES,
  INTEGRATION_STATUSES,
  PRICING_TYPES,
  INSTALL_STATUSES,
} from '@/types/api-marketplace'

// -- Schemas ──────────────────────────────────────────────────────────────────

import {
  apiKeyStatusEnum,
  webhookStatusEnum,
  deliveryStatusEnum,
  integrationCategoryEnum,
  integrationStatusEnum,
  pricingTypeEnum,
  installStatusEnum,
  listApiKeysSchema,
  createApiKeySchema,
  updateApiKeySchema,
  listWebhooksSchema,
  createWebhookSchema,
  updateWebhookSchema,
  listWebhookDeliveriesSchema,
  listIntegrationListingsSchema,
  listIntegrationInstallsSchema,
  createIntegrationInstallSchema,
  updateIntegrationInstallSchema,
} from '@/lib/validation/schemas/api-marketplace'

// ============================================================================
// Type System
// ============================================================================

describe('Module 45 — API & Marketplace Types', () => {
  test('ApiKeyStatus has 3 values', () => {
    const statuses: ApiKeyStatus[] = ['active', 'revoked', 'expired']
    expect(statuses).toHaveLength(3)
  })

  test('WebhookStatus has 4 values', () => {
    const statuses: WebhookStatus[] = ['active', 'paused', 'disabled', 'failing']
    expect(statuses).toHaveLength(4)
  })

  test('DeliveryStatus has 4 values', () => {
    const statuses: DeliveryStatus[] = ['pending', 'delivered', 'failed', 'retrying']
    expect(statuses).toHaveLength(4)
  })

  test('IntegrationCategory has 9 values', () => {
    const categories: IntegrationCategory[] = [
      'accounting', 'scheduling', 'communication', 'storage', 'payment',
      'analytics', 'field_ops', 'design', 'other',
    ]
    expect(categories).toHaveLength(9)
  })

  test('IntegrationStatus has 5 values', () => {
    const statuses: IntegrationStatus[] = [
      'draft', 'pending_review', 'published', 'rejected', 'archived',
    ]
    expect(statuses).toHaveLength(5)
  })

  test('PricingType has 4 values', () => {
    const types: PricingType[] = ['free', 'paid', 'freemium', 'contact']
    expect(types).toHaveLength(4)
  })

  test('InstallStatus has 4 values', () => {
    const statuses: InstallStatus[] = ['installed', 'active', 'paused', 'uninstalled']
    expect(statuses).toHaveLength(4)
  })

  test('ApiKey interface has all required fields', () => {
    const key: ApiKey = {
      id: '1', company_id: '1', name: 'My API Key',
      key_prefix: 'sk_abc', key_hash: 'hash_123',
      permissions: ['read:jobs'], status: 'active',
      rate_limit_per_minute: 60, last_used_at: null,
      expires_at: null, revoked_at: null, revoked_by: null,
      created_by: null, created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(key.id).toBeDefined()
    expect(key.company_id).toBeDefined()
    expect(key.name).toBeDefined()
    expect(key.key_prefix).toBeDefined()
    expect(key.key_hash).toBeDefined()
    expect(key.permissions).toBeDefined()
    expect(key.status).toBeDefined()
    expect(key.rate_limit_per_minute).toBeDefined()
  })

  test('WebhookSubscription interface has all required fields', () => {
    const webhook: WebhookSubscription = {
      id: '1', company_id: '1', url: 'https://example.com/hook',
      events: ['job.created'], status: 'active',
      secret: 'whsec_123', description: null,
      retry_count: 0, max_retries: 5, failure_count: 0,
      last_triggered_at: null, last_success_at: null, last_failure_at: null,
      created_by: null, created_at: '2026-01-01', updated_at: '2026-01-01',
      deleted_at: null,
    }
    expect(webhook.id).toBeDefined()
    expect(webhook.company_id).toBeDefined()
    expect(webhook.url).toBeDefined()
    expect(webhook.events).toBeDefined()
    expect(webhook.secret).toBeDefined()
    expect(webhook.max_retries).toBeDefined()
  })

  test('WebhookDelivery interface has all required fields', () => {
    const delivery: WebhookDelivery = {
      id: '1', company_id: '1', subscription_id: '1',
      event_type: 'job.created', payload: { job_id: '1' },
      status: 'delivered', response_status_code: 200,
      response_body: 'OK', attempt_count: 1,
      next_retry_at: null, delivered_at: '2026-01-01',
      created_at: '2026-01-01',
    }
    expect(delivery.id).toBeDefined()
    expect(delivery.subscription_id).toBeDefined()
    expect(delivery.event_type).toBeDefined()
    expect(delivery.payload).toBeDefined()
    expect(delivery.status).toBeDefined()
    expect(delivery.attempt_count).toBeDefined()
  })

  test('IntegrationListing interface has all required fields', () => {
    const listing: IntegrationListing = {
      id: '1', name: 'QuickBooks', slug: 'quickbooks',
      description: 'Sync with QuickBooks', long_description: null,
      logo_url: null, screenshots: [],
      category: 'accounting', developer_name: 'Intuit',
      developer_url: null, documentation_url: null, support_url: null,
      pricing_type: 'paid', price_monthly: 29.99,
      install_count: 100, avg_rating: 4.5, review_count: 50,
      status: 'published', is_featured: true,
      required_plan_tier: 'pro',
      created_by: null, created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(listing.id).toBeDefined()
    expect(listing.name).toBeDefined()
    expect(listing.slug).toBeDefined()
    expect(listing.category).toBeDefined()
    expect(listing.pricing_type).toBeDefined()
    expect(listing.status).toBeDefined()
    expect(listing.is_featured).toBeDefined()
  })

  test('IntegrationInstall interface has all required fields', () => {
    const install: IntegrationInstall = {
      id: '1', company_id: '1', listing_id: '1',
      status: 'active', configuration: { api_key: 'abc' },
      installed_by: null, installed_at: '2026-01-01',
      uninstalled_at: null, uninstalled_by: null,
      created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(install.id).toBeDefined()
    expect(install.company_id).toBeDefined()
    expect(install.listing_id).toBeDefined()
    expect(install.status).toBeDefined()
    expect(install.configuration).toBeDefined()
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 45 — API & Marketplace Constants', () => {
  test('API_KEY_STATUSES has 3 entries with value and label', () => {
    expect(API_KEY_STATUSES).toHaveLength(3)
    API_KEY_STATUSES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  test('API_KEY_STATUSES includes all expected values', () => {
    const values = API_KEY_STATUSES.map((s) => s.value)
    expect(values).toContain('active')
    expect(values).toContain('revoked')
    expect(values).toContain('expired')
  })

  test('WEBHOOK_STATUSES has 4 entries with value and label', () => {
    expect(WEBHOOK_STATUSES).toHaveLength(4)
    WEBHOOK_STATUSES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  test('WEBHOOK_STATUSES includes all expected values', () => {
    const values = WEBHOOK_STATUSES.map((s) => s.value)
    expect(values).toContain('active')
    expect(values).toContain('paused')
    expect(values).toContain('disabled')
    expect(values).toContain('failing')
  })

  test('DELIVERY_STATUSES has 4 entries with value and label', () => {
    expect(DELIVERY_STATUSES).toHaveLength(4)
    DELIVERY_STATUSES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  test('DELIVERY_STATUSES includes all expected values', () => {
    const values = DELIVERY_STATUSES.map((s) => s.value)
    expect(values).toContain('pending')
    expect(values).toContain('delivered')
    expect(values).toContain('failed')
    expect(values).toContain('retrying')
  })

  test('INTEGRATION_CATEGORIES has 9 entries with value and label', () => {
    expect(INTEGRATION_CATEGORIES).toHaveLength(9)
    INTEGRATION_CATEGORIES.forEach((c) => {
      expect(c).toHaveProperty('value')
      expect(c).toHaveProperty('label')
    })
  })

  test('INTEGRATION_CATEGORIES includes all expected values', () => {
    const values = INTEGRATION_CATEGORIES.map((c) => c.value)
    expect(values).toContain('accounting')
    expect(values).toContain('scheduling')
    expect(values).toContain('communication')
    expect(values).toContain('storage')
    expect(values).toContain('payment')
    expect(values).toContain('analytics')
    expect(values).toContain('field_ops')
    expect(values).toContain('design')
    expect(values).toContain('other')
  })

  test('INTEGRATION_STATUSES has 5 entries with value and label', () => {
    expect(INTEGRATION_STATUSES).toHaveLength(5)
    INTEGRATION_STATUSES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  test('INTEGRATION_STATUSES includes all expected values', () => {
    const values = INTEGRATION_STATUSES.map((s) => s.value)
    expect(values).toContain('draft')
    expect(values).toContain('pending_review')
    expect(values).toContain('published')
    expect(values).toContain('rejected')
    expect(values).toContain('archived')
  })

  test('PRICING_TYPES has 4 entries with value and label', () => {
    expect(PRICING_TYPES).toHaveLength(4)
    PRICING_TYPES.forEach((t) => {
      expect(t).toHaveProperty('value')
      expect(t).toHaveProperty('label')
    })
  })

  test('PRICING_TYPES includes all expected values', () => {
    const values = PRICING_TYPES.map((t) => t.value)
    expect(values).toContain('free')
    expect(values).toContain('paid')
    expect(values).toContain('freemium')
    expect(values).toContain('contact')
  })

  test('INSTALL_STATUSES has 4 entries with value and label', () => {
    expect(INSTALL_STATUSES).toHaveLength(4)
    INSTALL_STATUSES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  test('INSTALL_STATUSES includes all expected values', () => {
    const values = INSTALL_STATUSES.map((s) => s.value)
    expect(values).toContain('installed')
    expect(values).toContain('active')
    expect(values).toContain('paused')
    expect(values).toContain('uninstalled')
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 45 — Enum Schemas', () => {
  test('apiKeyStatusEnum accepts all 3 statuses', () => {
    expect(apiKeyStatusEnum.parse('active')).toBe('active')
    expect(apiKeyStatusEnum.parse('revoked')).toBe('revoked')
    expect(apiKeyStatusEnum.parse('expired')).toBe('expired')
  })

  test('apiKeyStatusEnum rejects invalid status', () => {
    expect(() => apiKeyStatusEnum.parse('invalid')).toThrow()
  })

  test('webhookStatusEnum accepts all 4 statuses', () => {
    expect(webhookStatusEnum.parse('active')).toBe('active')
    expect(webhookStatusEnum.parse('paused')).toBe('paused')
    expect(webhookStatusEnum.parse('disabled')).toBe('disabled')
    expect(webhookStatusEnum.parse('failing')).toBe('failing')
  })

  test('webhookStatusEnum rejects invalid status', () => {
    expect(() => webhookStatusEnum.parse('invalid')).toThrow()
  })

  test('deliveryStatusEnum accepts all 4 statuses', () => {
    expect(deliveryStatusEnum.parse('pending')).toBe('pending')
    expect(deliveryStatusEnum.parse('delivered')).toBe('delivered')
    expect(deliveryStatusEnum.parse('failed')).toBe('failed')
    expect(deliveryStatusEnum.parse('retrying')).toBe('retrying')
  })

  test('deliveryStatusEnum rejects invalid status', () => {
    expect(() => deliveryStatusEnum.parse('invalid')).toThrow()
  })

  test('integrationCategoryEnum accepts all 9 categories', () => {
    const categories = ['accounting', 'scheduling', 'communication', 'storage', 'payment', 'analytics', 'field_ops', 'design', 'other']
    categories.forEach((c) => {
      expect(integrationCategoryEnum.parse(c)).toBe(c)
    })
  })

  test('integrationCategoryEnum rejects invalid category', () => {
    expect(() => integrationCategoryEnum.parse('invalid')).toThrow()
  })

  test('integrationStatusEnum accepts all 5 statuses', () => {
    const statuses = ['draft', 'pending_review', 'published', 'rejected', 'archived']
    statuses.forEach((s) => {
      expect(integrationStatusEnum.parse(s)).toBe(s)
    })
  })

  test('integrationStatusEnum rejects invalid status', () => {
    expect(() => integrationStatusEnum.parse('invalid')).toThrow()
  })

  test('pricingTypeEnum accepts all 4 types', () => {
    expect(pricingTypeEnum.parse('free')).toBe('free')
    expect(pricingTypeEnum.parse('paid')).toBe('paid')
    expect(pricingTypeEnum.parse('freemium')).toBe('freemium')
    expect(pricingTypeEnum.parse('contact')).toBe('contact')
  })

  test('pricingTypeEnum rejects invalid type', () => {
    expect(() => pricingTypeEnum.parse('invalid')).toThrow()
  })

  test('installStatusEnum accepts all 4 statuses', () => {
    expect(installStatusEnum.parse('installed')).toBe('installed')
    expect(installStatusEnum.parse('active')).toBe('active')
    expect(installStatusEnum.parse('paused')).toBe('paused')
    expect(installStatusEnum.parse('uninstalled')).toBe('uninstalled')
  })

  test('installStatusEnum rejects invalid status', () => {
    expect(() => installStatusEnum.parse('invalid')).toThrow()
  })
})

// ============================================================================
// API Key Schemas
// ============================================================================

describe('Module 45 — API Key Schemas', () => {
  test('listApiKeysSchema accepts valid params', () => {
    const result = listApiKeysSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listApiKeysSchema rejects limit > 100', () => {
    expect(() => listApiKeysSchema.parse({ limit: 101 })).toThrow()
  })

  test('listApiKeysSchema accepts filters', () => {
    const result = listApiKeysSchema.parse({ status: 'active', q: 'test' })
    expect(result.status).toBe('active')
    expect(result.q).toBe('test')
  })

  test('createApiKeySchema accepts valid API key', () => {
    const result = createApiKeySchema.parse({ name: 'Production Key' })
    expect(result.name).toBe('Production Key')
    expect(result.permissions).toEqual([])
    expect(result.rate_limit_per_minute).toBe(60)
  })

  test('createApiKeySchema requires name', () => {
    expect(() => createApiKeySchema.parse({})).toThrow()
  })

  test('createApiKeySchema rejects name > 200 chars', () => {
    expect(() => createApiKeySchema.parse({ name: 'x'.repeat(201) })).toThrow()
  })

  test('createApiKeySchema accepts permissions array', () => {
    const result = createApiKeySchema.parse({
      name: 'Test Key',
      permissions: ['read:jobs', 'write:invoices'],
    })
    expect(result.permissions).toEqual(['read:jobs', 'write:invoices'])
  })

  test('createApiKeySchema accepts rate_limit_per_minute', () => {
    const result = createApiKeySchema.parse({
      name: 'Test Key',
      rate_limit_per_minute: 120,
    })
    expect(result.rate_limit_per_minute).toBe(120)
  })

  test('createApiKeySchema rejects rate_limit_per_minute > 10000', () => {
    expect(() => createApiKeySchema.parse({
      name: 'Test Key',
      rate_limit_per_minute: 10001,
    })).toThrow()
  })

  test('createApiKeySchema validates expires_at date format', () => {
    const result = createApiKeySchema.parse({
      name: 'Test Key',
      expires_at: '2026-12-31',
    })
    expect(result.expires_at).toBe('2026-12-31')
  })

  test('createApiKeySchema rejects invalid expires_at format', () => {
    expect(() => createApiKeySchema.parse({
      name: 'Test Key',
      expires_at: '2026/12/31',
    })).toThrow()
  })

  test('createApiKeySchema accepts null expires_at', () => {
    const result = createApiKeySchema.parse({
      name: 'Test Key',
      expires_at: null,
    })
    expect(result.expires_at).toBeNull()
  })

  test('updateApiKeySchema accepts partial updates', () => {
    const result = updateApiKeySchema.parse({ name: 'Updated Name' })
    expect(result.name).toBe('Updated Name')
  })

  test('updateApiKeySchema accepts status change', () => {
    const result = updateApiKeySchema.parse({ status: 'revoked' })
    expect(result.status).toBe('revoked')
  })

  test('updateApiKeySchema rejects invalid status', () => {
    expect(() => updateApiKeySchema.parse({ status: 'invalid' })).toThrow()
  })
})

// ============================================================================
// Webhook Schemas
// ============================================================================

describe('Module 45 — Webhook Schemas', () => {
  test('listWebhooksSchema accepts valid params', () => {
    const result = listWebhooksSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listWebhooksSchema rejects limit > 100', () => {
    expect(() => listWebhooksSchema.parse({ limit: 101 })).toThrow()
  })

  test('listWebhooksSchema accepts filters', () => {
    const result = listWebhooksSchema.parse({ status: 'active', q: 'example' })
    expect(result.status).toBe('active')
    expect(result.q).toBe('example')
  })

  test('createWebhookSchema accepts valid webhook', () => {
    const result = createWebhookSchema.parse({
      url: 'https://example.com/webhook',
      events: ['job.created'],
    })
    expect(result.url).toBe('https://example.com/webhook')
    expect(result.events).toEqual(['job.created'])
    expect(result.status).toBe('active')
    expect(result.max_retries).toBe(5)
  })

  test('createWebhookSchema requires url and events', () => {
    expect(() => createWebhookSchema.parse({})).toThrow()
    expect(() => createWebhookSchema.parse({ url: 'https://example.com' })).toThrow()
  })

  test('createWebhookSchema rejects invalid url', () => {
    expect(() => createWebhookSchema.parse({
      url: 'not-a-url',
      events: ['job.created'],
    })).toThrow()
  })

  test('createWebhookSchema requires at least one event', () => {
    expect(() => createWebhookSchema.parse({
      url: 'https://example.com/webhook',
      events: [],
    })).toThrow()
  })

  test('createWebhookSchema accepts description', () => {
    const result = createWebhookSchema.parse({
      url: 'https://example.com/webhook',
      events: ['job.created'],
      description: 'My webhook',
    })
    expect(result.description).toBe('My webhook')
  })

  test('createWebhookSchema accepts max_retries', () => {
    const result = createWebhookSchema.parse({
      url: 'https://example.com/webhook',
      events: ['job.created'],
      max_retries: 10,
    })
    expect(result.max_retries).toBe(10)
  })

  test('createWebhookSchema rejects max_retries > 20', () => {
    expect(() => createWebhookSchema.parse({
      url: 'https://example.com/webhook',
      events: ['job.created'],
      max_retries: 21,
    })).toThrow()
  })

  test('updateWebhookSchema accepts partial updates', () => {
    const result = updateWebhookSchema.parse({ status: 'paused' })
    expect(result.status).toBe('paused')
  })

  test('updateWebhookSchema accepts url update', () => {
    const result = updateWebhookSchema.parse({ url: 'https://new.example.com/hook' })
    expect(result.url).toBe('https://new.example.com/hook')
  })

  test('updateWebhookSchema rejects invalid url', () => {
    expect(() => updateWebhookSchema.parse({ url: 'not-a-url' })).toThrow()
  })

  test('updateWebhookSchema accepts events update', () => {
    const result = updateWebhookSchema.parse({ events: ['invoice.paid', 'job.completed'] })
    expect(result.events).toEqual(['invoice.paid', 'job.completed'])
  })
})

// ============================================================================
// Webhook Delivery Schemas
// ============================================================================

describe('Module 45 — Webhook Delivery Schemas', () => {
  test('listWebhookDeliveriesSchema accepts valid params with defaults', () => {
    const result = listWebhookDeliveriesSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listWebhookDeliveriesSchema accepts filters', () => {
    const result = listWebhookDeliveriesSchema.parse({
      status: 'delivered',
      event_type: 'job.created',
    })
    expect(result.status).toBe('delivered')
    expect(result.event_type).toBe('job.created')
  })

  test('listWebhookDeliveriesSchema rejects invalid status', () => {
    expect(() => listWebhookDeliveriesSchema.parse({ status: 'invalid' })).toThrow()
  })

  test('listWebhookDeliveriesSchema rejects limit > 100', () => {
    expect(() => listWebhookDeliveriesSchema.parse({ limit: 101 })).toThrow()
  })
})

// ============================================================================
// Integration Listing Schemas
// ============================================================================

describe('Module 45 — Integration Listing Schemas', () => {
  test('listIntegrationListingsSchema accepts valid params', () => {
    const result = listIntegrationListingsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listIntegrationListingsSchema rejects limit > 100', () => {
    expect(() => listIntegrationListingsSchema.parse({ limit: 101 })).toThrow()
  })

  test('listIntegrationListingsSchema accepts category filter', () => {
    const result = listIntegrationListingsSchema.parse({ category: 'accounting' })
    expect(result.category).toBe('accounting')
  })

  test('listIntegrationListingsSchema rejects invalid category', () => {
    expect(() => listIntegrationListingsSchema.parse({ category: 'invalid' })).toThrow()
  })

  test('listIntegrationListingsSchema accepts status filter', () => {
    const result = listIntegrationListingsSchema.parse({ status: 'published' })
    expect(result.status).toBe('published')
  })

  test('listIntegrationListingsSchema accepts is_featured filter with boolean preprocess', () => {
    const result = listIntegrationListingsSchema.parse({ is_featured: 'true' })
    expect(result.is_featured).toBe(true)
  })

  test('listIntegrationListingsSchema accepts is_featured false', () => {
    const result = listIntegrationListingsSchema.parse({ is_featured: 'false' })
    expect(result.is_featured).toBe(false)
  })

  test('listIntegrationListingsSchema accepts q filter', () => {
    const result = listIntegrationListingsSchema.parse({ q: 'quickbooks' })
    expect(result.q).toBe('quickbooks')
  })
})

// ============================================================================
// Integration Install Schemas
// ============================================================================

describe('Module 45 — Integration Install Schemas', () => {
  test('listIntegrationInstallsSchema accepts valid params', () => {
    const result = listIntegrationInstallsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listIntegrationInstallsSchema rejects limit > 100', () => {
    expect(() => listIntegrationInstallsSchema.parse({ limit: 101 })).toThrow()
  })

  test('listIntegrationInstallsSchema accepts listing_id filter', () => {
    const result = listIntegrationInstallsSchema.parse({
      listing_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.listing_id).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  test('listIntegrationInstallsSchema rejects invalid listing_id UUID', () => {
    expect(() => listIntegrationInstallsSchema.parse({ listing_id: 'not-uuid' })).toThrow()
  })

  test('listIntegrationInstallsSchema accepts status filter', () => {
    const result = listIntegrationInstallsSchema.parse({ status: 'active' })
    expect(result.status).toBe('active')
  })

  test('createIntegrationInstallSchema accepts valid install', () => {
    const result = createIntegrationInstallSchema.parse({
      listing_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.listing_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.configuration).toEqual({})
  })

  test('createIntegrationInstallSchema requires listing_id', () => {
    expect(() => createIntegrationInstallSchema.parse({})).toThrow()
  })

  test('createIntegrationInstallSchema rejects invalid listing_id', () => {
    expect(() => createIntegrationInstallSchema.parse({ listing_id: 'not-uuid' })).toThrow()
  })

  test('createIntegrationInstallSchema accepts configuration', () => {
    const result = createIntegrationInstallSchema.parse({
      listing_id: '550e8400-e29b-41d4-a716-446655440000',
      configuration: { api_key: 'abc123', mode: 'production' },
    })
    expect(result.configuration).toEqual({ api_key: 'abc123', mode: 'production' })
  })

  test('updateIntegrationInstallSchema accepts partial updates', () => {
    const result = updateIntegrationInstallSchema.parse({ status: 'paused' })
    expect(result.status).toBe('paused')
  })

  test('updateIntegrationInstallSchema accepts configuration update', () => {
    const result = updateIntegrationInstallSchema.parse({
      configuration: { setting: 'value' },
    })
    expect(result.configuration).toEqual({ setting: 'value' })
  })

  test('updateIntegrationInstallSchema rejects invalid status', () => {
    expect(() => updateIntegrationInstallSchema.parse({ status: 'invalid' })).toThrow()
  })
})
