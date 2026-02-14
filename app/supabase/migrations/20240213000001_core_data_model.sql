-- =====================================================================
-- RossOS Core Data Model Migration
-- Module 03: Core Data Model
-- Multi-tenant with Row Level Security (RLS)
-- =====================================================================

-- =====================================================================
-- SECTION 1: PLATFORM TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  legal_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#2563eb',
  settings JSONB DEFAULT '{
    "invoice_approval_threshold": 25000,
    "retainage_default_percent": 10,
    "fiscal_year_start_month": 1,
    "timezone": "America/Chicago",
    "date_format": "MM/DD/YYYY",
    "currency": "USD"
  }',
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_subscription
  ON companies(subscription_tier, subscription_status);

-- =====================================================================
-- SECTION 2: USERS
-- =====================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'field'
    CHECK (role IN ('owner', 'admin', 'pm', 'superintendent', 'office', 'field', 'read_only')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{
    "notifications": {"email": true, "push": true},
    "theme": "light"
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email)
);

CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(company_id, role);

-- =====================================================================
-- SECTION 3: COST CODES
-- =====================================================================

CREATE TABLE IF NOT EXISTS cost_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  division TEXT NOT NULL,
  subdivision TEXT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'subcontractor'
    CHECK (category IN ('labor', 'material', 'subcontractor', 'equipment', 'other')),
  trade TEXT,
  parent_id UUID REFERENCES cost_codes(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, code)
);

CREATE INDEX IF NOT EXISTS idx_cost_codes_company ON cost_codes(company_id);
CREATE INDEX IF NOT EXISTS idx_cost_codes_division ON cost_codes(company_id, division);

-- =====================================================================
-- SECTION 4: VENDORS
-- =====================================================================

CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dba_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  trade TEXT,
  trades TEXT[],
  tax_id TEXT,
  license_number TEXT,
  license_expiration DATE,
  insurance_expiration DATE,
  gl_coverage_amount DECIMAL(12,2),
  workers_comp_expiration DATE,
  payment_terms TEXT DEFAULT 'Net 30',
  default_cost_code_id UUID REFERENCES cost_codes(id),
  is_active BOOLEAN DEFAULT true,
  is_1099 BOOLEAN DEFAULT false,
  w9_on_file BOOLEAN DEFAULT false,
  performance_score DECIMAL(3,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendors_company ON vendors(company_id);
CREATE INDEX IF NOT EXISTS idx_vendors_name ON vendors(company_id, name);
CREATE INDEX IF NOT EXISTS idx_vendors_trade ON vendors(company_id, trade);

-- =====================================================================
-- SECTION 5: CLIENTS
-- =====================================================================

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  mobile_phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  spouse_name TEXT,
  spouse_email TEXT,
  spouse_phone TEXT,
  lead_source TEXT,
  referred_by TEXT,
  portal_enabled BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(company_id, name);

-- =====================================================================
-- SECTION 6: JOBS
-- =====================================================================

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  job_number TEXT,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  project_type TEXT DEFAULT 'new_construction'
    CHECK (project_type IN ('new_construction', 'renovation', 'addition', 'remodel', 'commercial', 'other')),
  status TEXT DEFAULT 'pre_construction'
    CHECK (status IN ('lead', 'pre_construction', 'active', 'on_hold', 'completed', 'warranty', 'closed', 'cancelled')),
  contract_type TEXT DEFAULT 'fixed_price'
    CHECK (contract_type IN ('fixed_price', 'cost_plus', 'time_materials')),
  contract_amount DECIMAL(12,2),
  cost_plus_markup DECIMAL(5,2),
  start_date DATE,
  target_completion DATE,
  actual_completion DATE,
  sqft_conditioned INTEGER,
  sqft_total INTEGER,
  sqft_garage INTEGER,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  stories DECIMAL(3,1),
  budget_total DECIMAL(12,2) DEFAULT 0,
  committed_total DECIMAL(12,2) DEFAULT 0,
  invoiced_total DECIMAL(12,2) DEFAULT 0,
  paid_total DECIMAL(12,2) DEFAULT 0,
  billed_total DECIMAL(12,2) DEFAULT 0,
  received_total DECIMAL(12,2) DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_client ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(company_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_number ON jobs(company_id, job_number);

-- =====================================================================
-- SECTION 7: JOB ASSIGNMENTS
-- =====================================================================

CREATE TABLE IF NOT EXISTS job_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL
    CHECK (role IN ('pm', 'superintendent', 'estimator', 'accountant', 'assistant')),
  is_primary BOOLEAN DEFAULT false,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  UNIQUE(job_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_job_assignments_job ON job_assignments(job_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_user ON job_assignments(user_id);

-- =====================================================================
-- SECTION 8: AUDIT TABLES
-- =====================================================================

CREATE TABLE IF NOT EXISTS entity_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type VARCHAR NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  old_values JSONB,
  new_values JSONB,
  change_reason TEXT,
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_change_log_entity
  ON entity_change_log(entity_type, entity_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_change_log_company
  ON entity_change_log(company_id);

CREATE TABLE IF NOT EXISTS entity_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type VARCHAR NOT NULL,
  entity_id UUID NOT NULL,
  version_number INT NOT NULL,
  snapshot_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  reason VARCHAR,
  UNIQUE(entity_type, entity_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_entity
  ON entity_snapshots(entity_type, entity_id);

-- =====================================================================
-- SECTION 9: RLS HELPER FUNCTIONS
-- =====================================================================

CREATE OR REPLACE FUNCTION get_current_company_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'company_id')::UUID;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION user_has_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = ANY(required_roles);
$$ LANGUAGE SQL STABLE;

-- =====================================================================
-- SECTION 10: RLS POLICIES
-- =====================================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_snapshots ENABLE ROW LEVEL SECURITY;

-- Companies
CREATE POLICY "Users can view their company" ON companies
  FOR SELECT USING (id = get_current_company_id());

CREATE POLICY "Owners can update their company" ON companies
  FOR UPDATE USING (id = get_current_company_id() AND user_has_role(ARRAY['owner']));

-- Users
CREATE POLICY "Users can view company users" ON users
  FOR SELECT USING (company_id = get_current_company_id());

CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (company_id = get_current_company_id() AND user_has_role(ARRAY['owner', 'admin']));

-- Cost Codes
CREATE POLICY "Users can view cost codes" ON cost_codes
  FOR SELECT USING (company_id = get_current_company_id());

CREATE POLICY "Admins can manage cost codes" ON cost_codes
  FOR ALL USING (company_id = get_current_company_id() AND user_has_role(ARRAY['owner', 'admin']));

-- Vendors
CREATE POLICY "Users can view vendors" ON vendors
  FOR SELECT USING (company_id = get_current_company_id());

CREATE POLICY "Users can manage vendors" ON vendors
  FOR ALL USING (company_id = get_current_company_id());

-- Clients
CREATE POLICY "Users can view clients" ON clients
  FOR SELECT USING (company_id = get_current_company_id());

CREATE POLICY "Users can manage clients" ON clients
  FOR ALL USING (company_id = get_current_company_id());

-- Jobs
CREATE POLICY "Users can view company jobs" ON jobs
  FOR SELECT USING (company_id = get_current_company_id());

CREATE POLICY "Users can manage jobs" ON jobs
  FOR ALL USING (company_id = get_current_company_id());

-- Job Assignments
CREATE POLICY "Users can view assignments" ON job_assignments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_assignments.job_id AND jobs.company_id = get_current_company_id())
  );

CREATE POLICY "Users can manage assignments" ON job_assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_assignments.job_id AND jobs.company_id = get_current_company_id())
  );

-- Audit tables (read-only for users)
CREATE POLICY "Users can view change logs" ON entity_change_log
  FOR SELECT USING (company_id = get_current_company_id());

CREATE POLICY "Users can view snapshots" ON entity_snapshots
  FOR SELECT USING (company_id = get_current_company_id());

-- =====================================================================
-- SECTION 11: UPDATED_AT TRIGGERS
-- =====================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
