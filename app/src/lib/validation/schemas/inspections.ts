/**
 * Permit Inspections Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const inspectionStatusEnum = z.enum([
  'scheduled', 'passed', 'failed', 'cancelled', 'pending',
])

// ── Date helper ───────────────────────────────────────────────────────────

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format')

// ── Inspections ─────────────────────────────────────────────────────────────

export const listInspectionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  permit_id: z.string().uuid().optional(),
  status: inspectionStatusEnum.optional(),
  inspection_type: z.string().trim().max(100).optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createInspectionSchema = z.object({
  job_id: z.string().uuid(),
  permit_id: z.string().uuid(),
  inspection_type: z.string().trim().min(1).max(100),
  status: inspectionStatusEnum.optional().default('scheduled'),
  scheduled_date: dateString.nullable().optional(),
  scheduled_time: z.string().trim().max(20).nullable().optional(),
  inspector_name: z.string().trim().max(255).nullable().optional(),
  inspector_phone: z.string().trim().max(50).nullable().optional(),
  is_reinspection: z.boolean().optional().default(false),
  original_inspection_id: z.string().uuid().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  notes: z.string().trim().max(50000).nullable().optional(),
})

export const updateInspectionSchema = z.object({
  inspection_type: z.string().trim().min(1).max(100).optional(),
  status: inspectionStatusEnum.optional(),
  scheduled_date: dateString.nullable().optional(),
  scheduled_time: z.string().trim().max(20).nullable().optional(),
  inspector_name: z.string().trim().max(255).nullable().optional(),
  inspector_phone: z.string().trim().max(50).nullable().optional(),
  is_reinspection: z.boolean().optional(),
  original_inspection_id: z.string().uuid().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  notes: z.string().trim().max(50000).nullable().optional(),
})
