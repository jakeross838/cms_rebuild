-- ==========================================================================
-- Module 35: Equipment & Asset Management — V1 Foundation
-- ==========================================================================
-- Tables: equipment, equipment_assignments, equipment_maintenance,
--         equipment_inspections, equipment_costs
-- Multi-tenant: company_id on every table + RLS
-- Soft delete: deleted_at on equipment
-- ==========================================================================

-- ── Equipment ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  equipment_type TEXT NOT NULL DEFAULT 'other'
    CHECK (equipment_type IN ('heavy_machinery', 'vehicle', 'power_tool', 'hand_tool', 'scaffolding', 'safety_equipment', 'measuring', 'other')),
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'assigned', 'maintenance', 'out_of_service', 'retired')),
  ownership_type TEXT NOT NULL DEFAULT 'owned'
    CHECK (ownership_type IN ('owned', 'leased', 'rented')),
  make VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  year INT,
  purchase_date DATE,
  purchase_price NUMERIC(15,2) DEFAULT 0,
  current_value NUMERIC(15,2) DEFAULT 0,
  daily_rate NUMERIC(10,2) DEFAULT 0,
  location VARCHAR(200),
  notes TEXT,
  photo_urls JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_equipment_company ON equipment(company_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_type ON equipment(equipment_type);
CREATE INDEX IF NOT EXISTS idx_equipment_ownership ON equipment(ownership_type);
CREATE INDEX IF NOT EXISTS idx_equipment_company_status ON equipment(company_id, status);
CREATE INDEX IF NOT EXISTS idx_equipment_company_type ON equipment(company_id, equipment_type);
CREATE INDEX IF NOT EXISTS idx_equipment_deleted_at ON equipment(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_equipment_serial ON equipment(serial_number) WHERE serial_number IS NOT NULL;

-- RLS
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- updated_at trigger
CREATE OR REPLACE TRIGGER trg_equipment_updated_at
  BEFORE UPDATE ON equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Equipment Assignments ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS equipment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  job_id UUID,
  assigned_to UUID,
  assigned_by UUID,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'cancelled')),
  hours_used NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_equip_assign_company ON equipment_assignments(company_id);
CREATE INDEX IF NOT EXISTS idx_equip_assign_equipment ON equipment_assignments(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equip_assign_job ON equipment_assignments(job_id);
CREATE INDEX IF NOT EXISTS idx_equip_assign_status ON equipment_assignments(status);
CREATE INDEX IF NOT EXISTS idx_equip_assign_company_status ON equipment_assignments(company_id, status);
CREATE INDEX IF NOT EXISTS idx_equip_assign_company_equip ON equipment_assignments(company_id, equipment_id);
CREATE INDEX IF NOT EXISTS idx_equip_assign_start ON equipment_assignments(start_date);

-- RLS
ALTER TABLE equipment_assignments ENABLE ROW LEVEL SECURITY;

-- updated_at trigger
CREATE OR REPLACE TRIGGER trg_equipment_assignments_updated_at
  BEFORE UPDATE ON equipment_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Equipment Maintenance ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS equipment_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL DEFAULT 'preventive'
    CHECK (maintenance_type IN ('preventive', 'corrective', 'inspection', 'calibration')),
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'in_progress', 'completed', 'overdue', 'cancelled')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_date DATE,
  completed_date DATE,
  performed_by UUID,
  service_provider VARCHAR(200),
  parts_cost NUMERIC(10,2) DEFAULT 0,
  labor_cost NUMERIC(10,2) DEFAULT 0,
  total_cost NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_equip_maint_company ON equipment_maintenance(company_id);
CREATE INDEX IF NOT EXISTS idx_equip_maint_equipment ON equipment_maintenance(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equip_maint_type ON equipment_maintenance(maintenance_type);
CREATE INDEX IF NOT EXISTS idx_equip_maint_status ON equipment_maintenance(status);
CREATE INDEX IF NOT EXISTS idx_equip_maint_company_status ON equipment_maintenance(company_id, status);
CREATE INDEX IF NOT EXISTS idx_equip_maint_company_equip ON equipment_maintenance(company_id, equipment_id);
CREATE INDEX IF NOT EXISTS idx_equip_maint_scheduled ON equipment_maintenance(scheduled_date);

-- RLS
ALTER TABLE equipment_maintenance ENABLE ROW LEVEL SECURITY;

-- updated_at trigger
CREATE OR REPLACE TRIGGER trg_equipment_maintenance_updated_at
  BEFORE UPDATE ON equipment_maintenance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Equipment Inspections ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS equipment_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  inspection_type TEXT NOT NULL DEFAULT 'pre_use'
    CHECK (inspection_type IN ('pre_use', 'post_use', 'periodic', 'safety')),
  result TEXT NOT NULL DEFAULT 'pass'
    CHECK (result IN ('pass', 'fail', 'conditional')),
  inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  inspector_id UUID,
  checklist JSONB DEFAULT '[]',
  deficiencies TEXT,
  corrective_action TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_equip_insp_company ON equipment_inspections(company_id);
CREATE INDEX IF NOT EXISTS idx_equip_insp_equipment ON equipment_inspections(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equip_insp_type ON equipment_inspections(inspection_type);
CREATE INDEX IF NOT EXISTS idx_equip_insp_result ON equipment_inspections(result);
CREATE INDEX IF NOT EXISTS idx_equip_insp_company_equip ON equipment_inspections(company_id, equipment_id);
CREATE INDEX IF NOT EXISTS idx_equip_insp_date ON equipment_inspections(inspection_date);

-- RLS
ALTER TABLE equipment_inspections ENABLE ROW LEVEL SECURITY;

-- updated_at trigger
CREATE OR REPLACE TRIGGER trg_equipment_inspections_updated_at
  BEFORE UPDATE ON equipment_inspections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Equipment Costs ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS equipment_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  job_id UUID,
  cost_type TEXT NOT NULL DEFAULT 'daily_rate'
    CHECK (cost_type IN ('daily_rate', 'fuel', 'repair', 'insurance', 'transport', 'other')),
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  cost_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  vendor_id UUID,
  receipt_url TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_equip_costs_company ON equipment_costs(company_id);
CREATE INDEX IF NOT EXISTS idx_equip_costs_equipment ON equipment_costs(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equip_costs_job ON equipment_costs(job_id);
CREATE INDEX IF NOT EXISTS idx_equip_costs_type ON equipment_costs(cost_type);
CREATE INDEX IF NOT EXISTS idx_equip_costs_company_equip ON equipment_costs(company_id, equipment_id);
CREATE INDEX IF NOT EXISTS idx_equip_costs_company_job ON equipment_costs(company_id, job_id);
CREATE INDEX IF NOT EXISTS idx_equip_costs_date ON equipment_costs(cost_date);

-- RLS
ALTER TABLE equipment_costs ENABLE ROW LEVEL SECURITY;

-- updated_at trigger
CREATE OR REPLACE TRIGGER trg_equipment_costs_updated_at
  BEFORE UPDATE ON equipment_costs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
