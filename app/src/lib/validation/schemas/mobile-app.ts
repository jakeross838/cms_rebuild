/**
 * Module 40: Mobile App Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const devicePlatformEnum = z.enum(['ios', 'android', 'web'])

export const deviceStatusEnum = z.enum(['active', 'inactive', 'revoked'])

export const syncStatusEnum = z.enum(['pending', 'syncing', 'synced', 'conflict', 'failed'])

export const syncActionEnum = z.enum(['create', 'update', 'delete'])

export const notificationProviderEnum = z.enum(['fcm', 'apns', 'web_push'])

export const photoQualityEnum = z.enum(['low', 'medium', 'high'])

export const gpsAccuracyEnum = z.enum(['low', 'balanced', 'high'])

export const appThemeEnum = z.enum(['light', 'dark', 'system'])

export const sessionStatusEnum = z.enum(['active', 'expired', 'revoked'])

// ── Mobile Devices ────────────────────────────────────────────────────────

export const listMobileDevicesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  user_id: z.string().uuid().optional(),
  platform: devicePlatformEnum.optional(),
  status: deviceStatusEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createMobileDeviceSchema = z.object({
  user_id: z.string().uuid(),
  device_name: z.string().trim().min(1).max(200),
  platform: devicePlatformEnum.optional().default('web'),
  status: deviceStatusEnum.optional().default('active'),
  device_model: z.string().trim().max(200).nullable().optional(),
  os_version: z.string().trim().max(50).nullable().optional(),
  app_version: z.string().trim().max(50).nullable().optional(),
  device_token: z.string().trim().max(500).nullable().optional(),
  last_ip_address: z.string().trim().max(45).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
})

export const updateMobileDeviceSchema = z.object({
  device_name: z.string().trim().min(1).max(200).optional(),
  platform: devicePlatformEnum.optional(),
  status: deviceStatusEnum.optional(),
  device_model: z.string().trim().max(200).nullable().optional(),
  os_version: z.string().trim().max(50).nullable().optional(),
  app_version: z.string().trim().max(50).nullable().optional(),
  device_token: z.string().trim().max(500).nullable().optional(),
  last_ip_address: z.string().trim().max(45).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

// ── Push Notification Tokens ──────────────────────────────────────────────

export const listPushTokensSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  device_id: z.string().uuid().optional(),
  provider: notificationProviderEnum.optional(),
  is_active: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val,
    z.boolean().optional()
  ),
})

export const createPushTokenSchema = z.object({
  device_id: z.string().uuid(),
  token: z.string().trim().min(1).max(1000),
  provider: notificationProviderEnum.optional().default('fcm'),
  is_active: z.boolean().optional().default(true),
})

export const updatePushTokenSchema = z.object({
  token: z.string().trim().min(1).max(1000).optional(),
  provider: notificationProviderEnum.optional(),
  is_active: z.boolean().optional(),
})

// ── Offline Sync Queue ────────────────────────────────────────────────────

export const listSyncQueueSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  device_id: z.string().uuid().optional(),
  status: syncStatusEnum.optional(),
  action: syncActionEnum.optional(),
  entity_type: z.string().trim().min(1).max(100).optional(),
})

export const createSyncQueueItemSchema = z.object({
  device_id: z.string().uuid(),
  action: syncActionEnum.optional().default('create'),
  entity_type: z.string().trim().min(1).max(100),
  entity_id: z.string().uuid().nullable().optional(),
  payload: z.record(z.string(), z.unknown()).optional().default({}),
  status: syncStatusEnum.optional().default('pending'),
  priority: z.number().int().min(1).max(10).optional().default(5),
  max_retries: z.number().int().min(1).max(20).optional().default(5),
})

export const updateSyncQueueItemSchema = z.object({
  status: syncStatusEnum.optional(),
  priority: z.number().int().min(1).max(10).optional(),
  retry_count: z.number().int().min(0).optional(),
  error_message: z.string().trim().max(5000).nullable().optional(),
  synced_at: z.string().nullable().optional(),
})

// ── Mobile App Settings ───────────────────────────────────────────────────

export const getMobileSettingsSchema = z.object({
  user_id: z.string().uuid().optional(),
})

export const updateMobileSettingsSchema = z.object({
  data_saver_mode: z.boolean().optional(),
  auto_sync: z.boolean().optional(),
  sync_on_wifi_only: z.boolean().optional(),
  photo_quality: photoQualityEnum.optional(),
  location_tracking: z.boolean().optional(),
  gps_accuracy: gpsAccuracyEnum.optional(),
  biometric_enabled: z.boolean().optional(),
  quiet_hours_start: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Must be HH:MM or HH:MM:SS format').nullable().optional(),
  quiet_hours_end: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Must be HH:MM or HH:MM:SS format').nullable().optional(),
  push_notifications: z.boolean().optional(),
  offline_storage_limit_mb: z.number().int().min(50).max(10000).optional(),
  theme: appThemeEnum.optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
})

// ── Mobile Sessions ───────────────────────────────────────────────────────

export const listMobileSessionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  device_id: z.string().uuid().optional(),
  status: sessionStatusEnum.optional(),
  user_id: z.string().uuid().optional(),
})

export const createMobileSessionSchema = z.object({
  device_id: z.string().uuid(),
  session_token: z.string().trim().min(1).max(500),
  status: sessionStatusEnum.optional().default('active'),
  ip_address: z.string().trim().max(45).nullable().optional(),
  user_agent: z.string().trim().max(1000).nullable().optional(),
  expires_at: z.string().nullable().optional(),
})

export const updateMobileSessionSchema = z.object({
  status: sessionStatusEnum.optional(),
  last_activity_at: z.string().optional(),
  ended_at: z.string().nullable().optional(),
})

export const revokeMobileSessionSchema = z.object({
  reason: z.string().trim().max(500).nullable().optional(),
})
