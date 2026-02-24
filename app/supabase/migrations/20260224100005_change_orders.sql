-- ==========================================================================
-- Module 17: Change Order Management — V1 Foundation
-- ==========================================================================
-- Tables: change_orders, change_order_items, change_order_history
-- Multi-tenant: company_id on every table + RLS
-- Soft delete: deleted_at on change_orders
-- ==========================================================================

-- ── Change Orders ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  job_id UUID NOT NULL,
  co_number VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  change_type TEXT NOT NULL DEFAULT 'owner_requested'
    CHECK (change_type IN ('owner_requested', 'field_condition', 'design_change', 'regulatory', 'allowance', 'credit')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'voided')),
  requested_by_type TEXT DEFAULT 'builder'
    CHECK (requested_by_type IN ('builder', 'client', 'vendor')),
  requested_by_id UUID,
  amount NUMERIC(15,2) DEFAULT 0,
  cost_impact NUMERIC(15,2) DEFAULT 0,
  schedule_impact_days INT DEFAULT 0,
  approval_chain JSONB DEFAULT '[]',
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  client_approved BOOLEAN DEFAULT false,
  client_approved_at TIMESTAMPTZ,
  document_id UUID,
  budget_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- ── Change Order Items ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS change_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  change_order_id UUID NOT NULL REFERENCES change_orders(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  cost_code_id UUID,
  quantity NUMERIC(10,3) DEFAULT 1,
  unit_price NUMERIC(15,2) DEFAULT 0,
  amount NUMERIC(15,2) DEFAULT 0,
  markup_pct NUMERIC(5,2) DEFAULT 0,
  markup_amount NUMERIC(15,2) DEFAULT 0,
  total NUMERIC(15,2) DEFAULT 0,
  vendor_id UUID,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Change Order History ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS change_order_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  change_order_id UUID NOT NULL REFERENCES change_orders(id) ON DELETE CASCADE,
  action TEXT NOT NULL
    CHECK (action IN ('created', 'submitted', 'approved', 'rejected', 'voided', 'revised', 'client_approved')),
  previous_status TEXT,
  new_status TEXT,
  details JSONB DEFAULT '{}',
  performed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_order_history ENABLE ROW LEVEL SECURITY;

-- ── Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_change_orders_company_id ON change_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_job_id ON change_orders(job_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_status ON change_orders(status);
CREATE INDEX IF NOT EXISTS idx_change_orders_co_number ON change_orders(company_id, co_number);
CREATE INDEX IF NOT EXISTS idx_change_orders_created_at ON change_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_change_orders_deleted_at ON change_orders(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_change_order_items_co_id ON change_order_items(change_order_id);
CREATE INDEX IF NOT EXISTS idx_change_order_items_cost_code ON change_order_items(cost_code_id);
CREATE INDEX IF NOT EXISTS idx_change_order_items_vendor ON change_order_items(vendor_id);

CREATE INDEX IF NOT EXISTS idx_change_order_history_co_id ON change_order_history(change_order_id);
CREATE INDEX IF NOT EXISTS idx_change_order_history_action ON change_order_history(action);
