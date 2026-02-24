-- ==========================================================================
-- Module 25: Schedule Intelligence — V1 Foundation
-- ==========================================================================
-- Tables: schedule_predictions, schedule_weather_events,
--         schedule_risk_scores, schedule_scenarios
-- ==========================================================================

-- ── schedule_predictions ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS schedule_predictions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  job_id          UUID NOT NULL REFERENCES jobs(id),
  task_id         UUID,
  prediction_type VARCHAR(20) NOT NULL CHECK (prediction_type IN ('duration','delay','resource','weather','completion')),
  predicted_value JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  model_version   VARCHAR(50),
  is_accepted     BOOLEAN DEFAULT FALSE,
  accepted_by     UUID REFERENCES users(id),
  accepted_at     TIMESTAMPTZ,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

ALTER TABLE schedule_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY schedule_predictions_tenant ON schedule_predictions
  USING (company_id = get_current_company_id());

CREATE INDEX idx_schedule_predictions_company ON schedule_predictions(company_id);
CREATE INDEX idx_schedule_predictions_job ON schedule_predictions(job_id);
CREATE INDEX idx_schedule_predictions_task ON schedule_predictions(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX idx_schedule_predictions_type ON schedule_predictions(prediction_type);
CREATE INDEX idx_schedule_predictions_company_job ON schedule_predictions(company_id, job_id);
CREATE INDEX idx_schedule_predictions_deleted ON schedule_predictions(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER set_schedule_predictions_updated_at
  BEFORE UPDATE ON schedule_predictions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── schedule_weather_events ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS schedule_weather_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID NOT NULL REFERENCES companies(id),
  job_id              UUID NOT NULL REFERENCES jobs(id),
  event_date          DATE NOT NULL,
  weather_type        VARCHAR(20) NOT NULL CHECK (weather_type IN ('rain','snow','ice','wind','extreme_heat','extreme_cold','hurricane','tornado','flood')),
  severity            VARCHAR(10) NOT NULL CHECK (severity IN ('minor','moderate','severe','extreme')),
  impact_description  TEXT,
  affected_tasks      JSONB DEFAULT '[]',
  schedule_impact_days NUMERIC(5,1) DEFAULT 0,
  temperature_high    NUMERIC(5,1),
  temperature_low     NUMERIC(5,1),
  precipitation_inches NUMERIC(4,2),
  wind_speed_mph      NUMERIC(5,1),
  auto_logged         BOOLEAN DEFAULT FALSE,
  notes               TEXT,
  created_by          UUID REFERENCES users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at          TIMESTAMPTZ
);

ALTER TABLE schedule_weather_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY schedule_weather_events_tenant ON schedule_weather_events
  USING (company_id = get_current_company_id());

CREATE INDEX idx_schedule_weather_events_company ON schedule_weather_events(company_id);
CREATE INDEX idx_schedule_weather_events_job ON schedule_weather_events(job_id);
CREATE INDEX idx_schedule_weather_events_date ON schedule_weather_events(event_date);
CREATE INDEX idx_schedule_weather_events_type ON schedule_weather_events(weather_type);
CREATE INDEX idx_schedule_weather_events_severity ON schedule_weather_events(severity);
CREATE INDEX idx_schedule_weather_events_company_job ON schedule_weather_events(company_id, job_id);
CREATE INDEX idx_schedule_weather_events_deleted ON schedule_weather_events(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER set_schedule_weather_events_updated_at
  BEFORE UPDATE ON schedule_weather_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── schedule_risk_scores ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS schedule_risk_scores (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID NOT NULL REFERENCES companies(id),
  job_id                UUID NOT NULL REFERENCES jobs(id),
  task_id               UUID,
  risk_level            VARCHAR(10) NOT NULL CHECK (risk_level IN ('low','medium','high','critical')),
  risk_score            INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_factors          JSONB DEFAULT '{}',
  mitigation_suggestions JSONB DEFAULT '[]',
  weather_component     INTEGER DEFAULT 0 CHECK (weather_component >= 0 AND weather_component <= 100),
  resource_component    INTEGER DEFAULT 0 CHECK (resource_component >= 0 AND resource_component <= 100),
  dependency_component  INTEGER DEFAULT 0 CHECK (dependency_component >= 0 AND dependency_component <= 100),
  history_component     INTEGER DEFAULT 0 CHECK (history_component >= 0 AND history_component <= 100),
  assessed_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by            UUID REFERENCES users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at            TIMESTAMPTZ
);

ALTER TABLE schedule_risk_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY schedule_risk_scores_tenant ON schedule_risk_scores
  USING (company_id = get_current_company_id());

CREATE INDEX idx_schedule_risk_scores_company ON schedule_risk_scores(company_id);
CREATE INDEX idx_schedule_risk_scores_job ON schedule_risk_scores(job_id);
CREATE INDEX idx_schedule_risk_scores_task ON schedule_risk_scores(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX idx_schedule_risk_scores_level ON schedule_risk_scores(risk_level);
CREATE INDEX idx_schedule_risk_scores_score ON schedule_risk_scores(risk_score);
CREATE INDEX idx_schedule_risk_scores_company_job ON schedule_risk_scores(company_id, job_id);
CREATE INDEX idx_schedule_risk_scores_deleted ON schedule_risk_scores(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER set_schedule_risk_scores_updated_at
  BEFORE UPDATE ON schedule_risk_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── schedule_scenarios ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS schedule_scenarios (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL REFERENCES companies(id),
  job_id            UUID NOT NULL REFERENCES jobs(id),
  name              VARCHAR(200) NOT NULL,
  description       TEXT,
  scenario_type     VARCHAR(20) NOT NULL CHECK (scenario_type IN ('optimistic','pessimistic','most_likely','custom')),
  parameters        JSONB DEFAULT '{}',
  results           JSONB DEFAULT '{}',
  projected_completion DATE,
  projected_cost_impact NUMERIC(12,2),
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);

ALTER TABLE schedule_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY schedule_scenarios_tenant ON schedule_scenarios
  USING (company_id = get_current_company_id());

CREATE INDEX idx_schedule_scenarios_company ON schedule_scenarios(company_id);
CREATE INDEX idx_schedule_scenarios_job ON schedule_scenarios(job_id);
CREATE INDEX idx_schedule_scenarios_type ON schedule_scenarios(scenario_type);
CREATE INDEX idx_schedule_scenarios_company_job ON schedule_scenarios(company_id, job_id);
CREATE INDEX idx_schedule_scenarios_created_by ON schedule_scenarios(created_by);
CREATE INDEX idx_schedule_scenarios_deleted ON schedule_scenarios(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER set_schedule_scenarios_updated_at
  BEFORE UPDATE ON schedule_scenarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
