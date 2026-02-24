-- ============================================================================
-- Module 37: Marketing & Portfolio — V1 Foundation
--
-- Tables: portfolio_projects, portfolio_photos, client_reviews,
--         marketing_campaigns, campaign_contacts
-- Multi-tenant via company_id + RLS. Soft delete on portfolio_projects.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. portfolio_projects — showcase projects for marketing portfolio
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS portfolio_projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  job_id          UUID,
  title           VARCHAR(255) NOT NULL,
  slug            VARCHAR(255),
  description     TEXT,
  highlights      JSONB NOT NULL DEFAULT '[]'::jsonb,
  category        VARCHAR(100),
  style           VARCHAR(100),
  status          TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','published','featured','archived')),
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  display_order   INT NOT NULL DEFAULT 0,
  cover_photo_url TEXT,
  square_footage  INT,
  bedrooms        INT,
  bathrooms       NUMERIC(4,1),
  build_duration_days INT,
  completion_date DATE,
  location        VARCHAR(200),
  custom_features JSONB NOT NULL DEFAULT '[]'::jsonb,
  seo_title       VARCHAR(255),
  seo_description TEXT,
  published_at    TIMESTAMPTZ,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY portfolio_projects_tenant
  ON portfolio_projects
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_portfolio_projects_company ON portfolio_projects(company_id);
CREATE INDEX idx_portfolio_projects_job ON portfolio_projects(job_id);
CREATE INDEX idx_portfolio_projects_status ON portfolio_projects(status);
CREATE INDEX idx_portfolio_projects_category ON portfolio_projects(category);
CREATE INDEX idx_portfolio_projects_style ON portfolio_projects(style);
CREATE INDEX idx_portfolio_projects_featured ON portfolio_projects(is_featured);
CREATE INDEX idx_portfolio_projects_company_status ON portfolio_projects(company_id, status);
CREATE INDEX idx_portfolio_projects_display ON portfolio_projects(display_order);
CREATE INDEX idx_portfolio_projects_deleted ON portfolio_projects(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_portfolio_projects_created ON portfolio_projects(created_at DESC);
CREATE INDEX idx_portfolio_projects_slug ON portfolio_projects(company_id, slug);

CREATE OR REPLACE TRIGGER set_portfolio_projects_updated_at
  BEFORE UPDATE ON portfolio_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 2. portfolio_photos — photos for portfolio projects
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS portfolio_photos (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_project_id  UUID NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  company_id            UUID NOT NULL REFERENCES companies(id),
  photo_url             TEXT NOT NULL,
  caption               VARCHAR(500),
  photo_type            TEXT NOT NULL DEFAULT 'exterior'
    CHECK (photo_type IN ('exterior','interior','before','after','progress','detail')),
  room                  VARCHAR(100),
  display_order         INT NOT NULL DEFAULT 0,
  is_cover              BOOLEAN NOT NULL DEFAULT false,
  uploaded_by           UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE portfolio_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY portfolio_photos_tenant
  ON portfolio_photos
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_portfolio_photos_project ON portfolio_photos(portfolio_project_id);
CREATE INDEX idx_portfolio_photos_company ON portfolio_photos(company_id);
CREATE INDEX idx_portfolio_photos_type ON portfolio_photos(photo_type);
CREATE INDEX idx_portfolio_photos_display ON portfolio_photos(display_order);
CREATE INDEX idx_portfolio_photos_cover ON portfolio_photos(is_cover) WHERE is_cover = true;

CREATE OR REPLACE TRIGGER set_portfolio_photos_updated_at
  BEFORE UPDATE ON portfolio_photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 3. client_reviews — testimonials and reviews
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS client_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  job_id          UUID,
  client_name     VARCHAR(200) NOT NULL,
  client_email    VARCHAR(255),
  rating          INT NOT NULL DEFAULT 5
    CHECK (rating >= 1 AND rating <= 5),
  review_text     TEXT,
  source          TEXT NOT NULL DEFAULT 'platform'
    CHECK (source IN ('google','houzz','facebook','yelp','bbb','angi','platform')),
  status          TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','published','rejected')),
  display_name    VARCHAR(200),
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  published_at    TIMESTAMPTZ,
  approved_by     UUID,
  approved_at     TIMESTAMPTZ,
  requested_at    TIMESTAMPTZ,
  submitted_at    TIMESTAMPTZ,
  response_text   TEXT,
  response_by     UUID,
  response_at     TIMESTAMPTZ,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE client_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY client_reviews_tenant
  ON client_reviews
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_client_reviews_company ON client_reviews(company_id);
CREATE INDEX idx_client_reviews_job ON client_reviews(job_id);
CREATE INDEX idx_client_reviews_status ON client_reviews(status);
CREATE INDEX idx_client_reviews_source ON client_reviews(source);
CREATE INDEX idx_client_reviews_rating ON client_reviews(rating);
CREATE INDEX idx_client_reviews_featured ON client_reviews(is_featured) WHERE is_featured = true;
CREATE INDEX idx_client_reviews_company_status ON client_reviews(company_id, status);
CREATE INDEX idx_client_reviews_company_source ON client_reviews(company_id, source);
CREATE INDEX idx_client_reviews_created ON client_reviews(created_at DESC);

CREATE OR REPLACE TRIGGER set_client_reviews_updated_at
  BEFORE UPDATE ON client_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 4. marketing_campaigns — campaign tracking
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID NOT NULL REFERENCES companies(id),
  name                VARCHAR(200) NOT NULL,
  description         TEXT,
  campaign_type       TEXT NOT NULL DEFAULT 'other'
    CHECK (campaign_type IN ('email','social','print','referral','event','other')),
  status              TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','active','paused','completed','cancelled')),
  channel             VARCHAR(100),
  start_date          DATE,
  end_date            DATE,
  budget              NUMERIC(12,2) NOT NULL DEFAULT 0,
  actual_spend        NUMERIC(12,2) NOT NULL DEFAULT 0,
  utm_source          VARCHAR(100),
  utm_medium          VARCHAR(100),
  utm_campaign        VARCHAR(100),
  leads_generated     INT NOT NULL DEFAULT 0,
  proposals_sent      INT NOT NULL DEFAULT 0,
  contracts_won       INT NOT NULL DEFAULT 0,
  contract_value_won  NUMERIC(15,2) NOT NULL DEFAULT 0,
  roi_pct             NUMERIC(8,2),
  target_audience     TEXT,
  notes               TEXT,
  created_by          UUID,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY marketing_campaigns_tenant
  ON marketing_campaigns
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_marketing_campaigns_company ON marketing_campaigns(company_id);
CREATE INDEX idx_marketing_campaigns_type ON marketing_campaigns(campaign_type);
CREATE INDEX idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX idx_marketing_campaigns_channel ON marketing_campaigns(channel);
CREATE INDEX idx_marketing_campaigns_company_status ON marketing_campaigns(company_id, status);
CREATE INDEX idx_marketing_campaigns_company_type ON marketing_campaigns(company_id, campaign_type);
CREATE INDEX idx_marketing_campaigns_dates ON marketing_campaigns(start_date, end_date);
CREATE INDEX idx_marketing_campaigns_created ON marketing_campaigns(created_at DESC);

CREATE OR REPLACE TRIGGER set_marketing_campaigns_updated_at
  BEFORE UPDATE ON marketing_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 5. campaign_contacts — contacts associated with campaigns
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS campaign_contacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  company_id      UUID NOT NULL REFERENCES companies(id),
  contact_name    VARCHAR(200) NOT NULL,
  contact_email   VARCHAR(255),
  contact_phone   VARCHAR(50),
  status          TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','sent','opened','clicked','converted','unsubscribed')),
  sent_at         TIMESTAMPTZ,
  opened_at       TIMESTAMPTZ,
  clicked_at      TIMESTAMPTZ,
  converted_at    TIMESTAMPTZ,
  lead_id         UUID,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE campaign_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY campaign_contacts_tenant
  ON campaign_contacts
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_campaign_contacts_campaign ON campaign_contacts(campaign_id);
CREATE INDEX idx_campaign_contacts_company ON campaign_contacts(company_id);
CREATE INDEX idx_campaign_contacts_status ON campaign_contacts(status);
CREATE INDEX idx_campaign_contacts_lead ON campaign_contacts(lead_id);
CREATE INDEX idx_campaign_contacts_email ON campaign_contacts(contact_email);

CREATE OR REPLACE TRIGGER set_campaign_contacts_updated_at
  BEFORE UPDATE ON campaign_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
