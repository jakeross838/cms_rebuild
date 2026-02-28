/**
 * Submittal Management Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const submittalStatusEnum = z.enum([
  'draft', 'submitted', 'under_review', 'approved', 'approved_as_noted', 'rejected', 'resubmit', 'closed',
])

// ── Date helper ───────────────────────────────────────────────────────────

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format')

// ── Submittals ──────────────────────────────────────────────────────────────

export const listSubmittalsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  status: submittalStatusEnum.optional(),
  submittal_type: z.string().trim().max(50).optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createSubmittalSchema = z.object({
  job_id: z.string().uuid(),
  title: z.string().trim().min(1).max(255),
  submittal_number: z.string().trim().max(50).nullable().optional(),
  submittal_type: z.string().trim().max(50).nullable().optional(),
  spec_section: z.string().trim().max(50).nullable().optional(),
  status: submittalStatusEnum.optional().default('draft'),
  description: z.string().trim().max(50000).nullable().optional(),
  required_date: dateString.nullable().optional(),
  submitted_date: dateString.nullable().optional(),
  returned_date: dateString.nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  vendor_id: z.string().uuid().nullable().optional(),
  notes: z.string().trim().max(50000).nullable().optional(),
})

export const updateSubmittalSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  submittal_number: z.string().trim().max(50).nullable().optional(),
  submittal_type: z.string().trim().max(50).nullable().optional(),
  spec_section: z.string().trim().max(50).nullable().optional(),
  status: submittalStatusEnum.optional(),
  description: z.string().trim().max(50000).nullable().optional(),
  required_date: dateString.nullable().optional(),
  submitted_date: dateString.nullable().optional(),
  returned_date: dateString.nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  vendor_id: z.string().uuid().nullable().optional(),
  notes: z.string().trim().max(50000).nullable().optional(),
})
