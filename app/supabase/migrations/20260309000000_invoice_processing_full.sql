-- ============================================================================
-- Invoice Processing Full Build
-- Adds: line items, allocations, approvals, disputes, retainage,
--        duplicate detection, AI extraction support
-- ============================================================================

-- ── 1. Add missing columns to invoices table ──────────────────────────────

-- Invoice type and contract type
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_type TEXT DEFAULT 'standard'
  CHECK (invoice_type IN ('standard', 'progress', 'final', 'credit_memo', 'retainage_release'));

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'lump_sum'
  CHECK (contract_type IN ('lump_sum', 'time_materials', 'unit_price', 'cost_plus'));

-- Financial fields
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(15,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS retainage_percent NUMERIC(5,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS retainage_amount NUMERIC(15,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS net_amount NUMERIC(15,2);

-- PO and cost code linking
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS po_id UUID REFERENCES purchase_orders(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cost_code_id UUID REFERENCES cost_codes(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS change_order_id UUID;

-- Payment tracking
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT 'Net 30';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method TEXT
  CHECK (payment_method IN ('check', 'ach', 'wire', 'credit_card', 'cash', 'other'));
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_date DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(15,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Approval tracking
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS current_approval_step TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Draw linkage
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS draw_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS draw_number INTEGER;

-- Lien waiver tracking
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS lien_waiver_status TEXT DEFAULT 'not_required'
  CHECK (lien_waiver_status IN ('not_required', 'required', 'pending', 'received'));

-- AI fields
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS ai_confidence NUMERIC(5,4);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS ai_notes TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_auto_coded BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS extraction_id UUID;

-- Duplicate detection
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS duplicate_hash TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS duplicate_of_id UUID REFERENCES invoices(id);

-- PDF stamping
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS stamped_pdf_url TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS stamped_at TIMESTAMPTZ;

-- Description
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS description TEXT;

-- Soft delete
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Created by
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

-- Progress billing fields
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS billing_period_start DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS billing_period_end DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS percent_complete NUMERIC(5,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cumulative_billed NUMERIC(15,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS contract_value NUMERIC(15,2);

-- ── 2. Invoice Line Items ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,3) NOT NULL DEFAULT 1,
  unit TEXT DEFAULT 'each',
  unit_price NUMERIC(15,2) NOT NULL DEFAULT 0,
  amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  cost_code_id UUID REFERENCES cost_codes(id),
  cost_code_label TEXT,
  phase TEXT,
  job_id UUID REFERENCES jobs(id),
  po_line_id UUID,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_cost_code ON invoice_line_items(cost_code_id) WHERE cost_code_id IS NOT NULL;

ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_line_items_tenant_select" ON invoice_line_items FOR SELECT
  USING (invoice_id IN (SELECT id FROM invoices WHERE company_id = public.get_current_company_id()));

CREATE POLICY "invoice_line_items_tenant_insert" ON invoice_line_items FOR INSERT
  WITH CHECK (invoice_id IN (SELECT id FROM invoices WHERE company_id = public.get_current_company_id()));

CREATE POLICY "invoice_line_items_tenant_update" ON invoice_line_items FOR UPDATE
  USING (invoice_id IN (SELECT id FROM invoices WHERE company_id = public.get_current_company_id()));

CREATE POLICY "invoice_line_items_tenant_delete" ON invoice_line_items FOR DELETE
  USING (invoice_id IN (SELECT id FROM invoices WHERE company_id = public.get_current_company_id()));

-- ── 3. Invoice Allocations (split coding across cost codes/jobs) ──────────

CREATE TABLE IF NOT EXISTS invoice_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id),
  cost_code_id UUID REFERENCES cost_codes(id),
  phase TEXT,
  amount NUMERIC(15,2) NOT NULL,
  percent NUMERIC(5,2),
  po_id UUID REFERENCES purchase_orders(id),
  change_order_id UUID,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_allocations_invoice ON invoice_allocations(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_allocations_job ON invoice_allocations(job_id) WHERE job_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoice_allocations_cost_code ON invoice_allocations(cost_code_id) WHERE cost_code_id IS NOT NULL;

ALTER TABLE invoice_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_allocations_tenant_select" ON invoice_allocations FOR SELECT
  USING (invoice_id IN (SELECT id FROM invoices WHERE company_id = public.get_current_company_id()));

CREATE POLICY "invoice_allocations_tenant_insert" ON invoice_allocations FOR INSERT
  WITH CHECK (invoice_id IN (SELECT id FROM invoices WHERE company_id = public.get_current_company_id()));

CREATE POLICY "invoice_allocations_tenant_update" ON invoice_allocations FOR UPDATE
  USING (invoice_id IN (SELECT id FROM invoices WHERE company_id = public.get_current_company_id()));

CREATE POLICY "invoice_allocations_tenant_delete" ON invoice_allocations FOR DELETE
  USING (invoice_id IN (SELECT id FROM invoices WHERE company_id = public.get_current_company_id()));

-- ── 4. Invoice Approvals ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS invoice_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL DEFAULT 1,
  required_role TEXT,
  threshold_min NUMERIC(15,2),
  threshold_max NUMERIC(15,2),
  assigned_to UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'delegated', 'skipped', 'escalated')),
  action_by UUID REFERENCES users(id),
  action_at TIMESTAMPTZ,
  action_notes TEXT,
  delegated_to UUID REFERENCES users(id),
  escalated_at TIMESTAMPTZ,
  escalation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_approvals_invoice ON invoice_approvals(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_approvals_assigned ON invoice_approvals(assigned_to) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_invoice_approvals_status ON invoice_approvals(status);

ALTER TABLE invoice_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_approvals_tenant_select" ON invoice_approvals FOR SELECT
  USING (invoice_id IN (SELECT id FROM invoices WHERE company_id = public.get_current_company_id()));

CREATE POLICY "invoice_approvals_tenant_insert" ON invoice_approvals FOR INSERT
  WITH CHECK (invoice_id IN (SELECT id FROM invoices WHERE company_id = public.get_current_company_id()));

CREATE POLICY "invoice_approvals_tenant_update" ON invoice_approvals FOR UPDATE
  USING (invoice_id IN (SELECT id FROM invoices WHERE company_id = public.get_current_company_id()));

-- ── 5. Approval Chain Templates ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS approval_chain_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  description TEXT,
  chain_type TEXT NOT NULL DEFAULT 'invoice'
    CHECK (chain_type IN ('invoice', 'purchase_order', 'change_order', 'draw_request')),
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS approval_chain_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id UUID NOT NULL REFERENCES approval_chain_templates(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  required_role TEXT NOT NULL,
  threshold_min NUMERIC(15,2),
  threshold_max NUMERIC(15,2),
  auto_escalate_hours INTEGER DEFAULT 48,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approval_chains_company ON approval_chain_templates(company_id);

ALTER TABLE approval_chain_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_chain_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "approval_chains_tenant" ON approval_chain_templates FOR ALL
  USING (company_id = public.get_current_company_id());

CREATE POLICY "approval_steps_tenant" ON approval_chain_steps FOR ALL
  USING (chain_id IN (SELECT id FROM approval_chain_templates WHERE company_id = public.get_current_company_id()));

-- ── 6. Invoice Disputes ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS invoice_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id),
  dispute_type TEXT NOT NULL DEFAULT 'full'
    CHECK (dispute_type IN ('full', 'partial')),
  disputed_amount NUMERIC(15,2) NOT NULL,
  reason_category TEXT NOT NULL
    CHECK (reason_category IN (
      'incorrect_amount', 'incorrect_scope', 'duplicate', 'quality_issue',
      'missing_documentation', 'unauthorized_work', 'pricing_dispute', 'other'
    )),
  reason_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_review', 'resolved_adjusted', 'resolved_voided',
                      'resolved_credit_memo', 'resolved_as_is', 'escalated', 'closed')),
  resolution_notes TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  adjusted_amount NUMERIC(15,2),
  credit_memo_id UUID REFERENCES invoices(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_invoice_disputes_invoice ON invoice_disputes(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_disputes_company ON invoice_disputes(company_id);
CREATE INDEX IF NOT EXISTS idx_invoice_disputes_status ON invoice_disputes(company_id, status);

ALTER TABLE invoice_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_disputes_tenant" ON invoice_disputes FOR ALL
  USING (company_id = public.get_current_company_id());

-- ── 7. Dispute Communications ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dispute_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES invoice_disputes(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT true,
  sender_type TEXT NOT NULL DEFAULT 'user'
    CHECK (sender_type IN ('user', 'vendor', 'system')),
  sender_id UUID REFERENCES users(id),
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dispute_comms_dispute ON dispute_communications(dispute_id);

ALTER TABLE dispute_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dispute_comms_tenant" ON dispute_communications FOR ALL
  USING (dispute_id IN (SELECT id FROM invoice_disputes WHERE company_id = public.get_current_company_id()));

-- ── 8. Vendor Credits ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendor_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  credit_number TEXT,
  original_invoice_id UUID REFERENCES invoices(id),
  original_po_id UUID REFERENCES purchase_orders(id),
  amount NUMERIC(15,2) NOT NULL,
  remaining_amount NUMERIC(15,2) NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'partially_applied', 'fully_applied', 'voided')),
  applied_to_invoices JSONB DEFAULT '[]',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_vendor_credits_company ON vendor_credits(company_id);
CREATE INDEX IF NOT EXISTS idx_vendor_credits_vendor ON vendor_credits(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_credits_status ON vendor_credits(company_id, status);

ALTER TABLE vendor_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vendor_credits_tenant" ON vendor_credits FOR ALL
  USING (company_id = public.get_current_company_id());

-- ── 9. Retainage Rules ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS retainage_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'company'
    CHECK (scope IN ('company', 'project', 'vendor', 'contract')),
  job_id UUID REFERENCES jobs(id),
  vendor_id UUID REFERENCES vendors(id),
  retainage_percent NUMERIC(5,2) NOT NULL DEFAULT 10,
  release_at_percent_complete NUMERIC(5,2),
  auto_release BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_retainage_rules_company ON retainage_rules(company_id);

ALTER TABLE retainage_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "retainage_rules_tenant" ON retainage_rules FOR ALL
  USING (company_id = public.get_current_company_id());

-- ── 10. Duplicate Detection Hashes ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS invoice_hashes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  hash TEXT NOT NULL,
  vendor_id UUID REFERENCES vendors(id),
  invoice_number TEXT,
  amount NUMERIC(15,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, hash)
);

CREATE INDEX IF NOT EXISTS idx_invoice_hashes_company ON invoice_hashes(company_id);
CREATE INDEX IF NOT EXISTS idx_invoice_hashes_hash ON invoice_hashes(company_id, hash);

ALTER TABLE invoice_hashes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_hashes_tenant" ON invoice_hashes FOR ALL
  USING (company_id = public.get_current_company_id());

-- ── 11. Invoice PDF Stamps Log ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS invoice_stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  stamped_by UUID REFERENCES users(id),
  stamp_type TEXT NOT NULL DEFAULT 'approval'
    CHECK (stamp_type IN ('approval', 'allocation_update', 'draw_assignment', 'batch_approval', 'split')),
  stamp_data JSONB NOT NULL DEFAULT '{}',
  input_pdf_url TEXT NOT NULL,
  output_pdf_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_stamps_invoice ON invoice_stamps(invoice_id);

ALTER TABLE invoice_stamps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_stamps_tenant" ON invoice_stamps FOR ALL
  USING (invoice_id IN (SELECT id FROM invoices WHERE company_id = public.get_current_company_id()));

-- ── 12. Payment Prerequisites ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payment_prerequisites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  prerequisite_type TEXT NOT NULL
    CHECK (prerequisite_type IN ('coi', 'lien_waiver', 'w9', 'contract', 'inspection', 'custom')),
  label TEXT NOT NULL,
  is_met BOOLEAN NOT NULL DEFAULT false,
  met_at TIMESTAMPTZ,
  met_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_prereqs_invoice ON payment_prerequisites(invoice_id);

ALTER TABLE payment_prerequisites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_prereqs_tenant" ON payment_prerequisites FOR ALL
  USING (company_id = public.get_current_company_id());

-- ── 13. Additional indexes for performance ────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_invoices_po ON invoices(po_id) WHERE po_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_cost_code ON invoices(cost_code_id) WHERE cost_code_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_draw ON invoices(draw_id) WHERE draw_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_duplicate_hash ON invoices(company_id, duplicate_hash) WHERE duplicate_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_type ON invoices(company_id, invoice_type);
CREATE INDEX IF NOT EXISTS idx_invoices_lien_waiver ON invoices(company_id, lien_waiver_status) WHERE lien_waiver_status != 'not_required';
