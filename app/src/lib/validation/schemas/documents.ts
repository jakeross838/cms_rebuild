/**
 * Module 06: Document Storage Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────
export const documentStatusEnum = z.enum(['active', 'archived', 'deleted', 'quarantined', 'legal_hold'])

export const documentTypeEnum = z.enum([
  'invoice', 'contract', 'plan', 'coi', 'lien_waiver', 'permit',
  'photo', 'specification', 'submittal', 'correspondence',
  'daily_log', 'change_order', 'purchase_order', 'other',
])

export const extractionStatusEnum = z.enum(['pending', 'processing', 'completed', 'failed'])

// ── List / Browse Documents ───────────────────────────────────────────────
export const listDocumentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  folder_id: z.string().uuid().optional(),
  document_type: documentTypeEnum.optional(),
  status: documentStatusEnum.optional(),
  tag: z.string().trim().min(1).max(100).optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

// ── Upload Document Metadata ──────────────────────────────────────────────
export const uploadDocumentSchema = z.object({
  filename: z.string().trim().min(1).max(500),
  mime_type: z.string().trim().min(1).max(200),
  file_size: z.number().int().positive().max(500 * 1024 * 1024), // 500 MB
  job_id: z.string().uuid().optional(),
  folder_id: z.string().uuid().optional(),
  document_type: documentTypeEnum.optional(),
  tags: z.array(z.string().trim().min(1).max(100)).max(50).optional(),
})

// ── Update Document ───────────────────────────────────────────────────────
export const updateDocumentSchema = z.object({
  filename: z.string().trim().min(1).max(500).optional(),
  folder_id: z.string().uuid().nullable().optional(),
  document_type: documentTypeEnum.nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(100)).max(50).optional(),
})

// ── Create Folder ─────────────────────────────────────────────────────────
export const createFolderSchema = z.object({
  name: z.string().trim().min(1).max(200),
  parent_folder_id: z.string().uuid().nullable().optional(),
})

// ── Update Folder ─────────────────────────────────────────────────────────
export const updateFolderSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  parent_folder_id: z.string().uuid().nullable().optional(),
})

// ── New Version ───────────────────────────────────────────────────────────
export const createVersionSchema = z.object({
  filename: z.string().trim().min(1).max(500),
  mime_type: z.string().trim().min(1).max(200),
  file_size: z.number().int().positive().max(500 * 1024 * 1024),
  change_notes: z.string().trim().max(1000).optional(),
})

// ── Set Expiration ────────────────────────────────────────────────────────
export const setExpirationSchema = z.object({
  expiration_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  entity_type: z.string().trim().min(1).max(50).optional(),
  entity_id: z.string().uuid().optional(),
})

// ── Tag Library ───────────────────────────────────────────────────────────
export const addTagSchema = z.object({
  tag: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(100).optional(),
})

// ── Document Settings ─────────────────────────────────────────────────────
export const updateDocumentSettingsSchema = z.object({
  folder_templates: z.array(z.object({
    name: z.string().trim().min(1).max(200),
    folders: z.array(z.string().trim().min(1).max(500)),
  })).optional(),
  retention_policy: z.record(z.string(), z.object({
    years: z.number().int().positive().max(100),
    action: z.enum(['archive', 'delete', 'review']),
  })).optional(),
  max_file_size_mb: z.number().int().positive().max(2048).optional(),
  blocked_extensions: z.array(z.string().trim().min(1).max(20)).optional(),
})
