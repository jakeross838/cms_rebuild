-- ============================================================================
-- Module 38: Contracts & E-Signature — V1 Foundation
-- ============================================================================
-- Tables: contracts, contract_versions, contract_signers,
--         contract_templates, contract_clauses
-- Multi-tenant: company_id on every table + RLS
-- Soft delete: deleted_at on contracts
-- ============================================================================

-- ── contracts ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contracts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  job_id          UUID REFERENCES jobs(id),
  contract_number VARCHAR(50) NOT NULL,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  contract_type   TEXT NOT NULL DEFAULT 'prime'
                    CHECK (contract_type IN ('prime','subcontract','purchase_order','service_agreement','change_order','amendment','nda','other')),
  status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','pending_review','sent_for_signature','partially_signed','fully_signed','active','expired','terminated','voided')),
  template_id     UUID,
  vendor_id       UUID,
  client_id       UUID,
  contract_value  NUMERIC(15,2) DEFAULT 0,
  retention_pct   NUMERIC(5,2) DEFAULT 0,
  start_date      DATE,
  end_date        DATE,
  executed_at     TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  content         TEXT,
  metadata        JSONB DEFAULT '{}',
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_contracts_company_id     ON contracts(company_id);
CREATE INDEX idx_contracts_job_id         ON contracts(job_id);
CREATE INDEX idx_contracts_status         ON contracts(status);
CREATE INDEX idx_contracts_contract_type  ON contracts(contract_type);
CREATE INDEX idx_contracts_vendor_id      ON contracts(vendor_id);
CREATE INDEX idx_contracts_client_id      ON contracts(client_id);
CREATE INDEX idx_contracts_template_id    ON contracts(template_id);
CREATE INDEX idx_contracts_number         ON contracts(company_id, contract_number);
CREATE INDEX idx_contracts_company_status ON contracts(company_id, status);
CREATE INDEX idx_contracts_company_job    ON contracts(company_id, job_id);
CREATE INDEX idx_contracts_created_at     ON contracts(created_at DESC);
CREATE INDEX idx_contracts_deleted_at     ON contracts(deleted_at) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY contracts_tenant_isolation ON contracts
  USING (company_id = get_current_company_id());

-- updated_at trigger
CREATE TRIGGER set_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ── contract_versions ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contract_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id     UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  company_id      UUID NOT NULL REFERENCES companies(id),
  version_number  INT NOT NULL,
  change_summary  TEXT,
  content         TEXT,
  snapshot_json   JSONB DEFAULT '{}',
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_contract_versions_contract_id ON contract_versions(contract_id);
CREATE INDEX idx_contract_versions_company_id  ON contract_versions(company_id);
CREATE INDEX idx_contract_versions_number      ON contract_versions(contract_id, version_number);

-- RLS
ALTER TABLE contract_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY contract_versions_tenant_isolation ON contract_versions
  USING (company_id = get_current_company_id());

-- ── contract_signers ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contract_signers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id     UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  company_id      UUID NOT NULL REFERENCES companies(id),
  name            VARCHAR(200) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  role            TEXT NOT NULL DEFAULT 'other'
                    CHECK (role IN ('owner','client','subcontractor','architect','engineer','other')),
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','viewed','signed','declined','expired')),
  sign_order      INT DEFAULT 0,
  signed_at       TIMESTAMPTZ,
  declined_at     TIMESTAMPTZ,
  decline_reason  TEXT,
  viewed_at       TIMESTAMPTZ,
  ip_address      VARCHAR(45),
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_contract_signers_contract_id ON contract_signers(contract_id);
CREATE INDEX idx_contract_signers_company_id  ON contract_signers(company_id);
CREATE INDEX idx_contract_signers_email       ON contract_signers(email);
CREATE INDEX idx_contract_signers_status      ON contract_signers(status);
CREATE INDEX idx_contract_signers_role        ON contract_signers(role);

-- RLS
ALTER TABLE contract_signers ENABLE ROW LEVEL SECURITY;

CREATE POLICY contract_signers_tenant_isolation ON contract_signers
  USING (company_id = get_current_company_id());

-- updated_at trigger
CREATE TRIGGER set_contract_signers_updated_at
  BEFORE UPDATE ON contract_signers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ── contract_templates ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contract_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  name            VARCHAR(200) NOT NULL,
  description     TEXT,
  contract_type   TEXT NOT NULL DEFAULT 'prime'
                    CHECK (contract_type IN ('prime','subcontract','purchase_order','service_agreement','change_order','amendment','nda','other')),
  content         TEXT,
  clauses         JSONB DEFAULT '[]',
  variables       JSONB DEFAULT '[]',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  is_system       BOOLEAN NOT NULL DEFAULT false,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_contract_templates_company_id     ON contract_templates(company_id);
CREATE INDEX idx_contract_templates_contract_type  ON contract_templates(contract_type);
CREATE INDEX idx_contract_templates_is_active      ON contract_templates(is_active);
CREATE INDEX idx_contract_templates_company_active ON contract_templates(company_id, is_active);

-- RLS
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY contract_templates_tenant_isolation ON contract_templates
  USING (company_id = get_current_company_id());

-- updated_at trigger
CREATE TRIGGER set_contract_templates_updated_at
  BEFORE UPDATE ON contract_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ── contract_clauses ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contract_clauses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  name            VARCHAR(200) NOT NULL,
  description     TEXT,
  category        VARCHAR(100),
  content         TEXT NOT NULL,
  is_required     BOOLEAN NOT NULL DEFAULT false,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INT DEFAULT 0,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_contract_clauses_company_id  ON contract_clauses(company_id);
CREATE INDEX idx_contract_clauses_category    ON contract_clauses(category);
CREATE INDEX idx_contract_clauses_is_active   ON contract_clauses(is_active);
CREATE INDEX idx_contract_clauses_company_active ON contract_clauses(company_id, is_active);

-- RLS
ALTER TABLE contract_clauses ENABLE ROW LEVEL SECURITY;

CREATE POLICY contract_clauses_tenant_isolation ON contract_clauses
  USING (company_id = get_current_company_id());

-- updated_at trigger
CREATE TRIGGER set_contract_clauses_updated_at
  BEFORE UPDATE ON contract_clauses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
