/**
 * Module 41: Onboarding Wizard Validation Schemas
 */

import { z } from 'zod'

// ── Enums ────────────────────────────────────────────────────────────────────

export const onboardingStatusEnum = z.enum([
  'not_started', 'in_progress', 'completed', 'skipped',
])

export const milestoneStatusEnum = z.enum([
  'pending', 'in_progress', 'completed', 'skipped',
])

export const reminderTypeEnum = z.enum(['email', 'in_app', 'push'])

export const reminderStatusEnum = z.enum([
  'scheduled', 'sent', 'cancelled', 'failed',
])

export const sampleDataTypeEnum = z.enum([
  'full_demo', 'minimal', 'custom_home', 'production', 'remodel', 'commercial',
])

export const sampleDataStatusEnum = z.enum([
  'pending', 'generating', 'ready', 'applied', 'failed',
])

export const companyTypeEnum = z.enum([
  'custom_home', 'production', 'remodel', 'commercial', 'specialty',
])

export const companySizeEnum = z.enum([
  '1-5', '6-20', '21-50', '51-100', '100+',
])

export const checklistCategoryEnum = z.enum([
  'setup', 'data', 'team', 'workflow', 'integration',
])

// ── Onboarding Sessions ─────────────────────────────────────────────────────

export const listOnboardingSessionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: onboardingStatusEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createOnboardingSessionSchema = z.object({
  user_id: z.string().uuid(),
  status: onboardingStatusEnum.optional().default('not_started'),
  current_step: z.number().int().min(1).max(50).optional().default(1),
  total_steps: z.number().int().min(1).max(50).optional().default(8),
  company_type: companyTypeEnum.nullable().optional(),
  company_size: companySizeEnum.nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
})

export const updateOnboardingSessionSchema = z.object({
  status: onboardingStatusEnum.optional(),
  current_step: z.number().int().min(1).max(50).optional(),
  total_steps: z.number().int().min(1).max(50).optional(),
  company_type: companyTypeEnum.nullable().optional(),
  company_size: companySizeEnum.nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

// ── Onboarding Milestones ───────────────────────────────────────────────────

export const listMilestonesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  session_id: z.string().uuid().optional(),
  status: milestoneStatusEnum.optional(),
})

export const createMilestoneSchema = z.object({
  session_id: z.string().uuid(),
  milestone_key: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).nullable().optional(),
  status: milestoneStatusEnum.optional().default('pending'),
  sort_order: z.number().int().min(0).optional().default(0),
  data: z.record(z.string(), z.unknown()).optional().default({}),
})

export const updateMilestoneSchema = z.object({
  milestone_key: z.string().trim().min(1).max(100).optional(),
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  status: milestoneStatusEnum.optional(),
  sort_order: z.number().int().min(0).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
})

// ── Onboarding Reminders ────────────────────────────────────────────────────

export const listRemindersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  session_id: z.string().uuid().optional(),
  status: reminderStatusEnum.optional(),
  reminder_type: reminderTypeEnum.optional(),
})

export const createReminderSchema = z.object({
  session_id: z.string().uuid(),
  reminder_type: reminderTypeEnum.optional().default('email'),
  subject: z.string().trim().min(1).max(255).nullable().optional(),
  message: z.string().trim().max(5000).nullable().optional(),
  scheduled_at: z.string().min(1, 'scheduled_at is required'),
  status: reminderStatusEnum.optional().default('scheduled'),
})

export const updateReminderSchema = z.object({
  reminder_type: reminderTypeEnum.optional(),
  subject: z.string().trim().min(1).max(255).nullable().optional(),
  message: z.string().trim().max(5000).nullable().optional(),
  scheduled_at: z.string().optional(),
  status: reminderStatusEnum.optional(),
})

// ── Sample Data Sets ────────────────────────────────────────────────────────

export const listSampleDataSetsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  data_type: sampleDataTypeEnum.optional(),
  status: sampleDataStatusEnum.optional(),
})

export const createSampleDataSetSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).nullable().optional(),
  data_type: sampleDataTypeEnum.optional().default('full_demo'),
  status: sampleDataStatusEnum.optional().default('pending'),
  content: z.record(z.string(), z.unknown()).optional().default({}),
})

export const updateSampleDataSetSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  data_type: sampleDataTypeEnum.optional(),
  status: sampleDataStatusEnum.optional(),
  content: z.record(z.string(), z.unknown()).optional(),
})

// ── Onboarding Checklists ───────────────────────────────────────────────────

export const listChecklistsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  session_id: z.string().uuid().optional(),
  category: checklistCategoryEnum.optional(),
  is_completed: z.preprocess(
    (val) => {
      if (val === 'true') return true
      if (val === 'false') return false
      return val
    },
    z.boolean().optional()
  ),
})

export const createChecklistSchema = z.object({
  session_id: z.string().uuid(),
  category: checklistCategoryEnum.optional().default('setup'),
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).nullable().optional(),
  is_completed: z.boolean().optional().default(false),
  is_required: z.boolean().optional().default(true),
  sort_order: z.number().int().min(0).optional().default(0),
})

export const updateChecklistSchema = z.object({
  category: checklistCategoryEnum.optional(),
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  is_completed: z.boolean().optional(),
  is_required: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
})
