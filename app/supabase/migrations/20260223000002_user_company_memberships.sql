-- =====================================================================
-- RossOS User Company Memberships Migration
-- Module 01: Authentication & Access Control
-- Creates: user_company_memberships table for multi-tenant user access
-- =====================================================================
-- This table enables a single auth user (identified by auth.users.id) to
-- belong to multiple companies. Each membership has its own role.
-- =====================================================================

-- =====================================================================
-- SECTION 1: USER COMPANY MEMBERSHIPS TABLE
-- Junction table linking auth users to companies with roles.
-- Replaces the single company_id on users table for multi-tenant scenarios.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.user_company_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The auth user (from auth.users)
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- The company they belong to
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,

  -- Their role in this company
  role TEXT NOT NULL DEFAULT 'field' CHECK (role IN ('owner', 'admin', 'pm', 'superintendent', 'office', 'field', 'read_only')),

  -- Status of the membership
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'deactivated')),

  -- Who invited them (NULL for self-signup)
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ,

  -- When they accepted the invite
  accepted_at TIMESTAMPTZ,

  -- When they were deactivated (if applicable)
  deactivated_at TIMESTAMPTZ,
  deactivated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Each user can only have one membership per company
  UNIQUE(auth_user_id, company_id)
);

-- Add comment
COMMENT ON TABLE public.user_company_memberships IS 'Maps auth users to companies with roles. Enables multi-tenant user access.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_company_memberships_auth_user
  ON public.user_company_memberships(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_company_memberships_company
  ON public.user_company_memberships(company_id);
CREATE INDEX IF NOT EXISTS idx_user_company_memberships_active
  ON public.user_company_memberships(auth_user_id, status)
  WHERE status = 'active';

-- RLS: enable + force
ALTER TABLE public.user_company_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_company_memberships FORCE ROW LEVEL SECURITY;

-- SELECT: Users can see their own memberships
CREATE POLICY "user_company_memberships_select_own" ON public.user_company_memberships
  FOR SELECT
  USING (auth_user_id = auth.uid());

-- SELECT: Owner/admin can see all memberships in their company
CREATE POLICY "user_company_memberships_select_company" ON public.user_company_memberships
  FOR SELECT
  USING (
    company_id = public.get_current_company_id()
    AND public.user_has_role(ARRAY['owner', 'admin'])
  );

-- INSERT: Owner/admin can create memberships in their company
CREATE POLICY "user_company_memberships_insert" ON public.user_company_memberships
  FOR INSERT
  WITH CHECK (
    company_id = public.get_current_company_id()
    AND public.user_has_role(ARRAY['owner', 'admin', 'pm'])
  );

-- UPDATE: Owner/admin can update memberships in their company
CREATE POLICY "user_company_memberships_update" ON public.user_company_memberships
  FOR UPDATE
  USING (
    company_id = public.get_current_company_id()
    AND public.user_has_role(ARRAY['owner', 'admin'])
  )
  WITH CHECK (
    company_id = public.get_current_company_id()
  );

-- NO DELETE: memberships are deactivated, not deleted

-- Triggers
CREATE TRIGGER set_user_company_memberships_updated_at
  BEFORE UPDATE ON public.user_company_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================================
-- SECTION 2: HELPER FUNCTION TO GET USER'S COMPANIES
-- Returns all companies a user belongs to with their role in each
-- =====================================================================

CREATE OR REPLACE FUNCTION public.get_user_companies(p_auth_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  membership_id UUID,
  company_id UUID,
  company_name TEXT,
  role TEXT,
  status TEXT,
  is_current BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    m.id AS membership_id,
    m.company_id,
    c.name AS company_name,
    m.role,
    m.status,
    (m.company_id = public.get_current_company_id()) AS is_current
  FROM public.user_company_memberships m
  JOIN public.companies c ON c.id = m.company_id
  WHERE m.auth_user_id = p_auth_user_id
    AND m.status = 'active'
  ORDER BY c.name;
$$;

COMMENT ON FUNCTION public.get_user_companies IS 'Returns all companies a user belongs to with their membership details.';

-- =====================================================================
-- SECTION 3: MIGRATE EXISTING USERS TO MEMBERSHIPS TABLE
-- Creates membership records for all existing users based on their
-- current company_id and role in the users table.
-- =====================================================================

INSERT INTO public.user_company_memberships (
  auth_user_id,
  company_id,
  role,
  status,
  accepted_at,
  created_at
)
SELECT
  u.id AS auth_user_id,
  u.company_id,
  u.role,
  CASE WHEN u.is_active THEN 'active' ELSE 'deactivated' END AS status,
  u.created_at AS accepted_at,
  u.created_at
FROM public.users u
WHERE u.company_id IS NOT NULL
ON CONFLICT (auth_user_id, company_id) DO NOTHING;

-- =====================================================================
-- SECTION 4: UPDATE STATISTICS
-- =====================================================================

ANALYZE public.user_company_memberships;
