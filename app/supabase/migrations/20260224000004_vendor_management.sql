-- =====================================================================
-- Module 10: Vendor Management — V1 Foundation
--
-- Extends the existing `vendors` table from Module 03 (core_data_model)
-- with contacts, trades, insurance, compliance, and ratings.
-- Does NOT recreate or alter the vendors table.
-- =====================================================================

-- =====================================================================
-- SECTION 1: VENDOR CONTACTS
-- =====================================================================

CREATE TABLE IF NOT EXISTS vendor_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_contacts_vendor ON vendor_contacts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_contacts_company ON vendor_contacts(company_id);

ALTER TABLE vendor_contacts ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- SECTION 2: VENDOR TRADES
-- =====================================================================

CREATE TABLE IF NOT EXISTS vendor_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  trade_name TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_trades_vendor ON vendor_trades(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_trades_company ON vendor_trades(company_id);

ALTER TABLE vendor_trades ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- SECTION 3: VENDOR INSURANCE
-- =====================================================================

CREATE TABLE IF NOT EXISTS vendor_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  insurance_type TEXT NOT NULL
    CHECK (insurance_type IN ('general_liability', 'workers_comp', 'auto', 'umbrella', 'professional')),
  carrier_name TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  coverage_amount DECIMAL(15,2),
  expiration_date DATE NOT NULL,
  certificate_document_id UUID,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expiring_soon', 'expired', 'not_on_file')),
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_insurance_vendor ON vendor_insurance(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_insurance_company ON vendor_insurance(company_id);
CREATE INDEX IF NOT EXISTS idx_vendor_insurance_expiration ON vendor_insurance(expiration_date);
CREATE INDEX IF NOT EXISTS idx_vendor_insurance_status ON vendor_insurance(status);

ALTER TABLE vendor_insurance ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- SECTION 4: VENDOR COMPLIANCE
-- =====================================================================

CREATE TABLE IF NOT EXISTS vendor_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  requirement_type TEXT NOT NULL
    CHECK (requirement_type IN ('license', 'bond', 'w9', 'insurance', 'safety_cert', 'prequalification')),
  requirement_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('compliant', 'non_compliant', 'pending', 'waived', 'expired')),
  expiration_date DATE,
  document_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_compliance_vendor ON vendor_compliance(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_compliance_company ON vendor_compliance(company_id);
CREATE INDEX IF NOT EXISTS idx_vendor_compliance_status ON vendor_compliance(status);

ALTER TABLE vendor_compliance ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- SECTION 5: VENDOR RATINGS
-- =====================================================================

CREATE TABLE IF NOT EXISTS vendor_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id UUID,
  category TEXT NOT NULL
    CHECK (category IN ('quality', 'schedule', 'communication', 'safety', 'value')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  rated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_ratings_vendor ON vendor_ratings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_ratings_company ON vendor_ratings(company_id);
CREATE INDEX IF NOT EXISTS idx_vendor_ratings_job ON vendor_ratings(job_id);

ALTER TABLE vendor_ratings ENABLE ROW LEVEL SECURITY;
