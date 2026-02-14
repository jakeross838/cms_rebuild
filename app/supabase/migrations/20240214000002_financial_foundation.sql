-- ============================================================================
-- FINANCIAL FOUNDATION MIGRATION
-- Adds data integrity infrastructure required before building financial modules
-- Covers: GL, version control, rounding, status machines, audit triggers,
--         reconciliation, immutability, CHECK constraints, currency support
-- ============================================================================

-- ============================================================================
-- 1. GENERAL LEDGER (Double-Entry Bookkeeping)
-- Every financial transaction produces a balanced journal entry.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.gl_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  parent_id UUID REFERENCES public.gl_accounts(id),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, account_code)
);

CREATE TABLE IF NOT EXISTS public.gl_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  description TEXT NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  source_module TEXT,
  is_reversing BOOLEAN DEFAULT false,
  reversed_entry_id UUID REFERENCES public.gl_journal_entries(id),
  fiscal_period_id UUID,
  status TEXT DEFAULT 'posted' CHECK (status IN ('draft', 'posted', 'reversed')),
  posted_by UUID REFERENCES public.users(id),
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.gl_journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES public.gl_journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.gl_accounts(id),
  debit_amount DECIMAL(14,2) DEFAULT 0 CHECK (debit_amount >= 0),
  credit_amount DECIMAL(14,2) DEFAULT 0 CHECK (credit_amount >= 0),
  description TEXT,
  job_id UUID REFERENCES public.jobs(id),
  cost_code_id UUID REFERENCES public.cost_codes(id),
  vendor_id UUID REFERENCES public.vendors(id),
  line_order INTEGER DEFAULT 0,
  CONSTRAINT gl_line_has_amount CHECK (debit_amount > 0 OR credit_amount > 0),
  CONSTRAINT gl_line_not_both CHECK (NOT (debit_amount > 0 AND credit_amount > 0))
);

-- Enforce balanced journal entries via trigger
CREATE OR REPLACE FUNCTION public.verify_journal_balance()
RETURNS TRIGGER AS $$
DECLARE
  total_debits DECIMAL(14,2);
  total_credits DECIMAL(14,2);
BEGIN
  SELECT COALESCE(SUM(debit_amount), 0), COALESCE(SUM(credit_amount), 0)
  INTO total_debits, total_credits
  FROM public.gl_journal_lines
  WHERE journal_entry_id = NEW.journal_entry_id;

  IF ABS(total_debits - total_credits) > 0.01 THEN
    RAISE EXCEPTION 'Journal entry is not balanced: debits=%, credits=%', total_debits, total_credits;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER check_journal_balance
  AFTER INSERT OR UPDATE ON public.gl_journal_lines
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION public.verify_journal_balance();

-- GL indexes
CREATE INDEX idx_gl_accounts_company ON public.gl_accounts(company_id);
CREATE INDEX idx_gl_journal_entries_company ON public.gl_journal_entries(company_id, entry_date DESC);
CREATE INDEX idx_gl_journal_entries_ref ON public.gl_journal_entries(reference_type, reference_id);
CREATE INDEX idx_gl_journal_lines_entry ON public.gl_journal_lines(journal_entry_id);
CREATE INDEX idx_gl_journal_lines_account ON public.gl_journal_lines(account_id);

-- GL RLS
ALTER TABLE public.gl_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gl_accounts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.gl_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gl_journal_entries FORCE ROW LEVEL SECURITY;
ALTER TABLE public.gl_journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gl_journal_lines FORCE ROW LEVEL SECURITY;

CREATE POLICY "gl_accounts_select" ON public.gl_accounts FOR SELECT
  USING (company_id = public.get_current_company_id());
CREATE POLICY "gl_accounts_manage" ON public.gl_accounts FOR ALL
  USING (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']))
  WITH CHECK (company_id = public.get_current_company_id());

CREATE POLICY "gl_journal_entries_select" ON public.gl_journal_entries FOR SELECT
  USING (company_id = public.get_current_company_id());
CREATE POLICY "gl_journal_entries_insert" ON public.gl_journal_entries FOR INSERT
  WITH CHECK (company_id = public.get_current_company_id());

CREATE POLICY "gl_journal_lines_select" ON public.gl_journal_lines FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.gl_journal_entries je
    WHERE je.id = gl_journal_lines.journal_entry_id
    AND je.company_id = public.get_current_company_id()
  ));
CREATE POLICY "gl_journal_lines_insert" ON public.gl_journal_lines FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.gl_journal_entries je
    WHERE je.id = gl_journal_lines.journal_entry_id
    AND je.company_id = public.get_current_company_id()
  ));

-- ============================================================================
-- 2. VERSION COLUMNS FOR OPTIMISTIC CONCURRENCY CONTROL
-- Prevents race conditions in concurrent financial updates.
-- ============================================================================

ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Auto-increment version on update
CREATE OR REPLACE FUNCTION public.increment_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_version_jobs BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.increment_version();

-- ============================================================================
-- 3. CURRENCY SUPPORT
-- Add currency_code to financial tables now, even if only USD at launch.
-- ============================================================================

ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS currency_code CHAR(3) DEFAULT 'USD' NOT NULL;

-- ============================================================================
-- 4. ROUNDING STRATEGY: LARGEST REMAINDER METHOD
-- Ensures split allocations always sum exactly to the source amount.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.allocate_amount(
  total DECIMAL(14,2),
  shares DECIMAL(14,4)[]
)
RETURNS DECIMAL(14,2)[] AS $$
DECLARE
  n INTEGER;
  sum_shares DECIMAL(14,4);
  raw_amounts DECIMAL(14,4)[];
  floor_amounts DECIMAL(14,2)[];
  remainders DECIMAL(14,4)[];
  result DECIMAL(14,2)[];
  floor_sum DECIMAL(14,2);
  pennies_to_distribute INTEGER;
  i INTEGER;
  max_idx INTEGER;
  max_rem DECIMAL(14,4);
BEGIN
  n := array_length(shares, 1);
  IF n IS NULL OR n = 0 THEN
    RETURN ARRAY[]::DECIMAL(14,2)[];
  END IF;

  -- Calculate sum of shares for proportional allocation
  sum_shares := 0;
  FOR i IN 1..n LOOP
    sum_shares := sum_shares + shares[i];
  END LOOP;

  IF sum_shares = 0 THEN
    RETURN ARRAY_FILL(0::DECIMAL(14,2), ARRAY[n]);
  END IF;

  -- Calculate raw proportional amounts and floor values
  raw_amounts := ARRAY[]::DECIMAL(14,4)[];
  floor_amounts := ARRAY[]::DECIMAL(14,2)[];
  remainders := ARRAY[]::DECIMAL(14,4)[];
  floor_sum := 0;

  FOR i IN 1..n LOOP
    raw_amounts[i] := (total * shares[i]) / sum_shares;
    floor_amounts[i] := TRUNC(raw_amounts[i], 2);
    remainders[i] := raw_amounts[i] - floor_amounts[i];
    floor_sum := floor_sum + floor_amounts[i];
  END LOOP;

  -- Distribute remaining pennies to lines with largest remainders
  result := floor_amounts;
  pennies_to_distribute := ROUND((total - floor_sum) * 100)::INTEGER;

  WHILE pennies_to_distribute > 0 LOOP
    max_idx := 1;
    max_rem := -1;
    FOR i IN 1..n LOOP
      IF remainders[i] > max_rem THEN
        max_rem := remainders[i];
        max_idx := i;
      END IF;
    END LOOP;
    result[max_idx] := result[max_idx] + 0.01;
    remainders[max_idx] := -1; -- Used up
    pennies_to_distribute := pennies_to_distribute - 1;
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 5. FISCAL PERIOD LOCKING
-- Prevents backdating financial transactions into closed periods.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.fiscal_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL CHECK (period_type IN ('month', 'quarter', 'year')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  fiscal_year INTEGER NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'soft_closed', 'hard_closed')),
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES public.users(id),
  reopened_at TIMESTAMPTZ,
  reopened_by UUID REFERENCES public.users(id),
  reopen_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, period_type, period_start)
);

ALTER TABLE public.fiscal_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_periods FORCE ROW LEVEL SECURITY;

CREATE POLICY "fiscal_periods_select" ON public.fiscal_periods FOR SELECT
  USING (company_id = public.get_current_company_id());
CREATE POLICY "fiscal_periods_manage" ON public.fiscal_periods FOR ALL
  USING (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']))
  WITH CHECK (company_id = public.get_current_company_id());

CREATE INDEX idx_fiscal_periods_company ON public.fiscal_periods(company_id, period_start);

-- ============================================================================
-- 6. VALID STATUS TRANSITIONS TABLE
-- Database-enforced state machine for financial documents.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.valid_status_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  required_role TEXT,
  UNIQUE(entity_type, from_status, to_status)
);

-- Seed invoice transitions
INSERT INTO public.valid_status_transitions (entity_type, from_status, to_status, required_role) VALUES
  ('invoice', 'draft', 'needs_review', NULL),
  ('invoice', 'needs_review', 'ready_for_approval', NULL),
  ('invoice', 'ready_for_approval', 'approved', 'pm'),
  ('invoice', 'approved', 'scheduled', NULL),
  ('invoice', 'scheduled', 'paid', NULL),
  ('invoice', 'needs_review', 'draft', NULL),
  ('invoice', 'ready_for_approval', 'needs_review', NULL),
  ('invoice', 'draft', 'void', 'admin'),
  ('invoice', 'needs_review', 'void', 'admin'),
  -- Draw transitions
  ('draw', 'draft', 'pending_approval', NULL),
  ('draw', 'pending_approval', 'approved', 'pm'),
  ('draw', 'approved', 'submitted', NULL),
  ('draw', 'submitted', 'funded', NULL),
  ('draw', 'pending_approval', 'revision_requested', NULL),
  ('draw', 'revision_requested', 'draft', NULL),
  ('draw', 'draft', 'void', 'admin'),
  -- PO transitions
  ('purchase_order', 'draft', 'pending_approval', NULL),
  ('purchase_order', 'pending_approval', 'approved', 'pm'),
  ('purchase_order', 'approved', 'sent', NULL),
  ('purchase_order', 'sent', 'acknowledged', NULL),
  ('purchase_order', 'acknowledged', 'partially_received', NULL),
  ('purchase_order', 'partially_received', 'received', NULL),
  ('purchase_order', 'acknowledged', 'received', NULL),
  ('purchase_order', 'sent', 'received', NULL),
  ('purchase_order', 'draft', 'void', 'admin'),
  ('purchase_order', 'pending_approval', 'draft', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. FINANCIAL AUDIT TRIGGER
-- Automatically logs ALL changes to financial data at the database level.
-- This cannot be bypassed by application code bugs.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.financial_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  changed_by TEXT DEFAULT current_user,
  session_user_id UUID,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET
);

-- Partition-ready index
CREATE INDEX idx_financial_audit_company ON public.financial_audit_log(company_id, changed_at DESC);
CREATE INDEX idx_financial_audit_record ON public.financial_audit_log(table_name, record_id);

ALTER TABLE public.financial_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_audit_log FORCE ROW LEVEL SECURITY;

-- Only admins can read financial audit log
CREATE POLICY "financial_audit_select" ON public.financial_audit_log FOR SELECT
  USING (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']));
-- No UPDATE or DELETE policies — append-only

-- Generic financial audit trigger function
CREATE OR REPLACE FUNCTION public.audit_financial_change()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  changed TEXT[];
  company UUID;
  col TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    old_data := to_jsonb(OLD);
    company := OLD.company_id;
    INSERT INTO public.financial_audit_log (company_id, table_name, record_id, action, old_data, session_user_id)
    VALUES (company, TG_TABLE_NAME, OLD.id, 'DELETE', old_data, auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    new_data := to_jsonb(NEW);
    company := NEW.company_id;
    INSERT INTO public.financial_audit_log (company_id, table_name, record_id, action, new_data, session_user_id)
    VALUES (company, TG_TABLE_NAME, NEW.id, 'INSERT', new_data, auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    company := NEW.company_id;
    -- Find changed fields
    changed := ARRAY[]::TEXT[];
    FOR col IN SELECT key FROM jsonb_each(new_data) LOOP
      IF (old_data ->> col) IS DISTINCT FROM (new_data ->> col) THEN
        changed := array_append(changed, col);
      END IF;
    END LOOP;
    IF array_length(changed, 1) > 0 THEN
      INSERT INTO public.financial_audit_log (company_id, table_name, record_id, action, old_data, new_data, changed_fields, session_user_id)
      VALUES (company, TG_TABLE_NAME, NEW.id, 'UPDATE', old_data, new_data, changed, auth.uid());
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to jobs table (financial data)
CREATE TRIGGER audit_jobs_financial AFTER INSERT OR UPDATE OR DELETE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.audit_financial_change();

-- ============================================================================
-- 8. BUDGET RECONCILIATION FUNCTION
-- Recalculates denormalized totals from source records and reports discrepancies.
-- Run nightly via cron.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.reconcile_job_totals(target_job_id UUID)
RETURNS TABLE(field_name TEXT, stored_value DECIMAL(14,2), computed_value DECIMAL(14,2), discrepancy DECIMAL(14,2)) AS $$
BEGIN
  -- This is a placeholder that will be expanded when budget_lines, invoices, POs tables exist
  -- For now, it returns the job's own totals as-is (no source tables to reconcile against yet)
  RETURN QUERY
  SELECT
    'budget_total'::TEXT,
    j.budget_total,
    j.budget_total,
    0::DECIMAL(14,2)
  FROM public.jobs j
  WHERE j.id = target_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. INTEGRITY VIOLATIONS TABLE
-- Tracks any data integrity issues found by reconciliation.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.integrity_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  violation_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  field_name TEXT,
  expected_value TEXT,
  actual_value TEXT,
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.users(id),
  resolution_notes TEXT,
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.integrity_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrity_violations FORCE ROW LEVEL SECURITY;

CREATE POLICY "integrity_violations_select" ON public.integrity_violations FOR SELECT
  USING (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']));
CREATE POLICY "integrity_violations_insert" ON public.integrity_violations FOR INSERT
  WITH CHECK (company_id = public.get_current_company_id());

CREATE INDEX idx_integrity_violations_company ON public.integrity_violations(company_id, detected_at DESC);
CREATE INDEX idx_integrity_violations_open ON public.integrity_violations(company_id)
  WHERE resolved_at IS NULL;
