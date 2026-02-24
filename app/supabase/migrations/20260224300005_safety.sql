-- ============================================================================
-- Module 33: Safety & Compliance — V1 Foundation
--
-- Tables: safety_incidents, safety_inspections, safety_inspection_items,
--         toolbox_talks, toolbox_talk_attendees
-- Multi-tenant via company_id + RLS. Soft delete on incidents/inspections.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. safety_incidents — incident/near-miss reports
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS safety_incidents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  job_id          UUID NOT NULL,
  incident_number VARCHAR(30) NOT NULL,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  incident_date   DATE NOT NULL,
  incident_time   TIME,
  location        VARCHAR(200),
  severity        TEXT NOT NULL DEFAULT 'near_miss'
    CHECK (severity IN ('near_miss','minor','moderate','serious','fatal')),
  status          TEXT NOT NULL DEFAULT 'reported'
    CHECK (status IN ('reported','investigating','resolved','closed')),
  incident_type   TEXT NOT NULL DEFAULT 'other'
    CHECK (incident_type IN ('fall','struck_by','caught_in','electrical','chemical','heat','vehicle','other')),
  reported_by     UUID,
  assigned_to     UUID,
  injured_party   VARCHAR(255),
  injury_description TEXT,
  witnesses       JSONB NOT NULL DEFAULT '[]'::jsonb,
  root_cause      TEXT,
  corrective_actions TEXT,
  preventive_actions TEXT,
  osha_recordable BOOLEAN NOT NULL DEFAULT false,
  osha_report_number VARCHAR(50),
  lost_work_days  INT NOT NULL DEFAULT 0,
  restricted_days INT NOT NULL DEFAULT 0,
  medical_treatment BOOLEAN NOT NULL DEFAULT false,
  photos          JSONB NOT NULL DEFAULT '[]'::jsonb,
  documents       JSONB NOT NULL DEFAULT '[]'::jsonb,
  resolved_at     TIMESTAMPTZ,
  resolved_by     UUID,
  closed_at       TIMESTAMPTZ,
  closed_by       UUID,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

ALTER TABLE safety_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY safety_incidents_tenant
  ON safety_incidents
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_safety_incidents_company ON safety_incidents(company_id);
CREATE INDEX idx_safety_incidents_job ON safety_incidents(job_id);
CREATE INDEX idx_safety_incidents_status ON safety_incidents(status);
CREATE INDEX idx_safety_incidents_severity ON safety_incidents(severity);
CREATE INDEX idx_safety_incidents_type ON safety_incidents(incident_type);
CREATE INDEX idx_safety_incidents_date ON safety_incidents(incident_date);
CREATE INDEX idx_safety_incidents_company_status ON safety_incidents(company_id, status);
CREATE INDEX idx_safety_incidents_company_job ON safety_incidents(company_id, job_id);
CREATE INDEX idx_safety_incidents_deleted ON safety_incidents(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_safety_incidents_created ON safety_incidents(created_at DESC);

CREATE OR REPLACE TRIGGER set_safety_incidents_updated_at
  BEFORE UPDATE ON safety_incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 2. safety_inspections — site safety inspections
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS safety_inspections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  job_id          UUID NOT NULL,
  inspection_number VARCHAR(30) NOT NULL,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  inspection_date DATE NOT NULL,
  inspection_type VARCHAR(100) NOT NULL DEFAULT 'general',
  status          TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled','in_progress','completed','failed')),
  result          TEXT
    CHECK (result IS NULL OR result IN ('pass','fail','conditional')),
  inspector_id    UUID,
  location        VARCHAR(200),
  total_items     INT NOT NULL DEFAULT 0,
  passed_items    INT NOT NULL DEFAULT 0,
  failed_items    INT NOT NULL DEFAULT 0,
  na_items        INT NOT NULL DEFAULT 0,
  score           NUMERIC(5,2),
  notes           TEXT,
  follow_up_required BOOLEAN NOT NULL DEFAULT false,
  follow_up_date  DATE,
  follow_up_notes TEXT,
  completed_at    TIMESTAMPTZ,
  completed_by    UUID,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

ALTER TABLE safety_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY safety_inspections_tenant
  ON safety_inspections
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_safety_inspections_company ON safety_inspections(company_id);
CREATE INDEX idx_safety_inspections_job ON safety_inspections(job_id);
CREATE INDEX idx_safety_inspections_status ON safety_inspections(status);
CREATE INDEX idx_safety_inspections_result ON safety_inspections(result);
CREATE INDEX idx_safety_inspections_date ON safety_inspections(inspection_date);
CREATE INDEX idx_safety_inspections_inspector ON safety_inspections(inspector_id);
CREATE INDEX idx_safety_inspections_company_status ON safety_inspections(company_id, status);
CREATE INDEX idx_safety_inspections_company_job ON safety_inspections(company_id, job_id);
CREATE INDEX idx_safety_inspections_deleted ON safety_inspections(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_safety_inspections_created ON safety_inspections(created_at DESC);

CREATE OR REPLACE TRIGGER set_safety_inspections_updated_at
  BEFORE UPDATE ON safety_inspections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 3. safety_inspection_items — individual checklist items per inspection
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS safety_inspection_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id   UUID NOT NULL REFERENCES safety_inspections(id) ON DELETE CASCADE,
  company_id      UUID NOT NULL REFERENCES companies(id),
  description     TEXT NOT NULL,
  category        VARCHAR(100),
  result          TEXT NOT NULL DEFAULT 'not_inspected'
    CHECK (result IN ('pass','fail','na','not_inspected')),
  notes           TEXT,
  photo_url       TEXT,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE safety_inspection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY safety_inspection_items_tenant
  ON safety_inspection_items
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_safety_inspection_items_inspection ON safety_inspection_items(inspection_id);
CREATE INDEX idx_safety_inspection_items_company ON safety_inspection_items(company_id);
CREATE INDEX idx_safety_inspection_items_result ON safety_inspection_items(result);

CREATE OR REPLACE TRIGGER set_safety_inspection_items_updated_at
  BEFORE UPDATE ON safety_inspection_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 4. toolbox_talks — safety meeting records
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS toolbox_talks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  job_id          UUID NOT NULL,
  title           VARCHAR(255) NOT NULL,
  topic           VARCHAR(200),
  description     TEXT,
  talk_date       DATE NOT NULL,
  talk_time       TIME,
  duration_minutes INT,
  status          TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled','completed','cancelled')),
  presenter_id    UUID,
  location        VARCHAR(200),
  materials       JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes           TEXT,
  completed_at    TIMESTAMPTZ,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE toolbox_talks ENABLE ROW LEVEL SECURITY;

CREATE POLICY toolbox_talks_tenant
  ON toolbox_talks
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_toolbox_talks_company ON toolbox_talks(company_id);
CREATE INDEX idx_toolbox_talks_job ON toolbox_talks(job_id);
CREATE INDEX idx_toolbox_talks_status ON toolbox_talks(status);
CREATE INDEX idx_toolbox_talks_date ON toolbox_talks(talk_date);
CREATE INDEX idx_toolbox_talks_company_job ON toolbox_talks(company_id, job_id);
CREATE INDEX idx_toolbox_talks_created ON toolbox_talks(created_at DESC);

CREATE OR REPLACE TRIGGER set_toolbox_talks_updated_at
  BEFORE UPDATE ON toolbox_talks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 5. toolbox_talk_attendees — attendance tracking
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS toolbox_talk_attendees (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talk_id         UUID NOT NULL REFERENCES toolbox_talks(id) ON DELETE CASCADE,
  company_id      UUID NOT NULL REFERENCES companies(id),
  attendee_name   VARCHAR(200) NOT NULL,
  attendee_id     UUID,
  trade           VARCHAR(100),
  company_name    VARCHAR(200),
  signed          BOOLEAN NOT NULL DEFAULT false,
  signed_at       TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE toolbox_talk_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY toolbox_talk_attendees_tenant
  ON toolbox_talk_attendees
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_toolbox_talk_attendees_talk ON toolbox_talk_attendees(talk_id);
CREATE INDEX idx_toolbox_talk_attendees_company ON toolbox_talk_attendees(company_id);
CREATE INDEX idx_toolbox_talk_attendees_attendee ON toolbox_talk_attendees(attendee_id);
