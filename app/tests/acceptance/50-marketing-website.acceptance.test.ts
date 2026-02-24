/**
 * Module 50 — Marketing Website & Sales Pipeline Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 50 spec.
 */

import { describe, test, expect } from 'vitest'

// -- Types ────────────────────────────────────────────────────────────────────

import type {
  LeadSource,
  PipelineStage,
  ReferralStatus,
  BlogCategory,
  ClosedReason,
  MarketingLead,
  MarketingReferral,
  Testimonial,
  CaseStudy,
  BlogPost,
} from '@/types/marketing-website'

import {
  LEAD_SOURCES,
  PIPELINE_STAGES,
  REFERRAL_STATUSES,
  BLOG_CATEGORIES,
  CLOSED_REASONS,
} from '@/types/marketing-website'

// -- Schemas ──────────────────────────────────────────────────────────────────

import {
  leadSourceEnum,
  pipelineStageEnum,
  referralStatusEnum,
  blogCategoryEnum,
  closedReasonEnum,
  listMarketingLeadsSchema,
  createMarketingLeadSchema,
  updateMarketingLeadSchema,
  listMarketingReferralsSchema,
  createMarketingReferralSchema,
  updateMarketingReferralSchema,
  listTestimonialsSchema,
  createTestimonialSchema,
  updateTestimonialSchema,
  listCaseStudiesSchema,
  createCaseStudySchema,
  updateCaseStudySchema,
  listBlogPostsSchema,
  createBlogPostSchema,
  updateBlogPostSchema,
} from '@/lib/validation/schemas/marketing-website'

// ============================================================================
// Type System
// ============================================================================

describe('Module 50 — Marketing Website Types', () => {
  test('LeadSource has 4 values', () => {
    const sources: LeadSource[] = ['website_trial', 'demo_request', 'contact_form', 'referral']
    expect(sources).toHaveLength(4)
  })

  test('PipelineStage has 8 values', () => {
    const stages: PipelineStage[] = [
      'captured', 'qualified', 'demo_scheduled', 'demo_completed',
      'proposal_sent', 'negotiation', 'closed_won', 'closed_lost',
    ]
    expect(stages).toHaveLength(8)
  })

  test('ReferralStatus has 4 values', () => {
    const statuses: ReferralStatus[] = ['link_created', 'clicked', 'signed_up', 'converted']
    expect(statuses).toHaveLength(4)
  })

  test('BlogCategory has 4 values', () => {
    const categories: BlogCategory[] = ['industry', 'product', 'how_to', 'customer_spotlight']
    expect(categories).toHaveLength(4)
  })

  test('ClosedReason has 5 values', () => {
    const reasons: ClosedReason[] = ['won', 'lost_price', 'lost_features', 'lost_competitor', 'lost_timing']
    expect(reasons).toHaveLength(5)
  })

  test('MarketingLead interface has all required fields', () => {
    const lead: MarketingLead = {
      id: '1', source: 'website_trial', utm_source: null, utm_medium: null,
      utm_campaign: null, name: 'John Doe', email: 'john@example.com',
      company_name: 'Acme Builders', phone: '555-0100', company_size: '10-50',
      current_tools: 'Buildertrend', pipeline_stage: 'captured', assigned_to: null,
      deal_value: 5000, close_probability: 25, closed_at: null, closed_reason: null,
      competitor_name: null, notes: null, crm_id: null,
      created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(lead.id).toBeDefined()
    expect(lead.name).toBe('John Doe')
    expect(lead.pipeline_stage).toBe('captured')
    expect(lead.deal_value).toBe(5000)
    expect(lead.close_probability).toBe(25)
  })

  test('MarketingReferral interface has all required fields', () => {
    const referral: MarketingReferral = {
      id: '1', referrer_company_id: '1', referral_code: 'REF123',
      referred_email: 'ref@example.com', referred_company_name: 'New Builder',
      referred_company_id: null, status: 'link_created', referrer_credit: 100,
      credit_applied: false, clicked_at: null, signed_up_at: null,
      converted_at: null, notes: null, created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(referral.id).toBeDefined()
    expect(referral.referral_code).toBe('REF123')
    expect(referral.referrer_credit).toBe(100)
    expect(referral.credit_applied).toBe(false)
  })

  test('Testimonial interface has all required fields', () => {
    const testimonial: Testimonial = {
      id: '1', company_id: '1', contact_name: 'Jane Smith',
      contact_title: 'Owner', company_display_name: 'Smith Homes',
      quote_text: 'Great platform!', rating: 5, video_url: null,
      photo_url: null, is_approved: true, is_featured: false,
      display_on: ['homepage'], collected_at: '2026-01-15',
      approved_by: null, approved_at: null,
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(testimonial.id).toBeDefined()
    expect(testimonial.contact_name).toBe('Jane Smith')
    expect(testimonial.rating).toBe(5)
    expect(testimonial.is_approved).toBe(true)
    expect(testimonial.display_on).toEqual(['homepage'])
  })

  test('CaseStudy interface has all required fields', () => {
    const caseStudy: CaseStudy = {
      id: '1', title: 'Building Success', slug: 'building-success',
      company_name: 'Acme Builders', company_size: '10-50',
      challenge: 'Manual tracking', solution: 'RossOS',
      results: '50% faster', metrics: { savings: 100000 },
      quote_text: 'Life changing!', quote_author: 'John Doe',
      photos: ['photo1.jpg'], industry_tags: ['residential'],
      region_tags: ['southeast'], is_published: true,
      published_at: '2026-01-15', created_by: null,
      created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(caseStudy.id).toBeDefined()
    expect(caseStudy.slug).toBe('building-success')
    expect(caseStudy.metrics).toEqual({ savings: 100000 })
    expect(caseStudy.industry_tags).toEqual(['residential'])
  })

  test('BlogPost interface has all required fields', () => {
    const post: BlogPost = {
      id: '1', title: 'Top 10 Tips', slug: 'top-10-tips',
      excerpt: 'Learn the best...', body_html: '<p>Hello</p>',
      author_name: 'Admin', category: 'how_to',
      tags: ['tips', 'construction'], featured_image: null,
      meta_title: 'Top 10 Tips', meta_description: 'Best tips for builders',
      is_published: false, published_at: null, view_count: 0,
      created_by: null, created_at: '2026-01-15', updated_at: '2026-01-15',
      deleted_at: null,
    }
    expect(post.id).toBeDefined()
    expect(post.slug).toBe('top-10-tips')
    expect(post.category).toBe('how_to')
    expect(post.view_count).toBe(0)
    expect(post.tags).toEqual(['tips', 'construction'])
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 50 — Marketing Website Constants', () => {
  test('LEAD_SOURCES has 4 entries with value and label', () => {
    expect(LEAD_SOURCES).toHaveLength(4)
    LEAD_SOURCES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  test('LEAD_SOURCES includes all expected values', () => {
    const values = LEAD_SOURCES.map((s) => s.value)
    expect(values).toContain('website_trial')
    expect(values).toContain('demo_request')
    expect(values).toContain('contact_form')
    expect(values).toContain('referral')
  })

  test('PIPELINE_STAGES has 8 entries with value and label', () => {
    expect(PIPELINE_STAGES).toHaveLength(8)
    PIPELINE_STAGES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  test('PIPELINE_STAGES includes all expected values', () => {
    const values = PIPELINE_STAGES.map((s) => s.value)
    expect(values).toContain('captured')
    expect(values).toContain('qualified')
    expect(values).toContain('demo_scheduled')
    expect(values).toContain('demo_completed')
    expect(values).toContain('proposal_sent')
    expect(values).toContain('negotiation')
    expect(values).toContain('closed_won')
    expect(values).toContain('closed_lost')
  })

  test('REFERRAL_STATUSES has 4 entries with value and label', () => {
    expect(REFERRAL_STATUSES).toHaveLength(4)
    REFERRAL_STATUSES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  test('REFERRAL_STATUSES includes all expected values', () => {
    const values = REFERRAL_STATUSES.map((s) => s.value)
    expect(values).toContain('link_created')
    expect(values).toContain('clicked')
    expect(values).toContain('signed_up')
    expect(values).toContain('converted')
  })

  test('BLOG_CATEGORIES has 4 entries with value and label', () => {
    expect(BLOG_CATEGORIES).toHaveLength(4)
    BLOG_CATEGORIES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  test('BLOG_CATEGORIES includes all expected values', () => {
    const values = BLOG_CATEGORIES.map((s) => s.value)
    expect(values).toContain('industry')
    expect(values).toContain('product')
    expect(values).toContain('how_to')
    expect(values).toContain('customer_spotlight')
  })

  test('CLOSED_REASONS has 5 entries with value and label', () => {
    expect(CLOSED_REASONS).toHaveLength(5)
    CLOSED_REASONS.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  test('CLOSED_REASONS includes all expected values', () => {
    const values = CLOSED_REASONS.map((s) => s.value)
    expect(values).toContain('won')
    expect(values).toContain('lost_price')
    expect(values).toContain('lost_features')
    expect(values).toContain('lost_competitor')
    expect(values).toContain('lost_timing')
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 50 — Enum Schemas', () => {
  test('leadSourceEnum accepts all 4 sources', () => {
    const sources = ['website_trial', 'demo_request', 'contact_form', 'referral']
    sources.forEach((s) => {
      expect(leadSourceEnum.safeParse(s).success).toBe(true)
    })
  })

  test('leadSourceEnum rejects invalid source', () => {
    expect(leadSourceEnum.safeParse('invalid').success).toBe(false)
  })

  test('pipelineStageEnum accepts all 8 stages', () => {
    const stages = [
      'captured', 'qualified', 'demo_scheduled', 'demo_completed',
      'proposal_sent', 'negotiation', 'closed_won', 'closed_lost',
    ]
    stages.forEach((s) => {
      expect(pipelineStageEnum.safeParse(s).success).toBe(true)
    })
  })

  test('pipelineStageEnum rejects invalid stage', () => {
    expect(pipelineStageEnum.safeParse('invalid').success).toBe(false)
  })

  test('referralStatusEnum accepts all 4 statuses', () => {
    const statuses = ['link_created', 'clicked', 'signed_up', 'converted']
    statuses.forEach((s) => {
      expect(referralStatusEnum.safeParse(s).success).toBe(true)
    })
  })

  test('referralStatusEnum rejects invalid status', () => {
    expect(referralStatusEnum.safeParse('invalid').success).toBe(false)
  })

  test('blogCategoryEnum accepts all 4 categories', () => {
    const categories = ['industry', 'product', 'how_to', 'customer_spotlight']
    categories.forEach((c) => {
      expect(blogCategoryEnum.safeParse(c).success).toBe(true)
    })
  })

  test('blogCategoryEnum rejects invalid category', () => {
    expect(blogCategoryEnum.safeParse('invalid').success).toBe(false)
  })

  test('closedReasonEnum accepts all 5 reasons', () => {
    const reasons = ['won', 'lost_price', 'lost_features', 'lost_competitor', 'lost_timing']
    reasons.forEach((r) => {
      expect(closedReasonEnum.safeParse(r).success).toBe(true)
    })
  })

  test('closedReasonEnum rejects invalid reason', () => {
    expect(closedReasonEnum.safeParse('invalid').success).toBe(false)
  })
})

// ============================================================================
// Marketing Lead Schemas
// ============================================================================

describe('Module 50 — Marketing Lead Schemas', () => {
  test('listMarketingLeadsSchema accepts valid params', () => {
    const result = listMarketingLeadsSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  test('listMarketingLeadsSchema rejects limit > 100', () => {
    const result = listMarketingLeadsSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  test('listMarketingLeadsSchema accepts all filters', () => {
    const result = listMarketingLeadsSchema.safeParse({
      source: 'referral',
      pipeline_stage: 'qualified',
      assigned_to: '550e8400-e29b-41d4-a716-446655440000',
      closed_reason: 'lost_price',
      q: 'test',
    })
    expect(result.success).toBe(true)
  })

  test('createMarketingLeadSchema accepts valid lead', () => {
    const result = createMarketingLeadSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.source).toBe('contact_form')
      expect(result.data.pipeline_stage).toBe('captured')
      expect(result.data.deal_value).toBe(0)
      expect(result.data.close_probability).toBe(0)
    }
  })

  test('createMarketingLeadSchema requires name and email', () => {
    const result = createMarketingLeadSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined()
      expect(result.error.flatten().fieldErrors.email).toBeDefined()
    }
  })

  test('createMarketingLeadSchema rejects invalid email', () => {
    const result = createMarketingLeadSchema.safeParse({
      name: 'John', email: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })

  test('createMarketingLeadSchema rejects name > 255 chars', () => {
    const result = createMarketingLeadSchema.safeParse({
      name: 'x'.repeat(256), email: 'john@example.com',
    })
    expect(result.success).toBe(false)
  })

  test('createMarketingLeadSchema rejects close_probability > 100', () => {
    const result = createMarketingLeadSchema.safeParse({
      name: 'John', email: 'john@example.com', close_probability: 101,
    })
    expect(result.success).toBe(false)
  })

  test('createMarketingLeadSchema rejects negative deal_value', () => {
    const result = createMarketingLeadSchema.safeParse({
      name: 'John', email: 'john@example.com', deal_value: -1,
    })
    expect(result.success).toBe(false)
  })

  test('createMarketingLeadSchema accepts full lead with all optional fields', () => {
    const result = createMarketingLeadSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      source: 'demo_request',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'spring-2026',
      company_name: 'Acme Builders',
      phone: '555-0100',
      company_size: '10-50',
      current_tools: 'Buildertrend',
      pipeline_stage: 'qualified',
      assigned_to: '550e8400-e29b-41d4-a716-446655440000',
      deal_value: 5000,
      close_probability: 75,
      competitor_name: 'CoConstruct',
      notes: 'Hot lead',
      crm_id: 'CRM-123',
    })
    expect(result.success).toBe(true)
  })

  test('updateMarketingLeadSchema accepts partial updates', () => {
    const result = updateMarketingLeadSchema.safeParse({
      pipeline_stage: 'demo_scheduled',
      deal_value: 10000,
    })
    expect(result.success).toBe(true)
  })

  test('updateMarketingLeadSchema accepts closed_reason and closed_at', () => {
    const result = updateMarketingLeadSchema.safeParse({
      pipeline_stage: 'closed_lost',
      closed_reason: 'lost_competitor',
      closed_at: '2026-03-01',
      competitor_name: 'Buildertrend',
    })
    expect(result.success).toBe(true)
  })

  test('updateMarketingLeadSchema rejects invalid closed_at format', () => {
    const result = updateMarketingLeadSchema.safeParse({
      closed_at: '01-15-2026',
    })
    expect(result.success).toBe(false)
  })

  test('updateMarketingLeadSchema accepts null closed_reason', () => {
    const result = updateMarketingLeadSchema.safeParse({
      closed_reason: null,
    })
    expect(result.success).toBe(true)
  })
})

// ============================================================================
// Marketing Referral Schemas
// ============================================================================

describe('Module 50 — Marketing Referral Schemas', () => {
  test('listMarketingReferralsSchema accepts valid params', () => {
    const result = listMarketingReferralsSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  test('listMarketingReferralsSchema rejects limit > 100', () => {
    const result = listMarketingReferralsSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  test('listMarketingReferralsSchema accepts filters', () => {
    const result = listMarketingReferralsSchema.safeParse({
      status: 'converted',
      credit_applied: 'true',
      q: 'test',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.credit_applied).toBe(true)
    }
  })

  test('listMarketingReferralsSchema handles boolean preprocess for credit_applied', () => {
    const trueResult = listMarketingReferralsSchema.safeParse({ credit_applied: 'true' })
    expect(trueResult.success).toBe(true)
    if (trueResult.success) {
      expect(trueResult.data.credit_applied).toBe(true)
    }

    const falseResult = listMarketingReferralsSchema.safeParse({ credit_applied: 'false' })
    expect(falseResult.success).toBe(true)
    if (falseResult.success) {
      expect(falseResult.data.credit_applied).toBe(false)
    }
  })

  test('createMarketingReferralSchema accepts valid referral', () => {
    const result = createMarketingReferralSchema.safeParse({
      referral_code: 'REF123',
      referred_email: 'ref@example.com',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('link_created')
      expect(result.data.referrer_credit).toBe(0)
    }
  })

  test('createMarketingReferralSchema requires referral_code and referred_email', () => {
    const result = createMarketingReferralSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.referral_code).toBeDefined()
      expect(result.error.flatten().fieldErrors.referred_email).toBeDefined()
    }
  })

  test('createMarketingReferralSchema rejects referral_code > 20 chars', () => {
    const result = createMarketingReferralSchema.safeParse({
      referral_code: 'x'.repeat(21), referred_email: 'ref@example.com',
    })
    expect(result.success).toBe(false)
  })

  test('createMarketingReferralSchema rejects invalid email', () => {
    const result = createMarketingReferralSchema.safeParse({
      referral_code: 'REF123', referred_email: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })

  test('createMarketingReferralSchema rejects negative credit', () => {
    const result = createMarketingReferralSchema.safeParse({
      referral_code: 'REF123', referred_email: 'ref@example.com', referrer_credit: -1,
    })
    expect(result.success).toBe(false)
  })

  test('createMarketingReferralSchema accepts all optional fields', () => {
    const result = createMarketingReferralSchema.safeParse({
      referral_code: 'REF456',
      referred_email: 'ref@example.com',
      referred_company_name: 'New Builder LLC',
      status: 'clicked',
      referrer_credit: 250,
      notes: 'Met at trade show',
    })
    expect(result.success).toBe(true)
  })

  test('updateMarketingReferralSchema accepts partial updates', () => {
    const result = updateMarketingReferralSchema.safeParse({
      status: 'converted',
      credit_applied: true,
    })
    expect(result.success).toBe(true)
  })

  test('updateMarketingReferralSchema accepts referred_company_id', () => {
    const result = updateMarketingReferralSchema.safeParse({
      referred_company_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })
})

// ============================================================================
// Testimonial Schemas
// ============================================================================

describe('Module 50 — Testimonial Schemas', () => {
  test('listTestimonialsSchema accepts valid params', () => {
    const result = listTestimonialsSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  test('listTestimonialsSchema rejects limit > 100', () => {
    const result = listTestimonialsSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  test('listTestimonialsSchema accepts all filters', () => {
    const result = listTestimonialsSchema.safeParse({
      is_approved: 'true',
      is_featured: 'false',
      rating: 5,
      q: 'great',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.is_approved).toBe(true)
      expect(result.data.is_featured).toBe(false)
      expect(result.data.rating).toBe(5)
    }
  })

  test('listTestimonialsSchema handles boolean preprocess', () => {
    const result = listTestimonialsSchema.safeParse({
      is_approved: 'true', is_featured: 'false',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.is_approved).toBe(true)
      expect(result.data.is_featured).toBe(false)
    }
  })

  test('createTestimonialSchema accepts valid testimonial', () => {
    const result = createTestimonialSchema.safeParse({
      contact_name: 'Jane Smith',
      quote_text: 'RossOS changed our business!',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.is_approved).toBe(false)
      expect(result.data.is_featured).toBe(false)
      expect(result.data.display_on).toEqual([])
    }
  })

  test('createTestimonialSchema requires contact_name and quote_text', () => {
    const result = createTestimonialSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.contact_name).toBeDefined()
      expect(result.error.flatten().fieldErrors.quote_text).toBeDefined()
    }
  })

  test('createTestimonialSchema rejects contact_name > 200 chars', () => {
    const result = createTestimonialSchema.safeParse({
      contact_name: 'x'.repeat(201), quote_text: 'Great!',
    })
    expect(result.success).toBe(false)
  })

  test('createTestimonialSchema validates rating range 1-5', () => {
    const low = createTestimonialSchema.safeParse({
      contact_name: 'Jane', quote_text: 'Ok', rating: 0,
    })
    expect(low.success).toBe(false)

    const high = createTestimonialSchema.safeParse({
      contact_name: 'Jane', quote_text: 'Ok', rating: 6,
    })
    expect(high.success).toBe(false)

    const valid = createTestimonialSchema.safeParse({
      contact_name: 'Jane', quote_text: 'Ok', rating: 3,
    })
    expect(valid.success).toBe(true)
  })

  test('createTestimonialSchema validates video_url format', () => {
    const invalid = createTestimonialSchema.safeParse({
      contact_name: 'Jane', quote_text: 'Ok', video_url: 'not-a-url',
    })
    expect(invalid.success).toBe(false)

    const valid = createTestimonialSchema.safeParse({
      contact_name: 'Jane', quote_text: 'Ok', video_url: 'https://youtube.com/watch?v=123',
    })
    expect(valid.success).toBe(true)
  })

  test('createTestimonialSchema accepts full testimonial with all fields', () => {
    const result = createTestimonialSchema.safeParse({
      contact_name: 'Jane Smith',
      contact_title: 'CEO',
      company_display_name: 'Smith Homes',
      quote_text: 'Absolutely incredible platform!',
      rating: 5,
      video_url: 'https://youtube.com/watch?v=abc',
      photo_url: 'https://photos.example.com/jane.jpg',
      is_approved: true,
      is_featured: true,
      display_on: ['homepage', 'pricing'],
      collected_at: '2026-01-15',
    })
    expect(result.success).toBe(true)
  })

  test('createTestimonialSchema validates collected_at date format', () => {
    const invalid = createTestimonialSchema.safeParse({
      contact_name: 'Jane', quote_text: 'Ok', collected_at: '01-15-2026',
    })
    expect(invalid.success).toBe(false)

    const valid = createTestimonialSchema.safeParse({
      contact_name: 'Jane', quote_text: 'Ok', collected_at: '2026-01-15',
    })
    expect(valid.success).toBe(true)
  })

  test('updateTestimonialSchema accepts partial updates', () => {
    const result = updateTestimonialSchema.safeParse({
      is_approved: true,
      is_featured: true,
    })
    expect(result.success).toBe(true)
  })

  test('updateTestimonialSchema accepts rating update', () => {
    const result = updateTestimonialSchema.safeParse({ rating: 4 })
    expect(result.success).toBe(true)
  })

  test('updateTestimonialSchema rejects rating > 5', () => {
    const result = updateTestimonialSchema.safeParse({ rating: 6 })
    expect(result.success).toBe(false)
  })
})

// ============================================================================
// Case Study Schemas
// ============================================================================

describe('Module 50 — Case Study Schemas', () => {
  test('listCaseStudiesSchema accepts valid params', () => {
    const result = listCaseStudiesSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  test('listCaseStudiesSchema rejects limit > 100', () => {
    const result = listCaseStudiesSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  test('listCaseStudiesSchema accepts is_published filter', () => {
    const result = listCaseStudiesSchema.safeParse({ is_published: 'true' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.is_published).toBe(true)
    }
  })

  test('createCaseStudySchema accepts valid case study', () => {
    const result = createCaseStudySchema.safeParse({
      title: 'Success Story',
      slug: 'success-story',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.is_published).toBe(false)
      expect(result.data.metrics).toEqual({})
      expect(result.data.photos).toEqual([])
      expect(result.data.industry_tags).toEqual([])
      expect(result.data.region_tags).toEqual([])
    }
  })

  test('createCaseStudySchema requires title and slug', () => {
    const result = createCaseStudySchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.title).toBeDefined()
      expect(result.error.flatten().fieldErrors.slug).toBeDefined()
    }
  })

  test('createCaseStudySchema rejects title > 255 chars', () => {
    const result = createCaseStudySchema.safeParse({
      title: 'x'.repeat(256), slug: 'valid-slug',
    })
    expect(result.success).toBe(false)
  })

  test('createCaseStudySchema validates slug format', () => {
    const invalid = createCaseStudySchema.safeParse({
      title: 'Test', slug: 'Invalid Slug!',
    })
    expect(invalid.success).toBe(false)

    const valid = createCaseStudySchema.safeParse({
      title: 'Test', slug: 'valid-slug-123',
    })
    expect(valid.success).toBe(true)
  })

  test('createCaseStudySchema rejects slug with uppercase', () => {
    const result = createCaseStudySchema.safeParse({
      title: 'Test', slug: 'Invalid-Slug',
    })
    expect(result.success).toBe(false)
  })

  test('createCaseStudySchema accepts full case study', () => {
    const result = createCaseStudySchema.safeParse({
      title: 'Building the Future',
      slug: 'building-the-future',
      company_name: 'Acme Builders',
      company_size: '50-100',
      challenge: 'Manual processes slowing growth',
      solution: 'Implemented RossOS platform-wide',
      results: '45% reduction in administrative overhead',
      metrics: { time_saved: '20hrs/week', cost_saved: '$150k/year' },
      quote_text: 'Best decision we ever made',
      quote_author: 'Mike Johnson, CEO',
      photos: ['hero.jpg', 'team.jpg'],
      industry_tags: ['residential', 'custom-homes'],
      region_tags: ['southeast', 'florida'],
      is_published: true,
    })
    expect(result.success).toBe(true)
  })

  test('updateCaseStudySchema accepts partial updates', () => {
    const result = updateCaseStudySchema.safeParse({
      is_published: true,
      title: 'Updated Title',
    })
    expect(result.success).toBe(true)
  })

  test('updateCaseStudySchema validates slug format', () => {
    const invalid = updateCaseStudySchema.safeParse({
      slug: 'INVALID',
    })
    expect(invalid.success).toBe(false)

    const valid = updateCaseStudySchema.safeParse({
      slug: 'new-valid-slug',
    })
    expect(valid.success).toBe(true)
  })

  test('updateCaseStudySchema accepts metrics update', () => {
    const result = updateCaseStudySchema.safeParse({
      metrics: { roi: '300%', adoption_rate: '95%' },
    })
    expect(result.success).toBe(true)
  })

  test('updateCaseStudySchema accepts tags update', () => {
    const result = updateCaseStudySchema.safeParse({
      industry_tags: ['commercial'],
      region_tags: ['northeast'],
    })
    expect(result.success).toBe(true)
  })
})

// ============================================================================
// Blog Post Schemas
// ============================================================================

describe('Module 50 — Blog Post Schemas', () => {
  test('listBlogPostsSchema accepts valid params', () => {
    const result = listBlogPostsSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  test('listBlogPostsSchema rejects limit > 100', () => {
    const result = listBlogPostsSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  test('listBlogPostsSchema accepts all filters', () => {
    const result = listBlogPostsSchema.safeParse({
      category: 'how_to',
      is_published: 'true',
      q: 'construction',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.category).toBe('how_to')
      expect(result.data.is_published).toBe(true)
    }
  })

  test('listBlogPostsSchema rejects invalid category', () => {
    const result = listBlogPostsSchema.safeParse({ category: 'invalid' })
    expect(result.success).toBe(false)
  })

  test('createBlogPostSchema accepts valid blog post', () => {
    const result = createBlogPostSchema.safeParse({
      title: 'Top 10 Tips',
      slug: 'top-10-tips',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.category).toBe('industry')
      expect(result.data.is_published).toBe(false)
      expect(result.data.tags).toEqual([])
    }
  })

  test('createBlogPostSchema requires title and slug', () => {
    const result = createBlogPostSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.title).toBeDefined()
      expect(result.error.flatten().fieldErrors.slug).toBeDefined()
    }
  })

  test('createBlogPostSchema rejects title > 255 chars', () => {
    const result = createBlogPostSchema.safeParse({
      title: 'x'.repeat(256), slug: 'valid-slug',
    })
    expect(result.success).toBe(false)
  })

  test('createBlogPostSchema validates slug format', () => {
    const invalid = createBlogPostSchema.safeParse({
      title: 'Test', slug: 'Invalid Slug!',
    })
    expect(invalid.success).toBe(false)

    const valid = createBlogPostSchema.safeParse({
      title: 'Test', slug: 'valid-slug-123',
    })
    expect(valid.success).toBe(true)
  })

  test('createBlogPostSchema rejects slug with uppercase', () => {
    const result = createBlogPostSchema.safeParse({
      title: 'Test', slug: 'Invalid-Slug',
    })
    expect(result.success).toBe(false)
  })

  test('createBlogPostSchema validates featured_image URL', () => {
    const invalid = createBlogPostSchema.safeParse({
      title: 'Test', slug: 'test', featured_image: 'not-a-url',
    })
    expect(invalid.success).toBe(false)

    const valid = createBlogPostSchema.safeParse({
      title: 'Test', slug: 'test', featured_image: 'https://images.example.com/hero.jpg',
    })
    expect(valid.success).toBe(true)
  })

  test('createBlogPostSchema rejects meta_title > 200 chars', () => {
    const result = createBlogPostSchema.safeParse({
      title: 'Test', slug: 'test', meta_title: 'x'.repeat(201),
    })
    expect(result.success).toBe(false)
  })

  test('createBlogPostSchema rejects meta_description > 500 chars', () => {
    const result = createBlogPostSchema.safeParse({
      title: 'Test', slug: 'test', meta_description: 'x'.repeat(501),
    })
    expect(result.success).toBe(false)
  })

  test('createBlogPostSchema accepts full blog post with all fields', () => {
    const result = createBlogPostSchema.safeParse({
      title: 'Complete Guide to Construction Management',
      slug: 'complete-guide-construction-management',
      excerpt: 'Everything you need to know...',
      body_html: '<h1>Guide</h1><p>Content here</p>',
      author_name: 'Sarah Johnson',
      category: 'how_to',
      tags: ['construction', 'management', 'guide'],
      featured_image: 'https://images.example.com/guide.jpg',
      meta_title: 'Complete Construction Management Guide',
      meta_description: 'Learn everything about construction management in this comprehensive guide.',
      is_published: true,
    })
    expect(result.success).toBe(true)
  })

  test('updateBlogPostSchema accepts partial updates', () => {
    const result = updateBlogPostSchema.safeParse({
      is_published: true,
      title: 'Updated Title',
    })
    expect(result.success).toBe(true)
  })

  test('updateBlogPostSchema validates slug format', () => {
    const invalid = updateBlogPostSchema.safeParse({ slug: 'INVALID' })
    expect(invalid.success).toBe(false)

    const valid = updateBlogPostSchema.safeParse({ slug: 'new-valid-slug' })
    expect(valid.success).toBe(true)
  })

  test('updateBlogPostSchema accepts category update', () => {
    const result = updateBlogPostSchema.safeParse({ category: 'product' })
    expect(result.success).toBe(true)
  })

  test('updateBlogPostSchema rejects invalid category', () => {
    const result = updateBlogPostSchema.safeParse({ category: 'invalid' })
    expect(result.success).toBe(false)
  })

  test('updateBlogPostSchema accepts tags update', () => {
    const result = updateBlogPostSchema.safeParse({
      tags: ['new-tag', 'another-tag'],
    })
    expect(result.success).toBe(true)
  })

  test('updateBlogPostSchema accepts null featured_image', () => {
    const result = updateBlogPostSchema.safeParse({ featured_image: null })
    expect(result.success).toBe(true)
  })
})
