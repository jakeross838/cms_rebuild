/**
 * Warranty Claims (flat route) Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const warrantyClaimStatusEnum = z.enum([
  'open', 'in_progress', 'pending_vendor', 'resolved', 'closed', 'denied',
])

export const warrantyClaimPriorityEnum = z.enum([
  'low', 'normal', 'high', 'urgent',
])

// ── Date helper ───────────────────────────────────────────────────────────

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format')

// ── Warranty Claims ─────────────────────────────────────────────────────────

export const listWarrantyClaimsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  warranty_id: z.string().uuid().optional(),
  status: warrantyClaimStatusEnum.optional(),
  priority: warrantyClaimPriorityEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createWarrantyClaimSchema = z.object({
  warranty_id: z.string().uuid(),
  title: z.string().trim().min(1).max(255),
  claim_number: z.string().trim().min(1).max(100),
  status: warrantyClaimStatusEnum.optional().default('open'),
  priority: warrantyClaimPriorityEnum.optional().default('normal'),
  description: z.string().trim().max(50000).nullable().optional(),
  reported_date: dateString,
  reported_by: z.string().trim().max(255).nullable().optional(),
  due_date: dateString.nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  assigned_vendor_id: z.string().uuid().nullable().optional(),
  resolution_notes: z.string().trim().max(50000).nullable().optional(),
  resolution_cost: z.number().min(0).nullable().optional(),
})

export const updateWarrantyClaimSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  claim_number: z.string().trim().min(1).max(100).optional(),
  status: warrantyClaimStatusEnum.optional(),
  priority: warrantyClaimPriorityEnum.optional(),
  description: z.string().trim().max(50000).nullable().optional(),
  reported_date: dateString.optional(),
  reported_by: z.string().trim().max(255).nullable().optional(),
  due_date: dateString.nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  assigned_vendor_id: z.string().uuid().nullable().optional(),
  resolution_notes: z.string().trim().max(50000).nullable().optional(),
  resolution_cost: z.number().min(0).nullable().optional(),
  resolved_at: z.string().nullable().optional(),
  resolved_by: z.string().uuid().nullable().optional(),
})
