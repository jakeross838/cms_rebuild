/**
 * Module 05 — Notification Engine Acceptance Tests
 * Verifies schema contracts, types, service constants, and validation.
 */

import { describe, it, expect } from 'vitest'

import {
  notificationUrgencyEnum,
  notificationCategoryEnum,
  notificationChannelEnum,
  digestFrequencyEnum,
  listNotificationsSchema,
  updatePreferencesSchema,
  updateSettingsSchema,
  emitNotificationSchema,
} from '@/lib/validation/schemas/notifications'

import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CHANNELS,
} from '@/lib/notifications/service'

import type {
  NotificationUrgency,
  NotificationCategory,
  NotificationChannel,
  DeliveryStatus,
  DigestFrequency,
  Notification,
  NotificationDelivery,
  NotificationEventType,
  UserNotificationPreference,
  UserNotificationSetting,
} from '@/types/database'

// ============================================================================
// Enum completeness
// ============================================================================

describe('Spec: Notification enums are complete', () => {
  it('NotificationUrgency has 4 levels', () => {
    const values: NotificationUrgency[] = ['low', 'normal', 'high', 'critical']
    expect(values).toHaveLength(4)
    for (const v of values) {
      expect(notificationUrgencyEnum.safeParse(v).success).toBe(true)
    }
  })

  it('NotificationCategory has 6 categories', () => {
    const values: NotificationCategory[] = ['financial', 'schedule', 'documents', 'field_operations', 'approvals', 'system']
    expect(values).toHaveLength(6)
    for (const v of values) {
      expect(notificationCategoryEnum.safeParse(v).success).toBe(true)
    }
  })

  it('NotificationChannel has 4 channels', () => {
    const values: NotificationChannel[] = ['in_app', 'email', 'sms', 'push']
    expect(values).toHaveLength(4)
    for (const v of values) {
      expect(notificationChannelEnum.safeParse(v).success).toBe(true)
    }
  })

  it('DeliveryStatus has 6 statuses', () => {
    const values: DeliveryStatus[] = ['queued', 'processing', 'sent', 'delivered', 'failed', 'bounced']
    expect(values).toHaveLength(6)
  })

  it('DigestFrequency has 3 options', () => {
    const values: DigestFrequency[] = ['hourly', 'twice_daily', 'daily']
    expect(values).toHaveLength(3)
    for (const v of values) {
      expect(digestFrequencyEnum.safeParse(v).success).toBe(true)
    }
  })
})

// ============================================================================
// Type coverage
// ============================================================================

describe('Spec: Notification types have required fields', () => {
  it('Notification has all required fields', () => {
    const n: Notification = {
      id: '123',
      company_id: '456',
      user_id: '789',
      event_type: 'invoice.approved',
      category: 'financial',
      title: 'Invoice Approved',
      body: 'Invoice #1234 approved',
      entity_type: 'invoice',
      entity_id: 'abc',
      url_path: '/financial/payables/abc',
      urgency: 'normal',
      read: false,
      read_at: null,
      archived: false,
      snoozed_until: null,
      idempotency_key: null,
      triggered_by: null,
      job_id: null,
      created_at: '2026-02-23T00:00:00Z',
    }
    expect(n.id).toBeDefined()
    expect(n.category).toBe('financial')
    expect(n.urgency).toBe('normal')
  })

  it('NotificationEventType has event_type and module', () => {
    const et: NotificationEventType = {
      id: '123',
      event_type: 'invoice.approved',
      module: 'invoices',
      description: 'Invoice approved',
      default_channels: ['in_app', 'email'],
      default_roles: ['owner', 'pm'],
      variables: ['invoice_number'],
      urgency: 'normal',
      category: 'financial',
      created_at: '2026-02-23T00:00:00Z',
    }
    expect(et.event_type).toBe('invoice.approved')
    expect(et.module).toBe('invoices')
  })

  it('NotificationDelivery tracks channel and status', () => {
    const d: NotificationDelivery = {
      id: '123',
      notification_id: '456',
      channel: 'email',
      status: 'delivered',
      provider_message_id: null,
      attempts: 1,
      last_attempt_at: null,
      error_message: null,
      created_at: '2026-02-23T00:00:00Z',
      updated_at: '2026-02-23T00:00:00Z',
    }
    expect(d.channel).toBe('email')
    expect(d.status).toBe('delivered')
  })

  it('UserNotificationPreference has category-channel matrix', () => {
    const p: UserNotificationPreference = {
      id: '123',
      user_id: '456',
      company_id: '789',
      category: 'financial',
      channel: 'email',
      enabled: true,
      created_at: '2026-02-23T00:00:00Z',
      updated_at: '2026-02-23T00:00:00Z',
    }
    expect(p.category).toBe('financial')
    expect(p.channel).toBe('email')
  })

  it('UserNotificationSetting has quiet hours and digest', () => {
    const s: UserNotificationSetting = {
      id: '123',
      user_id: '456',
      company_id: '789',
      quiet_start: '22:00',
      quiet_end: '07:00',
      timezone: 'America/New_York',
      digest_mode: false,
      digest_frequency: 'daily',
      digest_time: '08:00',
      critical_bypass_quiet: true,
      created_at: '2026-02-23T00:00:00Z',
      updated_at: '2026-02-23T00:00:00Z',
    }
    expect(s.timezone).toBe('America/New_York')
    expect(s.digest_frequency).toBe('daily')
  })
})

// ============================================================================
// Schema validation
// ============================================================================

describe('Spec: List notifications schema', () => {
  it('accepts empty query (all defaults)', () => {
    const result = listNotificationsSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts category filter', () => {
    const result = listNotificationsSchema.safeParse({ category: 'financial' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid category', () => {
    const result = listNotificationsSchema.safeParse({ category: 'bogus' })
    expect(result.success).toBe(false)
  })

  it('parses read filter as boolean', () => {
    const result = listNotificationsSchema.safeParse({ read: 'false' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.read).toBe(false)
    }
  })
})

describe('Spec: Update preferences schema', () => {
  it('accepts valid preferences array', () => {
    const result = updatePreferencesSchema.safeParse({
      preferences: [
        { category: 'financial', channel: 'email', enabled: true },
        { category: 'schedule', channel: 'in_app', enabled: false },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid channel', () => {
    const result = updatePreferencesSchema.safeParse({
      preferences: [{ category: 'financial', channel: 'telegram', enabled: true }],
    })
    expect(result.success).toBe(false)
  })
})

describe('Spec: Update settings schema', () => {
  it('accepts valid quiet hours', () => {
    const result = updateSettingsSchema.safeParse({
      quiet_start: '22:00',
      quiet_end: '07:00',
      timezone: 'America/Chicago',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid time format', () => {
    const result = updateSettingsSchema.safeParse({ quiet_start: '10pm' })
    expect(result.success).toBe(false)
  })

  it('accepts digest settings', () => {
    const result = updateSettingsSchema.safeParse({
      digest_mode: true,
      digest_frequency: 'twice_daily',
      digest_time: '09:00',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid digest frequency', () => {
    const result = updateSettingsSchema.safeParse({ digest_frequency: 'weekly' })
    expect(result.success).toBe(false)
  })
})

describe('Spec: Emit notification schema', () => {
  it('accepts valid notification emission', () => {
    const result = emitNotificationSchema.safeParse({
      event_type: 'invoice.approved',
      title: 'Invoice Approved',
      category: 'financial',
      recipient_user_ids: ['550e8400-e29b-41d4-a716-446655440000'],
    })
    expect(result.success).toBe(true)
  })

  it('requires at least one recipient', () => {
    const result = emitNotificationSchema.safeParse({
      event_type: 'invoice.approved',
      title: 'Invoice Approved',
      category: 'financial',
      recipient_user_ids: [],
    })
    expect(result.success).toBe(false)
  })

  it('defaults urgency to normal', () => {
    const result = emitNotificationSchema.safeParse({
      event_type: 'test',
      title: 'Test',
      category: 'system',
      recipient_user_ids: ['550e8400-e29b-41d4-a716-446655440000'],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.urgency).toBe('normal')
    }
  })
})

// ============================================================================
// Service constants
// ============================================================================

describe('Spec: Notification service constants', () => {
  it('NOTIFICATION_CATEGORIES covers all 6 categories', () => {
    expect(NOTIFICATION_CATEGORIES).toHaveLength(6)
    const values = NOTIFICATION_CATEGORIES.map((c) => c.value)
    expect(values).toContain('financial')
    expect(values).toContain('schedule')
    expect(values).toContain('documents')
    expect(values).toContain('field_operations')
    expect(values).toContain('approvals')
    expect(values).toContain('system')
  })

  it('each category has value, label, and defaultChannels', () => {
    for (const cat of NOTIFICATION_CATEGORIES) {
      expect(cat.value).toBeTruthy()
      expect(cat.label).toBeTruthy()
      expect(cat.defaultChannels.length).toBeGreaterThan(0)
    }
  })

  it('NOTIFICATION_CHANNELS covers all 4 channels', () => {
    expect(NOTIFICATION_CHANNELS).toHaveLength(4)
    const values = NOTIFICATION_CHANNELS.map((c) => c.value)
    expect(values).toContain('in_app')
    expect(values).toContain('email')
    expect(values).toContain('sms')
    expect(values).toContain('push')
  })

  it('financial and approvals default to in_app + email', () => {
    const financial = NOTIFICATION_CATEGORIES.find((c) => c.value === 'financial')!
    const approvals = NOTIFICATION_CATEGORIES.find((c) => c.value === 'approvals')!
    expect(financial.defaultChannels).toContain('in_app')
    expect(financial.defaultChannels).toContain('email')
    expect(approvals.defaultChannels).toContain('in_app')
    expect(approvals.defaultChannels).toContain('email')
  })
})
