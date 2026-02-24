/**
 * Module 15: Draw Requests — Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────────

export const drawRequestStatusEnum = z.enum([
  'draft', 'pending_review', 'approved', 'submitted_to_lender', 'funded', 'rejected',
])

export const drawHistoryActionEnum = z.enum([
  'created', 'submitted', 'approved', 'rejected', 'funded', 'revised',
])

// ── List Draw Requests ────────────────────────────────────────────────────────

export const listDrawRequestsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  status: drawRequestStatusEnum.optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

// ── Create Draw Request ───────────────────────────────────────────────────────

export const createDrawRequestSchema = z.object({
  job_id: z.string().uuid(),
  draw_number: z.number().int().positive(),
  application_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  period_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  contract_amount: z.number().min(0),
  retainage_pct: z.number().min(0).max(100).default(10),
  lender_reference: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(5000).optional(),
})

// ── Update Draw Request ───────────────────────────────────────────────────────

export const updateDrawRequestSchema = z.object({
  draw_number: z.number().int().positive().optional(),
  application_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  period_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  contract_amount: z.number().min(0).optional(),
  retainage_pct: z.number().min(0).max(100).optional(),
  lender_reference: z.string().trim().max(100).nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── Create Draw Request Line ──────────────────────────────────────────────────

export const createDrawRequestLineSchema = z.object({
  cost_code_id: z.string().uuid().optional(),
  description: z.string().trim().min(1).max(1000),
  scheduled_value: z.number().min(0),
  previous_applications: z.number().min(0).default(0),
  current_work: z.number().min(0).default(0),
  materials_stored: z.number().min(0).default(0),
  sort_order: z.number().int().min(0).default(0),
})

// ── Update Draw Request Line ──────────────────────────────────────────────────

export const updateDrawRequestLineSchema = z.object({
  cost_code_id: z.string().uuid().nullable().optional(),
  description: z.string().trim().min(1).max(1000).optional(),
  scheduled_value: z.number().min(0).optional(),
  previous_applications: z.number().min(0).optional(),
  current_work: z.number().min(0).optional(),
  materials_stored: z.number().min(0).optional(),
  sort_order: z.number().int().min(0).optional(),
})

// ── Batch Create Lines ────────────────────────────────────────────────────────

export const batchCreateDrawLinesSchema = z.object({
  lines: z.array(createDrawRequestLineSchema).min(1).max(500),
})

// ── Submit Draw Request (status transition) ───────────────────────────────────

export const submitDrawRequestSchema = z.object({
  notes: z.string().trim().max(5000).optional(),
})

// ── Approve Draw Request ──────────────────────────────────────────────────────

export const approveDrawRequestSchema = z.object({
  notes: z.string().trim().max(5000).optional(),
})
