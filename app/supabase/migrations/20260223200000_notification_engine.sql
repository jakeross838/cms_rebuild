-- =====================================================================
-- RossOS Notification Engine Migration
-- Module 05: Notification Engine (V1 Foundation)
-- Multi-tenant with Row Level Security (RLS)
-- =====================================================================

-- =====================================================================
-- SECTION 1: NOTIFICATION EVENT TYPES (Seeded by modules)
-- =====================================================================

CREATE TABLE IF NOT EXISTS notification_event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL UNIQUE,
  module TEXT NOT NULL,
  description TEXT,
  default_channels TEXT[] DEFAULT '{in_app,email}',
  default_roles TEXT[] DEFAULT '{owner,pm}',
  variables TEXT[] DEFAULT '{}',
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'critical')),
  category TEXT NOT NULL CHECK (category IN ('financial', 'schedule', 'documents', 'field_operations', 'approvals', 'system')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- SECTION 2: COMPANY NOTIFICATION CONFIG (Per-company overrides)
-- =====================================================================

CREATE TABLE IF NOT EXISTS company_notification_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  event_type_id UUID NOT NULL REFERENCES notification_event_types(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  channels TEXT[],
  roles TEXT[],
  urgency TEXT CHECK (urgency IN ('low', 'normal', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, event_type_id)
);

CREATE INDEX IF NOT EXISTS idx_company_notif_config ON company_notification_config(company_id);

ALTER TABLE company_notification_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_notification_config_tenant" ON company_notification_config
  USING (company_id = (current_setting('app.current_company_id', true))::uuid);

-- =====================================================================
-- SECTION 3: USER NOTIFICATION PREFERENCES (Per-user channel matrix)
-- =====================================================================

CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('financial', 'schedule', 'documents', 'field_operations', 'approvals', 'system')),
  channel TEXT NOT NULL CHECK (channel IN ('in_app', 'email', 'sms', 'push')),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id, category, channel)
);

CREATE INDEX IF NOT EXISTS idx_user_notif_prefs ON user_notification_preferences(user_id, company_id);

ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_notification_preferences_tenant" ON user_notification_preferences
  USING (company_id = (current_setting('app.current_company_id', true))::uuid);

-- =====================================================================
-- SECTION 4: USER NOTIFICATION SETTINGS (Quiet hours, digest)
-- =====================================================================

CREATE TABLE IF NOT EXISTS user_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  quiet_start TIME,
  quiet_end TIME,
  timezone TEXT DEFAULT 'America/New_York',
  digest_mode BOOLEAN DEFAULT false,
  digest_frequency TEXT DEFAULT 'daily' CHECK (digest_frequency IN ('hourly', 'twice_daily', 'daily')),
  digest_time TIME DEFAULT '08:00',
  critical_bypass_quiet BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_notification_settings_tenant" ON user_notification_settings
  USING (company_id = (current_setting('app.current_company_id', true))::uuid);

-- =====================================================================
-- SECTION 5: NOTIFICATIONS (Individual notification records)
-- =====================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('financial', 'schedule', 'documents', 'field_operations', 'approvals', 'system')),
  title TEXT NOT NULL,
  body TEXT,
  entity_type TEXT,
  entity_id UUID,
  url_path TEXT,
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'critical')),
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  archived BOOLEAN DEFAULT false,
  snoozed_until TIMESTAMPTZ,
  idempotency_key TEXT UNIQUE,
  triggered_by UUID REFERENCES users(id),
  job_id UUID REFERENCES jobs(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, company_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(company_id, category);
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications(entity_type, entity_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_tenant" ON notifications
  USING (company_id = (current_setting('app.current_company_id', true))::uuid);

-- =====================================================================
-- SECTION 6: NOTIFICATION DELIVERIES (Per-channel tracking)
-- =====================================================================

CREATE TABLE IF NOT EXISTS notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('in_app', 'email', 'sms', 'push')),
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'sent', 'delivered', 'failed', 'bounced')),
  provider_message_id TEXT,
  attempts INT DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_status ON notification_deliveries(status, channel);
CREATE INDEX IF NOT EXISTS idx_deliveries_notification ON notification_deliveries(notification_id);

-- =====================================================================
-- SECTION 7: SEED DEFAULT EVENT TYPES
-- =====================================================================

INSERT INTO notification_event_types (event_type, module, description, default_channels, default_roles, variables, urgency, category) VALUES
  ('invoice.created',    'invoices',  'A new invoice has been submitted',                    '{in_app,email}', '{owner,pm,office}',        '{invoice_number,vendor_name,amount,job_name}',           'normal',   'financial'),
  ('invoice.approved',   'invoices',  'An invoice has been approved for payment',             '{in_app,email}', '{owner,pm,office}',        '{invoice_number,vendor_name,amount,job_name,approved_by}','normal',   'financial'),
  ('invoice.denied',     'invoices',  'An invoice has been denied',                           '{in_app,email}', '{owner,pm,office}',        '{invoice_number,vendor_name,amount,job_name,denied_by}',  'high',     'financial'),
  ('job.created',        'jobs',      'A new job has been created',                           '{in_app}',       '{owner,admin,pm}',         '{job_name,job_number,created_by}',                        'normal',   'system'),
  ('job.status_changed', 'jobs',      'A job status has changed',                             '{in_app,email}', '{owner,pm,superintendent}','{job_name,job_number,old_status,new_status}',             'normal',   'system'),
  ('client.created',     'clients',   'A new client has been added',                          '{in_app}',       '{owner,admin,pm}',         '{client_name,created_by}',                                'low',      'system'),
  ('vendor.created',     'vendors',   'A new vendor has been added',                          '{in_app}',       '{owner,admin,pm}',         '{vendor_name,trade,created_by}',                          'low',      'system'),
  ('document.uploaded',  'documents', 'A new document has been uploaded',                     '{in_app}',       '{owner,pm}',               '{filename,uploaded_by,job_name,folder}',                  'low',      'documents'),
  ('document.expiring',  'documents', 'A document is approaching its expiration date',        '{in_app,email}', '{owner,pm,office}',        '{filename,expiration_date,entity_name,days_remaining}',   'high',     'documents'),
  ('approval.requested', 'approvals', 'Your approval is needed',                              '{in_app,email}', '{owner,pm}',               '{item_type,item_name,requested_by,job_name}',            'high',     'approvals'),
  ('approval.completed', 'approvals', 'An item has been approved',                            '{in_app}',       '{owner,pm,office}',        '{item_type,item_name,approved_by,job_name}',             'normal',   'approvals'),
  ('schedule.updated',   'schedule',  'The project schedule has been updated',                '{in_app}',       '{pm,superintendent,field}','{job_name,updated_by,changes_summary}',                   'normal',   'schedule'),
  ('daily_log.submitted','daily_logs','A daily log has been submitted',                       '{in_app}',       '{pm,superintendent}',      '{job_name,submitted_by,date}',                            'normal',   'field_operations'),
  ('safety.incident',    'safety',    'A safety incident has been reported',                  '{in_app,email,sms}','{owner,admin,pm,superintendent}','{job_name,reported_by,severity,description}',      'critical', 'field_operations'),
  ('system.welcome',     'system',    'Welcome to RossOS',                                    '{in_app,email}', '{owner,admin,pm,superintendent,office,field,read_only}', '{user_name,company_name}', 'normal',   'system'),
  ('system.maintenance', 'system',    'Scheduled maintenance notification',                   '{in_app,email}', '{owner,admin}',            '{maintenance_window,description}',                        'high',     'system')
ON CONFLICT (event_type) DO NOTHING;
