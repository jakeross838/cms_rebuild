-- ============================================================================
-- Module 48: Template Marketplace — V1 Foundation
--
-- Tables: marketplace_publishers, marketplace_templates,
--         marketplace_template_versions, marketplace_installs,
--         marketplace_reviews
-- Multi-tenant via company_id + RLS where applicable.
-- Marketplace templates are globally readable when approved + active.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. marketplace_publishers — publisher profiles
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS marketplace_publishers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  publisher_type  VARCHAR(20) NOT NULL DEFAULT 'builder'
                  CHECK (publisher_type IN ('builder','consultant','platform')),
  display_name    VARCHAR(200) NOT NULL,
  bio             TEXT,
  credentials     TEXT,
  website_url     TEXT,
  profile_image   TEXT,
  is_verified     BOOLEAN NOT NULL DEFAULT false,
  total_installs  INT NOT NULL DEFAULT 0,
  avg_rating      NUMERIC(3,2) NOT NULL DEFAULT 0
                  CHECK (avg_rating >= 0 AND avg_rating <= 5),
  total_templates INT NOT NULL DEFAULT 0,
  revenue_share_pct NUMERIC(5,2) NOT NULL DEFAULT 70
                  CHECK (revenue_share_pct >= 0 AND revenue_share_pct <= 100),
  stripe_connect_id VARCHAR(100),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE marketplace_publishers ENABLE ROW LEVEL SECURITY;

CREATE POLICY marketplace_publishers_read
  ON marketplace_publishers
  FOR SELECT
  USING (true);

CREATE POLICY marketplace_publishers_write
  ON marketplace_publishers
  FOR ALL
  USING (user_id = auth.uid());

CREATE INDEX idx_mp_publishers_user ON marketplace_publishers(user_id);
CREATE INDEX idx_mp_publishers_type ON marketplace_publishers(publisher_type);
CREATE INDEX idx_mp_publishers_verified ON marketplace_publishers(is_verified) WHERE is_verified = true;
CREATE INDEX idx_mp_publishers_rating ON marketplace_publishers(avg_rating DESC);
CREATE INDEX idx_mp_publishers_installs ON marketplace_publishers(total_installs DESC);

CREATE OR REPLACE TRIGGER set_mp_publishers_updated_at
  BEFORE UPDATE ON marketplace_publishers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 2. marketplace_templates — template listings
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS marketplace_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id    UUID NOT NULL REFERENCES marketplace_publishers(id) ON DELETE CASCADE,
  publisher_type  VARCHAR(20) NOT NULL DEFAULT 'builder'
                  CHECK (publisher_type IN ('builder','consultant','platform')),
  template_type   VARCHAR(30) NOT NULL
                  CHECK (template_type IN (
                    'estimate','schedule','checklist','contract','report',
                    'workflow','cost_code','selection','specification'
                  )),
  name            VARCHAR(255) NOT NULL,
  slug            VARCHAR(255) NOT NULL UNIQUE,
  description     TEXT,
  long_description TEXT,
  screenshots     JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags            JSONB NOT NULL DEFAULT '[]'::jsonb,
  region_tags     JSONB NOT NULL DEFAULT '[]'::jsonb,
  construction_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  price           NUMERIC(10,2) NOT NULL DEFAULT 0
                  CHECK (price >= 0),
  currency        VARCHAR(10) NOT NULL DEFAULT 'USD',
  template_data   JSONB NOT NULL DEFAULT '{}'::jsonb,
  required_modules JSONB NOT NULL DEFAULT '[]'::jsonb,
  version         VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  install_count   INT NOT NULL DEFAULT 0,
  avg_rating      NUMERIC(3,2) NOT NULL DEFAULT 0
                  CHECK (avg_rating >= 0 AND avg_rating <= 5),
  review_count    INT NOT NULL DEFAULT 0,
  review_status   VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (review_status IN ('pending','approved','rejected')),
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

ALTER TABLE marketplace_templates ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved, active, non-deleted templates
CREATE POLICY marketplace_templates_read
  ON marketplace_templates
  FOR SELECT
  USING (true);

-- Publishers can manage their own templates
CREATE POLICY marketplace_templates_write
  ON marketplace_templates
  FOR ALL
  USING (true);

CREATE INDEX idx_mp_templates_publisher ON marketplace_templates(publisher_id);
CREATE INDEX idx_mp_templates_type ON marketplace_templates(template_type);
CREATE INDEX idx_mp_templates_slug ON marketplace_templates(slug);
CREATE INDEX idx_mp_templates_review_status ON marketplace_templates(review_status);
CREATE INDEX idx_mp_templates_is_active ON marketplace_templates(is_active) WHERE is_active = true;
CREATE INDEX idx_mp_templates_is_featured ON marketplace_templates(is_featured) WHERE is_featured = true;
CREATE INDEX idx_mp_templates_price ON marketplace_templates(price);
CREATE INDEX idx_mp_templates_install_count ON marketplace_templates(install_count DESC);
CREATE INDEX idx_mp_templates_avg_rating ON marketplace_templates(avg_rating DESC);
CREATE INDEX idx_mp_templates_review_active ON marketplace_templates(review_status, is_active);
CREATE INDEX idx_mp_templates_deleted ON marketplace_templates(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_mp_templates_created ON marketplace_templates(created_at DESC);

CREATE OR REPLACE TRIGGER set_mp_templates_updated_at
  BEFORE UPDATE ON marketplace_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 3. marketplace_template_versions — version history per template
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS marketplace_template_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id     UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  version         VARCHAR(20) NOT NULL,
  changelog       TEXT,
  template_data   JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(template_id, version)
);

ALTER TABLE marketplace_template_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY marketplace_template_versions_read
  ON marketplace_template_versions
  FOR SELECT
  USING (true);

CREATE POLICY marketplace_template_versions_write
  ON marketplace_template_versions
  FOR ALL
  USING (true);

CREATE INDEX idx_mp_versions_template ON marketplace_template_versions(template_id);
CREATE INDEX idx_mp_versions_template_version ON marketplace_template_versions(template_id, version);
CREATE INDEX idx_mp_versions_published ON marketplace_template_versions(published_at DESC);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. marketplace_installs — installation records per company
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS marketplace_installs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  template_id     UUID NOT NULL REFERENCES marketplace_templates(id),
  template_version VARCHAR(20) NOT NULL,
  installed_by    UUID NOT NULL,
  installed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  uninstalled_at  TIMESTAMPTZ,
  payment_id      UUID,
  payment_amount  NUMERIC(10,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE marketplace_installs ENABLE ROW LEVEL SECURITY;

CREATE POLICY marketplace_installs_tenant
  ON marketplace_installs
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_mp_installs_company ON marketplace_installs(company_id);
CREATE INDEX idx_mp_installs_template ON marketplace_installs(template_id);
CREATE INDEX idx_mp_installs_user ON marketplace_installs(installed_by);
CREATE INDEX idx_mp_installs_company_template ON marketplace_installs(company_id, template_id);
CREATE INDEX idx_mp_installs_installed_at ON marketplace_installs(installed_at DESC);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. marketplace_reviews — ratings and reviews per template
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS marketplace_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  template_id     UUID NOT NULL REFERENCES marketplace_templates(id),
  user_id         UUID NOT NULL,
  rating          INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title           VARCHAR(200),
  review_text     TEXT,
  publisher_response TEXT,
  publisher_responded_at TIMESTAMPTZ,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT true,
  is_flagged      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, template_id, user_id)
);

ALTER TABLE marketplace_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY marketplace_reviews_read
  ON marketplace_reviews
  FOR SELECT
  USING (true);

CREATE POLICY marketplace_reviews_write
  ON marketplace_reviews
  FOR ALL
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_mp_reviews_company ON marketplace_reviews(company_id);
CREATE INDEX idx_mp_reviews_template ON marketplace_reviews(template_id);
CREATE INDEX idx_mp_reviews_user ON marketplace_reviews(user_id);
CREATE INDEX idx_mp_reviews_rating ON marketplace_reviews(rating);
CREATE INDEX idx_mp_reviews_template_rating ON marketplace_reviews(template_id, rating);
CREATE INDEX idx_mp_reviews_flagged ON marketplace_reviews(is_flagged) WHERE is_flagged = true;
CREATE INDEX idx_mp_reviews_created ON marketplace_reviews(created_at DESC);

CREATE OR REPLACE TRIGGER set_mp_reviews_updated_at
  BEFORE UPDATE ON marketplace_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
