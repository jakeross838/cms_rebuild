-- ============================================================================
-- Module 26: Bid Management — V1 Foundation
-- Tables: bid_packages, bid_invitations, bid_responses, bid_comparisons, bid_awards
-- ============================================================================

-- ── Bid Packages ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bid_packages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  job_id          UUID NOT NULL,
  title           VARCHAR(200) NOT NULL,
  description     TEXT,
  trade           VARCHAR(100),
  scope_of_work   TEXT,
  bid_due_date    DATE,
  status          VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'published', 'closed', 'awarded', 'cancelled'
  )),
  documents       JSONB DEFAULT '[]',
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

ALTER TABLE bid_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bid_packages_tenant_isolation"
  ON bid_packages
  FOR ALL
  USING (company_id = (current_setting('app.current_company_id', true))::uuid);

CREATE INDEX idx_bid_packages_company_id ON bid_packages(company_id);
CREATE INDEX idx_bid_packages_job_id ON bid_packages(job_id);
CREATE INDEX idx_bid_packages_status ON bid_packages(status);
CREATE INDEX idx_bid_packages_company_status ON bid_packages(company_id, status);
CREATE INDEX idx_bid_packages_company_job ON bid_packages(company_id, job_id);
CREATE INDEX idx_bid_packages_bid_due_date ON bid_packages(bid_due_date);
CREATE INDEX idx_bid_packages_created_at ON bid_packages(created_at DESC);
CREATE INDEX idx_bid_packages_deleted_at ON bid_packages(deleted_at) WHERE deleted_at IS NULL;

-- ── Bid Invitations ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bid_invitations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  bid_package_id  UUID NOT NULL REFERENCES bid_packages(id) ON DELETE CASCADE,
  vendor_id       UUID NOT NULL,
  status          VARCHAR(30) NOT NULL DEFAULT 'invited' CHECK (status IN (
    'invited', 'viewed', 'declined', 'submitted'
  )),
  invited_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  viewed_at       TIMESTAMPTZ,
  responded_at    TIMESTAMPTZ,
  decline_reason  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE bid_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bid_invitations_tenant_isolation"
  ON bid_invitations
  FOR ALL
  USING (company_id = (current_setting('app.current_company_id', true))::uuid);

CREATE INDEX idx_bid_invitations_company_id ON bid_invitations(company_id);
CREATE INDEX idx_bid_invitations_bid_package_id ON bid_invitations(bid_package_id);
CREATE INDEX idx_bid_invitations_vendor_id ON bid_invitations(vendor_id);
CREATE INDEX idx_bid_invitations_status ON bid_invitations(status);
CREATE INDEX idx_bid_invitations_package_vendor ON bid_invitations(bid_package_id, vendor_id);

-- ── Bid Responses ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bid_responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  bid_package_id  UUID NOT NULL REFERENCES bid_packages(id) ON DELETE CASCADE,
  vendor_id       UUID NOT NULL,
  invitation_id   UUID REFERENCES bid_invitations(id) ON DELETE SET NULL,
  total_amount    NUMERIC(15,2) NOT NULL DEFAULT 0,
  breakdown       JSONB DEFAULT '{}',
  notes           TEXT,
  attachments     JSONB DEFAULT '[]',
  submitted_at    TIMESTAMPTZ,
  is_qualified    BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE bid_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bid_responses_tenant_isolation"
  ON bid_responses
  FOR ALL
  USING (company_id = (current_setting('app.current_company_id', true))::uuid);

CREATE INDEX idx_bid_responses_company_id ON bid_responses(company_id);
CREATE INDEX idx_bid_responses_bid_package_id ON bid_responses(bid_package_id);
CREATE INDEX idx_bid_responses_vendor_id ON bid_responses(vendor_id);
CREATE INDEX idx_bid_responses_invitation_id ON bid_responses(invitation_id);
CREATE INDEX idx_bid_responses_package_vendor ON bid_responses(bid_package_id, vendor_id);

-- ── Bid Comparisons ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bid_comparisons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  bid_package_id  UUID NOT NULL REFERENCES bid_packages(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  comparison_data JSONB DEFAULT '{}',
  notes           TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE bid_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bid_comparisons_tenant_isolation"
  ON bid_comparisons
  FOR ALL
  USING (company_id = (current_setting('app.current_company_id', true))::uuid);

CREATE INDEX idx_bid_comparisons_company_id ON bid_comparisons(company_id);
CREATE INDEX idx_bid_comparisons_bid_package_id ON bid_comparisons(bid_package_id);

-- ── Bid Awards ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bid_awards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  bid_package_id  UUID NOT NULL REFERENCES bid_packages(id) ON DELETE CASCADE,
  vendor_id       UUID NOT NULL,
  bid_response_id UUID REFERENCES bid_responses(id) ON DELETE SET NULL,
  award_amount    NUMERIC(15,2) NOT NULL DEFAULT 0,
  notes           TEXT,
  awarded_by      UUID REFERENCES users(id),
  awarded_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  status          VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'rejected', 'withdrawn'
  )),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE bid_awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bid_awards_tenant_isolation"
  ON bid_awards
  FOR ALL
  USING (company_id = (current_setting('app.current_company_id', true))::uuid);

CREATE INDEX idx_bid_awards_company_id ON bid_awards(company_id);
CREATE INDEX idx_bid_awards_bid_package_id ON bid_awards(bid_package_id);
CREATE INDEX idx_bid_awards_vendor_id ON bid_awards(vendor_id);
CREATE INDEX idx_bid_awards_bid_response_id ON bid_awards(bid_response_id);
CREATE INDEX idx_bid_awards_status ON bid_awards(status);

-- ── Updated_at Triggers ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_bid_management_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bid_packages_updated_at
  BEFORE UPDATE ON bid_packages
  FOR EACH ROW EXECUTE FUNCTION update_bid_management_updated_at();

CREATE TRIGGER trg_bid_invitations_updated_at
  BEFORE UPDATE ON bid_invitations
  FOR EACH ROW EXECUTE FUNCTION update_bid_management_updated_at();

CREATE TRIGGER trg_bid_responses_updated_at
  BEFORE UPDATE ON bid_responses
  FOR EACH ROW EXECUTE FUNCTION update_bid_management_updated_at();

CREATE TRIGGER trg_bid_comparisons_updated_at
  BEFORE UPDATE ON bid_comparisons
  FOR EACH ROW EXECUTE FUNCTION update_bid_management_updated_at();

CREATE TRIGGER trg_bid_awards_updated_at
  BEFORE UPDATE ON bid_awards
  FOR EACH ROW EXECUTE FUNCTION update_bid_management_updated_at();
