-- ============================================================================
-- Module 14: Lien Waiver Management — V1 Foundation
-- ============================================================================
-- Tables: lien_waivers, lien_waiver_templates, lien_waiver_tracking
-- Multi-tenant: company_id on all tables, RLS enabled
-- Soft delete: deleted_at on lien_waivers
-- ============================================================================

-- ============================================================================
-- 1. lien_waivers — Core waiver records
-- ============================================================================

CREATE TABLE IF NOT EXISTS lien_waivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  vendor_id UUID REFERENCES vendors(id),
  waiver_type TEXT NOT NULL CHECK (waiver_type IN (
    'conditional_progress', 'unconditional_progress',
    'conditional_final', 'unconditional_final'
  )),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending', 'sent', 'received', 'approved', 'rejected'
  )),
  amount NUMERIC(15,2),
  through_date DATE,
  document_id UUID,
  payment_id UUID,
  check_number VARCHAR(50),
  claimant_name TEXT,
  notes TEXT,
  requested_by UUID,
  requested_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE lien_waivers ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_lien_waivers_company_id ON lien_waivers(company_id);
CREATE INDEX IF NOT EXISTS idx_lien_waivers_job_id ON lien_waivers(job_id);
CREATE INDEX IF NOT EXISTS idx_lien_waivers_vendor_id ON lien_waivers(vendor_id);
CREATE INDEX IF NOT EXISTS idx_lien_waivers_status ON lien_waivers(company_id, status);
CREATE INDEX IF NOT EXISTS idx_lien_waivers_waiver_type ON lien_waivers(company_id, waiver_type);
CREATE INDEX IF NOT EXISTS idx_lien_waivers_through_date ON lien_waivers(company_id, through_date);

-- ============================================================================
-- 2. lien_waiver_templates — Reusable waiver form templates
-- ============================================================================

CREATE TABLE IF NOT EXISTS lien_waiver_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  waiver_type TEXT NOT NULL CHECK (waiver_type IN (
    'conditional_progress', 'unconditional_progress',
    'conditional_final', 'unconditional_final'
  )),
  template_name VARCHAR(200) NOT NULL,
  template_content TEXT,
  state_code VARCHAR(2),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE lien_waiver_templates ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_lien_waiver_templates_company_id ON lien_waiver_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_lien_waiver_templates_waiver_type ON lien_waiver_templates(company_id, waiver_type);
CREATE INDEX IF NOT EXISTS idx_lien_waiver_templates_state ON lien_waiver_templates(company_id, state_code);

-- ============================================================================
-- 3. lien_waiver_tracking — Compliance tracking per vendor per period
-- ============================================================================

CREATE TABLE IF NOT EXISTS lien_waiver_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  vendor_id UUID REFERENCES vendors(id),
  period_start DATE,
  period_end DATE,
  expected_amount NUMERIC(15,2),
  waiver_id UUID REFERENCES lien_waivers(id),
  is_compliant BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE lien_waiver_tracking ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_lien_waiver_tracking_company_id ON lien_waiver_tracking(company_id);
CREATE INDEX IF NOT EXISTS idx_lien_waiver_tracking_job_id ON lien_waiver_tracking(company_id, job_id);
CREATE INDEX IF NOT EXISTS idx_lien_waiver_tracking_vendor_id ON lien_waiver_tracking(company_id, vendor_id);
CREATE INDEX IF NOT EXISTS idx_lien_waiver_tracking_compliance ON lien_waiver_tracking(company_id, is_compliant);
