/**
 * Module 14: Lien Waiver Management Validation Schemas
 */

import { z } from 'zod'

// ── Enums ────────────────────────────────────────────────────────────────────

export const waiverTypeEnum = z.enum([
  'conditional_progress',
  'unconditional_progress',
  'conditional_final',
  'unconditional_final',
])

export const waiverStatusEnum = z.enum([
  'draft',
  'pending',
  'sent',
  'received',
  'approved',
  'rejected',
])

// ── Lien Waiver Schemas ──────────────────────────────────────────────────────

export const listLienWaiversSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  vendor_id: z.string().uuid().optional(),
  waiver_type: waiverTypeEnum.optional(),
  status: waiverStatusEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createLienWaiverSchema = z.object({
  job_id: z.string().uuid(),
  vendor_id: z.string().uuid().optional(),
  waiver_type: waiverTypeEnum,
  status: waiverStatusEnum.optional(),
  amount: z.number().positive().max(999999999999.99).optional(),
  through_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  document_id: z.string().uuid().optional(),
  payment_id: z.string().uuid().optional(),
  check_number: z.string().trim().max(50).optional(),
  claimant_name: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(2000).optional(),
})

export const updateLienWaiverSchema = z.object({
  vendor_id: z.string().uuid().nullable().optional(),
  waiver_type: waiverTypeEnum.optional(),
  status: waiverStatusEnum.optional(),
  amount: z.number().positive().max(999999999999.99).nullable().optional(),
  through_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').nullable().optional(),
  document_id: z.string().uuid().nullable().optional(),
  payment_id: z.string().uuid().nullable().optional(),
  check_number: z.string().trim().max(50).nullable().optional(),
  claimant_name: z.string().trim().max(500).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
})

// ── Template Schemas ─────────────────────────────────────────────────────────

export const listLienWaiverTemplatesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  waiver_type: waiverTypeEnum.optional(),
  state_code: z.string().trim().length(2).optional(),
})

export const createLienWaiverTemplateSchema = z.object({
  waiver_type: waiverTypeEnum,
  template_name: z.string().trim().min(1).max(200),
  template_content: z.string().trim().max(100000).optional(),
  state_code: z.string().trim().length(2).optional(),
  is_default: z.boolean().optional(),
})

export const updateLienWaiverTemplateSchema = z.object({
  waiver_type: waiverTypeEnum.optional(),
  template_name: z.string().trim().min(1).max(200).optional(),
  template_content: z.string().trim().max(100000).nullable().optional(),
  state_code: z.string().trim().length(2).nullable().optional(),
  is_default: z.boolean().optional(),
})

// ── Tracking Schemas ─────────────────────────────────────────────────────────

export const listLienWaiverTrackingSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  vendor_id: z.string().uuid().optional(),
  is_compliant: z.coerce.boolean().optional(),
})

export const createLienWaiverTrackingSchema = z.object({
  job_id: z.string().uuid(),
  vendor_id: z.string().uuid().optional(),
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  expected_amount: z.number().positive().max(999999999999.99).optional(),
  waiver_id: z.string().uuid().optional(),
  is_compliant: z.boolean().optional(),
  notes: z.string().trim().max(2000).optional(),
})
