-- ============================================================================
-- Module 11: Native Accounting — GL / AP / AR (V1 Foundation)
-- ============================================================================
-- Core tables for General Ledger, Accounts Payable, and Accounts Receivable.
-- V1 focuses on chart of accounts, journal entries, bills, payments,
-- invoices, and receipts. Bank reconciliation deferred to V2.
-- ============================================================================

-- ── GL Accounts (Chart of Accounts) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gl_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  account_number VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense', 'cogs')),
  sub_type VARCHAR(50),
  parent_account_id UUID REFERENCES gl_accounts(id),
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  description TEXT,
  normal_balance TEXT NOT NULL CHECK (normal_balance IN ('debit', 'credit')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, account_number)
);

CREATE INDEX IF NOT EXISTS idx_gl_accounts_company ON gl_accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_gl_accounts_parent ON gl_accounts(parent_account_id);
CREATE INDEX IF NOT EXISTS idx_gl_accounts_type ON gl_accounts(company_id, account_type);

ALTER TABLE gl_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON gl_accounts
  USING (company_id = get_current_company_id());

-- ── GL Journal Entries ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gl_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  entry_date DATE NOT NULL,
  reference_number VARCHAR(50),
  memo TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'voided')),
  source_type TEXT NOT NULL DEFAULT 'manual' CHECK (source_type IN ('manual', 'ap_payment', 'ar_receipt', 'payroll')),
  source_id UUID,
  posted_by UUID REFERENCES users(id),
  posted_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gl_journal_entries_company ON gl_journal_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_gl_journal_entries_date ON gl_journal_entries(company_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_gl_journal_entries_status ON gl_journal_entries(company_id, status);
CREATE INDEX IF NOT EXISTS idx_gl_journal_entries_source ON gl_journal_entries(source_type, source_id);

ALTER TABLE gl_journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON gl_journal_entries
  USING (company_id = get_current_company_id());

-- ── GL Journal Lines ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gl_journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES gl_journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES gl_accounts(id),
  debit_amount DECIMAL(15,2) DEFAULT 0,
  credit_amount DECIMAL(15,2) DEFAULT 0,
  memo TEXT,
  job_id UUID REFERENCES jobs(id),
  cost_code_id UUID,
  vendor_id UUID REFERENCES vendors(id),
  client_id UUID REFERENCES clients(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gl_journal_lines_entry ON gl_journal_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_gl_journal_lines_account ON gl_journal_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_gl_journal_lines_job ON gl_journal_lines(job_id);
CREATE INDEX IF NOT EXISTS idx_gl_journal_lines_cost_code ON gl_journal_lines(cost_code_id);

-- No RLS on journal lines — access controlled via journal entry parent

-- ── AP Bills ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ap_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  bill_number VARCHAR(100) NOT NULL,
  bill_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  balance_due DECIMAL(15,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'partially_paid', 'paid', 'voided')),
  job_id UUID REFERENCES jobs(id),
  description TEXT,
  received_date DATE,
  terms VARCHAR(50),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ap_bills_company ON ap_bills(company_id);
CREATE INDEX IF NOT EXISTS idx_ap_bills_vendor ON ap_bills(vendor_id);
CREATE INDEX IF NOT EXISTS idx_ap_bills_job ON ap_bills(job_id);
CREATE INDEX IF NOT EXISTS idx_ap_bills_status ON ap_bills(company_id, status);
CREATE INDEX IF NOT EXISTS idx_ap_bills_due_date ON ap_bills(company_id, due_date);

ALTER TABLE ap_bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON ap_bills
  USING (company_id = get_current_company_id());

-- ── AP Bill Lines ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ap_bill_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES ap_bills(id) ON DELETE CASCADE,
  gl_account_id UUID NOT NULL REFERENCES gl_accounts(id),
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  job_id UUID REFERENCES jobs(id),
  cost_code_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ap_bill_lines_bill ON ap_bill_lines(bill_id);
CREATE INDEX IF NOT EXISTS idx_ap_bill_lines_account ON ap_bill_lines(gl_account_id);
CREATE INDEX IF NOT EXISTS idx_ap_bill_lines_job ON ap_bill_lines(job_id);

-- No RLS on bill lines — access controlled via bill parent

-- ── AP Payments ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ap_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  payment_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('check', 'ach', 'wire', 'credit_card', 'cash')),
  reference_number VARCHAR(100),
  memo TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cleared', 'voided')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ap_payments_company ON ap_payments(company_id);
CREATE INDEX IF NOT EXISTS idx_ap_payments_vendor ON ap_payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_ap_payments_status ON ap_payments(company_id, status);

ALTER TABLE ap_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON ap_payments
  USING (company_id = get_current_company_id());

-- ── AP Payment Applications ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ap_payment_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES ap_payments(id) ON DELETE CASCADE,
  bill_id UUID NOT NULL REFERENCES ap_bills(id),
  amount DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ap_payment_apps_payment ON ap_payment_applications(payment_id);
CREATE INDEX IF NOT EXISTS idx_ap_payment_apps_bill ON ap_payment_applications(bill_id);

-- No RLS on payment applications — access controlled via payment parent

-- ── AR Invoices ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ar_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  job_id UUID REFERENCES jobs(id),
  invoice_number VARCHAR(100) NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  balance_due DECIMAL(15,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'partially_paid', 'paid', 'overdue', 'voided')),
  terms VARCHAR(50),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ar_invoices_company ON ar_invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_ar_invoices_client ON ar_invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_ar_invoices_job ON ar_invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_ar_invoices_status ON ar_invoices(company_id, status);
CREATE INDEX IF NOT EXISTS idx_ar_invoices_due_date ON ar_invoices(company_id, due_date);

ALTER TABLE ar_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON ar_invoices
  USING (company_id = get_current_company_id());

-- ── AR Invoice Lines ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ar_invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES ar_invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  gl_account_id UUID REFERENCES gl_accounts(id),
  job_id UUID REFERENCES jobs(id),
  cost_code_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ar_invoice_lines_invoice ON ar_invoice_lines(invoice_id);
CREATE INDEX IF NOT EXISTS idx_ar_invoice_lines_account ON ar_invoice_lines(gl_account_id);
CREATE INDEX IF NOT EXISTS idx_ar_invoice_lines_job ON ar_invoice_lines(job_id);

-- No RLS on invoice lines — access controlled via invoice parent

-- ── AR Receipts ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ar_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  receipt_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('check', 'ach', 'wire', 'credit_card', 'cash')),
  reference_number VARCHAR(100),
  memo TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cleared', 'voided')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ar_receipts_company ON ar_receipts(company_id);
CREATE INDEX IF NOT EXISTS idx_ar_receipts_client ON ar_receipts(client_id);
CREATE INDEX IF NOT EXISTS idx_ar_receipts_status ON ar_receipts(company_id, status);

ALTER TABLE ar_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON ar_receipts
  USING (company_id = get_current_company_id());

-- ── AR Receipt Applications ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ar_receipt_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES ar_receipts(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES ar_invoices(id),
  amount DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ar_receipt_apps_receipt ON ar_receipt_applications(receipt_id);
CREATE INDEX IF NOT EXISTS idx_ar_receipt_apps_invoice ON ar_receipt_applications(invoice_id);

-- No RLS on receipt applications — access controlled via receipt parent
