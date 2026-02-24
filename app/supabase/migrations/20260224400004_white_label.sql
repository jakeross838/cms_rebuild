-- ============================================================================
-- Module 44: White-Label & Branding — V1 Foundation
--
-- Tables: builder_branding, builder_custom_domains, builder_email_config,
--         builder_terminology, builder_content_pages
-- Multi-tenant via company_id + RLS. Soft delete where applicable.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. builder_branding — colors, logos, themes per company
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS builder_branding (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  logo_url        TEXT,
  logo_dark_url   TEXT,
  favicon_url     TEXT,
  primary_color   VARCHAR(7) NOT NULL DEFAULT '#2563eb',
  secondary_color VARCHAR(7) NOT NULL DEFAULT '#1e40af',
  accent_color    VARCHAR(7) NOT NULL DEFAULT '#f59e0b',
  font_family     VARCHAR(100) NOT NULL DEFAULT 'Inter',
  header_style    VARCHAR(20) NOT NULL DEFAULT 'light'
                  CHECK (header_style IN ('light', 'dark', 'gradient', 'custom')),
  login_background_url TEXT,
  login_message   TEXT,
  powered_by_visible BOOLEAN NOT NULL DEFAULT true,
  custom_css      TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

ALTER TABLE builder_branding ENABLE ROW LEVEL SECURITY;

CREATE POLICY builder_branding_tenant
  ON builder_branding
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_builder_branding_company ON builder_branding(company_id);

CREATE OR REPLACE TRIGGER set_builder_branding_updated_at
  BEFORE UPDATE ON builder_branding
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 2. builder_custom_domains — custom domain configurations
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS builder_custom_domains (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  domain          VARCHAR(255) NOT NULL UNIQUE,
  subdomain       VARCHAR(100),
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'verifying', 'active', 'failed', 'expired')),
  ssl_status      VARCHAR(20) DEFAULT 'pending'
                  CHECK (ssl_status IN ('pending', 'issued', 'expired', 'failed')),
  verification_token VARCHAR(255),
  verified_at     TIMESTAMPTZ,
  ssl_issued_at   TIMESTAMPTZ,
  ssl_expires_at  TIMESTAMPTZ,
  is_primary      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

ALTER TABLE builder_custom_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY builder_custom_domains_tenant
  ON builder_custom_domains
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_builder_domains_company ON builder_custom_domains(company_id);
CREATE INDEX idx_builder_domains_domain ON builder_custom_domains(domain);
CREATE INDEX idx_builder_domains_status ON builder_custom_domains(status);
CREATE INDEX idx_builder_domains_company_status ON builder_custom_domains(company_id, status);
CREATE INDEX idx_builder_domains_is_primary ON builder_custom_domains(is_primary) WHERE is_primary = true;
CREATE INDEX idx_builder_domains_deleted ON builder_custom_domains(deleted_at) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER set_builder_custom_domains_updated_at
  BEFORE UPDATE ON builder_custom_domains
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 3. builder_email_config — email branding per company
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS builder_email_config (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  from_name       VARCHAR(200),
  from_email      VARCHAR(255),
  reply_to_email  VARCHAR(255),
  email_header_html TEXT,
  email_footer_html TEXT,
  email_signature TEXT,
  use_custom_smtp BOOLEAN NOT NULL DEFAULT false,
  smtp_host       VARCHAR(255),
  smtp_port       INT,
  smtp_username   VARCHAR(255),
  smtp_encrypted_password TEXT,
  is_verified     BOOLEAN NOT NULL DEFAULT false,
  verified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

ALTER TABLE builder_email_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY builder_email_config_tenant
  ON builder_email_config
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_builder_email_company ON builder_email_config(company_id);

CREATE OR REPLACE TRIGGER set_builder_email_config_updated_at
  BEFORE UPDATE ON builder_email_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 4. builder_terminology — term overrides
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS builder_terminology (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  default_term    VARCHAR(100) NOT NULL,
  custom_term     VARCHAR(100) NOT NULL,
  context         VARCHAR(50) DEFAULT 'global'
                  CHECK (context IN ('navigation', 'reports', 'forms', 'notifications', 'global')),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, default_term, context)
);

ALTER TABLE builder_terminology ENABLE ROW LEVEL SECURITY;

CREATE POLICY builder_terminology_tenant
  ON builder_terminology
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_builder_terminology_company ON builder_terminology(company_id);
CREATE INDEX idx_builder_terminology_context ON builder_terminology(context);
CREATE INDEX idx_builder_terminology_company_active ON builder_terminology(company_id, is_active);

CREATE OR REPLACE TRIGGER set_builder_terminology_updated_at
  BEFORE UPDATE ON builder_terminology
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 5. builder_content_pages — custom content pages
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS builder_content_pages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  page_type       VARCHAR(30) NOT NULL DEFAULT 'custom'
                  CHECK (page_type IN ('welcome', 'terms', 'privacy', 'help', 'faq', 'about', 'custom')),
  title           VARCHAR(255) NOT NULL,
  slug            VARCHAR(200) NOT NULL,
  content_html    TEXT,
  is_published    BOOLEAN NOT NULL DEFAULT false,
  published_at    TIMESTAMPTZ,
  sort_order      INT NOT NULL DEFAULT 0,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ,
  UNIQUE(company_id, slug)
);

ALTER TABLE builder_content_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY builder_content_pages_tenant
  ON builder_content_pages
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_builder_pages_company ON builder_content_pages(company_id);
CREATE INDEX idx_builder_pages_type ON builder_content_pages(page_type);
CREATE INDEX idx_builder_pages_slug ON builder_content_pages(slug);
CREATE INDEX idx_builder_pages_published ON builder_content_pages(is_published) WHERE is_published = true;
CREATE INDEX idx_builder_pages_company_type ON builder_content_pages(company_id, page_type);
CREATE INDEX idx_builder_pages_company_slug ON builder_content_pages(company_id, slug);
CREATE INDEX idx_builder_pages_deleted ON builder_content_pages(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_builder_pages_sort ON builder_content_pages(sort_order);

CREATE OR REPLACE TRIGGER set_builder_content_pages_updated_at
  BEFORE UPDATE ON builder_content_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
