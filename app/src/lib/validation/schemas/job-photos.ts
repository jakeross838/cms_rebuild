/**
 * Job Photos Validation Schemas
 */

import { z } from 'zod'

// ── Date helper ───────────────────────────────────────────────────────────

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format')

// ── Job Photos ──────────────────────────────────────────────────────────────

export const listJobPhotosSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  category: z.string().trim().max(100).optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createJobPhotoSchema = z.object({
  job_id: z.string().uuid(),
  title: z.string().trim().min(1).max(255),
  photo_url: z.string().trim().min(1).max(2000),
  description: z.string().trim().max(50000).nullable().optional(),
  category: z.string().trim().max(100).nullable().optional(),
  location: z.string().trim().max(255).nullable().optional(),
  taken_by: z.string().uuid().nullable().optional(),
  taken_date: dateString.nullable().optional(),
  notes: z.string().trim().max(50000).nullable().optional(),
})

export const updateJobPhotoSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  photo_url: z.string().trim().min(1).max(2000).optional(),
  description: z.string().trim().max(50000).nullable().optional(),
  category: z.string().trim().max(100).nullable().optional(),
  location: z.string().trim().max(255).nullable().optional(),
  taken_by: z.string().uuid().nullable().optional(),
  taken_date: dateString.nullable().optional(),
  notes: z.string().trim().max(50000).nullable().optional(),
})
