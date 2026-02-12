# Module 19: Financial Reporting & Dashboards

**Phase:** 3 - Financial Power
**Status:** TODO
**Last Updated:** 2026-02-11

---

## Overview

Comprehensive financial reporting engine covering job-level profitability, portfolio-level dashboards, cash flow projections, budget variance analysis, WIP (Work in Progress) reporting, AR/AP aging, and 1099 preparation. Includes a configurable report builder for non-technical users, scheduled report delivery, and client-facing vs. internal report separation. Reports pull data from budgets, invoices, change orders, purchase orders, and the accounting integration to provide a unified financial picture. All reports are brandable per builder and exportable in multiple formats.

---

## Gap Items Addressed

### Section 24: Financial Management & Accounting

| Gap # | Description | Coverage |
|-------|-------------|----------|
| 431 | Chart of accounts mapping configurable per builder | Report grouping by GL account or cost code |
| 433 | Fiscal year configuration per builder | Fiscal year-aware date ranges in all reports |
| 434 | WIP schedule calculation methods (% completion, cost-to-cost, completed contract) | Configurable WIP calculation engine |
| 435 | Multiple bank accounts (operating, trust, payroll) | Cash flow reporting per account |
| 436 | Owner equity/draws tracking for small builders | Owner draw report for sole proprietors/S-corps |
| 437 | Financial reporting currency | USD default, architecture for future multi-currency |
| 438 | Configurable financial dashboard KPIs | Builder-selectable KPI widget system |
| 439 | Financial data "accountant-locked" - month-end close | Period lock preventing report data changes |
| 440 | Financial projections across all projects | Revenue/expense/cash flow forecast engine |
| 441 | Draw request format configurable (AIA G702/G703) | AIA-compliant and custom draw report formats |
| 442 | Draw request supporting documentation requirements | Configurable doc checklist per draw |
| 443 | Draw requests for different contract types | Fixed-price and cost-plus draw calculation |
| 444 | Stored materials billing | Stored materials line item on draw reports |
| 445 | Draw request routing (generate -> review -> approve -> send) | Draw report workflow integration |
| 446 | Automated draw request generation from schedule progress | Schedule-driven draw calculation |
| 447 | Multiple lenders with different draw requirements | Per-lender draw format configuration |
| 448 | Draw request reconciliation (approved vs disbursed) | Disbursement tracking and gap reporting |

### Section 25: Reporting & Dashboards

| Gap # | Description | Coverage |
|-------|-------------|----------|
| 449 | Report templates customizable per builder | Template editor with field/section controls |
| 450 | Report builder for non-technical users (drag-and-drop) | Visual report builder UI |
| 451 | Report branding (logo, colors, layout) | White-label report rendering |
| 452 | Report scheduling and auto-distribution | Cron-based report generation and email delivery |
| 453 | Report access control (owner-only, team-wide) | Role-based report visibility |
| 454 | Report export formats (PDF, Excel, CSV, Word) | Multi-format export engine |
| 455 | Comparative reports across projects (benchmarking) | Cross-project comparison datasets |
| 456 | AI-generated narrative reports | LLM-powered report summaries |
| 457 | Client-facing reports different from internal | Dual-audience report templates |
| 458 | Report data from multiple modules | Cross-module data aggregation |

---

## Detailed Requirements

### 1. Job Profitability Analysis

**Per-project profitability report:**
- Contract value (original + approved COs = current contract).
- Revenue recognized (draws/invoices billed and paid).
- Total costs: direct costs (actual expenses posted), committed costs (open POs), and projected remaining costs.
- Gross profit = Revenue - Total Costs. Gross margin percentage.
- Overhead allocation (configurable method: % of direct cost, fixed amount, or pro-rata by revenue).
- Net profit after overhead.
- Profitability trend chart over time (monthly data points).
- Variance from original estimate: estimated profit vs. current projected profit.

**Portfolio profitability:**
- Summary table of all active projects with profitability metrics.
- Sort and filter by margin %, dollar amount, project status, PM.
- Drill-down from portfolio to individual project detail.
- Heat map visualization: green (above target margin), yellow (at risk), red (below target).

### 2. Cash Flow Projections (Gap #440)

**Cash flow forecast engine:**
- **Inflows:** Scheduled draw dates with expected amounts, pending client payments, retainage release dates.
- **Outflows:** Open PO payment dates (based on vendor payment terms), upcoming subcontractor payments, overhead expenses (configurable recurring), loan payments.
- **Time horizon:** Configurable - 30, 60, 90, 180 days, or custom range.
- **Granularity:** Weekly or monthly buckets.
- **Multiple bank accounts (Gap #435):** Cash flow broken down by operating account, trust account, etc.
- **Scenario modeling:** "What if" - delay a draw by 2 weeks, add a new project, lose a project. Show impact on cash position.

**Cash flow visualization:**
- Stacked bar chart showing inflows vs. outflows by period.
- Running cash balance line.
- Warning indicators when projected balance drops below a configurable threshold.

### 3. Budget Variance Reports

**Per-project budget variance:**
- By cost code: budgeted amount, committed (POs), actual spent, remaining budget, variance ($ and %).
- Flags cost codes that are over budget or trending over budget.
- Change order impact: original budget, CO adjustments, revised budget.
- Earned value metrics: planned value, earned value, cost performance index (CPI), schedule performance index (SPI).

**Portfolio budget variance:**
- Aggregated variance across all projects.
- Identify systemic estimation errors (e.g., "Electrical is consistently 15% over budget across all projects").
- Trend analysis: are budgets getting more or less accurate over time?

### 4. WIP (Work in Progress) Reporting (Gap #434)

**Calculation methods (configurable per builder):**
- **Percentage of completion (cost-to-cost):** % complete = costs to date / (costs to date + estimated cost to complete). Revenue recognized = % complete x contract value.
- **Percentage of completion (schedule-based):** % complete derived from schedule progress.
- **Completed contract:** Revenue recognized only when project is substantially complete.

**WIP schedule output:**
- Project, contract value, costs to date, estimated cost to complete, estimated total cost, % complete, revenue earned, billings to date, over/under billed.
- Over-billed = liability (you owe the client work). Under-billed = asset (client owes you money).
- Summary totals across all active projects.
- Standard CPA-friendly format for the builder's accountant.
- Exportable to Excel with formulas intact for accountant adjustments.

**Period locking (Gap #439):**
- Builder or accountant locks a financial period (e.g., January 2026).
- No cost postings, invoice changes, or budget adjustments allowed for locked periods.
- WIP report can be generated for any historical locked period.
- Unlock requires owner-level permission with audit trail.

### 5. AR/AP Aging

**Accounts Receivable Aging:**
- Client invoices/draws grouped by age: Current, 1-30 days, 31-60, 61-90, 90+ days.
- Per client and per project breakdown.
- Retainage receivable as a separate line.
- Collection notes and last contact date.
- Aging trend: is the builder's collection period improving or worsening?

**Accounts Payable Aging:**
- Vendor invoices grouped by age: Current, 1-30, 31-60, 61-90, 90+ days.
- Per vendor and per project breakdown.
- Retainage payable as a separate line.
- Early payment discount opportunities flagged (e.g., "Pay vendor X by Friday to save 2%").
- Cash required for upcoming AP obligations by week.

### 6. 1099 Preparation (Gap #436)

**Year-end 1099 report:**
- All vendors paid more than the IRS threshold ($600 for NEC) during the tax year.
- Vendor name, TIN/EIN (masked in UI, full on export), total payments by type.
- Flags vendors missing W-9 or TIN information.
- Grouped by 1099 type: NEC (non-employee compensation), MISC (rents, other).
- Export in IRS-compatible format (CSV for upload to filing service, or PDF for manual filing).
- Builder's fiscal year setting (Gap #433) determines the reporting period.

**Owner equity/draws (Gap #436):**
- For sole proprietors and S-corps: report of owner draws/distributions during the period.
- Separates business expenses from owner draws.
- Summary for tax preparation.

### 7. Draw Request Reports (Gap #441-448)

**AIA G702/G703 format (Gap #441):**
- Standard AIA Application and Certificate for Payment (G702) and Continuation Sheet (G703).
- Auto-populated from project budget, schedule progress, and cost data.
- Columns: item, scheduled value, work completed (previous, this period), materials stored, total, % complete, balance, retainage.
- Retainage calculation: configurable percentage, with option for reduced retainage at substantial completion.

**Custom draw formats:**
- Some builders/lenders use non-AIA formats. Builder can customize the draw template.
- Per-lender configuration (Gap #447): different lenders on the same project may require different formats.

**Supporting documentation (Gap #442):**
- Configurable checklist per builder or per lender: lien waivers, inspection reports, photos, updated schedule, insurance certificates.
- System tracks which documents are attached and flags missing items.
- Documents are compiled into a single PDF package for the draw submission.

**Draw calculation by contract type (Gap #443):**
- **Fixed-price:** % complete x contract value = amount due. Prior draws subtracted.
- **Cost-plus:** Actual costs incurred + fee (% or fixed). Documented with cost backup.
- **Stored materials (Gap #444):** Separate line for materials on site but not installed. Some lenders cap stored materials at a percentage.

**Automated draw generation (Gap #446):**
- System calculates recommended draw based on schedule progress and cost data.
- PM reviews, adjusts, and submits.
- Recommended vs. actual draw amount tracked for variance analysis.

**Draw reconciliation (Gap #448):**
- Draw submitted for $150K, lender disburses $142K.
- Track: submitted amount, approved amount, disbursed amount, and the gap.
- Gap reasons: lender holdback, retainage, disputed items.
- Reconciliation report shows all draws with submission-to-disbursement tracking.

### 8. Configurable Report Builder (Gap #450)

**Visual report builder:**
- Drag-and-drop interface for non-technical users.
- Data source selection: budgets, invoices, POs, change orders, schedule, vendors, projects.
- Field picker: choose columns from selected data sources.
- Filters: date range, project, vendor, status, cost code, and custom criteria.
- Grouping and subtotaling: group by project, cost code, vendor, month, etc.
- Calculated fields: formulas using available data fields (sum, average, %, custom).
- Chart builder: bar, line, pie, stacked bar from the selected data.
- Save as template for reuse.

**Report access control (Gap #453):**
- Reports can be marked: owner-only, management, full team, or specific roles.
- Shared reports are visible in the team's report library.
- Personal reports are visible only to the creator.

### 9. Report Branding (Gap #451)
- Builder's logo in the report header.
- Configurable colors for headers, borders, and accent elements.
- Company name, address, and contact info in header/footer.
- Custom footer text (e.g., license number, disclaimer).
- Applied to all generated PDF reports.

### 10. Scheduled Report Delivery (Gap #452)
- Any report can be scheduled for automatic generation and email delivery.
- Schedule options: daily, weekly (pick day), bi-weekly, monthly (pick date), quarterly.
- Delivery time: configurable (e.g., Monday at 7:00 AM).
- Recipients: list of email addresses (internal users and external like accountants).
- Format: PDF, Excel, or both attached to the email.
- Report runs with current data at the scheduled time.
- Delivery log: track which reports were sent, to whom, and when.

### 11. Export Formats (Gap #454)
- **PDF:** Formatted report with branding, charts, and tables. Print-ready.
- **Excel:** Data tables with formulas intact where applicable. Multiple sheets for complex reports.
- **CSV:** Raw data export for further analysis.
- **Word:** Editable document format for reports that need narrative additions.
- Bulk export: generate all monthly reports as a ZIP file.

### 12. Comparative / Benchmarking Reports (Gap #455)
- Compare current project to: builder's historical average, similar projects (by size/type), and platform benchmarks (anonymous).
- Metrics compared: cost per square foot, margin %, CO rate, schedule variance.
- Visualization: radar chart showing project metrics vs. benchmarks.
- Builder opts in/out of platform-wide anonymous benchmarking.

### 13. AI-Generated Narrative Reports (Gap #456)
- LLM generates a natural-language summary of the financial data.
- Example: "Three of five active projects are on budget. The Maple Street project is 8% over budget on framing due to two change orders totaling $12,400. Cash flow is projected to be tight in March due to a gap between draw disbursements and subcontractor payment dates."
- Builder can edit the narrative before including it in a client-facing report.
- Narrative is regenerated each time the report runs.

### 14. Client-Facing vs. Internal Reports (Gap #457)
- Same underlying data, different presentation.
- Internal: full cost detail, margins, vendor names, internal notes.
- Client-facing: summary-level, progress-oriented, professional formatting.
- Builder configures which data elements appear on client reports.
- Client reports are accessible through the client portal.

### 15. Cross-Module Data Aggregation (Gap #458)
- Reports can pull data from: budgets, invoices, POs, change orders, schedule, daily logs, photos, RFIs, and vendor records.
- "Comprehensive project report" combines: budget status, schedule status, recent photos, open RFIs, pending COs, and financial summary.
- Data joins are handled at the API level; the report builder exposes cross-module fields.

---

## Database Tables

```sql
-- Report definitions (saved reports and templates)
CREATE TABLE v2_report_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL
    CHECK (report_type IN ('job_profitability', 'cash_flow', 'budget_variance',
                           'wip', 'ar_aging', 'ap_aging', '1099', 'draw_request',
                           'owner_draw', 'benchmarking', 'custom')),
  is_template BOOLEAN DEFAULT FALSE,     -- system-provided template
  is_shared BOOLEAN DEFAULT FALSE,       -- shared with team
  access_roles TEXT[],                   -- roles that can view this report
  audience TEXT DEFAULT 'internal'
    CHECK (audience IN ('internal', 'client', 'both')),

  -- Report configuration
  data_sources TEXT[] NOT NULL,          -- ['budgets', 'invoices', 'pos', 'change_orders']
  columns JSONB NOT NULL DEFAULT '[]',   -- field definitions and order
  filters JSONB DEFAULT '{}',            -- default filters
  grouping JSONB DEFAULT '{}',           -- group by / subtotal config
  calculated_fields JSONB DEFAULT '[]',  -- custom formulas
  chart_config JSONB,                    -- chart type and settings
  sort_config JSONB DEFAULT '{}',

  -- Branding
  include_logo BOOLEAN DEFAULT TRUE,
  custom_header TEXT,
  custom_footer TEXT,

  created_by UUID REFERENCES v2_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled report deliveries
CREATE TABLE v2_report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  report_definition_id UUID NOT NULL REFERENCES v2_report_definitions(id),
  schedule_type TEXT NOT NULL
    CHECK (schedule_type IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly')),
  schedule_day INTEGER,                  -- day of week (0-6) or day of month (1-31)
  schedule_time TIME DEFAULT '07:00',
  delivery_format TEXT[] DEFAULT ARRAY['pdf'],  -- ['pdf', 'excel', 'csv']
  recipients JSONB NOT NULL DEFAULT '[]', -- [{ "email": "...", "name": "..." }]
  is_active BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report execution log
CREATE TABLE v2_report_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  report_definition_id UUID NOT NULL REFERENCES v2_report_definitions(id),
  schedule_id UUID REFERENCES v2_report_schedules(id),
  run_type TEXT NOT NULL CHECK (run_type IN ('manual', 'scheduled')),
  status TEXT NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'completed', 'failed')),
  parameters JSONB DEFAULT '{}',         -- runtime parameters (date range, project filter)
  file_urls JSONB DEFAULT '{}',          -- { "pdf": "...", "excel": "..." }
  recipients_sent TEXT[],
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER
);

-- WIP snapshots (locked period data)
CREATE TABLE v2_wip_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  period_label TEXT NOT NULL,            -- '2026-01', '2026-Q1'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  is_locked BOOLEAN DEFAULT FALSE,
  locked_by UUID REFERENCES v2_users(id),
  locked_at TIMESTAMPTZ,
  calculation_method TEXT NOT NULL
    CHECK (calculation_method IN ('cost_to_cost', 'schedule_based', 'completed_contract')),
  snapshot_data JSONB NOT NULL,          -- full WIP schedule data at lock time
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(builder_id, period_label)
);

-- Financial period locks
CREATE TABLE v2_financial_period_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  period_year INTEGER NOT NULL,
  period_month INTEGER NOT NULL,
  is_locked BOOLEAN DEFAULT FALSE,
  locked_by UUID REFERENCES v2_users(id),
  locked_at TIMESTAMPTZ,
  unlocked_by UUID,
  unlocked_at TIMESTAMPTZ,
  unlock_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(builder_id, period_year, period_month)
);

-- Draw requests
CREATE TABLE v2_draw_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  project_id UUID NOT NULL REFERENCES v2_projects(id),
  draw_number INTEGER NOT NULL,
  format TEXT DEFAULT 'aia_g702' CHECK (format IN ('aia_g702', 'custom')),
  lender_id UUID,                        -- optional, for multi-lender projects
  contract_type TEXT DEFAULT 'fixed_price'
    CHECK (contract_type IN ('fixed_price', 'cost_plus')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'approved', 'submitted', 'disbursed',
                      'partial_disbursement', 'rejected', 'revised')),

  -- Amounts
  scheduled_value DECIMAL(14,2),         -- total contract value for this draw schedule
  previous_completed DECIMAL(14,2) DEFAULT 0,
  current_completed DECIMAL(14,2) DEFAULT 0,
  stored_materials DECIMAL(14,2) DEFAULT 0,
  total_completed DECIMAL(14,2) DEFAULT 0,
  retainage_pct DECIMAL(5,2) DEFAULT 10,
  retainage_amount DECIMAL(14,2) DEFAULT 0,
  amount_requested DECIMAL(14,2) DEFAULT 0,
  amount_approved DECIMAL(14,2),
  amount_disbursed DECIMAL(14,2),
  disbursement_gap DECIMAL(14,2),

  -- Supporting docs
  required_documents JSONB DEFAULT '[]',  -- checklist items
  attached_documents JSONB DEFAULT '[]',

  -- Workflow
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  disbursed_at TIMESTAMPTZ,
  notes TEXT,
  lender_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(builder_id, project_id, draw_number, lender_id)
);

-- Draw request line items (G703 continuation sheet)
CREATE TABLE v2_draw_request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_request_id UUID NOT NULL REFERENCES v2_draw_requests(id) ON DELETE CASCADE,
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  item_number TEXT NOT NULL,
  description TEXT NOT NULL,
  scheduled_value DECIMAL(12,2) DEFAULT 0,
  previous_work DECIMAL(12,2) DEFAULT 0,
  current_work DECIMAL(12,2) DEFAULT 0,
  stored_materials DECIMAL(12,2) DEFAULT 0,
  total_completed DECIMAL(12,2) DEFAULT 0,
  pct_complete DECIMAL(5,2) DEFAULT 0,
  balance_to_finish DECIMAL(12,2) DEFAULT 0,
  retainage DECIMAL(12,2) DEFAULT 0,
  cost_code_id UUID,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Builder financial settings
CREATE TABLE v2_financial_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL UNIQUE REFERENCES v2_builders(id),
  fiscal_year_start_month INTEGER DEFAULT 1,  -- 1=Jan, 4=Apr, 7=Jul, 10=Oct
  wip_calculation_method TEXT DEFAULT 'cost_to_cost',
  default_retainage_pct DECIMAL(5,2) DEFAULT 10,
  reduced_retainage_pct DECIMAL(5,2) DEFAULT 5,
  reduced_retainage_threshold DECIMAL(5,2) DEFAULT 50,  -- % complete to reduce retainage
  draw_format TEXT DEFAULT 'aia_g702',
  stored_materials_cap_pct DECIMAL(5,2),  -- lender cap on stored materials
  overhead_allocation_method TEXT DEFAULT 'pct_direct_cost',
  overhead_rate DECIMAL(5,2) DEFAULT 10,
  target_margin_pct DECIMAL(5,2) DEFAULT 20,
  cash_reserve_minimum DECIMAL(12,2) DEFAULT 50000,
  irs_1099_threshold DECIMAL(10,2) DEFAULT 600,
  bank_accounts JSONB DEFAULT '[]',      -- [{ "name": "Operating", "type": "operating" }]
  dashboard_kpis JSONB DEFAULT '[]',     -- selected KPI widgets
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints

### Standard Reports

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/reports/job-profitability` | Job profitability report (single project or portfolio) |
| GET | `/api/v1/reports/cash-flow` | Cash flow projection |
| GET | `/api/v1/reports/budget-variance` | Budget variance by project and cost code |
| GET | `/api/v1/reports/wip` | WIP schedule |
| GET | `/api/v1/reports/ar-aging` | AR aging report |
| GET | `/api/v1/reports/ap-aging` | AP aging report |
| GET | `/api/v1/reports/1099` | 1099 preparation report |
| GET | `/api/v1/reports/owner-draws` | Owner equity/draws report |
| GET | `/api/v1/reports/benchmarking` | Cross-project benchmarking |
| GET | `/api/v1/reports/comprehensive/:projectId` | Full project report (cross-module) |

### Draw Requests

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/projects/:projectId/draws` | List draw requests for project |
| POST | `/api/v1/projects/:projectId/draws` | Create new draw request |
| GET | `/api/v1/draws/:id` | Get draw detail with line items |
| PUT | `/api/v1/draws/:id` | Update draw request |
| POST | `/api/v1/draws/:id/submit` | Submit draw for approval |
| POST | `/api/v1/draws/:id/approve` | Approve draw request |
| POST | `/api/v1/draws/:id/reject` | Reject with reason |
| POST | `/api/v1/draws/:id/record-disbursement` | Record lender disbursement |
| GET | `/api/v1/draws/:id/pdf` | Generate draw PDF (AIA or custom) |
| POST | `/api/v1/draws/:id/auto-calculate` | Auto-calculate from schedule progress |
| GET | `/api/v1/draws/reconciliation` | Draw reconciliation report |

### Report Builder & Management

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/reports/definitions` | List saved report definitions |
| POST | `/api/v1/reports/definitions` | Create custom report definition |
| PUT | `/api/v1/reports/definitions/:id` | Update report definition |
| DELETE | `/api/v1/reports/definitions/:id` | Delete report definition |
| POST | `/api/v1/reports/definitions/:id/run` | Execute a report with parameters |
| GET | `/api/v1/reports/definitions/:id/preview` | Preview report with sample data |
| POST | `/api/v1/reports/definitions/:id/export` | Export report (body: format, date range) |
| GET | `/api/v1/reports/templates` | List system report templates |

### Scheduling & Delivery

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/reports/schedules` | List scheduled reports |
| POST | `/api/v1/reports/schedules` | Create a report schedule |
| PUT | `/api/v1/reports/schedules/:id` | Update schedule |
| DELETE | `/api/v1/reports/schedules/:id` | Delete schedule |
| GET | `/api/v1/reports/runs` | Report execution history |

### Financial Settings & Period Management

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/financial/settings` | Get builder financial settings |
| PUT | `/api/v1/financial/settings` | Update financial settings |
| GET | `/api/v1/financial/periods` | List financial periods with lock status |
| POST | `/api/v1/financial/periods/:year/:month/lock` | Lock a financial period |
| POST | `/api/v1/financial/periods/:year/:month/unlock` | Unlock (owner only, with reason) |
| GET | `/api/v1/financial/wip-snapshots` | List WIP snapshots |
| POST | `/api/v1/financial/wip-snapshots` | Create and lock a WIP snapshot |
| GET | `/api/v1/financial/dashboard` | Financial dashboard KPI data |

---

## UI Components

### Dashboard & Overview
1. **FinancialDashboard** - Configurable KPI cards (Gap #438): total revenue, total costs, margin, cash position, AR/AP totals, projects over budget. Builder picks which KPIs to display.
2. **CashFlowChart** - Stacked bar chart with inflows/outflows and running balance line. Filterable by time horizon and bank account.
3. **ProfitabilityHeatMap** - Grid of projects colored by margin health. Click to drill into project detail.

### Reports
4. **JobProfitabilityReport** - Multi-section report: contract summary, cost breakdown, margin analysis, trend chart.
5. **BudgetVarianceReport** - Cost code level table with conditional formatting for over-budget items.
6. **WIPScheduleReport** - CPA-formatted WIP schedule with over/under billing indicators. Export button.
7. **ARAgingReport** - Grouped aging buckets with client drill-down and collection notes.
8. **APAgingReport** - Vendor aging with early payment discount flags.
9. **Report1099** - Year-end vendor payment summary with W-9 status flags and IRS export.

### Draw Requests
10. **DrawRequestForm** - AIA G702/G703 layout with auto-calculation and manual override per line.
11. **DrawDocumentChecklist** - Required supporting documents with upload slots and completion indicators.
12. **DrawReconciliationTable** - All draws with submitted, approved, disbursed columns and gap highlighting.

### Report Builder
13. **ReportBuilderCanvas** - Drag-and-drop interface: data sources on left, report preview on right, field/filter/grouping panels.
14. **ChartConfigPanel** - Select chart type, X/Y axes, series, colors from the report data.
15. **ReportScheduleDialog** - Configure frequency, time, recipients, and format for scheduled delivery.

### Settings
16. **FinancialSettingsPanel** - Fiscal year, WIP method, retainage, overhead, and target margin configuration.
17. **PeriodLockManager** - Calendar grid of months with lock/unlock toggles and audit trail.
18. **DashboardKPISelector** - Checkbox list of available KPI widgets with drag-and-drop ordering.

---

## Dependencies

- **Module 9:** Budget & Cost Tracking (budget data, cost actuals, cost codes)
- **Module 11:** Basic Invoicing (AR data, invoice amounts, payment status)
- **Module 17:** Change Orders (CO impact on contract value and budget)
- **Module 18:** Purchase Orders (committed costs, AP data)
- **Module 7:** Scheduling (schedule progress for WIP and draw calculation)
- **Module 16:** QuickBooks Integration (synced payment data, GL reconciliation)
- **Module 10:** Contact/Vendor Management (vendor 1099 data, W-9 status)
- **Module 5:** Notification Engine (scheduled report delivery)
- **Module 32:** AI Engine (narrative report generation, Gap #456)

---

## Open Questions

1. Should the report builder support SQL-level custom queries for power users, or is the visual builder sufficient for V1?
2. What is the performance target for report generation? (Target: under 5 seconds for standard reports, under 30 seconds for cross-module portfolio reports)
3. Should WIP snapshots be automatically created monthly on period lock, or manually triggered?
4. How do we handle the AIA G702/G703 digital signature requirement? (Some lenders still require wet signatures)
5. Should AI narrative reports be available for all report types, or limited to a "monthly summary" report?
6. What is the data retention policy for report run history and generated files? (Suggest: 2 years of generated files, unlimited run log)
7. Should the platform pre-populate with industry-standard report templates on tenant creation, or start empty?
8. How do we handle financial data for projects that span multiple fiscal years?
