-- ============================================================================
-- Module 51: Time Tracking & Labor Management
-- V1 Foundation: Core tables, RLS, indexes
-- ============================================================================

-- ── Time Entries ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS time_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  user_id         UUID NOT NULL,
  job_id          UUID NOT NULL,
  cost_code_id    UUID,
  entry_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  clock_in        TIMESTAMPTZ,
  clock_out       TIMESTAMPTZ,
  regular_hours   DECIMAL(5,2) DEFAULT 0,
  overtime_hours  DECIMAL(5,2) DEFAULT 0,
  double_time_hours DECIMAL(5,2) DEFAULT 0,
  break_minutes   INTEGER DEFAULT 0,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected', 'exported')),
  notes           TEXT,
  gps_clock_in    JSONB,           -- { lat: number, lng: number, accuracy: number }
  gps_clock_out   JSONB,           -- { lat: number, lng: number, accuracy: number }
  entry_method    VARCHAR(20) DEFAULT 'manual'
                    CHECK (entry_method IN ('mobile', 'kiosk', 'manual', 'superintendent')),
  approved_by     UUID,
  approved_at     TIMESTAMPTZ,
  rejected_by     UUID,
  rejected_at     TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

-- ── Time Entry Allocations ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS time_entry_allocations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_entry_id   UUID NOT NULL REFERENCES time_entries(id) ON DELETE CASCADE,
  company_id      UUID NOT NULL REFERENCES companies(id),
  job_id          UUID NOT NULL,
  cost_code_id    UUID,
  hours           DECIMAL(5,2) NOT NULL DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Labor Rates ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS labor_rates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  user_id         UUID,
  trade           VARCHAR(100),
  rate_type       VARCHAR(20) NOT NULL DEFAULT 'regular'
                    CHECK (rate_type IN ('regular', 'overtime', 'double_time')),
  hourly_rate     DECIMAL(10,2) NOT NULL DEFAULT 0,
  effective_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date        DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Payroll Periods ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payroll_periods (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'closed', 'exported')),
  exported_at     TIMESTAMPTZ,
  exported_by     UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Payroll Exports ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payroll_exports (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL REFERENCES companies(id),
  payroll_period_id UUID REFERENCES payroll_periods(id),
  export_format     VARCHAR(20) NOT NULL DEFAULT 'csv'
                      CHECK (export_format IN ('csv', 'quickbooks', 'adp', 'custom')),
  file_path         TEXT,
  total_hours       DECIMAL(10,2) DEFAULT 0,
  total_amount      DECIMAL(15,2) DEFAULT 0,
  employee_count    INTEGER DEFAULT 0,
  exported_by       UUID,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entry_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_exports ENABLE ROW LEVEL SECURITY;

-- time_entries
CREATE POLICY "time_entries_select" ON time_entries
  FOR SELECT USING (company_id = get_current_company_id());
CREATE POLICY "time_entries_insert" ON time_entries
  FOR INSERT WITH CHECK (company_id = get_current_company_id());
CREATE POLICY "time_entries_update" ON time_entries
  FOR UPDATE USING (company_id = get_current_company_id());
CREATE POLICY "time_entries_delete" ON time_entries
  FOR DELETE USING (company_id = get_current_company_id());

-- time_entry_allocations
CREATE POLICY "time_entry_allocations_select" ON time_entry_allocations
  FOR SELECT USING (company_id = get_current_company_id());
CREATE POLICY "time_entry_allocations_insert" ON time_entry_allocations
  FOR INSERT WITH CHECK (company_id = get_current_company_id());
CREATE POLICY "time_entry_allocations_update" ON time_entry_allocations
  FOR UPDATE USING (company_id = get_current_company_id());
CREATE POLICY "time_entry_allocations_delete" ON time_entry_allocations
  FOR DELETE USING (company_id = get_current_company_id());

-- labor_rates
CREATE POLICY "labor_rates_select" ON labor_rates
  FOR SELECT USING (company_id = get_current_company_id());
CREATE POLICY "labor_rates_insert" ON labor_rates
  FOR INSERT WITH CHECK (company_id = get_current_company_id());
CREATE POLICY "labor_rates_update" ON labor_rates
  FOR UPDATE USING (company_id = get_current_company_id());
CREATE POLICY "labor_rates_delete" ON labor_rates
  FOR DELETE USING (company_id = get_current_company_id());

-- payroll_periods
CREATE POLICY "payroll_periods_select" ON payroll_periods
  FOR SELECT USING (company_id = get_current_company_id());
CREATE POLICY "payroll_periods_insert" ON payroll_periods
  FOR INSERT WITH CHECK (company_id = get_current_company_id());
CREATE POLICY "payroll_periods_update" ON payroll_periods
  FOR UPDATE USING (company_id = get_current_company_id());
CREATE POLICY "payroll_periods_delete" ON payroll_periods
  FOR DELETE USING (company_id = get_current_company_id());

-- payroll_exports
CREATE POLICY "payroll_exports_select" ON payroll_exports
  FOR SELECT USING (company_id = get_current_company_id());
CREATE POLICY "payroll_exports_insert" ON payroll_exports
  FOR INSERT WITH CHECK (company_id = get_current_company_id());

-- ============================================================================
-- Indexes
-- ============================================================================

-- time_entries
CREATE INDEX IF NOT EXISTS idx_time_entries_company ON time_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user ON time_entries(company_id, user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_job ON time_entries(company_id, job_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(company_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON time_entries(company_id, status);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON time_entries(company_id, user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_time_entries_job_date ON time_entries(company_id, job_id, entry_date);

-- time_entry_allocations
CREATE INDEX IF NOT EXISTS idx_time_entry_allocations_entry ON time_entry_allocations(time_entry_id);
CREATE INDEX IF NOT EXISTS idx_time_entry_allocations_job ON time_entry_allocations(company_id, job_id);
CREATE INDEX IF NOT EXISTS idx_time_entry_allocations_cost_code ON time_entry_allocations(company_id, cost_code_id);

-- labor_rates
CREATE INDEX IF NOT EXISTS idx_labor_rates_company ON labor_rates(company_id);
CREATE INDEX IF NOT EXISTS idx_labor_rates_user ON labor_rates(company_id, user_id);
CREATE INDEX IF NOT EXISTS idx_labor_rates_trade ON labor_rates(company_id, trade);
CREATE INDEX IF NOT EXISTS idx_labor_rates_effective ON labor_rates(company_id, effective_date);

-- payroll_periods
CREATE INDEX IF NOT EXISTS idx_payroll_periods_company ON payroll_periods(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_periods_dates ON payroll_periods(company_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_payroll_periods_status ON payroll_periods(company_id, status);

-- payroll_exports
CREATE INDEX IF NOT EXISTS idx_payroll_exports_company ON payroll_exports(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_exports_period ON payroll_exports(payroll_period_id);

-- ── Updated_at trigger ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_time_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_time_tracking_updated_at();

CREATE TRIGGER trg_labor_rates_updated_at
  BEFORE UPDATE ON labor_rates
  FOR EACH ROW EXECUTE FUNCTION update_time_tracking_updated_at();

CREATE TRIGGER trg_payroll_periods_updated_at
  BEFORE UPDATE ON payroll_periods
  FOR EACH ROW EXECUTE FUNCTION update_time_tracking_updated_at();
