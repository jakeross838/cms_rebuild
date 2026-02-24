/**
 * Notification Service
 *
 * Central service for emitting notifications. Modules call emit()
 * which creates notification records for each recipient and queues
 * delivery jobs for each configured channel.
 */

import { createClient } from '@/lib/supabase/server'
import type { NotificationCategory, NotificationUrgency } from '@/types/database'

export interface EmitOptions {
  companyId: string
  eventType: string
  category: NotificationCategory
  title: string
  body?: string
  urgency?: NotificationUrgency
  entityType?: string
  entityId?: string
  urlPath?: string
  jobId?: string
  triggeredBy?: string
  recipientUserIds: string[]
}

interface NotificationRow {
  id: string
  company_id: string
  user_id: string
  event_type: string
  category: string
  title: string
  body: string | null
  urgency: string
}

/**
 * Emit a notification to one or more recipients.
 * Creates notification records and in-app delivery records.
 */
export async function emitNotification(options: EmitOptions): Promise<{ notificationIds: string[] }> {
  const supabase = await createClient()
  const {
    companyId,
    eventType,
    category,
    title,
    body,
    urgency = 'normal',
    entityType,
    entityId,
    urlPath,
    jobId,
    triggeredBy,
    recipientUserIds,
  } = options

  // Create a notification record for each recipient
  const records = recipientUserIds.map((userId) => ({
    company_id: companyId,
    user_id: userId,
    event_type: eventType,
    category,
    title,
    body: body ?? null,
    urgency,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
    url_path: urlPath ?? null,
    job_id: jobId ?? null,
    triggered_by: triggeredBy ?? null,
    idempotency_key: `${eventType}:${entityId ?? 'none'}:${userId}:${Math.floor(Date.now() / 60000)}`,
  }))

  const { data, error } = await (supabase
    .from('notifications') as any)
    .upsert(records, { onConflict: 'idempotency_key', ignoreDuplicates: true })
    .select('id') as unknown as { data: { id: string }[] | null; error: { message: string } | null }

  if (error) {
    throw new Error(`Failed to emit notifications: ${error.message}`)
  }

  const notificationIds = (data ?? []).map((r) => r.id)

  // Create in-app delivery records for each notification
  if (notificationIds.length > 0) {
    const deliveries = notificationIds.map((notificationId) => ({
      notification_id: notificationId,
      channel: 'in_app' as const,
      status: 'delivered' as const,
    }))

    await (supabase
      .from('notification_deliveries') as any)
      .insert(deliveries)
  }

  return { notificationIds }
}

/**
 * Get the default notification categories with their channel defaults.
 */
export const NOTIFICATION_CATEGORIES: { value: NotificationCategory; label: string; defaultChannels: string[] }[] = [
  { value: 'financial', label: 'Financial', defaultChannels: ['in_app', 'email'] },
  { value: 'schedule', label: 'Schedule', defaultChannels: ['in_app'] },
  { value: 'documents', label: 'Documents', defaultChannels: ['in_app'] },
  { value: 'field_operations', label: 'Field Operations', defaultChannels: ['in_app'] },
  { value: 'approvals', label: 'Approvals', defaultChannels: ['in_app', 'email'] },
  { value: 'system', label: 'System', defaultChannels: ['in_app'] },
]

export const NOTIFICATION_CHANNELS: { value: string; label: string }[] = [
  { value: 'in_app', label: 'In-App' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push' },
]
