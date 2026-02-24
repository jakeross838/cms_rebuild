/**
 * Module 40: Mobile App Types
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type DevicePlatform = 'ios' | 'android' | 'web'

export type DeviceStatus = 'active' | 'inactive' | 'revoked'

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'conflict' | 'failed'

export type SyncAction = 'create' | 'update' | 'delete'

export type NotificationProvider = 'fcm' | 'apns' | 'web_push'

export type PhotoQuality = 'low' | 'medium' | 'high'

export type GpsAccuracy = 'low' | 'balanced' | 'high'

export type AppTheme = 'light' | 'dark' | 'system'

export type SessionStatus = 'active' | 'expired' | 'revoked'

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface MobileDevice {
  id: string
  company_id: string
  user_id: string
  device_name: string
  platform: DevicePlatform
  status: DeviceStatus
  device_model: string | null
  os_version: string | null
  app_version: string | null
  device_token: string | null
  last_active_at: string | null
  last_ip_address: string | null
  metadata: Record<string, unknown>
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface PushNotificationToken {
  id: string
  company_id: string
  user_id: string
  device_id: string
  token: string
  provider: NotificationProvider
  is_active: boolean
  last_used_at: string | null
  created_at: string
  updated_at: string
}

export interface OfflineSyncQueueItem {
  id: string
  company_id: string
  user_id: string
  device_id: string
  action: SyncAction
  entity_type: string
  entity_id: string | null
  payload: Record<string, unknown>
  status: SyncStatus
  priority: number
  retry_count: number
  max_retries: number
  error_message: string | null
  synced_at: string | null
  created_at: string
  updated_at: string
}

export interface MobileAppSettings {
  id: string
  company_id: string
  user_id: string
  data_saver_mode: boolean
  auto_sync: boolean
  sync_on_wifi_only: boolean
  photo_quality: PhotoQuality
  location_tracking: boolean
  gps_accuracy: GpsAccuracy
  biometric_enabled: boolean
  quiet_hours_start: string | null
  quiet_hours_end: string | null
  push_notifications: boolean
  offline_storage_limit_mb: number
  theme: AppTheme
  preferences: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface MobileSession {
  id: string
  company_id: string
  user_id: string
  device_id: string
  session_token: string
  status: SessionStatus
  ip_address: string | null
  user_agent: string | null
  started_at: string
  last_activity_at: string
  expires_at: string | null
  ended_at: string | null
  created_at: string
  updated_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const DEVICE_PLATFORMS: { value: DevicePlatform; label: string }[] = [
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
  { value: 'web', label: 'Web' },
]

export const DEVICE_STATUSES: { value: DeviceStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'revoked', label: 'Revoked' },
]

export const SYNC_STATUSES: { value: SyncStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'syncing', label: 'Syncing' },
  { value: 'synced', label: 'Synced' },
  { value: 'conflict', label: 'Conflict' },
  { value: 'failed', label: 'Failed' },
]

export const SYNC_ACTIONS: { value: SyncAction; label: string }[] = [
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
]

export const NOTIFICATION_PROVIDERS: { value: NotificationProvider; label: string }[] = [
  { value: 'fcm', label: 'Firebase Cloud Messaging' },
  { value: 'apns', label: 'Apple Push Notification Service' },
  { value: 'web_push', label: 'Web Push' },
]

export const PHOTO_QUALITIES: { value: PhotoQuality; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export const GPS_ACCURACIES: { value: GpsAccuracy; label: string }[] = [
  { value: 'low', label: 'Low (Battery Saver)' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'high', label: 'High Accuracy' },
]

export const APP_THEMES: { value: AppTheme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

export const SESSION_STATUSES: { value: SessionStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'revoked', label: 'Revoked' },
]
