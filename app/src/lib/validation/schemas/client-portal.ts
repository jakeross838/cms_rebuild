/**
 * Module 12: Client Portal Validation Schemas
 */

import { z } from 'zod'

// ── Enums ────────────────────────────────────────────────────────────────────

export const senderTypeEnum = z.enum(['builder', 'client'])

export const postTypeEnum = z.enum([
  'general_update', 'milestone', 'photo_update', 'schedule_update', 'budget_update',
])

export const portalActionEnum = z.enum([
  'viewed_update', 'viewed_document', 'sent_message', 'viewed_photo', 'logged_in',
])

// ── Portal Settings ──────────────────────────────────────────────────────────

export const getPortalSettingsSchema = z.object({
  job_id: z.string().uuid(),
})

export const updatePortalSettingsSchema = z.object({
  job_id: z.string().uuid(),
  is_enabled: z.boolean().optional(),
  branding_logo_url: z.string().url().nullable().optional(),
  branding_primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color').optional(),
  welcome_message: z.string().trim().max(2000).nullable().optional(),
  show_budget: z.boolean().optional(),
  show_schedule: z.boolean().optional(),
  show_documents: z.boolean().optional(),
  show_photos: z.boolean().optional(),
  show_daily_logs: z.boolean().optional(),
})

// ── Portal Messages ──────────────────────────────────────────────────────────

export const listMessagesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid(),
})

export const createMessageSchema = z.object({
  job_id: z.string().uuid(),
  sender_type: senderTypeEnum,
  subject: z.string().trim().min(1).max(200).nullable().optional(),
  body: z.string().trim().min(1).max(5000),
  parent_message_id: z.string().uuid().nullable().optional(),
})

export const updateMessageSchema = z.object({
  is_read: z.boolean(),
})

// ── Portal Update Posts ──────────────────────────────────────────────────────

export const listUpdatePostsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid(),
  post_type: postTypeEnum.optional(),
  is_published: z.coerce.boolean().optional(),
})

export const createUpdatePostSchema = z.object({
  job_id: z.string().uuid(),
  title: z.string().trim().min(1).max(300),
  body: z.string().trim().min(1).max(10000),
  post_type: postTypeEnum,
})

export const updateUpdatePostSchema = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  body: z.string().trim().min(1).max(10000).optional(),
  post_type: postTypeEnum.optional(),
})

// ── Portal Shared Documents ──────────────────────────────────────────────────

export const listSharedDocumentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid(),
})

export const shareDocumentSchema = z.object({
  job_id: z.string().uuid(),
  document_id: z.string().uuid(),
  notes: z.string().trim().max(1000).nullable().optional(),
})

// ── Portal Shared Photos ─────────────────────────────────────────────────────

export const listSharedPhotosSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid(),
  album_name: z.string().trim().min(1).max(100).optional(),
})

export const sharePhotoSchema = z.object({
  job_id: z.string().uuid(),
  storage_path: z.string().trim().min(1).max(1000),
  caption: z.string().trim().max(500).nullable().optional(),
  album_name: z.string().trim().min(1).max(100).nullable().optional(),
  sort_order: z.number().int().min(0).default(0),
})

// ── Portal Activity Log ──────────────────────────────────────────────────────

export const logActivitySchema = z.object({
  job_id: z.string().uuid(),
  client_id: z.string().uuid(),
  action: portalActionEnum,
  metadata: z.record(z.string(), z.unknown()).optional(),
})
