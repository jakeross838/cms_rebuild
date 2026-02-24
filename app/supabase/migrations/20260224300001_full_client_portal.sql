-- ============================================================================
-- Module 29: Full Client Portal
-- ============================================================================
-- V1 core tables extending Module 12 (Basic Client Portal):
-- client_portal_settings, client_portal_invitations, client_approvals,
-- client_messages, client_payments
-- ============================================================================

-- ── Client Portal Settings (per-company portal config) ──────────────────────
CREATE TABLE IF NOT EXISTS client_portal_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  branding JSONB DEFAULT '{}',
  custom_domain VARCHAR(200),
  feature_flags JSONB DEFAULT '{}',
  visibility_rules JSONB DEFAULT '{}',
  notification_rules JSONB DEFAULT '{}',
  approval_config JSONB DEFAULT '{}',
  email_templates JSONB DEFAULT '{}',
  footer_text TEXT,
  privacy_policy_url TEXT,
  terms_of_service_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id)
);

CREATE INDEX IF NOT EXISTS idx_client_portal_settings_company ON client_portal_settings(company_id);

ALTER TABLE client_portal_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON client_portal_settings
  USING (company_id = get_current_company_id());

-- updated_at trigger
CREATE TRIGGER set_updated_at_client_portal_settings
  BEFORE UPDATE ON client_portal_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Client Portal Invitations ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_portal_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  email VARCHAR(255) NOT NULL,
  client_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'client',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'expired', 'revoked'
  )),
  token VARCHAR(255) NOT NULL,
  invited_by UUID NOT NULL REFERENCES users(id),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_client_invitations_company ON client_portal_invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_client_invitations_job ON client_portal_invitations(company_id, job_id);
CREATE INDEX IF NOT EXISTS idx_client_invitations_email ON client_portal_invitations(company_id, email);
CREATE INDEX IF NOT EXISTS idx_client_invitations_status ON client_portal_invitations(company_id, status);
CREATE INDEX IF NOT EXISTS idx_client_invitations_token ON client_portal_invitations(token);
CREATE INDEX IF NOT EXISTS idx_client_invitations_deleted ON client_portal_invitations(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE client_portal_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON client_portal_invitations
  USING (company_id = get_current_company_id());

CREATE TRIGGER set_updated_at_client_portal_invitations
  BEFORE UPDATE ON client_portal_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Client Approvals ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  client_user_id UUID NOT NULL REFERENCES users(id),
  approval_type TEXT NOT NULL CHECK (approval_type IN (
    'selection', 'change_order', 'draw', 'invoice', 'schedule'
  )),
  reference_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'rejected', 'expired'
  )),
  requested_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  signature_data TEXT,
  signature_ip VARCHAR(45),
  signature_hash VARCHAR(64),
  comments TEXT,
  requested_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_client_approvals_company ON client_approvals(company_id);
CREATE INDEX IF NOT EXISTS idx_client_approvals_job ON client_approvals(company_id, job_id);
CREATE INDEX IF NOT EXISTS idx_client_approvals_client ON client_approvals(client_user_id);
CREATE INDEX IF NOT EXISTS idx_client_approvals_status ON client_approvals(company_id, status);
CREATE INDEX IF NOT EXISTS idx_client_approvals_type ON client_approvals(company_id, approval_type);
CREATE INDEX IF NOT EXISTS idx_client_approvals_reference ON client_approvals(reference_id);
CREATE INDEX IF NOT EXISTS idx_client_approvals_compound ON client_approvals(company_id, job_id, status);
CREATE INDEX IF NOT EXISTS idx_client_approvals_deleted ON client_approvals(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE client_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON client_approvals
  USING (company_id = get_current_company_id());

CREATE TRIGGER set_updated_at_client_approvals
  BEFORE UPDATE ON client_approvals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Client Messages ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  sender_user_id UUID NOT NULL REFERENCES users(id),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'builder_team')),
  subject VARCHAR(255),
  message_text TEXT NOT NULL,
  thread_id UUID,
  topic VARCHAR(200),
  category TEXT DEFAULT 'general' CHECK (category IN (
    'general', 'selections', 'change_orders', 'schedule', 'budget', 'warranty', 'other'
  )),
  attachments JSONB DEFAULT '[]',
  is_external_log BOOLEAN DEFAULT false,
  external_channel TEXT CHECK (external_channel IS NULL OR external_channel IN (
    'phone', 'text', 'email'
  )),
  read_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN (
    'sent', 'read', 'archived'
  )),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_client_messages_company ON client_messages(company_id);
CREATE INDEX IF NOT EXISTS idx_client_messages_job ON client_messages(company_id, job_id);
CREATE INDEX IF NOT EXISTS idx_client_messages_sender ON client_messages(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_client_messages_thread ON client_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_client_messages_category ON client_messages(company_id, category);
CREATE INDEX IF NOT EXISTS idx_client_messages_status ON client_messages(company_id, status);
CREATE INDEX IF NOT EXISTS idx_client_messages_created ON client_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_messages_deleted ON client_messages(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE client_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON client_messages
  USING (company_id = get_current_company_id());

CREATE TRIGGER set_updated_at_client_messages
  BEFORE UPDATE ON client_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Client Payments ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  client_user_id UUID REFERENCES users(id),
  payment_number VARCHAR(50),
  amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'check' CHECK (payment_method IN (
    'credit_card', 'ach', 'check', 'wire', 'other'
  )),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'refunded'
  )),
  reference_number VARCHAR(100),
  description TEXT,
  draw_request_id UUID,
  invoice_id UUID,
  payment_date DATE,
  received_at TIMESTAMPTZ,
  received_by UUID REFERENCES users(id),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_client_payments_company ON client_payments(company_id);
CREATE INDEX IF NOT EXISTS idx_client_payments_job ON client_payments(company_id, job_id);
CREATE INDEX IF NOT EXISTS idx_client_payments_client ON client_payments(client_user_id);
CREATE INDEX IF NOT EXISTS idx_client_payments_status ON client_payments(company_id, status);
CREATE INDEX IF NOT EXISTS idx_client_payments_method ON client_payments(company_id, payment_method);
CREATE INDEX IF NOT EXISTS idx_client_payments_date ON client_payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_client_payments_draw ON client_payments(draw_request_id);
CREATE INDEX IF NOT EXISTS idx_client_payments_invoice ON client_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_client_payments_deleted ON client_payments(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE client_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON client_payments
  USING (company_id = get_current_company_id());

CREATE TRIGGER set_updated_at_client_payments
  BEFORE UPDATE ON client_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
