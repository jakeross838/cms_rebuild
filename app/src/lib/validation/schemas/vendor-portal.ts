/**
 * Module 30: Vendor Portal Validation Schemas
 */

import { z } from 'zod'

// -- Enums ────────────────────────────────────────────────────────────────────

export const portalAccessLevelEnum = z.enum(['full', 'limited', 'readonly'])

export const submissionTypeEnum = z.enum([
  'invoice', 'lien_waiver', 'insurance_cert', 'w9', 'schedule_update', 'daily_report',
])

export const submissionStatusEnum = z.enum([
  'draft', 'submitted', 'under_review', 'approved', 'rejected',
])

export const invitationStatusEnum = z.enum([
  'pending', 'accepted', 'expired', 'revoked',
])

export const messageDirectionEnum = z.enum(['to_vendor', 'from_vendor'])

// -- Settings ─────────────────────────────────────────────────────────────────

export const getSettingsSchema = z.object({})

export const createSettingsSchema = z.object({
  portal_enabled: z.boolean().optional().default(false),
  allow_self_registration: z.boolean().optional().default(false),
  require_approval: z.boolean().optional().default(true),
  allowed_submission_types: z.array(submissionTypeEnum).optional().default(['invoice', 'lien_waiver', 'insurance_cert', 'w9', 'daily_report']),
  required_compliance_docs: z.array(z.string().trim().min(1).max(100)).optional().default(['insurance_cert', 'w9']),
  auto_approve_submissions: z.boolean().optional().default(false),
  portal_welcome_message: z.string().trim().max(5000).nullable().optional(),
  portal_branding: z.record(z.string(), z.unknown()).optional().default({}),
  notification_settings: z.record(z.string(), z.unknown()).optional().default({}),
})

export const updateSettingsSchema = z.object({
  portal_enabled: z.boolean().optional(),
  allow_self_registration: z.boolean().optional(),
  require_approval: z.boolean().optional(),
  allowed_submission_types: z.array(submissionTypeEnum).optional(),
  required_compliance_docs: z.array(z.string().trim().min(1).max(100)).optional(),
  auto_approve_submissions: z.boolean().optional(),
  portal_welcome_message: z.string().trim().max(5000).nullable().optional(),
  portal_branding: z.record(z.string(), z.unknown()).optional(),
  notification_settings: z.record(z.string(), z.unknown()).optional(),
})

// -- Invitations ──────────────────────────────────────────────────────────────

export const listInvitationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: invitationStatusEnum.optional(),
  email: z.string().trim().email().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createInvitationSchema = z.object({
  vendor_id: z.string().uuid().nullable().optional(),
  vendor_name: z.string().trim().min(1).max(200),
  contact_name: z.string().trim().max(200).nullable().optional(),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(20).nullable().optional(),
  message: z.string().trim().max(5000).nullable().optional(),
  expires_in_days: z.number().int().min(1).max(90).optional().default(30),
})

export const updateInvitationSchema = z.object({
  vendor_name: z.string().trim().min(1).max(200).optional(),
  contact_name: z.string().trim().max(200).nullable().optional(),
  email: z.string().trim().email().max(255).optional(),
  phone: z.string().trim().max(20).nullable().optional(),
  message: z.string().trim().max(5000).nullable().optional(),
  status: invitationStatusEnum.optional(),
})

export const revokeInvitationSchema = z.object({
  notes: z.string().trim().max(5000).nullable().optional(),
})

// -- Access ───────────────────────────────────────────────────────────────────

export const listAccessSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  vendor_id: z.string().uuid().optional(),
  access_level: portalAccessLevelEnum.optional(),
})

export const createAccessSchema = z.object({
  vendor_id: z.string().uuid(),
  access_level: portalAccessLevelEnum.optional().default('limited'),
  can_submit_invoices: z.boolean().optional().default(true),
  can_submit_lien_waivers: z.boolean().optional().default(true),
  can_submit_daily_reports: z.boolean().optional().default(false),
  can_view_schedule: z.boolean().optional().default(true),
  can_view_purchase_orders: z.boolean().optional().default(true),
  can_upload_documents: z.boolean().optional().default(true),
  can_send_messages: z.boolean().optional().default(true),
  allowed_job_ids: z.array(z.string().uuid()).optional().default([]),
})

export const updateAccessSchema = z.object({
  access_level: portalAccessLevelEnum.optional(),
  can_submit_invoices: z.boolean().optional(),
  can_submit_lien_waivers: z.boolean().optional(),
  can_submit_daily_reports: z.boolean().optional(),
  can_view_schedule: z.boolean().optional(),
  can_view_purchase_orders: z.boolean().optional(),
  can_upload_documents: z.boolean().optional(),
  can_send_messages: z.boolean().optional(),
  allowed_job_ids: z.array(z.string().uuid()).optional(),
})

// -- Submissions ──────────────────────────────────────────────────────────────

export const listSubmissionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  vendor_id: z.string().uuid().optional(),
  job_id: z.string().uuid().optional(),
  submission_type: submissionTypeEnum.optional(),
  status: submissionStatusEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createSubmissionSchema = z.object({
  vendor_id: z.string().uuid(),
  job_id: z.string().uuid().nullable().optional(),
  submission_type: submissionTypeEnum,
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(10000).nullable().optional(),
  amount: z.number().min(0).max(99999999999999.99).nullable().optional(),
  reference_number: z.string().trim().max(100).nullable().optional(),
  file_urls: z.array(z.string().url().max(500)).optional().default([]),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
  status: submissionStatusEnum.optional().default('draft'),
})

export const updateSubmissionSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  amount: z.number().min(0).max(99999999999999.99).nullable().optional(),
  reference_number: z.string().trim().max(100).nullable().optional(),
  file_urls: z.array(z.string().url().max(500)).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  status: submissionStatusEnum.optional(),
  rejection_reason: z.string().trim().max(5000).nullable().optional(),
})

export const submitSubmissionSchema = z.object({
  notes: z.string().trim().max(5000).nullable().optional(),
})

export const reviewSubmissionSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejection_reason: z.string().trim().max(5000).nullable().optional(),
})

// -- Messages ─────────────────────────────────────────────────────────────────

export const listMessagesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  vendor_id: z.string().uuid().optional(),
  job_id: z.string().uuid().optional(),
  direction: messageDirectionEnum.optional(),
  is_read: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val,
    z.boolean().optional()
  ),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createMessageSchema = z.object({
  vendor_id: z.string().uuid(),
  job_id: z.string().uuid().nullable().optional(),
  subject: z.string().trim().min(1).max(255),
  body: z.string().trim().min(1).max(50000),
  direction: messageDirectionEnum.optional().default('to_vendor'),
  attachments: z.array(z.unknown()).optional().default([]),
  parent_message_id: z.string().uuid().nullable().optional(),
})

export const updateMessageSchema = z.object({
  subject: z.string().trim().min(1).max(255).optional(),
  body: z.string().trim().min(1).max(50000).optional(),
  is_read: z.boolean().optional(),
})

export const markReadSchema = z.object({
  notes: z.string().trim().max(5000).nullable().optional(),
})
