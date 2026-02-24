/**
 * Module 36: Lead Pipeline & CRM Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const leadStatusEnum = z.enum([
  'new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost', 'on_hold',
])

export const leadSourceEnum = z.enum([
  'referral', 'website', 'social_media', 'advertising', 'trade_show', 'cold_call', 'partner', 'other',
])

export const activityTypeEnum = z.enum([
  'call', 'email', 'meeting', 'note', 'site_visit', 'proposal', 'follow_up',
])

export const leadPriorityEnum = z.enum([
  'low', 'normal', 'high', 'hot',
])

export const stageTypeEnum = z.enum([
  'lead', 'qualified', 'proposal', 'negotiation', 'closed',
])

export const preconstructionTypeEnum = z.enum([
  'design_build', 'plan_bid_build',
])

// ── Leads ─────────────────────────────────────────────────────────────────

export const listLeadsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: leadStatusEnum.optional(),
  priority: leadPriorityEnum.optional(),
  source: leadSourceEnum.optional(),
  assigned_to: z.string().uuid().optional(),
  pipeline_id: z.string().uuid().optional(),
  stage_id: z.string().uuid().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createLeadSchema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255).nullable().optional(),
  phone: z.string().trim().max(50).nullable().optional(),
  address: z.string().trim().max(5000).nullable().optional(),
  lot_address: z.string().trim().max(5000).nullable().optional(),
  source: leadSourceEnum.optional().default('other'),
  source_detail: z.string().trim().max(500).nullable().optional(),
  utm_source: z.string().trim().max(255).nullable().optional(),
  utm_medium: z.string().trim().max(255).nullable().optional(),
  utm_campaign: z.string().trim().max(255).nullable().optional(),
  project_type: z.string().trim().max(200).nullable().optional(),
  budget_range_low: z.number().min(0).max(9999999999999.99).nullable().optional(),
  budget_range_high: z.number().min(0).max(9999999999999.99).nullable().optional(),
  timeline: z.string().trim().max(200).nullable().optional(),
  lot_status: z.string().trim().max(100).nullable().optional(),
  financing_status: z.string().trim().max(100).nullable().optional(),
  preconstruction_type: preconstructionTypeEnum.nullable().optional(),
  status: leadStatusEnum.optional().default('new'),
  priority: leadPriorityEnum.optional().default('normal'),
  pipeline_id: z.string().uuid().nullable().optional(),
  stage_id: z.string().uuid().nullable().optional(),
  score: z.number().int().min(0).max(100).optional().default(0),
  assigned_to: z.string().uuid().nullable().optional(),
  expected_contract_value: z.number().min(0).max(9999999999999.99).optional().default(0),
  probability_pct: z.number().min(0).max(100).optional().default(0),
})

export const updateLeadSchema = z.object({
  first_name: z.string().trim().min(1).max(100).optional(),
  last_name: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().email().max(255).nullable().optional(),
  phone: z.string().trim().max(50).nullable().optional(),
  address: z.string().trim().max(5000).nullable().optional(),
  lot_address: z.string().trim().max(5000).nullable().optional(),
  source: leadSourceEnum.optional(),
  source_detail: z.string().trim().max(500).nullable().optional(),
  utm_source: z.string().trim().max(255).nullable().optional(),
  utm_medium: z.string().trim().max(255).nullable().optional(),
  utm_campaign: z.string().trim().max(255).nullable().optional(),
  project_type: z.string().trim().max(200).nullable().optional(),
  budget_range_low: z.number().min(0).max(9999999999999.99).nullable().optional(),
  budget_range_high: z.number().min(0).max(9999999999999.99).nullable().optional(),
  timeline: z.string().trim().max(200).nullable().optional(),
  lot_status: z.string().trim().max(100).nullable().optional(),
  financing_status: z.string().trim().max(100).nullable().optional(),
  preconstruction_type: preconstructionTypeEnum.nullable().optional(),
  status: leadStatusEnum.optional(),
  priority: leadPriorityEnum.optional(),
  pipeline_id: z.string().uuid().nullable().optional(),
  stage_id: z.string().uuid().nullable().optional(),
  score: z.number().int().min(0).max(100).optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  expected_contract_value: z.number().min(0).max(9999999999999.99).optional(),
  probability_pct: z.number().min(0).max(100).optional(),
  lost_reason: z.string().trim().max(1000).nullable().optional(),
  lost_competitor: z.string().trim().max(255).nullable().optional(),
})

// ── Lead Activities ───────────────────────────────────────────────────────

export const listLeadActivitiesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  activity_type: activityTypeEnum.optional(),
})

export const createLeadActivitySchema = z.object({
  activity_type: activityTypeEnum.optional().default('note'),
  subject: z.string().trim().min(1).max(255).nullable().optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  activity_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  duration_minutes: z.number().int().min(0).max(1440).nullable().optional(),
})

export const updateLeadActivitySchema = z.object({
  activity_type: activityTypeEnum.optional(),
  subject: z.string().trim().min(1).max(255).nullable().optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  activity_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  duration_minutes: z.number().int().min(0).max(1440).nullable().optional(),
})

// ── Lead Sources ──────────────────────────────────────────────────────────

export const listLeadSourcesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  source_type: leadSourceEnum.optional(),
  is_active: z.preprocess(
    (v) => v === 'true' ? true : v === 'false' ? false : v,
    z.boolean().optional()
  ),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createLeadSourceSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).nullable().optional(),
  source_type: leadSourceEnum.optional().default('other'),
  is_active: z.boolean().optional().default(true),
})

export const updateLeadSourceSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  source_type: leadSourceEnum.optional(),
  is_active: z.boolean().optional(),
})

// ── Pipelines ─────────────────────────────────────────────────────────────

export const listPipelinesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  is_active: z.preprocess(
    (v) => v === 'true' ? true : v === 'false' ? false : v,
    z.boolean().optional()
  ),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createPipelineSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).nullable().optional(),
  is_default: z.boolean().optional().default(false),
  is_active: z.boolean().optional().default(true),
})

export const updatePipelineSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
})

// ── Pipeline Stages ───────────────────────────────────────────────────────

export const listPipelineStagesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  stage_type: stageTypeEnum.optional(),
  is_active: z.preprocess(
    (v) => v === 'true' ? true : v === 'false' ? false : v,
    z.boolean().optional()
  ),
})

export const createPipelineStageSchema = z.object({
  name: z.string().trim().min(1).max(200),
  stage_type: stageTypeEnum.optional().default('lead'),
  sequence_order: z.number().int().min(0).optional().default(0),
  probability_default: z.number().min(0).max(100).optional().default(0),
  color: z.string().trim().max(20).nullable().optional(),
  is_active: z.boolean().optional().default(true),
})

export const updatePipelineStageSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  stage_type: stageTypeEnum.optional(),
  sequence_order: z.number().int().min(0).optional(),
  probability_default: z.number().min(0).max(100).optional(),
  color: z.string().trim().max(20).nullable().optional(),
  is_active: z.boolean().optional(),
})
