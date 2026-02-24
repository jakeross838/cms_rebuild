/**
 * Module 46 — Customer Support Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 46 spec.
 */

import { describe, test, expect } from 'vitest'

// -- Types ────────────────────────────────────────────────────────────────────

import type {
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketChannel,
  SenderType,
  ArticleStatus,
  FeatureRequestStatus,
  SupportTicket,
  TicketMessage,
  KbArticle,
  FeatureRequest,
  FeatureRequestVote,
} from '@/types/customer-support'

import {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_CATEGORIES,
  TICKET_CHANNELS,
  SENDER_TYPES,
  ARTICLE_STATUSES,
  FEATURE_REQUEST_STATUSES,
} from '@/types/customer-support'

// -- Schemas ──────────────────────────────────────────────────────────────────

import {
  ticketStatusEnum,
  ticketPriorityEnum,
  ticketCategoryEnum,
  ticketChannelEnum,
  senderTypeEnum,
  articleStatusEnum,
  featureRequestStatusEnum,
  listTicketsSchema,
  createTicketSchema,
  updateTicketSchema,
  listTicketMessagesSchema,
  createTicketMessageSchema,
  updateTicketMessageSchema,
  listKbArticlesSchema,
  createKbArticleSchema,
  updateKbArticleSchema,
  listFeatureRequestsSchema,
  createFeatureRequestSchema,
  updateFeatureRequestSchema,
  listFeatureRequestVotesSchema,
  createFeatureRequestVoteSchema,
} from '@/lib/validation/schemas/customer-support'

// ============================================================================
// Type System
// ============================================================================

describe('Module 46 — Customer Support Types', () => {
  test('TicketStatus has 6 values', () => {
    const statuses: TicketStatus[] = [
      'open', 'in_progress', 'waiting_on_customer', 'waiting_on_agent', 'resolved', 'closed',
    ]
    expect(statuses).toHaveLength(6)
  })

  test('TicketPriority has 4 values', () => {
    const priorities: TicketPriority[] = ['low', 'normal', 'high', 'urgent']
    expect(priorities).toHaveLength(4)
  })

  test('TicketCategory has 8 values', () => {
    const categories: TicketCategory[] = [
      'general', 'billing', 'technical', 'feature_request', 'bug_report', 'onboarding', 'integration', 'other',
    ]
    expect(categories).toHaveLength(8)
  })

  test('TicketChannel has 4 values', () => {
    const channels: TicketChannel[] = ['web', 'email', 'chat', 'phone']
    expect(channels).toHaveLength(4)
  })

  test('SenderType has 3 values', () => {
    const types: SenderType[] = ['customer', 'agent', 'system']
    expect(types).toHaveLength(3)
  })

  test('ArticleStatus has 3 values', () => {
    const statuses: ArticleStatus[] = ['draft', 'published', 'archived']
    expect(statuses).toHaveLength(3)
  })

  test('FeatureRequestStatus has 6 values', () => {
    const statuses: FeatureRequestStatus[] = [
      'submitted', 'under_review', 'planned', 'in_progress', 'completed', 'declined',
    ]
    expect(statuses).toHaveLength(6)
  })

  test('SupportTicket interface has all required fields', () => {
    const ticket: SupportTicket = {
      id: '1', company_id: '1', user_id: null,
      ticket_number: 'TKT-001', subject: 'Test ticket',
      description: null, status: 'open', priority: 'normal',
      category: 'general', channel: 'web',
      assigned_agent_id: null, tags: [],
      first_response_at: null, resolved_at: null, closed_at: null,
      satisfaction_rating: null, created_by: null,
      created_at: '2026-01-01', updated_at: '2026-01-01',
      deleted_at: null,
    }
    expect(ticket.id).toBeDefined()
    expect(ticket.company_id).toBeDefined()
    expect(ticket.ticket_number).toBe('TKT-001')
    expect(ticket.status).toBe('open')
    expect(ticket.tags).toEqual([])
  })

  test('TicketMessage interface has all required fields', () => {
    const message: TicketMessage = {
      id: '1', company_id: '1', ticket_id: '1',
      sender_type: 'customer', sender_id: null,
      message_text: 'Test message', attachments: [],
      is_internal: false, created_at: '2026-01-01',
      updated_at: '2026-01-01',
    }
    expect(message.id).toBeDefined()
    expect(message.ticket_id).toBeDefined()
    expect(message.sender_type).toBe('customer')
    expect(message.is_internal).toBe(false)
  })

  test('KbArticle interface has all required fields', () => {
    const article: KbArticle = {
      id: '1', company_id: null,
      title: 'Getting Started', slug: 'getting-started',
      content: null, category: null, tags: [],
      status: 'draft', view_count: 0,
      helpful_count: 0, not_helpful_count: 0,
      author_id: null, created_at: '2026-01-01',
      updated_at: '2026-01-01', deleted_at: null,
    }
    expect(article.id).toBeDefined()
    expect(article.company_id).toBeNull()
    expect(article.slug).toBe('getting-started')
    expect(article.view_count).toBe(0)
  })

  test('FeatureRequest interface has all required fields', () => {
    const request: FeatureRequest = {
      id: '1', company_id: '1', user_id: null,
      title: 'New feature', description: null,
      status: 'submitted', priority: 'normal',
      category: 'general', vote_count: 0,
      created_by: null, created_at: '2026-01-01',
      updated_at: '2026-01-01', deleted_at: null,
    }
    expect(request.id).toBeDefined()
    expect(request.vote_count).toBe(0)
    expect(request.status).toBe('submitted')
  })

  test('FeatureRequestVote interface has all required fields', () => {
    const vote: FeatureRequestVote = {
      id: '1', company_id: '1',
      feature_request_id: '1', user_id: '1',
      created_at: '2026-01-01',
    }
    expect(vote.id).toBeDefined()
    expect(vote.feature_request_id).toBeDefined()
    expect(vote.user_id).toBeDefined()
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 46 — Customer Support Constants', () => {
  test('TICKET_STATUSES has 6 entries with value and label', () => {
    expect(TICKET_STATUSES).toHaveLength(6)
    TICKET_STATUSES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  test('TICKET_STATUSES includes all expected values', () => {
    const values = TICKET_STATUSES.map((s) => s.value)
    expect(values).toContain('open')
    expect(values).toContain('in_progress')
    expect(values).toContain('waiting_on_customer')
    expect(values).toContain('waiting_on_agent')
    expect(values).toContain('resolved')
    expect(values).toContain('closed')
  })

  test('TICKET_PRIORITIES has 4 entries with value and label', () => {
    expect(TICKET_PRIORITIES).toHaveLength(4)
    TICKET_PRIORITIES.forEach((p) => {
      expect(p).toHaveProperty('value')
      expect(p).toHaveProperty('label')
    })
  })

  test('TICKET_PRIORITIES includes all expected values', () => {
    const values = TICKET_PRIORITIES.map((p) => p.value)
    expect(values).toContain('low')
    expect(values).toContain('normal')
    expect(values).toContain('high')
    expect(values).toContain('urgent')
  })

  test('TICKET_CATEGORIES has 8 entries with value and label', () => {
    expect(TICKET_CATEGORIES).toHaveLength(8)
    TICKET_CATEGORIES.forEach((c) => {
      expect(c).toHaveProperty('value')
      expect(c).toHaveProperty('label')
    })
  })

  test('TICKET_CATEGORIES includes all expected values', () => {
    const values = TICKET_CATEGORIES.map((c) => c.value)
    expect(values).toContain('general')
    expect(values).toContain('billing')
    expect(values).toContain('technical')
    expect(values).toContain('feature_request')
    expect(values).toContain('bug_report')
    expect(values).toContain('onboarding')
    expect(values).toContain('integration')
    expect(values).toContain('other')
  })

  test('TICKET_CHANNELS has 4 entries with value and label', () => {
    expect(TICKET_CHANNELS).toHaveLength(4)
    TICKET_CHANNELS.forEach((c) => {
      expect(c).toHaveProperty('value')
      expect(c).toHaveProperty('label')
    })
  })

  test('TICKET_CHANNELS includes all expected values', () => {
    const values = TICKET_CHANNELS.map((c) => c.value)
    expect(values).toContain('web')
    expect(values).toContain('email')
    expect(values).toContain('chat')
    expect(values).toContain('phone')
  })

  test('SENDER_TYPES has 3 entries with value and label', () => {
    expect(SENDER_TYPES).toHaveLength(3)
    SENDER_TYPES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  test('SENDER_TYPES includes all expected values', () => {
    const values = SENDER_TYPES.map((s) => s.value)
    expect(values).toContain('customer')
    expect(values).toContain('agent')
    expect(values).toContain('system')
  })

  test('ARTICLE_STATUSES has 3 entries with value and label', () => {
    expect(ARTICLE_STATUSES).toHaveLength(3)
    ARTICLE_STATUSES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  test('ARTICLE_STATUSES includes all expected values', () => {
    const values = ARTICLE_STATUSES.map((s) => s.value)
    expect(values).toContain('draft')
    expect(values).toContain('published')
    expect(values).toContain('archived')
  })

  test('FEATURE_REQUEST_STATUSES has 6 entries with value and label', () => {
    expect(FEATURE_REQUEST_STATUSES).toHaveLength(6)
    FEATURE_REQUEST_STATUSES.forEach((s) => {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    })
  })

  test('FEATURE_REQUEST_STATUSES includes all expected values', () => {
    const values = FEATURE_REQUEST_STATUSES.map((s) => s.value)
    expect(values).toContain('submitted')
    expect(values).toContain('under_review')
    expect(values).toContain('planned')
    expect(values).toContain('in_progress')
    expect(values).toContain('completed')
    expect(values).toContain('declined')
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 46 — Customer Support Enum Schemas', () => {
  test('ticketStatusEnum accepts all 6 statuses', () => {
    const statuses = ['open', 'in_progress', 'waiting_on_customer', 'waiting_on_agent', 'resolved', 'closed']
    statuses.forEach((s) => expect(ticketStatusEnum.parse(s)).toBe(s))
  })

  test('ticketStatusEnum rejects invalid status', () => {
    expect(() => ticketStatusEnum.parse('invalid')).toThrow()
  })

  test('ticketPriorityEnum accepts all 4 priorities', () => {
    const priorities = ['low', 'normal', 'high', 'urgent']
    priorities.forEach((p) => expect(ticketPriorityEnum.parse(p)).toBe(p))
  })

  test('ticketPriorityEnum rejects invalid priority', () => {
    expect(() => ticketPriorityEnum.parse('critical')).toThrow()
  })

  test('ticketCategoryEnum accepts all 8 categories', () => {
    const categories = ['general', 'billing', 'technical', 'feature_request', 'bug_report', 'onboarding', 'integration', 'other']
    categories.forEach((c) => expect(ticketCategoryEnum.parse(c)).toBe(c))
  })

  test('ticketCategoryEnum rejects invalid category', () => {
    expect(() => ticketCategoryEnum.parse('sales')).toThrow()
  })

  test('ticketChannelEnum accepts all 4 channels', () => {
    const channels = ['web', 'email', 'chat', 'phone']
    channels.forEach((c) => expect(ticketChannelEnum.parse(c)).toBe(c))
  })

  test('ticketChannelEnum rejects invalid channel', () => {
    expect(() => ticketChannelEnum.parse('sms')).toThrow()
  })

  test('senderTypeEnum accepts all 3 types', () => {
    const types = ['customer', 'agent', 'system']
    types.forEach((t) => expect(senderTypeEnum.parse(t)).toBe(t))
  })

  test('senderTypeEnum rejects invalid type', () => {
    expect(() => senderTypeEnum.parse('bot')).toThrow()
  })

  test('articleStatusEnum accepts all 3 statuses', () => {
    const statuses = ['draft', 'published', 'archived']
    statuses.forEach((s) => expect(articleStatusEnum.parse(s)).toBe(s))
  })

  test('articleStatusEnum rejects invalid status', () => {
    expect(() => articleStatusEnum.parse('deleted')).toThrow()
  })

  test('featureRequestStatusEnum accepts all 6 statuses', () => {
    const statuses = ['submitted', 'under_review', 'planned', 'in_progress', 'completed', 'declined']
    statuses.forEach((s) => expect(featureRequestStatusEnum.parse(s)).toBe(s))
  })

  test('featureRequestStatusEnum rejects invalid status', () => {
    expect(() => featureRequestStatusEnum.parse('pending')).toThrow()
  })
})

// ============================================================================
// Ticket Schemas
// ============================================================================

describe('Module 46 — Support Ticket Schemas', () => {
  test('listTicketsSchema accepts valid params', () => {
    const result = listTicketsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listTicketsSchema rejects limit > 100', () => {
    expect(() => listTicketsSchema.parse({ limit: 101 })).toThrow()
  })

  test('listTicketsSchema accepts all filters', () => {
    const result = listTicketsSchema.parse({
      status: 'open',
      priority: 'urgent',
      category: 'billing',
      channel: 'email',
      assigned_agent_id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      q: 'search term',
    })
    expect(result.status).toBe('open')
    expect(result.priority).toBe('urgent')
    expect(result.category).toBe('billing')
    expect(result.channel).toBe('email')
    expect(result.assigned_agent_id).toBeDefined()
    expect(result.q).toBe('search term')
  })

  test('createTicketSchema accepts valid ticket', () => {
    const result = createTicketSchema.parse({
      ticket_number: 'TKT-001',
      subject: 'Test ticket',
    })
    expect(result.ticket_number).toBe('TKT-001')
    expect(result.subject).toBe('Test ticket')
    expect(result.status).toBe('open')
    expect(result.priority).toBe('normal')
    expect(result.category).toBe('general')
    expect(result.channel).toBe('web')
    expect(result.tags).toEqual([])
  })

  test('createTicketSchema requires ticket_number and subject', () => {
    expect(() => createTicketSchema.parse({})).toThrow()
    expect(() => createTicketSchema.parse({ ticket_number: 'TKT-001' })).toThrow()
    expect(() => createTicketSchema.parse({ subject: 'Test' })).toThrow()
  })

  test('createTicketSchema rejects ticket_number > 30 chars', () => {
    expect(() => createTicketSchema.parse({
      ticket_number: 'A'.repeat(31),
      subject: 'Test',
    })).toThrow()
  })

  test('createTicketSchema rejects subject > 255 chars', () => {
    expect(() => createTicketSchema.parse({
      ticket_number: 'TKT-001',
      subject: 'A'.repeat(256),
    })).toThrow()
  })

  test('createTicketSchema accepts all optional fields', () => {
    const result = createTicketSchema.parse({
      ticket_number: 'TKT-002',
      subject: 'Full ticket',
      description: 'Detailed description',
      status: 'in_progress',
      priority: 'high',
      category: 'technical',
      channel: 'phone',
      assigned_agent_id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      tags: ['urgent', 'bug'],
      user_id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    })
    expect(result.status).toBe('in_progress')
    expect(result.priority).toBe('high')
    expect(result.category).toBe('technical')
    expect(result.channel).toBe('phone')
    expect(result.tags).toEqual(['urgent', 'bug'])
  })

  test('updateTicketSchema accepts partial updates', () => {
    const result = updateTicketSchema.parse({ subject: 'Updated subject' })
    expect(result.subject).toBe('Updated subject')
  })

  test('updateTicketSchema accepts satisfaction_rating 1-5', () => {
    const result = updateTicketSchema.parse({ satisfaction_rating: 5 })
    expect(result.satisfaction_rating).toBe(5)
  })

  test('updateTicketSchema rejects satisfaction_rating > 5', () => {
    expect(() => updateTicketSchema.parse({ satisfaction_rating: 6 })).toThrow()
  })

  test('updateTicketSchema rejects satisfaction_rating < 1', () => {
    expect(() => updateTicketSchema.parse({ satisfaction_rating: 0 })).toThrow()
  })

  test('updateTicketSchema accepts null satisfaction_rating', () => {
    const result = updateTicketSchema.parse({ satisfaction_rating: null })
    expect(result.satisfaction_rating).toBeNull()
  })

  test('updateTicketSchema accepts tags array', () => {
    const result = updateTicketSchema.parse({ tags: ['billing', 'priority'] })
    expect(result.tags).toEqual(['billing', 'priority'])
  })

  test('updateTicketSchema accepts null assigned_agent_id', () => {
    const result = updateTicketSchema.parse({ assigned_agent_id: null })
    expect(result.assigned_agent_id).toBeNull()
  })
})

// ============================================================================
// Ticket Message Schemas
// ============================================================================

describe('Module 46 — Ticket Message Schemas', () => {
  test('listTicketMessagesSchema accepts valid params with defaults', () => {
    const result = listTicketMessagesSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('listTicketMessagesSchema accepts sender_type filter', () => {
    const result = listTicketMessagesSchema.parse({ sender_type: 'agent' })
    expect(result.sender_type).toBe('agent')
  })

  test('listTicketMessagesSchema accepts is_internal boolean preprocess', () => {
    const result = listTicketMessagesSchema.parse({ is_internal: 'true' })
    expect(result.is_internal).toBe(true)

    const result2 = listTicketMessagesSchema.parse({ is_internal: 'false' })
    expect(result2.is_internal).toBe(false)
  })

  test('createTicketMessageSchema accepts valid message', () => {
    const result = createTicketMessageSchema.parse({
      message_text: 'This is a test message',
    })
    expect(result.message_text).toBe('This is a test message')
    expect(result.sender_type).toBe('customer')
    expect(result.attachments).toEqual([])
    expect(result.is_internal).toBe(false)
  })

  test('createTicketMessageSchema requires message_text', () => {
    expect(() => createTicketMessageSchema.parse({})).toThrow()
  })

  test('createTicketMessageSchema rejects empty message_text', () => {
    expect(() => createTicketMessageSchema.parse({ message_text: '' })).toThrow()
  })

  test('createTicketMessageSchema rejects message_text > 50000 chars', () => {
    expect(() => createTicketMessageSchema.parse({
      message_text: 'A'.repeat(50001),
    })).toThrow()
  })

  test('createTicketMessageSchema accepts all sender types', () => {
    const types = ['customer', 'agent', 'system'] as const
    types.forEach((t) => {
      const result = createTicketMessageSchema.parse({
        sender_type: t,
        message_text: 'Test message',
      })
      expect(result.sender_type).toBe(t)
    })
  })

  test('createTicketMessageSchema accepts is_internal flag', () => {
    const result = createTicketMessageSchema.parse({
      message_text: 'Internal note',
      is_internal: true,
    })
    expect(result.is_internal).toBe(true)
  })

  test('updateTicketMessageSchema accepts partial updates', () => {
    const result = updateTicketMessageSchema.parse({
      message_text: 'Updated message',
    })
    expect(result.message_text).toBe('Updated message')
  })

  test('updateTicketMessageSchema accepts is_internal toggle', () => {
    const result = updateTicketMessageSchema.parse({ is_internal: true })
    expect(result.is_internal).toBe(true)
  })
})

// ============================================================================
// KB Article Schemas
// ============================================================================

describe('Module 46 — KB Article Schemas', () => {
  test('listKbArticlesSchema accepts valid params with defaults', () => {
    const result = listKbArticlesSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listKbArticlesSchema accepts all filters', () => {
    const result = listKbArticlesSchema.parse({
      status: 'published',
      category: 'getting-started',
      q: 'search',
    })
    expect(result.status).toBe('published')
    expect(result.category).toBe('getting-started')
    expect(result.q).toBe('search')
  })

  test('listKbArticlesSchema rejects limit > 100', () => {
    expect(() => listKbArticlesSchema.parse({ limit: 101 })).toThrow()
  })

  test('createKbArticleSchema accepts valid article', () => {
    const result = createKbArticleSchema.parse({
      title: 'Getting Started Guide',
      slug: 'getting-started-guide',
    })
    expect(result.title).toBe('Getting Started Guide')
    expect(result.slug).toBe('getting-started-guide')
    expect(result.status).toBe('draft')
    expect(result.tags).toEqual([])
  })

  test('createKbArticleSchema requires title and slug', () => {
    expect(() => createKbArticleSchema.parse({})).toThrow()
    expect(() => createKbArticleSchema.parse({ title: 'Test' })).toThrow()
    expect(() => createKbArticleSchema.parse({ slug: 'test' })).toThrow()
  })

  test('createKbArticleSchema validates slug format', () => {
    // Valid slugs
    expect(createKbArticleSchema.parse({ title: 'T', slug: 'valid-slug' }).slug).toBe('valid-slug')
    expect(createKbArticleSchema.parse({ title: 'T', slug: 'simple' }).slug).toBe('simple')
    expect(createKbArticleSchema.parse({ title: 'T', slug: 'multi-word-slug' }).slug).toBe('multi-word-slug')
    expect(createKbArticleSchema.parse({ title: 'T', slug: 'slug123' }).slug).toBe('slug123')
  })

  test('createKbArticleSchema rejects invalid slug format', () => {
    expect(() => createKbArticleSchema.parse({ title: 'T', slug: 'Invalid-Slug' })).toThrow()
    expect(() => createKbArticleSchema.parse({ title: 'T', slug: 'has spaces' })).toThrow()
    expect(() => createKbArticleSchema.parse({ title: 'T', slug: 'has_underscores' })).toThrow()
    expect(() => createKbArticleSchema.parse({ title: 'T', slug: '-starts-with-dash' })).toThrow()
  })

  test('createKbArticleSchema rejects title > 255 chars', () => {
    expect(() => createKbArticleSchema.parse({
      title: 'A'.repeat(256),
      slug: 'test',
    })).toThrow()
  })

  test('createKbArticleSchema rejects slug > 300 chars', () => {
    expect(() => createKbArticleSchema.parse({
      title: 'Test',
      slug: 'a'.repeat(301),
    })).toThrow()
  })

  test('createKbArticleSchema accepts all optional fields', () => {
    const result = createKbArticleSchema.parse({
      title: 'Full Article',
      slug: 'full-article',
      content: 'This is the article content.',
      category: 'tutorials',
      tags: ['beginner', 'setup'],
      status: 'published',
    })
    expect(result.content).toBe('This is the article content.')
    expect(result.category).toBe('tutorials')
    expect(result.tags).toEqual(['beginner', 'setup'])
    expect(result.status).toBe('published')
  })

  test('updateKbArticleSchema accepts partial updates', () => {
    const result = updateKbArticleSchema.parse({ title: 'Updated Title' })
    expect(result.title).toBe('Updated Title')
  })

  test('updateKbArticleSchema validates slug format on update', () => {
    const result = updateKbArticleSchema.parse({ slug: 'new-slug' })
    expect(result.slug).toBe('new-slug')
    expect(() => updateKbArticleSchema.parse({ slug: 'Invalid Slug' })).toThrow()
  })

  test('updateKbArticleSchema accepts status change', () => {
    const result = updateKbArticleSchema.parse({ status: 'archived' })
    expect(result.status).toBe('archived')
  })

  test('updateKbArticleSchema accepts null content', () => {
    const result = updateKbArticleSchema.parse({ content: null })
    expect(result.content).toBeNull()
  })

  test('updateKbArticleSchema accepts null category', () => {
    const result = updateKbArticleSchema.parse({ category: null })
    expect(result.category).toBeNull()
  })
})

// ============================================================================
// Feature Request Schemas
// ============================================================================

describe('Module 46 — Feature Request Schemas', () => {
  test('listFeatureRequestsSchema accepts valid params with defaults', () => {
    const result = listFeatureRequestsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listFeatureRequestsSchema rejects limit > 100', () => {
    expect(() => listFeatureRequestsSchema.parse({ limit: 101 })).toThrow()
  })

  test('listFeatureRequestsSchema accepts all filters', () => {
    const result = listFeatureRequestsSchema.parse({
      status: 'planned',
      priority: 'high',
      category: 'technical',
      q: 'dashboard',
    })
    expect(result.status).toBe('planned')
    expect(result.priority).toBe('high')
    expect(result.category).toBe('technical')
    expect(result.q).toBe('dashboard')
  })

  test('createFeatureRequestSchema accepts valid feature request', () => {
    const result = createFeatureRequestSchema.parse({
      title: 'Add dark mode',
    })
    expect(result.title).toBe('Add dark mode')
    expect(result.status).toBe('submitted')
    expect(result.priority).toBe('normal')
    expect(result.category).toBe('general')
  })

  test('createFeatureRequestSchema requires title', () => {
    expect(() => createFeatureRequestSchema.parse({})).toThrow()
  })

  test('createFeatureRequestSchema rejects title > 255 chars', () => {
    expect(() => createFeatureRequestSchema.parse({
      title: 'A'.repeat(256),
    })).toThrow()
  })

  test('createFeatureRequestSchema accepts all optional fields', () => {
    const result = createFeatureRequestSchema.parse({
      title: 'New feature',
      description: 'Detailed description of the feature',
      status: 'under_review',
      priority: 'high',
      category: 'technical',
      user_id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    })
    expect(result.description).toBe('Detailed description of the feature')
    expect(result.status).toBe('under_review')
    expect(result.priority).toBe('high')
    expect(result.category).toBe('technical')
    expect(result.user_id).toBeDefined()
  })

  test('createFeatureRequestSchema rejects invalid status', () => {
    expect(() => createFeatureRequestSchema.parse({
      title: 'Test',
      status: 'invalid',
    })).toThrow()
  })

  test('updateFeatureRequestSchema accepts partial updates', () => {
    const result = updateFeatureRequestSchema.parse({
      title: 'Updated title',
    })
    expect(result.title).toBe('Updated title')
  })

  test('updateFeatureRequestSchema accepts status change', () => {
    const result = updateFeatureRequestSchema.parse({ status: 'completed' })
    expect(result.status).toBe('completed')
  })

  test('updateFeatureRequestSchema accepts priority change', () => {
    const result = updateFeatureRequestSchema.parse({ priority: 'urgent' })
    expect(result.priority).toBe('urgent')
  })

  test('updateFeatureRequestSchema rejects invalid category', () => {
    expect(() => updateFeatureRequestSchema.parse({ category: 'invalid' })).toThrow()
  })
})

// ============================================================================
// Feature Request Vote Schemas
// ============================================================================

describe('Module 46 — Feature Request Vote Schemas', () => {
  test('listFeatureRequestVotesSchema accepts valid params with defaults', () => {
    const result = listFeatureRequestVotesSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('listFeatureRequestVotesSchema rejects limit > 100', () => {
    expect(() => listFeatureRequestVotesSchema.parse({ limit: 101 })).toThrow()
  })

  test('createFeatureRequestVoteSchema accepts valid vote', () => {
    const result = createFeatureRequestVoteSchema.parse({
      user_id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    })
    expect(result.user_id).toBe('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d')
  })

  test('createFeatureRequestVoteSchema requires user_id', () => {
    expect(() => createFeatureRequestVoteSchema.parse({})).toThrow()
  })

  test('createFeatureRequestVoteSchema rejects invalid UUID', () => {
    expect(() => createFeatureRequestVoteSchema.parse({
      user_id: 'not-a-uuid',
    })).toThrow()
  })
})
