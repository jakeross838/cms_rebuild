/**
 * Module 22: Vendor Performance Scoring Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const scoreDimensionEnum = z.enum([
  'quality', 'timeliness', 'communication', 'budget_adherence', 'safety',
])

export const callbackStatusEnum = z.enum([
  'reported', 'acknowledged', 'in_progress', 'resolved', 'disputed',
])

export const callbackSeverityEnum = z.enum([
  'minor', 'moderate', 'major', 'critical',
])

// ── Vendor Scores ─────────────────────────────────────────────────────────

export const listVendorScoresSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  vendor_id: z.string().uuid().optional(),
  sort_by: z.string().max(50).optional(),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
})

export const createVendorScoreSchema = z.object({
  vendor_id: z.string().uuid(),
  quality_score: z.number().min(0).max(100).optional().default(0),
  timeliness_score: z.number().min(0).max(100).optional().default(0),
  communication_score: z.number().min(0).max(100).optional().default(0),
  budget_adherence_score: z.number().min(0).max(100).optional().default(0),
  safety_score: z.number().min(0).max(100).optional().default(0),
  overall_score: z.number().min(0).max(100).optional().default(0),
  data_point_count: z.number().int().min(0).optional().default(0),
  calculation_window_months: z.number().int().min(1).max(120).optional().default(12),
  manual_adjustment: z.number().min(-10).max(10).optional().default(0),
  manual_adjustment_reason: z.string().trim().max(2000).nullable().optional(),
})

export const updateVendorScoreSchema = z.object({
  quality_score: z.number().min(0).max(100).optional(),
  timeliness_score: z.number().min(0).max(100).optional(),
  communication_score: z.number().min(0).max(100).optional(),
  budget_adherence_score: z.number().min(0).max(100).optional(),
  safety_score: z.number().min(0).max(100).optional(),
  overall_score: z.number().min(0).max(100).optional(),
  data_point_count: z.number().int().min(0).optional(),
  calculation_window_months: z.number().int().min(1).max(120).optional(),
  manual_adjustment: z.number().min(-10).max(10).optional(),
  manual_adjustment_reason: z.string().trim().max(2000).nullable().optional(),
})

// ── Score History ─────────────────────────────────────────────────────────

export const listScoreHistorySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
})

// ── Job Performance Ratings ───────────────────────────────────────────────

export const listJobRatingsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  vendor_id: z.string().uuid().optional(),
  job_id: z.string().uuid().optional(),
  trade: z.string().trim().max(100).optional(),
  sort_by: z.string().max(50).optional(),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
})

export const createJobRatingSchema = z.object({
  vendor_id: z.string().uuid(),
  job_id: z.string().uuid(),
  trade: z.string().trim().max(100).nullable().optional(),
  quality_rating: z.number().min(0).max(100).nullable().optional(),
  timeliness_rating: z.number().min(0).max(100).nullable().optional(),
  communication_rating: z.number().min(0).max(100).nullable().optional(),
  budget_adherence_rating: z.number().min(0).max(100).nullable().optional(),
  safety_rating: z.number().min(0).max(100).nullable().optional(),
  overall_rating: z.number().min(0).max(100).nullable().optional(),
  tasks_on_time: z.number().int().min(0).optional().default(0),
  tasks_total: z.number().int().min(0).optional().default(0),
  punch_items_count: z.number().int().min(0).optional().default(0),
  punch_resolution_avg_days: z.number().min(0).nullable().optional(),
  inspection_pass_rate: z.number().min(0).max(100).nullable().optional(),
  bid_amount: z.number().min(0).nullable().optional(),
  final_amount: z.number().min(0).nullable().optional(),
  change_order_count: z.number().int().min(0).optional().default(0),
  rating_notes: z.string().trim().max(5000).nullable().optional(),
})

export const updateJobRatingSchema = z.object({
  trade: z.string().trim().max(100).nullable().optional(),
  quality_rating: z.number().min(0).max(100).nullable().optional(),
  timeliness_rating: z.number().min(0).max(100).nullable().optional(),
  communication_rating: z.number().min(0).max(100).nullable().optional(),
  budget_adherence_rating: z.number().min(0).max(100).nullable().optional(),
  safety_rating: z.number().min(0).max(100).nullable().optional(),
  overall_rating: z.number().min(0).max(100).nullable().optional(),
  tasks_on_time: z.number().int().min(0).optional(),
  tasks_total: z.number().int().min(0).optional(),
  punch_items_count: z.number().int().min(0).optional(),
  punch_resolution_avg_days: z.number().min(0).nullable().optional(),
  inspection_pass_rate: z.number().min(0).max(100).nullable().optional(),
  bid_amount: z.number().min(0).nullable().optional(),
  final_amount: z.number().min(0).nullable().optional(),
  change_order_count: z.number().int().min(0).optional(),
  rating_notes: z.string().trim().max(5000).nullable().optional(),
})

// ── Warranty Callbacks ────────────────────────────────────────────────────

export const listCallbacksSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  vendor_id: z.string().uuid().optional(),
  job_id: z.string().uuid().optional(),
  status: callbackStatusEnum.optional(),
  severity: callbackSeverityEnum.optional(),
  sort_by: z.string().max(50).optional(),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
})

export const createCallbackSchema = z.object({
  vendor_id: z.string().uuid(),
  job_id: z.string().uuid(),
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).nullable().optional(),
  severity: callbackSeverityEnum.optional().default('minor'),
  status: callbackStatusEnum.optional().default('reported'),
  reported_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  resolution_cost: z.number().min(0).nullable().optional(),
})

export const updateCallbackSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  severity: callbackSeverityEnum.optional(),
  status: callbackStatusEnum.optional(),
  reported_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  resolution_cost: z.number().min(0).nullable().optional(),
  resolution_notes: z.string().trim().max(5000).nullable().optional(),
})

export const resolveCallbackSchema = z.object({
  resolution_notes: z.string().trim().max(5000).nullable().optional(),
  resolution_cost: z.number().min(0).nullable().optional(),
  resolved_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
})

// ── Vendor Notes ──────────────────────────────────────────────────────────

export const listVendorNotesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  vendor_id: z.string().uuid().optional(),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
})

export const createVendorNoteSchema = z.object({
  vendor_id: z.string().uuid(),
  title: z.string().trim().max(255).nullable().optional(),
  body: z.string().trim().min(1).max(10000),
  tags: z.array(z.string().trim().max(50)).max(20).optional().default([]),
  is_internal: z.boolean().optional().default(true),
})

export const updateVendorNoteSchema = z.object({
  title: z.string().trim().max(255).nullable().optional(),
  body: z.string().trim().min(1).max(10000).optional(),
  tags: z.array(z.string().trim().max(50)).max(20).optional(),
  is_internal: z.boolean().optional(),
})
