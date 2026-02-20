-- =====================================================================
-- Phase 0C-1: Enforce Soft-Delete Architecture
-- =====================================================================

-- Add deleted_at columns
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.cost_codes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add partial indexes for active-only queries
CREATE INDEX IF NOT EXISTS idx_companies_active ON public.companies(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clients_active ON public.clients(company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_active ON public.jobs(company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vendors_active ON public.vendors(company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cost_codes_active ON public.cost_codes(company_id) WHERE deleted_at IS NULL;

-- Trigger for companies updated_at already exists? Let's ensure cost_codes has it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_cost_codes_updated_at') THEN
        CREATE TRIGGER set_cost_codes_updated_at BEFORE UPDATE ON cost_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
END $$;


-- =====================================================================
-- Phase 0C-2: Fix RLS Policies for Soft-Delete + Remove DELETE Policies
-- =====================================================================

-- 1. Drop existing policies to recreate them with Soft-Delete filters
DROP POLICY IF EXISTS "companies_select_own" ON public.companies;
DROP POLICY IF EXISTS "users_select_same_company" ON public.users;
DROP POLICY IF EXISTS "cost_codes_select_own_company" ON public.cost_codes;
-- For clients, vendors, jobs, they use generic names or are handled implicitly if missing. 
-- In our schema, they might be using "clients_select_own_company" etc if created later, let's drop typical ones just in case.
DROP POLICY IF EXISTS "clients_select_own_company" ON public.clients;
DROP POLICY IF EXISTS "jobs_select_own_company" ON public.jobs;
DROP POLICY IF EXISTS "vendors_select_own_company" ON public.vendors;

-- Drop FOR DELETE policies
DROP POLICY IF EXISTS "clients_delete_own_company" ON public.clients;
DROP POLICY IF EXISTS "jobs_delete_own_company" ON public.jobs;
DROP POLICY IF EXISTS "vendors_delete_own_company" ON public.vendors;
DROP POLICY IF EXISTS "cost_codes_delete_own_company" ON public.cost_codes;

-- 2. Recreate FOR SELECT with Soft-Delete (deleted_at IS NULL)
CREATE POLICY "companies_select_own" ON public.companies
  FOR SELECT USING (id = public.get_current_company_id() AND deleted_at IS NULL);

CREATE POLICY "users_select_same_company" ON public.users
  FOR SELECT USING (company_id = public.get_current_company_id() AND deleted_at IS NULL);

CREATE POLICY "clients_select_own" ON public.clients
  FOR SELECT USING (company_id = public.get_current_company_id() AND deleted_at IS NULL);

CREATE POLICY "jobs_select_own" ON public.jobs
  FOR SELECT USING (company_id = public.get_current_company_id() AND deleted_at IS NULL);

CREATE POLICY "vendors_select_own" ON public.vendors
  FOR SELECT USING (company_id = public.get_current_company_id() AND deleted_at IS NULL);

CREATE POLICY "cost_codes_select_own_company" ON public.cost_codes
  FOR SELECT USING (company_id = public.get_current_company_id() AND deleted_at IS NULL);

-- 3. Add Soft-Delete protection FOR UPDATE (Only admins/owners can soft delete)
-- Users with admin/owner role can set deleted_at to non-null. Other users cannot modify it.

CREATE POLICY "cost_codes_soft_delete" ON public.cost_codes
  FOR UPDATE USING (company_id = public.get_current_company_id())
  WITH CHECK (
    company_id = public.get_current_company_id() AND
    (deleted_at IS NULL OR public.user_has_role(ARRAY['owner', 'admin']))
  );
