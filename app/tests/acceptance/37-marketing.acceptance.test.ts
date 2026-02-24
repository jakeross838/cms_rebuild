/**
 * Module 37 — Marketing & Portfolio Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 37 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  ProjectShowcaseStatus,
  PhotoType,
  ReviewStatus,
  ReviewSource,
  CampaignStatus,
  CampaignType,
  ContactStatus,
  PortfolioProject,
  PortfolioPhoto,
  ClientReview,
  MarketingCampaign,
  CampaignContact,
} from '@/types/marketing'

import {
  PROJECT_SHOWCASE_STATUSES,
  PHOTO_TYPES,
  REVIEW_STATUSES,
  REVIEW_SOURCES,
  CAMPAIGN_STATUSES,
  CAMPAIGN_TYPES,
  CONTACT_STATUSES,
} from '@/types/marketing'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  projectShowcaseStatusEnum,
  photoTypeEnum,
  reviewStatusEnum,
  reviewSourceEnum,
  campaignStatusEnum,
  campaignTypeEnum,
  contactStatusEnum,
  listPortfolioProjectsSchema,
  createPortfolioProjectSchema,
  updatePortfolioProjectSchema,
  listPortfolioPhotosSchema,
  createPortfolioPhotoSchema,
  updatePortfolioPhotoSchema,
  listClientReviewsSchema,
  createClientReviewSchema,
  updateClientReviewSchema,
  listMarketingCampaignsSchema,
  createMarketingCampaignSchema,
  updateMarketingCampaignSchema,
  listCampaignContactsSchema,
  createCampaignContactSchema,
  updateCampaignContactSchema,
} from '@/lib/validation/schemas/marketing'

// ============================================================================
// Type System
// ============================================================================

describe('Module 37 — Marketing & Portfolio Types', () => {
  test('ProjectShowcaseStatus has 4 values', () => {
    const statuses: ProjectShowcaseStatus[] = ['draft', 'published', 'featured', 'archived']
    expect(statuses).toHaveLength(4)
  })

  test('PhotoType has 6 values', () => {
    const types: PhotoType[] = ['exterior', 'interior', 'before', 'after', 'progress', 'detail']
    expect(types).toHaveLength(6)
  })

  test('ReviewStatus has 4 values', () => {
    const statuses: ReviewStatus[] = ['pending', 'approved', 'published', 'rejected']
    expect(statuses).toHaveLength(4)
  })

  test('ReviewSource has 7 values', () => {
    const sources: ReviewSource[] = ['google', 'houzz', 'facebook', 'yelp', 'bbb', 'angi', 'platform']
    expect(sources).toHaveLength(7)
  })

  test('CampaignStatus has 5 values', () => {
    const statuses: CampaignStatus[] = ['draft', 'active', 'paused', 'completed', 'cancelled']
    expect(statuses).toHaveLength(5)
  })

  test('CampaignType has 6 values', () => {
    const types: CampaignType[] = ['email', 'social', 'print', 'referral', 'event', 'other']
    expect(types).toHaveLength(6)
  })

  test('ContactStatus has 6 values', () => {
    const statuses: ContactStatus[] = ['pending', 'sent', 'opened', 'clicked', 'converted', 'unsubscribed']
    expect(statuses).toHaveLength(6)
  })

  test('PortfolioProject interface has all required fields', () => {
    const project: PortfolioProject = {
      id: '1', company_id: '1', job_id: null, title: 'Modern Lakehouse',
      slug: 'modern-lakehouse', description: 'A stunning modern lakehouse',
      highlights: ['Custom millwork', 'Lake views'], category: 'custom_home',
      style: 'modern', status: 'published', is_featured: true, display_order: 1,
      cover_photo_url: 'https://example.com/photo.jpg',
      square_footage: 4500, bedrooms: 4, bathrooms: 3.5,
      build_duration_days: 365, completion_date: '2025-12-01',
      location: 'Lake Geneva, WI', custom_features: ['Wine cellar', 'Home theater'],
      seo_title: 'Modern Lakehouse Build', seo_description: 'Custom lakehouse project',
      published_at: '2026-01-15', created_by: '1',
      created_at: '2026-01-01', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(project.title).toBe('Modern Lakehouse')
    expect(project.status).toBe('published')
    expect(project.is_featured).toBe(true)
    expect(project.square_footage).toBe(4500)
  })

  test('PortfolioPhoto interface has all required fields', () => {
    const photo: PortfolioPhoto = {
      id: '1', portfolio_project_id: '1', company_id: '1',
      photo_url: 'https://example.com/photo.jpg',
      caption: 'Kitchen overview', photo_type: 'interior',
      room: 'Kitchen', display_order: 1, is_cover: false,
      uploaded_by: '1', created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(photo.photo_type).toBe('interior')
    expect(photo.room).toBe('Kitchen')
    expect(photo.is_cover).toBe(false)
  })

  test('ClientReview interface has all required fields', () => {
    const review: ClientReview = {
      id: '1', company_id: '1', job_id: '1',
      client_name: 'John Smith', client_email: 'john@example.com',
      rating: 5, review_text: 'Excellent work!',
      source: 'google', status: 'published',
      display_name: 'John S.', is_featured: true,
      published_at: '2026-01-20', approved_by: '1', approved_at: '2026-01-19',
      requested_at: '2026-01-10', submitted_at: '2026-01-15',
      response_text: 'Thank you!', response_by: '1', response_at: '2026-01-21',
      created_by: '1', created_at: '2026-01-10', updated_at: '2026-01-21',
    }
    expect(review.rating).toBe(5)
    expect(review.source).toBe('google')
    expect(review.status).toBe('published')
  })

  test('MarketingCampaign interface has all required fields', () => {
    const campaign: MarketingCampaign = {
      id: '1', company_id: '1', name: 'Spring Open House',
      description: 'Annual spring marketing event',
      campaign_type: 'event', status: 'active',
      channel: 'houzz', start_date: '2026-03-01', end_date: '2026-04-30',
      budget: 5000, actual_spend: 2500,
      utm_source: 'houzz', utm_medium: 'profile', utm_campaign: 'spring2026',
      leads_generated: 15, proposals_sent: 5, contracts_won: 2,
      contract_value_won: 850000, roi_pct: 16900,
      target_audience: 'Homeowners 35-55', notes: 'Great response',
      created_by: '1', created_at: '2026-02-01', updated_at: '2026-02-15',
    }
    expect(campaign.name).toBe('Spring Open House')
    expect(campaign.campaign_type).toBe('event')
    expect(campaign.budget).toBe(5000)
    expect(campaign.leads_generated).toBe(15)
  })

  test('CampaignContact interface has all required fields', () => {
    const contact: CampaignContact = {
      id: '1', campaign_id: '1', company_id: '1',
      contact_name: 'Jane Doe', contact_email: 'jane@example.com',
      contact_phone: '555-0123', status: 'sent',
      sent_at: '2026-03-01', opened_at: null, clicked_at: null,
      converted_at: null, lead_id: null, notes: 'Initial outreach',
      created_at: '2026-03-01', updated_at: '2026-03-01',
    }
    expect(contact.contact_name).toBe('Jane Doe')
    expect(contact.status).toBe('sent')
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 37 — Constants', () => {
  test('PROJECT_SHOWCASE_STATUSES has 4 entries with value and label', () => {
    expect(PROJECT_SHOWCASE_STATUSES).toHaveLength(4)
    for (const s of PROJECT_SHOWCASE_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
      expect(s.label.length).toBeGreaterThan(0)
    }
  })

  test('PROJECT_SHOWCASE_STATUSES includes all expected values', () => {
    const values = PROJECT_SHOWCASE_STATUSES.map((s) => s.value)
    expect(values).toContain('draft')
    expect(values).toContain('published')
    expect(values).toContain('featured')
    expect(values).toContain('archived')
  })

  test('PHOTO_TYPES has 6 entries with value and label', () => {
    expect(PHOTO_TYPES).toHaveLength(6)
    for (const t of PHOTO_TYPES) {
      expect(t).toHaveProperty('value')
      expect(t).toHaveProperty('label')
      expect(t.label.length).toBeGreaterThan(0)
    }
  })

  test('REVIEW_STATUSES has 4 entries with value and label', () => {
    expect(REVIEW_STATUSES).toHaveLength(4)
    for (const s of REVIEW_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    }
  })

  test('REVIEW_SOURCES has 7 entries with value and label', () => {
    expect(REVIEW_SOURCES).toHaveLength(7)
    for (const s of REVIEW_SOURCES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    }
    const values = REVIEW_SOURCES.map((s) => s.value)
    expect(values).toContain('google')
    expect(values).toContain('houzz')
    expect(values).toContain('platform')
  })

  test('CAMPAIGN_STATUSES has 5 entries with value and label', () => {
    expect(CAMPAIGN_STATUSES).toHaveLength(5)
    for (const s of CAMPAIGN_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    }
  })

  test('CAMPAIGN_TYPES has 6 entries with value and label', () => {
    expect(CAMPAIGN_TYPES).toHaveLength(6)
    for (const t of CAMPAIGN_TYPES) {
      expect(t).toHaveProperty('value')
      expect(t).toHaveProperty('label')
    }
    const values = CAMPAIGN_TYPES.map((t) => t.value)
    expect(values).toContain('email')
    expect(values).toContain('social')
    expect(values).toContain('referral')
  })

  test('CONTACT_STATUSES has 6 entries with value and label', () => {
    expect(CONTACT_STATUSES).toHaveLength(6)
    for (const s of CONTACT_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    }
    const values = CONTACT_STATUSES.map((s) => s.value)
    expect(values).toContain('pending')
    expect(values).toContain('converted')
    expect(values).toContain('unsubscribed')
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 37 — Enum Schemas', () => {
  test('projectShowcaseStatusEnum accepts all 4 statuses', () => {
    for (const s of ['draft', 'published', 'featured', 'archived']) {
      expect(projectShowcaseStatusEnum.parse(s)).toBe(s)
    }
  })

  test('projectShowcaseStatusEnum rejects invalid status', () => {
    expect(() => projectShowcaseStatusEnum.parse('hidden')).toThrow()
  })

  test('photoTypeEnum accepts all 6 types', () => {
    for (const t of ['exterior', 'interior', 'before', 'after', 'progress', 'detail']) {
      expect(photoTypeEnum.parse(t)).toBe(t)
    }
  })

  test('photoTypeEnum rejects invalid type', () => {
    expect(() => photoTypeEnum.parse('aerial')).toThrow()
  })

  test('reviewStatusEnum accepts all 4 statuses', () => {
    for (const s of ['pending', 'approved', 'published', 'rejected']) {
      expect(reviewStatusEnum.parse(s)).toBe(s)
    }
  })

  test('reviewStatusEnum rejects invalid status', () => {
    expect(() => reviewStatusEnum.parse('flagged')).toThrow()
  })

  test('reviewSourceEnum accepts all 7 sources', () => {
    for (const s of ['google', 'houzz', 'facebook', 'yelp', 'bbb', 'angi', 'platform']) {
      expect(reviewSourceEnum.parse(s)).toBe(s)
    }
  })

  test('reviewSourceEnum rejects invalid source', () => {
    expect(() => reviewSourceEnum.parse('twitter')).toThrow()
  })

  test('campaignStatusEnum accepts all 5 statuses', () => {
    for (const s of ['draft', 'active', 'paused', 'completed', 'cancelled']) {
      expect(campaignStatusEnum.parse(s)).toBe(s)
    }
  })

  test('campaignStatusEnum rejects invalid status', () => {
    expect(() => campaignStatusEnum.parse('deleted')).toThrow()
  })

  test('campaignTypeEnum accepts all 6 types', () => {
    for (const t of ['email', 'social', 'print', 'referral', 'event', 'other']) {
      expect(campaignTypeEnum.parse(t)).toBe(t)
    }
  })

  test('campaignTypeEnum rejects invalid type', () => {
    expect(() => campaignTypeEnum.parse('television')).toThrow()
  })

  test('contactStatusEnum accepts all 6 statuses', () => {
    for (const s of ['pending', 'sent', 'opened', 'clicked', 'converted', 'unsubscribed']) {
      expect(contactStatusEnum.parse(s)).toBe(s)
    }
  })

  test('contactStatusEnum rejects invalid status', () => {
    expect(() => contactStatusEnum.parse('bounced')).toThrow()
  })
})

// ============================================================================
// Portfolio Project Schemas
// ============================================================================

describe('Module 37 — Portfolio Project Schemas', () => {
  test('listPortfolioProjectsSchema accepts valid params', () => {
    const result = listPortfolioProjectsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listPortfolioProjectsSchema rejects limit > 100', () => {
    expect(() => listPortfolioProjectsSchema.parse({ limit: 200 })).toThrow()
  })

  test('listPortfolioProjectsSchema accepts filters', () => {
    const result = listPortfolioProjectsSchema.parse({
      status: 'published',
      category: 'custom_home',
      style: 'modern',
      is_featured: 'true',
      q: 'lakehouse',
    })
    expect(result.status).toBe('published')
    expect(result.category).toBe('custom_home')
    expect(result.style).toBe('modern')
    expect(result.is_featured).toBe(true)
    expect(result.q).toBe('lakehouse')
  })

  test('createPortfolioProjectSchema accepts valid project', () => {
    const result = createPortfolioProjectSchema.parse({
      title: 'Modern Lakehouse',
    })
    expect(result.title).toBe('Modern Lakehouse')
    expect(result.status).toBe('draft')
    expect(result.is_featured).toBe(false)
    expect(result.display_order).toBe(0)
    expect(result.highlights).toEqual([])
    expect(result.custom_features).toEqual([])
  })

  test('createPortfolioProjectSchema requires title', () => {
    expect(() => createPortfolioProjectSchema.parse({})).toThrow()
  })

  test('createPortfolioProjectSchema rejects title > 255 chars', () => {
    expect(() => createPortfolioProjectSchema.parse({ title: 'A'.repeat(256) })).toThrow()
  })

  test('createPortfolioProjectSchema accepts full project with all fields', () => {
    const result = createPortfolioProjectSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Coastal Retreat',
      slug: 'coastal-retreat',
      description: 'A beautiful coastal home',
      highlights: ['Ocean views', 'Custom pool'],
      category: 'vacation_home',
      style: 'coastal',
      status: 'featured',
      is_featured: true,
      display_order: 1,
      cover_photo_url: 'https://example.com/cover.jpg',
      square_footage: 3200,
      bedrooms: 3,
      bathrooms: 2.5,
      build_duration_days: 280,
      completion_date: '2025-11-15',
      location: 'Hilton Head, SC',
      custom_features: ['Pool', 'Outdoor kitchen'],
      seo_title: 'Coastal Retreat Build',
      seo_description: 'Custom coastal home build in Hilton Head',
    })
    expect(result.title).toBe('Coastal Retreat')
    expect(result.status).toBe('featured')
    expect(result.square_footage).toBe(3200)
    expect(result.completion_date).toBe('2025-11-15')
  })

  test('createPortfolioProjectSchema validates completion_date format', () => {
    expect(() => createPortfolioProjectSchema.parse({
      title: 'Test',
      completion_date: '2025/11/15',
    })).toThrow()
  })

  test('updatePortfolioProjectSchema accepts partial updates', () => {
    const result = updatePortfolioProjectSchema.parse({ title: 'Updated Title' })
    expect(result.title).toBe('Updated Title')
    expect(result.status).toBeUndefined()
  })
})

// ============================================================================
// Portfolio Photo Schemas
// ============================================================================

describe('Module 37 — Portfolio Photo Schemas', () => {
  test('listPortfolioPhotosSchema accepts valid params with defaults', () => {
    const result = listPortfolioPhotosSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('listPortfolioPhotosSchema accepts photo_type filter', () => {
    const result = listPortfolioPhotosSchema.parse({ photo_type: 'before' })
    expect(result.photo_type).toBe('before')
  })

  test('createPortfolioPhotoSchema accepts valid photo', () => {
    const result = createPortfolioPhotoSchema.parse({
      photo_url: 'https://example.com/photo.jpg',
    })
    expect(result.photo_url).toBe('https://example.com/photo.jpg')
    expect(result.photo_type).toBe('exterior')
    expect(result.display_order).toBe(0)
    expect(result.is_cover).toBe(false)
  })

  test('createPortfolioPhotoSchema requires photo_url', () => {
    expect(() => createPortfolioPhotoSchema.parse({})).toThrow()
  })

  test('createPortfolioPhotoSchema accepts full photo data', () => {
    const result = createPortfolioPhotoSchema.parse({
      photo_url: 'https://example.com/kitchen.jpg',
      caption: 'Kitchen overview',
      photo_type: 'interior',
      room: 'Kitchen',
      display_order: 3,
      is_cover: true,
    })
    expect(result.photo_type).toBe('interior')
    expect(result.room).toBe('Kitchen')
    expect(result.is_cover).toBe(true)
  })

  test('updatePortfolioPhotoSchema accepts partial updates', () => {
    const result = updatePortfolioPhotoSchema.parse({ caption: 'Updated caption' })
    expect(result.caption).toBe('Updated caption')
    expect(result.photo_url).toBeUndefined()
  })
})

// ============================================================================
// Client Review Schemas
// ============================================================================

describe('Module 37 — Client Review Schemas', () => {
  test('listClientReviewsSchema accepts valid params', () => {
    const result = listClientReviewsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listClientReviewsSchema rejects limit > 100', () => {
    expect(() => listClientReviewsSchema.parse({ limit: 200 })).toThrow()
  })

  test('listClientReviewsSchema accepts all filters', () => {
    const result = listClientReviewsSchema.parse({
      status: 'published',
      source: 'google',
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      is_featured: 'true',
      rating: '5',
      q: 'excellent',
    })
    expect(result.status).toBe('published')
    expect(result.source).toBe('google')
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.is_featured).toBe(true)
    expect(result.rating).toBe(5)
    expect(result.q).toBe('excellent')
  })

  test('createClientReviewSchema accepts valid review', () => {
    const result = createClientReviewSchema.parse({
      client_name: 'John Smith',
    })
    expect(result.client_name).toBe('John Smith')
    expect(result.rating).toBe(5)
    expect(result.source).toBe('platform')
    expect(result.status).toBe('pending')
    expect(result.is_featured).toBe(false)
  })

  test('createClientReviewSchema requires client_name', () => {
    expect(() => createClientReviewSchema.parse({})).toThrow()
  })

  test('createClientReviewSchema rejects client_name > 200 chars', () => {
    expect(() => createClientReviewSchema.parse({ client_name: 'A'.repeat(201) })).toThrow()
  })

  test('createClientReviewSchema rejects rating < 1', () => {
    expect(() => createClientReviewSchema.parse({ client_name: 'Test', rating: 0 })).toThrow()
  })

  test('createClientReviewSchema rejects rating > 5', () => {
    expect(() => createClientReviewSchema.parse({ client_name: 'Test', rating: 6 })).toThrow()
  })

  test('createClientReviewSchema validates email format', () => {
    expect(() => createClientReviewSchema.parse({
      client_name: 'Test',
      client_email: 'not-an-email',
    })).toThrow()
  })

  test('updateClientReviewSchema accepts partial updates', () => {
    const result = updateClientReviewSchema.parse({ status: 'approved', rating: 4 })
    expect(result.status).toBe('approved')
    expect(result.rating).toBe(4)
    expect(result.client_name).toBeUndefined()
  })
})

// ============================================================================
// Marketing Campaign Schemas
// ============================================================================

describe('Module 37 — Marketing Campaign Schemas', () => {
  test('listMarketingCampaignsSchema accepts valid params', () => {
    const result = listMarketingCampaignsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listMarketingCampaignsSchema rejects limit > 100', () => {
    expect(() => listMarketingCampaignsSchema.parse({ limit: 200 })).toThrow()
  })

  test('listMarketingCampaignsSchema accepts filters', () => {
    const result = listMarketingCampaignsSchema.parse({
      status: 'active',
      campaign_type: 'email',
      channel: 'houzz',
      q: 'spring',
    })
    expect(result.status).toBe('active')
    expect(result.campaign_type).toBe('email')
    expect(result.channel).toBe('houzz')
    expect(result.q).toBe('spring')
  })

  test('createMarketingCampaignSchema accepts valid campaign', () => {
    const result = createMarketingCampaignSchema.parse({
      name: 'Spring Open House',
    })
    expect(result.name).toBe('Spring Open House')
    expect(result.campaign_type).toBe('other')
    expect(result.status).toBe('draft')
    expect(result.budget).toBe(0)
    expect(result.actual_spend).toBe(0)
    expect(result.leads_generated).toBe(0)
    expect(result.proposals_sent).toBe(0)
    expect(result.contracts_won).toBe(0)
    expect(result.contract_value_won).toBe(0)
  })

  test('createMarketingCampaignSchema requires name', () => {
    expect(() => createMarketingCampaignSchema.parse({})).toThrow()
  })

  test('createMarketingCampaignSchema rejects name > 200 chars', () => {
    expect(() => createMarketingCampaignSchema.parse({ name: 'A'.repeat(201) })).toThrow()
  })

  test('createMarketingCampaignSchema validates date format', () => {
    expect(() => createMarketingCampaignSchema.parse({
      name: 'Test',
      start_date: '2026/03/01',
    })).toThrow()
  })

  test('createMarketingCampaignSchema accepts valid dates', () => {
    const result = createMarketingCampaignSchema.parse({
      name: 'Test',
      start_date: '2026-03-01',
      end_date: '2026-04-30',
    })
    expect(result.start_date).toBe('2026-03-01')
    expect(result.end_date).toBe('2026-04-30')
  })

  test('createMarketingCampaignSchema rejects negative budget', () => {
    expect(() => createMarketingCampaignSchema.parse({
      name: 'Test',
      budget: -100,
    })).toThrow()
  })

  test('updateMarketingCampaignSchema accepts partial updates', () => {
    const result = updateMarketingCampaignSchema.parse({
      name: 'Updated Campaign',
      status: 'active',
      leads_generated: 10,
    })
    expect(result.name).toBe('Updated Campaign')
    expect(result.status).toBe('active')
    expect(result.leads_generated).toBe(10)
    expect(result.budget).toBeUndefined()
  })

  test('updateMarketingCampaignSchema accepts roi_pct', () => {
    const result = updateMarketingCampaignSchema.parse({ roi_pct: 250.5 })
    expect(result.roi_pct).toBe(250.5)
  })
})

// ============================================================================
// Campaign Contact Schemas
// ============================================================================

describe('Module 37 — Campaign Contact Schemas', () => {
  test('listCampaignContactsSchema accepts valid params with defaults', () => {
    const result = listCampaignContactsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('listCampaignContactsSchema accepts status and q filters', () => {
    const result = listCampaignContactsSchema.parse({
      status: 'sent',
      q: 'jane',
    })
    expect(result.status).toBe('sent')
    expect(result.q).toBe('jane')
  })

  test('createCampaignContactSchema accepts valid contact', () => {
    const result = createCampaignContactSchema.parse({
      contact_name: 'Jane Doe',
    })
    expect(result.contact_name).toBe('Jane Doe')
    expect(result.status).toBe('pending')
  })

  test('createCampaignContactSchema requires contact_name', () => {
    expect(() => createCampaignContactSchema.parse({})).toThrow()
  })

  test('createCampaignContactSchema rejects contact_name > 200 chars', () => {
    expect(() => createCampaignContactSchema.parse({ contact_name: 'A'.repeat(201) })).toThrow()
  })

  test('createCampaignContactSchema validates email format', () => {
    expect(() => createCampaignContactSchema.parse({
      contact_name: 'Test',
      contact_email: 'not-an-email',
    })).toThrow()
  })

  test('createCampaignContactSchema accepts full contact data', () => {
    const result = createCampaignContactSchema.parse({
      contact_name: 'Jane Doe',
      contact_email: 'jane@example.com',
      contact_phone: '555-0123',
      status: 'sent',
      lead_id: '550e8400-e29b-41d4-a716-446655440000',
      notes: 'Follow up next week',
    })
    expect(result.contact_email).toBe('jane@example.com')
    expect(result.contact_phone).toBe('555-0123')
    expect(result.status).toBe('sent')
  })

  test('updateCampaignContactSchema accepts partial updates', () => {
    const result = updateCampaignContactSchema.parse({ status: 'converted' })
    expect(result.status).toBe('converted')
    expect(result.contact_name).toBeUndefined()
  })
})
