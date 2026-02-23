-- =====================================================================
-- RossOS User Invitations Migration
-- Module 01: Authentication & Access Control
-- Creates: user_invitations table for invite-based user onboarding
-- =====================================================================

-- =====================================================================
-- SECTION 1: USER INVITATIONS TABLE
-- Stores pending invitations sent to users. Once accepted, the invitation
-- is marked with accepted_at. Token is hashed for security.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,

  -- Invitee details
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'field' CHECK (role IN ('owner', 'admin', 'pm', 'superintendent', 'office', 'field', 'read_only')),

  -- Invite token (hashed for security)
  token_hash TEXT NOT NULL UNIQUE,

  -- Lifecycle
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ DEFAULT NULL,
  revoked_at TIMESTAMPTZ DEFAULT NULL,

  -- Who sent the invite
  invited_by UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_pending_invite UNIQUE (company_id, email, accepted_at)
);

-- Add comment
COMMENT ON TABLE public.user_invitations IS 'Pending user invitations. Token is hashed with SHA-256. Once accepted, accepted_at is set.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_invitations_company
  ON public.user_invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_user_invitations_email
  ON public.user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token_hash
  ON public.user_invitations(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_invitations_pending
  ON public.user_invitations(company_id, email)
  WHERE accepted_at IS NULL AND revoked_at IS NULL AND expires_at > NOW();

-- RLS: enable + force
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations FORCE ROW LEVEL SECURITY;

-- SELECT: owner/admin can view invitations for their company
CREATE POLICY "user_invitations_select_own_company" ON public.user_invitations
  FOR SELECT
  USING (
    company_id = public.get_current_company_id()
    AND public.user_has_role(ARRAY['owner', 'admin'])
  );

-- INSERT: owner/admin can create invitations
CREATE POLICY "user_invitations_insert_own_company" ON public.user_invitations
  FOR INSERT
  WITH CHECK (
    company_id = public.get_current_company_id()
    AND public.user_has_role(ARRAY['owner', 'admin', 'pm'])
  );

-- UPDATE: owner/admin can update (e.g., revoke) invitations
CREATE POLICY "user_invitations_update_own_company" ON public.user_invitations
  FOR UPDATE
  USING (
    company_id = public.get_current_company_id()
    AND public.user_has_role(ARRAY['owner', 'admin'])
  )
  WITH CHECK (
    company_id = public.get_current_company_id()
  );

-- NO DELETE policy: invitations are soft-revoked, not deleted

-- Triggers
CREATE TRIGGER set_user_invitations_updated_at
  BEFORE UPDATE ON public.user_invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER prevent_company_id_change_user_invitations
  BEFORE UPDATE ON public.user_invitations
  FOR EACH ROW EXECUTE FUNCTION public.prevent_company_id_change();

-- =====================================================================
-- SECTION 2: HELPER FUNCTION FOR TOKEN LOOKUP
-- Used by the accept-invite endpoint (service role) to validate tokens
-- =====================================================================

CREATE OR REPLACE FUNCTION public.get_invitation_by_token(p_token_hash TEXT)
RETURNS TABLE (
  id UUID,
  company_id UUID,
  email TEXT,
  name TEXT,
  role TEXT,
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  company_name TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    i.id,
    i.company_id,
    i.email,
    i.name,
    i.role,
    i.expires_at,
    i.accepted_at,
    i.revoked_at,
    c.name AS company_name
  FROM public.user_invitations i
  JOIN public.companies c ON c.id = i.company_id
  WHERE i.token_hash = p_token_hash
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_invitation_by_token IS 'Looks up an invitation by its hashed token. Used by accept-invite endpoint.';

-- =====================================================================
-- SECTION 3: UPDATE STATISTICS
-- =====================================================================

ANALYZE public.user_invitations;
