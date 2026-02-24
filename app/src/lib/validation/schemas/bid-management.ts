/**
 * Module 26: Bid Management Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const bidPackageStatusEnum = z.enum([
  'draft', 'published', 'closed', 'awarded', 'cancelled',
])

export const invitationStatusEnum = z.enum([
  'invited', 'viewed', 'declined', 'submitted',
])

export const awardStatusEnum = z.enum([
  'pending', 'accepted', 'rejected', 'withdrawn',
])

// ── Date helpers ──────────────────────────────────────────────────────────

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')

// ── Bid Packages ──────────────────────────────────────────────────────────

export const listBidPackagesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  status: bidPackageStatusEnum.optional(),
  trade: z.string().trim().min(1).max(100).optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createBidPackageSchema = z.object({
  job_id: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(10000).nullable().optional(),
  trade: z.string().trim().max(100).nullable().optional(),
  scope_of_work: z.string().trim().max(50000).nullable().optional(),
  bid_due_date: dateStringSchema.nullable().optional(),
  status: bidPackageStatusEnum.optional().default('draft'),
  documents: z.array(z.unknown()).optional().default([]),
})

export const updateBidPackageSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  trade: z.string().trim().max(100).nullable().optional(),
  scope_of_work: z.string().trim().max(50000).nullable().optional(),
  bid_due_date: dateStringSchema.nullable().optional(),
  status: bidPackageStatusEnum.optional(),
  documents: z.array(z.unknown()).optional(),
})

// ── Publish / Close actions ──────────────────────────────────────────────

export const publishBidPackageSchema = z.object({
  notes: z.string().trim().max(5000).nullable().optional(),
})

export const closeBidPackageSchema = z.object({
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── Bid Invitations ──────────────────────────────────────────────────────

export const listBidInvitationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: invitationStatusEnum.optional(),
})

export const createBidInvitationSchema = z.object({
  vendor_id: z.string().uuid(),
})

export const updateBidInvitationSchema = z.object({
  status: invitationStatusEnum.optional(),
  viewed_at: z.string().datetime().nullable().optional(),
  responded_at: z.string().datetime().nullable().optional(),
  decline_reason: z.string().trim().max(5000).nullable().optional(),
})

// ── Bid Responses ────────────────────────────────────────────────────────

export const listBidResponsesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const createBidResponseSchema = z.object({
  vendor_id: z.string().uuid(),
  invitation_id: z.string().uuid().nullable().optional(),
  total_amount: z.number().min(0).max(9999999999999.99),
  breakdown: z.record(z.string(), z.unknown()).optional().default({}),
  notes: z.string().trim().max(10000).nullable().optional(),
  attachments: z.array(z.unknown()).optional().default([]),
  is_qualified: z.boolean().optional().default(true),
})

export const updateBidResponseSchema = z.object({
  total_amount: z.number().min(0).max(9999999999999.99).optional(),
  breakdown: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
  attachments: z.array(z.unknown()).optional(),
  is_qualified: z.boolean().optional(),
})

// ── Bid Comparisons ──────────────────────────────────────────────────────

export const listBidComparisonsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const createBidComparisonSchema = z.object({
  name: z.string().trim().min(1).max(200),
  comparison_data: z.record(z.string(), z.unknown()).optional().default({}),
  notes: z.string().trim().max(10000).nullable().optional(),
})

export const updateBidComparisonSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  comparison_data: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
})

// ── Bid Awards ───────────────────────────────────────────────────────────

export const createBidAwardSchema = z.object({
  vendor_id: z.string().uuid(),
  bid_response_id: z.string().uuid().nullable().optional(),
  award_amount: z.number().min(0).max(9999999999999.99),
  notes: z.string().trim().max(10000).nullable().optional(),
  status: awardStatusEnum.optional().default('pending'),
})

export const updateBidAwardSchema = z.object({
  award_amount: z.number().min(0).max(9999999999999.99).optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
  status: awardStatusEnum.optional(),
})
