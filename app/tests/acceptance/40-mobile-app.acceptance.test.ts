/**
 * Module 40 — Mobile App Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 40 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  DevicePlatform,
  DeviceStatus,
  SyncStatus,
  SyncAction,
  NotificationProvider,
  PhotoQuality,
  GpsAccuracy,
  AppTheme,
  SessionStatus,
  MobileDevice,
  PushNotificationToken,
  OfflineSyncQueueItem,
  MobileAppSettings,
  MobileSession,
} from '@/types/mobile-app'

import {
  DEVICE_PLATFORMS,
  DEVICE_STATUSES,
  SYNC_STATUSES,
  SYNC_ACTIONS,
  NOTIFICATION_PROVIDERS,
  PHOTO_QUALITIES,
  GPS_ACCURACIES,
  APP_THEMES,
  SESSION_STATUSES,
} from '@/types/mobile-app'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  devicePlatformEnum,
  deviceStatusEnum,
  syncStatusEnum,
  syncActionEnum,
  notificationProviderEnum,
  photoQualityEnum,
  gpsAccuracyEnum,
  appThemeEnum,
  sessionStatusEnum,
  listMobileDevicesSchema,
  createMobileDeviceSchema,
  updateMobileDeviceSchema,
  listPushTokensSchema,
  createPushTokenSchema,
  updatePushTokenSchema,
  listSyncQueueSchema,
  createSyncQueueItemSchema,
  updateSyncQueueItemSchema,
  getMobileSettingsSchema,
  updateMobileSettingsSchema,
  listMobileSessionsSchema,
  createMobileSessionSchema,
  updateMobileSessionSchema,
  revokeMobileSessionSchema,
} from '@/lib/validation/schemas/mobile-app'

// ============================================================================
// Type System
// ============================================================================

describe('Module 40 — Mobile App Types', () => {
  test('DevicePlatform has 3 values', () => {
    const platforms: DevicePlatform[] = ['ios', 'android', 'web']
    expect(platforms).toHaveLength(3)
  })

  test('DeviceStatus has 3 values', () => {
    const statuses: DeviceStatus[] = ['active', 'inactive', 'revoked']
    expect(statuses).toHaveLength(3)
  })

  test('SyncStatus has 5 values', () => {
    const statuses: SyncStatus[] = ['pending', 'syncing', 'synced', 'conflict', 'failed']
    expect(statuses).toHaveLength(5)
  })

  test('SyncAction has 3 values', () => {
    const actions: SyncAction[] = ['create', 'update', 'delete']
    expect(actions).toHaveLength(3)
  })

  test('NotificationProvider has 3 values', () => {
    const providers: NotificationProvider[] = ['fcm', 'apns', 'web_push']
    expect(providers).toHaveLength(3)
  })

  test('PhotoQuality has 3 values', () => {
    const qualities: PhotoQuality[] = ['low', 'medium', 'high']
    expect(qualities).toHaveLength(3)
  })

  test('GpsAccuracy has 3 values', () => {
    const accuracies: GpsAccuracy[] = ['low', 'balanced', 'high']
    expect(accuracies).toHaveLength(3)
  })

  test('AppTheme has 3 values', () => {
    const themes: AppTheme[] = ['light', 'dark', 'system']
    expect(themes).toHaveLength(3)
  })

  test('SessionStatus has 3 values', () => {
    const statuses: SessionStatus[] = ['active', 'expired', 'revoked']
    expect(statuses).toHaveLength(3)
  })

  test('MobileDevice interface has all required fields', () => {
    const device: MobileDevice = {
      id: '1', company_id: '1', user_id: '1', device_name: 'iPhone 15 Pro',
      platform: 'ios', status: 'active', device_model: 'iPhone15,3',
      os_version: '17.4', app_version: '1.0.0', device_token: 'token123',
      last_active_at: '2026-02-23T10:00:00Z', last_ip_address: '192.168.1.1',
      metadata: {}, created_by: '1',
      created_at: '2026-02-23', updated_at: '2026-02-23', deleted_at: null,
    }
    expect(device.device_name).toBe('iPhone 15 Pro')
    expect(device.platform).toBe('ios')
    expect(device.status).toBe('active')
  })

  test('PushNotificationToken interface has all required fields', () => {
    const token: PushNotificationToken = {
      id: '1', company_id: '1', user_id: '1', device_id: '1',
      token: 'fcm_token_abc123', provider: 'fcm', is_active: true,
      last_used_at: '2026-02-23T10:00:00Z',
      created_at: '2026-02-23', updated_at: '2026-02-23',
    }
    expect(token.token).toBe('fcm_token_abc123')
    expect(token.provider).toBe('fcm')
    expect(token.is_active).toBe(true)
  })

  test('OfflineSyncQueueItem interface has all required fields', () => {
    const item: OfflineSyncQueueItem = {
      id: '1', company_id: '1', user_id: '1', device_id: '1',
      action: 'create', entity_type: 'daily_log', entity_id: '2',
      payload: { title: 'Test Log' }, status: 'pending', priority: 5,
      retry_count: 0, max_retries: 5, error_message: null, synced_at: null,
      created_at: '2026-02-23', updated_at: '2026-02-23',
    }
    expect(item.action).toBe('create')
    expect(item.entity_type).toBe('daily_log')
    expect(item.status).toBe('pending')
    expect(item.priority).toBe(5)
  })

  test('MobileAppSettings interface has all required fields', () => {
    const settings: MobileAppSettings = {
      id: '1', company_id: '1', user_id: '1',
      data_saver_mode: false, auto_sync: true, sync_on_wifi_only: false,
      photo_quality: 'high', location_tracking: false, gps_accuracy: 'balanced',
      biometric_enabled: false, quiet_hours_start: '22:00', quiet_hours_end: '07:00',
      push_notifications: true, offline_storage_limit_mb: 500,
      theme: 'system', preferences: {},
      created_at: '2026-02-23', updated_at: '2026-02-23',
    }
    expect(settings.photo_quality).toBe('high')
    expect(settings.gps_accuracy).toBe('balanced')
    expect(settings.theme).toBe('system')
    expect(settings.offline_storage_limit_mb).toBe(500)
  })

  test('MobileSession interface has all required fields', () => {
    const session: MobileSession = {
      id: '1', company_id: '1', user_id: '1', device_id: '1',
      session_token: 'session_abc123', status: 'active',
      ip_address: '192.168.1.1', user_agent: 'RossOS/1.0',
      started_at: '2026-02-23T10:00:00Z', last_activity_at: '2026-02-23T10:30:00Z',
      expires_at: '2026-02-24T10:00:00Z', ended_at: null,
      created_at: '2026-02-23', updated_at: '2026-02-23',
    }
    expect(session.session_token).toBe('session_abc123')
    expect(session.status).toBe('active')
    expect(session.ended_at).toBeNull()
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 40 — Constants', () => {
  test('DEVICE_PLATFORMS has 3 entries with value and label', () => {
    expect(DEVICE_PLATFORMS).toHaveLength(3)
    for (const p of DEVICE_PLATFORMS) {
      expect(p).toHaveProperty('value')
      expect(p).toHaveProperty('label')
      expect(p.label.length).toBeGreaterThan(0)
    }
  })

  test('DEVICE_PLATFORMS includes all expected values', () => {
    const values = DEVICE_PLATFORMS.map((p) => p.value)
    expect(values).toContain('ios')
    expect(values).toContain('android')
    expect(values).toContain('web')
  })

  test('DEVICE_STATUSES has 3 entries with value and label', () => {
    expect(DEVICE_STATUSES).toHaveLength(3)
    for (const s of DEVICE_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    }
  })

  test('SYNC_STATUSES has 5 entries with value and label', () => {
    expect(SYNC_STATUSES).toHaveLength(5)
    const values = SYNC_STATUSES.map((s) => s.value)
    expect(values).toContain('pending')
    expect(values).toContain('syncing')
    expect(values).toContain('synced')
    expect(values).toContain('conflict')
    expect(values).toContain('failed')
  })

  test('SYNC_ACTIONS has 3 entries with value and label', () => {
    expect(SYNC_ACTIONS).toHaveLength(3)
    const values = SYNC_ACTIONS.map((a) => a.value)
    expect(values).toContain('create')
    expect(values).toContain('update')
    expect(values).toContain('delete')
  })

  test('NOTIFICATION_PROVIDERS has 3 entries with value and label', () => {
    expect(NOTIFICATION_PROVIDERS).toHaveLength(3)
    const values = NOTIFICATION_PROVIDERS.map((p) => p.value)
    expect(values).toContain('fcm')
    expect(values).toContain('apns')
    expect(values).toContain('web_push')
  })

  test('PHOTO_QUALITIES has 3 entries with value and label', () => {
    expect(PHOTO_QUALITIES).toHaveLength(3)
    const values = PHOTO_QUALITIES.map((q) => q.value)
    expect(values).toContain('low')
    expect(values).toContain('medium')
    expect(values).toContain('high')
  })

  test('GPS_ACCURACIES has 3 entries with value and label', () => {
    expect(GPS_ACCURACIES).toHaveLength(3)
    const values = GPS_ACCURACIES.map((a) => a.value)
    expect(values).toContain('low')
    expect(values).toContain('balanced')
    expect(values).toContain('high')
  })

  test('APP_THEMES has 3 entries with value and label', () => {
    expect(APP_THEMES).toHaveLength(3)
    const values = APP_THEMES.map((t) => t.value)
    expect(values).toContain('light')
    expect(values).toContain('dark')
    expect(values).toContain('system')
  })

  test('SESSION_STATUSES has 3 entries with value and label', () => {
    expect(SESSION_STATUSES).toHaveLength(3)
    const values = SESSION_STATUSES.map((s) => s.value)
    expect(values).toContain('active')
    expect(values).toContain('expired')
    expect(values).toContain('revoked')
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 40 — Enum Schemas', () => {
  test('devicePlatformEnum accepts all 3 platforms', () => {
    for (const p of ['ios', 'android', 'web']) {
      expect(devicePlatformEnum.parse(p)).toBe(p)
    }
  })

  test('devicePlatformEnum rejects invalid platform', () => {
    expect(() => devicePlatformEnum.parse('windows')).toThrow()
  })

  test('deviceStatusEnum accepts all 3 statuses', () => {
    for (const s of ['active', 'inactive', 'revoked']) {
      expect(deviceStatusEnum.parse(s)).toBe(s)
    }
  })

  test('deviceStatusEnum rejects invalid status', () => {
    expect(() => deviceStatusEnum.parse('deleted')).toThrow()
  })

  test('syncStatusEnum accepts all 5 statuses', () => {
    for (const s of ['pending', 'syncing', 'synced', 'conflict', 'failed']) {
      expect(syncStatusEnum.parse(s)).toBe(s)
    }
  })

  test('syncStatusEnum rejects invalid status', () => {
    expect(() => syncStatusEnum.parse('cancelled')).toThrow()
  })

  test('syncActionEnum accepts all 3 actions', () => {
    for (const a of ['create', 'update', 'delete']) {
      expect(syncActionEnum.parse(a)).toBe(a)
    }
  })

  test('syncActionEnum rejects invalid action', () => {
    expect(() => syncActionEnum.parse('upsert')).toThrow()
  })

  test('notificationProviderEnum accepts all 3 providers', () => {
    for (const p of ['fcm', 'apns', 'web_push']) {
      expect(notificationProviderEnum.parse(p)).toBe(p)
    }
  })

  test('notificationProviderEnum rejects invalid provider', () => {
    expect(() => notificationProviderEnum.parse('email')).toThrow()
  })

  test('photoQualityEnum accepts all 3 qualities', () => {
    for (const q of ['low', 'medium', 'high']) {
      expect(photoQualityEnum.parse(q)).toBe(q)
    }
  })

  test('gpsAccuracyEnum accepts all 3 accuracies', () => {
    for (const a of ['low', 'balanced', 'high']) {
      expect(gpsAccuracyEnum.parse(a)).toBe(a)
    }
  })

  test('appThemeEnum accepts all 3 themes', () => {
    for (const t of ['light', 'dark', 'system']) {
      expect(appThemeEnum.parse(t)).toBe(t)
    }
  })

  test('sessionStatusEnum accepts all 3 statuses', () => {
    for (const s of ['active', 'expired', 'revoked']) {
      expect(sessionStatusEnum.parse(s)).toBe(s)
    }
  })

  test('sessionStatusEnum rejects invalid status', () => {
    expect(() => sessionStatusEnum.parse('suspended')).toThrow()
  })
})

// ============================================================================
// Mobile Device Schemas
// ============================================================================

describe('Module 40 — Mobile Device Schemas', () => {
  test('listMobileDevicesSchema accepts valid params', () => {
    const result = listMobileDevicesSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listMobileDevicesSchema rejects limit > 100', () => {
    expect(() => listMobileDevicesSchema.parse({ limit: 200 })).toThrow()
  })

  test('listMobileDevicesSchema accepts filters', () => {
    const result = listMobileDevicesSchema.parse({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      platform: 'ios',
      status: 'active',
      q: 'iPhone',
    })
    expect(result.user_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.platform).toBe('ios')
    expect(result.status).toBe('active')
    expect(result.q).toBe('iPhone')
  })

  test('createMobileDeviceSchema accepts valid device', () => {
    const result = createMobileDeviceSchema.parse({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      device_name: 'iPhone 15 Pro',
    })
    expect(result.device_name).toBe('iPhone 15 Pro')
    expect(result.platform).toBe('web')
    expect(result.status).toBe('active')
    expect(result.metadata).toEqual({})
  })

  test('createMobileDeviceSchema requires user_id and device_name', () => {
    expect(() => createMobileDeviceSchema.parse({})).toThrow()
    expect(() => createMobileDeviceSchema.parse({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
  })

  test('createMobileDeviceSchema rejects device_name > 200 chars', () => {
    expect(() => createMobileDeviceSchema.parse({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      device_name: 'A'.repeat(201),
    })).toThrow()
  })

  test('createMobileDeviceSchema accepts all optional fields', () => {
    const result = createMobileDeviceSchema.parse({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      device_name: 'Samsung Galaxy S24',
      platform: 'android',
      status: 'active',
      device_model: 'SM-S921B',
      os_version: '14',
      app_version: '1.2.0',
      device_token: 'token_xyz',
      last_ip_address: '10.0.0.1',
      metadata: { screen_size: '6.2in' },
    })
    expect(result.platform).toBe('android')
    expect(result.device_model).toBe('SM-S921B')
    expect(result.metadata).toEqual({ screen_size: '6.2in' })
  })

  test('updateMobileDeviceSchema accepts partial updates', () => {
    const result = updateMobileDeviceSchema.parse({ device_name: 'Updated Name', status: 'inactive' })
    expect(result.device_name).toBe('Updated Name')
    expect(result.status).toBe('inactive')
    expect(result.platform).toBeUndefined()
  })
})

// ============================================================================
// Push Token Schemas
// ============================================================================

describe('Module 40 — Push Token Schemas', () => {
  test('listPushTokensSchema accepts valid params with defaults', () => {
    const result = listPushTokensSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listPushTokensSchema accepts filters', () => {
    const result = listPushTokensSchema.parse({
      device_id: '550e8400-e29b-41d4-a716-446655440000',
      provider: 'apns',
    })
    expect(result.device_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.provider).toBe('apns')
  })

  test('createPushTokenSchema accepts valid token', () => {
    const result = createPushTokenSchema.parse({
      device_id: '550e8400-e29b-41d4-a716-446655440000',
      token: 'fcm_token_abc123',
    })
    expect(result.token).toBe('fcm_token_abc123')
    expect(result.provider).toBe('fcm')
    expect(result.is_active).toBe(true)
  })

  test('createPushTokenSchema requires device_id and token', () => {
    expect(() => createPushTokenSchema.parse({})).toThrow()
    expect(() => createPushTokenSchema.parse({
      device_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
  })

  test('createPushTokenSchema accepts all providers', () => {
    for (const provider of ['fcm', 'apns', 'web_push']) {
      const result = createPushTokenSchema.parse({
        device_id: '550e8400-e29b-41d4-a716-446655440000',
        token: 'token_test',
        provider,
      })
      expect(result.provider).toBe(provider)
    }
  })

  test('updatePushTokenSchema accepts partial updates', () => {
    const result = updatePushTokenSchema.parse({ is_active: false })
    expect(result.is_active).toBe(false)
    expect(result.token).toBeUndefined()
  })
})

// ============================================================================
// Sync Queue Schemas
// ============================================================================

describe('Module 40 — Sync Queue Schemas', () => {
  test('listSyncQueueSchema accepts valid params', () => {
    const result = listSyncQueueSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listSyncQueueSchema accepts filters', () => {
    const result = listSyncQueueSchema.parse({
      device_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'pending',
      action: 'create',
      entity_type: 'daily_log',
    })
    expect(result.status).toBe('pending')
    expect(result.action).toBe('create')
    expect(result.entity_type).toBe('daily_log')
  })

  test('createSyncQueueItemSchema accepts valid item', () => {
    const result = createSyncQueueItemSchema.parse({
      device_id: '550e8400-e29b-41d4-a716-446655440000',
      entity_type: 'daily_log',
    })
    expect(result.entity_type).toBe('daily_log')
    expect(result.action).toBe('create')
    expect(result.status).toBe('pending')
    expect(result.priority).toBe(5)
    expect(result.max_retries).toBe(5)
    expect(result.payload).toEqual({})
  })

  test('createSyncQueueItemSchema requires device_id and entity_type', () => {
    expect(() => createSyncQueueItemSchema.parse({})).toThrow()
    expect(() => createSyncQueueItemSchema.parse({
      device_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
  })

  test('createSyncQueueItemSchema rejects priority outside 1-10', () => {
    expect(() => createSyncQueueItemSchema.parse({
      device_id: '550e8400-e29b-41d4-a716-446655440000',
      entity_type: 'daily_log',
      priority: 0,
    })).toThrow()
    expect(() => createSyncQueueItemSchema.parse({
      device_id: '550e8400-e29b-41d4-a716-446655440000',
      entity_type: 'daily_log',
      priority: 11,
    })).toThrow()
  })

  test('createSyncQueueItemSchema rejects max_retries > 20', () => {
    expect(() => createSyncQueueItemSchema.parse({
      device_id: '550e8400-e29b-41d4-a716-446655440000',
      entity_type: 'daily_log',
      max_retries: 21,
    })).toThrow()
  })

  test('updateSyncQueueItemSchema accepts partial updates', () => {
    const result = updateSyncQueueItemSchema.parse({ status: 'synced', synced_at: '2026-02-23T12:00:00Z' })
    expect(result.status).toBe('synced')
    expect(result.synced_at).toBe('2026-02-23T12:00:00Z')
  })

  test('updateSyncQueueItemSchema accepts error_message', () => {
    const result = updateSyncQueueItemSchema.parse({ status: 'failed', error_message: 'Connection timeout' })
    expect(result.status).toBe('failed')
    expect(result.error_message).toBe('Connection timeout')
  })
})

// ============================================================================
// Mobile Settings Schemas
// ============================================================================

describe('Module 40 — Mobile Settings Schemas', () => {
  test('getMobileSettingsSchema accepts empty object', () => {
    const result = getMobileSettingsSchema.parse({})
    expect(result.user_id).toBeUndefined()
  })

  test('getMobileSettingsSchema accepts user_id', () => {
    const result = getMobileSettingsSchema.parse({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.user_id).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  test('updateMobileSettingsSchema accepts valid settings', () => {
    const result = updateMobileSettingsSchema.parse({
      data_saver_mode: true,
      auto_sync: false,
      photo_quality: 'low',
      theme: 'dark',
    })
    expect(result.data_saver_mode).toBe(true)
    expect(result.auto_sync).toBe(false)
    expect(result.photo_quality).toBe('low')
    expect(result.theme).toBe('dark')
  })

  test('updateMobileSettingsSchema validates quiet_hours format', () => {
    const result = updateMobileSettingsSchema.parse({
      quiet_hours_start: '22:00',
      quiet_hours_end: '07:00',
    })
    expect(result.quiet_hours_start).toBe('22:00')
    expect(result.quiet_hours_end).toBe('07:00')
  })

  test('updateMobileSettingsSchema rejects invalid quiet_hours format', () => {
    expect(() => updateMobileSettingsSchema.parse({
      quiet_hours_start: 'ten pm',
    })).toThrow()
  })

  test('updateMobileSettingsSchema validates offline_storage_limit_mb range', () => {
    expect(() => updateMobileSettingsSchema.parse({
      offline_storage_limit_mb: 49,
    })).toThrow()
    expect(() => updateMobileSettingsSchema.parse({
      offline_storage_limit_mb: 10001,
    })).toThrow()
    const result = updateMobileSettingsSchema.parse({ offline_storage_limit_mb: 1000 })
    expect(result.offline_storage_limit_mb).toBe(1000)
  })

  test('updateMobileSettingsSchema accepts all boolean fields', () => {
    const result = updateMobileSettingsSchema.parse({
      data_saver_mode: true,
      auto_sync: false,
      sync_on_wifi_only: true,
      location_tracking: true,
      biometric_enabled: true,
      push_notifications: false,
    })
    expect(result.data_saver_mode).toBe(true)
    expect(result.auto_sync).toBe(false)
    expect(result.sync_on_wifi_only).toBe(true)
    expect(result.location_tracking).toBe(true)
    expect(result.biometric_enabled).toBe(true)
    expect(result.push_notifications).toBe(false)
  })

  test('updateMobileSettingsSchema accepts preferences object', () => {
    const result = updateMobileSettingsSchema.parse({
      preferences: { font_size: 'large', language: 'es' },
    })
    expect(result.preferences).toEqual({ font_size: 'large', language: 'es' })
  })
})

// ============================================================================
// Mobile Session Schemas
// ============================================================================

describe('Module 40 — Mobile Session Schemas', () => {
  test('listMobileSessionsSchema accepts valid params', () => {
    const result = listMobileSessionsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listMobileSessionsSchema accepts filters', () => {
    const result = listMobileSessionsSchema.parse({
      device_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'active',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
    })
    expect(result.device_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.status).toBe('active')
    expect(result.user_id).toBe('550e8400-e29b-41d4-a716-446655440001')
  })

  test('listMobileSessionsSchema rejects limit > 100', () => {
    expect(() => listMobileSessionsSchema.parse({ limit: 200 })).toThrow()
  })

  test('createMobileSessionSchema accepts valid session', () => {
    const result = createMobileSessionSchema.parse({
      device_id: '550e8400-e29b-41d4-a716-446655440000',
      session_token: 'session_abc123',
    })
    expect(result.session_token).toBe('session_abc123')
    expect(result.status).toBe('active')
  })

  test('createMobileSessionSchema requires device_id and session_token', () => {
    expect(() => createMobileSessionSchema.parse({})).toThrow()
    expect(() => createMobileSessionSchema.parse({
      device_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
  })

  test('createMobileSessionSchema accepts all optional fields', () => {
    const result = createMobileSessionSchema.parse({
      device_id: '550e8400-e29b-41d4-a716-446655440000',
      session_token: 'session_abc123',
      ip_address: '192.168.1.1',
      user_agent: 'RossOS/1.0 iOS',
      expires_at: '2026-02-24T10:00:00Z',
    })
    expect(result.ip_address).toBe('192.168.1.1')
    expect(result.user_agent).toBe('RossOS/1.0 iOS')
    expect(result.expires_at).toBe('2026-02-24T10:00:00Z')
  })

  test('updateMobileSessionSchema accepts partial updates', () => {
    const result = updateMobileSessionSchema.parse({ status: 'expired', ended_at: '2026-02-23T18:00:00Z' })
    expect(result.status).toBe('expired')
    expect(result.ended_at).toBe('2026-02-23T18:00:00Z')
  })

  test('updateMobileSessionSchema accepts last_activity_at', () => {
    const result = updateMobileSessionSchema.parse({ last_activity_at: '2026-02-23T15:30:00Z' })
    expect(result.last_activity_at).toBe('2026-02-23T15:30:00Z')
  })

  test('revokeMobileSessionSchema accepts empty object', () => {
    const result = revokeMobileSessionSchema.parse({})
    expect(result.reason).toBeUndefined()
  })

  test('revokeMobileSessionSchema accepts reason', () => {
    const result = revokeMobileSessionSchema.parse({ reason: 'Lost device' })
    expect(result.reason).toBe('Lost device')
  })

  test('revokeMobileSessionSchema rejects reason > 500 chars', () => {
    expect(() => revokeMobileSessionSchema.parse({ reason: 'A'.repeat(501) })).toThrow()
  })
})
