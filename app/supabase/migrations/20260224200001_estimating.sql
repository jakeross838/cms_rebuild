-- ============================================================================
-- Module 20: Estimating Engine — V1 Foundation
-- Tables: estimates, estimate_sections, estimate_line_items,
--         assemblies, assembly_items, estimate_versions
-- ============================================================================

-- ── Estimates ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS estimates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id),
  job_id        UUID REFERENCES jobs(id),
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  status        VARCHAR(30) NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','pending_review','approved','rejected','revised','archived')),
  estimate_type VARCHAR(30) NOT NULL DEFAULT 'lump_sum'
                  CHECK (estimate_type IN ('lump_sum','cost_plus','time_and_materials','unit_price','gmp','design_build')),
  contract_type VARCHAR(30)
                  CHECK (contract_type IS NULL OR contract_type IN ('nte','gmp','cost_plus','fixed')),
  version       INT NOT NULL DEFAULT 1,
  parent_version_id UUID REFERENCES estimates(id),
  markup_type   VARCHAR(20) DEFAULT 'flat'
                  CHECK (markup_type IS NULL OR markup_type IN ('flat','tiered','per_line','built_in')),
  markup_pct    NUMERIC(5,2) DEFAULT 0,
  overhead_pct  NUMERIC(5,2) DEFAULT 0,
  profit_pct    NUMERIC(5,2) DEFAULT 0,
  subtotal      NUMERIC(15,2) DEFAULT 0,
  total         NUMERIC(15,2) DEFAULT 0,
  valid_until   DATE,
  notes         TEXT,
  created_by    UUID REFERENCES users(id),
  approved_by   UUID REFERENCES users(id),
  approved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ
);

ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY estimates_tenant_isolation ON estimates
  USING (company_id = get_current_company_id());

CREATE INDEX idx_estimates_company_id ON estimates(company_id);
CREATE INDEX idx_estimates_job_id ON estimates(job_id);
CREATE INDEX idx_estimates_status ON estimates(status);
CREATE INDEX idx_estimates_company_status ON estimates(company_id, status);
CREATE INDEX idx_estimates_company_job ON estimates(company_id, job_id);
CREATE INDEX idx_estimates_deleted_at ON estimates(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_estimates_created_at ON estimates(created_at DESC);

CREATE TRIGGER set_estimates_updated_at
  BEFORE UPDATE ON estimates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Estimate Sections ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS estimate_sections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id   UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  company_id    UUID NOT NULL REFERENCES companies(id),
  parent_id     UUID REFERENCES estimate_sections(id),
  name          VARCHAR(255) NOT NULL,
  sort_order    INT NOT NULL DEFAULT 0,
  subtotal      NUMERIC(15,2) DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE estimate_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY estimate_sections_tenant_isolation ON estimate_sections
  USING (company_id = get_current_company_id());

CREATE INDEX idx_estimate_sections_estimate_id ON estimate_sections(estimate_id);
CREATE INDEX idx_estimate_sections_company_id ON estimate_sections(company_id);
CREATE INDEX idx_estimate_sections_parent_id ON estimate_sections(parent_id);

CREATE TRIGGER set_estimate_sections_updated_at
  BEFORE UPDATE ON estimate_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Estimate Line Items ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS estimate_line_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id   UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  company_id    UUID NOT NULL REFERENCES companies(id),
  section_id    UUID REFERENCES estimate_sections(id),
  cost_code_id  UUID,
  assembly_id   UUID,
  description   TEXT NOT NULL,
  item_type     VARCHAR(20) NOT NULL DEFAULT 'line'
                  CHECK (item_type IN ('line','allowance','exclusion','alternate')),
  quantity      NUMERIC(12,4) DEFAULT 1,
  unit          VARCHAR(30) DEFAULT 'each',
  unit_cost     NUMERIC(15,2) DEFAULT 0,
  markup_pct    NUMERIC(5,2) DEFAULT 0,
  total         NUMERIC(15,2) DEFAULT 0,
  alt_group     VARCHAR(50),
  notes         TEXT,
  sort_order    INT NOT NULL DEFAULT 0,
  ai_suggested  BOOLEAN DEFAULT false,
  ai_confidence VARCHAR(10)
                  CHECK (ai_confidence IS NULL OR ai_confidence IN ('high','medium','low')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE estimate_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY estimate_line_items_tenant_isolation ON estimate_line_items
  USING (company_id = get_current_company_id());

CREATE INDEX idx_estimate_line_items_estimate_id ON estimate_line_items(estimate_id);
CREATE INDEX idx_estimate_line_items_company_id ON estimate_line_items(company_id);
CREATE INDEX idx_estimate_line_items_section_id ON estimate_line_items(section_id);
CREATE INDEX idx_estimate_line_items_cost_code_id ON estimate_line_items(cost_code_id);
CREATE INDEX idx_estimate_line_items_assembly_id ON estimate_line_items(assembly_id);
CREATE INDEX idx_estimate_line_items_item_type ON estimate_line_items(item_type);

CREATE TRIGGER set_estimate_line_items_updated_at
  BEFORE UPDATE ON estimate_line_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Assemblies ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS assemblies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id),
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  category      VARCHAR(100),
  parameter_unit VARCHAR(30),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ
);

ALTER TABLE assemblies ENABLE ROW LEVEL SECURITY;

CREATE POLICY assemblies_tenant_isolation ON assemblies
  USING (company_id = get_current_company_id());

CREATE INDEX idx_assemblies_company_id ON assemblies(company_id);
CREATE INDEX idx_assemblies_category ON assemblies(category);
CREATE INDEX idx_assemblies_is_active ON assemblies(is_active);
CREATE INDEX idx_assemblies_deleted_at ON assemblies(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER set_assemblies_updated_at
  BEFORE UPDATE ON assemblies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Assembly Items ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS assembly_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assembly_id   UUID NOT NULL REFERENCES assemblies(id) ON DELETE CASCADE,
  company_id    UUID NOT NULL REFERENCES companies(id),
  cost_code_id  UUID,
  description   TEXT NOT NULL,
  qty_per_unit  NUMERIC(12,4) DEFAULT 1,
  unit          VARCHAR(30) DEFAULT 'each',
  unit_cost     NUMERIC(15,2) DEFAULT 0,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE assembly_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY assembly_items_tenant_isolation ON assembly_items
  USING (company_id = get_current_company_id());

CREATE INDEX idx_assembly_items_assembly_id ON assembly_items(assembly_id);
CREATE INDEX idx_assembly_items_company_id ON assembly_items(company_id);
CREATE INDEX idx_assembly_items_cost_code_id ON assembly_items(cost_code_id);

CREATE TRIGGER set_assembly_items_updated_at
  BEFORE UPDATE ON assembly_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Estimate Versions ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS estimate_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id     UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  company_id      UUID NOT NULL REFERENCES companies(id),
  version_number  INT NOT NULL,
  snapshot_json   JSONB NOT NULL DEFAULT '{}',
  change_summary  TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE estimate_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY estimate_versions_tenant_isolation ON estimate_versions
  USING (company_id = get_current_company_id());

CREATE INDEX idx_estimate_versions_estimate_id ON estimate_versions(estimate_id);
CREATE INDEX idx_estimate_versions_company_id ON estimate_versions(company_id);
CREATE INDEX idx_estimate_versions_version_number ON estimate_versions(estimate_id, version_number);
