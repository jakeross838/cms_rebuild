-- Module 15: Draw Requests — V1 Foundation
-- AIA G702/G703 format draw request management for construction financing

-- ============================================================================
-- draw_requests — Main draw request (payment application) table
-- ============================================================================

CREATE TABLE IF NOT EXISTS draw_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  draw_number INTEGER NOT NULL,
  application_date DATE NOT NULL,
  period_to DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_review', 'approved', 'submitted_to_lender', 'funded', 'rejected')),
  contract_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_completed NUMERIC(15,2) NOT NULL DEFAULT 0,
  retainage_pct NUMERIC(5,2) NOT NULL DEFAULT 10,
  retainage_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_earned NUMERIC(15,2) NOT NULL DEFAULT 0,
  less_previous NUMERIC(15,2) NOT NULL DEFAULT 0,
  current_due NUMERIC(15,2) NOT NULL DEFAULT 0,
  balance_to_finish NUMERIC(15,2) NOT NULL DEFAULT 0,
  submitted_by UUID REFERENCES users(id),
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  lender_reference VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE draw_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_draw_requests_company_id ON draw_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_draw_requests_job_id ON draw_requests(job_id);
CREATE INDEX IF NOT EXISTS idx_draw_requests_status ON draw_requests(company_id, status);
CREATE INDEX IF NOT EXISTS idx_draw_requests_draw_number ON draw_requests(company_id, job_id, draw_number);

-- ============================================================================
-- draw_request_lines — G703 continuation sheet line items
-- ============================================================================

CREATE TABLE IF NOT EXISTS draw_request_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_request_id UUID NOT NULL REFERENCES draw_requests(id) ON DELETE CASCADE,
  cost_code_id UUID REFERENCES cost_codes(id),
  description TEXT NOT NULL DEFAULT '',
  scheduled_value NUMERIC(15,2) NOT NULL DEFAULT 0,
  previous_applications NUMERIC(15,2) NOT NULL DEFAULT 0,
  current_work NUMERIC(15,2) NOT NULL DEFAULT 0,
  materials_stored NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_completed NUMERIC(15,2) NOT NULL DEFAULT 0,
  pct_complete NUMERIC(5,2) NOT NULL DEFAULT 0
    CHECK (pct_complete >= 0 AND pct_complete <= 100),
  balance_to_finish NUMERIC(15,2) NOT NULL DEFAULT 0,
  retainage NUMERIC(15,2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No independent RLS — access controlled via parent draw_request
CREATE INDEX IF NOT EXISTS idx_draw_request_lines_draw_id ON draw_request_lines(draw_request_id);
CREATE INDEX IF NOT EXISTS idx_draw_request_lines_cost_code ON draw_request_lines(cost_code_id);

-- ============================================================================
-- draw_request_history — Audit trail for draw request lifecycle
-- ============================================================================

CREATE TABLE IF NOT EXISTS draw_request_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_request_id UUID NOT NULL REFERENCES draw_requests(id) ON DELETE CASCADE,
  action VARCHAR(30) NOT NULL
    CHECK (action IN ('created', 'submitted', 'approved', 'rejected', 'funded', 'revised')),
  details JSONB DEFAULT '{}',
  performed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No independent RLS — access controlled via parent draw_request
CREATE INDEX IF NOT EXISTS idx_draw_request_history_draw_id ON draw_request_history(draw_request_id);
CREATE INDEX IF NOT EXISTS idx_draw_request_history_action ON draw_request_history(action);
