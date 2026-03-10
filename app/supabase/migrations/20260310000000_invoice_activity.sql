-- Invoice Activity Log — audit trail for invoice actions
-- Tracks uploads, status changes, approvals, payments, allocations, AI processing

CREATE TABLE IF NOT EXISTS invoice_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_invoice_activity_invoice_id ON invoice_activity(invoice_id);
CREATE INDEX idx_invoice_activity_company_id ON invoice_activity(company_id);
CREATE INDEX idx_invoice_activity_created_at ON invoice_activity(created_at DESC);

-- RLS
ALTER TABLE invoice_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_activity_select" ON invoice_activity
  FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "invoice_activity_insert" ON invoice_activity
  FOR INSERT WITH CHECK (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Add payment tracking fields to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid'
  CHECK (payment_status IN ('unpaid', 'partial', 'paid'));
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_date TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS stamped_pdf_url TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS stamped_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS review_flags TEXT[] DEFAULT '{}';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS ai_confidence JSONB;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS billable_amount NUMERIC(12,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS non_billable_reason TEXT;
