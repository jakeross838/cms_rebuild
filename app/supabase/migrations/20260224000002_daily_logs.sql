-- ============================================================================
-- Module 08: Daily Logs & Field Operations — V1 Foundation
-- ============================================================================
-- Core tables for daily log capture: logs, entries, labor, photos.
-- Maps spec's builder_id to company_id for multi-tenant consistency.
-- ============================================================================

-- ── Daily Logs ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  log_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  weather_summary TEXT,
  high_temp NUMERIC(5,1),
  low_temp NUMERIC(5,1),
  conditions TEXT,
  submitted_by UUID REFERENCES users(id),
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(job_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_logs_company ON daily_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_job ON daily_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_company_job ON daily_logs(company_id, job_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_status ON daily_logs(company_id, status);

ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON daily_logs
  USING (company_id = get_current_company_id());

-- ── Daily Log Entries ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_log_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_log_id UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL
    CHECK (entry_type IN ('note', 'work_performed', 'material_delivery', 'visitor', 'delay', 'safety_incident', 'inspection')),
  description TEXT NOT NULL,
  time_logged TIMESTAMPTZ,
  sort_order INT DEFAULT 0,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_daily_log_entries_log ON daily_log_entries(daily_log_id);
CREATE INDEX IF NOT EXISTS idx_daily_log_entries_type ON daily_log_entries(daily_log_id, entry_type);

ALTER TABLE daily_log_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON daily_log_entries
  USING (
    daily_log_id IN (
      SELECT id FROM daily_logs WHERE company_id = get_current_company_id()
    )
  );

-- ── Daily Log Labor ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_log_labor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_log_id UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id),
  worker_name TEXT NOT NULL,
  trade TEXT,
  hours_worked NUMERIC(4,1) NOT NULL DEFAULT 0,
  overtime_hours NUMERIC(4,1) DEFAULT 0,
  headcount INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_daily_log_labor_log ON daily_log_labor(daily_log_id);
CREATE INDEX IF NOT EXISTS idx_daily_log_labor_company ON daily_log_labor(company_id);

ALTER TABLE daily_log_labor ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON daily_log_labor
  USING (company_id = get_current_company_id());

-- ── Daily Log Photos ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_log_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_log_id UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  caption TEXT,
  taken_at TIMESTAMPTZ,
  location_description TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_daily_log_photos_log ON daily_log_photos(daily_log_id);

ALTER TABLE daily_log_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON daily_log_photos
  USING (
    daily_log_id IN (
      SELECT id FROM daily_logs WHERE company_id = get_current_company_id()
    )
  );
