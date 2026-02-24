-- ============================================================================
-- Module 43: Subscription Billing — V1 Foundation
--
-- Tables: subscription_plans, plan_addons, company_subscriptions,
--         usage_meters, billing_events
-- subscription_plans and plan_addons are platform-level (no company_id).
-- company_subscriptions, usage_meters, billing_events are multi-tenant via
-- company_id + RLS.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. subscription_plans — plan definitions (platform-level)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS subscription_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  slug            VARCHAR(100) NOT NULL UNIQUE,
  description     TEXT,
  tier            VARCHAR(30) NOT NULL DEFAULT 'starter'
                  CHECK (tier IN ('free', 'starter', 'professional', 'business', 'enterprise')),
  price_monthly   NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_annual    NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_users       INT,
  max_projects    INT,
  features        JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscription_plans_read
  ON subscription_plans
  FOR SELECT
  USING (true);

CREATE INDEX idx_subscription_plans_slug ON subscription_plans(slug);
CREATE INDEX idx_subscription_plans_tier ON subscription_plans(tier);
CREATE INDEX idx_subscription_plans_is_active ON subscription_plans(is_active);
CREATE INDEX idx_subscription_plans_sort_order ON subscription_plans(sort_order);

CREATE OR REPLACE TRIGGER set_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 2. plan_addons — add-on products (platform-level)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS plan_addons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(200) NOT NULL,
  slug            VARCHAR(100) NOT NULL UNIQUE,
  description     TEXT,
  addon_type      VARCHAR(30) NOT NULL DEFAULT 'module'
                  CHECK (addon_type IN ('module', 'storage', 'users', 'api_access', 'support', 'training', 'white_label')),
  price_monthly   NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_annual    NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_metered      BOOLEAN NOT NULL DEFAULT false,
  meter_unit      VARCHAR(50),
  meter_price_per_unit NUMERIC(10,4) NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE plan_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY plan_addons_read
  ON plan_addons
  FOR SELECT
  USING (true);

CREATE INDEX idx_plan_addons_slug ON plan_addons(slug);
CREATE INDEX idx_plan_addons_addon_type ON plan_addons(addon_type);
CREATE INDEX idx_plan_addons_is_active ON plan_addons(is_active);

CREATE OR REPLACE TRIGGER set_plan_addons_updated_at
  BEFORE UPDATE ON plan_addons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 3. company_subscriptions — active subscriptions per company
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS company_subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  plan_id         UUID NOT NULL REFERENCES subscription_plans(id),
  status          VARCHAR(20) NOT NULL DEFAULT 'trialing'
                  CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'suspended', 'expired')),
  billing_cycle   VARCHAR(10) NOT NULL DEFAULT 'monthly'
                  CHECK (billing_cycle IN ('monthly', 'annual')),
  current_period_start DATE,
  current_period_end   DATE,
  trial_start     DATE,
  trial_end       DATE,
  cancelled_at    TIMESTAMPTZ,
  cancel_reason   TEXT,
  stripe_subscription_id VARCHAR(100),
  stripe_customer_id     VARCHAR(100),
  grandfathered_plan     VARCHAR(100),
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

ALTER TABLE company_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_subscriptions_tenant
  ON company_subscriptions
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_company_subscriptions_company ON company_subscriptions(company_id);
CREATE INDEX idx_company_subscriptions_plan ON company_subscriptions(plan_id);
CREATE INDEX idx_company_subscriptions_status ON company_subscriptions(status);
CREATE INDEX idx_company_subscriptions_stripe ON company_subscriptions(stripe_subscription_id);
CREATE INDEX idx_company_subscriptions_company_status ON company_subscriptions(company_id, status);

CREATE OR REPLACE TRIGGER set_company_subscriptions_updated_at
  BEFORE UPDATE ON company_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 4. usage_meters — usage tracking per company
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS usage_meters (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  addon_id        UUID REFERENCES plan_addons(id),
  meter_type      VARCHAR(50) NOT NULL,
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  quantity        NUMERIC(15,4) NOT NULL DEFAULT 0,
  unit            VARCHAR(50),
  overage_quantity NUMERIC(15,4) NOT NULL DEFAULT 0,
  overage_cost    NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE usage_meters ENABLE ROW LEVEL SECURITY;

CREATE POLICY usage_meters_tenant
  ON usage_meters
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_usage_meters_company ON usage_meters(company_id);
CREATE INDEX idx_usage_meters_meter_type ON usage_meters(meter_type);
CREATE INDEX idx_usage_meters_addon ON usage_meters(addon_id);
CREATE INDEX idx_usage_meters_company_period ON usage_meters(company_id, period_start, period_end);
CREATE INDEX idx_usage_meters_company_type ON usage_meters(company_id, meter_type);

CREATE OR REPLACE TRIGGER set_usage_meters_updated_at
  BEFORE UPDATE ON usage_meters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 5. billing_events — billing event log per company
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS billing_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  event_type      VARCHAR(30) NOT NULL DEFAULT 'subscription_created'
                  CHECK (event_type IN (
                    'subscription_created', 'subscription_updated', 'subscription_cancelled',
                    'payment_succeeded', 'payment_failed',
                    'invoice_created', 'invoice_paid',
                    'refund', 'credit_applied',
                    'trial_started', 'trial_ended',
                    'plan_changed', 'addon_added', 'addon_removed'
                  )),
  description     TEXT,
  amount          NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
  stripe_event_id VARCHAR(100),
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY billing_events_tenant
  ON billing_events
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_billing_events_company ON billing_events(company_id);
CREATE INDEX idx_billing_events_event_type ON billing_events(event_type);
CREATE INDEX idx_billing_events_stripe ON billing_events(stripe_event_id);
CREATE INDEX idx_billing_events_created ON billing_events(created_at DESC);
CREATE INDEX idx_billing_events_company_type ON billing_events(company_id, event_type);
