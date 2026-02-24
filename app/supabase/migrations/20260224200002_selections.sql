-- ==========================================================================
-- Module 21: Selection Management — V1 Foundation
-- ==========================================================================
-- Tables: selection_categories, selection_options, selections, selection_history
-- Multi-tenant: company_id on every table + RLS
-- Soft delete: deleted_at on selection_categories, selection_options, selections
-- ==========================================================================

-- ── Selection Categories ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS selection_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  job_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  room VARCHAR(200),
  sort_order INT DEFAULT 0,
  pricing_model TEXT NOT NULL DEFAULT 'allowance'
    CHECK (pricing_model IN ('allowance', 'fixed', 'cost_plus')),
  allowance_amount NUMERIC(15,2) DEFAULT 0,
  deadline DATE,
  lead_time_buffer_days INT DEFAULT 0,
  assigned_to UUID,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'presented', 'selected', 'approved', 'ordered', 'received', 'installed', 'on_hold', 'cancelled')),
  designer_access BOOLEAN DEFAULT false,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- ── Selection Options ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS selection_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  category_id UUID NOT NULL REFERENCES selection_categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  vendor_id UUID,
  sku VARCHAR(100),
  model_number VARCHAR(100),
  unit_price NUMERIC(15,2) DEFAULT 0,
  quantity NUMERIC(10,3) DEFAULT 1,
  total_price NUMERIC(15,2) DEFAULT 0,
  lead_time_days INT DEFAULT 0,
  availability_status VARCHAR(100),
  source TEXT NOT NULL DEFAULT 'builder'
    CHECK (source IN ('builder', 'designer', 'client', 'catalog')),
  is_recommended BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- ── Selections (actual selection records) ────────────────────────────────

CREATE TABLE IF NOT EXISTS selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  category_id UUID NOT NULL REFERENCES selection_categories(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES selection_options(id) ON DELETE CASCADE,
  job_id UUID NOT NULL,
  room VARCHAR(200),
  selected_by UUID,
  selected_at TIMESTAMPTZ,
  confirmed_by UUID,
  confirmed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'selected'
    CHECK (status IN ('pending', 'presented', 'selected', 'approved', 'ordered', 'received', 'installed', 'on_hold', 'cancelled')),
  change_reason TEXT,
  superseded_by UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- ── Selection History ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS selection_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  category_id UUID NOT NULL REFERENCES selection_categories(id) ON DELETE CASCADE,
  option_id UUID,
  action TEXT NOT NULL
    CHECK (action IN ('viewed', 'considered', 'selected', 'deselected', 'changed')),
  actor_id UUID,
  actor_role VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── RLS ──────────────────────────────────────────────────────────────────

ALTER TABLE selection_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE selection_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE selection_history ENABLE ROW LEVEL SECURITY;

-- ── Indexes ──────────────────────────────────────────────────────────────

-- selection_categories
CREATE INDEX IF NOT EXISTS idx_selection_categories_company_id ON selection_categories(company_id);
CREATE INDEX IF NOT EXISTS idx_selection_categories_job_id ON selection_categories(job_id);
CREATE INDEX IF NOT EXISTS idx_selection_categories_status ON selection_categories(status);
CREATE INDEX IF NOT EXISTS idx_selection_categories_room ON selection_categories(room);
CREATE INDEX IF NOT EXISTS idx_selection_categories_company_job ON selection_categories(company_id, job_id);
CREATE INDEX IF NOT EXISTS idx_selection_categories_deleted_at ON selection_categories(deleted_at) WHERE deleted_at IS NULL;

-- selection_options
CREATE INDEX IF NOT EXISTS idx_selection_options_company_id ON selection_options(company_id);
CREATE INDEX IF NOT EXISTS idx_selection_options_category_id ON selection_options(category_id);
CREATE INDEX IF NOT EXISTS idx_selection_options_vendor_id ON selection_options(vendor_id);
CREATE INDEX IF NOT EXISTS idx_selection_options_source ON selection_options(source);
CREATE INDEX IF NOT EXISTS idx_selection_options_deleted_at ON selection_options(deleted_at) WHERE deleted_at IS NULL;

-- selections
CREATE INDEX IF NOT EXISTS idx_selections_company_id ON selections(company_id);
CREATE INDEX IF NOT EXISTS idx_selections_category_id ON selections(category_id);
CREATE INDEX IF NOT EXISTS idx_selections_option_id ON selections(option_id);
CREATE INDEX IF NOT EXISTS idx_selections_job_id ON selections(job_id);
CREATE INDEX IF NOT EXISTS idx_selections_status ON selections(status);
CREATE INDEX IF NOT EXISTS idx_selections_company_job ON selections(company_id, job_id);
CREATE INDEX IF NOT EXISTS idx_selections_deleted_at ON selections(deleted_at) WHERE deleted_at IS NULL;

-- selection_history
CREATE INDEX IF NOT EXISTS idx_selection_history_company_id ON selection_history(company_id);
CREATE INDEX IF NOT EXISTS idx_selection_history_category_id ON selection_history(category_id);
CREATE INDEX IF NOT EXISTS idx_selection_history_action ON selection_history(action);
CREATE INDEX IF NOT EXISTS idx_selection_history_created_at ON selection_history(created_at DESC);

-- ── Updated_at Trigger ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_selections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_selection_categories_updated_at
  BEFORE UPDATE ON selection_categories
  FOR EACH ROW EXECUTE FUNCTION update_selections_updated_at();

CREATE TRIGGER trg_selection_options_updated_at
  BEFORE UPDATE ON selection_options
  FOR EACH ROW EXECUTE FUNCTION update_selections_updated_at();

CREATE TRIGGER trg_selections_updated_at
  BEFORE UPDATE ON selections
  FOR EACH ROW EXECUTE FUNCTION update_selections_updated_at();
