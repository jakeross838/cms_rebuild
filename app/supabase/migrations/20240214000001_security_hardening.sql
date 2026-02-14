-- ============================================================================
-- SECURITY HARDENING MIGRATION
-- Fixes critical security gaps identified in production audit
-- ============================================================================

-- ============================================================================
-- 1. PREVENT company_id MUTATION ON ALL TENANT TABLES
-- A user should NEVER be able to change the company_id on a row.
-- This trigger prevents "data donation" attacks and tenant escape.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.prevent_company_id_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.company_id IS DISTINCT FROM NEW.company_id THEN
    RAISE EXCEPTION 'company_id cannot be changed (attempted: % -> %)', OLD.company_id, NEW.company_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with direct company_id
CREATE TRIGGER prevent_company_id_change_users BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.prevent_company_id_change();
CREATE TRIGGER prevent_company_id_change_jobs BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_company_id_change();
CREATE TRIGGER prevent_company_id_change_clients BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.prevent_company_id_change();
CREATE TRIGGER prevent_company_id_change_vendors BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.prevent_company_id_change();
CREATE TRIGGER prevent_company_id_change_cost_codes BEFORE UPDATE ON public.cost_codes
  FOR EACH ROW EXECUTE FUNCTION public.prevent_company_id_change();
CREATE TRIGGER prevent_company_id_change_job_queue BEFORE UPDATE ON public.job_queue
  FOR EACH ROW EXECUTE FUNCTION public.prevent_company_id_change();
CREATE TRIGGER prevent_company_id_change_audit_log BEFORE UPDATE ON public.audit_log
  FOR EACH ROW EXECUTE FUNCTION public.prevent_company_id_change();

-- ============================================================================
-- 2. PREVENT ROLE ESCALATION ON USERS TABLE
-- Only owners/admins can change a user's role. Users cannot change their own.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is being changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Only allow if the current user has owner or admin role
    IF NOT public.user_has_role(ARRAY['owner', 'admin']) THEN
      RAISE EXCEPTION 'Only owners and admins can change user roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_role_escalation_users BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- ============================================================================
-- 3. FIX users_update_own_profile POLICY
-- The existing policy allows users to update ANY column on their own row,
-- including company_id and role. Drop and recreate with proper restrictions.
-- The prevent_company_id_change and prevent_role_escalation triggers above
-- provide defense-in-depth, but the policy should also be tightened.
-- ============================================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "users_update_own_profile" ON public.users;

-- Recreate with company_id check
CREATE POLICY "users_update_own_profile"
ON public.users FOR UPDATE
USING (id = auth.uid() AND company_id = public.get_current_company_id())
WITH CHECK (company_id = public.get_current_company_id());

-- ============================================================================
-- 4. ADD WITH CHECK TO UPDATE POLICIES FROM MIGRATION 1
-- Update policies need WITH CHECK to prevent writing invalid company_id values.
-- ============================================================================

-- Clients: add WITH CHECK
DROP POLICY IF EXISTS "clients_update_own_company" ON public.clients;
CREATE POLICY "clients_update_own_company"
ON public.clients FOR UPDATE
USING (company_id = public.get_current_company_id())
WITH CHECK (company_id = public.get_current_company_id());

-- Jobs: add WITH CHECK
DROP POLICY IF EXISTS "jobs_update_own_company" ON public.jobs;
CREATE POLICY "jobs_update_own_company"
ON public.jobs FOR UPDATE
USING (company_id = public.get_current_company_id())
WITH CHECK (company_id = public.get_current_company_id());

-- Vendors: add WITH CHECK
DROP POLICY IF EXISTS "vendors_update_own_company" ON public.vendors;
CREATE POLICY "vendors_update_own_company"
ON public.vendors FOR UPDATE
USING (company_id = public.get_current_company_id())
WITH CHECK (company_id = public.get_current_company_id());

-- Companies: add WITH CHECK (owners only)
DROP POLICY IF EXISTS "companies_update_own" ON public.companies;
CREATE POLICY "companies_update_own"
ON public.companies FOR UPDATE
USING (id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']))
WITH CHECK (id = public.get_current_company_id());

-- ============================================================================
-- 5. AUDIT LOG IMMUTABILITY
-- Audit log entries should NEVER be updated or deleted by any user.
-- Only the cleanup cron (via service role) can manage old entries.
-- ============================================================================

-- No UPDATE policy exists (default deny is correct)
-- No DELETE policy exists (default deny is correct)
-- The INSERT policy from migration 3 is the only write access

-- ============================================================================
-- 6. ENTITY CHANGE LOG AND SNAPSHOTS - APPEND ONLY
-- These audit tables should be insert-only for authenticated users.
-- ============================================================================

CREATE POLICY "entity_change_log_insert" ON public.entity_change_log
  FOR INSERT WITH CHECK (company_id = public.get_current_company_id());

CREATE POLICY "entity_snapshots_insert" ON public.entity_snapshots
  FOR INSERT WITH CHECK (company_id = public.get_current_company_id());
