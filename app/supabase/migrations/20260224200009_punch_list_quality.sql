-- ==========================================================================
-- Module 28: Punch List & Quality Checklists — V1 Foundation
-- ==========================================================================
-- Tables: punch_items, punch_item_photos, quality_checklists,
--         quality_checklist_items, quality_checklist_templates,
--         quality_checklist_template_items
-- Multi-tenant: company_id on every table + RLS
-- Soft delete: deleted_at on punch_items and quality_checklists
-- ==========================================================================

-- ── punch_items ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS punch_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID NOT NULL REFERENCES companies(id),
  job_id              UUID NOT NULL,
  title               VARCHAR(255) NOT NULL,
  description         TEXT,
  location            VARCHAR(200),
  room                VARCHAR(100),
  status              TEXT NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open','in_progress','completed','verified','disputed')),
  priority            TEXT NOT NULL DEFAULT 'normal'
                        CHECK (priority IN ('low','normal','high','critical')),
  category            TEXT
                        CHECK (category IN ('structural','electrical','plumbing','hvac','finish','paint','flooring','cabinets','countertops','fixtures','appliances','exterior','landscaping','other')),
  assigned_to         UUID,
  assigned_vendor_id  UUID,
  due_date            DATE,
  completed_at        TIMESTAMPTZ,
  verified_by         UUID,
  verified_at         TIMESTAMPTZ,
  cost_estimate       NUMERIC(15,2),
  created_by          UUID,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at          TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_punch_items_company_id ON punch_items(company_id);
CREATE INDEX idx_punch_items_job_id ON punch_items(job_id);
CREATE INDEX idx_punch_items_status ON punch_items(status);
CREATE INDEX idx_punch_items_priority ON punch_items(priority);
CREATE INDEX idx_punch_items_category ON punch_items(category);
CREATE INDEX idx_punch_items_assigned_to ON punch_items(assigned_to);
CREATE INDEX idx_punch_items_assigned_vendor_id ON punch_items(assigned_vendor_id);
CREATE INDEX idx_punch_items_due_date ON punch_items(due_date);
CREATE INDEX idx_punch_items_company_status ON punch_items(company_id, status);
CREATE INDEX idx_punch_items_company_job ON punch_items(company_id, job_id);
CREATE INDEX idx_punch_items_deleted_at ON punch_items(deleted_at) WHERE deleted_at IS NOT NULL;

-- RLS
ALTER TABLE punch_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY punch_items_tenant_isolation ON punch_items
  USING (company_id = get_current_company_id());

-- updated_at trigger
CREATE TRIGGER set_punch_items_updated_at
  BEFORE UPDATE ON punch_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ── punch_item_photos ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS punch_item_photos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  punch_item_id   UUID NOT NULL REFERENCES punch_items(id) ON DELETE CASCADE,
  photo_url       TEXT NOT NULL,
  caption         VARCHAR(255),
  photo_type      TEXT NOT NULL DEFAULT 'issue'
                    CHECK (photo_type IN ('before','after','issue')),
  uploaded_by     UUID,
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_punch_item_photos_company_id ON punch_item_photos(company_id);
CREATE INDEX idx_punch_item_photos_punch_item_id ON punch_item_photos(punch_item_id);

-- RLS
ALTER TABLE punch_item_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY punch_item_photos_tenant_isolation ON punch_item_photos
  USING (company_id = get_current_company_id());

-- ── quality_checklist_templates ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quality_checklist_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id),
  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  category      TEXT,
  trade         VARCHAR(100),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  is_system     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_qc_templates_company_id ON quality_checklist_templates(company_id);
CREATE INDEX idx_qc_templates_category ON quality_checklist_templates(category);
CREATE INDEX idx_qc_templates_trade ON quality_checklist_templates(trade);
CREATE INDEX idx_qc_templates_active ON quality_checklist_templates(company_id, is_active);

-- RLS
ALTER TABLE quality_checklist_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY qc_templates_tenant_isolation ON quality_checklist_templates
  USING (company_id = get_current_company_id());

-- updated_at trigger
CREATE TRIGGER set_qc_templates_updated_at
  BEFORE UPDATE ON quality_checklist_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ── quality_checklist_template_items ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quality_checklist_template_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id),
  template_id   UUID NOT NULL REFERENCES quality_checklist_templates(id) ON DELETE CASCADE,
  description   TEXT NOT NULL,
  category      TEXT,
  sort_order    INT NOT NULL DEFAULT 0,
  is_required   BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_qc_template_items_company_id ON quality_checklist_template_items(company_id);
CREATE INDEX idx_qc_template_items_template_id ON quality_checklist_template_items(template_id);

-- RLS
ALTER TABLE quality_checklist_template_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY qc_template_items_tenant_isolation ON quality_checklist_template_items
  USING (company_id = get_current_company_id());

-- updated_at trigger
CREATE TRIGGER set_qc_template_items_updated_at
  BEFORE UPDATE ON quality_checklist_template_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ── quality_checklists ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quality_checklists (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  job_id          UUID NOT NULL,
  template_id     UUID REFERENCES quality_checklist_templates(id),
  name            VARCHAR(200) NOT NULL,
  description     TEXT,
  status          TEXT NOT NULL DEFAULT 'not_started'
                    CHECK (status IN ('not_started','in_progress','completed','approved')),
  inspector_id    UUID,
  inspection_date DATE,
  location        VARCHAR(200),
  total_items     INT NOT NULL DEFAULT 0,
  passed_items    INT NOT NULL DEFAULT 0,
  failed_items    INT NOT NULL DEFAULT 0,
  na_items        INT NOT NULL DEFAULT 0,
  completed_at    TIMESTAMPTZ,
  approved_by     UUID,
  approved_at     TIMESTAMPTZ,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_qc_checklists_company_id ON quality_checklists(company_id);
CREATE INDEX idx_qc_checklists_job_id ON quality_checklists(job_id);
CREATE INDEX idx_qc_checklists_template_id ON quality_checklists(template_id);
CREATE INDEX idx_qc_checklists_status ON quality_checklists(status);
CREATE INDEX idx_qc_checklists_inspector_id ON quality_checklists(inspector_id);
CREATE INDEX idx_qc_checklists_company_status ON quality_checklists(company_id, status);
CREATE INDEX idx_qc_checklists_company_job ON quality_checklists(company_id, job_id);
CREATE INDEX idx_qc_checklists_deleted_at ON quality_checklists(deleted_at) WHERE deleted_at IS NOT NULL;

-- RLS
ALTER TABLE quality_checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY qc_checklists_tenant_isolation ON quality_checklists
  USING (company_id = get_current_company_id());

-- updated_at trigger
CREATE TRIGGER set_qc_checklists_updated_at
  BEFORE UPDATE ON quality_checklists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ── quality_checklist_items ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quality_checklist_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id),
  checklist_id  UUID NOT NULL REFERENCES quality_checklists(id) ON DELETE CASCADE,
  description   TEXT NOT NULL,
  result        TEXT DEFAULT 'not_inspected'
                  CHECK (result IN ('pass','fail','na','not_inspected')),
  notes         TEXT,
  photo_url     TEXT,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_qc_items_company_id ON quality_checklist_items(company_id);
CREATE INDEX idx_qc_items_checklist_id ON quality_checklist_items(checklist_id);

-- RLS
ALTER TABLE quality_checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY qc_items_tenant_isolation ON quality_checklist_items
  USING (company_id = get_current_company_id());

-- updated_at trigger
CREATE TRIGGER set_qc_items_updated_at
  BEFORE UPDATE ON quality_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
