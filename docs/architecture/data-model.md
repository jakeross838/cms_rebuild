# Ross Built CMS - Complete Database Schema

## Overview

This document provides the complete, authoritative database schema for the Ross Built CMS. All tables are designed for Supabase (PostgreSQL) with Row Level Security (RLS) policies for multi-tenant isolation.

**Naming Conventions:**
- All tables use `snake_case`
- Primary keys are `id` (UUID)
- Foreign keys are `{entity}_id`
- Timestamps use `_at` suffix
- Boolean flags use `is_` or `has_` prefix

---

## 1. Core Entities

### 1.1 Companies (Multi-Tenant Root)

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name TEXT NOT NULL,
  legal_name TEXT,

  -- Contact
  email TEXT,
  phone TEXT,
  website TEXT,

  -- Address
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,

  -- Branding
  logo_url TEXT,
  primary_color TEXT DEFAULT '#2563eb',

  -- Settings
  settings JSONB DEFAULT '{
    "invoice_approval_threshold": 25000,
    "retainage_default_percent": 10,
    "fiscal_year_start_month": 1,
    "timezone": "America/Chicago",
    "date_format": "MM/DD/YYYY",
    "currency": "USD"
  }',

  -- Subscription
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_companies_subscription ON companies(subscription_tier, subscription_status);
```

### 1.2 Users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Identity
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,

  -- Role & Permissions
  role TEXT NOT NULL DEFAULT 'field'
    CHECK (role IN ('owner', 'admin', 'accounting', 'pm', 'supervisor', 'office', 'field')),

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,

  -- Preferences
  preferences JSONB DEFAULT '{
    "notifications": {
      "email": true,
      "push": true,
      "invoice_assigned": true,
      "task_assigned": true,
      "mention": true
    },
    "theme": "light"
  }',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(email)
);

-- Indexes
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(company_id, role);
```

### 1.3 Cost Codes

```sql
CREATE TABLE cost_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Code Structure (CSI Format)
  code TEXT NOT NULL,              -- e.g., "03-30-00"
  division TEXT NOT NULL,          -- e.g., "03"
  subdivision TEXT,                -- e.g., "30"
  name TEXT NOT NULL,              -- e.g., "Cast-in-Place Concrete"
  description TEXT,

  -- Classification
  category TEXT DEFAULT 'subcontractor'
    CHECK (category IN ('labor', 'material', 'subcontractor', 'equipment', 'other')),
  trade TEXT,                      -- e.g., "Concrete", "Electrical"

  -- Hierarchy
  parent_id UUID REFERENCES cost_codes(id),
  sort_order INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false, -- System default codes

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, code)
);

-- Indexes
CREATE INDEX idx_cost_codes_company ON cost_codes(company_id);
CREATE INDEX idx_cost_codes_division ON cost_codes(company_id, division);
CREATE INDEX idx_cost_codes_trade ON cost_codes(company_id, trade);
```

### 1.4 Vendors

```sql
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  dba_name TEXT,                   -- "Doing Business As"

  -- Contact
  email TEXT,
  phone TEXT,
  fax TEXT,
  website TEXT,

  -- Address
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,

  -- Business Info
  trade TEXT,                      -- Primary trade
  trades TEXT[],                   -- All trades
  tax_id TEXT,                     -- EIN/SSN
  license_number TEXT,
  license_expiration DATE,

  -- Insurance
  insurance_carrier TEXT,
  insurance_policy_number TEXT,
  insurance_expiration DATE,
  gl_coverage_amount DECIMAL(12,2),
  workers_comp_expiration DATE,

  -- Banking
  bank_name TEXT,
  bank_routing TEXT,
  bank_account TEXT,

  -- Terms
  payment_terms TEXT DEFAULT 'Net 30',
  default_cost_code_id UUID REFERENCES cost_codes(id),

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_1099 BOOLEAN DEFAULT false,
  w9_on_file BOOLEAN DEFAULT false,

  -- Performance (AI-calculated)
  performance_score DECIMAL(3,2),  -- 0.00 - 5.00

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vendors_company ON vendors(company_id);
CREATE INDEX idx_vendors_name ON vendors(company_id, name);
CREATE INDEX idx_vendors_trade ON vendors(company_id, trade);
CREATE INDEX idx_vendors_active ON vendors(company_id, is_active);
```

### 1.5 Clients

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  company_name TEXT,               -- If business client

  -- Primary Contact
  email TEXT,
  phone TEXT,
  mobile_phone TEXT,

  -- Address (billing)
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,

  -- Additional Contacts
  spouse_name TEXT,
  spouse_email TEXT,
  spouse_phone TEXT,

  -- Source
  lead_source TEXT,                -- Referral, website, etc.
  referred_by TEXT,

  -- Portal Access
  portal_enabled BOOLEAN DEFAULT false,

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_clients_company ON clients(company_id);
CREATE INDEX idx_clients_name ON clients(company_id, name);
CREATE INDEX idx_clients_email ON clients(email);
```

---

## 2. Job Management

### 2.1 Jobs

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,

  -- Identity
  name TEXT NOT NULL,
  job_number TEXT,
  description TEXT,

  -- Location
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),

  -- Type & Status
  project_type TEXT DEFAULT 'new_construction'
    CHECK (project_type IN ('new_construction', 'renovation', 'addition', 'remodel', 'commercial', 'other')),
  status TEXT DEFAULT 'pre_construction'
    CHECK (status IN ('lead', 'pre_construction', 'active', 'on_hold', 'completed', 'warranty', 'closed', 'cancelled')),

  -- Contract
  contract_type TEXT DEFAULT 'fixed_price'
    CHECK (contract_type IN ('fixed_price', 'cost_plus', 'time_materials')),
  contract_amount DECIMAL(12,2),
  cost_plus_markup DECIMAL(5,2),   -- If cost_plus

  -- Schedule
  start_date DATE,
  target_completion DATE,
  actual_completion DATE,

  -- Specifications
  sqft_conditioned INTEGER,
  sqft_total INTEGER,
  sqft_garage INTEGER,
  sqft_covered INTEGER,
  lot_size_sqft INTEGER,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  stories DECIMAL(3,1),

  -- Calculated Totals (updated by triggers)
  budget_total DECIMAL(12,2) DEFAULT 0,
  committed_total DECIMAL(12,2) DEFAULT 0,    -- POs
  invoiced_total DECIMAL(12,2) DEFAULT 0,
  paid_total DECIMAL(12,2) DEFAULT 0,
  billed_total DECIMAL(12,2) DEFAULT 0,       -- Draws
  received_total DECIMAL(12,2) DEFAULT 0,     -- Client payments

  -- Settings
  settings JSONB DEFAULT '{}',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_client ON jobs(client_id);
CREATE INDEX idx_jobs_status ON jobs(company_id, status);
CREATE INDEX idx_jobs_number ON jobs(company_id, job_number);
CREATE INDEX idx_jobs_updated ON jobs(company_id, updated_at DESC);
```

### 2.2 Job Assignments

```sql
CREATE TABLE job_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  role TEXT NOT NULL
    CHECK (role IN ('pm', 'superintendent', 'estimator', 'accountant', 'assistant')),

  is_primary BOOLEAN DEFAULT false, -- Primary contact for this role

  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),

  UNIQUE(job_id, user_id)
);

-- Indexes
CREATE INDEX idx_job_assignments_job ON job_assignments(job_id);
CREATE INDEX idx_job_assignments_user ON job_assignments(user_id);
```

---

## 3. Pre-Construction

### 3.1 Leads

```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Contact Info
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company_name TEXT,

  -- Address
  project_address TEXT,
  project_city TEXT,
  project_state TEXT,
  project_zip TEXT,

  -- Lead Info
  source TEXT,                     -- website, referral, zillow, etc.
  referral_source TEXT,            -- Who referred

  -- Project Details
  project_type TEXT,
  project_description TEXT,
  estimated_sqft INTEGER,
  estimated_value DECIMAL(12,2),
  target_start_date DATE,

  -- Status & Pipeline
  status TEXT DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost')),
  stage_entered_at TIMESTAMPTZ DEFAULT NOW(),

  -- Assignment
  assigned_to UUID REFERENCES users(id),

  -- Conversion
  converted_to_job_id UUID REFERENCES jobs(id),
  converted_at TIMESTAMPTZ,

  -- Loss
  lost_reason TEXT,
  lost_to_competitor TEXT,

  -- Score (AI-calculated)
  lead_score INTEGER,              -- 0-100

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_leads_company ON leads(company_id);
CREATE INDEX idx_leads_status ON leads(company_id, status);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);
```

### 3.2 Estimates

```sql
CREATE TABLE estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  version INTEGER DEFAULT 1,

  -- Status
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_review', 'approved', 'sent', 'accepted', 'rejected', 'expired')),

  -- Amounts (calculated from lines)
  subtotal DECIMAL(12,2) DEFAULT 0,
  markup_type TEXT DEFAULT 'percent'
    CHECK (markup_type IN ('percent', 'fixed')),
  markup_value DECIMAL(10,2) DEFAULT 0,
  markup_amount DECIMAL(12,2) DEFAULT 0,
  tax_rate DECIMAL(5,4) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,

  -- Contingency
  contingency_percent DECIMAL(5,2) DEFAULT 0,
  contingency_amount DECIMAL(12,2) DEFAULT 0,

  -- Notes
  scope_notes TEXT,
  exclusions TEXT,
  assumptions TEXT,
  internal_notes TEXT,

  -- Validity
  valid_until DATE,

  -- Approval
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),

  -- Conversion
  converted_to_budget BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_estimates_company ON estimates(company_id);
CREATE INDEX idx_estimates_job ON estimates(job_id);
CREATE INDEX idx_estimates_status ON estimates(status);
```

### 3.3 Estimate Lines

```sql
CREATE TABLE estimate_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  cost_code_id UUID REFERENCES cost_codes(id),

  -- Content
  description TEXT NOT NULL,

  -- Quantities
  quantity DECIMAL(12,4) DEFAULT 1,
  unit TEXT DEFAULT 'ea',          -- ea, sf, lf, hr, ls, etc.

  -- Costs
  material_cost DECIMAL(12,2) DEFAULT 0,
  labor_cost DECIMAL(12,2) DEFAULT 0,
  equipment_cost DECIMAL(12,2) DEFAULT 0,
  subcontractor_cost DECIMAL(12,2) DEFAULT 0,
  other_cost DECIMAL(12,2) DEFAULT 0,

  -- Calculated
  unit_cost DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,

  -- Markup (line-level override)
  markup_percent DECIMAL(5,2),

  -- Organization
  group_name TEXT,                 -- For grouping lines
  sort_order INTEGER DEFAULT 0,

  -- Notes
  notes TEXT,

  -- Source (if from template/assembly)
  source_type TEXT,                -- template, assembly, manual
  source_id UUID
);

-- Indexes
CREATE INDEX idx_estimate_lines_estimate ON estimate_lines(estimate_id);
CREATE INDEX idx_estimate_lines_cost_code ON estimate_lines(cost_code_id);
```

### 3.4 Proposals

```sql
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  -- Content
  title TEXT,
  introduction TEXT,
  scope_of_work TEXT,
  exclusions TEXT,
  timeline TEXT,
  payment_terms TEXT,
  terms_conditions TEXT,

  -- Status
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'viewed', 'signed', 'expired', 'declined')),

  -- Display Options
  show_line_items BOOLEAN DEFAULT true,
  show_quantities BOOLEAN DEFAULT true,
  show_unit_prices BOOLEAN DEFAULT false,
  group_by_division BOOLEAN DEFAULT true,

  -- Sending
  sent_at TIMESTAMPTZ,
  sent_to_email TEXT,
  sent_by UUID REFERENCES users(id),

  -- Viewing
  first_viewed_at TIMESTAMPTZ,
  last_viewed_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,

  -- Signing
  signed_at TIMESTAMPTZ,
  signature_data TEXT,             -- Base64 signature image
  signer_name TEXT,
  signer_ip TEXT,

  -- Expiration
  expires_at TIMESTAMPTZ,

  -- PDF
  pdf_url TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_proposals_estimate ON proposals(estimate_id);
CREATE INDEX idx_proposals_job ON proposals(job_id);
CREATE INDEX idx_proposals_status ON proposals(status);
```

### 3.5 Contracts

```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  proposal_id UUID REFERENCES proposals(id),

  -- Contract Info
  contract_number TEXT,
  contract_type TEXT NOT NULL
    CHECK (contract_type IN ('fixed_price', 'cost_plus', 'time_materials', 'unit_price')),

  -- Amounts
  original_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2),    -- After change orders

  -- Cost Plus Terms
  markup_percent DECIMAL(5,2),
  fee_type TEXT,                   -- percent, fixed
  fee_amount DECIMAL(12,2),

  -- Dates
  signed_date DATE,
  start_date DATE,
  completion_date DATE,

  -- Document
  document_url TEXT,

  -- Status
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_signature', 'active', 'completed', 'terminated')),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_contracts_job ON contracts(job_id);
CREATE INDEX idx_contracts_status ON contracts(status);
```

### 3.6 Selections

```sql
CREATE TABLE selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  -- Category
  category TEXT NOT NULL,          -- flooring, countertops, fixtures, appliances, etc.
  location TEXT,                   -- Master Bath, Kitchen, etc.

  -- Item
  name TEXT NOT NULL,
  description TEXT,

  -- Options
  options JSONB DEFAULT '[]',      -- Array of selection options

  -- Budget
  allowance_amount DECIMAL(12,2),

  -- Selected Option
  selected_option_index INTEGER,
  selected_amount DECIMAL(12,2),
  variance DECIMAL(12,2),          -- selected - allowance

  -- Vendor
  vendor_id UUID REFERENCES vendors(id),

  -- Status
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'presented', 'selected', 'approved', 'ordered', 'received')),

  -- Dates
  due_date DATE,
  selected_at TIMESTAMPTZ,
  selected_by TEXT,                -- Client name
  approved_at TIMESTAMPTZ,

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_selections_job ON selections(job_id);
CREATE INDEX idx_selections_status ON selections(job_id, status);
CREATE INDEX idx_selections_category ON selections(job_id, category);
```

---

## 4. Budget & Financial

### 4.1 Budgets

```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE UNIQUE,

  -- Source
  source_estimate_id UUID REFERENCES estimates(id),

  -- Totals (calculated from lines)
  original_total DECIMAL(12,2) DEFAULT 0,
  revised_total DECIMAL(12,2) DEFAULT 0,
  committed_total DECIMAL(12,2) DEFAULT 0,
  invoiced_total DECIMAL(12,2) DEFAULT 0,
  paid_total DECIMAL(12,2) DEFAULT 0,

  -- Contingency
  contingency_original DECIMAL(12,2) DEFAULT 0,
  contingency_used DECIMAL(12,2) DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  locked_at TIMESTAMPTZ           -- When budget was finalized
);

-- Indexes
CREATE INDEX idx_budgets_job ON budgets(job_id);
```

### 4.2 Budget Lines

```sql
CREATE TABLE budget_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  cost_code_id UUID NOT NULL REFERENCES cost_codes(id),

  -- Description
  description TEXT,

  -- Amounts
  original_amount DECIMAL(12,2) DEFAULT 0,
  change_order_amount DECIMAL(12,2) DEFAULT 0,
  revised_amount DECIMAL(12,2) DEFAULT 0,      -- original + COs
  committed_amount DECIMAL(12,2) DEFAULT 0,    -- POs
  invoiced_amount DECIMAL(12,2) DEFAULT 0,
  paid_amount DECIMAL(12,2) DEFAULT 0,

  -- Remaining
  remaining_budget DECIMAL(12,2) DEFAULT 0,    -- revised - committed
  projected_cost DECIMAL(12,2),                -- AI forecast

  -- Draw Tracking
  percent_complete DECIMAL(5,2) DEFAULT 0,
  scheduled_value DECIMAL(12,2) DEFAULT 0,     -- Contract value for draws
  previous_billed DECIMAL(12,2) DEFAULT 0,
  current_billed DECIMAL(12,2) DEFAULT 0,
  retainage_held DECIMAL(12,2) DEFAULT 0,

  -- Notes
  notes TEXT,

  UNIQUE(budget_id, cost_code_id)
);

-- Indexes
CREATE INDEX idx_budget_lines_budget ON budget_lines(budget_id);
CREATE INDEX idx_budget_lines_cost_code ON budget_lines(cost_code_id);
```

### 4.3 Purchase Orders

```sql
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id),

  -- Identity
  po_number TEXT NOT NULL,

  -- Description
  description TEXT,
  scope_of_work TEXT,

  -- Status
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_approval', 'approved', 'sent', 'acknowledged', 'in_progress', 'completed', 'cancelled')),

  -- Amounts
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_rate DECIMAL(5,4) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  invoiced_amount DECIMAL(12,2) DEFAULT 0,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  remaining_amount DECIMAL(12,2) DEFAULT 0,

  -- Dates
  issue_date DATE,
  required_date DATE,

  -- Terms
  payment_terms TEXT,
  special_instructions TEXT,

  -- Approval
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),

  -- Sending
  sent_at TIMESTAMPTZ,
  sent_to_email TEXT,

  -- PDF
  pdf_url TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_pos_company ON purchase_orders(company_id);
CREATE INDEX idx_pos_job ON purchase_orders(job_id);
CREATE INDEX idx_pos_vendor ON purchase_orders(vendor_id);
CREATE INDEX idx_pos_number ON purchase_orders(company_id, po_number);
CREATE INDEX idx_pos_status ON purchase_orders(status);
```

### 4.4 PO Line Items

```sql
CREATE TABLE po_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  cost_code_id UUID REFERENCES cost_codes(id),
  budget_line_id UUID REFERENCES budget_lines(id),

  -- Content
  description TEXT NOT NULL,

  -- Quantities
  quantity DECIMAL(12,4) DEFAULT 1,
  unit TEXT DEFAULT 'ea',
  unit_cost DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,

  -- Invoiced
  quantity_invoiced DECIMAL(12,4) DEFAULT 0,
  amount_invoiced DECIMAL(12,2) DEFAULT 0,

  -- Organization
  sort_order INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX idx_po_lines_po ON po_line_items(purchase_order_id);
CREATE INDEX idx_po_lines_cost_code ON po_line_items(cost_code_id);
CREATE INDEX idx_po_lines_budget ON po_line_items(budget_line_id);
```

### 4.5 Invoices

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id),
  vendor_id UUID REFERENCES vendors(id),
  purchase_order_id UUID REFERENCES purchase_orders(id),

  -- Invoice Info
  invoice_number TEXT,
  invoice_date DATE,
  due_date DATE,
  received_date DATE DEFAULT CURRENT_DATE,

  -- Amounts
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  amount_paid DECIMAL(12,2) DEFAULT 0,
  balance_due DECIMAL(12,2),

  -- Status & Workflow
  status TEXT DEFAULT 'processing'
    CHECK (status IN (
      'processing',         -- AI processing
      'needs_matching',     -- Couldn't auto-match
      'draft',              -- Matched, needs review
      'pm_pending',         -- Awaiting PM approval
      'accountant_pending', -- Awaiting accountant
      'owner_pending',      -- Over threshold
      'approved',           -- Ready for draw
      'in_draw',            -- Added to draw
      'paid',               -- Payment complete
      'rejected',           -- Rejected
      'void'                -- Voided
    )),

  -- Approval Chain
  current_approver_role TEXT,
  pm_approved_at TIMESTAMPTZ,
  pm_approved_by UUID REFERENCES users(id),
  accountant_approved_at TIMESTAMPTZ,
  accountant_approved_by UUID REFERENCES users(id),
  owner_approved_at TIMESTAMPTZ,
  owner_approved_by UUID REFERENCES users(id),

  -- Rejection
  rejected_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES users(id),
  rejection_reason TEXT,

  -- Payment
  paid_at TIMESTAMPTZ,
  paid_by UUID REFERENCES users(id),
  payment_method TEXT,
  payment_reference TEXT,

  -- AI Processing
  pdf_url TEXT,
  pdf_hash TEXT,                   -- For duplicate detection
  ai_processed BOOLEAN DEFAULT false,
  ai_confidence DECIMAL(3,2),
  ai_extracted_data JSONB,

  -- Lien Waiver
  lien_waiver_required BOOLEAN DEFAULT true,
  lien_waiver_received BOOLEAN DEFAULT false,
  lien_waiver_url TEXT,

  -- Notes
  notes TEXT,
  internal_notes TEXT,

  -- Draw Link
  draw_id UUID,                    -- Set when added to draw

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_job ON invoices(job_id);
CREATE INDEX idx_invoices_vendor ON invoices(vendor_id);
CREATE INDEX idx_invoices_po ON invoices(purchase_order_id);
CREATE INDEX idx_invoices_status ON invoices(company_id, status);
CREATE INDEX idx_invoices_draw ON invoices(draw_id);
CREATE INDEX idx_invoices_hash ON invoices(pdf_hash);
```

### 4.6 Invoice Allocations

```sql
CREATE TABLE invoice_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  cost_code_id UUID NOT NULL REFERENCES cost_codes(id),
  budget_line_id UUID REFERENCES budget_lines(id),

  -- Amount
  amount DECIMAL(12,2) NOT NULL,

  -- Description
  description TEXT,

  UNIQUE(invoice_id, cost_code_id)
);

-- Indexes
CREATE INDEX idx_invoice_allocations_invoice ON invoice_allocations(invoice_id);
CREATE INDEX idx_invoice_allocations_cost_code ON invoice_allocations(cost_code_id);
CREATE INDEX idx_invoice_allocations_budget ON invoice_allocations(budget_line_id);
```

### 4.7 Draws

```sql
CREATE TABLE draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  -- Identity
  draw_number INTEGER NOT NULL,
  period_from DATE,
  period_to DATE,

  -- Status
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_review', 'submitted', 'approved', 'funded', 'rejected')),

  -- Amounts (G702 format)
  original_contract_sum DECIMAL(12,2) DEFAULT 0,
  change_order_total DECIMAL(12,2) DEFAULT 0,
  contract_sum_to_date DECIMAL(12,2) DEFAULT 0,
  total_completed_stored DECIMAL(12,2) DEFAULT 0,
  retainage_percent DECIMAL(5,2) DEFAULT 10,
  retainage_amount DECIMAL(12,2) DEFAULT 0,
  total_earned_less_retainage DECIMAL(12,2) DEFAULT 0,
  less_previous_certificates DECIMAL(12,2) DEFAULT 0,
  current_payment_due DECIMAL(12,2) DEFAULT 0,
  balance_to_finish DECIMAL(12,2) DEFAULT 0,

  -- Submission
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES users(id),

  -- Client Approval
  client_approved_at TIMESTAMPTZ,
  client_approved_by TEXT,
  client_notes TEXT,

  -- Rejection
  rejected_at TIMESTAMPTZ,
  rejected_by TEXT,
  rejection_reason TEXT,

  -- Payment
  funded_at TIMESTAMPTZ,
  funded_amount DECIMAL(12,2),

  -- PDFs
  g702_pdf_url TEXT,
  g703_pdf_url TEXT,

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(job_id, draw_number)
);

-- Indexes
CREATE INDEX idx_draws_job ON draws(job_id);
CREATE INDEX idx_draws_status ON draws(status);
CREATE INDEX idx_draws_number ON draws(job_id, draw_number);
```

### 4.8 Draw Lines

```sql
CREATE TABLE draw_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  budget_line_id UUID NOT NULL REFERENCES budget_lines(id),

  -- G703 columns
  scheduled_value DECIMAL(12,2) DEFAULT 0,
  work_completed_previous DECIMAL(12,2) DEFAULT 0,
  work_completed_current DECIMAL(12,2) DEFAULT 0,
  materials_stored_previous DECIMAL(12,2) DEFAULT 0,
  materials_stored_current DECIMAL(12,2) DEFAULT 0,
  total_completed_stored DECIMAL(12,2) DEFAULT 0,
  percent_complete DECIMAL(5,2) DEFAULT 0,
  balance_to_finish DECIMAL(12,2) DEFAULT 0,
  retainage DECIMAL(12,2) DEFAULT 0,

  UNIQUE(draw_id, budget_line_id)
);

-- Indexes
CREATE INDEX idx_draw_lines_draw ON draw_lines(draw_id);
CREATE INDEX idx_draw_lines_budget ON draw_lines(budget_line_id);
```

### 4.9 Change Orders

```sql
CREATE TABLE change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  -- Identity
  co_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- Reason
  reason TEXT
    CHECK (reason IN ('client_request', 'design_change', 'unforeseen_condition', 'code_requirement', 'error_omission', 'value_engineering', 'other')),

  -- Status
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_internal', 'pending_client', 'approved', 'rejected', 'void')),

  -- Amounts
  amount DECIMAL(12,2) DEFAULT 0,

  -- Schedule Impact
  days_impact INTEGER DEFAULT 0,

  -- Internal Approval
  internal_approved_at TIMESTAMPTZ,
  internal_approved_by UUID REFERENCES users(id),

  -- Client Approval
  client_approved_at TIMESTAMPTZ,
  client_signature TEXT,
  client_name TEXT,

  -- PDF
  pdf_url TEXT,

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),

  UNIQUE(job_id, co_number)
);

-- Indexes
CREATE INDEX idx_cos_job ON change_orders(job_id);
CREATE INDEX idx_cos_status ON change_orders(status);
CREATE INDEX idx_cos_number ON change_orders(job_id, co_number);
```

### 4.10 Change Order Lines

```sql
CREATE TABLE change_order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  change_order_id UUID NOT NULL REFERENCES change_orders(id) ON DELETE CASCADE,
  cost_code_id UUID REFERENCES cost_codes(id),
  budget_line_id UUID REFERENCES budget_lines(id),

  -- Content
  description TEXT NOT NULL,

  -- Amount (positive = add, negative = deduct)
  amount DECIMAL(12,2) NOT NULL,

  -- Breakdown
  material_cost DECIMAL(12,2) DEFAULT 0,
  labor_cost DECIMAL(12,2) DEFAULT 0,
  equipment_cost DECIMAL(12,2) DEFAULT 0,
  subcontractor_cost DECIMAL(12,2) DEFAULT 0,
  markup_amount DECIMAL(12,2) DEFAULT 0,

  -- Organization
  sort_order INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX idx_co_lines_co ON change_order_lines(change_order_id);
CREATE INDEX idx_co_lines_cost_code ON change_order_lines(cost_code_id);
```

---

## 5. Schedule & Field Operations

### 5.1 Tasks

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  -- Relationships
  vendor_id UUID REFERENCES vendors(id),
  budget_line_id UUID REFERENCES budget_lines(id),
  parent_task_id UUID REFERENCES tasks(id),

  -- Content
  name TEXT NOT NULL,
  description TEXT,

  -- Status
  status TEXT DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked', 'cancelled')),

  -- Priority
  priority TEXT DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'critical')),

  -- Schedule
  start_date DATE,
  end_date DATE,
  duration_days INTEGER,
  actual_start_date DATE,
  actual_end_date DATE,

  -- Progress
  percent_complete DECIMAL(5,2) DEFAULT 0,

  -- Assignment
  assigned_to UUID REFERENCES users(id),

  -- Milestone
  is_milestone BOOLEAN DEFAULT false,

  -- Organization
  sort_order INTEGER DEFAULT 0,
  wbs_code TEXT,                   -- Work breakdown structure

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_job ON tasks(job_id);
CREATE INDEX idx_tasks_vendor ON tasks(vendor_id);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);
CREATE INDEX idx_tasks_status ON tasks(job_id, status);
CREATE INDEX idx_tasks_dates ON tasks(job_id, start_date, end_date);
```

### 5.2 Task Dependencies

```sql
CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,

  dependency_type TEXT DEFAULT 'finish_to_start'
    CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')),

  lag_days INTEGER DEFAULT 0,      -- Delay between tasks

  UNIQUE(task_id, depends_on_task_id)
);

-- Indexes
CREATE INDEX idx_task_deps_task ON task_dependencies(task_id);
CREATE INDEX idx_task_deps_depends ON task_dependencies(depends_on_task_id);
```

### 5.3 Daily Logs

```sql
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  -- Date
  log_date DATE NOT NULL,

  -- Weather
  weather_condition TEXT,
  temperature_high INTEGER,
  temperature_low INTEGER,
  precipitation TEXT,
  weather_delay_hours DECIMAL(4,1) DEFAULT 0,

  -- Summary
  work_performed TEXT,
  notes TEXT,
  issues TEXT,
  safety_notes TEXT,

  -- Visitors
  visitors TEXT,

  -- Site Conditions
  site_conditions TEXT,

  -- Status
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'approved')),

  -- Approval
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),

  -- Author
  created_by UUID NOT NULL REFERENCES users(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(job_id, log_date)
);

-- Indexes
CREATE INDEX idx_daily_logs_job ON daily_logs(job_id);
CREATE INDEX idx_daily_logs_date ON daily_logs(job_id, log_date DESC);
CREATE INDEX idx_daily_logs_created_by ON daily_logs(created_by);
```

### 5.4 Daily Log Labor

```sql
CREATE TABLE daily_log_labor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_log_id UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,

  -- Vendor/Trade
  vendor_id UUID REFERENCES vendors(id),
  trade TEXT,

  -- Hours
  workers INTEGER DEFAULT 1,
  hours DECIMAL(4,1) NOT NULL,

  -- Work
  description TEXT,

  -- Cost Code
  cost_code_id UUID REFERENCES cost_codes(id)
);

-- Indexes
CREATE INDEX idx_log_labor_log ON daily_log_labor(daily_log_id);
CREATE INDEX idx_log_labor_vendor ON daily_log_labor(vendor_id);
```

### 5.5 Photos

```sql
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  daily_log_id UUID REFERENCES daily_logs(id) ON DELETE SET NULL,

  -- File
  storage_path TEXT NOT NULL,
  url TEXT,
  thumbnail_url TEXT,

  -- Metadata
  caption TEXT,
  location TEXT,                   -- Where in project

  -- Tags
  tags TEXT[],

  -- EXIF/Device
  taken_at TIMESTAMPTZ,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  device TEXT,

  -- AI Analysis
  ai_description TEXT,
  ai_tags TEXT[],

  -- Sharing
  portal_visible BOOLEAN DEFAULT false,

  -- Upload
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_photos_job ON photos(job_id);
CREATE INDEX idx_photos_log ON photos(daily_log_id);
CREATE INDEX idx_photos_date ON photos(job_id, taken_at DESC);
CREATE INDEX idx_photos_tags ON photos USING gin(tags);
```

---

## 6. To-Do & Communication

### 6.1 Todos

```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,

  -- Content
  title TEXT NOT NULL,
  description TEXT,

  -- Category
  category TEXT DEFAULT 'general'
    CHECK (category IN ('general', 'follow_up', 'approval', 'document', 'financial', 'field', 'meeting')),

  -- Priority & Status
  priority TEXT DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),

  -- Assignment
  assigned_to UUID REFERENCES users(id),
  assigned_by UUID REFERENCES users(id),

  -- Dates
  due_date DATE,
  due_time TIME,
  completed_at TIMESTAMPTZ,

  -- Recurring
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,            -- RRULE format
  recurrence_parent_id UUID REFERENCES todos(id),

  -- Links
  entity_type TEXT,                -- invoice, po, task, etc.
  entity_id UUID,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_todos_company ON todos(company_id);
CREATE INDEX idx_todos_job ON todos(job_id);
CREATE INDEX idx_todos_assigned ON todos(assigned_to);
CREATE INDEX idx_todos_status ON todos(company_id, status);
CREATE INDEX idx_todos_due ON todos(company_id, due_date);
```

### 6.2 Comments

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Target
  entity_type TEXT NOT NULL,       -- invoice, po, task, photo, etc.
  entity_id UUID NOT NULL,

  -- Thread
  parent_comment_id UUID REFERENCES comments(id),

  -- Content
  content TEXT NOT NULL,

  -- Mentions (parsed from @mentions)
  mentioned_user_ids UUID[],

  -- Attachments
  attachments JSONB DEFAULT '[]',

  -- Edit
  edited_at TIMESTAMPTZ,

  -- Author
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_comments_created_by ON comments(created_by);
CREATE INDEX idx_comments_mentions ON comments USING gin(mentioned_user_ids);
```

### 6.3 Messages

```sql
CREATE TABLE message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Type
  thread_type TEXT DEFAULT 'direct'
    CHECK (thread_type IN ('direct', 'group', 'job')),

  -- For job threads
  job_id UUID REFERENCES jobs(id),

  -- Group info
  name TEXT,                       -- For group threads

  -- Participants managed in separate table

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ
);

CREATE TABLE message_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Status
  last_read_at TIMESTAMPTZ,
  is_muted BOOLEAN DEFAULT false,

  joined_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(thread_id, user_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,

  -- Content
  content TEXT NOT NULL,

  -- Attachments
  attachments JSONB DEFAULT '[]',

  -- Sender
  sender_id UUID NOT NULL REFERENCES users(id),

  -- Edit/Delete
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_threads_company ON message_threads(company_id);
CREATE INDEX idx_threads_job ON message_threads(job_id);
CREATE INDEX idx_participants_thread ON message_participants(thread_id);
CREATE INDEX idx_participants_user ON message_participants(user_id);
CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(thread_id, created_at DESC);
```

### 6.4 Notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Type
  type TEXT NOT NULL,              -- invoice_assigned, task_due, mention, etc.

  -- Content
  title TEXT NOT NULL,
  body TEXT,

  -- Link
  entity_type TEXT,
  entity_id UUID,
  action_url TEXT,

  -- Status
  read_at TIMESTAMPTZ,

  -- Delivery
  email_sent_at TIMESTAMPTZ,
  push_sent_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Data for rendering
  data JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_created ON notifications(user_id, created_at DESC);
```

### 6.5 Activity Logs

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Actor
  user_id UUID REFERENCES users(id),

  -- Target
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  job_id UUID REFERENCES jobs(id),

  -- Action
  action TEXT NOT NULL,            -- created, updated, deleted, status_changed, etc.

  -- Changes
  changes JSONB,                   -- What changed

  -- Context
  ip_address INET,
  user_agent TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activity_company ON activity_logs(company_id);
CREATE INDEX idx_activity_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_job ON activity_logs(job_id);
CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_created ON activity_logs(company_id, created_at DESC);
```

---

## 7. Bids, RFIs, Submittals

### 7.1 Bid Packages

```sql
CREATE TABLE bid_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  -- Info
  name TEXT NOT NULL,
  trade TEXT NOT NULL,
  description TEXT,
  scope_of_work TEXT,

  -- Status
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'open', 'closed', 'awarded', 'cancelled')),

  -- Dates
  bid_due_date TIMESTAMPTZ,
  pre_bid_meeting_date TIMESTAMPTZ,

  -- Award
  awarded_vendor_id UUID REFERENCES vendors(id),
  awarded_amount DECIMAL(12,2),
  awarded_at TIMESTAMPTZ,

  -- Documents
  documents JSONB DEFAULT '[]',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE TABLE bid_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_package_id UUID NOT NULL REFERENCES bid_packages(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id),

  -- Status
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'viewed', 'submitted', 'declined', 'awarded', 'not_awarded')),

  -- Sending
  sent_at TIMESTAMPTZ,
  sent_to_email TEXT,

  -- Viewing
  viewed_at TIMESTAMPTZ,

  -- Response
  declined_at TIMESTAMPTZ,
  decline_reason TEXT,

  UNIQUE(bid_package_id, vendor_id)
);

CREATE TABLE bid_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_invitation_id UUID NOT NULL REFERENCES bid_invitations(id) ON DELETE CASCADE UNIQUE,

  -- Amounts
  total_amount DECIMAL(12,2) NOT NULL,

  -- Line items
  line_items JSONB DEFAULT '[]',

  -- Validity
  valid_until DATE,

  -- Alternates
  alternates JSONB DEFAULT '[]',

  -- Exclusions
  exclusions TEXT,

  -- Documents
  documents JSONB DEFAULT '[]',

  -- Notes
  notes TEXT,

  -- Submitted
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bid_packages_job ON bid_packages(job_id);
CREATE INDEX idx_bid_packages_status ON bid_packages(status);
CREATE INDEX idx_bid_invitations_package ON bid_invitations(bid_package_id);
CREATE INDEX idx_bid_invitations_vendor ON bid_invitations(vendor_id);
```

### 7.2 RFIs

```sql
CREATE TABLE rfis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  -- Identity
  rfi_number INTEGER NOT NULL,

  -- Content
  subject TEXT NOT NULL,
  question TEXT NOT NULL,

  -- Status
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'pending_response', 'responded', 'closed')),

  -- Ball in Court
  ball_in_court TEXT,              -- contractor, architect, owner, engineer
  ball_in_court_name TEXT,

  -- Dates
  submitted_date DATE,
  required_date DATE,
  responded_date DATE,

  -- Response
  response TEXT,
  responded_by TEXT,

  -- Impact
  cost_impact BOOLEAN DEFAULT false,
  cost_impact_amount DECIMAL(12,2),
  schedule_impact BOOLEAN DEFAULT false,
  schedule_impact_days INTEGER,

  -- Link to CO if applicable
  change_order_id UUID REFERENCES change_orders(id),

  -- Distribution
  distribution_list TEXT[],

  -- Attachments
  attachments JSONB DEFAULT '[]',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),

  UNIQUE(job_id, rfi_number)
);

-- Indexes
CREATE INDEX idx_rfis_job ON rfis(job_id);
CREATE INDEX idx_rfis_status ON rfis(job_id, status);
CREATE INDEX idx_rfis_number ON rfis(job_id, rfi_number);
```

### 7.3 Submittals

```sql
CREATE TABLE submittals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  -- Identity
  submittal_number TEXT NOT NULL,

  -- Content
  title TEXT NOT NULL,
  description TEXT,
  spec_section TEXT,               -- Specification section reference

  -- Vendor
  vendor_id UUID REFERENCES vendors(id),

  -- Status
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'submitted', 'under_review', 'approved', 'approved_as_noted', 'revise_resubmit', 'rejected')),

  -- Review workflow
  current_reviewer TEXT,           -- contractor, architect, owner

  -- Dates
  submitted_date DATE,
  required_date DATE,
  approved_date DATE,

  -- Revision
  revision_number INTEGER DEFAULT 0,
  previous_submittal_id UUID REFERENCES submittals(id),

  -- Review comments
  review_comments TEXT,

  -- Attachments
  attachments JSONB DEFAULT '[]',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_submittals_job ON submittals(job_id);
CREATE INDEX idx_submittals_status ON submittals(job_id, status);
CREATE INDEX idx_submittals_vendor ON submittals(vendor_id);
```

---

## 8. Time Tracking

### 8.1 Time Entries

```sql
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id),
  user_id UUID NOT NULL REFERENCES users(id),

  -- Time
  clock_in TIMESTAMPTZ NOT NULL,
  clock_out TIMESTAMPTZ,

  -- Duration (calculated)
  total_hours DECIMAL(5,2),
  regular_hours DECIMAL(5,2),
  overtime_hours DECIMAL(5,2),

  -- Breaks
  break_minutes INTEGER DEFAULT 0,

  -- Cost Code
  cost_code_id UUID REFERENCES cost_codes(id),

  -- Location
  clock_in_latitude DECIMAL(10,7),
  clock_in_longitude DECIMAL(10,7),
  clock_out_latitude DECIMAL(10,7),
  clock_out_longitude DECIMAL(10,7),

  -- Photos
  clock_in_photo_url TEXT,
  clock_out_photo_url TEXT,

  -- Notes
  notes TEXT,

  -- Status
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'adjusted')),

  -- Approval
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),

  -- Adjustments
  adjusted_at TIMESTAMPTZ,
  adjusted_by UUID REFERENCES users(id),
  adjustment_reason TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_time_entries_company ON time_entries(company_id);
CREATE INDEX idx_time_entries_user ON time_entries(user_id);
CREATE INDEX idx_time_entries_job ON time_entries(job_id);
CREATE INDEX idx_time_entries_date ON time_entries(company_id, clock_in);
CREATE INDEX idx_time_entries_status ON time_entries(company_id, status);
```

---

## 9. Closeout

### 9.1 Punch Lists

```sql
CREATE TABLE punch_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  -- Info
  name TEXT DEFAULT 'Main Punch List',
  description TEXT,

  -- Status
  status TEXT DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'completed')),

  -- Stats (calculated)
  total_items INTEGER DEFAULT 0,
  completed_items INTEGER DEFAULT 0,

  -- Dates
  walkthrough_date DATE,
  target_completion DATE,
  completed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE TABLE punch_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  punch_list_id UUID NOT NULL REFERENCES punch_lists(id) ON DELETE CASCADE,

  -- Content
  description TEXT NOT NULL,
  location TEXT,

  -- Assignment
  vendor_id UUID REFERENCES vendors(id),
  assigned_to UUID REFERENCES users(id),

  -- Priority & Status
  priority TEXT DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  status TEXT DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'completed', 'verified', 'rejected')),

  -- Dates
  due_date DATE,
  completed_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),

  -- Notes
  notes TEXT,

  -- Sort
  sort_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE punch_item_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  punch_item_id UUID NOT NULL REFERENCES punch_items(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,

  photo_type TEXT DEFAULT 'issue'
    CHECK (photo_type IN ('issue', 'progress', 'completed')),

  UNIQUE(punch_item_id, photo_id)
);

-- Indexes
CREATE INDEX idx_punch_lists_job ON punch_lists(job_id);
CREATE INDEX idx_punch_items_list ON punch_items(punch_list_id);
CREATE INDEX idx_punch_items_status ON punch_items(punch_list_id, status);
CREATE INDEX idx_punch_items_vendor ON punch_items(vendor_id);
```

### 9.2 Final Documents

```sql
CREATE TABLE final_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  -- Info
  name TEXT NOT NULL,
  category TEXT NOT NULL
    CHECK (category IN ('warranty', 'manual', 'as_built', 'certificate', 'permit', 'inspection', 'lien_release', 'other')),
  description TEXT,

  -- File
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,

  -- Status
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'received', 'approved', 'shared')),

  -- Sharing
  portal_visible BOOLEAN DEFAULT false,

  -- Metadata
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_final_docs_job ON final_docs(job_id);
CREATE INDEX idx_final_docs_category ON final_docs(job_id, category);
```

### 9.3 Warranties

```sql
CREATE TABLE warranties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  -- Item
  item TEXT NOT NULL,
  description TEXT,

  -- Coverage
  coverage_type TEXT
    CHECK (coverage_type IN ('manufacturer', 'contractor', 'extended')),

  -- Vendor
  vendor_id UUID REFERENCES vendors(id),
  manufacturer TEXT,

  -- Duration
  start_date DATE,
  end_date DATE,
  duration_years INTEGER,
  duration_months INTEGER,

  -- Contact
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,

  -- Document
  document_url TEXT,

  -- Status
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'claimed')),

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_warranties_job ON warranties(job_id);
CREATE INDEX idx_warranties_vendor ON warranties(vendor_id);
CREATE INDEX idx_warranties_end_date ON warranties(end_date);
```

### 9.4 Warranty Claims

```sql
CREATE TABLE warranty_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warranty_id UUID NOT NULL REFERENCES warranties(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id),

  -- Claim
  claim_number TEXT,
  description TEXT NOT NULL,

  -- Status
  status TEXT DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'acknowledged', 'scheduled', 'in_progress', 'completed', 'denied')),

  -- Reported
  reported_by TEXT,                -- Client name
  reported_at TIMESTAMPTZ DEFAULT NOW(),

  -- Assignment
  assigned_vendor_id UUID REFERENCES vendors(id),

  -- Service
  scheduled_date DATE,
  completed_at TIMESTAMPTZ,

  -- Resolution
  resolution TEXT,

  -- Photos
  photos JSONB DEFAULT '[]',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_claims_warranty ON warranty_claims(warranty_id);
CREATE INDEX idx_claims_job ON warranty_claims(job_id);
CREATE INDEX idx_claims_status ON warranty_claims(status);
```

---

## 10. Files & Documents

### 10.1 Folders

```sql
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES folders(id),

  -- Info
  name TEXT NOT NULL,
  description TEXT,

  -- Type
  is_system BOOLEAN DEFAULT false,
  system_type TEXT,                -- plans, contracts, permits, etc.

  -- Sharing
  portal_visible BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),

  UNIQUE(job_id, parent_id, name)
);

-- Indexes
CREATE INDEX idx_folders_job ON folders(job_id);
CREATE INDEX idx_folders_parent ON folders(parent_id);
```

### 10.2 Files

```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id),
  folder_id UUID REFERENCES folders(id),

  -- File info
  name TEXT NOT NULL,
  description TEXT,

  -- Storage
  storage_path TEXT NOT NULL,
  url TEXT,
  thumbnail_url TEXT,

  -- Metadata
  size_bytes BIGINT,
  mime_type TEXT,
  file_extension TEXT,

  -- Versioning
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES files(id),
  is_current BOOLEAN DEFAULT true,

  -- Entity link
  entity_type TEXT,
  entity_id UUID,

  -- Sharing
  portal_visible BOOLEAN DEFAULT false,

  -- Upload
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_files_company ON files(company_id);
CREATE INDEX idx_files_job ON files(job_id);
CREATE INDEX idx_files_folder ON files(folder_id);
CREATE INDEX idx_files_entity ON files(entity_type, entity_id);
```

---

## 11. Integrations

### 11.1 QuickBooks

```sql
CREATE TABLE qb_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE UNIQUE,

  -- OAuth
  realm_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,

  -- Settings
  sync_enabled BOOLEAN DEFAULT true,
  sync_vendors BOOLEAN DEFAULT true,
  sync_customers BOOLEAN DEFAULT true,
  sync_invoices BOOLEAN DEFAULT true,
  sync_bills BOOLEAN DEFAULT true,

  -- Status
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT,

  -- Connection
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  connected_by UUID REFERENCES users(id)
);

CREATE TABLE qb_entity_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  entity_type TEXT NOT NULL,
  cms_id UUID NOT NULL,
  qb_id TEXT NOT NULL,

  last_synced_at TIMESTAMPTZ,
  sync_direction TEXT DEFAULT 'both',

  UNIQUE(company_id, entity_type, cms_id)
);

-- Indexes
CREATE INDEX idx_qb_map_company ON qb_entity_map(company_id);
CREATE INDEX idx_qb_map_entity ON qb_entity_map(entity_type, cms_id);
```

---

## 12. AI Learning

### 12.1 AI Tables

```sql
-- Vendor name aliases learned from corrections
CREATE TABLE ai_vendor_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  alias TEXT NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 1.0,
  source TEXT,                     -- ocr_correction, manual_entry
  usage_count INTEGER DEFAULT 1,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, alias)
);

-- Cost code keywords learned
CREATE TABLE ai_cost_code_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  cost_code_id UUID NOT NULL REFERENCES cost_codes(id) ON DELETE CASCADE,

  keyword TEXT NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 1.0,
  usage_count INTEGER DEFAULT 1,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, keyword)
);

-- AI processing history
CREATE TABLE ai_processing_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  entity_type TEXT NOT NULL,
  entity_id UUID,

  model_version TEXT,
  processing_time_ms INTEGER,

  extracted_data JSONB,
  confidence_scores JSONB,

  corrections_made JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI-generated insights
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id),

  insight_type TEXT NOT NULL,
  severity TEXT,

  title TEXT NOT NULL,
  description TEXT,

  data JSONB,
  action_url TEXT,

  dismissed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_aliases_company ON ai_vendor_aliases(company_id);
CREATE INDEX idx_ai_aliases_vendor ON ai_vendor_aliases(vendor_id);
CREATE INDEX idx_ai_mappings_company ON ai_cost_code_mappings(company_id);
CREATE INDEX idx_ai_insights_company ON ai_insights(company_id);
CREATE INDEX idx_ai_insights_job ON ai_insights(job_id);
```

---

## 13. Portal Users

### 13.1 Client Portal

```sql
CREATE TABLE portal_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Auth
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,

  -- Profile
  name TEXT NOT NULL,
  phone TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,

  -- Invitation
  invited_at TIMESTAMPTZ,
  invited_by UUID REFERENCES users(id),
  invitation_token TEXT,
  invitation_expires_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_portal_users_client ON portal_users(client_id);
CREATE INDEX idx_portal_users_email ON portal_users(email);
```

### 13.2 Vendor Portal

```sql
CREATE TABLE vendor_portal_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Auth
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,

  -- Profile
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'user',        -- admin, user

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,

  -- Invitation
  invited_at TIMESTAMPTZ,
  invited_by UUID REFERENCES users(id),
  invitation_token TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vendor_portal_users_vendor ON vendor_portal_users(vendor_id);
CREATE INDEX idx_vendor_portal_users_email ON vendor_portal_users(email);
```

---

## 14. Row Level Security Policies

### 14.1 Core RLS Function

```sql
-- Function to get current user's company_id
CREATE OR REPLACE FUNCTION get_current_company_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'company_id')::UUID;
$$ LANGUAGE SQL STABLE;

-- Function to check if user has role
CREATE OR REPLACE FUNCTION user_has_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'role') = ANY(required_roles);
$$ LANGUAGE SQL STABLE;
```

### 14.2 Example Policies

```sql
-- Companies: Users can only see their own company
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company" ON companies
  FOR SELECT USING (id = get_current_company_id());

CREATE POLICY "Owners can update their company" ON companies
  FOR UPDATE USING (
    id = get_current_company_id()
    AND user_has_role(ARRAY['owner'])
  );

-- Jobs: Users can see jobs in their company
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company jobs" ON jobs
  FOR SELECT USING (company_id = get_current_company_id());

CREATE POLICY "Users can create jobs" ON jobs
  FOR INSERT WITH CHECK (company_id = get_current_company_id());

CREATE POLICY "Users can update jobs" ON jobs
  FOR UPDATE USING (company_id = get_current_company_id());

CREATE POLICY "Admins can delete jobs" ON jobs
  FOR DELETE USING (
    company_id = get_current_company_id()
    AND user_has_role(ARRAY['owner', 'admin'])
  );

-- Apply similar patterns to all tables...
```

---

## 15. Indexes Summary

All indexes are defined inline with their tables above. Key index patterns:
- `idx_{table}_company` - Company isolation
- `idx_{table}_job` - Job relationship
- `idx_{table}_status` - Status filtering
- `idx_{table}_created` - Time-based queries
- GIN indexes for array/JSONB columns

---

## 16. Triggers

### 16.1 Updated At Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Repeat for: users, vendors, clients, jobs, invoices, etc.
```

### 16.2 Budget Calculation Triggers

```sql
-- Update budget totals when budget lines change
CREATE OR REPLACE FUNCTION update_budget_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE budgets SET
    original_total = (SELECT COALESCE(SUM(original_amount), 0) FROM budget_lines WHERE budget_id = NEW.budget_id),
    revised_total = (SELECT COALESCE(SUM(revised_amount), 0) FROM budget_lines WHERE budget_id = NEW.budget_id),
    committed_total = (SELECT COALESCE(SUM(committed_amount), 0) FROM budget_lines WHERE budget_id = NEW.budget_id),
    invoiced_total = (SELECT COALESCE(SUM(invoiced_amount), 0) FROM budget_lines WHERE budget_id = NEW.budget_id),
    paid_total = (SELECT COALESCE(SUM(paid_amount), 0) FROM budget_lines WHERE budget_id = NEW.budget_id),
    updated_at = NOW()
  WHERE id = NEW.budget_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER budget_lines_changed
  AFTER INSERT OR UPDATE OR DELETE ON budget_lines
  FOR EACH ROW EXECUTE FUNCTION update_budget_totals();
```

---

*Document Version: 1.0*
*Last Updated: 2024*
*This is the authoritative database schema for Ross Built CMS.*
