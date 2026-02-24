/**
 * Module 48 — Template Marketplace Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 48 spec.
 */

import { describe, test, expect } from 'vitest'

// -- Types ────────────────────────────────────────────────────────────────────

import type {
  PublisherType,
  TemplateType,
  ReviewStatus,
  TemplateCategory,
  MarketplacePublisher,
  MarketplaceTemplate,
  MarketplaceTemplateVersion,
  MarketplaceInstall,
  MarketplaceReview,
} from '@/types/template-marketplace'

import {
  PUBLISHER_TYPES,
  TEMPLATE_TYPES,
  REVIEW_STATUSES,
  TEMPLATE_CATEGORIES,
} from '@/types/template-marketplace'

// -- Schemas ──────────────────────────────────────────────────────────────────

import {
  publisherTypeEnum,
  templateTypeEnum,
  reviewStatusEnum,
  listPublishersSchema,
  createPublisherSchema,
  updatePublisherSchema,
  listTemplatesSchema,
  createTemplateSchema,
  updateTemplateSchema,
  listTemplateVersionsSchema,
  createTemplateVersionSchema,
  listInstallsSchema,
  createInstallSchema,
  listReviewsSchema,
  createReviewSchema,
  updateReviewSchema,
} from '@/lib/validation/schemas/template-marketplace'

// ============================================================================
// Type System
// ============================================================================

describe('Module 48 — Template Marketplace Types', () => {
  test('PublisherType has 3 values', () => {
    const types: PublisherType[] = ['builder', 'consultant', 'platform']
    expect(types).toHaveLength(3)
  })

  test('TemplateType has 9 values', () => {
    const types: TemplateType[] = [
      'estimate', 'schedule', 'checklist', 'contract', 'report',
      'workflow', 'cost_code', 'selection', 'specification',
    ]
    expect(types).toHaveLength(9)
  })

  test('ReviewStatus has 3 values', () => {
    const statuses: ReviewStatus[] = ['pending', 'approved', 'rejected']
    expect(statuses).toHaveLength(3)
  })

  test('TemplateCategory is alias of TemplateType', () => {
    const category: TemplateCategory = 'estimate'
    const templateType: TemplateType = category
    expect(templateType).toBe('estimate')
  })

  test('MarketplacePublisher interface has all required fields', () => {
    const publisher: MarketplacePublisher = {
      id: '1', user_id: '1', publisher_type: 'builder',
      display_name: 'Test Publisher', bio: null, credentials: null,
      website_url: null, profile_image: null, is_verified: false,
      total_installs: 0, avg_rating: 0, total_templates: 0,
      revenue_share_pct: 70, stripe_connect_id: null,
      created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(publisher.id).toBe('1')
    expect(publisher.publisher_type).toBe('builder')
    expect(publisher.display_name).toBe('Test Publisher')
    expect(publisher.is_verified).toBe(false)
    expect(publisher.total_installs).toBe(0)
    expect(publisher.avg_rating).toBe(0)
    expect(publisher.total_templates).toBe(0)
    expect(publisher.revenue_share_pct).toBe(70)
    expect(publisher.stripe_connect_id).toBeNull()
  })

  test('MarketplaceTemplate interface has all required fields', () => {
    const template: MarketplaceTemplate = {
      id: '1', publisher_id: '1', publisher_type: 'builder',
      template_type: 'estimate', name: 'Test Template', slug: 'test-template',
      description: 'A test', long_description: null,
      screenshots: [], tags: [], region_tags: [], construction_tags: [],
      price: 0, currency: 'USD', template_data: {},
      required_modules: [], version: '1.0.0',
      install_count: 0, avg_rating: 0, review_count: 0,
      review_status: 'pending', is_featured: false, is_active: true,
      created_by: null, created_at: '2026-01-01', updated_at: '2026-01-01',
      deleted_at: null,
    }
    expect(template.id).toBe('1')
    expect(template.template_type).toBe('estimate')
    expect(template.slug).toBe('test-template')
    expect(template.price).toBe(0)
    expect(template.currency).toBe('USD')
    expect(template.review_status).toBe('pending')
    expect(template.is_featured).toBe(false)
    expect(template.is_active).toBe(true)
    expect(template.deleted_at).toBeNull()
  })

  test('MarketplaceTemplateVersion interface has all required fields', () => {
    const version: MarketplaceTemplateVersion = {
      id: '1', template_id: '1', version: '1.0.0',
      changelog: 'Initial release', template_data: {},
      published_at: '2026-01-01', created_at: '2026-01-01',
    }
    expect(version.id).toBe('1')
    expect(version.template_id).toBe('1')
    expect(version.version).toBe('1.0.0')
    expect(version.changelog).toBe('Initial release')
  })

  test('MarketplaceInstall interface has all required fields', () => {
    const install: MarketplaceInstall = {
      id: '1', company_id: '1', template_id: '1',
      template_version: '1.0.0', installed_by: '1',
      installed_at: '2026-01-01', uninstalled_at: null,
      payment_id: null, payment_amount: null,
      created_at: '2026-01-01',
    }
    expect(install.id).toBe('1')
    expect(install.company_id).toBe('1')
    expect(install.template_id).toBe('1')
    expect(install.template_version).toBe('1.0.0')
    expect(install.installed_by).toBe('1')
    expect(install.uninstalled_at).toBeNull()
    expect(install.payment_id).toBeNull()
    expect(install.payment_amount).toBeNull()
  })

  test('MarketplaceReview interface has all required fields', () => {
    const review: MarketplaceReview = {
      id: '1', company_id: '1', template_id: '1', user_id: '1',
      rating: 5, title: 'Great template', review_text: 'Works perfectly',
      publisher_response: null, publisher_responded_at: null,
      is_verified_purchase: true, is_flagged: false,
      created_at: '2026-01-01', updated_at: '2026-01-01',
    }
    expect(review.id).toBe('1')
    expect(review.rating).toBe(5)
    expect(review.title).toBe('Great template')
    expect(review.is_verified_purchase).toBe(true)
    expect(review.is_flagged).toBe(false)
    expect(review.publisher_response).toBeNull()
    expect(review.publisher_responded_at).toBeNull()
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 48 — Template Marketplace Constants', () => {
  test('PUBLISHER_TYPES has 3 entries with value and label', () => {
    expect(PUBLISHER_TYPES).toHaveLength(3)
    PUBLISHER_TYPES.forEach((item) => {
      expect(item).toHaveProperty('value')
      expect(item).toHaveProperty('label')
    })
  })

  test('PUBLISHER_TYPES includes all expected values', () => {
    const values = PUBLISHER_TYPES.map((t) => t.value)
    expect(values).toContain('builder')
    expect(values).toContain('consultant')
    expect(values).toContain('platform')
  })

  test('TEMPLATE_TYPES has 9 entries with value and label', () => {
    expect(TEMPLATE_TYPES).toHaveLength(9)
    TEMPLATE_TYPES.forEach((item) => {
      expect(item).toHaveProperty('value')
      expect(item).toHaveProperty('label')
    })
  })

  test('TEMPLATE_TYPES includes all expected values', () => {
    const values = TEMPLATE_TYPES.map((t) => t.value)
    expect(values).toContain('estimate')
    expect(values).toContain('schedule')
    expect(values).toContain('checklist')
    expect(values).toContain('contract')
    expect(values).toContain('report')
    expect(values).toContain('workflow')
    expect(values).toContain('cost_code')
    expect(values).toContain('selection')
    expect(values).toContain('specification')
  })

  test('REVIEW_STATUSES has 3 entries with value and label', () => {
    expect(REVIEW_STATUSES).toHaveLength(3)
    REVIEW_STATUSES.forEach((item) => {
      expect(item).toHaveProperty('value')
      expect(item).toHaveProperty('label')
    })
  })

  test('REVIEW_STATUSES includes all expected values', () => {
    const values = REVIEW_STATUSES.map((s) => s.value)
    expect(values).toContain('pending')
    expect(values).toContain('approved')
    expect(values).toContain('rejected')
  })

  test('TEMPLATE_CATEGORIES is same reference as TEMPLATE_TYPES', () => {
    expect(TEMPLATE_CATEGORIES).toBe(TEMPLATE_TYPES)
    expect(TEMPLATE_CATEGORIES).toHaveLength(9)
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 48 — Enum Schemas', () => {
  test('publisherTypeEnum accepts all 3 types', () => {
    expect(publisherTypeEnum.safeParse('builder').success).toBe(true)
    expect(publisherTypeEnum.safeParse('consultant').success).toBe(true)
    expect(publisherTypeEnum.safeParse('platform').success).toBe(true)
  })

  test('publisherTypeEnum rejects invalid type', () => {
    expect(publisherTypeEnum.safeParse('vendor').success).toBe(false)
    expect(publisherTypeEnum.safeParse('').success).toBe(false)
  })

  test('templateTypeEnum accepts all 9 types', () => {
    const types = [
      'estimate', 'schedule', 'checklist', 'contract', 'report',
      'workflow', 'cost_code', 'selection', 'specification',
    ]
    types.forEach((t) => {
      expect(templateTypeEnum.safeParse(t).success).toBe(true)
    })
  })

  test('templateTypeEnum rejects invalid type', () => {
    expect(templateTypeEnum.safeParse('template').success).toBe(false)
    expect(templateTypeEnum.safeParse('').success).toBe(false)
  })

  test('reviewStatusEnum accepts all 3 statuses', () => {
    expect(reviewStatusEnum.safeParse('pending').success).toBe(true)
    expect(reviewStatusEnum.safeParse('approved').success).toBe(true)
    expect(reviewStatusEnum.safeParse('rejected').success).toBe(true)
  })

  test('reviewStatusEnum rejects invalid status', () => {
    expect(reviewStatusEnum.safeParse('published').success).toBe(false)
    expect(reviewStatusEnum.safeParse('').success).toBe(false)
  })
})

// ============================================================================
// Publisher Schemas
// ============================================================================

describe('Module 48 — Publisher Schemas', () => {
  test('listPublishersSchema accepts valid params', () => {
    const result = listPublishersSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  test('listPublishersSchema rejects limit > 100', () => {
    const result = listPublishersSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  test('listPublishersSchema accepts filters', () => {
    const result = listPublishersSchema.safeParse({
      publisher_type: 'builder',
      is_verified: 'true',
      q: 'smith',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.publisher_type).toBe('builder')
      expect(result.data.is_verified).toBe(true)
      expect(result.data.q).toBe('smith')
    }
  })

  test('createPublisherSchema accepts valid publisher', () => {
    const result = createPublisherSchema.safeParse({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      display_name: 'Test Publisher',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.publisher_type).toBe('builder')
      expect(result.data.display_name).toBe('Test Publisher')
    }
  })

  test('createPublisherSchema requires user_id and display_name', () => {
    const result = createPublisherSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  test('createPublisherSchema rejects display_name > 200 chars', () => {
    const result = createPublisherSchema.safeParse({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      display_name: 'x'.repeat(201),
    })
    expect(result.success).toBe(false)
  })

  test('createPublisherSchema accepts all optional fields', () => {
    const result = createPublisherSchema.safeParse({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      publisher_type: 'consultant',
      display_name: 'Full Publisher',
      bio: 'A bio',
      credentials: 'Licensed GC',
      website_url: 'https://example.com',
      profile_image: 'https://example.com/img.png',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.publisher_type).toBe('consultant')
      expect(result.data.bio).toBe('A bio')
      expect(result.data.credentials).toBe('Licensed GC')
      expect(result.data.website_url).toBe('https://example.com')
    }
  })

  test('updatePublisherSchema accepts partial updates', () => {
    const result = updatePublisherSchema.safeParse({
      display_name: 'Updated Name',
      is_verified: true,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.display_name).toBe('Updated Name')
      expect(result.data.is_verified).toBe(true)
    }
  })

  test('updatePublisherSchema accepts revenue_share_pct', () => {
    const result = updatePublisherSchema.safeParse({ revenue_share_pct: 80 })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.revenue_share_pct).toBe(80)
    }
  })

  test('updatePublisherSchema rejects revenue_share_pct > 100', () => {
    const result = updatePublisherSchema.safeParse({ revenue_share_pct: 101 })
    expect(result.success).toBe(false)
  })

  test('updatePublisherSchema rejects revenue_share_pct < 0', () => {
    const result = updatePublisherSchema.safeParse({ revenue_share_pct: -1 })
    expect(result.success).toBe(false)
  })
})

// ============================================================================
// Template Schemas
// ============================================================================

describe('Module 48 — Template Schemas', () => {
  test('listTemplatesSchema accepts valid params', () => {
    const result = listTemplatesSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  test('listTemplatesSchema rejects limit > 100', () => {
    const result = listTemplatesSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  test('listTemplatesSchema accepts all filters', () => {
    const result = listTemplatesSchema.safeParse({
      template_type: 'estimate',
      publisher_id: '550e8400-e29b-41d4-a716-446655440000',
      review_status: 'approved',
      is_featured: 'true',
      is_free: 'true',
      min_rating: 4,
      q: 'bathroom',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.template_type).toBe('estimate')
      expect(result.data.review_status).toBe('approved')
      expect(result.data.is_featured).toBe(true)
      expect(result.data.is_free).toBe(true)
      expect(result.data.min_rating).toBe(4)
      expect(result.data.q).toBe('bathroom')
    }
  })

  test('createTemplateSchema accepts valid template', () => {
    const result = createTemplateSchema.safeParse({
      publisher_id: '550e8400-e29b-41d4-a716-446655440000',
      template_type: 'estimate',
      name: 'Custom Home Estimate',
      slug: 'custom-home-estimate',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.publisher_type).toBe('builder')
      expect(result.data.price).toBe(0)
      expect(result.data.currency).toBe('USD')
      expect(result.data.version).toBe('1.0.0')
      expect(result.data.review_status).toBe('pending')
      expect(result.data.is_featured).toBe(false)
      expect(result.data.is_active).toBe(true)
      expect(result.data.screenshots).toEqual([])
      expect(result.data.tags).toEqual([])
      expect(result.data.region_tags).toEqual([])
      expect(result.data.construction_tags).toEqual([])
      expect(result.data.template_data).toEqual({})
      expect(result.data.required_modules).toEqual([])
    }
  })

  test('createTemplateSchema requires publisher_id, template_type, name, slug', () => {
    const result = createTemplateSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = Object.keys(result.error.flatten().fieldErrors)
      expect(fields).toContain('publisher_id')
      expect(fields).toContain('template_type')
      expect(fields).toContain('name')
      expect(fields).toContain('slug')
    }
  })

  test('createTemplateSchema rejects name > 255 chars', () => {
    const result = createTemplateSchema.safeParse({
      publisher_id: '550e8400-e29b-41d4-a716-446655440000',
      template_type: 'estimate',
      name: 'x'.repeat(256),
      slug: 'test',
    })
    expect(result.success).toBe(false)
  })

  test('createTemplateSchema validates slug format', () => {
    // Valid slugs
    expect(createTemplateSchema.safeParse({
      publisher_id: '550e8400-e29b-41d4-a716-446655440000',
      template_type: 'estimate',
      name: 'Test',
      slug: 'my-template',
    }).success).toBe(true)

    expect(createTemplateSchema.safeParse({
      publisher_id: '550e8400-e29b-41d4-a716-446655440000',
      template_type: 'estimate',
      name: 'Test',
      slug: 'template123',
    }).success).toBe(true)

    // Invalid slugs
    expect(createTemplateSchema.safeParse({
      publisher_id: '550e8400-e29b-41d4-a716-446655440000',
      template_type: 'estimate',
      name: 'Test',
      slug: 'My Template',
    }).success).toBe(false)

    expect(createTemplateSchema.safeParse({
      publisher_id: '550e8400-e29b-41d4-a716-446655440000',
      template_type: 'estimate',
      name: 'Test',
      slug: 'my_template',
    }).success).toBe(false)
  })

  test('createTemplateSchema rejects negative price', () => {
    const result = createTemplateSchema.safeParse({
      publisher_id: '550e8400-e29b-41d4-a716-446655440000',
      template_type: 'estimate',
      name: 'Test',
      slug: 'test',
      price: -1,
    })
    expect(result.success).toBe(false)
  })

  test('createTemplateSchema accepts full template with all fields', () => {
    const result = createTemplateSchema.safeParse({
      publisher_id: '550e8400-e29b-41d4-a716-446655440000',
      publisher_type: 'consultant',
      template_type: 'checklist',
      name: 'Pre-Drywall Inspection Checklist',
      slug: 'pre-drywall-inspection',
      description: 'A comprehensive checklist for pre-drywall inspections',
      long_description: 'This template includes...',
      screenshots: ['https://example.com/s1.png', 'https://example.com/s2.png'],
      tags: ['inspection', 'drywall'],
      region_tags: ['southeast', 'florida'],
      construction_tags: ['residential', 'custom-home'],
      price: 49.99,
      currency: 'USD',
      template_data: { sections: [], items: [] },
      required_modules: ['punch_list', 'quality_checklists'],
      version: '2.1.0',
      review_status: 'approved',
      is_featured: true,
      is_active: true,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.price).toBe(49.99)
      expect(result.data.tags).toEqual(['inspection', 'drywall'])
      expect(result.data.region_tags).toEqual(['southeast', 'florida'])
      expect(result.data.construction_tags).toEqual(['residential', 'custom-home'])
      expect(result.data.required_modules).toEqual(['punch_list', 'quality_checklists'])
      expect(result.data.is_featured).toBe(true)
    }
  })

  test('updateTemplateSchema accepts partial updates', () => {
    const result = updateTemplateSchema.safeParse({
      name: 'Updated Name',
      price: 29.99,
      is_active: false,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Updated Name')
      expect(result.data.price).toBe(29.99)
      expect(result.data.is_active).toBe(false)
    }
  })

  test('updateTemplateSchema accepts empty object', () => {
    const result = updateTemplateSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  test('updateTemplateSchema validates slug format', () => {
    expect(updateTemplateSchema.safeParse({ slug: 'valid-slug' }).success).toBe(true)
    expect(updateTemplateSchema.safeParse({ slug: 'Invalid Slug' }).success).toBe(false)
  })

  test('updateTemplateSchema accepts review_status', () => {
    const result = updateTemplateSchema.safeParse({ review_status: 'approved' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.review_status).toBe('approved')
    }
  })

  test('updateTemplateSchema rejects invalid review_status', () => {
    const result = updateTemplateSchema.safeParse({ review_status: 'published' })
    expect(result.success).toBe(false)
  })

  test('updateTemplateSchema accepts tags arrays', () => {
    const result = updateTemplateSchema.safeParse({
      tags: ['new-tag'],
      region_tags: ['northeast'],
      construction_tags: ['commercial'],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tags).toEqual(['new-tag'])
    }
  })
})

// ============================================================================
// Template Version Schemas
// ============================================================================

describe('Module 48 — Template Version Schemas', () => {
  test('listTemplateVersionsSchema accepts valid params with defaults', () => {
    const result = listTemplateVersionsSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(50)
    }
  })

  test('listTemplateVersionsSchema rejects limit > 100', () => {
    const result = listTemplateVersionsSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  test('createTemplateVersionSchema accepts valid version', () => {
    const result = createTemplateVersionSchema.safeParse({
      version: '2.0.0',
      changelog: 'Major update with new features',
      template_data: { sections: [1, 2, 3] },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.version).toBe('2.0.0')
      expect(result.data.changelog).toBe('Major update with new features')
    }
  })

  test('createTemplateVersionSchema requires version', () => {
    const result = createTemplateVersionSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  test('createTemplateVersionSchema defaults template_data to empty object', () => {
    const result = createTemplateVersionSchema.safeParse({ version: '1.0.0' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.template_data).toEqual({})
    }
  })

  test('createTemplateVersionSchema rejects version > 20 chars', () => {
    const result = createTemplateVersionSchema.safeParse({ version: 'x'.repeat(21) })
    expect(result.success).toBe(false)
  })

  test('createTemplateVersionSchema accepts null changelog', () => {
    const result = createTemplateVersionSchema.safeParse({ version: '1.0.1', changelog: null })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.changelog).toBeNull()
    }
  })
})

// ============================================================================
// Install Schemas
// ============================================================================

describe('Module 48 — Install Schemas', () => {
  test('listInstallsSchema accepts valid params', () => {
    const result = listInstallsSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  test('listInstallsSchema rejects limit > 100', () => {
    const result = listInstallsSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  test('listInstallsSchema accepts filters', () => {
    const result = listInstallsSchema.safeParse({
      template_id: '550e8400-e29b-41d4-a716-446655440000',
      template_type: 'estimate',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.template_id).toBe('550e8400-e29b-41d4-a716-446655440000')
      expect(result.data.template_type).toBe('estimate')
    }
  })

  test('createInstallSchema accepts valid install', () => {
    const result = createInstallSchema.safeParse({
      template_id: '550e8400-e29b-41d4-a716-446655440000',
      template_version: '1.0.0',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.template_id).toBe('550e8400-e29b-41d4-a716-446655440000')
      expect(result.data.template_version).toBe('1.0.0')
    }
  })

  test('createInstallSchema requires template_id and template_version', () => {
    const result = createInstallSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = Object.keys(result.error.flatten().fieldErrors)
      expect(fields).toContain('template_id')
      expect(fields).toContain('template_version')
    }
  })

  test('createInstallSchema accepts payment fields', () => {
    const result = createInstallSchema.safeParse({
      template_id: '550e8400-e29b-41d4-a716-446655440000',
      template_version: '1.0.0',
      payment_id: '660e8400-e29b-41d4-a716-446655440000',
      payment_amount: 49.99,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.payment_id).toBe('660e8400-e29b-41d4-a716-446655440000')
      expect(result.data.payment_amount).toBe(49.99)
    }
  })

  test('createInstallSchema rejects negative payment_amount', () => {
    const result = createInstallSchema.safeParse({
      template_id: '550e8400-e29b-41d4-a716-446655440000',
      template_version: '1.0.0',
      payment_amount: -10,
    })
    expect(result.success).toBe(false)
  })

  test('createInstallSchema accepts null payment fields', () => {
    const result = createInstallSchema.safeParse({
      template_id: '550e8400-e29b-41d4-a716-446655440000',
      template_version: '1.0.0',
      payment_id: null,
      payment_amount: null,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.payment_id).toBeNull()
      expect(result.data.payment_amount).toBeNull()
    }
  })
})

// ============================================================================
// Review Schemas
// ============================================================================

describe('Module 48 — Review Schemas', () => {
  test('listReviewsSchema accepts valid params', () => {
    const result = listReviewsSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  test('listReviewsSchema rejects limit > 100', () => {
    const result = listReviewsSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  test('listReviewsSchema accepts all filters', () => {
    const result = listReviewsSchema.safeParse({
      template_id: '550e8400-e29b-41d4-a716-446655440000',
      rating: 5,
      is_verified_purchase: 'true',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.template_id).toBe('550e8400-e29b-41d4-a716-446655440000')
      expect(result.data.rating).toBe(5)
      expect(result.data.is_verified_purchase).toBe(true)
    }
  })

  test('listReviewsSchema rejects rating > 5', () => {
    const result = listReviewsSchema.safeParse({ rating: 6 })
    expect(result.success).toBe(false)
  })

  test('listReviewsSchema rejects rating < 1', () => {
    const result = listReviewsSchema.safeParse({ rating: 0 })
    expect(result.success).toBe(false)
  })

  test('createReviewSchema accepts valid review', () => {
    const result = createReviewSchema.safeParse({
      template_id: '550e8400-e29b-41d4-a716-446655440000',
      rating: 4,
      title: 'Good template',
      review_text: 'Works well for custom homes',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.rating).toBe(4)
      expect(result.data.title).toBe('Good template')
      expect(result.data.is_verified_purchase).toBe(true)
    }
  })

  test('createReviewSchema requires template_id and rating', () => {
    const result = createReviewSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = Object.keys(result.error.flatten().fieldErrors)
      expect(fields).toContain('template_id')
      expect(fields).toContain('rating')
    }
  })

  test('createReviewSchema rejects rating > 5', () => {
    const result = createReviewSchema.safeParse({
      template_id: '550e8400-e29b-41d4-a716-446655440000',
      rating: 6,
    })
    expect(result.success).toBe(false)
  })

  test('createReviewSchema rejects rating < 1', () => {
    const result = createReviewSchema.safeParse({
      template_id: '550e8400-e29b-41d4-a716-446655440000',
      rating: 0,
    })
    expect(result.success).toBe(false)
  })

  test('createReviewSchema rejects non-integer rating', () => {
    const result = createReviewSchema.safeParse({
      template_id: '550e8400-e29b-41d4-a716-446655440000',
      rating: 4.5,
    })
    expect(result.success).toBe(false)
  })

  test('createReviewSchema rejects title > 200 chars', () => {
    const result = createReviewSchema.safeParse({
      template_id: '550e8400-e29b-41d4-a716-446655440000',
      rating: 5,
      title: 'x'.repeat(201),
    })
    expect(result.success).toBe(false)
  })

  test('createReviewSchema rejects review_text > 5000 chars', () => {
    const result = createReviewSchema.safeParse({
      template_id: '550e8400-e29b-41d4-a716-446655440000',
      rating: 5,
      review_text: 'x'.repeat(5001),
    })
    expect(result.success).toBe(false)
  })

  test('createReviewSchema accepts null title and review_text', () => {
    const result = createReviewSchema.safeParse({
      template_id: '550e8400-e29b-41d4-a716-446655440000',
      rating: 3,
      title: null,
      review_text: null,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBeNull()
      expect(result.data.review_text).toBeNull()
    }
  })

  test('createReviewSchema defaults is_verified_purchase to true', () => {
    const result = createReviewSchema.safeParse({
      template_id: '550e8400-e29b-41d4-a716-446655440000',
      rating: 5,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.is_verified_purchase).toBe(true)
    }
  })

  test('updateReviewSchema accepts partial updates', () => {
    const result = updateReviewSchema.safeParse({
      rating: 3,
      review_text: 'Updated review text',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.rating).toBe(3)
      expect(result.data.review_text).toBe('Updated review text')
    }
  })

  test('updateReviewSchema accepts empty object', () => {
    const result = updateReviewSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  test('updateReviewSchema accepts is_flagged', () => {
    const result = updateReviewSchema.safeParse({ is_flagged: true })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.is_flagged).toBe(true)
    }
  })

  test('updateReviewSchema accepts publisher_response', () => {
    const result = updateReviewSchema.safeParse({
      publisher_response: 'Thank you for your feedback!',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.publisher_response).toBe('Thank you for your feedback!')
    }
  })

  test('updateReviewSchema rejects publisher_response > 5000 chars', () => {
    const result = updateReviewSchema.safeParse({
      publisher_response: 'x'.repeat(5001),
    })
    expect(result.success).toBe(false)
  })

  test('updateReviewSchema rejects invalid rating', () => {
    expect(updateReviewSchema.safeParse({ rating: 0 }).success).toBe(false)
    expect(updateReviewSchema.safeParse({ rating: 6 }).success).toBe(false)
  })
})
