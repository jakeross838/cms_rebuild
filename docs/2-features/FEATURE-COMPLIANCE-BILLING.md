# BuildDesk Compliance & Billing Features

**Based on:** Industry Research Findings (February 2026)
**Priority:** Critical - Required for GAAP/Legal Compliance

---

## Feature Overview

| Feature | Priority | Tables | Status |
|---------|----------|--------|--------|
| ASC 606 Revenue Recognition | HIGH | 1 | Spec Complete |
| AIA G702/G703 Billing | HIGH | 2 | Spec Complete |
| State Retainage Rules | HIGH | 1 | Spec Complete |
| Four-Type Lien Waivers | HIGH | 2 | Spec Complete |
| Davis-Bacon Certified Payroll | MEDIUM | 4 | Spec Complete |
| OSHA 300/301 Logging | LOW | 2 | Spec Complete |

---

# 1. ASC 606 REVENUE RECOGNITION

## Overview
Implements GAAP-compliant revenue recognition per ASC 606 five-step model.

## Database Schema

```sql
-- Contract accounting for ASC 606 compliance
CREATE TABLE contract_accounting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),

  -- ASC 606 Step 1: Identify Contract
  contract_identified BOOLEAN DEFAULT true,
  contract_date DATE,
  contract_parties JSONB, -- [{name, role}]

  -- ASC 606 Step 2: Identify Performance Obligations
  single_performance_obligation BOOLEAN DEFAULT true,
  performance_obligations JSONB DEFAULT '[]',
  -- [{id, description, standalone_price, satisfied, satisfied_at, method}]

  -- ASC 606 Step 3: Determine Transaction Price
  base_contract_price DECIMAL(14,2) NOT NULL,
  variable_consideration DECIMAL(12,2) DEFAULT 0, -- Bonuses, penalties, incentives
  variable_consideration_method TEXT, -- 'expected_value', 'most_likely_amount'
  constraint_applied BOOLEAN DEFAULT false,
  constraint_reason TEXT,
  financing_component DECIMAL(12,2) DEFAULT 0,
  noncash_consideration DECIMAL(12,2) DEFAULT 0,
  consideration_payable_to_customer DECIMAL(12,2) DEFAULT 0,
  transaction_price DECIMAL(14,2) GENERATED ALWAYS AS (
    base_contract_price + variable_consideration - financing_component -
    noncash_consideration - consideration_payable_to_customer
  ) STORED,

  -- ASC 606 Step 4: Allocate Transaction Price
  allocation_method TEXT DEFAULT 'standalone_selling_price',
  -- 'standalone_selling_price', 'residual_approach', 'adjusted_market'

  -- ASC 606 Step 5: Recognize Revenue
  revenue_recognition_method TEXT NOT NULL DEFAULT 'over_time',
  -- 'over_time', 'point_in_time'

  over_time_criteria TEXT,
  -- 'customer_controls_asset', 'customer_receives_benefits', 'no_alternative_use'

  input_method TEXT DEFAULT 'cost_to_cost',
  -- 'cost_to_cost', 'labor_hours', 'machine_hours', 'units_produced'

  output_method TEXT,
  -- 'units_delivered', 'milestones_achieved', 'surveys_of_work'

  -- Contract Modifications
  has_modifications BOOLEAN DEFAULT false,
  modification_method TEXT,
  -- 'separate_contract', 'prospective', 'cumulative_catchup'

  -- Costs
  incremental_costs_obtaining DECIMAL(12,2) DEFAULT 0, -- Sales commissions, etc.
  costs_to_fulfill DECIMAL(12,2) DEFAULT 0,
  amortization_period_months INTEGER,

  -- Current State
  revenue_recognized_to_date DECIMAL(14,2) DEFAULT 0,
  costs_incurred_to_date DECIMAL(14,2) DEFAULT 0,
  estimated_total_costs DECIMAL(14,2),
  percent_complete DECIMAL(5,2) DEFAULT 0,

  -- Calculated fields
  estimated_gross_profit DECIMAL(14,2) GENERATED ALWAYS AS (
    transaction_price - estimated_total_costs
  ) STORED,

  gross_profit_recognized DECIMAL(14,2) GENERATED ALWAYS AS (
    revenue_recognized_to_date - costs_incurred_to_date
  ) STORED,

  -- Disclosure requirements
  remaining_performance_obligation DECIMAL(14,2),
  expected_timing_of_satisfaction TEXT, -- 'within_1_year', '1_to_2_years', 'over_2_years'

  -- Audit trail
  last_calculated_at TIMESTAMPTZ,
  calculated_by UUID REFERENCES users(id),
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(job_id)
);

-- Revenue recognition journal entries
CREATE TABLE revenue_recognition_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  contract_accounting_id UUID NOT NULL REFERENCES contract_accounting(id),
  job_id UUID NOT NULL REFERENCES jobs(id),

  -- Period
  period_year INTEGER NOT NULL,
  period_month INTEGER NOT NULL,

  -- Calculation inputs
  costs_incurred_this_period DECIMAL(12,2) NOT NULL,
  cumulative_costs DECIMAL(14,2) NOT NULL,
  estimated_total_costs DECIMAL(14,2) NOT NULL,
  percent_complete DECIMAL(5,2) NOT NULL,

  -- Revenue calculation
  cumulative_revenue_earned DECIMAL(14,2) NOT NULL,
  revenue_recognized_this_period DECIMAL(14,2) NOT NULL,

  -- Gross profit
  cumulative_gross_profit DECIMAL(14,2),
  gross_profit_this_period DECIMAL(14,2),

  -- Overbilling/Underbilling
  billings_to_date DECIMAL(14,2) NOT NULL,
  over_under_billing DECIMAL(14,2) GENERATED ALWAYS AS (
    billings_to_date - cumulative_revenue_earned
  ) STORED,
  billing_status TEXT GENERATED ALWAYS AS (
    CASE
      WHEN billings_to_date > cumulative_revenue_earned THEN 'overbilled'
      WHEN billings_to_date < cumulative_revenue_earned THEN 'underbilled'
      ELSE 'balanced'
    END
  ) STORED,

  -- Journal entry references
  journal_entry_id UUID,

  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'posted', 'adjusted'
  posted_at TIMESTAMPTZ,
  posted_by UUID REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(contract_accounting_id, period_year, period_month)
);

-- Indexes
CREATE INDEX idx_contract_accounting_job ON contract_accounting(job_id);
CREATE INDEX idx_contract_accounting_company ON contract_accounting(company_id);
CREATE INDEX idx_revenue_entries_period ON revenue_recognition_entries(period_year, period_month);
```

## Implementation

```typescript
// lib/accounting/asc606.ts

interface PerformanceObligation {
  id: string
  description: string
  standalonePrice: number
  satisfied: boolean
  satisfiedAt?: Date
  method: 'over_time' | 'point_in_time'
}

interface RevenueCalculation {
  periodYear: number
  periodMonth: number
  costsIncurredThisPeriod: number
  cumulativeCosts: number
  estimatedTotalCosts: number
  percentComplete: number
  cumulativeRevenueEarned: number
  revenueThisPeriod: number
  billingsToDate: number
  overUnderBilling: number
}

export async function calculateRevenueRecognition(
  jobId: string,
  periodYear: number,
  periodMonth: number
): Promise<RevenueCalculation> {
  // Get contract accounting record
  const contract = await getContractAccounting(jobId)

  // Get costs incurred this period
  const costsThisPeriod = await getCostsIncurred(jobId, periodYear, periodMonth)

  // Get cumulative costs
  const cumulativeCosts = await getCumulativeCosts(jobId, periodYear, periodMonth)

  // Calculate percent complete (cost-to-cost method)
  const percentComplete = contract.estimatedTotalCosts > 0
    ? (cumulativeCosts / contract.estimatedTotalCosts) * 100
    : 0

  // Calculate cumulative revenue earned
  const cumulativeRevenueEarned = contract.transactionPrice * (percentComplete / 100)

  // Get previous period's cumulative revenue
  const previousRevenue = await getPreviousRevenueRecognized(jobId, periodYear, periodMonth)

  // Revenue to recognize this period
  const revenueThisPeriod = cumulativeRevenueEarned - previousRevenue

  // Get billings to date
  const billingsToDate = await getBillingsToDate(jobId)

  // Calculate over/under billing
  const overUnderBilling = billingsToDate - cumulativeRevenueEarned

  return {
    periodYear,
    periodMonth,
    costsIncurredThisPeriod: costsThisPeriod,
    cumulativeCosts,
    estimatedTotalCosts: contract.estimatedTotalCosts,
    percentComplete,
    cumulativeRevenueEarned,
    revenueThisPeriod,
    billingsToDate,
    overUnderBilling
  }
}

// WIP Report generation
export async function generateWIPReport(
  companyId: string,
  asOfDate: Date
): Promise<WIPReportLine[]> {
  const contracts = await getActiveContracts(companyId)

  return Promise.all(contracts.map(async (contract) => {
    const calc = await calculateRevenueRecognition(
      contract.jobId,
      asOfDate.getFullYear(),
      asOfDate.getMonth() + 1
    )

    return {
      jobId: contract.jobId,
      jobName: contract.jobName,
      contractPrice: contract.transactionPrice,
      estimatedCosts: contract.estimatedTotalCosts,
      estimatedProfit: contract.estimatedGrossProfit,
      costsToDate: calc.cumulativeCosts,
      percentComplete: calc.percentComplete,
      earnedRevenue: calc.cumulativeRevenueEarned,
      billingsToDate: calc.billingsToDate,
      overUnderBilling: calc.overUnderBilling,
      billingStatus: calc.overUnderBilling > 0 ? 'overbilled' :
                     calc.overUnderBilling < 0 ? 'underbilled' : 'balanced',
      projectedProfit: contract.transactionPrice - contract.estimatedTotalCosts,
      profitFade: (contract.transactionPrice - contract.estimatedTotalCosts) -
                  contract.estimatedGrossProfit
    }
  }))
}
```

---

# 2. AIA G702/G703 BILLING

## Overview
Implements industry-standard AIA billing format with G702 cover sheet and G703 schedule of values.

## Database Schema

```sql
-- AIA Pay Applications (G702)
CREATE TABLE aia_pay_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  draw_id UUID REFERENCES draws(id), -- Link to existing draw if applicable

  -- Application identification
  application_number INTEGER NOT NULL,
  application_date DATE NOT NULL,
  period_to DATE NOT NULL,
  project_name TEXT NOT NULL,

  -- Contract parties
  owner_name TEXT,
  owner_address TEXT,
  architect_name TEXT,
  architect_project_number TEXT,
  contractor_name TEXT NOT NULL,
  contractor_address TEXT,

  -- G702 Section 1: Original Contract Sum
  original_contract_sum DECIMAL(14,2) NOT NULL,

  -- G702 Section 2: Net Change by Change Orders
  net_change_orders DECIMAL(14,2) DEFAULT 0,
  change_order_additions DECIMAL(14,2) DEFAULT 0,
  change_order_deductions DECIMAL(14,2) DEFAULT 0,

  -- G702 Section 3: Contract Sum to Date
  contract_sum_to_date DECIMAL(14,2) GENERATED ALWAYS AS (
    original_contract_sum + net_change_orders
  ) STORED,

  -- G702 Section 4: Total Completed & Stored to Date (from G703)
  total_completed_stored DECIMAL(14,2) DEFAULT 0,

  -- G702 Section 5: Retainage
  retainage_work_completed_pct DECIMAL(5,2) DEFAULT 10.00,
  retainage_work_completed_amt DECIMAL(12,2) DEFAULT 0,
  retainage_stored_materials_pct DECIMAL(5,2) DEFAULT 10.00,
  retainage_stored_materials_amt DECIMAL(12,2) DEFAULT 0,
  total_retainage DECIMAL(12,2) DEFAULT 0,

  -- G702 Section 6: Total Earned Less Retainage
  total_earned_less_retainage DECIMAL(14,2) GENERATED ALWAYS AS (
    total_completed_stored - total_retainage
  ) STORED,

  -- G702 Section 7: Less Previous Certificates
  less_previous_certificates DECIMAL(14,2) DEFAULT 0,

  -- G702 Section 8: Current Payment Due
  current_payment_due DECIMAL(14,2) GENERATED ALWAYS AS (
    total_completed_stored - total_retainage - less_previous_certificates
  ) STORED,

  -- G702 Section 9: Balance to Finish (Plus Retainage)
  balance_to_finish_plus_retainage DECIMAL(14,2) GENERATED ALWAYS AS (
    contract_sum_to_date - total_completed_stored + total_retainage
  ) STORED,

  -- Change Order Summary
  change_orders_approved_previous DECIMAL(14,2) DEFAULT 0,
  change_orders_approved_this_month DECIMAL(14,2) DEFAULT 0,
  change_orders_approved_total DECIMAL(14,2) DEFAULT 0,

  -- Contractor Certification
  contractor_certified BOOLEAN DEFAULT false,
  contractor_certified_at TIMESTAMPTZ,
  contractor_certified_by UUID REFERENCES users(id),
  contractor_signature TEXT, -- Base64 signature image

  -- Notarization (required by AIA standard)
  notarized BOOLEAN DEFAULT false,
  notary_name TEXT,
  notary_date DATE,
  notary_commission_expires DATE,
  notary_county TEXT,
  notary_state TEXT,

  -- Architect's Certificate for Payment
  architect_certified BOOLEAN DEFAULT false,
  architect_certified_at TIMESTAMPTZ,
  architect_name_certified TEXT,
  architect_certified_amount DECIMAL(14,2),
  architect_signature TEXT,

  -- Supporting documents required
  lien_waivers_attached BOOLEAN DEFAULT false,
  insurance_certificates_current BOOLEAN DEFAULT false,
  certified_payroll_attached BOOLEAN DEFAULT false,

  -- Status
  status TEXT DEFAULT 'draft',
  -- 'draft', 'pending_notary', 'submitted', 'architect_review',
  -- 'certified', 'paid', 'rejected'

  submitted_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  paid_amount DECIMAL(14,2),
  payment_reference TEXT,

  -- Rejection handling
  rejected_at TIMESTAMPTZ,
  rejected_by TEXT,
  rejection_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(job_id, application_number)
);

-- AIA Schedule of Values (G703)
CREATE TABLE aia_sov_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  pay_application_id UUID NOT NULL REFERENCES aia_pay_applications(id),

  -- Item identification
  item_number TEXT NOT NULL, -- Can be hierarchical: "1", "1.1", "1.1.1"
  description_of_work TEXT NOT NULL,

  -- Link to cost code
  cost_code_id UUID REFERENCES cost_codes(id),

  -- Column A: Scheduled Value
  scheduled_value DECIMAL(12,2) NOT NULL,

  -- Column B: Work Completed from Previous Application
  work_completed_previous DECIMAL(12,2) DEFAULT 0,

  -- Column C: Work Completed This Period
  work_completed_this_period DECIMAL(12,2) DEFAULT 0,

  -- Column D: Materials Presently Stored
  materials_stored DECIMAL(12,2) DEFAULT 0,
  materials_stored_location TEXT, -- 'on_site', 'off_site', 'both'

  -- Column E: Total Completed and Stored to Date (B + C + D)
  total_completed_stored DECIMAL(12,2) GENERATED ALWAYS AS (
    work_completed_previous + work_completed_this_period + materials_stored
  ) STORED,

  -- Column F: Percentage Complete (E / A)
  percent_complete DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN scheduled_value > 0
      THEN ROUND((work_completed_previous + work_completed_this_period + materials_stored) / scheduled_value * 100, 2)
      ELSE 0
    END
  ) STORED,

  -- Column G: Balance to Finish (A - E)
  balance_to_finish DECIMAL(12,2) GENERATED ALWAYS AS (
    scheduled_value - (work_completed_previous + work_completed_this_period + materials_stored)
  ) STORED,

  -- Column H: Retainage (calculated based on application retainage %)
  retainage DECIMAL(12,2) DEFAULT 0,

  -- Change order linkage
  is_change_order BOOLEAN DEFAULT false,
  change_order_id UUID REFERENCES change_orders(id),
  change_order_number TEXT,

  -- Sorting
  sort_order INTEGER DEFAULT 0,
  parent_item_id UUID REFERENCES aia_sov_items(id),
  level INTEGER DEFAULT 0,

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- G702/G703 Templates (reusable SOV structure)
CREATE TABLE aia_sov_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),

  name TEXT NOT NULL,
  description TEXT,
  job_type TEXT, -- 'residential', 'commercial', 'remodel', etc.

  -- Template items
  items JSONB NOT NULL, -- [{item_number, description, cost_code, default_percentage}]

  is_default BOOLEAN DEFAULT false,

  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_aia_pay_apps_job ON aia_pay_applications(job_id);
CREATE INDEX idx_aia_pay_apps_status ON aia_pay_applications(status);
CREATE INDEX idx_aia_sov_items_app ON aia_sov_items(pay_application_id);
CREATE INDEX idx_aia_sov_items_co ON aia_sov_items(change_order_id);
```

## Implementation

```typescript
// lib/billing/aia-billing.ts

interface G702Data {
  applicationNumber: number
  applicationDate: Date
  periodTo: Date
  originalContractSum: number
  netChangeOrders: number
  totalCompletedStored: number
  retainagePercent: number
  lessPreviousCertificates: number
}

interface G703Item {
  itemNumber: string
  description: string
  scheduledValue: number
  workCompletedPrevious: number
  workCompletedThisPeriod: number
  materialsStored: number
  costCodeId?: string
  isChangeOrder?: boolean
  changeOrderId?: string
}

export async function createPayApplication(
  jobId: string,
  periodTo: Date,
  sovItems: G703Item[]
): Promise<AIAPayApplication> {
  // Get job and previous applications
  const job = await getJob(jobId)
  const previousApps = await getPreviousApplications(jobId)
  const appNumber = previousApps.length + 1

  // Calculate G702 values
  const originalContractSum = job.contractAmount
  const changeOrders = await getApprovedChangeOrders(jobId)
  const netChangeOrders = changeOrders.reduce((sum, co) => sum + co.amount, 0)

  // Calculate totals from G703
  const totalCompletedStored = sovItems.reduce(
    (sum, item) => sum + item.workCompletedPrevious + item.workCompletedThisPeriod + item.materialsStored,
    0
  )

  // Get retainage rules for state
  const retainageRules = await getRetainageRules(job.state, job.projectType)
  const retainagePercent = retainageRules.maxRetainagePercentage

  // Calculate retainage
  const workCompleted = sovItems.reduce(
    (sum, item) => sum + item.workCompletedPrevious + item.workCompletedThisPeriod,
    0
  )
  const materialsStored = sovItems.reduce((sum, item) => sum + item.materialsStored, 0)

  const retainageWorkCompleted = workCompleted * (retainagePercent / 100)
  const retainageMaterials = materialsStored * (retainagePercent / 100)
  const totalRetainage = retainageWorkCompleted + retainageMaterials

  // Less previous certificates
  const previousCertificates = previousApps.reduce(
    (sum, app) => sum + (app.currentPaymentDue || 0),
    0
  )

  // Create application
  const app = await supabase.from('aia_pay_applications').insert({
    company_id: job.companyId,
    job_id: jobId,
    application_number: appNumber,
    application_date: new Date(),
    period_to: periodTo,
    project_name: job.name,
    contractor_name: job.companyName,
    original_contract_sum: originalContractSum,
    net_change_orders: netChangeOrders,
    change_order_additions: changeOrders.filter(co => co.amount > 0).reduce((s, co) => s + co.amount, 0),
    change_order_deductions: Math.abs(changeOrders.filter(co => co.amount < 0).reduce((s, co) => s + co.amount, 0)),
    total_completed_stored: totalCompletedStored,
    retainage_work_completed_pct: retainagePercent,
    retainage_work_completed_amt: retainageWorkCompleted,
    retainage_stored_materials_pct: retainagePercent,
    retainage_stored_materials_amt: retainageMaterials,
    total_retainage: totalRetainage,
    less_previous_certificates: previousCertificates,
    status: 'draft'
  }).select().single()

  // Create SOV items
  for (const item of sovItems) {
    await supabase.from('aia_sov_items').insert({
      company_id: job.companyId,
      pay_application_id: app.data.id,
      item_number: item.itemNumber,
      description_of_work: item.description,
      scheduled_value: item.scheduledValue,
      work_completed_previous: item.workCompletedPrevious,
      work_completed_this_period: item.workCompletedThisPeriod,
      materials_stored: item.materialsStored,
      cost_code_id: item.costCodeId,
      is_change_order: item.isChangeOrder || false,
      change_order_id: item.changeOrderId,
      retainage: (item.workCompletedPrevious + item.workCompletedThisPeriod + item.materialsStored) * (retainagePercent / 100)
    })
  }

  return app.data
}

// Generate PDF for G702/G703
export async function generateG702G703PDF(applicationId: string): Promise<Buffer> {
  const app = await getPayApplication(applicationId)
  const items = await getSOVItems(applicationId)

  // Use PDF generation library (e.g., puppeteer, pdfkit)
  // Return AIA-formatted PDF
  return generatePDF('aia-g702-g703', { application: app, items })
}
```

---

# 3. STATE RETAINAGE RULES

## Database Schema

```sql
-- State-specific retainage rules
CREATE TABLE retainage_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Location
  state_code TEXT NOT NULL, -- 'NY', 'CA', 'TX', etc.
  county TEXT, -- Some rules are county-specific

  -- Project type
  project_type TEXT NOT NULL, -- 'private', 'public_state', 'public_local', 'federal'

  -- Thresholds
  applies_to_contracts_above DECIMAL(14,2), -- NULL means all contracts
  applies_to_contracts_below DECIMAL(14,2),

  -- Retainage limits
  max_retainage_percentage DECIMAL(5,2) NOT NULL,
  reduced_retainage_at_percent_complete DECIMAL(5,2), -- e.g., reduce at 50%
  reduced_retainage_percentage DECIMAL(5,2), -- What it reduces to

  -- Release requirements
  release_trigger TEXT NOT NULL,
  -- 'substantial_completion', 'final_completion', 'acceptance', 'days_after_completion'
  release_days_after_completion INTEGER,
  release_requires_lien_waiver BOOLEAN DEFAULT true,
  release_requires_consent_of_surety BOOLEAN DEFAULT false,

  -- Penalties for late release
  late_payment_interest_rate DECIMAL(5,2), -- Annual rate, e.g., 12.00 = 12%
  interest_calculation_method TEXT, -- 'simple', 'compound_monthly'
  attorneys_fees_recoverable BOOLEAN DEFAULT false,
  penalty_amount DECIMAL(10,2),

  -- Substitutes allowed
  bond_substitute_allowed BOOLEAN DEFAULT false,
  securities_substitute_allowed BOOLEAN DEFAULT false,
  letter_of_credit_allowed BOOLEAN DEFAULT false,
  escrow_allowed BOOLEAN DEFAULT false,

  -- Statutory form requirements
  statutory_form_required BOOLEAN DEFAULT false,
  statutory_form_url TEXT,

  -- Effective dates
  effective_date DATE NOT NULL,
  expiration_date DATE, -- NULL means currently in effect

  -- Notes and source
  notes TEXT,
  source_citation TEXT, -- e.g., "NY Gen. Bus. Law § 756-c"
  source_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(state_code, project_type, effective_date)
);

-- Seed with key state rules
INSERT INTO retainage_rules (state_code, project_type, max_retainage_percentage, release_trigger, release_days_after_completion, late_payment_interest_rate, attorneys_fees_recoverable, applies_to_contracts_above, effective_date, source_citation) VALUES
-- New York (5% Retainage Law - Nov 2023)
('NY', 'private', 5.00, 'acceptance', 30, 12.00, false, 150000, '2023-11-17', 'NY Gen. Bus. Law § 756-c'),
('NY', 'public_state', 5.00, 'final_completion', NULL, NULL, false, NULL, '2023-11-17', 'NY State Finance Law § 139-f'),

-- California (Effective Jan 2026)
('CA', 'private', 5.00, 'final_completion', NULL, NULL, true, NULL, '2026-01-01', 'CA Civil Code § 8811'),
('CA', 'public_state', 5.00, 'final_completion', NULL, NULL, false, NULL, '2020-01-01', 'CA Public Contract Code § 7107'),

-- Texas
('TX', 'public_state', 5.00, 'final_completion', NULL, NULL, false, 5000000, '2023-01-01', 'TX Gov''t Code § 2252.032'),
('TX', 'public_state', 10.00, 'final_completion', NULL, NULL, false, NULL, '2023-01-01', 'TX Gov''t Code § 2252.032'),
('TX', 'private', 10.00, 'final_completion', NULL, NULL, false, NULL, '2023-01-01', 'TX Property Code § 28.002'),

-- Florida
('FL', 'private', 10.00, 'substantial_completion', NULL, NULL, false, NULL, '2020-01-01', 'FL Stat. § 713.346'),
('FL', 'public_state', 5.00, 'final_completion', 30, NULL, false, NULL, '2020-01-01', 'FL Stat. § 255.078'),

-- Arizona
('AZ', 'public_state', 10.00, 'final_completion', 60, NULL, false, NULL, '2020-01-01', 'AZ Rev. Stat. § 34-221'),

-- Georgia
('GA', 'private', 10.00, 'substantial_completion', NULL, NULL, false, NULL, '2020-01-01', 'GA Code § 13-10-80'),

-- Colorado
('CO', 'public_state', 5.00, 'final_completion', NULL, NULL, false, NULL, '2020-01-01', 'CO Rev. Stat. § 24-91-103'),

-- Federal (FAR)
('US', 'federal', 10.00, 'final_completion', NULL, NULL, false, NULL, '2020-01-01', 'FAR 52.232-5');

-- Index
CREATE INDEX idx_retainage_rules_state ON retainage_rules(state_code, project_type);
```

---

# 4. FOUR-TYPE LIEN WAIVER SYSTEM

## Database Schema

```sql
-- Lien waiver types
CREATE TABLE lien_waiver_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  code TEXT NOT NULL UNIQUE,
  -- 'conditional_progress', 'unconditional_progress', 'conditional_final', 'unconditional_final'

  name TEXT NOT NULL,
  short_name TEXT NOT NULL, -- For UI badges

  -- Classification
  is_conditional BOOLEAN NOT NULL,
  scope TEXT NOT NULL, -- 'progress', 'final'

  -- Timing
  sign_timing TEXT NOT NULL, -- 'before_payment', 'after_payment'
  effective_timing TEXT NOT NULL, -- 'upon_payment_clearing', 'immediate'

  -- Guidance
  description TEXT,
  when_to_use TEXT,
  risk_level TEXT, -- 'low', 'medium', 'high'
  warnings TEXT[],

  -- Display
  color TEXT, -- For UI
  icon TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the four types
INSERT INTO lien_waiver_types (code, name, short_name, is_conditional, scope, sign_timing, effective_timing, description, when_to_use, risk_level, warnings, color) VALUES
(
  'conditional_progress',
  'Conditional Waiver and Release on Progress Payment',
  'Cond. Progress',
  true,
  'progress',
  'before_payment',
  'upon_payment_clearing',
  'Waives lien rights for a specific amount, but only becomes effective after payment clears.',
  'Submit with each pay application before receiving payment. Protects your lien rights until payment actually clears.',
  'low',
  ARRAY['Effective only after payment clears', 'Keep copy until funds available'],
  'blue'
),
(
  'unconditional_progress',
  'Unconditional Waiver and Release on Progress Payment',
  'Uncond. Progress',
  false,
  'progress',
  'after_payment',
  'immediate',
  'Immediately waives lien rights for the specified amount upon signing.',
  'Sign and submit ONLY after payment has fully cleared your bank account.',
  'high',
  ARRAY['IMMEDIATE effect - waives rights when signed', 'Never sign until funds are verified in your account', 'Cannot be revoked'],
  'amber'
),
(
  'conditional_final',
  'Conditional Waiver and Release on Final Payment',
  'Cond. Final',
  true,
  'final',
  'before_payment',
  'upon_payment_clearing',
  'Waives all lien rights on the project, but only becomes effective after final payment clears.',
  'Submit with final pay application. All lien rights for entire project will be waived once payment clears.',
  'medium',
  ARRAY['Covers ENTIRE project', 'Effective only after final payment clears', 'Verify all amounts are correct before signing'],
  'green'
),
(
  'unconditional_final',
  'Unconditional Waiver and Release on Final Payment',
  'Uncond. Final',
  false,
  'final',
  'after_payment',
  'immediate',
  'Immediately waives ALL lien rights on the entire project upon signing.',
  'Sign ONLY after final payment (including all retention) has fully cleared your bank account.',
  'high',
  ARRAY['IMMEDIATE effect - waives ALL rights when signed', 'Covers ENTIRE project including retention', 'Never sign until ALL funds verified', 'Cannot be revoked'],
  'red'
);

-- State-specific statutory forms
CREATE TABLE lien_waiver_state_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  state_code TEXT NOT NULL,
  waiver_type_id UUID NOT NULL REFERENCES lien_waiver_types(id),

  -- Statutory requirements
  is_statutory_required BOOLEAN DEFAULT false, -- Must use exact form
  statutory_form_name TEXT,
  statutory_citation TEXT,

  -- Form content
  form_template TEXT, -- HTML/Markdown template
  form_pdf_url TEXT, -- Link to official PDF
  required_fields JSONB, -- Fields that must be completed

  -- Notarization
  requires_notarization BOOLEAN DEFAULT false,

  -- Special requirements
  special_requirements TEXT[],

  -- Dates
  effective_date DATE,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(state_code, waiver_type_id)
);

-- States with statutory forms
INSERT INTO lien_waiver_state_forms (state_code, waiver_type_id, is_statutory_required, requires_notarization, statutory_citation)
SELECT
  state_code,
  (SELECT id FROM lien_waiver_types WHERE code = 'conditional_progress'),
  true,
  CASE WHEN state_code IN ('WY', 'MS') THEN true ELSE false END,
  CASE state_code
    WHEN 'CA' THEN 'CA Civil Code § 8132'
    WHEN 'AZ' THEN 'AZ Rev. Stat. § 33-1008'
    WHEN 'TX' THEN 'TX Property Code § 53.284'
    WHEN 'FL' THEN 'FL Stat. § 713.20'
    WHEN 'GA' THEN 'GA Code § 44-14-366'
    WHEN 'MI' THEN 'MI Comp. Laws § 570.1115'
    WHEN 'NV' THEN 'NV Rev. Stat. § 108.2457'
    WHEN 'UT' THEN 'UT Code § 38-1a-802'
    WHEN 'MO' THEN 'MO Rev. Stat. § 429.013'
    WHEN 'MA' THEN 'MA Gen. Laws Ch. 254 § 32'
    WHEN 'MS' THEN 'MS Code § 85-7-419'
    WHEN 'WY' THEN 'WY Stat. § 29-2-110'
  END
FROM (VALUES ('CA'), ('AZ'), ('TX'), ('FL'), ('GA'), ('MI'), ('NV'), ('UT'), ('MO'), ('MA'), ('MS'), ('WY')) AS states(state_code);

-- Repeat for other waiver types...

-- Enhanced lien_waivers table
ALTER TABLE lien_waivers ADD COLUMN IF NOT EXISTS waiver_type_id UUID REFERENCES lien_waiver_types(id);
ALTER TABLE lien_waivers ADD COLUMN IF NOT EXISTS state_code TEXT;
ALTER TABLE lien_waivers ADD COLUMN IF NOT EXISTS through_date DATE; -- Work covered through
ALTER TABLE lien_waivers ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(12,2);
ALTER TABLE lien_waivers ADD COLUMN IF NOT EXISTS check_number TEXT;
ALTER TABLE lien_waivers ADD COLUMN IF NOT EXISTS ach_reference TEXT;
ALTER TABLE lien_waivers ADD COLUMN IF NOT EXISTS payment_date DATE;
ALTER TABLE lien_waivers ADD COLUMN IF NOT EXISTS payment_cleared_at TIMESTAMPTZ;
ALTER TABLE lien_waivers ADD COLUMN IF NOT EXISTS effective_at TIMESTAMPTZ;
ALTER TABLE lien_waivers ADD COLUMN IF NOT EXISTS exceptions TEXT; -- Work or amounts excepted
ALTER TABLE lien_waivers ADD COLUMN IF NOT EXISTS notarized BOOLEAN DEFAULT false;
ALTER TABLE lien_waivers ADD COLUMN IF NOT EXISTS notarized_at TIMESTAMPTZ;
ALTER TABLE lien_waivers ADD COLUMN IF NOT EXISTS notary_name TEXT;
ALTER TABLE lien_waivers ADD COLUMN IF NOT EXISTS generated_from_state_form BOOLEAN DEFAULT false;

-- Indexes
CREATE INDEX idx_lien_waivers_type ON lien_waivers(waiver_type_id);
CREATE INDEX idx_lien_waivers_state ON lien_waivers(state_code);
CREATE INDEX idx_lien_waiver_state_forms ON lien_waiver_state_forms(state_code);
```

---

# 5. DAVIS-BACON CERTIFIED PAYROLL

## Database Schema

```sql
-- Wage determinations from SAM.gov
CREATE TABLE wage_determinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  determination_number TEXT NOT NULL, -- e.g., "TX20230001"
  modification_number INTEGER DEFAULT 0,

  -- Location
  state_code TEXT NOT NULL,
  county TEXT,

  -- Construction type
  construction_type TEXT NOT NULL,
  -- 'building', 'heavy', 'highway', 'residential'

  -- Dates
  determination_date DATE NOT NULL,
  effective_date DATE NOT NULL,
  expiration_date DATE,

  -- Classifications and rates
  classifications JSONB NOT NULL,
  -- [{
  --   code: "CARP0001",
  --   title: "Carpenter",
  --   group: "1",
  --   basic_hourly_rate: 35.50,
  --   health_welfare: 8.25,
  --   pension: 5.00,
  --   vacation: 2.50,
  --   training: 0.75,
  --   other_fringe: 0,
  --   total_fringe: 16.50,
  --   total_hourly: 52.00
  -- }]

  -- Source
  source_url TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),

  -- Status
  is_current BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(determination_number, modification_number)
);

-- Project prevailing wage requirements
CREATE TABLE project_prevailing_wage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),

  -- Type of requirement
  is_davis_bacon BOOLEAN DEFAULT false, -- Federal
  is_state_prevailing_wage BOOLEAN DEFAULT false,

  -- Wage determination
  wage_determination_id UUID REFERENCES wage_determinations(id),
  wage_determination_number TEXT,

  -- Contract info
  federal_contract_number TEXT,
  federal_agency TEXT,
  state_contract_number TEXT,
  state_agency TEXT,

  -- Apprenticeship
  apprenticeship_program_required BOOLEAN DEFAULT false,
  apprenticeship_ratio TEXT, -- e.g., "1:3" (1 apprentice per 3 journeymen)

  -- Posting requirements
  poster_posted BOOLEAN DEFAULT false,
  poster_posted_date DATE,
  wage_decision_posted BOOLEAN DEFAULT false,
  wage_decision_posted_date DATE,
  employee_notice_posted BOOLEAN DEFAULT false,

  -- Interview requirements
  interviews_required BOOLEAN DEFAULT false,
  interviews_frequency TEXT, -- 'weekly', 'monthly', 'random'

  -- Compliance contacts
  contracting_officer_name TEXT,
  contracting_officer_email TEXT,
  contracting_officer_phone TEXT,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(job_id)
);

-- Certified payroll reports (WH-347)
CREATE TABLE certified_payroll_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  project_prevailing_wage_id UUID REFERENCES project_prevailing_wage(id),

  -- Report identification
  payroll_number INTEGER NOT NULL,
  week_ending DATE NOT NULL,

  -- Project information
  project_name TEXT NOT NULL,
  project_number TEXT,
  project_location TEXT NOT NULL,
  contract_number TEXT,

  -- Contractor information
  contractor_name TEXT NOT NULL,
  contractor_address TEXT,
  contractor_ein TEXT, -- Employer ID (encrypted)

  -- Prime contractor (if subcontractor)
  is_subcontractor BOOLEAN DEFAULT false,
  prime_contractor_name TEXT,
  prime_contractor_address TEXT,

  -- Building/Construction type
  building_type TEXT, -- 'building', 'heavy', 'highway', 'residential'

  -- Totals (calculated from entries)
  total_employees INTEGER DEFAULT 0,
  total_hours DECIMAL(10,2) DEFAULT 0,
  total_gross_wages DECIMAL(12,2) DEFAULT 0,
  total_deductions DECIMAL(12,2) DEFAULT 0,
  total_net_wages DECIMAL(12,2) DEFAULT 0,

  -- Certification
  certification_statement TEXT,
  certified_by_name TEXT NOT NULL,
  certified_by_title TEXT,
  certified_at TIMESTAMPTZ,
  certified_by_user_id UUID REFERENCES users(id),
  signature TEXT, -- Base64 signature image

  -- Submission
  status TEXT DEFAULT 'draft',
  -- 'draft', 'pending_certification', 'certified', 'submitted', 'accepted', 'rejected', 'corrected'

  submitted_at TIMESTAMPTZ,
  submitted_to TEXT,
  submitted_method TEXT, -- 'email', 'portal', 'mail', 'lcptracker'

  -- Review
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  review_notes TEXT,

  -- Corrections
  is_correction BOOLEAN DEFAULT false,
  corrects_payroll_id UUID REFERENCES certified_payroll_reports(id),
  correction_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(job_id, payroll_number, week_ending)
);

-- Certified payroll entries (one per employee per week)
CREATE TABLE certified_payroll_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  report_id UUID NOT NULL REFERENCES certified_payroll_reports(id),

  -- Employee information
  employee_id UUID REFERENCES users(id), -- If in system
  employee_name TEXT NOT NULL,
  employee_address TEXT,
  employee_ssn_last_four TEXT, -- Only last 4 digits stored
  employee_ssn_hash TEXT, -- Full SSN hash for verification

  -- Work classification
  work_classification TEXT NOT NULL, -- e.g., "Carpenter"
  classification_code TEXT, -- From wage determination

  -- Apprentice info
  is_apprentice BOOLEAN DEFAULT false,
  apprentice_percentage DECIMAL(5,2), -- e.g., 70.00 = 70% of journeyman rate
  apprenticeship_program TEXT,

  -- Work performed
  work_performed TEXT, -- Description of work this week

  -- Hours worked (by day of week)
  hours_sunday DECIMAL(4,2) DEFAULT 0,
  hours_monday DECIMAL(4,2) DEFAULT 0,
  hours_tuesday DECIMAL(4,2) DEFAULT 0,
  hours_wednesday DECIMAL(4,2) DEFAULT 0,
  hours_thursday DECIMAL(4,2) DEFAULT 0,
  hours_friday DECIMAL(4,2) DEFAULT 0,
  hours_saturday DECIMAL(4,2) DEFAULT 0,

  total_straight_time_hours DECIMAL(6,2) GENERATED ALWAYS AS (
    hours_sunday + hours_monday + hours_tuesday + hours_wednesday +
    hours_thursday + hours_friday + hours_saturday
  ) STORED,

  overtime_hours DECIMAL(6,2) DEFAULT 0,
  total_hours DECIMAL(6,2) GENERATED ALWAYS AS (
    hours_sunday + hours_monday + hours_tuesday + hours_wednesday +
    hours_thursday + hours_friday + hours_saturday + overtime_hours
  ) STORED,

  -- Wage rates
  basic_hourly_rate DECIMAL(8,4) NOT NULL,
  overtime_rate DECIMAL(8,4), -- Typically 1.5x
  prevailing_wage_rate DECIMAL(8,4) NOT NULL, -- From wage determination

  -- Gross wages
  straight_time_wages DECIMAL(10,2) NOT NULL,
  overtime_wages DECIMAL(10,2) DEFAULT 0,
  gross_wages DECIMAL(10,2) NOT NULL,

  -- Fringe benefits
  fringe_paid_to_programs DECIMAL(10,2) DEFAULT 0, -- Bona fide programs
  fringe_paid_in_cash DECIMAL(10,2) DEFAULT 0,
  total_fringe_paid DECIMAL(10,2) GENERATED ALWAYS AS (
    fringe_paid_to_programs + fringe_paid_in_cash
  ) STORED,
  fringe_required DECIMAL(10,2) NOT NULL, -- From wage determination

  -- Deductions
  deductions JSONB DEFAULT '[]',
  -- [{type: "federal_tax", amount: 250.00}, {type: "fica", amount: 85.50}, ...]
  total_deductions DECIMAL(10,2) DEFAULT 0,

  -- Net wages
  net_wages DECIMAL(10,2) NOT NULL,

  -- Compliance flags
  meets_prevailing_wage BOOLEAN GENERATED ALWAYS AS (
    (basic_hourly_rate + (COALESCE(fringe_paid_to_programs, 0) + COALESCE(fringe_paid_in_cash, 0)) /
      NULLIF(hours_sunday + hours_monday + hours_tuesday + hours_wednesday + hours_thursday + hours_friday + hours_saturday, 0))
    >= prevailing_wage_rate
  ) STORED,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_wage_determinations_state ON wage_determinations(state_code, construction_type);
CREATE INDEX idx_wage_determinations_current ON wage_determinations(is_current);
CREATE INDEX idx_project_prevailing_wage_job ON project_prevailing_wage(job_id);
CREATE INDEX idx_certified_payroll_reports_job ON certified_payroll_reports(job_id);
CREATE INDEX idx_certified_payroll_reports_week ON certified_payroll_reports(week_ending);
CREATE INDEX idx_certified_payroll_entries_report ON certified_payroll_entries(report_id);
```

---

# 6. OSHA 300/301 LOGGING

## Database Schema

```sql
-- OSHA 300 Log (annual injury/illness log)
CREATE TABLE osha_300_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),

  -- Establishment info
  calendar_year INTEGER NOT NULL,
  establishment_name TEXT NOT NULL,
  establishment_address TEXT,
  establishment_city TEXT,
  establishment_state TEXT,
  establishment_zip TEXT,
  naics_code TEXT, -- Industry code

  -- SIC code (legacy)
  sic_code TEXT,

  -- Employee counts (for rate calculations)
  annual_average_employees INTEGER,
  total_hours_worked_all_employees INTEGER,

  -- Totals (auto-calculated from incidents)
  total_deaths INTEGER DEFAULT 0,
  total_days_away_from_work INTEGER DEFAULT 0,
  total_days_job_transfer_restriction INTEGER DEFAULT 0,
  total_other_recordable_cases INTEGER DEFAULT 0,

  -- Injury totals
  total_injuries INTEGER DEFAULT 0,

  -- Illness totals
  total_skin_disorders INTEGER DEFAULT 0,
  total_respiratory_conditions INTEGER DEFAULT 0,
  total_poisonings INTEGER DEFAULT 0,
  total_hearing_loss INTEGER DEFAULT 0,
  total_other_illnesses INTEGER DEFAULT 0,

  -- Posting (required Feb 1 - Apr 30)
  summary_posted BOOLEAN DEFAULT false,
  summary_posted_from DATE,
  summary_posted_until DATE,
  posted_by UUID REFERENCES users(id),
  posted_at TIMESTAMPTZ,

  -- Certification (300A form)
  certified BOOLEAN DEFAULT false,
  certified_by_name TEXT,
  certified_by_title TEXT,
  certified_at TIMESTAMPTZ,
  certified_by_phone TEXT,
  certified_date DATE,

  -- Status
  status TEXT DEFAULT 'open', -- 'open', 'closed', 'certified'

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, calendar_year, establishment_name)
);

-- OSHA 301 Individual Incident Reports
CREATE TABLE osha_301_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  osha_300_id UUID NOT NULL REFERENCES osha_300_log(id),

  -- Link to other records
  job_id UUID REFERENCES jobs(id),
  daily_log_id UUID REFERENCES daily_logs(id),
  daily_log_incident_id UUID, -- If from daily log safety section

  -- Case number (unique within year)
  case_number TEXT NOT NULL,

  -- Employee Information (Section A)
  employee_name TEXT NOT NULL,
  employee_address TEXT,
  employee_city TEXT,
  employee_state TEXT,
  employee_zip TEXT,
  employee_dob DATE,
  employee_gender TEXT, -- 'male', 'female', 'other'
  date_hired DATE,

  -- Physician/Healthcare Provider (Section B)
  healthcare_provider_name TEXT,
  healthcare_provider_facility TEXT,
  healthcare_provider_address TEXT,
  healthcare_provider_city TEXT,
  healthcare_provider_state TEXT,
  healthcare_provider_zip TEXT,

  was_treated_in_emergency_room BOOLEAN DEFAULT false,
  was_hospitalized BOOLEAN DEFAULT false,
  hospitalized_nights INTEGER DEFAULT 0,

  -- Incident Details (Section C)
  incident_date DATE NOT NULL,
  incident_time TIME,
  employee_job_title TEXT,
  department TEXT,

  -- Location
  incident_location TEXT NOT NULL,
  incident_location_type TEXT, -- 'job_site', 'office', 'warehouse', 'travel', 'other'

  -- What happened
  what_was_employee_doing TEXT NOT NULL, -- Be specific
  how_did_injury_occur TEXT NOT NULL, -- What happened
  what_object_or_substance TEXT, -- What harmed employee

  -- Injury/Illness Details (Section D)
  injury_type TEXT NOT NULL,
  -- 'injury', 'skin_disorder', 'respiratory_condition', 'poisoning', 'hearing_loss', 'other_illness'

  body_part_affected TEXT NOT NULL,
  side_of_body TEXT, -- 'left', 'right', 'both', 'na'

  nature_of_injury TEXT, -- 'cut', 'fracture', 'sprain', 'burn', 'amputation', etc.

  -- Classification checkboxes (from OSHA 300 log)
  resulted_in_death BOOLEAN DEFAULT false,
  date_of_death DATE,

  days_away_from_work BOOLEAN DEFAULT false,
  days_away_count INTEGER DEFAULT 0,

  days_restricted_duty BOOLEAN DEFAULT false,
  days_restricted_count INTEGER DEFAULT 0,

  days_job_transfer BOOLEAN DEFAULT false,
  days_job_transfer_count INTEGER DEFAULT 0,

  other_recordable_case BOOLEAN DEFAULT false,

  -- Privacy case (can hide name on 300 log)
  is_privacy_case BOOLEAN DEFAULT false,
  privacy_case_reason TEXT,

  -- Dates
  date_returned_to_work DATE,

  -- Recording
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  recorded_by UUID REFERENCES users(id),

  -- Must be recorded within 7 days
  recording_deadline DATE GENERATED ALWAYS AS (incident_date + INTERVAL '7 days') STORED,
  recorded_on_time BOOLEAN GENERATED ALWAYS AS (
    recorded_at::date <= incident_date + INTERVAL '7 days'
  ) STORED,

  -- Investigation
  investigation_completed BOOLEAN DEFAULT false,
  investigation_date DATE,
  investigation_findings TEXT,
  corrective_actions TEXT,
  corrective_actions_completed BOOLEAN DEFAULT false,

  -- OSHA report (if required)
  osha_notification_required BOOLEAN DEFAULT false,
  -- Required for: death, hospitalization, amputation, loss of eye
  osha_notified BOOLEAN DEFAULT false,
  osha_notification_date TIMESTAMPTZ,
  osha_notification_method TEXT, -- 'phone', 'online'
  osha_notification_reference TEXT,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(osha_300_id, case_number)
);

-- Indexes
CREATE INDEX idx_osha_300_company_year ON osha_300_log(company_id, calendar_year);
CREATE INDEX idx_osha_301_log ON osha_301_incidents(osha_300_id);
CREATE INDEX idx_osha_301_job ON osha_301_incidents(job_id);
CREATE INDEX idx_osha_301_date ON osha_301_incidents(incident_date);
```

---

# 7. IMPLEMENTATION SUMMARY

## New Tables Created

| Table | Purpose | Priority |
|-------|---------|----------|
| `contract_accounting` | ASC 606 compliance | HIGH |
| `revenue_recognition_entries` | Period revenue calculations | HIGH |
| `aia_pay_applications` | G702 billing | HIGH |
| `aia_sov_items` | G703 Schedule of Values | HIGH |
| `aia_sov_templates` | Reusable SOV templates | MEDIUM |
| `retainage_rules` | State-specific retainage | HIGH |
| `lien_waiver_types` | Four waiver types | HIGH |
| `lien_waiver_state_forms` | Statutory forms | HIGH |
| `wage_determinations` | Prevailing wages | MEDIUM |
| `project_prevailing_wage` | Project requirements | MEDIUM |
| `certified_payroll_reports` | WH-347 reports | MEDIUM |
| `certified_payroll_entries` | Payroll line items | MEDIUM |
| `osha_300_log` | Annual log | LOW |
| `osha_301_incidents` | Incident reports | LOW |

**Total: 14 new tables**

---

*BuildDesk Compliance & Billing Features v1.0*
*February 2026*
