/**
 * Communications Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const communicationTypeEnum = z.enum([
  'email', 'phone', 'text', 'letter', 'meeting', 'note', 'other',
])

export const communicationStatusEnum = z.enum([
  'draft', 'sent', 'received', 'read', 'archived',
])

export const communicationPriorityEnum = z.enum([
  'low', 'normal', 'high', 'urgent',
])

// ── Date helper ───────────────────────────────────────────────────────────

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format')

// ── Communications ──────────────────────────────────────────────────────────

export const listCommunicationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  communication_type: communicationTypeEnum.optional(),
  status: communicationStatusEnum.optional(),
  priority: communicationPriorityEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createCommunicationSchema = z.object({
  job_id: z.string().uuid(),
  subject: z.string().trim().min(1).max(255),
  message_body: z.string().trim().min(1).max(50000),
  communication_type: communicationTypeEnum.optional().default('email'),
  status: communicationStatusEnum.optional().default('draft'),
  priority: communicationPriorityEnum.optional().default('normal'),
  recipient: z.string().trim().max(255).nullable().optional(),
  notes: z.string().trim().max(50000).nullable().optional(),
})

export const updateCommunicationSchema = z.object({
  subject: z.string().trim().min(1).max(255).optional(),
  message_body: z.string().trim().min(1).max(50000).optional(),
  communication_type: communicationTypeEnum.optional(),
  status: communicationStatusEnum.optional(),
  priority: communicationPriorityEnum.optional(),
  recipient: z.string().trim().max(255).nullable().optional(),
  notes: z.string().trim().max(50000).nullable().optional(),
})
