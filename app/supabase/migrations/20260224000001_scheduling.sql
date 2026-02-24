-- ============================================================================
-- Module 07: Scheduling & Calendar
-- ============================================================================
-- V1 foundation tables: schedule tasks, dependencies, baselines, and
-- weather records. Supports multi-tenant isolation via company_id + RLS.
-- ============================================================================

-- ── Schedule Tasks ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schedule_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  parent_task_id UUID REFERENCES schedule_tasks(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  phase VARCHAR(100),
  trade VARCHAR(100),
  task_type TEXT DEFAULT 'task' CHECK (task_type IN ('task', 'milestone', 'summary')),
  planned_start DATE,
  planned_end DATE,
  actual_start DATE,
  actual_end DATE,
  duration_days INT,
  progress_pct NUMERIC(5,2) DEFAULT 0.00 CHECK (progress_pct >= 0 AND progress_pct <= 100),
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'delayed', 'on_hold')),
  assigned_to UUID REFERENCES users(id),
  assigned_vendor_id UUID,
  is_critical_path BOOLEAN DEFAULT false,
  total_float INT,
  sort_order INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for schedule_tasks
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_company ON schedule_tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_job ON schedule_tasks(company_id, job_id);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_parent ON schedule_tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_status ON schedule_tasks(company_id, status);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_assigned ON schedule_tasks(assigned_to);

-- GIN index for name search
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_name_trgm ON schedule_tasks USING GIN(name gin_trgm_ops);

-- RLS
ALTER TABLE schedule_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON schedule_tasks
  USING (company_id = get_current_company_id());

-- ── Schedule Dependencies ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schedule_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  predecessor_id UUID NOT NULL REFERENCES schedule_tasks(id) ON DELETE CASCADE,
  successor_id UUID NOT NULL REFERENCES schedule_tasks(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL DEFAULT 'FS' CHECK (dependency_type IN ('FS', 'SS', 'FF', 'SF')),
  lag_days INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(predecessor_id, successor_id)
);

CREATE INDEX IF NOT EXISTS idx_schedule_deps_predecessor ON schedule_dependencies(predecessor_id);
CREATE INDEX IF NOT EXISTS idx_schedule_deps_successor ON schedule_dependencies(successor_id);

-- Dependencies inherit isolation through their task references; no company_id needed
-- But we still enable RLS for safety — access is through joined schedule_tasks
ALTER TABLE schedule_dependencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access via tasks" ON schedule_dependencies
  USING (
    EXISTS (
      SELECT 1 FROM schedule_tasks
      WHERE schedule_tasks.id = schedule_dependencies.predecessor_id
        AND schedule_tasks.company_id = get_current_company_id()
    )
  );

-- ── Schedule Baselines ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schedule_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  name VARCHAR(100) NOT NULL,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  baseline_data JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schedule_baselines_company ON schedule_baselines(company_id);
CREATE INDEX IF NOT EXISTS idx_schedule_baselines_job ON schedule_baselines(company_id, job_id);

ALTER TABLE schedule_baselines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON schedule_baselines
  USING (company_id = get_current_company_id());

-- ── Weather Records ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weather_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  record_date DATE NOT NULL,
  high_temp NUMERIC(5,1),
  low_temp NUMERIC(5,1),
  conditions VARCHAR(100),
  precipitation_inches NUMERIC(5,2),
  wind_mph NUMERIC(5,1),
  is_work_day BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(company_id, job_id, record_date)
);

CREATE INDEX IF NOT EXISTS idx_weather_records_company ON weather_records(company_id);
CREATE INDEX IF NOT EXISTS idx_weather_records_job ON weather_records(company_id, job_id);
CREATE INDEX IF NOT EXISTS idx_weather_records_date ON weather_records(company_id, job_id, record_date);

ALTER TABLE weather_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON weather_records
  USING (company_id = get_current_company_id());
