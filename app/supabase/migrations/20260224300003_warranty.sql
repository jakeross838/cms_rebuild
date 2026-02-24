-- ==========================================================================
-- Module 31: Warranty & Home Care — V1 Foundation
-- ==========================================================================
-- Tables: warranties, warranty_claims, warranty_claim_history,
--         maintenance_schedules, maintenance_tasks
-- Multi-tenant: company_id on every table + RLS
-- Soft delete: deleted_at on warranties, warranty_claims, maintenance_schedules
-- ==========================================================================

-- ── Warranties ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS warranties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  job_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  warranty_type TEXT NOT NULL DEFAULT 'general'
    CHECK (warranty_type IN ('structural', 'mechanical', 'electrical', 'plumbing', 'hvac', 'roofing', 'appliance', 'general', 'workmanship')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'voided', 'transferred')),
  vendor_id UUID,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  coverage_details TEXT,
  exclusions TEXT,
  document_id UUID,
  contact_name VARCHAR(200),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(200),
  transferred_to UUID,
  transferred_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- ── Warranty Claims ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS warranty_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  warranty_id UUID NOT NULL REFERENCES warranties(id) ON DELETE CASCADE,
  claim_number VARCHAR(30) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'acknowledged', 'in_progress', 'resolved', 'denied', 'escalated')),
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  reported_by UUID,
  reported_date DATE NOT NULL DEFAULT CURRENT_DATE,
  assigned_to UUID,
  assigned_vendor_id UUID,
  resolution_notes TEXT,
  resolution_cost NUMERIC(15,2) DEFAULT 0,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  due_date DATE,
  photos JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- ── Warranty Claim History ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS warranty_claim_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES warranty_claims(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  action TEXT NOT NULL
    CHECK (action IN ('created', 'acknowledged', 'assigned', 'in_progress', 'resolved', 'denied', 'escalated', 'reopened', 'note_added')),
  previous_status TEXT,
  new_status TEXT,
  details JSONB DEFAULT '{}',
  performed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Maintenance Schedules ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  job_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL DEFAULT 'annual'
    CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'semi_annual', 'annual')),
  category VARCHAR(100),
  assigned_to UUID,
  assigned_vendor_id UUID,
  start_date DATE NOT NULL,
  end_date DATE,
  next_due_date DATE,
  estimated_cost NUMERIC(15,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- ── Maintenance Tasks ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  schedule_id UUID NOT NULL REFERENCES maintenance_schedules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'scheduled', 'completed', 'overdue', 'skipped')),
  due_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  completed_by UUID,
  actual_cost NUMERIC(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── RLS ──────────────────────────────────────────────────────────────────

ALTER TABLE warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_claim_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;

-- ── Indexes — warranties ────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_warranties_company_id ON warranties(company_id);
CREATE INDEX IF NOT EXISTS idx_warranties_job_id ON warranties(job_id);
CREATE INDEX IF NOT EXISTS idx_warranties_status ON warranties(status);
CREATE INDEX IF NOT EXISTS idx_warranties_warranty_type ON warranties(warranty_type);
CREATE INDEX IF NOT EXISTS idx_warranties_vendor_id ON warranties(vendor_id);
CREATE INDEX IF NOT EXISTS idx_warranties_end_date ON warranties(end_date);
CREATE INDEX IF NOT EXISTS idx_warranties_company_status ON warranties(company_id, status);
CREATE INDEX IF NOT EXISTS idx_warranties_company_job ON warranties(company_id, job_id);
CREATE INDEX IF NOT EXISTS idx_warranties_deleted_at ON warranties(deleted_at) WHERE deleted_at IS NULL;

-- ── Indexes — warranty_claims ───────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_warranty_claims_company_id ON warranty_claims(company_id);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_warranty_id ON warranty_claims(warranty_id);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_status ON warranty_claims(status);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_priority ON warranty_claims(priority);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_assigned_to ON warranty_claims(assigned_to);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_assigned_vendor ON warranty_claims(assigned_vendor_id);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_claim_number ON warranty_claims(company_id, claim_number);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_company_status ON warranty_claims(company_id, status);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_deleted_at ON warranty_claims(deleted_at) WHERE deleted_at IS NULL;

-- ── Indexes — warranty_claim_history ────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_warranty_claim_history_claim_id ON warranty_claim_history(claim_id);
CREATE INDEX IF NOT EXISTS idx_warranty_claim_history_company ON warranty_claim_history(company_id);
CREATE INDEX IF NOT EXISTS idx_warranty_claim_history_action ON warranty_claim_history(action);

-- ── Indexes — maintenance_schedules ─────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_company_id ON maintenance_schedules(company_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_job_id ON maintenance_schedules(job_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_frequency ON maintenance_schedules(frequency);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_next_due ON maintenance_schedules(next_due_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_company_job ON maintenance_schedules(company_id, job_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_active ON maintenance_schedules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_deleted_at ON maintenance_schedules(deleted_at) WHERE deleted_at IS NULL;

-- ── Indexes — maintenance_tasks ─────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_company_id ON maintenance_tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_schedule_id ON maintenance_tasks(schedule_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_status ON maintenance_tasks(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_due_date ON maintenance_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_company_status ON maintenance_tasks(company_id, status);

-- ── Updated-at triggers ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_warranty_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_warranties_updated_at
  BEFORE UPDATE ON warranties
  FOR EACH ROW EXECUTE FUNCTION update_warranty_updated_at();

CREATE TRIGGER trg_warranty_claims_updated_at
  BEFORE UPDATE ON warranty_claims
  FOR EACH ROW EXECUTE FUNCTION update_warranty_updated_at();

CREATE TRIGGER trg_maintenance_schedules_updated_at
  BEFORE UPDATE ON maintenance_schedules
  FOR EACH ROW EXECUTE FUNCTION update_warranty_updated_at();

CREATE TRIGGER trg_maintenance_tasks_updated_at
  BEFORE UPDATE ON maintenance_tasks
  FOR EACH ROW EXECUTE FUNCTION update_warranty_updated_at();
