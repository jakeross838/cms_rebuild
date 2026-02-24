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

// ============================================================================
// Module 29: Full Client Portal Validation Schemas (extends Module 12)
// ============================================================================

// ── Enums (Module 29) ───────────────────────────────────────────────────────

export const approvalStatusEnum = z.enum(['pending', 'approved', 'rejected', 'expired'])

export const approvalTypeEnum = z.enum([
  'selection', 'change_order', 'draw', 'invoice', 'schedule',
])

export const messageStatusEnum = z.enum(['sent', 'read', 'archived'])

export const messageSenderTypeEnum = z.enum(['client', 'builder_team'])

export const messageCategoryEnum = z.enum([
  'general', 'selections', 'change_orders', 'schedule', 'budget', 'warranty', 'other',
])

export const externalChannelEnum = z.enum(['phone', 'text', 'email'])

export const invitationStatusEnum = z.enum(['pending', 'accepted', 'expired', 'revoked'])

export const paymentStatusEnum = z.enum([
  'pending', 'processing', 'completed', 'failed', 'refunded',
])

export const paymentMethodEnum = z.enum([
  'credit_card', 'ach', 'check', 'wire', 'other',
])

// ── Client Portal Settings (company-level) ──────────────────────────────────

export const updateClientPortalSettingsSchema = z.object({
  branding: z.record(z.string(), z.unknown()).optional(),
  custom_domain: z.string().trim().max(200).nullable().optional(),
  feature_flags: z.record(z.string(), z.unknown()).optional(),
  visibility_rules: z.record(z.string(), z.unknown()).optional(),
  notification_rules: z.record(z.string(), z.unknown()).optional(),
  approval_config: z.record(z.string(), z.unknown()).optional(),
  email_templates: z.record(z.string(), z.unknown()).optional(),
  footer_text: z.string().trim().max(5000).nullable().optional(),
  privacy_policy_url: z.string().url().nullable().optional(),
  terms_of_service_url: z.string().url().nullable().optional(),
})

// ── Client Portal Invitations ───────────────────────────────────────────────

export const listClientInvitationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  status: invitationStatusEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createClientInvitationSchema = z.object({
  job_id: z.string().uuid(),
  email: z.string().email().max(255),
  client_name: z.string().trim().min(1).max(255).nullable().optional(),
  role: z.string().trim().min(1).max(50).optional().default('client'),
  message: z.string().trim().max(2000).nullable().optional(),
  expires_in_days: z.number().int().min(1).max(90).optional().default(7),
})

export const updateClientInvitationSchema = z.object({
  status: invitationStatusEnum.optional(),
  client_name: z.string().trim().min(1).max(255).nullable().optional(),
  message: z.string().trim().max(2000).nullable().optional(),
})

// ── Client Approvals ────────────────────────────────────────────────────────

export const listClientApprovalsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  status: approvalStatusEnum.optional(),
  approval_type: approvalTypeEnum.optional(),
  client_user_id: z.string().uuid().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createClientApprovalSchema = z.object({
  job_id: z.string().uuid(),
  client_user_id: z.string().uuid(),
  approval_type: approvalTypeEnum,
  reference_id: z.string().uuid(),
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).nullable().optional(),
  expires_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').nullable().optional(),
})

export const updateClientApprovalSchema = z.object({
  status: approvalStatusEnum.optional(),
  comments: z.string().trim().max(5000).nullable().optional(),
  signature_data: z.string().max(50000).nullable().optional(),
  signature_ip: z.string().max(45).nullable().optional(),
  signature_hash: z.string().max(64).nullable().optional(),
})

// ── Client Messages (Module 29 enhanced messaging) ──────────────────────────

export const listClientMessagesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  category: messageCategoryEnum.optional(),
  status: messageStatusEnum.optional(),
  sender_type: messageSenderTypeEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createClientMessageSchema = z.object({
  job_id: z.string().uuid(),
  sender_type: messageSenderTypeEnum,
  subject: z.string().trim().min(1).max(255).nullable().optional(),
  message_text: z.string().trim().min(1).max(10000),
  thread_id: z.string().uuid().nullable().optional(),
  topic: z.string().trim().min(1).max(200).nullable().optional(),
  category: messageCategoryEnum.optional().default('general'),
  attachments: z.array(z.unknown()).optional().default([]),
  is_external_log: z.boolean().optional().default(false),
  external_channel: externalChannelEnum.nullable().optional(),
})

export const updateClientMessageSchema = z.object({
  status: messageStatusEnum.optional(),
  read_at: z.string().nullable().optional(),
})

// ── Client Payments ─────────────────────────────────────────────────────────

export const listClientPaymentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  status: paymentStatusEnum.optional(),
  payment_method: paymentMethodEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createClientPaymentSchema = z.object({
  job_id: z.string().uuid(),
  client_user_id: z.string().uuid().nullable().optional(),
  payment_number: z.string().trim().min(1).max(50).nullable().optional(),
  amount: z.number().min(0).max(9999999999999.99),
  payment_method: paymentMethodEnum.optional().default('check'),
  status: paymentStatusEnum.optional().default('pending'),
  reference_number: z.string().trim().max(100).nullable().optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  draw_request_id: z.string().uuid().nullable().optional(),
  invoice_id: z.string().uuid().nullable().optional(),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})
