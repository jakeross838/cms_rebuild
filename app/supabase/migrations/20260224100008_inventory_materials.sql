-- Module 52: Inventory & Materials V1 Foundation
-- Warehouse/job site inventory, receiving, transfers, consumption tracking

-- ── Location type enum ────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE inventory_location_type AS ENUM ('warehouse', 'job_site', 'vehicle', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Transaction type enum ─────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE inventory_transaction_type AS ENUM ('receive', 'transfer', 'consume', 'adjust', 'return');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Material request status enum ──────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE material_request_status AS ENUM ('draft', 'submitted', 'approved', 'partially_fulfilled', 'fulfilled', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Material request priority enum ────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE material_request_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- inventory_items — Master catalog of materials/products
-- ============================================================================
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  description TEXT,
  category VARCHAR(100),
  unit_of_measure VARCHAR(50) NOT NULL DEFAULT 'each',
  unit_cost NUMERIC(15,2) DEFAULT 0,
  reorder_point NUMERIC(10,2) DEFAULT 0,
  reorder_quantity NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_inventory_items_company ON inventory_items(company_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(company_id, sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(company_id, category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_name_trgm ON inventory_items USING gin (name gin_trgm_ops);

-- ============================================================================
-- inventory_locations — Where inventory is stored
-- ============================================================================
CREATE TABLE IF NOT EXISTS inventory_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name VARCHAR(200) NOT NULL,
  location_type inventory_location_type NOT NULL DEFAULT 'warehouse',
  address TEXT,
  job_id UUID REFERENCES jobs(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE inventory_locations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_inventory_locations_company ON inventory_locations(company_id);
CREATE INDEX IF NOT EXISTS idx_inventory_locations_job ON inventory_locations(job_id);
CREATE INDEX IF NOT EXISTS idx_inventory_locations_type ON inventory_locations(company_id, location_type);

-- ============================================================================
-- inventory_stock — Current stock levels per item per location
-- ============================================================================
CREATE TABLE IF NOT EXISTS inventory_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  item_id UUID NOT NULL REFERENCES inventory_items(id),
  location_id UUID NOT NULL REFERENCES inventory_locations(id),
  quantity_on_hand NUMERIC(10,3) NOT NULL DEFAULT 0,
  quantity_reserved NUMERIC(10,3) NOT NULL DEFAULT 0,
  quantity_available NUMERIC(10,3) NOT NULL DEFAULT 0,
  last_counted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(item_id, location_id)
);

ALTER TABLE inventory_stock ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_inventory_stock_company ON inventory_stock(company_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_item ON inventory_stock(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_location ON inventory_stock(location_id);

-- ============================================================================
-- inventory_transactions — Movement log (receive, transfer, consume, adjust, return)
-- ============================================================================
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  item_id UUID NOT NULL REFERENCES inventory_items(id),
  from_location_id UUID REFERENCES inventory_locations(id),
  to_location_id UUID REFERENCES inventory_locations(id),
  transaction_type inventory_transaction_type NOT NULL,
  quantity NUMERIC(10,3) NOT NULL,
  unit_cost NUMERIC(15,2),
  total_cost NUMERIC(15,2),
  reference_type VARCHAR(50),
  reference_id UUID,
  job_id UUID REFERENCES jobs(id),
  cost_code_id UUID REFERENCES cost_codes(id),
  notes TEXT,
  performed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_company ON inventory_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_from_loc ON inventory_transactions(from_location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_to_loc ON inventory_transactions(to_location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_job ON inventory_transactions(job_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(company_id, transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created ON inventory_transactions(company_id, created_at);

-- ============================================================================
-- material_requests — Requests for materials from field to office/warehouse
-- ============================================================================
CREATE TABLE IF NOT EXISTS material_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID REFERENCES jobs(id),
  requested_by UUID REFERENCES users(id),
  status material_request_status NOT NULL DEFAULT 'draft',
  priority material_request_priority NOT NULL DEFAULT 'normal',
  needed_by DATE,
  notes TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE material_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_material_requests_company ON material_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_material_requests_job ON material_requests(job_id);
CREATE INDEX IF NOT EXISTS idx_material_requests_status ON material_requests(company_id, status);
CREATE INDEX IF NOT EXISTS idx_material_requests_requested_by ON material_requests(requested_by);

-- ============================================================================
-- material_request_items — Line items on a material request
-- ============================================================================
CREATE TABLE IF NOT EXISTS material_request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES material_requests(id) ON DELETE CASCADE,
  item_id UUID REFERENCES inventory_items(id),
  description TEXT,
  quantity_requested NUMERIC(10,3) NOT NULL DEFAULT 0,
  quantity_fulfilled NUMERIC(10,3) NOT NULL DEFAULT 0,
  unit VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_material_request_items_request ON material_request_items(request_id);
CREATE INDEX IF NOT EXISTS idx_material_request_items_item ON material_request_items(item_id);
