-- ============================================================================
-- BACKGROUND JOB QUEUE TABLE
-- Scalable queue for async processing across all tenants
-- ============================================================================

-- Create job queue table
CREATE TABLE IF NOT EXISTS public.job_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  priority smallint NOT NULL DEFAULT 3,
  attempts smallint NOT NULL DEFAULT 0,
  max_attempts smallint NOT NULL DEFAULT 3,
  run_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  error text,
  created_at timestamptz DEFAULT now(),

  CONSTRAINT job_queue_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  CONSTRAINT job_queue_priority_check CHECK (priority BETWEEN 1 AND 5)
);

-- Enable RLS
ALTER TABLE public.job_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_queue FORCE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "job_queue_select_own_company"
ON public.job_queue FOR SELECT
USING (company_id = public.get_current_company_id());

CREATE POLICY "job_queue_insert_own_company"
ON public.job_queue FOR INSERT
WITH CHECK (company_id = public.get_current_company_id());

-- Users can only update their own company's jobs
CREATE POLICY "job_queue_update_own_company"
ON public.job_queue FOR UPDATE
USING (company_id = public.get_current_company_id())
WITH CHECK (company_id = public.get_current_company_id());

-- Only admins can delete queue jobs
CREATE POLICY "job_queue_delete_own_company"
ON public.job_queue FOR DELETE
USING (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']));

-- ============================================================================
-- INDEXES FOR JOB QUEUE
-- ============================================================================

-- Primary lookup: Pending jobs ready to run (worker query)
CREATE INDEX idx_job_queue_pending ON public.job_queue(priority, created_at)
WHERE status = 'pending';

-- Company jobs
CREATE INDEX idx_job_queue_company ON public.job_queue(company_id, created_at DESC);

-- Status filtering
CREATE INDEX idx_job_queue_status ON public.job_queue(status, run_at);

-- Cleanup query: Old completed jobs
CREATE INDEX idx_job_queue_cleanup ON public.job_queue(completed_at)
WHERE status IN ('completed', 'failed', 'cancelled');

-- ============================================================================
-- HELPER FUNCTION: Increment attempts atomically
-- ============================================================================
CREATE OR REPLACE FUNCTION public.increment_job_attempts(job_id uuid)
RETURNS smallint
LANGUAGE sql
AS $$
  UPDATE public.job_queue
  SET attempts = attempts + 1
  WHERE id = job_id
  RETURNING attempts
$$;

-- ============================================================================
-- AUDIT LOG TABLE (for monitoring and debugging)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log FORCE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "audit_log_select_admin"
ON public.audit_log FOR SELECT
USING (
  company_id = public.get_current_company_id()
  AND public.user_has_role(ARRAY['owner', 'admin'])
);

-- Audit log inserts restricted to own company
CREATE POLICY "audit_log_insert_own_company"
ON public.audit_log FOR INSERT
WITH CHECK (company_id = public.get_current_company_id());

-- Indexes for audit log
CREATE INDEX idx_audit_log_company ON public.audit_log(company_id, created_at DESC);
CREATE INDEX idx_audit_log_user ON public.audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_log_table ON public.audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_action ON public.audit_log(action, created_at DESC);

-- ============================================================================
-- API METRICS TABLE (for monitoring)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.api_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code smallint NOT NULL,
  response_time_ms integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Partitioning-ready: add created_at to primary key
-- (For future: convert to partitioned table by month)

-- Index for metrics queries
CREATE INDEX idx_api_metrics_company ON public.api_metrics(company_id, created_at DESC);
CREATE INDEX idx_api_metrics_endpoint ON public.api_metrics(endpoint, created_at DESC);
CREATE INDEX idx_api_metrics_slow ON public.api_metrics(response_time_ms DESC)
WHERE response_time_ms > 1000;

-- Enable RLS on api_metrics
ALTER TABLE public.api_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_metrics FORCE ROW LEVEL SECURITY;

CREATE POLICY "api_metrics_select_own_company"
ON public.api_metrics FOR SELECT
USING (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']));

CREATE POLICY "api_metrics_insert_own_company"
ON public.api_metrics FOR INSERT
WITH CHECK (company_id = public.get_current_company_id());

-- Auto-cleanup: Delete metrics older than 30 days
-- (Run via cron job)
CREATE OR REPLACE FUNCTION public.cleanup_old_metrics()
RETURNS integer
LANGUAGE sql
AS $$
  WITH deleted AS (
    DELETE FROM public.api_metrics
    WHERE created_at < now() - interval '30 days'
    RETURNING id
  )
  SELECT count(*)::integer FROM deleted
$$;
