-- =============================================================================
-- Compound Indexes for Common Query Patterns
--
-- Adds indexes optimized for the most frequent API query patterns:
-- 1. Multi-filter list queries (company + status + deleted_at)
-- 2. Recent items queries (company + created_at DESC)
-- 3. Audit log filtering (company + user_id + event_type + created_at)
-- =============================================================================

-- Audit log — frequently filtered by user_id, event_type, and date range
CREATE INDEX IF NOT EXISTS idx_audit_log_company_user_created
  ON audit_log (company_id, user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_company_event_created
  ON audit_log (company_id, event_type, created_at DESC);

-- Auth audit log — login/signup event lookups
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_user_created
  ON auth_audit_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_event_created
  ON auth_audit_log (event_type, created_at DESC);

-- Jobs — status-based list queries (most common filter)
CREATE INDEX IF NOT EXISTS idx_jobs_company_status_created
  ON jobs (company_id, status, created_at DESC) WHERE deleted_at IS NULL;

-- AP Bills — status + due date (payment workflow)
CREATE INDEX IF NOT EXISTS idx_ap_bills_company_status_due
  ON ap_bills (company_id, status, due_date) WHERE deleted_at IS NULL;

-- AR Invoices — status + due date (collections workflow)
CREATE INDEX IF NOT EXISTS idx_ar_invoices_company_status_due
  ON ar_invoices (company_id, status, due_date) WHERE deleted_at IS NULL;

-- Leads — pipeline stage filtering (CRM primary view)
CREATE INDEX IF NOT EXISTS idx_leads_company_status_created
  ON leads (company_id, status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_company_pipeline_stage
  ON leads (company_id, pipeline_id, stage_id) WHERE deleted_at IS NULL;

-- Schedule tasks — job-scoped date range queries
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_job_dates
  ON schedule_tasks (job_id, start_date, end_date) WHERE deleted_at IS NULL;

-- Daily logs — job + date lookups
CREATE INDEX IF NOT EXISTS idx_daily_logs_job_date
  ON daily_logs (job_id, log_date DESC) WHERE deleted_at IS NULL;

-- Notifications — user inbox query (unread first, recent)
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created
  ON notifications (user_id, read, created_at DESC) WHERE deleted_at IS NULL;

-- Cost transactions — job-level cost queries
CREATE INDEX IF NOT EXISTS idx_cost_transactions_job_code
  ON cost_transactions (job_id, cost_code_id, transaction_date DESC) WHERE deleted_at IS NULL;

-- Vendors — trade-based filtering
CREATE INDEX IF NOT EXISTS idx_vendors_company_trade
  ON vendors (company_id, trade) WHERE deleted_at IS NULL;

-- Documents — folder/job scoping
CREATE INDEX IF NOT EXISTS idx_documents_company_job_folder
  ON documents (company_id, job_id, folder_id) WHERE deleted_at IS NULL;
