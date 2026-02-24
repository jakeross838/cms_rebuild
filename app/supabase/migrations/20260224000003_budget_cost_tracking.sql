-- ============================================================================
-- Module 09: Budget & Cost Tracking — V1 Foundation
-- ============================================================================
-- Core tables for budget creation, budget line items, cost transactions,
-- and change audit logging. Maps spec's builder_id -> company_id for
-- multi-tenant consistency.
-- ============================================================================

-- ── Budgets ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS budgets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  job_id          UUID NOT NULL REFERENCES jobs(id),
  name            VARCHAR(255) NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'active', 'locked', 'archived')),
  total_amount    DECIMAL(15,2) NOT NULL DEFAULT 0,
  approved_by     UUID REFERENCES users(id),
  approved_at     TIMESTAMPTZ,
  version         INTEGER NOT NULL DEFAULT 1,
  notes           TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_budgets_company_id ON budgets(company_id);
CREATE INDEX idx_budgets_job_id ON budgets(job_id);
CREATE INDEX idx_budgets_status ON budgets(status);
CREATE INDEX idx_budgets_deleted_at ON budgets(deleted_at) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY budgets_tenant_isolation ON budgets
  USING (company_id = get_current_company_id());

CREATE POLICY budgets_tenant_insert ON budgets
  FOR INSERT WITH CHECK (company_id = get_current_company_id());

-- ── Budget Lines ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS budget_lines (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id         UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  company_id        UUID NOT NULL REFERENCES companies(id),
  job_id            UUID NOT NULL REFERENCES jobs(id),
  cost_code_id      UUID REFERENCES cost_codes(id),
  phase             VARCHAR(100),
  description       VARCHAR(500) NOT NULL,
  estimated_amount  DECIMAL(15,2) NOT NULL DEFAULT 0,
  committed_amount  DECIMAL(15,2) NOT NULL DEFAULT 0,
  actual_amount     DECIMAL(15,2) NOT NULL DEFAULT 0,
  projected_amount  DECIMAL(15,2) NOT NULL DEFAULT 0,
  variance_amount   DECIMAL(15,2) NOT NULL DEFAULT 0,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_budget_lines_company_id ON budget_lines(company_id);
CREATE INDEX idx_budget_lines_budget_id ON budget_lines(budget_id);
CREATE INDEX idx_budget_lines_job_id ON budget_lines(job_id);
CREATE INDEX idx_budget_lines_cost_code_id ON budget_lines(cost_code_id);

-- RLS
ALTER TABLE budget_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY budget_lines_tenant_isolation ON budget_lines
  USING (company_id = get_current_company_id());

CREATE POLICY budget_lines_tenant_insert ON budget_lines
  FOR INSERT WITH CHECK (company_id = get_current_company_id());

-- ── Cost Transactions ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cost_transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL REFERENCES companies(id),
  job_id            UUID NOT NULL REFERENCES jobs(id),
  budget_line_id    UUID REFERENCES budget_lines(id),
  cost_code_id      UUID REFERENCES cost_codes(id),
  transaction_type  VARCHAR(20) NOT NULL
                      CHECK (transaction_type IN ('commitment', 'actual', 'adjustment', 'transfer')),
  amount            DECIMAL(15,2) NOT NULL,
  description       TEXT,
  reference_type    VARCHAR(50),
  reference_id      UUID,
  transaction_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  vendor_id         UUID REFERENCES vendors(id),
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_cost_transactions_company_id ON cost_transactions(company_id);
CREATE INDEX idx_cost_transactions_job_id ON cost_transactions(job_id);
CREATE INDEX idx_cost_transactions_budget_line_id ON cost_transactions(budget_line_id);
CREATE INDEX idx_cost_transactions_cost_code_id ON cost_transactions(cost_code_id);
CREATE INDEX idx_cost_transactions_vendor_id ON cost_transactions(vendor_id);
CREATE INDEX idx_cost_transactions_type ON cost_transactions(transaction_type);
CREATE INDEX idx_cost_transactions_date ON cost_transactions(transaction_date);

-- RLS
ALTER TABLE cost_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY cost_transactions_tenant_isolation ON cost_transactions
  USING (company_id = get_current_company_id());

CREATE POLICY cost_transactions_tenant_insert ON cost_transactions
  FOR INSERT WITH CHECK (company_id = get_current_company_id());

-- ── Budget Change Logs ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS budget_change_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id       UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  field_changed   VARCHAR(100) NOT NULL,
  old_value       TEXT,
  new_value       TEXT,
  changed_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_budget_change_logs_budget_id ON budget_change_logs(budget_id);

-- RLS
ALTER TABLE budget_change_logs ENABLE ROW LEVEL SECURITY;

-- Change logs inherit access from the parent budget's company via budget_id join.
-- For simplicity in V1, use a subquery-based policy.
CREATE POLICY budget_change_logs_tenant_isolation ON budget_change_logs
  USING (
    EXISTS (
      SELECT 1 FROM budgets b
      WHERE b.id = budget_change_logs.budget_id
        AND b.company_id = get_current_company_id()
    )
  );

CREATE POLICY budget_change_logs_tenant_insert ON budget_change_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM budgets b
      WHERE b.id = budget_change_logs.budget_id
        AND b.company_id = get_current_company_id()
    )
  );

-- ── Updated-at triggers ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_budget_lines_updated_at
  BEFORE UPDATE ON budget_lines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
