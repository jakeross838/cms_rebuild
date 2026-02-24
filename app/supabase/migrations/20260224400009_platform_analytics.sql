-- ============================================================================
-- Module 49: Platform Analytics — V1 Foundation
--
-- V1 tables:
--   platform_metrics_snapshots  — point-in-time platform/tenant metrics
--   tenant_health_scores        — per-company health & churn risk scoring
--   feature_usage_events        — high-volume feature usage tracking
--   ab_experiments              — A/B test definitions & results
--   deployment_releases         — release/deployment tracking (platform-wide)
--
-- Multi-tenant via company_id + RLS on tenant tables.
-- deployment_releases is platform-wide (no company_id), open read.
-- ============================================================================

-- ── platform_metrics_snapshots ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS platform_metrics_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID REFERENCES companies(id),
  snapshot_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  metric_type     TEXT NOT NULL CHECK (metric_type IN (
    'active_users', 'revenue', 'churn', 'nps', 'feature_adoption',
    'storage_usage', 'api_calls', 'support_tickets', 'onboarding_completion'
  )),
  metric_value    NUMERIC(15,2) NOT NULL DEFAULT 0,
  breakdown       JSONB NOT NULL DEFAULT '{}',
  period          TEXT NOT NULL DEFAULT 'daily' CHECK (period IN (
    'daily', 'weekly', 'monthly', 'quarterly'
  )),
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE platform_metrics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY platform_metrics_snapshots_tenant ON platform_metrics_snapshots
  USING (company_id IS NULL OR company_id = get_current_company_id());

CREATE INDEX idx_pms_company ON platform_metrics_snapshots(company_id);
CREATE INDEX idx_pms_snapshot_date ON platform_metrics_snapshots(snapshot_date);
CREATE INDEX idx_pms_metric_type ON platform_metrics_snapshots(metric_type);
CREATE INDEX idx_pms_period ON platform_metrics_snapshots(period);
CREATE INDEX idx_pms_company_metric ON platform_metrics_snapshots(company_id, metric_type);
CREATE INDEX idx_pms_company_date ON platform_metrics_snapshots(company_id, snapshot_date);
CREATE INDEX idx_pms_date_type ON platform_metrics_snapshots(snapshot_date, metric_type);
CREATE INDEX idx_pms_created ON platform_metrics_snapshots(created_at DESC);

CREATE TRIGGER set_platform_metrics_snapshots_updated_at
  BEFORE UPDATE ON platform_metrics_snapshots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── tenant_health_scores ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tenant_health_scores (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL REFERENCES companies(id),
  score_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_score     INT NOT NULL DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  adoption_score    INT NOT NULL DEFAULT 0 CHECK (adoption_score >= 0 AND adoption_score <= 100),
  engagement_score  INT NOT NULL DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  satisfaction_score INT NOT NULL DEFAULT 0 CHECK (satisfaction_score >= 0 AND satisfaction_score <= 100),
  growth_score      INT NOT NULL DEFAULT 0 CHECK (growth_score >= 0 AND growth_score <= 100),
  risk_level        TEXT NOT NULL DEFAULT 'healthy' CHECK (risk_level IN (
    'healthy', 'at_risk', 'churning', 'critical'
  )),
  churn_probability NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (churn_probability >= 0 AND churn_probability <= 100),
  last_login_at     TIMESTAMPTZ,
  active_users_count INT NOT NULL DEFAULT 0,
  feature_utilization JSONB NOT NULL DEFAULT '{}',
  notes             TEXT,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE tenant_health_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_health_scores_tenant ON tenant_health_scores
  USING (company_id = get_current_company_id());

CREATE INDEX idx_ths_company ON tenant_health_scores(company_id);
CREATE INDEX idx_ths_score_date ON tenant_health_scores(score_date);
CREATE INDEX idx_ths_risk_level ON tenant_health_scores(risk_level);
CREATE INDEX idx_ths_overall_score ON tenant_health_scores(overall_score);
CREATE INDEX idx_ths_company_date ON tenant_health_scores(company_id, score_date);
CREATE INDEX idx_ths_company_risk ON tenant_health_scores(company_id, risk_level);
CREATE INDEX idx_ths_churn ON tenant_health_scores(churn_probability DESC);
CREATE INDEX idx_ths_created ON tenant_health_scores(created_at DESC);

CREATE TRIGGER set_tenant_health_scores_updated_at
  BEFORE UPDATE ON tenant_health_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── feature_usage_events ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS feature_usage_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  user_id         UUID REFERENCES users(id),
  feature_key     VARCHAR(100) NOT NULL,
  event_type      TEXT NOT NULL DEFAULT 'action' CHECK (event_type IN (
    'page_view', 'action', 'api_call'
  )),
  metadata        JSONB NOT NULL DEFAULT '{}',
  session_id      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE feature_usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY feature_usage_events_tenant ON feature_usage_events
  USING (company_id = get_current_company_id());

CREATE INDEX idx_fue_company ON feature_usage_events(company_id);
CREATE INDEX idx_fue_user ON feature_usage_events(user_id);
CREATE INDEX idx_fue_feature_key ON feature_usage_events(feature_key);
CREATE INDEX idx_fue_event_type ON feature_usage_events(event_type);
CREATE INDEX idx_fue_created ON feature_usage_events(created_at DESC);
CREATE INDEX idx_fue_company_feature ON feature_usage_events(company_id, feature_key);
CREATE INDEX idx_fue_company_user ON feature_usage_events(company_id, user_id);
CREATE INDEX idx_fue_session ON feature_usage_events(session_id);

-- ── ab_experiments ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ab_experiments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID REFERENCES companies(id),
  name              VARCHAR(200) NOT NULL,
  description       TEXT,
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'active', 'paused', 'completed'
  )),
  feature_key       VARCHAR(100),
  variants          JSONB NOT NULL DEFAULT '[]',
  start_date        DATE,
  end_date          DATE,
  sample_percentage INT NOT NULL DEFAULT 100 CHECK (sample_percentage >= 1 AND sample_percentage <= 100),
  results           JSONB NOT NULL DEFAULT '{}',
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ab_experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY ab_experiments_tenant ON ab_experiments
  USING (company_id IS NULL OR company_id = get_current_company_id());

CREATE INDEX idx_abe_company ON ab_experiments(company_id);
CREATE INDEX idx_abe_status ON ab_experiments(status);
CREATE INDEX idx_abe_feature_key ON ab_experiments(feature_key);
CREATE INDEX idx_abe_company_status ON ab_experiments(company_id, status);
CREATE INDEX idx_abe_start_date ON ab_experiments(start_date);
CREATE INDEX idx_abe_end_date ON ab_experiments(end_date);
CREATE INDEX idx_abe_created ON ab_experiments(created_at DESC);

CREATE TRIGGER set_ab_experiments_updated_at
  BEFORE UPDATE ON ab_experiments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── deployment_releases ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS deployment_releases (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version           VARCHAR(50) NOT NULL,
  release_type      TEXT NOT NULL DEFAULT 'minor' CHECK (release_type IN (
    'major', 'minor', 'patch', 'hotfix'
  )),
  status            TEXT NOT NULL DEFAULT 'planned' CHECK (status IN (
    'planned', 'in_progress', 'deployed', 'rolled_back'
  )),
  description       TEXT,
  changelog         TEXT,
  deployed_at       TIMESTAMPTZ,
  deployed_by       UUID REFERENCES users(id),
  rollback_reason   TEXT,
  affected_services JSONB NOT NULL DEFAULT '[]',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE deployment_releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY deployment_releases_read ON deployment_releases
  USING (true);

CREATE INDEX idx_dr_version ON deployment_releases(version);
CREATE INDEX idx_dr_release_type ON deployment_releases(release_type);
CREATE INDEX idx_dr_status ON deployment_releases(status);
CREATE INDEX idx_dr_deployed_at ON deployment_releases(deployed_at DESC);
CREATE INDEX idx_dr_created ON deployment_releases(created_at DESC);
CREATE INDEX idx_dr_type_status ON deployment_releases(release_type, status);

CREATE TRIGGER set_deployment_releases_updated_at
  BEFORE UPDATE ON deployment_releases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
