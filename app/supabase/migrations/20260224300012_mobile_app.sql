-- ============================================================================
-- Module 40: Mobile App — V1 Foundation
--
-- Tables: mobile_devices, push_notification_tokens, offline_sync_queue,
--         mobile_app_settings, mobile_sessions
-- Multi-tenant via company_id + RLS. Soft delete on devices.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. mobile_devices — registered device tracking
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS mobile_devices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  user_id         UUID NOT NULL,
  device_name     VARCHAR(200) NOT NULL,
  platform        TEXT NOT NULL DEFAULT 'web'
    CHECK (platform IN ('ios','android','web')),
  status          TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','inactive','revoked')),
  device_model    VARCHAR(200),
  os_version      VARCHAR(50),
  app_version     VARCHAR(50),
  device_token    VARCHAR(500),
  last_active_at  TIMESTAMPTZ,
  last_ip_address VARCHAR(45),
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

ALTER TABLE mobile_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY mobile_devices_tenant
  ON mobile_devices
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_mobile_devices_company ON mobile_devices(company_id);
CREATE INDEX idx_mobile_devices_user ON mobile_devices(user_id);
CREATE INDEX idx_mobile_devices_status ON mobile_devices(status);
CREATE INDEX idx_mobile_devices_platform ON mobile_devices(platform);
CREATE INDEX idx_mobile_devices_company_user ON mobile_devices(company_id, user_id);
CREATE INDEX idx_mobile_devices_company_status ON mobile_devices(company_id, status);
CREATE INDEX idx_mobile_devices_deleted ON mobile_devices(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_mobile_devices_last_active ON mobile_devices(last_active_at DESC);

CREATE TRIGGER set_mobile_devices_updated_at
  BEFORE UPDATE ON mobile_devices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 2. push_notification_tokens — FCM/APNs tokens per device
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS push_notification_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  user_id         UUID NOT NULL,
  device_id       UUID NOT NULL REFERENCES mobile_devices(id) ON DELETE CASCADE,
  token           TEXT NOT NULL,
  provider        TEXT NOT NULL DEFAULT 'fcm'
    CHECK (provider IN ('fcm','apns','web_push')),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  last_used_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE push_notification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY push_notification_tokens_tenant
  ON push_notification_tokens
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_push_tokens_company ON push_notification_tokens(company_id);
CREATE INDEX idx_push_tokens_user ON push_notification_tokens(user_id);
CREATE INDEX idx_push_tokens_device ON push_notification_tokens(device_id);
CREATE INDEX idx_push_tokens_provider ON push_notification_tokens(provider);
CREATE INDEX idx_push_tokens_active ON push_notification_tokens(is_active) WHERE is_active = true;
CREATE INDEX idx_push_tokens_company_user ON push_notification_tokens(company_id, user_id);

CREATE TRIGGER set_push_notification_tokens_updated_at
  BEFORE UPDATE ON push_notification_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 3. offline_sync_queue — pending offline changes to sync
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS offline_sync_queue (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  user_id         UUID NOT NULL,
  device_id       UUID NOT NULL,
  action          TEXT NOT NULL DEFAULT 'create'
    CHECK (action IN ('create','update','delete')),
  entity_type     VARCHAR(100) NOT NULL,
  entity_id       UUID,
  payload         JSONB NOT NULL DEFAULT '{}'::jsonb,
  status          TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','syncing','synced','conflict','failed')),
  priority        INT NOT NULL DEFAULT 5
    CHECK (priority >= 1 AND priority <= 10),
  retry_count     INT NOT NULL DEFAULT 0,
  max_retries     INT NOT NULL DEFAULT 5,
  error_message   TEXT,
  synced_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE offline_sync_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY offline_sync_queue_tenant
  ON offline_sync_queue
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_sync_queue_company ON offline_sync_queue(company_id);
CREATE INDEX idx_sync_queue_user ON offline_sync_queue(user_id);
CREATE INDEX idx_sync_queue_device ON offline_sync_queue(device_id);
CREATE INDEX idx_sync_queue_status ON offline_sync_queue(status);
CREATE INDEX idx_sync_queue_action ON offline_sync_queue(action);
CREATE INDEX idx_sync_queue_entity ON offline_sync_queue(entity_type, entity_id);
CREATE INDEX idx_sync_queue_priority ON offline_sync_queue(priority ASC);
CREATE INDEX idx_sync_queue_company_status ON offline_sync_queue(company_id, status);
CREATE INDEX idx_sync_queue_company_user ON offline_sync_queue(company_id, user_id);
CREATE INDEX idx_sync_queue_pending ON offline_sync_queue(status, priority ASC, created_at ASC) WHERE status = 'pending';

CREATE TRIGGER set_offline_sync_queue_updated_at
  BEFORE UPDATE ON offline_sync_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 4. mobile_app_settings — per-user mobile preferences
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS mobile_app_settings (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id              UUID NOT NULL REFERENCES companies(id),
  user_id                 UUID NOT NULL,
  data_saver_mode         BOOLEAN NOT NULL DEFAULT false,
  auto_sync               BOOLEAN NOT NULL DEFAULT true,
  sync_on_wifi_only       BOOLEAN NOT NULL DEFAULT false,
  photo_quality           TEXT NOT NULL DEFAULT 'high'
    CHECK (photo_quality IN ('low','medium','high')),
  location_tracking       BOOLEAN NOT NULL DEFAULT false,
  gps_accuracy            TEXT NOT NULL DEFAULT 'balanced'
    CHECK (gps_accuracy IN ('low','balanced','high')),
  biometric_enabled       BOOLEAN NOT NULL DEFAULT false,
  quiet_hours_start       TIME,
  quiet_hours_end         TIME,
  push_notifications      BOOLEAN NOT NULL DEFAULT true,
  offline_storage_limit_mb INT NOT NULL DEFAULT 500,
  theme                   TEXT NOT NULL DEFAULT 'system'
    CHECK (theme IN ('light','dark','system')),
  preferences             JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, user_id)
);

ALTER TABLE mobile_app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY mobile_app_settings_tenant
  ON mobile_app_settings
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_mobile_settings_company ON mobile_app_settings(company_id);
CREATE INDEX idx_mobile_settings_user ON mobile_app_settings(user_id);
CREATE INDEX idx_mobile_settings_company_user ON mobile_app_settings(company_id, user_id);

CREATE TRIGGER set_mobile_app_settings_updated_at
  BEFORE UPDATE ON mobile_app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 5. mobile_sessions — session tracking for mobile devices
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS mobile_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  user_id         UUID NOT NULL,
  device_id       UUID NOT NULL REFERENCES mobile_devices(id) ON DELETE CASCADE,
  session_token   VARCHAR(500) NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','expired','revoked')),
  ip_address      VARCHAR(45),
  user_agent      TEXT,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ,
  ended_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE mobile_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY mobile_sessions_tenant
  ON mobile_sessions
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_mobile_sessions_company ON mobile_sessions(company_id);
CREATE INDEX idx_mobile_sessions_user ON mobile_sessions(user_id);
CREATE INDEX idx_mobile_sessions_device ON mobile_sessions(device_id);
CREATE INDEX idx_mobile_sessions_status ON mobile_sessions(status);
CREATE INDEX idx_mobile_sessions_token ON mobile_sessions(session_token);
CREATE INDEX idx_mobile_sessions_company_user ON mobile_sessions(company_id, user_id);
CREATE INDEX idx_mobile_sessions_company_status ON mobile_sessions(company_id, status);
CREATE INDEX idx_mobile_sessions_active ON mobile_sessions(status, expires_at) WHERE status = 'active';
CREATE INDEX idx_mobile_sessions_last_activity ON mobile_sessions(last_activity_at DESC);

CREATE TRIGGER set_mobile_sessions_updated_at
  BEFORE UPDATE ON mobile_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
