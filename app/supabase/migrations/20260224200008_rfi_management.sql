-- ============================================================================
-- Module 27: RFI Management — V1 Foundation
-- Tables: rfis, rfi_responses, rfi_routing, rfi_templates
-- ============================================================================

-- ── rfis ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rfis (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id),
  job_id        UUID NOT NULL REFERENCES jobs(id),
  rfi_number    VARCHAR(20) NOT NULL,
  subject       VARCHAR(255) NOT NULL,
  question      TEXT NOT NULL,
  status        VARCHAR(30) NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','open','pending_response','answered','closed','voided')),
  priority      VARCHAR(20) NOT NULL DEFAULT 'normal'
                  CHECK (priority IN ('low','normal','high','urgent')),
  category      VARCHAR(30) NOT NULL DEFAULT 'general'
                  CHECK (category IN ('design','structural','mechanical','electrical','plumbing','site','finish','general')),
  assigned_to   UUID REFERENCES users(id),
  due_date      DATE,
  cost_impact   NUMERIC(15,2) NOT NULL DEFAULT 0,
  schedule_impact_days INT NOT NULL DEFAULT 0,
  related_document_id UUID,
  created_by    UUID REFERENCES users(id),
  answered_at   TIMESTAMPTZ,
  closed_at     TIMESTAMPTZ,
  closed_by     UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_rfis_company_id      ON rfis(company_id);
CREATE INDEX idx_rfis_job_id          ON rfis(job_id);
CREATE INDEX idx_rfis_rfi_number      ON rfis(rfi_number);
CREATE INDEX idx_rfis_status          ON rfis(status);
CREATE INDEX idx_rfis_priority        ON rfis(priority);
CREATE INDEX idx_rfis_category        ON rfis(category);
CREATE INDEX idx_rfis_assigned_to     ON rfis(assigned_to);
CREATE INDEX idx_rfis_due_date        ON rfis(due_date);
CREATE INDEX idx_rfis_company_status  ON rfis(company_id, status);
CREATE INDEX idx_rfis_company_job     ON rfis(company_id, job_id);
CREATE INDEX idx_rfis_created_at      ON rfis(created_at DESC);
CREATE INDEX idx_rfis_deleted_at      ON rfis(deleted_at) WHERE deleted_at IS NOT NULL;

-- RLS
ALTER TABLE rfis ENABLE ROW LEVEL SECURITY;

CREATE POLICY rfis_tenant_isolation ON rfis
  USING (company_id = get_current_company_id());

-- updated_at trigger
CREATE TRIGGER set_rfis_updated_at
  BEFORE UPDATE ON rfis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ── rfi_responses ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rfi_responses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfi_id        UUID NOT NULL REFERENCES rfis(id) ON DELETE CASCADE,
  company_id    UUID NOT NULL REFERENCES companies(id),
  response_text TEXT NOT NULL,
  responded_by  UUID REFERENCES users(id),
  attachments   JSONB DEFAULT '[]'::jsonb,
  is_official   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_rfi_responses_rfi_id     ON rfi_responses(rfi_id);
CREATE INDEX idx_rfi_responses_company_id ON rfi_responses(company_id);
CREATE INDEX idx_rfi_responses_responded_by ON rfi_responses(responded_by);
CREATE INDEX idx_rfi_responses_created_at ON rfi_responses(created_at DESC);

-- RLS
ALTER TABLE rfi_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY rfi_responses_tenant_isolation ON rfi_responses
  USING (company_id = get_current_company_id());

-- updated_at trigger
CREATE TRIGGER set_rfi_responses_updated_at
  BEFORE UPDATE ON rfi_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ── rfi_routing ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rfi_routing (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfi_id        UUID NOT NULL REFERENCES rfis(id) ON DELETE CASCADE,
  company_id    UUID NOT NULL REFERENCES companies(id),
  routed_to     UUID REFERENCES users(id),
  routed_by     UUID REFERENCES users(id),
  routed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  status        VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','viewed','responded','forwarded')),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_rfi_routing_rfi_id     ON rfi_routing(rfi_id);
CREATE INDEX idx_rfi_routing_company_id ON rfi_routing(company_id);
CREATE INDEX idx_rfi_routing_routed_to  ON rfi_routing(routed_to);
CREATE INDEX idx_rfi_routing_routed_by  ON rfi_routing(routed_by);
CREATE INDEX idx_rfi_routing_status     ON rfi_routing(status);

-- RLS
ALTER TABLE rfi_routing ENABLE ROW LEVEL SECURITY;

CREATE POLICY rfi_routing_tenant_isolation ON rfi_routing
  USING (company_id = get_current_company_id());

-- updated_at trigger
CREATE TRIGGER set_rfi_routing_updated_at
  BEFORE UPDATE ON rfi_routing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ── rfi_templates ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rfi_templates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL REFERENCES companies(id),
  name              VARCHAR(200) NOT NULL,
  category          VARCHAR(30) NOT NULL DEFAULT 'general'
                      CHECK (category IN ('design','structural','mechanical','electrical','plumbing','site','finish','general')),
  subject_template  VARCHAR(255),
  question_template TEXT,
  default_priority  VARCHAR(20) NOT NULL DEFAULT 'normal'
                      CHECK (default_priority IN ('low','normal','high','urgent')),
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_rfi_templates_company_id ON rfi_templates(company_id);
CREATE INDEX idx_rfi_templates_category   ON rfi_templates(category);
CREATE INDEX idx_rfi_templates_is_active  ON rfi_templates(is_active);
CREATE INDEX idx_rfi_templates_company_active ON rfi_templates(company_id, is_active);

-- RLS
ALTER TABLE rfi_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY rfi_templates_tenant_isolation ON rfi_templates
  USING (company_id = get_current_company_id());

-- updated_at trigger
CREATE TRIGGER set_rfi_templates_updated_at
  BEFORE UPDATE ON rfi_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
