/**
 * Module 28: Punch List & Quality Checklists Validation Schemas
 */

import { z } from 'zod'

// ── Date validation helper ───────────────────────────────────────────────

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format')

// ── Enums ────────────────────────────────────────────────────────────────

export const punchItemStatusEnum = z.enum([
  'open', 'in_progress', 'completed', 'verified', 'disputed',
])

export const punchItemPriorityEnum = z.enum([
  'low', 'normal', 'high', 'critical',
])

export const punchItemCategoryEnum = z.enum([
  'structural', 'electrical', 'plumbing', 'hvac', 'finish', 'paint',
  'flooring', 'cabinets', 'countertops', 'fixtures', 'appliances',
  'exterior', 'landscaping', 'other',
])

export const photoTypeEnum = z.enum([
  'before', 'after', 'issue',
])

export const checklistStatusEnum = z.enum([
  'not_started', 'in_progress', 'completed', 'approved',
])

export const checklistItemResultEnum = z.enum([
  'pass', 'fail', 'na', 'not_inspected',
])

// ── Punch Items ──────────────────────────────────────────────────────────

export const listPunchItemsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  status: punchItemStatusEnum.optional(),
  priority: punchItemPriorityEnum.optional(),
  category: punchItemCategoryEnum.optional(),
  assigned_to: z.string().uuid().optional(),
  assigned_vendor_id: z.string().uuid().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createPunchItemSchema = z.object({
  job_id: z.string().uuid(),
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(10000).nullable().optional(),
  location: z.string().trim().max(200).nullable().optional(),
  room: z.string().trim().max(100).nullable().optional(),
  status: punchItemStatusEnum.optional().default('open'),
  priority: punchItemPriorityEnum.optional().default('normal'),
  category: punchItemCategoryEnum.nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  assigned_vendor_id: z.string().uuid().nullable().optional(),
  due_date: dateString.nullable().optional(),
  cost_estimate: z.number().min(0).max(9999999999999.99).nullable().optional(),
})

export const updatePunchItemSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  location: z.string().trim().max(200).nullable().optional(),
  room: z.string().trim().max(100).nullable().optional(),
  status: punchItemStatusEnum.optional(),
  priority: punchItemPriorityEnum.optional(),
  category: punchItemCategoryEnum.nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  assigned_vendor_id: z.string().uuid().nullable().optional(),
  due_date: dateString.nullable().optional(),
  cost_estimate: z.number().min(0).max(9999999999999.99).nullable().optional(),
})

export const completePunchItemSchema = z.object({
  notes: z.string().trim().max(5000).nullable().optional(),
})

export const verifyPunchItemSchema = z.object({
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── Punch Item Photos ────────────────────────────────────────────────────

export const createPunchItemPhotoSchema = z.object({
  photo_url: z.string().trim().min(1).max(2000),
  caption: z.string().trim().max(255).nullable().optional(),
  photo_type: photoTypeEnum.optional().default('issue'),
})

// ── Quality Checklists ───────────────────────────────────────────────────

export const listChecklistsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  status: checklistStatusEnum.optional(),
  template_id: z.string().uuid().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createChecklistSchema = z.object({
  job_id: z.string().uuid(),
  template_id: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(10000).nullable().optional(),
  status: checklistStatusEnum.optional().default('not_started'),
  inspector_id: z.string().uuid().nullable().optional(),
  inspection_date: dateString.nullable().optional(),
  location: z.string().trim().max(200).nullable().optional(),
})

export const updateChecklistSchema = z.object({
  template_id: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  status: checklistStatusEnum.optional(),
  inspector_id: z.string().uuid().nullable().optional(),
  inspection_date: dateString.nullable().optional(),
  location: z.string().trim().max(200).nullable().optional(),
  total_items: z.number().int().min(0).optional(),
  passed_items: z.number().int().min(0).optional(),
  failed_items: z.number().int().min(0).optional(),
  na_items: z.number().int().min(0).optional(),
})

export const approveChecklistSchema = z.object({
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── Quality Checklist Items ──────────────────────────────────────────────

export const createChecklistItemSchema = z.object({
  description: z.string().trim().min(1).max(5000),
  result: checklistItemResultEnum.optional().default('not_inspected'),
  notes: z.string().trim().max(10000).nullable().optional(),
  photo_url: z.string().trim().max(2000).nullable().optional(),
  sort_order: z.number().int().min(0).optional().default(0),
})

export const updateChecklistItemSchema = z.object({
  description: z.string().trim().min(1).max(5000).optional(),
  result: checklistItemResultEnum.optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
  photo_url: z.string().trim().max(2000).nullable().optional(),
  sort_order: z.number().int().min(0).optional(),
})

export const listChecklistItemsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

// ── Quality Checklist Templates ──────────────────────────────────────────

export const listTemplatesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.string().trim().max(100).optional(),
  trade: z.string().trim().max(100).optional(),
  is_active: z.coerce.boolean().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createTemplateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(10000).nullable().optional(),
  category: z.string().trim().max(100).nullable().optional(),
  trade: z.string().trim().max(100).nullable().optional(),
  is_active: z.boolean().optional().default(true),
  is_system: z.boolean().optional().default(false),
})

export const updateTemplateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  category: z.string().trim().max(100).nullable().optional(),
  trade: z.string().trim().max(100).nullable().optional(),
  is_active: z.boolean().optional(),
  is_system: z.boolean().optional(),
})

// ── Quality Checklist Template Items ─────────────────────────────────────

export const createTemplateItemSchema = z.object({
  description: z.string().trim().min(1).max(5000),
  category: z.string().trim().max(100).nullable().optional(),
  sort_order: z.number().int().min(0).optional().default(0),
  is_required: z.boolean().optional().default(true),
})

export const updateTemplateItemSchema = z.object({
  description: z.string().trim().min(1).max(5000).optional(),
  category: z.string().trim().max(100).nullable().optional(),
  sort_order: z.number().int().min(0).optional(),
  is_required: z.boolean().optional(),
})

export const listTemplateItemsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})
