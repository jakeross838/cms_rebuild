/**
 * Module 32: Permitting & Inspections Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const permitStatusEnum = z.enum([
  'draft', 'applied', 'issued', 'active', 'expired', 'closed', 'revoked',
])

export const permitTypeEnum = z.enum([
  'building', 'electrical', 'plumbing', 'mechanical',
  'demolition', 'grading', 'fire', 'environmental', 'zoning', 'other',
])

export const inspectionStatusEnum = z.enum([
  'scheduled', 'passed', 'failed', 'conditional', 'cancelled', 'no_show',
])

export const inspectionTypeEnum = z.enum([
  'rough_in', 'final', 'foundation', 'framing', 'electrical',
  'plumbing', 'mechanical', 'fire', 'other',
])

export const inspectionResultTypeEnum = z.enum([
  'pass', 'fail', 'conditional',
])

export const feeStatusEnum = z.enum([
  'pending', 'paid', 'waived', 'refunded',
])

// ── Permits ───────────────────────────────────────────────────────────────

export const listPermitsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  status: permitStatusEnum.optional(),
  permit_type: permitTypeEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createPermitSchema = z.object({
  job_id: z.string().uuid(),
  permit_number: z.string().trim().min(1).max(50).nullable().optional(),
  permit_type: permitTypeEnum.optional().default('building'),
  status: permitStatusEnum.optional().default('draft'),
  jurisdiction: z.string().trim().max(200).nullable().optional(),
  applied_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  issued_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  expiration_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  conditions: z.string().trim().max(10000).nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
})

export const updatePermitSchema = z.object({
  permit_number: z.string().trim().min(1).max(50).nullable().optional(),
  permit_type: permitTypeEnum.optional(),
  status: permitStatusEnum.optional(),
  jurisdiction: z.string().trim().max(200).nullable().optional(),
  applied_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  issued_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  expiration_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  conditions: z.string().trim().max(10000).nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
})

// ── Inspections ───────────────────────────────────────────────────────────

export const listInspectionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  permit_id: z.string().uuid().optional(),
  job_id: z.string().uuid().optional(),
  status: inspectionStatusEnum.optional(),
  inspection_type: inspectionTypeEnum.optional(),
  scheduled_date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  scheduled_date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
})

export const createInspectionSchema = z.object({
  permit_id: z.string().uuid(),
  job_id: z.string().uuid(),
  inspection_type: inspectionTypeEnum.optional().default('other'),
  status: inspectionStatusEnum.optional().default('scheduled'),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  scheduled_time: z.string().trim().max(20).nullable().optional(),
  inspector_name: z.string().trim().max(200).nullable().optional(),
  inspector_phone: z.string().trim().max(50).nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
  is_reinspection: z.boolean().optional().default(false),
  original_inspection_id: z.string().uuid().nullable().optional(),
})

export const updateInspectionSchema = z.object({
  inspection_type: inspectionTypeEnum.optional(),
  status: inspectionStatusEnum.optional(),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  scheduled_time: z.string().trim().max(20).nullable().optional(),
  inspector_name: z.string().trim().max(200).nullable().optional(),
  inspector_phone: z.string().trim().max(50).nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
  completed_at: z.string().nullable().optional(),
})

// ── Inspection Results ────────────────────────────────────────────────────

export const listInspectionResultsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const createInspectionResultSchema = z.object({
  result: inspectionResultTypeEnum,
  result_notes: z.string().trim().max(10000).nullable().optional(),
  deficiencies: z.array(z.unknown()).optional().default([]),
  conditions_to_satisfy: z.string().trim().max(10000).nullable().optional(),
  inspector_comments: z.string().trim().max(10000).nullable().optional(),
  photos: z.array(z.unknown()).optional().default([]),
  is_first_time_pass: z.boolean().nullable().optional(),
  responsible_vendor_id: z.string().uuid().nullable().optional(),
})

export const updateInspectionResultSchema = z.object({
  result: inspectionResultTypeEnum.optional(),
  result_notes: z.string().trim().max(10000).nullable().optional(),
  deficiencies: z.array(z.unknown()).optional(),
  conditions_to_satisfy: z.string().trim().max(10000).nullable().optional(),
  inspector_comments: z.string().trim().max(10000).nullable().optional(),
  photos: z.array(z.unknown()).optional(),
  is_first_time_pass: z.boolean().nullable().optional(),
  responsible_vendor_id: z.string().uuid().nullable().optional(),
})

// ── Permit Documents ──────────────────────────────────────────────────────

export const listPermitDocumentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export const createPermitDocumentSchema = z.object({
  document_type: z.string().trim().min(1).max(100),
  file_url: z.string().trim().min(1).max(2000),
  file_name: z.string().trim().max(255).nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
})

// ── Permit Fees ───────────────────────────────────────────────────────────

export const listPermitFeesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  status: feeStatusEnum.optional(),
})

export const createPermitFeeSchema = z.object({
  description: z.string().trim().min(1).max(255),
  amount: z.number().min(0).max(9999999999999.99).optional().default(0),
  status: feeStatusEnum.optional().default('pending'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  paid_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  receipt_url: z.string().trim().max(2000).nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
})

export const updatePermitFeeSchema = z.object({
  description: z.string().trim().min(1).max(255).optional(),
  amount: z.number().min(0).max(9999999999999.99).optional(),
  status: feeStatusEnum.optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  paid_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  paid_by: z.string().uuid().nullable().optional(),
  receipt_url: z.string().trim().max(2000).nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
})
