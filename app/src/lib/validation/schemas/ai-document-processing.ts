/**
 * Module 24: AI Document Processing Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const documentTypeEnum = z.enum([
  'invoice', 'receipt', 'lien_waiver', 'change_order', 'purchase_order',
  'contract', 'permit', 'inspection_report', 'plan_sheet', 'specification',
  'submittal', 'rfi', 'other',
])

export const extractionStatusEnum = z.enum([
  'pending', 'processing', 'completed', 'failed', 'review_needed',
])

export const queueStatusEnum = z.enum([
  'queued', 'processing', 'completed', 'failed', 'cancelled',
])

export const queuePriorityEnum = z.union([
  z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5),
])

export const feedbackTypeEnum = z.enum([
  'correction', 'confirmation', 'rejection',
])

// ── Document Classifications ──────────────────────────────────────────────

export const listClassificationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  document_id: z.string().uuid().optional(),
  classified_type: documentTypeEnum.optional(),
  min_confidence: z.coerce.number().min(0).max(1).optional(),
})

export const createClassificationSchema = z.object({
  document_id: z.string().uuid(),
  classified_type: documentTypeEnum,
  confidence_score: z.number().min(0).max(1),
  model_version: z.string().trim().max(50).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
})

// ── Extraction Templates ──────────────────────────────────────────────────

export const listTemplatesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  document_type: documentTypeEnum.optional(),
  is_active: z.coerce.boolean().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createTemplateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  document_type: documentTypeEnum,
  field_definitions: z.array(z.record(z.string(), z.unknown())).optional().default([]),
  is_active: z.boolean().optional().default(true),
  is_system: z.boolean().optional().default(false),
})

export const updateTemplateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  document_type: documentTypeEnum.optional(),
  field_definitions: z.array(z.record(z.string(), z.unknown())).optional(),
  is_active: z.boolean().optional(),
  is_system: z.boolean().optional(),
})

// ── Document Extractions ──────────────────────────────────────────────────

export const listExtractionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  document_id: z.string().uuid().optional(),
  status: extractionStatusEnum.optional(),
  classification_id: z.string().uuid().optional(),
})

export const createExtractionSchema = z.object({
  document_id: z.string().uuid(),
  classification_id: z.string().uuid().nullable().optional(),
  extraction_template_id: z.string().uuid().nullable().optional(),
  extracted_data: z.record(z.string(), z.unknown()).optional().default({}),
  status: extractionStatusEnum.optional().default('pending'),
})

export const updateExtractionSchema = z.object({
  extracted_data: z.record(z.string(), z.unknown()).optional(),
  status: extractionStatusEnum.optional(),
  reviewed_by: z.string().uuid().nullable().optional(),
  reviewed_at: z.string().nullable().optional(),
})

// ── Document Processing Queue ─────────────────────────────────────────────

export const listQueueSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: queueStatusEnum.optional(),
  priority: z.coerce.number().int().min(1).max(5).optional(),
})

export const createQueueItemSchema = z.object({
  document_id: z.string().uuid(),
  priority: z.number().int().min(1).max(5).optional().default(3),
  max_attempts: z.number().int().min(1).max(10).optional().default(3),
})

export const updateQueueItemSchema = z.object({
  status: queueStatusEnum.optional(),
  priority: z.number().int().min(1).max(5).optional(),
  error_message: z.string().max(5000).nullable().optional(),
  started_at: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
})

// ── AI Feedback ───────────────────────────────────────────────────────────

export const listFeedbackSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  feedback_type: feedbackTypeEnum.optional(),
})

export const createFeedbackSchema = z.object({
  extraction_id: z.string().uuid().nullable().optional(),
  field_name: z.string().trim().min(1).max(200),
  original_value: z.string().max(10000).nullable().optional(),
  corrected_value: z.string().max(10000).nullable().optional(),
  feedback_type: feedbackTypeEnum,
})
