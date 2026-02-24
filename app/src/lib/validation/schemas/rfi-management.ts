/**
 * Module 27: RFI Management Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const rfiStatusEnum = z.enum([
  'draft', 'open', 'pending_response', 'answered', 'closed', 'voided',
])

export const rfiPriorityEnum = z.enum([
  'low', 'normal', 'high', 'urgent',
])

export const rfiCategoryEnum = z.enum([
  'design', 'structural', 'mechanical', 'electrical', 'plumbing', 'site', 'finish', 'general',
])

export const routingStatusEnum = z.enum([
  'pending', 'viewed', 'responded', 'forwarded',
])

// ── Date helper ───────────────────────────────────────────────────────────

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format')

// ── RFIs ──────────────────────────────────────────────────────────────────

export const listRfisSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  status: rfiStatusEnum.optional(),
  priority: rfiPriorityEnum.optional(),
  category: rfiCategoryEnum.optional(),
  assigned_to: z.string().uuid().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createRfiSchema = z.object({
  job_id: z.string().uuid(),
  rfi_number: z.string().trim().min(1).max(20),
  subject: z.string().trim().min(1).max(255),
  question: z.string().trim().min(1).max(50000),
  status: rfiStatusEnum.optional().default('draft'),
  priority: rfiPriorityEnum.optional().default('normal'),
  category: rfiCategoryEnum.optional().default('general'),
  assigned_to: z.string().uuid().nullable().optional(),
  due_date: dateString.nullable().optional(),
  cost_impact: z.number().min(-9999999999999.99).max(9999999999999.99).optional().default(0),
  schedule_impact_days: z.number().int().min(-365).max(365).optional().default(0),
  related_document_id: z.string().uuid().nullable().optional(),
})

export const updateRfiSchema = z.object({
  rfi_number: z.string().trim().min(1).max(20).optional(),
  subject: z.string().trim().min(1).max(255).optional(),
  question: z.string().trim().min(1).max(50000).optional(),
  status: rfiStatusEnum.optional(),
  priority: rfiPriorityEnum.optional(),
  category: rfiCategoryEnum.optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  due_date: dateString.nullable().optional(),
  cost_impact: z.number().min(-9999999999999.99).max(9999999999999.99).optional(),
  schedule_impact_days: z.number().int().min(-365).max(365).optional(),
  related_document_id: z.string().uuid().nullable().optional(),
})

// ── Open RFI (draft -> open) ──────────────────────────────────────────────

export const openRfiSchema = z.object({
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── Close RFI (answered -> closed) ────────────────────────────────────────

export const closeRfiSchema = z.object({
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── RFI Responses ─────────────────────────────────────────────────────────

export const listRfiResponsesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export const createRfiResponseSchema = z.object({
  response_text: z.string().trim().min(1).max(50000),
  attachments: z.array(z.unknown()).optional().default([]),
  is_official: z.boolean().optional().default(false),
})

export const updateRfiResponseSchema = z.object({
  response_text: z.string().trim().min(1).max(50000).optional(),
  attachments: z.array(z.unknown()).optional(),
  is_official: z.boolean().optional(),
})

// ── RFI Routing ───────────────────────────────────────────────────────────

export const listRfiRoutingSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export const createRfiRoutingSchema = z.object({
  routed_to: z.string().uuid(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

export const updateRfiRoutingSchema = z.object({
  status: routingStatusEnum.optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── RFI Templates ─────────────────────────────────────────────────────────

export const listRfiTemplatesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: rfiCategoryEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createRfiTemplateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  category: rfiCategoryEnum.optional().default('general'),
  subject_template: z.string().trim().max(255).nullable().optional(),
  question_template: z.string().trim().max(50000).nullable().optional(),
  default_priority: rfiPriorityEnum.optional().default('normal'),
  is_active: z.boolean().optional().default(true),
})

export const updateRfiTemplateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  category: rfiCategoryEnum.optional(),
  subject_template: z.string().trim().max(255).nullable().optional(),
  question_template: z.string().trim().max(50000).nullable().optional(),
  default_priority: rfiPriorityEnum.optional(),
  is_active: z.boolean().optional(),
})
