import { z } from 'zod'

import { paginationSchema } from './common'

// ============================================================================
// Enums
// ============================================================================

export const notificationUrgencyEnum = z.enum(['low', 'normal', 'high', 'critical'])
export const notificationCategoryEnum = z.enum(['financial', 'schedule', 'documents', 'field_operations', 'approvals', 'system'])
export const notificationChannelEnum = z.enum(['in_app', 'email', 'sms', 'push'])
export const digestFrequencyEnum = z.enum(['hourly', 'twice_daily', 'daily'])

// ============================================================================
// List Notifications (query params)
// ============================================================================

export const listNotificationsSchema = paginationSchema.extend({
  category: notificationCategoryEnum.optional(),
  urgency: notificationUrgencyEnum.optional(),
  read: z.enum(['true', 'false']).optional().transform((v) => v === 'true' ? true : v === 'false' ? false : undefined),
})

// ============================================================================
// Update Preferences
// ============================================================================

export const updatePreferencesSchema = z.object({
  preferences: z.array(z.object({
    category: notificationCategoryEnum,
    channel: notificationChannelEnum,
    enabled: z.boolean(),
  })),
})

// ============================================================================
// Update Settings (quiet hours, digest)
// ============================================================================

export const updateSettingsSchema = z.object({
  quiet_start: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  quiet_end: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  timezone: z.string().max(50).optional(),
  digest_mode: z.boolean().optional(),
  digest_frequency: digestFrequencyEnum.optional(),
  digest_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  critical_bypass_quiet: z.boolean().optional(),
})

// ============================================================================
// Emit Notification (internal use by service)
// ============================================================================

export const emitNotificationSchema = z.object({
  event_type: z.string().min(1),
  title: z.string().min(1).max(500),
  body: z.string().max(2000).optional(),
  category: notificationCategoryEnum,
  urgency: notificationUrgencyEnum.default('normal'),
  entity_type: z.string().optional(),
  entity_id: z.string().uuid().optional(),
  url_path: z.string().optional(),
  job_id: z.string().uuid().optional(),
  recipient_user_ids: z.array(z.string().uuid()).min(1),
})

// ============================================================================
// Mark Notification Read/Unread
// ============================================================================

export const markNotificationReadSchema = z.object({
  read: z.boolean().default(true),
})

// ============================================================================
// Inferred Types
// ============================================================================

export type ListNotificationsInput = z.infer<typeof listNotificationsSchema>
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>
export type EmitNotificationInput = z.infer<typeof emitNotificationSchema>
export type MarkNotificationReadInput = z.infer<typeof markNotificationReadSchema>
