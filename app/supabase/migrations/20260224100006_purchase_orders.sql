-- =============================================================================
-- Module 18: Purchase Orders — V1 Foundation
-- =============================================================================
-- Tables: purchase_orders, purchase_order_lines, po_receipts, po_receipt_lines
-- =============================================================================

-- ── purchase_orders ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  po_number VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft'
    CHECK (status IN (
      'draft', 'pending_approval', 'approved', 'sent',
      'partially_received', 'received', 'closed', 'voided'
    )),
  subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  shipping_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  budget_id UUID,
  cost_code_id UUID,
  delivery_date DATE,
  shipping_address TEXT,
  terms TEXT,
  notes TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_purchase_orders_company_id
  ON purchase_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_job_id
  ON purchase_orders(job_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor_id
  ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status
  ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_po_number
  ON purchase_orders(po_number);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_company_status
  ON purchase_orders(company_id, status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_company_job
  ON purchase_orders(company_id, job_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_deleted_at
  ON purchase_orders(deleted_at);

-- ── purchase_order_lines ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,3) NOT NULL DEFAULT 1,
  unit VARCHAR(20) DEFAULT 'each',
  unit_price NUMERIC(15,2) NOT NULL DEFAULT 0,
  amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  received_quantity NUMERIC(10,3) NOT NULL DEFAULT 0,
  cost_code_id UUID,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchase_order_lines_po_id
  ON purchase_order_lines(po_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_lines_cost_code_id
  ON purchase_order_lines(cost_code_id);

-- ── po_receipts ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS po_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  received_by UUID REFERENCES users(id),
  notes TEXT,
  document_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE po_receipts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_po_receipts_po_id
  ON po_receipts(po_id);
CREATE INDEX IF NOT EXISTS idx_po_receipts_company_id
  ON po_receipts(company_id);

-- ── po_receipt_lines ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS po_receipt_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES po_receipts(id) ON DELETE CASCADE,
  po_line_id UUID NOT NULL REFERENCES purchase_order_lines(id),
  quantity_received NUMERIC(10,3) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_po_receipt_lines_receipt_id
  ON po_receipt_lines(receipt_id);
CREATE INDEX IF NOT EXISTS idx_po_receipt_lines_po_line_id
  ON po_receipt_lines(po_line_id);
