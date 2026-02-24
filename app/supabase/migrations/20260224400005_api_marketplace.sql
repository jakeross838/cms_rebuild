-- ============================================================================
-- Module 45: API & Marketplace — V1 Foundation
--
-- Tables: api_keys, webhook_subscriptions, webhook_deliveries,
--         integration_listings, integration_installs
-- Multi-tenant via company_id + RLS (except integration_listings which is global).
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. api_keys — API key management per company
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS api_keys (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  name            VARCHAR(200) NOT NULL,
  key_prefix      VARCHAR(10) NOT NULL,
  key_hash        VARCHAR(255) NOT NULL,
  permissions     JSONB NOT NULL DEFAULT '[]'::jsonb,
  status          VARCHAR(20) NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'revoked', 'expired')),
  rate_limit_per_minute INT NOT NULL DEFAULT 60,
  last_used_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  revoked_at      TIMESTAMPTZ,
  revoked_by      UUID,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY api_keys_tenant
  ON api_keys
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_api_keys_company ON api_keys(company_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_status ON api_keys(status);
CREATE INDEX idx_api_keys_company_status ON api_keys(company_id, status);

CREATE OR REPLACE TRIGGER set_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 2. webhook_subscriptions — webhook configurations per company
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  url             TEXT NOT NULL,
  events          JSONB NOT NULL DEFAULT '[]'::jsonb,
  status          VARCHAR(20) NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'paused', 'disabled', 'failing')),
  secret          VARCHAR(255) NOT NULL,
  description     TEXT,
  retry_count     INT NOT NULL DEFAULT 0,
  max_retries     INT NOT NULL DEFAULT 5,
  failure_count   INT NOT NULL DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

ALTER TABLE webhook_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY webhook_subscriptions_tenant
  ON webhook_subscriptions
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_webhook_subs_company ON webhook_subscriptions(company_id);
CREATE INDEX idx_webhook_subs_status ON webhook_subscriptions(status);
CREATE INDEX idx_webhook_subs_company_status ON webhook_subscriptions(company_id, status);
CREATE INDEX idx_webhook_subs_deleted ON webhook_subscriptions(deleted_at) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER set_webhook_subscriptions_updated_at
  BEFORE UPDATE ON webhook_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 3. webhook_deliveries — webhook delivery log
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  subscription_id UUID NOT NULL REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
  event_type      VARCHAR(100) NOT NULL,
  payload         JSONB NOT NULL DEFAULT '{}'::jsonb,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'delivered', 'failed', 'retrying')),
  response_status_code INT,
  response_body   TEXT,
  attempt_count   INT NOT NULL DEFAULT 1,
  next_retry_at   TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY webhook_deliveries_tenant
  ON webhook_deliveries
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_webhook_del_company ON webhook_deliveries(company_id);
CREATE INDEX idx_webhook_del_subscription ON webhook_deliveries(subscription_id);
CREATE INDEX idx_webhook_del_event_type ON webhook_deliveries(event_type);
CREATE INDEX idx_webhook_del_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_del_created ON webhook_deliveries(created_at DESC);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. integration_listings — marketplace integration listings (global, not per-company)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS integration_listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(200) NOT NULL,
  slug            VARCHAR(200) NOT NULL UNIQUE,
  description     TEXT,
  long_description TEXT,
  logo_url        TEXT,
  screenshots     JSONB NOT NULL DEFAULT '[]'::jsonb,
  category        VARCHAR(50) NOT NULL DEFAULT 'other'
                  CHECK (category IN ('accounting', 'scheduling', 'communication', 'storage', 'payment', 'analytics', 'field_ops', 'design', 'other')),
  developer_name  VARCHAR(200),
  developer_url   TEXT,
  documentation_url TEXT,
  support_url     TEXT,
  pricing_type    VARCHAR(20) NOT NULL DEFAULT 'free'
                  CHECK (pricing_type IN ('free', 'paid', 'freemium', 'contact')),
  price_monthly   NUMERIC(10,2) NOT NULL DEFAULT 0,
  install_count   INT NOT NULL DEFAULT 0,
  avg_rating      NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count    INT NOT NULL DEFAULT 0,
  status          VARCHAR(20) NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'pending_review', 'published', 'rejected', 'archived')),
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  required_plan_tier VARCHAR(30),
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_integration_listings_slug ON integration_listings(slug);
CREATE INDEX idx_integration_listings_category ON integration_listings(category);
CREATE INDEX idx_integration_listings_status ON integration_listings(status);
CREATE INDEX idx_integration_listings_featured ON integration_listings(is_featured) WHERE is_featured = true;

CREATE OR REPLACE TRIGGER set_integration_listings_updated_at
  BEFORE UPDATE ON integration_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 5. integration_installs — per-company integration install tracking
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS integration_installs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  listing_id      UUID NOT NULL REFERENCES integration_listings(id),
  status          VARCHAR(20) NOT NULL DEFAULT 'installed'
                  CHECK (status IN ('installed', 'active', 'paused', 'uninstalled')),
  configuration   JSONB NOT NULL DEFAULT '{}'::jsonb,
  installed_by    UUID,
  installed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  uninstalled_at  TIMESTAMPTZ,
  uninstalled_by  UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, listing_id)
);

ALTER TABLE integration_installs ENABLE ROW LEVEL SECURITY;

CREATE POLICY integration_installs_tenant
  ON integration_installs
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_integration_installs_company ON integration_installs(company_id);
CREATE INDEX idx_integration_installs_listing ON integration_installs(listing_id);
CREATE INDEX idx_integration_installs_status ON integration_installs(status);
CREATE INDEX idx_integration_installs_company_status ON integration_installs(company_id, status);

CREATE OR REPLACE TRIGGER set_integration_installs_updated_at
  BEFORE UPDATE ON integration_installs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
