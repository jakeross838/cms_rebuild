-- ============================================================================
-- Module 19: Financial Reporting
-- ============================================================================
-- Core tables for financial reporting engine: report definitions, snapshots,
-- schedules, and financial periods with period locking.
-- ============================================================================

-- ── Report Definitions ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS report_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name VARCHAR(200) NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN (
    'profit_loss', 'balance_sheet', 'cash_flow', 'wip',
    'job_cost', 'ar_aging', 'ap_aging', 'budget_vs_actual',
    'retainage', 'custom'
  )),
  description TEXT,
  config JSONB DEFAULT '{}',
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_definitions_company ON report_definitions(company_id);
CREATE INDEX IF NOT EXISTS idx_report_definitions_type ON report_definitions(company_id, report_type);
CREATE INDEX IF NOT EXISTS idx_report_definitions_active ON report_definitions(company_id, is_active);

ALTER TABLE report_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON report_definitions
  USING (company_id = get_current_company_id());

-- ── Report Snapshots ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS report_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  report_definition_id UUID NOT NULL REFERENCES report_definitions(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  snapshot_data JSONB NOT NULL DEFAULT '{}',
  generated_by UUID REFERENCES users(id),
  generated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_snapshots_company ON report_snapshots(company_id);
CREATE INDEX IF NOT EXISTS idx_report_snapshots_definition ON report_snapshots(company_id, report_definition_id);
CREATE INDEX IF NOT EXISTS idx_report_snapshots_period ON report_snapshots(company_id, period_start, period_end);

ALTER TABLE report_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON report_snapshots
  USING (company_id = get_current_company_id());

-- ── Report Schedules ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  report_definition_id UUID NOT NULL REFERENCES report_definitions(id),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
  day_of_week INT CHECK (day_of_week >= 0 AND day_of_week <= 6),
  day_of_month INT CHECK (day_of_month >= 1 AND day_of_month <= 31),
  recipients JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_schedules_company ON report_schedules(company_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_definition ON report_schedules(company_id, report_definition_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_active ON report_schedules(company_id, is_active);
CREATE INDEX IF NOT EXISTS idx_report_schedules_next_run ON report_schedules(next_run_at) WHERE is_active = true;

ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON report_schedules
  USING (company_id = get_current_company_id());

-- ── Financial Periods ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS financial_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  period_name VARCHAR(50) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'locked')),
  fiscal_year INT NOT NULL,
  fiscal_quarter INT CHECK (fiscal_quarter >= 1 AND fiscal_quarter <= 4),
  closed_by UUID REFERENCES users(id),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, period_name)
);

CREATE INDEX IF NOT EXISTS idx_financial_periods_company ON financial_periods(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_periods_dates ON financial_periods(company_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_financial_periods_status ON financial_periods(company_id, status);
CREATE INDEX IF NOT EXISTS idx_financial_periods_fiscal ON financial_periods(company_id, fiscal_year, fiscal_quarter);

ALTER TABLE financial_periods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON financial_periods
  USING (company_id = get_current_company_id());
