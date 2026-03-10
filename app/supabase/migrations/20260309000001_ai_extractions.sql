CREATE TABLE IF NOT EXISTS invoice_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'extracted', 'review', 'confirmed', 'failed')),
  source_type TEXT NOT NULL DEFAULT 'upload'
    CHECK (source_type IN ('upload', 'email', 'api')),
  original_filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'application/pdf',
  extracted_data JSONB,
  confidence_scores JSONB,
  raw_text TEXT,
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  processing_duration_ms INTEGER,
  error_message TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  corrections JSONB,
  invoice_id UUID REFERENCES invoices(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_extractions_company ON invoice_extractions(company_id);
CREATE INDEX IF NOT EXISTS idx_extractions_status ON invoice_extractions(company_id, status);
CREATE INDEX IF NOT EXISTS idx_extractions_invoice ON invoice_extractions(invoice_id) WHERE invoice_id IS NOT NULL;

ALTER TABLE invoice_extractions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "extractions_tenant" ON invoice_extractions FOR ALL
  USING (company_id = public.get_current_company_id());
