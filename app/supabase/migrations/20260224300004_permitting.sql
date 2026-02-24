-- ============================================================================
-- Module 32: Permitting & Inspections — V1 Foundation
-- Tables: permits, permit_inspections, inspection_results, permit_documents, permit_fees
-- ============================================================================

-- ── Permits ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL,
  permit_number VARCHAR(50),
  permit_type TEXT NOT NULL CHECK (permit_type IN (
    'building', 'electrical', 'plumbing', 'mechanical',
    'demolition', 'grading', 'fire', 'environmental', 'zoning', 'other'
  )),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'applied', 'issued', 'active', 'expired', 'closed', 'revoked'
  )),
  jurisdiction VARCHAR(200),
  applied_date DATE,
  issued_date DATE,
  expiration_date DATE,
  conditions TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_permits_company_id ON permits(company_id);
CREATE INDEX idx_permits_job_id ON permits(job_id);
CREATE INDEX idx_permits_status ON permits(status);
CREATE INDEX idx_permits_permit_type ON permits(permit_type);
CREATE INDEX idx_permits_company_status ON permits(company_id, status);
CREATE INDEX idx_permits_company_job ON permits(company_id, job_id);
CREATE INDEX idx_permits_expiration_date ON permits(expiration_date);
CREATE INDEX idx_permits_deleted_at ON permits(deleted_at) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;
CREATE POLICY permits_company_isolation ON permits
  USING (company_id = get_current_company_id());

-- updated_at trigger
CREATE TRIGGER set_permits_updated_at
  BEFORE UPDATE ON permits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Permit Inspections ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS permit_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  permit_id UUID NOT NULL REFERENCES permits(id) ON DELETE CASCADE,
  job_id UUID NOT NULL,
  inspection_type TEXT NOT NULL CHECK (inspection_type IN (
    'rough_in', 'final', 'foundation', 'framing', 'electrical',
    'plumbing', 'mechanical', 'fire', 'other'
  )),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'passed', 'failed', 'conditional', 'cancelled', 'no_show'
  )),
  scheduled_date DATE,
  scheduled_time VARCHAR(20),
  inspector_name VARCHAR(200),
  inspector_phone VARCHAR(50),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  is_reinspection BOOLEAN NOT NULL DEFAULT false,
  original_inspection_id UUID REFERENCES permit_inspections(id),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_permit_inspections_company_id ON permit_inspections(company_id);
CREATE INDEX idx_permit_inspections_permit_id ON permit_inspections(permit_id);
CREATE INDEX idx_permit_inspections_job_id ON permit_inspections(job_id);
CREATE INDEX idx_permit_inspections_status ON permit_inspections(status);
CREATE INDEX idx_permit_inspections_inspection_type ON permit_inspections(inspection_type);
CREATE INDEX idx_permit_inspections_scheduled_date ON permit_inspections(scheduled_date);
CREATE INDEX idx_permit_inspections_company_status ON permit_inspections(company_id, status);
CREATE INDEX idx_permit_inspections_company_job ON permit_inspections(company_id, job_id);

-- RLS
ALTER TABLE permit_inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY permit_inspections_company_isolation ON permit_inspections
  USING (company_id = get_current_company_id());

-- updated_at trigger
CREATE TRIGGER set_permit_inspections_updated_at
  BEFORE UPDATE ON permit_inspections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Inspection Results ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inspection_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  inspection_id UUID NOT NULL REFERENCES permit_inspections(id) ON DELETE CASCADE,
  result TEXT NOT NULL CHECK (result IN (
    'pass', 'fail', 'conditional'
  )),
  result_notes TEXT,
  deficiencies JSONB NOT NULL DEFAULT '[]'::jsonb,
  conditions_to_satisfy TEXT,
  inspector_comments TEXT,
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_first_time_pass BOOLEAN,
  responsible_vendor_id UUID,
  recorded_by UUID,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_inspection_results_company_id ON inspection_results(company_id);
CREATE INDEX idx_inspection_results_inspection_id ON inspection_results(inspection_id);
CREATE INDEX idx_inspection_results_result ON inspection_results(result);
CREATE INDEX idx_inspection_results_company_result ON inspection_results(company_id, result);

-- RLS
ALTER TABLE inspection_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY inspection_results_company_isolation ON inspection_results
  USING (company_id = get_current_company_id());

-- updated_at trigger
CREATE TRIGGER set_inspection_results_updated_at
  BEFORE UPDATE ON inspection_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Permit Documents ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS permit_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  permit_id UUID NOT NULL REFERENCES permits(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  description TEXT,
  uploaded_by UUID,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_permit_documents_company_id ON permit_documents(company_id);
CREATE INDEX idx_permit_documents_permit_id ON permit_documents(permit_id);
CREATE INDEX idx_permit_documents_document_type ON permit_documents(document_type);

-- RLS
ALTER TABLE permit_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY permit_documents_company_isolation ON permit_documents
  USING (company_id = get_current_company_id());

-- ── Permit Fees ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS permit_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  permit_id UUID NOT NULL REFERENCES permits(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'paid', 'waived', 'refunded'
  )),
  due_date DATE,
  paid_date DATE,
  paid_by UUID,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_permit_fees_company_id ON permit_fees(company_id);
CREATE INDEX idx_permit_fees_permit_id ON permit_fees(permit_id);
CREATE INDEX idx_permit_fees_status ON permit_fees(status);
CREATE INDEX idx_permit_fees_company_status ON permit_fees(company_id, status);

-- RLS
ALTER TABLE permit_fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY permit_fees_company_isolation ON permit_fees
  USING (company_id = get_current_company_id());

-- updated_at trigger
CREATE TRIGGER set_permit_fees_updated_at
  BEFORE UPDATE ON permit_fees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
