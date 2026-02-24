-- ==========================================================================
-- Module 23: Price Intelligence — V1 Foundation
-- ==========================================================================
-- Tables: master_items, vendor_item_prices, price_history,
--         labor_rates, labor_rate_history
-- Multi-tenant: company_id on every table + RLS
-- Soft delete: deleted_at on master_items and labor_rates
-- ==========================================================================

-- ── Master Items (Material Catalog) ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS master_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other'
    CHECK (category IN ('lumber', 'electrical', 'plumbing', 'hvac', 'roofing', 'flooring', 'paint', 'hardware', 'concrete', 'insulation', 'drywall', 'fixtures', 'appliances', 'other')),
  unit_of_measure TEXT NOT NULL DEFAULT 'each'
    CHECK (unit_of_measure IN ('each', 'linear_ft', 'sq_ft', 'cu_yd', 'ton', 'gallon', 'bundle', 'box', 'sheet', 'roll', 'bag', 'pair')),
  default_unit_price NUMERIC(12,2) DEFAULT 0,
  sku VARCHAR(100),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- ── Vendor Item Prices ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendor_item_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  master_item_id UUID NOT NULL REFERENCES master_items(id) ON DELETE CASCADE,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  lead_time_days INT,
  min_order_qty NUMERIC(10,3),
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Price History ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  master_item_id UUID NOT NULL REFERENCES master_items(id) ON DELETE CASCADE,
  vendor_id UUID,
  old_price NUMERIC(12,2),
  new_price NUMERIC(12,2) NOT NULL,
  change_pct NUMERIC(8,2),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Labor Rates ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS labor_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  trade VARCHAR(100) NOT NULL,
  skill_level TEXT NOT NULL DEFAULT 'journeyman'
    CHECK (skill_level IN ('apprentice', 'journeyman', 'master', 'foreman')),
  hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  overtime_rate NUMERIC(10,2),
  region VARCHAR(100),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- ── Labor Rate History ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS labor_rate_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  labor_rate_id UUID NOT NULL REFERENCES labor_rates(id) ON DELETE CASCADE,
  old_rate NUMERIC(10,2),
  new_rate NUMERIC(10,2) NOT NULL,
  change_pct NUMERIC(8,2),
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── RLS ─────────────────────────────────────────────────────────────────

ALTER TABLE master_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_item_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_rate_history ENABLE ROW LEVEL SECURITY;

-- ── Indexes ─────────────────────────────────────────────────────────────

-- master_items
CREATE INDEX IF NOT EXISTS idx_master_items_company_id ON master_items(company_id);
CREATE INDEX IF NOT EXISTS idx_master_items_category ON master_items(category);
CREATE INDEX IF NOT EXISTS idx_master_items_deleted_at ON master_items(deleted_at) WHERE deleted_at IS NULL;

-- vendor_item_prices
CREATE INDEX IF NOT EXISTS idx_vendor_item_prices_company_id ON vendor_item_prices(company_id);
CREATE INDEX IF NOT EXISTS idx_vendor_item_prices_vendor_id ON vendor_item_prices(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_item_prices_master_item_id ON vendor_item_prices(master_item_id);
CREATE INDEX IF NOT EXISTS idx_vendor_item_prices_effective_date ON vendor_item_prices(effective_date DESC);

-- price_history
CREATE INDEX IF NOT EXISTS idx_price_history_company_id ON price_history(company_id);
CREATE INDEX IF NOT EXISTS idx_price_history_master_item_id ON price_history(master_item_id);
CREATE INDEX IF NOT EXISTS idx_price_history_vendor_id ON price_history(vendor_id);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at ON price_history(recorded_at DESC);

-- labor_rates
CREATE INDEX IF NOT EXISTS idx_labor_rates_company_id ON labor_rates(company_id);
CREATE INDEX IF NOT EXISTS idx_labor_rates_trade ON labor_rates(trade);
CREATE INDEX IF NOT EXISTS idx_labor_rates_skill_level ON labor_rates(skill_level);
CREATE INDEX IF NOT EXISTS idx_labor_rates_deleted_at ON labor_rates(deleted_at) WHERE deleted_at IS NULL;

-- labor_rate_history
CREATE INDEX IF NOT EXISTS idx_labor_rate_history_company_id ON labor_rate_history(company_id);
CREATE INDEX IF NOT EXISTS idx_labor_rate_history_labor_rate_id ON labor_rate_history(labor_rate_id);
CREATE INDEX IF NOT EXISTS idx_labor_rate_history_effective_date ON labor_rate_history(effective_date DESC);

-- ── Updated-at trigger ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_master_items_updated_at
  BEFORE UPDATE ON master_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_vendor_item_prices_updated_at
  BEFORE UPDATE ON vendor_item_prices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_labor_rates_updated_at
  BEFORE UPDATE ON labor_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
