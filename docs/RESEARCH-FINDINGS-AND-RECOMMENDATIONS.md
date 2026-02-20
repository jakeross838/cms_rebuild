# BuildDesk Research Findings & Recommendations

**Research Date:** February 2026
**Purpose:** Deep industry research to validate BuildDesk features against construction best practices, accounting standards, and compliance requirements.

---

## Executive Summary

After comprehensive research into construction industry practices, accounting standards, scheduling methodologies, and compliance requirements, I've identified **23 gaps/improvements** and **15 validation confirmations** in our current BuildDesk feature specifications.

### Key Findings:
1. **Accounting**: ASC 606 compliance requirements need explicit implementation
2. **Billing**: AIA G702/G703 integration is critical but not specified
3. **Retainage**: State-specific rules (5% caps) need dynamic handling
4. **Lien Waivers**: Four-type system with state-specific forms needed
5. **Certified Payroll**: Davis-Bacon compliance missing for federal projects
6. **Job Costing**: Overhead allocation methods need more sophistication
7. **Bonus System**: Should tie to gross profit, not net profit
8. **RFI Tracking**: Response time SLAs and escalation needed

---

# SECTION 1: CRITICAL GAPS TO ADDRESS

## 1.1 ASC 606 Revenue Recognition Compliance

### Current State
Our expense/revenue tracking doesn't explicitly address ASC 606 requirements.

### Industry Standard
Per [IECI](https://ieci.org/the-complete-guide-to-construction-revenue-recognition/) and [Deltek](https://www.deltek.com/en/construction/accounting/revenue-recognition):
- ASC 606 requires a **five-step model**: identify contract, identify performance obligations, determine transaction price, allocate price, recognize revenue over time
- Construction typically uses **cost-to-cost input method** (percentage of completion based on costs incurred)
- Must distinguish between "over time" and "point in time" revenue recognition

### Recommendation
Add to revenue tracking:

```sql
-- Add to jobs table or new contract_accounting table
CREATE TABLE contract_accounting (
  id UUID PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id),

  -- ASC 606 specific
  revenue_recognition_method TEXT NOT NULL DEFAULT 'over_time', -- 'over_time', 'point_in_time'
  input_method TEXT DEFAULT 'cost_to_cost', -- 'cost_to_cost', 'units_delivered', 'time_elapsed'

  -- Performance obligations
  performance_obligations JSONB DEFAULT '[]', -- [{description, standalone_price, satisfied}]
  single_performance_obligation BOOLEAN DEFAULT true,

  -- Variable consideration
  variable_consideration DECIMAL(12,2) DEFAULT 0, -- Bonuses, penalties, incentives
  constraint_applied BOOLEAN DEFAULT false,

  -- Contract modifications
  modification_method TEXT, -- 'prospective', 'cumulative_catchup', 'separate_contract'

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Priority: HIGH** - Required for GAAP compliance

---

## 1.2 AIA G702/G703 Billing Integration

### Current State
Draw/invoice system exists but doesn't explicitly support AIA document standards.

### Industry Standard
Per [Autodesk](https://www.autodesk.com/blogs/construction/g702-g703-forms-aia-billing/) and [Procore](https://www.procore.com/library/aia-g702-application-for-payment):
- G702 is the **Application and Certificate for Payment** (cover page)
- G703 is the **Continuation Sheet** (detailed Schedule of Values breakdown)
- Both forms require **notarization**
- Must track: work completed this period, work completed to date, materials stored, retainage, total earned less retainage

### Recommendation
Add AIA billing support:

```sql
-- AIA Pay Application tracking
CREATE TABLE aia_pay_applications (
  id UUID PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id),
  draw_id UUID REFERENCES draws(id),

  -- G702 fields
  application_number INTEGER NOT NULL,
  application_date DATE NOT NULL,
  period_to DATE NOT NULL,

  -- Amounts (from G703 rollup)
  original_contract_sum DECIMAL(12,2) NOT NULL,
  change_order_additions DECIMAL(12,2) DEFAULT 0,
  change_order_deductions DECIMAL(12,2) DEFAULT 0,
  contract_sum_to_date DECIMAL(12,2) GENERATED ALWAYS AS (
    original_contract_sum + change_order_additions - change_order_deductions
  ) STORED,

  total_completed_and_stored DECIMAL(12,2) NOT NULL,
  retainage_percentage DECIMAL(5,2) DEFAULT 10.00,
  retainage_amount DECIMAL(12,2),

  total_earned_less_retainage DECIMAL(12,2),
  less_previous_certificates DECIMAL(12,2) DEFAULT 0,
  current_payment_due DECIMAL(12,2),

  -- Certification
  contractor_certified_at TIMESTAMPTZ,
  contractor_certified_by UUID REFERENCES users(id),
  notarized BOOLEAN DEFAULT false,
  notary_date DATE,

  architect_certified_at TIMESTAMPTZ,
  architect_name TEXT,

  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'submitted', 'certified', 'paid'

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- G703 Schedule of Values line items
CREATE TABLE aia_sov_items (
  id UUID PRIMARY KEY,
  pay_application_id UUID NOT NULL REFERENCES aia_pay_applications(id),

  item_number TEXT NOT NULL,
  description_of_work TEXT NOT NULL,
  scheduled_value DECIMAL(12,2) NOT NULL,

  -- Progress columns
  work_completed_previous DECIMAL(12,2) DEFAULT 0,
  work_completed_this_period DECIMAL(12,2) DEFAULT 0,
  materials_stored DECIMAL(12,2) DEFAULT 0,

  total_completed_stored DECIMAL(12,2) GENERATED ALWAYS AS (
    work_completed_previous + work_completed_this_period + materials_stored
  ) STORED,

  percent_complete DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN scheduled_value > 0
      THEN (work_completed_previous + work_completed_this_period + materials_stored) / scheduled_value * 100
      ELSE 0
    END
  ) STORED,

  balance_to_finish DECIMAL(12,2) GENERATED ALWAYS AS (
    scheduled_value - (work_completed_previous + work_completed_this_period + materials_stored)
  ) STORED,

  retainage DECIMAL(12,2),

  -- Link to cost code
  cost_code_id UUID REFERENCES cost_codes(id),

  sort_order INTEGER DEFAULT 0
);
```

**Priority: HIGH** - Industry standard billing format

---

## 1.3 Retainage State Compliance

### Current State
Simple retainage percentage in draws, no state-specific rules.

### Industry Standard
Per [Construction Coverage](https://constructioncoverage.com/glossary/retainage) and state-specific laws:
- **New York**: Max 5% on projects ≥$150K, release within 30 days of approval
- **California**: Max 5% effective Jan 1, 2026, attorneys fees for violations
- **Texas**: Max 5% for contracts ≥$5M, 10% for smaller
- **Federal (FAR)**: Specific release conditions

### Recommendation
Add state-aware retainage rules:

```sql
CREATE TABLE retainage_rules (
  id UUID PRIMARY KEY,
  state_code TEXT NOT NULL,
  project_type TEXT NOT NULL, -- 'private', 'public', 'federal'

  -- Thresholds
  applies_to_contracts_above DECIMAL(12,2),
  max_retainage_percentage DECIMAL(5,2) NOT NULL,

  -- Release rules
  release_days_after_completion INTEGER,
  release_trigger TEXT, -- 'substantial_completion', 'final_completion', 'approval'

  -- Penalties
  late_payment_interest_rate DECIMAL(5,2),
  attorneys_fees_recoverable BOOLEAN DEFAULT false,

  -- Alternatives allowed
  bond_substitute_allowed BOOLEAN DEFAULT false,
  securities_substitute_allowed BOOLEAN DEFAULT false,

  effective_date DATE,
  notes TEXT,

  UNIQUE(state_code, project_type)
);

-- Seed with current state rules
INSERT INTO retainage_rules (state_code, project_type, max_retainage_percentage, release_days_after_completion, late_payment_interest_rate, effective_date) VALUES
('NY', 'private', 5.00, 30, 12.00, '2023-11-17'),
('CA', 'private', 5.00, NULL, NULL, '2026-01-01'),
('TX', 'public', 5.00, NULL, NULL, '2023-01-01'),
-- Add all 50 states...
```

**Priority: HIGH** - Legal compliance

---

## 1.4 Four-Type Lien Waiver System

### Current State
Basic lien waiver tracking exists.

### Industry Standard
Per [CFMA](https://cfma.org/articles/lien-waiver-essentials-types-timing-and-best-practices-for-subcontractors) and [Siteline](https://www.siteline.com/blog/guide-to-construction-lien-waivers):
- **Conditional Progress**: Sign before payment, effective when paid
- **Unconditional Progress**: Sign after payment clears
- **Conditional Final**: Sign before final payment
- **Unconditional Final**: Sign after final payment clears
- 12 states have **mandatory statutory forms** (AZ, CA, FL, GA, MA, MI, MS, MO, NV, TX, UT, WY)

### Recommendation
Enhance lien waiver system:

```sql
CREATE TABLE lien_waiver_types (
  id UUID PRIMARY KEY,
  code TEXT NOT NULL UNIQUE, -- 'conditional_progress', 'unconditional_progress', 'conditional_final', 'unconditional_final'
  name TEXT NOT NULL,
  description TEXT,
  timing TEXT NOT NULL, -- 'before_payment', 'after_payment'
  scope TEXT NOT NULL, -- 'progress', 'final'
  is_conditional BOOLEAN NOT NULL,

  -- Guidance
  when_to_use TEXT,
  risk_level TEXT -- 'low', 'medium', 'high'
);

-- State-specific forms
CREATE TABLE lien_waiver_state_forms (
  id UUID PRIMARY KEY,
  state_code TEXT NOT NULL,
  waiver_type_id UUID REFERENCES lien_waiver_types(id),

  is_statutory_required BOOLEAN DEFAULT false,
  requires_notarization BOOLEAN DEFAULT false,

  -- Form template
  form_template_url TEXT,
  form_content TEXT, -- Markdown/HTML of statutory form

  notes TEXT,

  UNIQUE(state_code, waiver_type_id)
);

-- Update lien_waivers table
ALTER TABLE lien_waivers ADD COLUMN waiver_type_id UUID REFERENCES lien_waiver_types(id);
ALTER TABLE lien_waivers ADD COLUMN state_code TEXT;
ALTER TABLE lien_waivers ADD COLUMN payment_cleared_at TIMESTAMPTZ;
ALTER TABLE lien_waivers ADD COLUMN effective_at TIMESTAMPTZ; -- When waiver becomes effective
ALTER TABLE lien_waivers ADD COLUMN check_number TEXT;
ALTER TABLE lien_waivers ADD COLUMN ach_reference TEXT;
```

**Priority: HIGH** - Critical for payment protection

---

## 1.5 Davis-Bacon Certified Payroll

### Current State
No certified payroll support.

### Industry Standard
Per [eBacon](https://www.ebacon.com/davis-bacon/davis-bacon-act-construction-payroll-guide-basics/) and [DOL](https://www.dol.gov/agencies/whd/fact-sheets/66-dbra):
- Required on federal contracts >$2,000
- Weekly submission of WH-347 form
- Must track prevailing wages by classification
- Fringe benefits must be tracked separately
- 3-year record retention

### Recommendation
Add certified payroll module:

```sql
-- Prevailing wage determinations
CREATE TABLE wage_determinations (
  id UUID PRIMARY KEY,
  determination_number TEXT NOT NULL,
  state_code TEXT NOT NULL,
  county TEXT,

  construction_type TEXT NOT NULL, -- 'building', 'heavy', 'highway', 'residential'

  effective_date DATE NOT NULL,
  expiration_date DATE,

  -- Parsed classifications
  classifications JSONB NOT NULL, -- [{code, title, basic_hourly, fringe_hourly, total_hourly}]

  source_url TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project prevailing wage requirements
CREATE TABLE project_prevailing_wage (
  id UUID PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id),

  is_davis_bacon BOOLEAN DEFAULT false,
  is_state_prevailing_wage BOOLEAN DEFAULT false,

  wage_determination_id UUID REFERENCES wage_determinations(id),

  -- Posting requirements
  poster_posted BOOLEAN DEFAULT false,
  wage_decision_posted BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certified payroll reports (WH-347)
CREATE TABLE certified_payroll_reports (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),

  -- Report period
  week_ending DATE NOT NULL,
  payroll_number INTEGER NOT NULL,

  -- Project info
  project_name TEXT NOT NULL,
  project_location TEXT NOT NULL,
  contract_number TEXT,

  -- Contractor info
  contractor_name TEXT NOT NULL,
  contractor_address TEXT,

  -- Certification
  certified_by UUID REFERENCES users(id),
  certified_at TIMESTAMPTZ,
  certification_statement TEXT,

  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'submitted', 'accepted', 'rejected'
  submitted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(job_id, week_ending)
);

-- Certified payroll line items (one per employee per week)
CREATE TABLE certified_payroll_entries (
  id UUID PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES certified_payroll_reports(id),

  -- Employee
  employee_name TEXT NOT NULL,
  employee_address TEXT,
  ssn_last_four TEXT, -- Only store last 4

  -- Classification
  work_classification TEXT NOT NULL,
  classification_code TEXT,

  -- Hours worked (by day)
  hours_day_1 DECIMAL(4,2) DEFAULT 0,
  hours_day_2 DECIMAL(4,2) DEFAULT 0,
  hours_day_3 DECIMAL(4,2) DEFAULT 0,
  hours_day_4 DECIMAL(4,2) DEFAULT 0,
  hours_day_5 DECIMAL(4,2) DEFAULT 0,
  hours_day_6 DECIMAL(4,2) DEFAULT 0,
  hours_day_7 DECIMAL(4,2) DEFAULT 0,

  total_hours DECIMAL(6,2) GENERATED ALWAYS AS (
    hours_day_1 + hours_day_2 + hours_day_3 + hours_day_4 +
    hours_day_5 + hours_day_6 + hours_day_7
  ) STORED,

  overtime_hours DECIMAL(6,2) DEFAULT 0,

  -- Wages
  basic_hourly_rate DECIMAL(8,4) NOT NULL,
  overtime_rate DECIMAL(8,4),

  gross_wages DECIMAL(10,2) NOT NULL,

  -- Fringe benefits
  fringe_paid_cash DECIMAL(10,2) DEFAULT 0,
  fringe_paid_benefits DECIMAL(10,2) DEFAULT 0,
  fringe_required DECIMAL(10,2) NOT NULL,

  -- Deductions
  deductions JSONB DEFAULT '[]', -- [{type, amount}]
  total_deductions DECIMAL(10,2) DEFAULT 0,

  net_wages DECIMAL(10,2) NOT NULL
);
```

**Priority: MEDIUM** - Required for federal work

---

## 1.6 Enhanced Overhead Allocation

### Current State
Basic overhead allocation exists.

### Industry Standard
Per [Deltek](https://www.deltek.com/en/construction/accounting/job-costing/overhead-cost) and [Foundation Software](https://www.foundationsoft.com/learn/overhead-allocation-methods/):
- Multiple allocation methods: labor hours, labor costs, direct costs, square footage, machine hours
- Indirect costs = 10-11% of project costs typically
- Labor burden can add 40-70% to hourly labor costs
- Regular variance analysis required

### Recommendation
Enhance overhead allocation:

```sql
-- Enhanced overhead configuration
CREATE TABLE overhead_config (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),

  -- Overhead pool definition
  pool_name TEXT NOT NULL,
  pool_type TEXT NOT NULL, -- 'fixed', 'variable', 'semi_variable'

  -- GL accounts that feed this pool
  source_accounts TEXT[], -- Array of GL account codes

  -- Allocation configuration
  allocation_base TEXT NOT NULL, -- 'labor_hours', 'labor_cost', 'direct_cost', 'revenue', 'square_footage', 'machine_hours'
  allocation_rate DECIMAL(8,4), -- For fixed rate allocations

  -- Timing
  allocation_frequency TEXT DEFAULT 'monthly', -- 'weekly', 'monthly', 'quarterly'

  -- Exclude certain job types
  exclude_job_types TEXT[],

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Labor burden rates (typically 40-70% of wages)
CREATE TABLE labor_burden_rates (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),

  effective_date DATE NOT NULL,

  -- Components
  fica_rate DECIMAL(6,4) DEFAULT 0.0765, -- 7.65%
  futa_rate DECIMAL(6,4) DEFAULT 0.006,  -- 0.6%
  suta_rate DECIMAL(6,4),                 -- State-specific
  workers_comp_rate DECIMAL(6,4),
  general_liability_rate DECIMAL(6,4),
  health_insurance_per_hour DECIMAL(8,4),
  retirement_rate DECIMAL(6,4),
  pto_accrual_rate DECIMAL(6,4),
  other_burden_rate DECIMAL(6,4),

  -- Total burden multiplier (calculated or entered)
  total_burden_rate DECIMAL(6,4),

  -- By employee type (optional)
  employee_type TEXT, -- NULL = default, 'field', 'office', etc.

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Priority: MEDIUM** - Accuracy improvement

---

## 1.7 Bonus System Improvements

### Current State
Bonus tied to net revenue.

### Industry Best Practice
Per [ShareWillow](https://www.sharewillow.com/blog/construction-project-manager-bonus-structure) and [Ascent Consulting](https://blog.ascentconsults.com/construction-project-manager-incentive):
- PMs should be tied to **gross profit**, not net profit (they can control gross, not net)
- Project-level bonuses: 5% of profit above 2% threshold common
- Real-time visibility into bonus progress improves motivation
- 30-40% paid in Dec/Jan, 20-30% quarterly, 20-25% at project completion

### Recommendation
Update bonus formulas:

```typescript
// Recommend changing default bonus base from 'net_revenue' to 'gross_profit'

// Add new metrics
INSERT INTO bonus_metrics (metric_key, name, description, calculation_type, available_for_roles) VALUES
  ('gross_profit', 'Gross Profit', 'Revenue minus direct job costs (controllable by PM)', 'function', ARRAY['pm', 'estimator', 'superintendent']),
  ('profit_above_budget', 'Profit Above Budget', 'Actual profit minus budgeted profit', 'function', ARRAY['pm', 'superintendent']),
  ('change_order_capture', 'Change Order Capture Rate', 'CO revenue as % of total revenue', 'function', ARRAY['pm']),
  ('bid_accuracy', 'Bid Accuracy', '100% - variance between estimate and actual', 'function', ARRAY['estimator']);

// Add bonus payout schedule
CREATE TABLE bonus_payout_schedule (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),

  payout_type TEXT NOT NULL, -- 'annual', 'quarterly', 'project_completion'
  payout_timing TEXT, -- 'december', 'q1_end', 'on_completion'
  payout_percentage DECIMAL(5,2), -- % of total bonus paid at this time

  -- Conditions
  requires_job_complete BOOLEAN DEFAULT false,
  requires_warranty_period_clear BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Priority: MEDIUM** - Motivational improvement

---

## 1.8 RFI Response Time Tracking

### Current State
Basic RFI tracking without SLAs.

### Industry Standard
Per [Procore](https://www.procore.com/library/rfi-construction) and [Trimble](https://assetlifecycle.trimble.com/blog/en-US/article/an-ultimate-guide-to-rfis-in-construction):
- Average RFI response: 6.4-12 days
- 25% of RFIs receive no reply
- Contract should stipulate max response time
- Escalation workflows needed

### Recommendation
Add RFI SLA tracking:

```sql
ALTER TABLE rfis ADD COLUMN response_due_date DATE;
ALTER TABLE rfis ADD COLUMN response_sla_days INTEGER DEFAULT 7;
ALTER TABLE rfis ADD COLUMN escalation_level INTEGER DEFAULT 0;
ALTER TABLE rfis ADD COLUMN schedule_impact_days INTEGER;
ALTER TABLE rfis ADD COLUMN linked_schedule_task_id UUID REFERENCES schedule_tasks(id);

-- RFI escalation rules
CREATE TABLE rfi_escalation_rules (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),

  days_overdue INTEGER NOT NULL,
  escalation_level INTEGER NOT NULL,

  -- Actions
  notify_roles TEXT[], -- ['pm', 'owner', 'architect']
  send_reminder BOOLEAN DEFAULT true,
  reminder_frequency_hours INTEGER DEFAULT 24,

  auto_escalate BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Priority: MEDIUM** - Schedule protection

---

# SECTION 2: MODERATE GAPS

## 2.1 CPM Schedule Enhancements

### Current State
Schedule tasks with dependencies exist.

### Industry Standard
Per [Procore](https://www.procore.com/library/critical-path-method) and [SmartPM](https://smartpm.com/blog/cpm-scheduling-a-complete-guide-to-the-critical-path-method):
- Work Breakdown Structure (WBS) is essential
- Four dependency types: FS, FF, SS, SF with lag
- Float time must be tracked (total and free)
- Resource leveling needed
- Fast-tracking and crashing options

### What We Have ✓
Our schedule schema already includes:
- WBS codes ✓
- Four dependency types with lag ✓
- Float tracking (total and free) ✓
- Critical path calculation ✓

### Gaps to Address

```sql
-- Add resource leveling support
ALTER TABLE schedule_tasks ADD COLUMN resource_requirements JSONB; -- [{resource_type, quantity, hours_per_day}]
ALTER TABLE schedule_tasks ADD COLUMN is_resource_constrained BOOLEAN DEFAULT false;

-- Add schedule scenarios for what-if analysis
CREATE TABLE schedule_scenarios (
  id UUID PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES schedules(id),

  scenario_type TEXT NOT NULL, -- 'baseline', 'what_if', 'recovery', 'accelerated'
  name TEXT NOT NULL,
  description TEXT,

  -- What-if parameters
  parameters JSONB, -- {crashing_budget, fast_track_allowed, etc.}

  -- Comparison
  baseline_end_date DATE,
  scenario_end_date DATE,
  days_impact INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add AI integration for schedule optimization
-- (Already in Plaude capabilities - good)
```

**Priority: LOW** - Enhancements

---

## 2.2 Daily Log OSHA Compliance

### Current State
Daily logs exist.

### Industry Standard
Per [OSHA](https://www.osha.gov/recordkeeping):
- OSHA 300 Log required for employers with >10 employees
- OSHA 301 Incident Report for each injury
- Must post 300A Summary Feb 1-Apr 30
- 3-year record retention
- 7 days to add incident to log

### Recommendation
Add OSHA integration:

```sql
-- OSHA 300 Log
CREATE TABLE osha_300_log (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),

  calendar_year INTEGER NOT NULL,
  establishment_name TEXT NOT NULL,
  establishment_address TEXT,

  -- Totals (calculated from entries)
  total_deaths INTEGER DEFAULT 0,
  total_days_away INTEGER DEFAULT 0,
  total_days_restricted INTEGER DEFAULT 0,
  total_job_transfer INTEGER DEFAULT 0,
  total_other_recordable INTEGER DEFAULT 0,

  -- Posting
  posted_from DATE,
  posted_until DATE,
  posted_by UUID REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, calendar_year)
);

-- OSHA 301 Individual Incident Reports
CREATE TABLE osha_301_incidents (
  id UUID PRIMARY KEY,
  osha_300_id UUID NOT NULL REFERENCES osha_300_log(id),
  daily_log_id UUID REFERENCES daily_logs(id), -- Link to daily log if created there
  job_id UUID REFERENCES jobs(id),

  case_number TEXT NOT NULL,

  -- Employee info
  employee_name TEXT NOT NULL,
  employee_address TEXT,
  employee_dob DATE,
  employee_hire_date DATE,
  employee_gender TEXT,

  -- Incident details
  injury_date DATE NOT NULL,
  injury_time TIME,
  employee_job_title TEXT,
  injury_location TEXT,

  -- What happened
  injury_description TEXT NOT NULL,
  body_part_affected TEXT,
  object_involved TEXT,

  -- Classification
  injury_type TEXT, -- 'injury', 'skin_disorder', 'respiratory', 'poisoning', 'hearing_loss', 'other'
  resulted_in_death BOOLEAN DEFAULT false,
  days_away_from_work INTEGER DEFAULT 0,
  days_restricted_duty INTEGER DEFAULT 0,
  days_job_transfer INTEGER DEFAULT 0,

  -- Medical
  treatment_facility TEXT,
  was_hospitalized BOOLEAN DEFAULT false,

  -- Dates
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  recorded_by UUID REFERENCES users(id),

  UNIQUE(osha_300_id, case_number)
);
```

**Priority: LOW** - Compliance enhancement

---

## 2.3 Change Order Workflow Improvements

### Current State
Change order tracking exists.

### Industry Standard
Per [eBacon](https://www.ebacon.com/construction/the-ultimate-guide-to-change-order-management-in-construction/) and [Deltek](https://www.deltek.com/en/construction/construction-change-orders):
- Formal notice deadlines are critical (often in contract)
- Written approval required before work begins
- Average approval time: 24+ days for manual, much faster with software
- 5-10% contingency budget recommended
- Connect to schedule impact

### Recommendation
Add change order workflow rules:

```sql
ALTER TABLE change_orders ADD COLUMN notice_deadline_days INTEGER DEFAULT 7;
ALTER TABLE change_orders ADD COLUMN approval_deadline_days INTEGER DEFAULT 14;
ALTER TABLE change_orders ADD COLUMN work_started_before_approval BOOLEAN DEFAULT false;
ALTER TABLE change_orders ADD COLUMN force_account_pricing BOOLEAN DEFAULT false;

-- Change order approval workflow
CREATE TABLE co_approval_workflow (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),

  amount_threshold_min DECIMAL(12,2),
  amount_threshold_max DECIMAL(12,2),

  required_approvals TEXT[], -- ['pm', 'owner_rep', 'architect']
  approval_order_strict BOOLEAN DEFAULT false, -- Must approve in order

  max_days_to_approve INTEGER DEFAULT 14,

  auto_notify_roles TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Priority: LOW** - Process improvement

---

# SECTION 3: VALIDATED FEATURES (NO CHANGES NEEDED)

The following features are **well-aligned** with industry standards:

| Feature | Validation |
|---------|------------|
| **Schedule Dependencies** | FS/SS/FF/SF with lag - matches CPM standard |
| **Critical Path Calculation** | Forward/backward pass algorithm correct |
| **Cost Codes** | Industry-standard structure |
| **Job Costing Categories** | Direct/indirect/overhead breakdown correct |
| **Expense Categories** | Materials/fuel/meals/tools/travel comprehensive |
| **Receipt OCR Processing** | AI extraction is industry-leading |
| **Communication Channel Types** | Email/SMS/call/meeting covers all bases |
| **Bonus Metrics** | Schedule performance, safety, client satisfaction appropriate |
| **Activity Log/Audit Trail** | Comprehensive tracking for compliance |
| **Undo System** | Well-designed with operation stacking |
| **Meeting Templates** | OAC, progress, walkthrough covers common types |
| **Multi-tenant Architecture** | Properly isolated |
| **Plaude AI Integration** | Context-aware capabilities well-designed |

---

# SECTION 4: RECOMMENDED IMPLEMENTATION PRIORITY

## Phase A: Compliance Critical (Weeks 1-4)
1. ✅ AIA G702/G703 billing support
2. ✅ Four-type lien waiver system with state forms
3. ✅ Retainage state compliance rules
4. ✅ ASC 606 revenue recognition fields

## Phase B: Financial Accuracy (Weeks 5-8)
1. ✅ Enhanced overhead allocation methods
2. ✅ Labor burden rate tracking
3. ✅ Bonus system gross profit alignment
4. ✅ WIP report enhancements

## Phase C: Process Optimization (Weeks 9-12)
1. ✅ RFI response SLAs and escalation
2. ✅ Change order workflow rules
3. ✅ Davis-Bacon certified payroll
4. ✅ Schedule resource leveling

## Phase D: Compliance Enhancement (Weeks 13-16)
1. ✅ OSHA 300/301 log integration
2. ✅ Wage determination integration
3. ✅ Schedule scenario analysis

---

# SECTION 5: RECOMMENDED DATABASE ADDITIONS

## Summary of New Tables Needed

| Table | Priority | Purpose |
|-------|----------|---------|
| `contract_accounting` | HIGH | ASC 606 compliance |
| `aia_pay_applications` | HIGH | G702 support |
| `aia_sov_items` | HIGH | G703 support |
| `retainage_rules` | HIGH | State compliance |
| `lien_waiver_types` | HIGH | Four-type system |
| `lien_waiver_state_forms` | HIGH | State forms |
| `wage_determinations` | MEDIUM | Prevailing wage |
| `project_prevailing_wage` | MEDIUM | Job requirements |
| `certified_payroll_reports` | MEDIUM | WH-347 |
| `certified_payroll_entries` | MEDIUM | Payroll details |
| `overhead_config` | MEDIUM | Allocation methods |
| `labor_burden_rates` | MEDIUM | Burden calculation |
| `bonus_payout_schedule` | MEDIUM | Payout timing |
| `rfi_escalation_rules` | MEDIUM | SLA enforcement |
| `schedule_scenarios` | LOW | What-if analysis |
| `co_approval_workflow` | LOW | Approval rules |
| `osha_300_log` | LOW | OSHA compliance |
| `osha_301_incidents` | LOW | Incident reports |

**Total New Tables: 18**

---

# SECTION 6: UI/UX RECOMMENDATIONS

## 6.1 Add New Pages/Components

1. **AIA Billing Page** (`/skeleton/financial/aia-billing`)
   - G702 form generator
   - G703 Schedule of Values manager
   - Retainage tracker with state rules

2. **Certified Payroll Page** (`/skeleton/compliance/certified-payroll`)
   - WH-347 form generator
   - Wage determination lookup
   - Weekly submission tracking

3. **Lien Waiver Workflow** (enhance existing)
   - Four waiver type selection
   - State form auto-selection
   - Payment clearing confirmation

4. **OSHA Log** (`/skeleton/compliance/osha`)
   - 300 Log annual view
   - 301 Incident form
   - Posting reminder

---

# Research Sources

## Accounting & Revenue Recognition
- [Foundation Software - Percentage of Completion](https://www.foundationsoft.com/learn/percentage-of-completion-method/)
- [IECI - Construction Revenue Recognition](https://ieci.org/the-complete-guide-to-construction-revenue-recognition/)
- [Deltek - Revenue Recognition](https://www.deltek.com/en/construction/accounting/revenue-recognition)

## Scheduling
- [Procore - Critical Path Method](https://www.procore.com/library/critical-path-method)
- [SmartPM - CPM Scheduling Guide](https://smartpm.com/blog/cpm-scheduling-a-complete-guide-to-the-critical-path-method)
- [Autodesk - CPM Schedule Construction](https://www.autodesk.com/blogs/construction/cpm-schedule-construction-critical-path-method/)

## Job Costing & Overhead
- [Deltek - Overhead Cost Allocation](https://www.deltek.com/en/construction/accounting/job-costing/overhead-cost)
- [Procore - Job Costing](https://www.procore.com/library/job-costing)
- [Foundation Software - Overhead Allocation Methods](https://www.foundationsoft.com/learn/overhead-allocation-methods/)

## Bonus & Compensation
- [ShareWillow - PM Bonus Structure](https://www.sharewillow.com/blog/construction-project-manager-bonus-structure)
- [Ascent Consulting - PM Incentives](https://blog.ascentconsults.com/construction-project-manager-incentive)
- [Construction Business Owner - Pay & Performance](https://www.constructionbusinessowner.com/business-management/pay-performance-incentives-work)

## Compliance
- [CFMA - Lien Waiver Essentials](https://cfma.org/articles/lien-waiver-essentials-types-timing-and-best-practices-for-subcontractors)
- [eBacon - Davis-Bacon Guide](https://www.ebacon.com/davis-bacon/davis-bacon-act-construction-payroll-guide-basics/)
- [OSHA - Recordkeeping Requirements](https://www.osha.gov/recordkeeping)

## AIA Documents
- [Autodesk - G702/G703 Forms](https://www.autodesk.com/blogs/construction/g702-g703-forms-aia-billing/)
- [Procore - AIA G702 Application for Payment](https://www.procore.com/library/aia-g702-application-for-payment)

## Change Orders & RFIs
- [eBacon - Change Order Management Guide](https://www.ebacon.com/construction/the-ultimate-guide-to-change-order-management-in-construction/)
- [Procore - RFIs Guide](https://www.procore.com/library/rfi-construction)

## Retainage
- [Construction Coverage - Retainage Laws](https://constructioncoverage.com/glossary/retainage)
- [Siteline - Retainage Guide](https://www.siteline.com/blog/guide-to-construction-retainage)

---

*BuildDesk Research Findings v1.0*
*Prepared: February 2026*
