# Reporting & Forecasting Data Gaps

**Created:** 2026-02-12
**Purpose:** Document all missing tables, fields, and computed views required for comprehensive reporting and forecasting. These gaps were identified by auditing the existing specs against the full report catalog (50+ report types).

**Status:** 16 gaps identified. Implementation should be phased alongside the reports that consume them.

---

## Gap Summary

| # | Gap | Tables/Fields Needed | Reports Blocked | Priority |
|---|-----|---------------------|-----------------|----------|
| 1 | WIP enhancements | 4 new fields on `wip_snapshots` | WIP Schedule, Profit Fade, Over/Under Billing | Tier 1 |
| 2 | Revenue recognition | New `revenue_recognition_entries` table | Revenue Recognition, GAAP financial statements | Tier 1 |
| 3 | Backlog tracking | New `backlog_snapshots` table + view + field on `jobs` | Backlog Report, Burn-Down Forecast, Revenue Forecast | Tier 1 |
| 4 | Labor productivity | New `labor_productivity_snapshots` table + field on schedule tasks | Labor Forecast, Resource Utilization, Productivity Benchmarking | Tier 2 |
| 5 | Pipeline forecasting | New `pipeline_forecast_snapshots` + `lead_stage_transitions` tables | Pipeline Forecast, Lead Funnel, Revenue Forecast | Tier 2 |
| 6 | Bid accuracy | New `bid_accuracy_records` table + field on `bid_invitations` | Bid Win/Loss, Vendor Scorecard, Estimating Accuracy | Tier 2 |
| 7 | Equipment utilization summaries | New `equipment_utilization_summaries` table | Equipment Utilization Report | Tier 3 |
| 8 | Warranty analytics | New fields on `warranty_claims` + new `warranty_analytics` table | Warranty Tracking, Quality Metrics, Closeout Report | Tier 3 |
| 9 | Client satisfaction | New `client_surveys` + `client_referrals` tables | Client Satisfaction, Profitability by Client, Referral ROI | Tier 3 |
| 10 | Earned value fields | New fields on budget/schedule for EVM calculations | Cost-to-Complete, Schedule Variance, Job Health Score | Tier 1 |
| 11 | Custom report definitions | `report_snapshots` + `report_folders` + fields on `report_definitions` | Custom Report Builder, Dashboard Composer, Report Snapshots | Tier 2.5 |
| 12 | GL / accounting integration | `gl_accounts` + `gl_journal_entries` + `gl_journal_lines` | GL Trial Balance, Balance Sheet, P&L, JC-to-GL Reconciliation | Tier 2.5 |
| 13 | HR / payroll tables | `employee_payroll_config` + `employee_certifications` + `payroll_summaries` | Certified Payroll, Labor Burden, Overtime, WC Audit, Training | Tier 2.5 |
| 14 | Sales & use tax | Fields on invoices/POs + `tax_summaries` table | Sales & Use Tax Report, Multi-State Payroll Tax | Tier 2.5 |
| 15 | Schedule constraints & lookahead | `schedule_constraints` + `weekly_work_plans` + daily log fields | 3-Week Lookahead, PPC, Constraint Log, Weather Delays | Tier 2.5 |
| 16 | Document completeness & transmittals | `transmittals` + `transmittal_items` + `document_checklists` | Transmittal Log, Document Completeness, Closeout Tracker | Tier 2.5 |

---

## Tier 1 — Critical for Bank/Surety/CPA Reporting

### Gap 1: WIP Schedule Enhancements

**Current state:** Module 19 defines `wip_snapshots` with contract_value, costs_incurred, estimated_cost_to_complete, percent_complete, earned_revenue, billings_to_date, over_under_billing. Good foundation.

**Missing fields:**

```sql
ALTER TABLE wip_snapshots ADD COLUMN estimated_gross_profit DECIMAL(14,2);
-- contract_value - estimated_total_cost. Needed for standard WIP report.

ALTER TABLE wip_snapshots ADD COLUMN profit_fade DECIMAL(14,2);
-- Change in estimated_gross_profit vs prior period. Core metric for bonding/CPA.

ALTER TABLE wip_snapshots ADD COLUMN backlog_value DECIMAL(14,2);
-- contract_value - earned_revenue. Required by banks and sureties.

ALTER TABLE wip_snapshots ADD COLUMN prior_snapshot_id UUID REFERENCES wip_snapshots(id);
-- Link to previous period snapshot for delta calculations.
```

**Reports that need this:** WIP Schedule, Over/Under Billing, Profit Fade Analysis, Backlog Report

---

### Gap 2: Revenue Recognition

**Current state:** Draws and billings are tracked. WIP has earned_revenue. But there is no formal ASC 606 separation of recognized vs deferred revenue, no overbilling/underbilling GL classification, and no audit trail.

**New table:**

```sql
CREATE TABLE revenue_recognition_entries (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  period_year INTEGER NOT NULL,
  period_month INTEGER NOT NULL,
  recognition_method TEXT NOT NULL, -- 'pct_completion_cost' | 'pct_completion_schedule' | 'completed_contract' | 'manual'

  -- Contract data
  contract_value DECIMAL(14,2),
  estimated_total_cost DECIMAL(14,2),

  -- Recognition
  cumulative_recognized_revenue DECIMAL(14,2),
  period_recognized_revenue DECIMAL(14,2),
  cumulative_recognized_cost DECIMAL(14,2),
  period_recognized_cost DECIMAL(14,2),

  -- Billing comparison
  cumulative_billed DECIMAL(14,2),
  overbilling DECIMAL(14,2),       -- Billings > earned = liability (current liability)
  underbilling DECIMAL(14,2),      -- Earned > billings = asset (current asset)

  -- Deferred revenue (client deposits, prepayments)
  deferred_revenue DECIMAL(14,2),

  -- Audit
  notes TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rev_rec_company_period ON revenue_recognition_entries(company_id, period_year, period_month);
```

**Reports that need this:** Revenue Recognition Report, GAAP-compliant financial statements, bank covenant reporting

---

### Gap 3: Backlog Tracking

**Current state:** Jobs have `status` and `contract_amount`. No formal backlog calculation or time-series tracking.

**New table + view + field:**

```sql
-- Add contract execution date to jobs
ALTER TABLE jobs ADD COLUMN contract_signed_date DATE;

-- Materialized view for current backlog
CREATE VIEW company_backlog AS
SELECT
  j.company_id,
  j.id AS job_id,
  j.name,
  j.contract_amount + COALESCE(SUM(co.amount), 0) AS revised_contract,
  j.status,
  COALESCE(ws.earned_revenue, 0) AS revenue_earned,
  (j.contract_amount + COALESCE(SUM(co.amount), 0)) - COALESCE(ws.earned_revenue, 0) AS remaining_backlog,
  j.contract_signed_date,
  j.start_date,
  j.target_completion
FROM jobs j
LEFT JOIN change_orders co ON co.job_id = j.id AND co.status = 'approved'
LEFT JOIN LATERAL (
  SELECT earned_revenue FROM wip_snapshots ws2
  WHERE ws2.project_id = j.id ORDER BY created_at DESC LIMIT 1
) ws ON true
WHERE j.status IN ('pre_construction', 'active')
GROUP BY j.id, ws.earned_revenue;

-- Historical backlog snapshots for trend analysis
CREATE TABLE backlog_snapshots (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  snapshot_date DATE NOT NULL,

  total_backlog DECIMAL(14,2),          -- Sum of remaining backlog across all active jobs
  backlog_added DECIMAL(14,2),          -- New contracts signed in period
  backlog_burned DECIMAL(14,2),         -- Revenue recognized in period

  active_job_count INTEGER,
  pre_construction_backlog DECIMAL(14,2),
  active_backlog DECIMAL(14,2),

  weighted_pipeline DECIMAL(14,2),      -- Leads * probability (forward-looking)

  months_of_backlog DECIMAL(5,1),       -- Total backlog / average monthly burn rate

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_backlog_snapshot_date ON backlog_snapshots(company_id, snapshot_date);
```

**Reports that need this:** Backlog Report, Backlog Burn-Down Forecast, Revenue Forecast, Executive Dashboard

---

### Gap 10: Earned Value Management Fields

**Current state:** Module 9 (Budget) references EVM conceptually (PV, EV, AC, CPI, SPI) in Section 9.7 but no fields exist for storage. Schedule tasks have planned dates but no planned value or planned hours.

**New fields:**

```sql
-- On budget_lines (or a new earned_value_metrics table per job/period)
CREATE TABLE earned_value_snapshots (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES jobs(id),
  snapshot_date DATE NOT NULL,

  -- Core EVM metrics (at job level)
  budget_at_completion DECIMAL(14,2),     -- BAC: total budget
  planned_value DECIMAL(14,2),            -- PV: budget for work scheduled to date
  earned_value DECIMAL(14,2),             -- EV: budget for work actually completed
  actual_cost DECIMAL(14,2),              -- AC: actual cost of work completed

  -- Performance indices
  cost_performance_index DECIMAL(6,4),    -- CPI = EV / AC (< 1.0 = over budget)
  schedule_performance_index DECIMAL(6,4),-- SPI = EV / PV (< 1.0 = behind schedule)

  -- Forecasting
  estimate_at_completion DECIMAL(14,2),   -- EAC = BAC / CPI
  estimate_to_complete DECIMAL(14,2),     -- ETC = EAC - AC
  variance_at_completion DECIMAL(14,2),   -- VAC = BAC - EAC
  to_complete_performance_index DECIMAL(6,4), -- TCPI = (BAC - EV) / (BAC - AC)

  -- AI enhancements
  ai_adjusted_eac DECIMAL(14,2),          -- AI-adjusted EAC (incorporates committed, seasonal, vendor patterns)
  ai_confidence DECIMAL(3,2),             -- Confidence in AI projection

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_ev_snapshot ON earned_value_snapshots(job_id, snapshot_date);

-- Add planned hours to schedule tasks
ALTER TABLE schedule_tasks ADD COLUMN planned_labor_hours DECIMAL(10,2);
ALTER TABLE schedule_tasks ADD COLUMN planned_value DECIMAL(14,2); -- budgeted cost for this task
```

**Reports that need this:** Cost-to-Complete (EAC), Schedule Variance (SPI), Job Health Score, Monthly Status Report

---

## Tier 2 — High Value for Builder Intelligence

### Gap 4: Labor Productivity Metrics

**Current state:** Daily logs capture manpower (vendor, headcount, hours, trade). HR module captures time entries with burden rates. But no computed productivity metrics exist.

**New table:**

```sql
CREATE TABLE labor_productivity_snapshots (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES jobs(id),
  cost_code_id UUID REFERENCES cost_codes(id),
  trade TEXT NOT NULL,

  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Hours
  internal_labor_hours DECIMAL(10,2),    -- Employee hours (from time entries)
  sub_labor_hours DECIMAL(10,2),         -- Subcontractor hours (from daily logs)
  total_labor_hours DECIMAL(10,2),       -- Combined

  -- Costs
  internal_labor_cost DECIMAL(14,2),     -- Burdened cost
  sub_labor_cost DECIMAL(14,2),          -- Sub invoice amounts for labor
  total_labor_cost DECIMAL(14,2),

  -- Output
  units_installed DECIMAL(12,2),
  unit_type TEXT,                         -- SF, LF, EA, CY, etc.

  -- Computed
  productivity_rate DECIMAL(10,4),       -- Units per labor-hour
  cost_per_unit DECIMAL(10,4),           -- Labor cost per unit

  -- Comparison
  planned_hours DECIMAL(10,2),           -- From schedule task planned_labor_hours
  hours_variance DECIMAL(10,2),          -- Actual - planned
  historical_avg_rate DECIMAL(10,4),     -- Company average for this trade

  source TEXT,                            -- 'daily_log' | 'timesheet' | 'combined'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Reports that need this:** Labor Productivity Forecast, Resource Utilization, Estimating Accuracy (labor component), Job Cost Detail

---

### Gap 5: Pipeline Forecasting

**Current state:** Leads have stages, probabilities, and expected values (Module 36). But no historical snapshots or stage transition logging.

**New tables:**

```sql
-- Track when leads move between stages
CREATE TABLE lead_stage_transitions (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  lead_id UUID NOT NULL REFERENCES leads(id),
  from_stage_id UUID,
  to_stage_id UUID NOT NULL REFERENCES pipeline_stages(id),
  transitioned_at TIMESTAMPTZ DEFAULT NOW(),
  days_in_previous_stage INTEGER,
  transitioned_by UUID REFERENCES users(id)
);

CREATE INDEX idx_lead_transitions ON lead_stage_transitions(company_id, transitioned_at);

-- Periodic snapshot of pipeline state for trend analysis
CREATE TABLE pipeline_forecast_snapshots (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  snapshot_date DATE NOT NULL,

  total_pipeline_value DECIMAL(14,2),           -- Sum of all active lead expected values
  weighted_pipeline_value DECIMAL(14,2),         -- Sum(value * probability)

  leads_by_stage JSONB,                          -- { stage_name: { count, total_value, weighted_value } }

  conversion_rate_30d DECIMAL(5,2),             -- Leads won / leads in pipeline (30-day rolling)
  conversion_rate_90d DECIMAL(5,2),
  avg_deal_size DECIMAL(14,2),
  avg_days_to_close INTEGER,

  -- Velocity metrics
  avg_days_per_stage JSONB,                      -- { stage_name: avg_days }
  bottleneck_stage TEXT,                          -- Stage with longest average dwell time

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_pipeline_snapshot ON pipeline_forecast_snapshots(company_id, snapshot_date);
```

**Reports that need this:** Pipeline Forecast, Lead Conversion Funnel, Revenue Forecast (pipeline component), Marketing ROI

---

### Gap 6: Bid Accuracy Tracking

**Current state:** Module 26 tracks bids, awards, and comparisons. But no mechanism to compare original bid amount to final invoiced amount after project completion.

**New table + field:**

```sql
CREATE TABLE bid_accuracy_records (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  bid_response_id UUID NOT NULL REFERENCES bid_responses(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  trade TEXT,

  original_bid_amount DECIMAL(14,2),
  final_invoiced_amount DECIMAL(14,2),
  variance_amount DECIMAL(14,2),         -- Final - original
  variance_pct DECIMAL(6,2),             -- Percentage over/under

  -- Breakdown
  owner_change_amount DECIMAL(14,2),     -- COs initiated by owner (not vendor's fault)
  vendor_change_amount DECIMAL(14,2),    -- COs initiated by vendor (scope issues)
  price_escalation_amount DECIMAL(14,2), -- Material price changes

  -- Adjusted accuracy (excludes owner COs)
  adjusted_variance_pct DECIMAL(6,2),
  accuracy_score DECIMAL(5,2),           -- 100 - abs(adjusted_variance_pct), capped at 0

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track reason when a bid is NOT awarded
ALTER TABLE bid_invitations ADD COLUMN not_awarded_reason TEXT;
-- Values: 'price_too_high' | 'incomplete_scope' | 'poor_history' | 'capacity_issue' | 'late_submission' | 'other'
```

**Reports that need this:** Bid Win/Loss Report, Vendor Scorecard (bid accuracy component), Estimating Accuracy

---

## Tier 3 — Differentiators (Phase 5+)

### Gap 7: Equipment Utilization Summaries

**Current state:** Module 35 has equipment, deployments, rentals, maintenance. No aggregation table for reporting.

```sql
CREATE TABLE equipment_utilization_summaries (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  equipment_id UUID NOT NULL REFERENCES equipment(id),
  period_start DATE,
  period_end DATE,

  available_hours DECIMAL(10,2),
  deployed_hours DECIMAL(10,2),
  idle_hours DECIMAL(10,2),
  utilization_pct DECIMAL(5,2),

  total_cost_allocated DECIMAL(14,2),    -- Cost charged to jobs
  idle_cost DECIMAL(14,2),               -- Depreciation + insurance during idle
  maintenance_cost DECIMAL(14,2),
  fuel_cost DECIMAL(14,2),

  cost_per_deployed_hour DECIMAL(10,2),

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Gap 8: Warranty Analytics

**Current state:** Module 31 has warranty_claims with category, status, costs. Module 22 has vendor warranty callbacks. Missing: defect taxonomy, client satisfaction on claims, original cost code linkage, SLA compliance tracking.

```sql
-- Enhance existing warranty_claims table
ALTER TABLE warranty_claims ADD COLUMN defect_type TEXT;
-- Taxonomy: 'nail_pop' | 'settling_crack' | 'flashing_leak' | 'grout_crack' | 'door_alignment' | 'hvac_noise' | 'plumbing_leak' | 'electrical_trip' | 'paint_peeling' | 'window_condensation' | 'other'

ALTER TABLE warranty_claims ADD COLUMN original_cost_code_id UUID REFERENCES cost_codes(id);
-- Links warranty expense back to original construction cost code

ALTER TABLE warranty_claims ADD COLUMN client_satisfaction_score INTEGER CHECK (client_satisfaction_score BETWEEN 1 AND 5);
ALTER TABLE warranty_claims ADD COLUMN first_response_at TIMESTAMPTZ;
ALTER TABLE warranty_claims ADD COLUMN sla_met BOOLEAN;

-- Aggregation table for reporting
CREATE TABLE warranty_analytics (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  job_id UUID,                           -- NULL = company-wide
  period_start DATE,
  period_end DATE,

  total_claims INTEGER,
  avg_resolution_days DECIMAL(6,1),
  total_cost DECIMAL(14,2),
  avg_cost_per_claim DECIMAL(14,2),
  sla_compliance_pct DECIMAL(5,2),
  avg_client_satisfaction DECIMAL(3,1),

  top_defect_types JSONB,                -- [{ type, count, cost }]
  top_trades JSONB,                      -- [{ trade, claim_count, cost }]
  reserve_utilization_pct DECIMAL(5,2),

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Gap 9: Client Satisfaction & Referral Tracking

**Current state:** No mechanism to collect client feedback or track referrals.

```sql
CREATE TABLE client_surveys (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES jobs(id),
  client_id UUID NOT NULL REFERENCES clients(id),

  survey_type TEXT NOT NULL,             -- 'milestone' | 'post_completion' | 'warranty' | 'nps' | 'annual'
  trigger_event TEXT,                    -- 'project_complete' | '30_day_walkthrough' | '11_month_walkthrough' | 'warranty_resolved'

  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  nps_score INTEGER CHECK (nps_score BETWEEN 0 AND 10),  -- Net Promoter Score
  csat_score INTEGER CHECK (csat_score BETWEEN 1 AND 5),  -- Customer Satisfaction

  responses JSONB,                       -- [{ question, answer, score }]
  comments TEXT,
  would_refer BOOLEAN,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE client_referrals (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  referring_client_id UUID NOT NULL REFERENCES clients(id),
  referred_lead_id UUID NOT NULL REFERENCES leads(id),

  referral_date DATE,
  converted BOOLEAN DEFAULT FALSE,
  conversion_date DATE,
  contract_value DECIMAL(14,2),

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Tier 2.5 — Required for Expanded Report Categories (added 2026-02-12)

### Gap 11: Custom Report Definitions Storage

**Current state:** Module 19 defines `report_definitions`, `report_schedules`, and `report_runs`. These cover built-in reports. Custom report builder needs additional fields for user-defined queries.

**Enhanced table:**

```sql
-- Extend existing report_definitions
ALTER TABLE report_definitions ADD COLUMN data_sources JSONB;
-- Array of [{domain, entity, alias}] for custom cross-module queries

ALTER TABLE report_definitions ADD COLUMN columns JSONB;
-- [{field, source, label, aggregate, format, width, sort_order, conditional_format}]

ALTER TABLE report_definitions ADD COLUMN filters JSONB;
-- [{field, operator, value, conjunction}] with AND/OR

ALTER TABLE report_definitions ADD COLUMN grouping JSONB;
-- [{field, level, show_subtotals}]

ALTER TABLE report_definitions ADD COLUMN calculated_fields JSONB;
-- [{name, formula, format}]

ALTER TABLE report_definitions ADD COLUMN chart_config JSONB;
-- {type, x_axis, y_axis, series, colors, legend_position}

ALTER TABLE report_definitions ADD COLUMN cloned_from UUID REFERENCES report_definitions(id);
ALTER TABLE report_definitions ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE report_definitions ADD COLUMN folder_id UUID;
ALTER TABLE report_definitions ADD COLUMN ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE report_definitions ADD COLUMN ai_prompt TEXT;

-- Report snapshots for point-in-time comparison
CREATE TABLE report_snapshots (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  report_definition_id UUID NOT NULL REFERENCES report_definitions(id),
  snapshot_date TIMESTAMPTZ NOT NULL,
  snapshot_data JSONB NOT NULL,       -- Frozen report results
  snapshot_label TEXT,                 -- User-defined label (e.g., "Q4 2025 Close")
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report folders for organization
CREATE TABLE report_folders (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES report_folders(id),
  visibility TEXT NOT NULL DEFAULT 'personal', -- personal | team | company
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Reports that need this:** All custom reports, report snapshots, dashboard composer

---

### Gap 12: GL / Accounting Integration Tables

**Current state:** QuickBooks integration (Module 16) syncs invoices, vendors, payments. No general ledger tables for trial balance, balance sheet, or P&L generation within the system.

**New tables:**

```sql
-- Chart of accounts (mirrors QB but available for reporting)
CREATE TABLE gl_accounts (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  account_number TEXT NOT NULL,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL, -- asset | liability | equity | revenue | expense
  sub_type TEXT,               -- current_asset | fixed_asset | current_liability | etc.
  parent_id UUID REFERENCES gl_accounts(id),
  is_active BOOLEAN DEFAULT TRUE,
  qb_account_id TEXT,          -- QuickBooks mapping
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_gl_account ON gl_accounts(company_id, account_number);

-- Journal entries synced from QB or generated internally
CREATE TABLE gl_journal_entries (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  entry_date DATE NOT NULL,
  memo TEXT,
  source TEXT NOT NULL,        -- 'invoice' | 'payment' | 'draw' | 'payroll' | 'manual' | 'qb_sync'
  source_entity_id UUID,       -- Link to originating record
  is_adjusting BOOLEAN DEFAULT FALSE,
  posted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gl_journal_lines (
  id UUID PRIMARY KEY,
  journal_entry_id UUID NOT NULL REFERENCES gl_journal_entries(id),
  gl_account_id UUID NOT NULL REFERENCES gl_accounts(id),
  debit DECIMAL(14,2) DEFAULT 0,
  credit DECIMAL(14,2) DEFAULT 0,
  job_id UUID REFERENCES jobs(id),        -- Job allocation
  cost_code_id UUID REFERENCES cost_codes(id),
  memo TEXT
);

CREATE INDEX idx_gl_lines_account ON gl_journal_lines(gl_account_id, journal_entry_id);
```

**Reports that need this:** GL Trial Balance, Balance Sheet, Income Statement (P&L), Job Cost to GL Reconciliation

---

### Gap 13: HR / Payroll Tables

**Current state:** Module 08 has time_entries (clock_in, clock_out, hours, cost_code). No payroll data, burden rate calculations, certifications, or WC classification tracking.

**New tables:**

```sql
-- Employee payroll configuration
CREATE TABLE employee_payroll_config (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  user_id UUID NOT NULL REFERENCES users(id),
  base_hourly_rate DECIMAL(10,2),
  overtime_multiplier DECIMAL(4,2) DEFAULT 1.5,
  wc_class_code TEXT,            -- Workers comp classification
  wc_rate DECIMAL(6,4),          -- WC rate per $100 payroll
  tax_burden_pct DECIMAL(5,2),   -- Employer tax burden (FICA, FUTA, SUTA)
  benefits_hourly DECIMAL(10,2), -- Benefits cost per hour
  burden_rate DECIMAL(10,2),     -- COMPUTED: total burdened rate
  burden_multiplier DECIMAL(4,2),-- COMPUTED: burden_rate / base_hourly_rate
  is_prevailing_wage BOOLEAN DEFAULT FALSE,
  prevailing_wage_rate DECIMAL(10,2),
  fringe_benefit_rate DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee certifications & training
CREATE TABLE employee_certifications (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  user_id UUID NOT NULL REFERENCES users(id),
  certification_type TEXT NOT NULL, -- 'osha_10' | 'osha_30' | 'first_aid' | 'cpr' | 'forklift' | 'scaffold' | 'confined_space' | 'trade_license' | 'other'
  certification_name TEXT NOT NULL,
  issued_date DATE,
  expiration_date DATE,
  issuing_body TEXT,
  certificate_number TEXT,
  file_url TEXT,                    -- Uploaded certificate image
  status TEXT DEFAULT 'active',     -- active | expiring | expired
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cert_expiry ON employee_certifications(company_id, expiration_date);

-- Payroll runs (summary, actual payroll processed externally)
CREATE TABLE payroll_summaries (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  total_regular_hours DECIMAL(10,2),
  total_overtime_hours DECIMAL(10,2),
  total_gross_pay DECIMAL(14,2),
  total_employer_taxes DECIMAL(14,2),
  total_employer_benefits DECIMAL(14,2),
  total_burdened_cost DECIMAL(14,2),
  job_allocations JSONB,           -- [{job_id, hours, cost}]
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Reports that need this:** Certified Payroll (WH-347), Labor Burden Rate, Labor Distribution, Overtime Analysis, Workers Comp Audit, Employee Training & Certification

---

### Gap 14: Sales & Use Tax Tracking

**Current state:** Invoices have amounts but no tax breakdown. Jurisdictions table has `tax_rates` but no actual tax tracking on transactions.

**New fields:**

```sql
-- Add to invoices
ALTER TABLE invoices ADD COLUMN tax_amount DECIMAL(14,2);
ALTER TABLE invoices ADD COLUMN tax_jurisdiction TEXT;
ALTER TABLE invoices ADD COLUMN is_tax_exempt BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN exemption_certificate TEXT;

-- Add to purchase_orders
ALTER TABLE purchase_orders ADD COLUMN estimated_tax DECIMAL(14,2);

-- Tax summary table for reporting
CREATE TABLE tax_summaries (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  period_year INTEGER NOT NULL,
  period_month INTEGER NOT NULL,
  jurisdiction TEXT NOT NULL,
  taxable_amount DECIMAL(14,2),
  exempt_amount DECIMAL(14,2),
  tax_collected DECIMAL(14,2),
  tax_owed DECIMAL(14,2),
  tax_paid DECIMAL(14,2),
  filing_status TEXT DEFAULT 'pending', -- pending | filed | paid
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_tax_period ON tax_summaries(company_id, period_year, period_month, jurisdiction);
```

**Reports that need this:** Sales & Use Tax Report, Multi-State Payroll Tax

---

### Gap 15: Schedule Constraints & Lookahead

**Current state:** Schedule tasks have dates, dependencies, and status. No formal constraint tracking, PPC metrics, or weather delay attribution.

**New tables:**

```sql
-- Task constraints (roadblocks preventing start/completion)
CREATE TABLE schedule_constraints (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES jobs(id),
  task_id UUID NOT NULL REFERENCES schedule_tasks(id),
  constraint_type TEXT NOT NULL,    -- 'material' | 'rfi' | 'submittal' | 'permit' | 'inspection' | 'decision' | 'predecessor' | 'weather' | 'other'
  description TEXT NOT NULL,
  linked_entity_type TEXT,          -- 'rfi' | 'submittal' | 'purchase_order' | 'selection' | etc.
  linked_entity_id UUID,
  schedule_impact_days INTEGER,     -- Estimated delay if not resolved
  needed_by_date DATE,              -- When constraint must be resolved
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_constraints_job ON schedule_constraints(job_id, resolved);

-- Weekly work plan / PPC tracking
CREATE TABLE weekly_work_plans (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES jobs(id),
  week_start DATE NOT NULL,
  planned_tasks JSONB,              -- [{task_id, description, assigned_to}]
  completed_tasks JSONB,            -- [{task_id, completed}]
  ppc_score DECIMAL(5,2),           -- Percent Plan Complete (completed / planned * 100)
  non_completion_reasons JSONB,     -- [{task_id, reason: 'material' | 'weather' | 'labor' | 'prerequisite' | 'other'}]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_work_plan ON weekly_work_plans(job_id, week_start);

-- Weather delay attribution
ALTER TABLE daily_logs ADD COLUMN weather_delay_hours DECIMAL(4,1);
ALTER TABLE daily_logs ADD COLUMN is_weather_day BOOLEAN DEFAULT FALSE;
```

**Reports that need this:** 3-Week Lookahead, Weekly Work Plan (PPC), Constraint/Roadblock Log, Weather Delay Tracking, Schedule Delay Analysis, Critical Path Report

---

### Gap 16: Document Completeness & Transmittals

**Current state:** Document management (Module 06) has files, folders, versions. No transmittal tracking or document completeness checklists.

**New tables:**

```sql
-- Transmittals
CREATE TABLE transmittals (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  transmittal_number TEXT NOT NULL,
  subject TEXT NOT NULL,
  sent_to TEXT NOT NULL,            -- Recipient name/company
  sent_to_email TEXT,
  sent_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  response_due_date DATE,
  status TEXT DEFAULT 'sent',       -- sent | acknowledged | overdue | responded
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transmittal_items (
  id UUID PRIMARY KEY,
  transmittal_id UUID NOT NULL REFERENCES transmittals(id),
  document_id UUID REFERENCES documents(id),
  description TEXT,
  revision TEXT,
  copies INTEGER DEFAULT 1
);

-- Document completeness checklists
CREATE TABLE document_checklists (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  phase TEXT NOT NULL,              -- 'preconstruction' | 'active' | 'closeout'
  document_type TEXT NOT NULL,      -- 'contract' | 'permit' | 'insurance' | 'as_built' | 'warranty' | 'om_manual' | 'lien_waiver_final' | etc.
  document_name TEXT NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  document_id UUID REFERENCES documents(id), -- NULL if not yet received
  status TEXT DEFAULT 'missing',    -- missing | received | approved | na
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_doc_checklist ON document_checklists(job_id, phase, status);
```

**Reports that need this:** Transmittal Log, Drawing Revision Log, Document Completeness Matrix, Closeout Document Tracker, As-Built Documentation Status

---

## Implementation Notes

### Phase Alignment

| Gap | Build With | Reason |
|-----|-----------|--------|
| WIP enhancements | Phase 3 (Financial) | Required for bank/surety reporting |
| Revenue recognition | Phase 3 (Financial) | GAAP compliance |
| Backlog tracking | Phase 3 (Financial) | Bank/surety reporting |
| Earned value | Phase 3 (Financial) | Core to cost-to-complete forecasting |
| Custom report definitions | Phase 3 (Reporting) | Custom report builder infrastructure |
| GL / accounting integration | Phase 3 (Financial) | Trial balance, balance sheet, P&L |
| Sales & use tax | Phase 3 (Financial) | Tax compliance reporting |
| Labor productivity | Phase 4 (Operations) | Requires daily logs and time tracking to be live |
| Pipeline forecasting | Phase 4 (Sales) | Requires lead CRM to be live |
| Bid accuracy | Phase 4 (Procurement) | Requires bid management and job completion |
| HR / payroll tables | Phase 4 (Operations) | Certified payroll, burden rates, certifications |
| Schedule constraints & lookahead | Phase 4 (Scheduling) | Lookahead, PPC, constraint tracking |
| Document completeness & transmittals | Phase 4 (Documents) | Transmittal log, closeout tracking |
| Equipment utilization | Phase 5 (Advanced) | Only relevant for builders with equipment fleets |
| Warranty analytics | Phase 5 (Closeout) | Requires warranty claims to accumulate |
| Client satisfaction | Phase 5 (Advanced) | Enhancement, not core |

### Data Flow Principle

All aggregation tables (`*_snapshots`, `*_summaries`, `*_analytics`) should be populated by:
1. **Scheduled jobs** — nightly or weekly batch computation
2. **Event triggers** — recalculate on relevant data changes (invoice approved, draw funded, etc.)
3. **On-demand** — user generates report, snapshots are refreshed if stale

Never compute these on-the-fly for report rendering — pre-compute and cache for performance.

### Custom Report Builder Data Access Principle

The custom report builder must have read access to **every entity in the system** through a metadata-driven query layer:
1. **Data source catalog** — maintained registry of all 115+ entities grouped into 15 domains
2. **Field metadata** — type, label, description, available aggregations, filter operators per field
3. **Join graph** — known relationships between entities (FK, company_id scoping, job_id scoping)
4. **RLS enforcement** — all custom queries filtered by company_id at the database level, role-based field restrictions
5. **Query optimization** — pre-computed aggregation tables preferred over live joins on large datasets

### Existing Spec Files to Update

When these tables are implemented, the following specs need field additions:

| Spec File | Changes Needed |
|-----------|---------------|
| `docs/modules/19-financial-reporting.md` | Add WIP enhancements, revenue recognition, custom report builder, GL tables |
| `docs/modules/09-budget-cost-tracking.md` | Add earned value fields |
| `docs/modules/36-lead-pipeline-crm.md` | Add stage transitions, pipeline snapshots |
| `docs/modules/26-bid-management.md` | Add bid accuracy tracking |
| `docs/modules/35-equipment-assets.md` | Add utilization summaries |
| `docs/modules/31-warranty-home-care.md` | Add warranty analytics fields |
| `docs/modules/08-daily-log.md` | Add weather delay fields |
| `docs/modules/07-scheduling.md` | Add constraints, PPC, lookahead tables |
| `docs/modules/06-document-management.md` | Add transmittals, document checklists |
| `docs/modules/16-quickbooks-integration.md` | Add GL sync, chart of accounts |
| `app/src/types/database.ts` | Add TypeScript types for all new tables |

---

*Document Version: 2.0*
*Updated: 2026-02-12*
*Status: Gap analysis expanded — 16 gaps identified across 3 tiers. Custom report builder infrastructure defined.*
