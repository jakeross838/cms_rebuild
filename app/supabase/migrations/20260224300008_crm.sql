-- ============================================================================
-- Module 36: Lead Pipeline & CRM — V1 Foundation
--
-- Tables: leads, lead_activities, lead_sources, pipelines, pipeline_stages
-- Multi-tenant: company_id + RLS on all tables
-- ============================================================================

-- ── Leads ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id),

  -- Contact info
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(255),
  phone         VARCHAR(50),
  address       TEXT,
  lot_address   TEXT,

  -- Lead source
  source        TEXT NOT NULL DEFAULT 'other',
  source_detail TEXT,
  utm_source    VARCHAR(255),
  utm_medium    VARCHAR(255),
  utm_campaign  VARCHAR(255),

  -- Project details
  project_type          TEXT,
  budget_range_low      NUMERIC(15,2),
  budget_range_high     NUMERIC(15,2),
  timeline              TEXT,
  lot_status            TEXT,
  financing_status      TEXT,
  preconstruction_type  TEXT CHECK (preconstruction_type IN ('design_build', 'plan_bid_build')),

  -- Pipeline
  status                TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost', 'on_hold')),
  priority              TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'hot')),
  pipeline_id           UUID,
  stage_id              UUID,
  score                 INT DEFAULT 0,
  assigned_to           UUID,

  -- Value tracking
  expected_contract_value  NUMERIC(15,2) DEFAULT 0,
  probability_pct          NUMERIC(5,2) DEFAULT 0,

  -- Win / loss
  lost_reason       TEXT,
  lost_competitor   TEXT,
  won_project_id    UUID,

  -- Metadata
  created_by    UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_company_id        ON leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_status             ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority           ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_source             ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to        ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_id        ON leads(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage_id           ON leads(stage_id);
CREATE INDEX IF NOT EXISTS idx_leads_company_status     ON leads(company_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_company_pipeline   ON leads(company_id, pipeline_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at         ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_deleted_at         ON leads(deleted_at) WHERE deleted_at IS NOT NULL;

-- RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY leads_tenant_isolation ON leads
  USING (company_id = get_current_company_id());

-- updated_at trigger
CREATE TRIGGER set_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── Lead Activities ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lead_activities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

  activity_type   TEXT NOT NULL DEFAULT 'note' CHECK (activity_type IN ('call', 'email', 'meeting', 'note', 'site_visit', 'proposal', 'follow_up')),
  subject         VARCHAR(255),
  description     TEXT,
  performed_by    UUID,
  activity_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_minutes INT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lead_activities_company_id    ON lead_activities(company_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id       ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_type          ON lead_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_lead_activities_date          ON lead_activities(activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_lead_activities_company_lead  ON lead_activities(company_id, lead_id);

-- RLS
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY lead_activities_tenant_isolation ON lead_activities
  USING (company_id = get_current_company_id());

-- updated_at trigger
CREATE TRIGGER set_lead_activities_updated_at
  BEFORE UPDATE ON lead_activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── Lead Sources ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lead_sources (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id),

  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  source_type   TEXT NOT NULL DEFAULT 'other' CHECK (source_type IN ('referral', 'website', 'social_media', 'advertising', 'trade_show', 'cold_call', 'partner', 'other')),
  is_active     BOOLEAN NOT NULL DEFAULT true,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lead_sources_company_id    ON lead_sources(company_id);
CREATE INDEX IF NOT EXISTS idx_lead_sources_type          ON lead_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_lead_sources_active        ON lead_sources(company_id, is_active);

-- RLS
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY lead_sources_tenant_isolation ON lead_sources
  USING (company_id = get_current_company_id());

-- updated_at trigger
CREATE TRIGGER set_lead_sources_updated_at
  BEFORE UPDATE ON lead_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── Pipelines ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pipelines (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id),

  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  is_default    BOOLEAN NOT NULL DEFAULT false,
  is_active     BOOLEAN NOT NULL DEFAULT true,

  created_by    UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pipelines_company_id       ON pipelines(company_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_default          ON pipelines(company_id, is_default);
CREATE INDEX IF NOT EXISTS idx_pipelines_active           ON pipelines(company_id, is_active);

-- RLS
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
CREATE POLICY pipelines_tenant_isolation ON pipelines
  USING (company_id = get_current_company_id());

-- updated_at trigger
CREATE TRIGGER set_pipelines_updated_at
  BEFORE UPDATE ON pipelines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── Pipeline Stages ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  pipeline_id     UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,

  name            VARCHAR(200) NOT NULL,
  stage_type      TEXT NOT NULL DEFAULT 'lead' CHECK (stage_type IN ('lead', 'qualified', 'proposal', 'negotiation', 'closed')),
  sequence_order  INT NOT NULL DEFAULT 0,
  probability_default NUMERIC(5,2) DEFAULT 0,
  color           VARCHAR(20),
  is_active       BOOLEAN NOT NULL DEFAULT true,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_company_id      ON pipeline_stages(company_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_pipeline_id     ON pipeline_stages(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_type            ON pipeline_stages(stage_type);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_order           ON pipeline_stages(pipeline_id, sequence_order);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_active          ON pipeline_stages(company_id, is_active);

-- RLS
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY pipeline_stages_tenant_isolation ON pipeline_stages
  USING (company_id = get_current_company_id());

-- updated_at trigger
CREATE TRIGGER set_pipeline_stages_updated_at
  BEFORE UPDATE ON pipeline_stages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── FK for leads -> pipeline / stage ──────────────────────────────────────
-- Add FK constraints after tables exist
ALTER TABLE leads
  ADD CONSTRAINT fk_leads_pipeline FOREIGN KEY (pipeline_id) REFERENCES pipelines(id),
  ADD CONSTRAINT fk_leads_stage    FOREIGN KEY (stage_id)    REFERENCES pipeline_stages(id);
