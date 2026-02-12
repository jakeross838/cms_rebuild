-- ============================================================================
-- MULTI-TENANT ROW LEVEL SECURITY (RLS) POLICIES
-- Enables data isolation between companies for 10,000+ tenants
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTION: Get current user's company_id from JWT
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_current_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid()
$$;

-- ============================================================================
-- HELPER FUNCTION: Check if user belongs to a company
-- ============================================================================
CREATE OR REPLACE FUNCTION public.user_belongs_to_company(check_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND company_id = check_company_id
  )
$$;

-- ============================================================================
-- HELPER FUNCTION: Check if user has specific role
-- ============================================================================
CREATE OR REPLACE FUNCTION public.user_has_role(allowed_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = ANY(allowed_roles)
  )
$$;

-- ============================================================================
-- COMPANIES TABLE
-- ============================================================================
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Users can only see their own company
CREATE POLICY "companies_select_own"
ON public.companies FOR SELECT
USING (id = public.get_current_company_id());

-- Only owners/admins can update company settings
CREATE POLICY "companies_update_own"
ON public.companies FOR UPDATE
USING (id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']));

-- ============================================================================
-- USERS TABLE
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can see all users in their company
CREATE POLICY "users_select_same_company"
ON public.users FOR SELECT
USING (company_id = public.get_current_company_id());

-- Users can update their own profile
CREATE POLICY "users_update_own_profile"
ON public.users FOR UPDATE
USING (id = auth.uid());

-- Owners/admins can update any user in their company
CREATE POLICY "users_update_by_admin"
ON public.users FOR UPDATE
USING (
  company_id = public.get_current_company_id()
  AND public.user_has_role(ARRAY['owner', 'admin'])
);

-- Only owners/admins can insert new users
CREATE POLICY "users_insert_by_admin"
ON public.users FOR INSERT
WITH CHECK (
  company_id = public.get_current_company_id()
  AND public.user_has_role(ARRAY['owner', 'admin'])
);

-- Only owners can delete users
CREATE POLICY "users_delete_by_owner"
ON public.users FOR DELETE
USING (
  company_id = public.get_current_company_id()
  AND public.user_has_role(ARRAY['owner'])
);

-- ============================================================================
-- CLIENTS TABLE
-- ============================================================================
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_select_own_company"
ON public.clients FOR SELECT
USING (company_id = public.get_current_company_id());

CREATE POLICY "clients_insert_own_company"
ON public.clients FOR INSERT
WITH CHECK (company_id = public.get_current_company_id());

CREATE POLICY "clients_update_own_company"
ON public.clients FOR UPDATE
USING (company_id = public.get_current_company_id());

CREATE POLICY "clients_delete_own_company"
ON public.clients FOR DELETE
USING (
  company_id = public.get_current_company_id()
  AND public.user_has_role(ARRAY['owner', 'admin', 'pm'])
);

-- ============================================================================
-- JOBS TABLE
-- ============================================================================
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jobs_select_own_company"
ON public.jobs FOR SELECT
USING (company_id = public.get_current_company_id());

CREATE POLICY "jobs_insert_own_company"
ON public.jobs FOR INSERT
WITH CHECK (
  company_id = public.get_current_company_id()
  AND public.user_has_role(ARRAY['owner', 'admin', 'pm'])
);

CREATE POLICY "jobs_update_own_company"
ON public.jobs FOR UPDATE
USING (company_id = public.get_current_company_id());

CREATE POLICY "jobs_delete_own_company"
ON public.jobs FOR DELETE
USING (
  company_id = public.get_current_company_id()
  AND public.user_has_role(ARRAY['owner', 'admin'])
);

-- ============================================================================
-- VENDORS TABLE
-- ============================================================================
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vendors_select_own_company"
ON public.vendors FOR SELECT
USING (company_id = public.get_current_company_id());

CREATE POLICY "vendors_insert_own_company"
ON public.vendors FOR INSERT
WITH CHECK (company_id = public.get_current_company_id());

CREATE POLICY "vendors_update_own_company"
ON public.vendors FOR UPDATE
USING (company_id = public.get_current_company_id());

CREATE POLICY "vendors_delete_own_company"
ON public.vendors FOR DELETE
USING (
  company_id = public.get_current_company_id()
  AND public.user_has_role(ARRAY['owner', 'admin'])
);

-- ============================================================================
-- INVOICES TABLE
-- ============================================================================
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_select_own_company"
ON public.invoices FOR SELECT
USING (company_id = public.get_current_company_id());

CREATE POLICY "invoices_insert_own_company"
ON public.invoices FOR INSERT
WITH CHECK (company_id = public.get_current_company_id());

CREATE POLICY "invoices_update_own_company"
ON public.invoices FOR UPDATE
USING (company_id = public.get_current_company_id());

CREATE POLICY "invoices_delete_own_company"
ON public.invoices FOR DELETE
USING (
  company_id = public.get_current_company_id()
  AND public.user_has_role(ARRAY['owner', 'admin', 'pm'])
);

-- ============================================================================
-- DRAWS TABLE
-- ============================================================================
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;

CREATE POLICY "draws_select_own_company"
ON public.draws FOR SELECT
USING (company_id = public.get_current_company_id());

CREATE POLICY "draws_insert_own_company"
ON public.draws FOR INSERT
WITH CHECK (
  company_id = public.get_current_company_id()
  AND public.user_has_role(ARRAY['owner', 'admin', 'pm', 'office'])
);

CREATE POLICY "draws_update_own_company"
ON public.draws FOR UPDATE
USING (company_id = public.get_current_company_id());

CREATE POLICY "draws_delete_own_company"
ON public.draws FOR DELETE
USING (
  company_id = public.get_current_company_id()
  AND public.user_has_role(ARRAY['owner', 'admin'])
);

-- ============================================================================
-- SERVICE ROLE BYPASS (for server-side operations)
-- These policies allow the service role to bypass RLS for admin operations
-- ============================================================================

-- Grant service role access
ALTER TABLE public.companies FORCE ROW LEVEL SECURITY;
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
ALTER TABLE public.clients FORCE ROW LEVEL SECURITY;
ALTER TABLE public.jobs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.vendors FORCE ROW LEVEL SECURITY;
ALTER TABLE public.invoices FORCE ROW LEVEL SECURITY;
ALTER TABLE public.draws FORCE ROW LEVEL SECURITY;
