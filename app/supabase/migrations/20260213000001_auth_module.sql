-- =====================================================================
-- RossOS Auth Module Migration
-- Module 01: Authentication & Access Control
-- Creates: roles, auth_audit_log, project_user_roles tables
-- Alters:  users table (adds deleted_at, updates RLS policies)
-- =====================================================================
-- IMPORTANT: This migration does NOT recreate:
--   - get_current_company_id() function
--   - user_has_role() function
--   - user_belongs_to_company() function
--   - prevent_role_escalation() trigger
--   - prevent_company_id_change() trigger function
--   - update_updated_at() trigger function
--   - audit_log table
--   - Any existing RLS policies on companies, users, jobs, clients, vendors
-- =====================================================================

-- =====================================================================
-- SECTION 1: ROLES TABLE
-- Custom and system roles per tenant. Each role inherits from a base
-- system role and can add/remove specific permissions.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_role TEXT NOT NULL CHECK (base_role IN ('owner', 'admin', 'pm', 'superintendent', 'office', 'field', 'read_only')),
  is_system BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT '[]',
  field_overrides JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  UNIQUE(company_id, name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_roles_company
  ON public.roles(company_id);
CREATE INDEX IF NOT EXISTS idx_roles_company_base_role
  ON public.roles(company_id, base_role);

-- RLS: enable + force
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles FORCE ROW LEVEL SECURITY;

-- SELECT: any user in the same company can view non-deleted roles
CREATE POLICY "roles_select_own_company" ON public.roles
  FOR SELECT
  USING (
    company_id = public.get_current_company_id()
    AND deleted_at IS NULL
  );

-- INSERT: only owner/admin can create roles in their company
CREATE POLICY "roles_insert_own_company" ON public.roles
  FOR INSERT
  WITH CHECK (
    company_id = public.get_current_company_id()
    AND public.user_has_role(ARRAY['owner', 'admin'])
  );

-- UPDATE: only owner/admin can update roles in their company
CREATE POLICY "roles_update_own_company" ON public.roles
  FOR UPDATE
  USING (
    company_id = public.get_current_company_id()
    AND public.user_has_role(ARRAY['owner', 'admin'])
  )
  WITH CHECK (
    company_id = public.get_current_company_id()
  );

-- NO DELETE POLICY: soft delete only — use UPDATE to set deleted_at

-- Triggers
CREATE TRIGGER set_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER prevent_company_id_change_roles
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_company_id_change();

-- =====================================================================
-- SECTION 2: AUTH AUDIT LOG TABLE
-- Append-only log for authentication and authorization events.
-- Inserts happen via service role (bypasses RLS). User-facing reads
-- are restricted to owner/admin of the same company.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.auth_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_company_created
  ON public.auth_audit_log(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_user_created
  ON public.auth_audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_event_type
  ON public.auth_audit_log(event_type);

-- RLS: enable + force
ALTER TABLE public.auth_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_audit_log FORCE ROW LEVEL SECURITY;

-- SELECT: only owner/admin can view auth audit logs for their company
CREATE POLICY "auth_audit_log_select_own_company" ON public.auth_audit_log
  FOR SELECT
  USING (
    company_id = public.get_current_company_id()
    AND public.user_has_role(ARRAY['owner', 'admin'])
  );

-- NO INSERT policy: inserts are done via service role which bypasses RLS
-- NO UPDATE policy: append-only, no modifications allowed
-- NO DELETE policy: append-only, no deletions allowed

-- =====================================================================
-- SECTION 3: PROJECT USER ROLES TABLE
-- Per-project role overrides. A user can have a different effective role
-- on each job, overriding their company-wide role.
-- v1: table exists but not enforced — company-wide role applies everywhere.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.project_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
  role_override TEXT CHECK (role_override IN ('owner', 'admin', 'pm', 'superintendent', 'office', 'field', 'read_only')),
  granted_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- RLS: enable + force
ALTER TABLE public.project_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_user_roles FORCE ROW LEVEL SECURITY;

-- SELECT: any user in the same company can view project role assignments
CREATE POLICY "project_user_roles_select_own_company" ON public.project_user_roles
  FOR SELECT
  USING (
    company_id = public.get_current_company_id()
  );

-- INSERT: owner/admin/pm can assign project-level roles
CREATE POLICY "project_user_roles_insert_own_company" ON public.project_user_roles
  FOR INSERT
  WITH CHECK (
    company_id = public.get_current_company_id()
    AND public.user_has_role(ARRAY['owner', 'admin', 'pm'])
  );

-- UPDATE: owner/admin/pm can change project-level roles
CREATE POLICY "project_user_roles_update_own_company" ON public.project_user_roles
  FOR UPDATE
  USING (
    company_id = public.get_current_company_id()
    AND public.user_has_role(ARRAY['owner', 'admin', 'pm'])
  )
  WITH CHECK (
    company_id = public.get_current_company_id()
  );

-- DELETE: owner/admin/pm can remove project-level role assignments
CREATE POLICY "project_user_roles_delete_own_company" ON public.project_user_roles
  FOR DELETE
  USING (
    company_id = public.get_current_company_id()
    AND public.user_has_role(ARRAY['owner', 'admin', 'pm'])
  );

-- Triggers
CREATE TRIGGER prevent_company_id_change_project_user_roles
  BEFORE UPDATE ON public.project_user_roles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_company_id_change();

-- =====================================================================
-- SECTION 4: ALTER USERS TABLE — ADD deleted_at FOR SOFT DELETE
-- Adds soft delete support to the users table. Updates the SELECT RLS
-- policy so normal queries exclude soft-deleted users, and adds a
-- separate policy for admins to view deleted users (for restore UI).
-- =====================================================================

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Drop the existing SELECT policy and recreate with deleted_at filter
DROP POLICY IF EXISTS "users_select_same_company" ON public.users;

-- Normal users see only non-deleted users in their company
CREATE POLICY "users_select_same_company" ON public.users
  FOR SELECT
  USING (
    company_id = public.get_current_company_id()
    AND deleted_at IS NULL
  );

-- Admin-only policy: owner/admin can also see deleted users (for restore)
CREATE POLICY "users_select_deleted_admin" ON public.users
  FOR SELECT
  USING (
    company_id = public.get_current_company_id()
    AND deleted_at IS NOT NULL
    AND public.user_has_role(ARRAY['owner', 'admin'])
  );

-- =====================================================================
-- SECTION 5: UPDATE STATISTICS
-- =====================================================================

ANALYZE public.roles;
ANALYZE public.auth_audit_log;
ANALYZE public.project_user_roles;
ANALYZE public.users;
