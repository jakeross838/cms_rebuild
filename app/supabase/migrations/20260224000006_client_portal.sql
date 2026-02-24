-- ============================================================================
-- Module 12: Basic Client Portal
-- ============================================================================
-- V1 core tables for client portal: settings, messages, update posts,
-- shared documents, shared photos, and activity logging.
-- ============================================================================

-- ── Portal Settings (per-job configuration) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS portal_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  is_enabled BOOLEAN DEFAULT false,
  branding_logo_url TEXT,
  branding_primary_color VARCHAR(7) DEFAULT '#1a1a2e',
  welcome_message TEXT,
  show_budget BOOLEAN DEFAULT false,
  show_schedule BOOLEAN DEFAULT true,
  show_documents BOOLEAN DEFAULT true,
  show_photos BOOLEAN DEFAULT true,
  show_daily_logs BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_portal_settings_company ON portal_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_portal_settings_job ON portal_settings(company_id, job_id);

ALTER TABLE portal_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON portal_settings
  USING (company_id = get_current_company_id());

-- ── Portal Messages ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portal_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  sender_id UUID NOT NULL REFERENCES users(id),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('builder', 'client')),
  subject TEXT,
  body TEXT NOT NULL,
  parent_message_id UUID REFERENCES portal_messages(id),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portal_messages_company ON portal_messages(company_id);
CREATE INDEX IF NOT EXISTS idx_portal_messages_job ON portal_messages(company_id, job_id);
CREATE INDEX IF NOT EXISTS idx_portal_messages_parent ON portal_messages(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_portal_messages_sender ON portal_messages(sender_id);

ALTER TABLE portal_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON portal_messages
  USING (company_id = get_current_company_id());

-- ── Portal Update Posts ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portal_update_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN (
    'general_update', 'milestone', 'photo_update', 'schedule_update', 'budget_update'
  )),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_portal_updates_company ON portal_update_posts(company_id);
CREATE INDEX IF NOT EXISTS idx_portal_updates_job ON portal_update_posts(company_id, job_id);
CREATE INDEX IF NOT EXISTS idx_portal_updates_published ON portal_update_posts(company_id, job_id, is_published);
CREATE INDEX IF NOT EXISTS idx_portal_updates_type ON portal_update_posts(company_id, post_type);

ALTER TABLE portal_update_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON portal_update_posts
  USING (company_id = get_current_company_id());

-- ── Portal Shared Documents ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portal_shared_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  document_id UUID NOT NULL REFERENCES documents(id),
  shared_by UUID NOT NULL REFERENCES users(id),
  shared_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, job_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_portal_shared_docs_company ON portal_shared_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_portal_shared_docs_job ON portal_shared_documents(company_id, job_id);
CREATE INDEX IF NOT EXISTS idx_portal_shared_docs_document ON portal_shared_documents(document_id);

ALTER TABLE portal_shared_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON portal_shared_documents
  USING (company_id = get_current_company_id());

-- ── Portal Shared Photos ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portal_shared_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  storage_path TEXT NOT NULL,
  caption TEXT,
  album_name VARCHAR(100),
  sort_order INT DEFAULT 0,
  shared_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portal_photos_company ON portal_shared_photos(company_id);
CREATE INDEX IF NOT EXISTS idx_portal_photos_job ON portal_shared_photos(company_id, job_id);
CREATE INDEX IF NOT EXISTS idx_portal_photos_album ON portal_shared_photos(company_id, job_id, album_name);

ALTER TABLE portal_shared_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON portal_shared_photos
  USING (company_id = get_current_company_id());

-- ── Portal Activity Log ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portal_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  client_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL CHECK (action IN (
    'viewed_update', 'viewed_document', 'sent_message', 'viewed_photo', 'logged_in'
  )),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portal_activity_company ON portal_activity_log(company_id);
CREATE INDEX IF NOT EXISTS idx_portal_activity_job ON portal_activity_log(company_id, job_id);
CREATE INDEX IF NOT EXISTS idx_portal_activity_client ON portal_activity_log(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_activity_action ON portal_activity_log(company_id, action);

ALTER TABLE portal_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON portal_activity_log
  USING (company_id = get_current_company_id());
