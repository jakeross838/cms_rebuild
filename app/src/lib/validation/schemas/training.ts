/**
 * Module 47: Training & Certification Platform Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const courseTypeEnum = z.enum([
  'video', 'article', 'walkthrough', 'assessment',
])

export const difficultyEnum = z.enum([
  'beginner', 'intermediate', 'advanced',
])

export const trainingStatusEnum = z.enum([
  'not_started', 'in_progress', 'completed',
])

export const pathItemTypeEnum = z.enum([
  'course', 'assessment', 'checkpoint',
])

export const certificationLevelEnum = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
])

// ── Training Courses ──────────────────────────────────────────────────────

export const listCoursesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  course_type: courseTypeEnum.optional(),
  difficulty: difficultyEnum.optional(),
  category: z.string().trim().max(100).optional(),
  is_published: z.preprocess(
    (val) => (val === 'true' ? true : val === 'false' ? false : val),
    z.boolean().optional()
  ),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createCourseSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).nullable().optional(),
  content_url: z.string().url().nullable().optional(),
  thumbnail_url: z.string().url().nullable().optional(),
  duration_minutes: z.number().int().min(0).max(9999).nullable().optional(),
  course_type: courseTypeEnum.optional().default('video'),
  category: z.string().trim().max(100).nullable().optional(),
  module_tag: z.string().trim().max(50).nullable().optional(),
  role_tags: z.array(z.string().trim().max(50)).optional().default([]),
  difficulty: difficultyEnum.optional().default('beginner'),
  language: z.string().trim().max(10).optional().default('en'),
  transcript: z.string().nullable().optional(),
  sort_order: z.number().int().min(0).optional().default(0),
  is_published: z.boolean().optional().default(false),
})

export const updateCourseSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  content_url: z.string().url().nullable().optional(),
  thumbnail_url: z.string().url().nullable().optional(),
  duration_minutes: z.number().int().min(0).max(9999).nullable().optional(),
  course_type: courseTypeEnum.optional(),
  category: z.string().trim().max(100).nullable().optional(),
  module_tag: z.string().trim().max(50).nullable().optional(),
  role_tags: z.array(z.string().trim().max(50)).optional(),
  difficulty: difficultyEnum.optional(),
  language: z.string().trim().max(10).optional(),
  transcript: z.string().nullable().optional(),
  sort_order: z.number().int().min(0).optional(),
  is_published: z.boolean().optional(),
  view_count: z.number().int().min(0).optional(),
})

// ── Training Paths ────────────────────────────────────────────────────────

export const listPathsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  role_key: z.string().trim().max(50).optional(),
  is_active: z.preprocess(
    (val) => (val === 'true' ? true : val === 'false' ? false : val),
    z.boolean().optional()
  ),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createPathSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).nullable().optional(),
  role_key: z.string().trim().max(50).nullable().optional(),
  estimated_hours: z.number().min(0).max(9999).optional().default(0),
  sort_order: z.number().int().min(0).optional().default(0),
  is_active: z.boolean().optional().default(true),
})

export const updatePathSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  role_key: z.string().trim().max(50).nullable().optional(),
  estimated_hours: z.number().min(0).max(9999).optional(),
  sort_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
})

// ── Training Path Items ───────────────────────────────────────────────────

export const listPathItemsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export const createPathItemSchema = z.object({
  item_type: pathItemTypeEnum.optional().default('course'),
  item_id: z.string().uuid(),
  sort_order: z.number().int().min(0).optional().default(0),
  is_required: z.boolean().optional().default(true),
})

export const updatePathItemSchema = z.object({
  item_type: pathItemTypeEnum.optional(),
  item_id: z.string().uuid().optional(),
  sort_order: z.number().int().min(0).optional(),
  is_required: z.boolean().optional(),
})

// ── User Training Progress ────────────────────────────────────────────────

export const listProgressSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  user_id: z.string().uuid().optional(),
  item_type: pathItemTypeEnum.optional(),
  status: trainingStatusEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createProgressSchema = z.object({
  user_id: z.string().uuid(),
  item_type: pathItemTypeEnum.optional().default('course'),
  item_id: z.string().uuid(),
  status: trainingStatusEnum.optional().default('not_started'),
  progress_pct: z.number().int().min(0).max(100).optional().default(0),
  started_at: z.string().datetime().nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
})

export const updateProgressSchema = z.object({
  status: trainingStatusEnum.optional(),
  progress_pct: z.number().int().min(0).max(100).optional(),
  started_at: z.string().datetime().nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
})

// ── User Certifications ───────────────────────────────────────────────────

export const listCertificationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  user_id: z.string().uuid().optional(),
  passed: z.preprocess(
    (val) => (val === 'true' ? true : val === 'false' ? false : val),
    z.boolean().optional()
  ),
  certification_level: z.coerce.number().int().min(1).max(3).optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createCertificationSchema = z.object({
  user_id: z.string().uuid(),
  certification_name: z.string().trim().min(1).max(255),
  certification_level: z.number().int().min(1).max(3).optional().default(1),
  description: z.string().trim().max(5000).nullable().optional(),
  passing_score: z.number().int().min(0).max(100).optional().default(80),
  assessment_score: z.number().int().min(0).max(100).nullable().optional(),
  passed: z.boolean().optional().default(false),
  attempt_count: z.number().int().min(1).max(999).optional().default(1),
  certified_at: z.string().datetime().nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
  time_limit_minutes: z.number().int().min(1).max(9999).nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

export const updateCertificationSchema = z.object({
  certification_name: z.string().trim().min(1).max(255).optional(),
  certification_level: z.number().int().min(1).max(3).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  passing_score: z.number().int().min(0).max(100).optional(),
  assessment_score: z.number().int().min(0).max(100).nullable().optional(),
  passed: z.boolean().optional(),
  attempt_count: z.number().int().min(1).max(999).optional(),
  certified_at: z.string().datetime().nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
  time_limit_minutes: z.number().int().min(1).max(9999).nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})
