/**
 * Module 46: Customer Support Validation Schemas
 */

import { z } from 'zod'

// -- Enums ────────────────────────────────────────────────────────────────────

export const ticketStatusEnum = z.enum([
  'open', 'in_progress', 'waiting_on_customer', 'waiting_on_agent', 'resolved', 'closed',
])

export const ticketPriorityEnum = z.enum(['low', 'normal', 'high', 'urgent'])

export const ticketCategoryEnum = z.enum([
  'general', 'billing', 'technical', 'feature_request', 'bug_report', 'onboarding', 'integration', 'other',
])

export const ticketChannelEnum = z.enum(['web', 'email', 'chat', 'phone'])

export const senderTypeEnum = z.enum(['customer', 'agent', 'system'])

export const articleStatusEnum = z.enum(['draft', 'published', 'archived'])

export const featureRequestStatusEnum = z.enum([
  'submitted', 'under_review', 'planned', 'in_progress', 'completed', 'declined',
])

// -- Support Tickets ──────────────────────────────────────────────────────────

export const listTicketsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: ticketStatusEnum.optional(),
  priority: ticketPriorityEnum.optional(),
  category: ticketCategoryEnum.optional(),
  channel: ticketChannelEnum.optional(),
  assigned_agent_id: z.string().uuid().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createTicketSchema = z.object({
  ticket_number: z.string().trim().min(1).max(30),
  subject: z.string().trim().min(1).max(255),
  description: z.string().trim().max(50000).nullable().optional(),
  status: ticketStatusEnum.optional().default('open'),
  priority: ticketPriorityEnum.optional().default('normal'),
  category: ticketCategoryEnum.optional().default('general'),
  channel: ticketChannelEnum.optional().default('web'),
  assigned_agent_id: z.string().uuid().nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(100)).optional().default([]),
  user_id: z.string().uuid().nullable().optional(),
})

export const updateTicketSchema = z.object({
  subject: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(50000).nullable().optional(),
  status: ticketStatusEnum.optional(),
  priority: ticketPriorityEnum.optional(),
  category: ticketCategoryEnum.optional(),
  channel: ticketChannelEnum.optional(),
  assigned_agent_id: z.string().uuid().nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(100)).optional(),
  satisfaction_rating: z.number().int().min(1).max(5).nullable().optional(),
})

// -- Ticket Messages ──────────────────────────────────────────────────────────

export const listTicketMessagesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  sender_type: senderTypeEnum.optional(),
  is_internal: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val,
    z.boolean().optional()
  ),
})

export const createTicketMessageSchema = z.object({
  sender_type: senderTypeEnum.optional().default('customer'),
  message_text: z.string().trim().min(1).max(50000),
  attachments: z.array(z.unknown()).optional().default([]),
  is_internal: z.boolean().optional().default(false),
})

export const updateTicketMessageSchema = z.object({
  message_text: z.string().trim().min(1).max(50000).optional(),
  attachments: z.array(z.unknown()).optional(),
  is_internal: z.boolean().optional(),
})

// -- KB Articles ──────────────────────────────────────────────────────────────

export const listKbArticlesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: articleStatusEnum.optional(),
  category: z.string().trim().max(100).optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createKbArticleSchema = z.object({
  title: z.string().trim().min(1).max(255),
  slug: z.string().trim().min(1).max(300).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  content: z.string().trim().max(100000).nullable().optional(),
  category: z.string().trim().max(100).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(100)).optional().default([]),
  status: articleStatusEnum.optional().default('draft'),
})

export const updateKbArticleSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  slug: z.string().trim().min(1).max(300).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens').optional(),
  content: z.string().trim().max(100000).nullable().optional(),
  category: z.string().trim().max(100).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(100)).optional(),
  status: articleStatusEnum.optional(),
})

// -- Feature Requests ─────────────────────────────────────────────────────────

export const listFeatureRequestsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: featureRequestStatusEnum.optional(),
  priority: ticketPriorityEnum.optional(),
  category: ticketCategoryEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createFeatureRequestSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(50000).nullable().optional(),
  status: featureRequestStatusEnum.optional().default('submitted'),
  priority: ticketPriorityEnum.optional().default('normal'),
  category: ticketCategoryEnum.optional().default('general'),
  user_id: z.string().uuid().nullable().optional(),
})

export const updateFeatureRequestSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(50000).nullable().optional(),
  status: featureRequestStatusEnum.optional(),
  priority: ticketPriorityEnum.optional(),
  category: ticketCategoryEnum.optional(),
})

// -- Feature Request Votes ────────────────────────────────────────────────────

export const listFeatureRequestVotesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export const createFeatureRequestVoteSchema = z.object({
  user_id: z.string().uuid(),
})
