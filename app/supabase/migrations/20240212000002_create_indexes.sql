-- ============================================================================
-- PERFORMANCE INDEXES FOR MULTI-TENANT SCALE
-- Optimized for 10,000+ companies with 1,000,000+ users
-- ============================================================================

-- ============================================================================
-- COMPANIES TABLE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON public.companies(created_at DESC);

-- ============================================================================
-- USERS TABLE INDEXES
-- ============================================================================
-- Primary lookup: Users by company (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);

-- Compound index for company + active status (common filter)
CREATE INDEX IF NOT EXISTS idx_users_company_active ON public.users(company_id, is_active) WHERE is_active = true;

-- Email lookup for authentication
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Company + role for permission checks
CREATE INDEX IF NOT EXISTS idx_users_company_role ON public.users(company_id, role);

-- ============================================================================
-- CLIENTS TABLE INDEXES
-- ============================================================================
-- Primary lookup: Clients by company
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON public.clients(company_id);

-- Search by name within company
CREATE INDEX IF NOT EXISTS idx_clients_company_name ON public.clients(company_id, name);

-- Email lookup
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email) WHERE email IS NOT NULL;

-- ============================================================================
-- JOBS TABLE INDEXES
-- ============================================================================
-- Primary lookup: Jobs by company
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);

-- Common filter: Company + status (active jobs dashboard)
CREATE INDEX IF NOT EXISTS idx_jobs_company_status ON public.jobs(company_id, status);

-- Client's jobs lookup
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON public.jobs(client_id) WHERE client_id IS NOT NULL;

-- Job number search
CREATE INDEX IF NOT EXISTS idx_jobs_job_number ON public.jobs(company_id, job_number) WHERE job_number IS NOT NULL;

-- Date range queries (scheduling, reporting)
CREATE INDEX IF NOT EXISTS idx_jobs_company_dates ON public.jobs(company_id, start_date, target_completion);

-- Active jobs only (partial index for performance)
CREATE INDEX IF NOT EXISTS idx_jobs_company_active ON public.jobs(company_id, updated_at DESC)
WHERE status IN ('pre_construction', 'active', 'on_hold');

-- ============================================================================
-- VENDORS TABLE INDEXES
-- ============================================================================
-- Primary lookup: Vendors by company
CREATE INDEX IF NOT EXISTS idx_vendors_company_id ON public.vendors(company_id);

-- Active vendors (common filter)
CREATE INDEX IF NOT EXISTS idx_vendors_company_active ON public.vendors(company_id, is_active) WHERE is_active = true;

-- Trade search
CREATE INDEX IF NOT EXISTS idx_vendors_company_trade ON public.vendors(company_id, trade) WHERE trade IS NOT NULL;

-- Name search
CREATE INDEX IF NOT EXISTS idx_vendors_company_name ON public.vendors(company_id, name);

-- ============================================================================
-- INVOICES TABLE INDEXES
-- ============================================================================
-- Primary lookup: Invoices by company
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON public.invoices(company_id);

-- Job invoices (very common)
CREATE INDEX IF NOT EXISTS idx_invoices_job_id ON public.invoices(job_id) WHERE job_id IS NOT NULL;

-- Vendor invoices
CREATE INDEX IF NOT EXISTS idx_invoices_vendor_id ON public.invoices(vendor_id) WHERE vendor_id IS NOT NULL;

-- Status filtering (approval workflow)
CREATE INDEX IF NOT EXISTS idx_invoices_company_status ON public.invoices(company_id, status);

-- Due date for payment reminders
CREATE INDEX IF NOT EXISTS idx_invoices_company_due ON public.invoices(company_id, due_date)
WHERE status NOT IN ('paid', 'denied');

-- Date range queries
CREATE INDEX IF NOT EXISTS idx_invoices_company_date ON public.invoices(company_id, invoice_date DESC);

-- Compound: Job + status (common in job detail view)
CREATE INDEX IF NOT EXISTS idx_invoices_job_status ON public.invoices(job_id, status) WHERE job_id IS NOT NULL;

-- ============================================================================
-- DRAWS TABLE INDEXES
-- ============================================================================
-- Primary lookup: Draws by company
CREATE INDEX IF NOT EXISTS idx_draws_company_id ON public.draws(company_id);

-- Job draws (always needed together)
CREATE INDEX IF NOT EXISTS idx_draws_job_id ON public.draws(job_id);

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_draws_company_status ON public.draws(company_id, status);

-- Draw number within job
CREATE INDEX IF NOT EXISTS idx_draws_job_number ON public.draws(job_id, draw_number);

-- Pending draws (common dashboard query)
CREATE INDEX IF NOT EXISTS idx_draws_pending ON public.draws(company_id, created_at DESC)
WHERE status IN ('draft', 'pending_approval', 'approved', 'submitted');

-- ============================================================================
-- FULL TEXT SEARCH INDEXES (for search functionality)
-- ============================================================================
-- Jobs search
CREATE INDEX IF NOT EXISTS idx_jobs_search ON public.jobs
USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(address, '') || ' ' || coalesce(notes, '')));

-- Clients search
CREATE INDEX IF NOT EXISTS idx_clients_search ON public.clients
USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(email, '') || ' ' || coalesce(address, '')));

-- Vendors search
CREATE INDEX IF NOT EXISTS idx_vendors_search ON public.vendors
USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(trade, '') || ' ' || coalesce(notes, '')));

-- ============================================================================
-- STATISTICS UPDATE
-- Run ANALYZE to update query planner statistics
-- ============================================================================
ANALYZE public.companies;
ANALYZE public.users;
ANALYZE public.clients;
ANALYZE public.jobs;
ANALYZE public.vendors;
ANALYZE public.invoices;
ANALYZE public.draws;
