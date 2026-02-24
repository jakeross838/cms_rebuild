-- =============================================================================
-- Module 13: AI Invoice Processing — V1 Foundation
-- =============================================================================
-- Tables: invoice_extractions, extraction_field_mappings,
--         invoice_line_extractions, extraction_rules, extraction_audit_log
-- =============================================================================

-- ── invoice_extractions ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoice_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  document_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'needs_review')),
  extracted_data JSONB DEFAULT '{}'::jsonb,
  confidence_score NUMERIC(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  vendor_match_id UUID,
  job_match_id UUID,
  matched_bill_id UUID,
  extraction_model VARCHAR(50),
  processing_time_ms INTEGER,
  error_message TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE invoice_extractions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_invoice_extractions_company_id
  ON invoice_extractions(company_id);
CREATE INDEX IF NOT EXISTS idx_invoice_extractions_document_id
  ON invoice_extractions(document_id);
CREATE INDEX IF NOT EXISTS idx_invoice_extractions_status
  ON invoice_extractions(status);
CREATE INDEX IF NOT EXISTS idx_invoice_extractions_vendor_match
  ON invoice_extractions(vendor_match_id);
CREATE INDEX IF NOT EXISTS idx_invoice_extractions_company_status
  ON invoice_extractions(company_id, status);

-- ── extraction_field_mappings ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS extraction_field_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  field_name VARCHAR(100) NOT NULL,
  extraction_path TEXT NOT NULL,
  data_type VARCHAR(20) NOT NULL DEFAULT 'string'
    CHECK (data_type IN ('string', 'number', 'date', 'currency')),
  is_required BOOLEAN NOT NULL DEFAULT false,
  default_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE extraction_field_mappings ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_extraction_field_mappings_company_id
  ON extraction_field_mappings(company_id);

-- ── invoice_line_extractions ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoice_line_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extraction_id UUID NOT NULL REFERENCES invoice_extractions(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  description TEXT,
  quantity NUMERIC(10,3),
  unit_price NUMERIC(15,2),
  amount NUMERIC(15,2),
  cost_code_match_id UUID,
  confidence_score NUMERIC(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No RLS on child table — access controlled via parent invoice_extractions
CREATE INDEX IF NOT EXISTS idx_invoice_line_extractions_extraction_id
  ON invoice_line_extractions(extraction_id);

-- ── extraction_rules ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS extraction_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  vendor_id UUID,
  rule_type VARCHAR(20) NOT NULL
    CHECK (rule_type IN ('field_mapping', 'auto_code', 'auto_approve', 'skip_review')),
  conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  actions JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE extraction_rules ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_extraction_rules_company_id
  ON extraction_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_extraction_rules_vendor_id
  ON extraction_rules(vendor_id);
CREATE INDEX IF NOT EXISTS idx_extraction_rules_company_type
  ON extraction_rules(company_id, rule_type);

-- ── extraction_audit_log ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS extraction_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extraction_id UUID NOT NULL REFERENCES invoice_extractions(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL
    CHECK (action IN ('created', 'processing', 'completed', 'failed', 'reviewed', 'approved', 'rejected', 'matched')),
  details JSONB DEFAULT '{}'::jsonb,
  performed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No RLS on audit log child table — access controlled via parent
CREATE INDEX IF NOT EXISTS idx_extraction_audit_log_extraction_id
  ON extraction_audit_log(extraction_id);
