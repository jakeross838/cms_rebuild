-- ============================================================================
-- Module 30: Vendor Portal — V1 Foundation
--
-- Tables: vendor_portal_settings, vendor_portal_invitations,
--         vendor_portal_access, vendor_submissions, vendor_messages
-- Multi-tenant via company_id + RLS. Soft delete via deleted_at.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. vendor_portal_settings — per-company portal configuration
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendor_portal_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  portal_enabled  BOOLEAN NOT NULL DEFAULT false,
  allow_self_registration BOOLEAN NOT NULL DEFAULT false,
  require_approval BOOLEAN NOT NULL DEFAULT true,
  allowed_submission_types JSONB NOT NULL DEFAULT '["invoice","lien_waiver","insurance_cert","w9","daily_report"]'::jsonb,
  required_compliance_docs JSONB NOT NULL DEFAULT '["insurance_cert","w9"]'::jsonb,
  auto_approve_submissions BOOLEAN NOT NULL DEFAULT false,
  portal_welcome_message TEXT,
  portal_branding  JSONB NOT NULL DEFAULT '{}'::jsonb,
  notification_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ,
  UNIQUE(company_id)
);

ALTER TABLE vendor_portal_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY vendor_portal_settings_tenant
  ON vendor_portal_settings
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_vendor_portal_settings_company ON vendor_portal_settings(company_id);
CREATE INDEX idx_vendor_portal_settings_deleted ON vendor_portal_settings(deleted_at) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER set_vendor_portal_settings_updated_at
  BEFORE UPDATE ON vendor_portal_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 2. vendor_portal_invitations — invite vendors to the portal
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendor_portal_invitations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  vendor_id       UUID,
  vendor_name     VARCHAR(200) NOT NULL,
  contact_name    VARCHAR(200),
  email           VARCHAR(255) NOT NULL,
  phone           VARCHAR(20),
  message         TEXT,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','accepted','expired','revoked')),
  token           VARCHAR(100) NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  accepted_at     TIMESTAMPTZ,
  invited_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

ALTER TABLE vendor_portal_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY vendor_portal_invitations_tenant
  ON vendor_portal_invitations
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_vp_invitations_company ON vendor_portal_invitations(company_id);
CREATE INDEX idx_vp_invitations_vendor ON vendor_portal_invitations(vendor_id);
CREATE INDEX idx_vp_invitations_status ON vendor_portal_invitations(status);
CREATE INDEX idx_vp_invitations_email ON vendor_portal_invitations(email);
CREATE INDEX idx_vp_invitations_token ON vendor_portal_invitations(token);
CREATE INDEX idx_vp_invitations_company_status ON vendor_portal_invitations(company_id, status);
CREATE INDEX idx_vp_invitations_deleted ON vendor_portal_invitations(deleted_at) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER set_vp_invitations_updated_at
  BEFORE UPDATE ON vendor_portal_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 3. vendor_portal_access — what each vendor can see per company
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendor_portal_access (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  vendor_id       UUID NOT NULL,
  access_level    VARCHAR(20) NOT NULL DEFAULT 'limited'
                  CHECK (access_level IN ('full','limited','readonly')),
  can_submit_invoices    BOOLEAN NOT NULL DEFAULT true,
  can_submit_lien_waivers BOOLEAN NOT NULL DEFAULT true,
  can_submit_daily_reports BOOLEAN NOT NULL DEFAULT false,
  can_view_schedule      BOOLEAN NOT NULL DEFAULT true,
  can_view_purchase_orders BOOLEAN NOT NULL DEFAULT true,
  can_upload_documents   BOOLEAN NOT NULL DEFAULT true,
  can_send_messages      BOOLEAN NOT NULL DEFAULT true,
  allowed_job_ids        JSONB NOT NULL DEFAULT '[]'::jsonb,
  granted_by      UUID,
  granted_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ,
  UNIQUE(company_id, vendor_id)
);

ALTER TABLE vendor_portal_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY vendor_portal_access_tenant
  ON vendor_portal_access
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_vp_access_company ON vendor_portal_access(company_id);
CREATE INDEX idx_vp_access_vendor ON vendor_portal_access(vendor_id);
CREATE INDEX idx_vp_access_level ON vendor_portal_access(access_level);
CREATE INDEX idx_vp_access_company_vendor ON vendor_portal_access(company_id, vendor_id);
CREATE INDEX idx_vp_access_deleted ON vendor_portal_access(deleted_at) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER set_vp_access_updated_at
  BEFORE UPDATE ON vendor_portal_access
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 4. vendor_submissions — vendor-submitted documents (invoices, waivers, etc.)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendor_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  vendor_id       UUID NOT NULL,
  job_id          UUID,
  submission_type VARCHAR(30) NOT NULL
                  CHECK (submission_type IN ('invoice','lien_waiver','insurance_cert','w9','schedule_update','daily_report')),
  status          VARCHAR(20) NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','submitted','under_review','approved','rejected')),
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  amount          NUMERIC(15,2),
  reference_number VARCHAR(100),
  file_urls       JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  rejection_reason TEXT,
  submitted_at    TIMESTAMPTZ,
  reviewed_at     TIMESTAMPTZ,
  reviewed_by     UUID,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

ALTER TABLE vendor_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY vendor_submissions_tenant
  ON vendor_submissions
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_vp_submissions_company ON vendor_submissions(company_id);
CREATE INDEX idx_vp_submissions_vendor ON vendor_submissions(vendor_id);
CREATE INDEX idx_vp_submissions_job ON vendor_submissions(job_id);
CREATE INDEX idx_vp_submissions_type ON vendor_submissions(submission_type);
CREATE INDEX idx_vp_submissions_status ON vendor_submissions(status);
CREATE INDEX idx_vp_submissions_company_vendor ON vendor_submissions(company_id, vendor_id);
CREATE INDEX idx_vp_submissions_company_status ON vendor_submissions(company_id, status);
CREATE INDEX idx_vp_submissions_company_type ON vendor_submissions(company_id, submission_type);
CREATE INDEX idx_vp_submissions_deleted ON vendor_submissions(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_vp_submissions_created ON vendor_submissions(created_at DESC);

CREATE OR REPLACE TRIGGER set_vp_submissions_updated_at
  BEFORE UPDATE ON vendor_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 5. vendor_messages — messaging between builder and vendor
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendor_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  vendor_id       UUID NOT NULL,
  job_id          UUID,
  subject         VARCHAR(255) NOT NULL,
  body            TEXT NOT NULL,
  direction       VARCHAR(20) NOT NULL DEFAULT 'to_vendor'
                  CHECK (direction IN ('to_vendor','from_vendor')),
  sender_id       UUID,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  read_at         TIMESTAMPTZ,
  attachments     JSONB NOT NULL DEFAULT '[]'::jsonb,
  parent_message_id UUID REFERENCES vendor_messages(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

ALTER TABLE vendor_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY vendor_messages_tenant
  ON vendor_messages
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_vp_messages_company ON vendor_messages(company_id);
CREATE INDEX idx_vp_messages_vendor ON vendor_messages(vendor_id);
CREATE INDEX idx_vp_messages_job ON vendor_messages(job_id);
CREATE INDEX idx_vp_messages_direction ON vendor_messages(direction);
CREATE INDEX idx_vp_messages_sender ON vendor_messages(sender_id);
CREATE INDEX idx_vp_messages_parent ON vendor_messages(parent_message_id);
CREATE INDEX idx_vp_messages_company_vendor ON vendor_messages(company_id, vendor_id);
CREATE INDEX idx_vp_messages_is_read ON vendor_messages(is_read) WHERE is_read = false;
CREATE INDEX idx_vp_messages_deleted ON vendor_messages(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_vp_messages_created ON vendor_messages(created_at DESC);

CREATE OR REPLACE TRIGGER set_vp_messages_updated_at
  BEFORE UPDATE ON vendor_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
