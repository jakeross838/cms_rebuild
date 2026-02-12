# Module 9: Budget & Cost Tracking

**Phase:** 2 - Construction Core
**Status:** TODO
**Last Updated:** 2026-02-11

---

## Overview

Project budget creation and real-time cost tracking against budget lines. Tracks committed costs (signed subcontracts and POs), actual costs (paid invoices), and projected final costs with variance analysis. Supports multiple cost code systems, configurable budget hierarchies, change order impact tracking, budget contingency management, WIP reporting, and multi-audience budget views. Serves as the financial backbone connecting estimates, invoices, change orders, draw requests, and accounting.

---

## Gap Items Addressed

| GAP # | Description | Priority |
|-------|-------------|----------|
| GAP-257 | Support CSI MasterFormat, custom codes, and hybrid cost code systems | High |
| GAP-258 | Configurable estimate/budget hierarchy (Division->Code->Item vs Phase->Trade->Item) | High |
| GAP-259 | Estimate templates by project type per builder | High |
| GAP-260 | Assembly-based estimating vs. line-by-line estimating | Medium |
| GAP-261 | Unit pricing support ($/SF for everything) | Medium |
| GAP-262 | Configurable markup structures (flat %, tiered, per-line, built-in) | High |
| GAP-263 | Estimate formats configurable per client expectation (10 lines vs. 200 lines) | Medium |
| GAP-264 | Estimate approval workflows configurable per builder | Medium |
| GAP-265 | Estimate versioning with comparison between versions | High |
| GAP-266 | Multi-level-of-detail presentation (client summary vs. builder detail) | Medium |
| GAP-267 | Contract type handling: NTE, GMP, cost-plus with estimate | High |
| GAP-268 | Placeholder/allowance amounts for unpriced scope | High |
| GAP-269 | Scope exclusions tracking | Medium |
| GAP-270 | Alternate/option pricing within estimates | Medium |
| GAP-271 | Estimate expiration (valid for 90 days, then what?) | Low |
| GAP-272 | Budget when contract type changes mid-project (cost-plus -> GMP) | Medium |
| GAP-273 | Committed costs vs. budgeted costs vs. actual costs tracking | High |
| GAP-274 | Cost-to-complete projections based on spend rate | High |
| GAP-275 | Earned value management (value proportional to spending) | Medium |
| GAP-276 | Configurable budget alerts (80% threshold vs. 95% threshold) | High |
| GAP-277 | Budget templates for different project types | Medium |
| GAP-278 | Minimal budget mode (track actuals only, no full budgeting) | Low |
| GAP-279 | Contingency management (drawdown tracking, documentation required) | High |
| GAP-280 | Multi-audience budget formats (owner 10 categories, PM 200 lines, bank AIA) | High |
| GAP-431 | Chart of accounts mapping configurable per builder | High |
| GAP-432 | Multiple accounting system support (QB Desktop, QB Online, Sage, Xero) | Medium |
| GAP-433 | Fiscal year configuration per builder | Low |
| GAP-434 | WIP schedule calculation methods (% completion, cost-to-cost, completed contract) | High |
| GAP-435 | Multiple bank account support | Low |
| GAP-438 | Configurable financial dashboard KPIs | Medium |
| GAP-439 | Month-end close / period locking | High |
| GAP-440 | Financial projections (revenue, expense, cash flow across all projects) | Medium |
| GAP-441 | Draw request format (AIA G702/G703 and custom) | High |
| GAP-442 | Draw request supporting documentation requirements | Medium |
| GAP-443 | Draw requests for different contract types | High |
| GAP-444 | Stored materials billing | Medium |
| GAP-445 | Draw request routing/approval workflow | High |
| GAP-446 | Automated draw request generation from schedule progress | Medium |
| GAP-447 | Multiple lenders with different draw requirements | Low |
| GAP-448 | Draw request reconciliation (approved vs. disbursed) | Medium |

---

## Detailed Requirements

### 9.1 Cost Code System (GAP-257, GAP-258)

**Flexible cost code hierarchy:**
- Support CSI MasterFormat (16-division or 50-division) as a platform default.
- Builders can define custom cost code structures with 2-5 levels.
- Hybrid support: use CSI for some divisions, custom codes for others.
- Hierarchy options (GAP-258):
  - Division -> Cost Code -> Line Item (traditional)
  - Phase -> Trade -> Item (field-oriented)
  - Category -> Subcategory -> Line Item (simplified)
- Cost codes carry: code number, name, description, default unit of measure, typical unit cost.
- Import/export cost code libraries (CSV).
- Platform provides starter libraries that builders customize.

### 9.2 Budget Creation (GAP-259, GAP-260, GAP-261, GAP-262, GAP-277)

**From Estimate or Template:**
- Create budget by importing from an approved estimate (Module 11 connection).
- Create budget from template (GAP-277): pre-built budget distributions by project type (e.g., 2,500 SF ranch, 4,000 SF two-story).
- Create budget manually line by line.
- Create budget from a previous project (clone and adjust).

**Estimating Methods** (GAP-260, GAP-261):
- Line-by-line: quantity x unit cost x markup for each item.
- Assembly-based: pre-defined assemblies (e.g., "Standard Interior Wall" = framing + drywall + paint + trim) that expand into component lines.
- Unit pricing: $/SF, $/LF, $/EA applied at category or project level.
- Mixed: some categories use assemblies, others use line items.

**Markup Configuration** (GAP-262):
- Flat percentage on all costs.
- Tiered markup: different % for different categories (materials vs. labor vs. subcontract).
- Per-line markup: individual markup per budget line.
- Built-in markup: unit prices already include markup (no separate line).
- Overhead vs. profit split: separate tracking for overhead % and profit %.
- Markup can be hidden or visible on client-facing views.

### 9.3 Budget Line Items & Three-Column Tracking (GAP-273)

Every budget line tracks three cost columns:

| Column | Source | Description |
|--------|--------|-------------|
| **Budgeted** | Estimate/template | Original planned cost |
| **Committed** | Signed subcontracts + approved POs | Contracted cost (may differ from budgeted) |
| **Actual** | Paid invoices + cost entries | Money spent to date |

Additional computed columns:
- **Projected Final**: committed + remaining budget (or trending calculation).
- **Variance**: budgeted - projected final.
- **% Complete**: actual / committed (or actual / budgeted if no commitment).
- **Cost to Complete**: projected final - actual.

### 9.4 Contract Type Support (GAP-267, GAP-272)

Budget behavior adapts to contract type:
- **Fixed Price**: budget is the contract amount. Variance = profit/loss.
- **Cost Plus**: budget is the estimate. Track actual costs + fee. Client sees actuals.
- **GMP (Guaranteed Maximum Price)**: budget is the GMP. Track against cap. Savings split configurable.
- **NTE (Not to Exceed)**: similar to GMP but may not require full accounting.
- **Contract type change mid-project** (GAP-272): system recalculates all projections when contract type changes. Audit trail of the change.

### 9.5 Allowances & Alternates (GAP-268, GAP-269, GAP-270)

- **Allowance line items** (GAP-268): budget lines flagged as allowances with a placeholder amount. When actual selection/bid received, allowance is replaced and variance tracked.
- **Scope exclusions** (GAP-269): explicit tracking of what is NOT included in the budget. Displayed on client-facing views and proposals.
- **Alternate pricing** (GAP-270): budget can include optional line items with "if selected" pricing. Client chooses options, budget adjusts automatically.

### 9.6 Estimate Versioning & Presentation (GAP-265, GAP-266, GAP-263, GAP-264, GAP-271)

- **Versioning** (GAP-265): V1, V2, V3 of estimates with side-by-side comparison showing deltas.
- **Multi-level presentation** (GAP-266, GAP-263):
  - Client view: 10-15 summary categories with totals.
  - PM view: full 200+ line detail.
  - Bank/lender view: AIA G703 format.
  - Configurable per builder which format each audience sees.
- **Approval workflow** (GAP-264): configurable steps (PM -> Director -> Owner sign-off before sending to client).
- **Expiration** (GAP-271): estimates marked with validity period. System alerts when approaching expiration. Expired estimates require re-approval to send.

### 9.7 Variance Analysis & Alerts (GAP-274, GAP-275, GAP-276)

- **Cost-to-complete projection** (GAP-274): based on current spend rate and % complete, project final cost for each line and overall.
- **Earned value metrics** (GAP-275):
  - Planned Value (PV): budgeted cost of scheduled work.
  - Earned Value (EV): budgeted cost of completed work.
  - Actual Cost (AC): actual cost of completed work.
  - CPI (Cost Performance Index): EV/AC.
  - SPI (Schedule Performance Index): EV/PV.
- **Budget alerts** (GAP-276): configurable thresholds per builder:
  - Warning at X% of budget line consumed (default 80%).
  - Critical at Y% of budget line consumed (default 95%).
  - Over-budget notification.
  - Alerts sent via notification engine (email, push, in-app).
- Dashboard widgets showing top variances, budget health by project, trending costs.

### 9.8 Contingency Management (GAP-279)

- Dedicated contingency line(s) in budget.
- Drawdown tracking: each use of contingency requires documentation (reason, approval, amount).
- Contingency balance displayed prominently on budget summary.
- Configurable approval required to use contingency (e.g., director approval for >$5K).
- Historical analysis: average contingency usage by project type for future estimating.

### 9.9 Change Order Impact on Budget

- Approved change orders (Module 17) automatically update budget:
  - Add new budget lines for new scope.
  - Adjust existing budget lines for scope changes.
  - Update contract value.
  - Track CO impact separately (original budget vs. COs).
- Budget summary shows: Original Budget + Approved COs = Current Budget.

### 9.10 WIP Reporting (GAP-434)

- **Work-in-Progress (WIP) schedule**: standard construction accounting report.
- Calculation methods (configurable per builder/accountant preference):
  - Percentage of completion (cost-to-cost).
  - Percentage of completion (units of work).
  - Completed contract method.
- WIP fields per project: contract value, costs incurred, estimated costs to complete, % complete, earned revenue, billings to date, over/under billing.
- Multi-project WIP summary report.
- Period-locked WIP snapshots for month-end reporting (GAP-439).

### 9.11 Draw Requests / AIA Billing (GAP-441 through GAP-448)

- **Generate draw requests** from budget data:
  - AIA G702/G703 format (GAP-441) or custom format.
  - Auto-calculate from schedule progress (GAP-446) or manual entry.
- **Contract type variation** (GAP-443): fixed-price uses % complete billing, cost-plus uses actual costs + fee.
- **Stored materials** (GAP-444): bill for materials on-site but not installed (configurable per lender/builder).
- **Supporting documentation** (GAP-442): configurable required attachments (invoices, lien waivers, photos, inspection reports).
- **Approval routing** (GAP-445): Generate -> PM review -> Director approve -> send to client/lender.
- **Multiple lenders** (GAP-447): different draw formats and requirements per lender on the same project.
- **Reconciliation** (GAP-448): track approved draw amount vs. actual disbursement, flag gaps.

### 9.12 Multi-Audience Budget Views (GAP-280)

- **Owner/Client view**: 10-15 summary categories, no cost code detail, clean formatting.
- **PM/Superintendent view**: full detail with all cost codes, committed/actual/projected columns.
- **Bank/Lender view**: AIA G702/G703 format with retainage and stored materials.
- **Accountant view**: chart of accounts mapped view for QuickBooks/Sage reconciliation.
- Each view is a presentation layer over the same underlying data.
- Builder configures which view each role sees by default.

### 9.13 Accounting Integration (GAP-431, GAP-432, GAP-433, GAP-435, GAP-439)

- **Chart of accounts mapping** (GAP-431): each cost code maps to one or more GL accounts. Configurable per builder.
- **Accounting system sync** (GAP-432): export transactions to QuickBooks Desktop, QuickBooks Online, Sage, Xero. Import payments from accounting system.
- **Fiscal year** (GAP-433): configurable fiscal year start (not always January).
- **Bank accounts** (GAP-435): transactions can be tagged to specific bank accounts for reconciliation.
- **Period close** (GAP-439): lock financial data for completed periods. No edits to prior period without admin override and audit trail.

### 9.14 Financial Projections & KPIs (GAP-438, GAP-440)

- **Revenue forecast** (GAP-440): projected billings across all active projects by month.
- **Expense forecast**: projected costs by month based on schedule and commitments.
- **Cash flow forecast**: revenue minus expenses, factoring in payment terms and collection patterns.
- **Configurable KPIs** (GAP-438): builder selects which metrics appear on their financial dashboard:
  - Gross margin by project.
  - Backlog value.
  - Average days to collect.
  - Over/under billing summary.
  - Contingency remaining.
  - Cost performance index.

### 9.15 Minimal Budget Mode (GAP-278)

- For builders who do not want full budgeting, provide a simplified mode:
  - Track actual costs only (no budget lines, no projections).
  - Cost entries allocated to cost codes and projects.
  - Basic reporting: total cost per project, cost per cost code.
  - Upgrade path: builder can enable full budget mode later and retroactively create budgets.

---

## Database Tables

### budgets
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders, multi-tenant |
| project_id | UUID | FK -> projects |
| name | VARCHAR(255) | e.g., "Original Budget", "Revised Budget" |
| contract_type | ENUM | 'fixed_price', 'cost_plus', 'gmp', 'nte' |
| status | ENUM | 'draft', 'active', 'closed' |
| original_total | DECIMAL(14,2) | Sum of original budget lines |
| change_order_total | DECIMAL(14,2) | Sum of approved COs |
| current_total | DECIMAL(14,2) | original + COs |
| contingency_total | DECIMAL(14,2) | |
| contingency_remaining | DECIMAL(14,2) | |
| markup_method | ENUM | 'flat', 'tiered', 'per_line', 'built_in' |
| markup_config | JSONB | Markup percentages and rules |
| created_from | ENUM | 'estimate', 'template', 'manual', 'clone' |
| source_id | UUID | FK to estimate or template |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### budget_lines
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders |
| budget_id | UUID | FK -> budgets |
| cost_code_id | UUID | FK -> cost_codes |
| parent_line_id | UUID | Self-ref for hierarchy |
| description | VARCHAR(500) | |
| line_type | ENUM | 'standard', 'allowance', 'contingency', 'alternate' |
| is_alternate_selected | BOOLEAN | For alternate lines (GAP-270) |
| quantity | DECIMAL(12,3) | |
| unit | VARCHAR(50) | EA, SF, LF, LS, HR, etc. |
| unit_cost | DECIMAL(12,4) | |
| markup_pct | DECIMAL(6,3) | Per-line markup if applicable |
| budgeted_amount | DECIMAL(14,2) | qty * unit_cost * (1 + markup) |
| committed_amount | DECIMAL(14,2) | From subcontracts + POs |
| actual_amount | DECIMAL(14,2) | From paid invoices |
| projected_final | DECIMAL(14,2) | Computed |
| variance | DECIMAL(14,2) | budgeted - projected |
| percent_complete | DECIMAL(5,2) | |
| sort_order | INTEGER | |
| notes | TEXT | |

### cost_codes
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders |
| parent_id | UUID | Self-ref for hierarchy |
| code | VARCHAR(50) | e.g., "03-100" |
| name | VARCHAR(255) | e.g., "Concrete Foundations" |
| level | INTEGER | Depth in hierarchy (1=division, 2=subdivision, etc.) |
| system | ENUM | 'csi', 'custom', 'hybrid' |
| default_unit | VARCHAR(50) | |
| default_unit_cost | DECIMAL(12,4) | |
| gl_account_mapping | VARCHAR(50) | For accounting integration (GAP-431) |
| is_active | BOOLEAN | |
| sort_order | INTEGER | |

### budget_alerts
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders |
| budget_line_id | UUID | FK -> budget_lines |
| alert_type | ENUM | 'warning', 'critical', 'over_budget' |
| threshold_pct | DECIMAL(5,2) | |
| triggered_at | TIMESTAMPTZ | |
| acknowledged_by | UUID | FK -> users |
| acknowledged_at | TIMESTAMPTZ | |

### contingency_draws
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders |
| budget_id | UUID | FK -> budgets |
| amount | DECIMAL(14,2) | |
| reason | TEXT | Required |
| approved_by | UUID | FK -> users |
| approved_at | TIMESTAMPTZ | |
| cost_code_id | UUID | FK -> cost_codes |
| related_co_id | UUID | FK -> change_orders, nullable |

### estimate_versions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders |
| project_id | UUID | FK -> projects |
| version_number | INTEGER | 1, 2, 3... |
| status | ENUM | 'draft', 'pending_approval', 'approved', 'expired', 'superseded' |
| total_amount | DECIMAL(14,2) | |
| valid_until | DATE | Expiration date (GAP-271) |
| line_data | JSONB | Snapshot of all lines at this version |
| exclusions | TEXT | Scope exclusions (GAP-269) |
| approved_by | UUID | FK -> users |
| approved_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

### scope_exclusions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders |
| estimate_version_id | UUID | FK -> estimate_versions |
| description | TEXT | What is NOT included |
| sort_order | INTEGER | |

### draw_requests
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders |
| project_id | UUID | FK -> projects |
| budget_id | UUID | FK -> budgets |
| draw_number | INTEGER | Sequential |
| format | ENUM | 'aia_g702', 'custom' |
| lender_id | UUID | FK -> contacts, nullable (GAP-447) |
| status | ENUM | 'draft', 'submitted', 'approved', 'partially_paid', 'paid', 'rejected' |
| period_start | DATE | |
| period_end | DATE | |
| total_requested | DECIMAL(14,2) | |
| retainage_held | DECIMAL(14,2) | |
| stored_materials | DECIMAL(14,2) | (GAP-444) |
| amount_approved | DECIMAL(14,2) | |
| amount_disbursed | DECIMAL(14,2) | (GAP-448) |
| supporting_docs | JSONB | List of required/attached documents |
| submitted_at | TIMESTAMPTZ | |
| approved_at | TIMESTAMPTZ | |
| approved_by | UUID | |
| notes | TEXT | |

### wip_snapshots
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders |
| project_id | UUID | FK -> projects |
| period_end | DATE | Month-end date |
| method | ENUM | 'cost_to_cost', 'units', 'completed_contract' |
| contract_value | DECIMAL(14,2) | |
| costs_incurred | DECIMAL(14,2) | |
| estimated_cost_to_complete | DECIMAL(14,2) | |
| percent_complete | DECIMAL(5,2) | |
| earned_revenue | DECIMAL(14,2) | |
| billings_to_date | DECIMAL(14,2) | |
| over_under_billing | DECIMAL(14,2) | Computed |
| is_locked | BOOLEAN | Period closed (GAP-439) |
| created_at | TIMESTAMPTZ | |

### budget_config
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders, unique |
| cost_code_system | ENUM | 'csi', 'custom', 'hybrid' |
| hierarchy_style | ENUM | 'division_code_item', 'phase_trade_item', 'category_sub_item' |
| warning_threshold_pct | DECIMAL(5,2) | Default 80 |
| critical_threshold_pct | DECIMAL(5,2) | Default 95 |
| fiscal_year_start_month | INTEGER | 1-12 (GAP-433) |
| default_markup_method | ENUM | 'flat', 'tiered', 'per_line', 'built_in' |
| default_markup_pct | DECIMAL(6,3) | |
| minimal_mode | BOOLEAN | Actuals-only mode (GAP-278) |
| wip_method | ENUM | 'cost_to_cost', 'units', 'completed_contract' |
| draw_format | ENUM | 'aia_g702', 'custom' |
| estimate_validity_days | INTEGER | Default 90 (GAP-271) |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/projects/:projectId/budget | Get project budget with lines |
| POST | /api/projects/:projectId/budget | Create budget (from estimate, template, or manual) |
| PUT | /api/budgets/:budgetId | Update budget metadata |
| GET | /api/budgets/:budgetId/lines | Get all budget lines |
| POST | /api/budgets/:budgetId/lines | Add budget line |
| PUT | /api/budget-lines/:lineId | Update budget line |
| DELETE | /api/budget-lines/:lineId | Remove budget line (draft only) |
| GET | /api/budgets/:budgetId/summary | Budget summary (totals, variances) |
| GET | /api/budgets/:budgetId/variance | Variance analysis report |
| GET | /api/budgets/:budgetId/earned-value | Earned value metrics |
| GET | /api/budgets/:budgetId/projections | Cost-to-complete projections |
| GET | /api/cost-codes | List builder's cost codes |
| POST | /api/cost-codes | Create cost code |
| PUT | /api/cost-codes/:codeId | Update cost code |
| POST | /api/cost-codes/import | Import cost codes from CSV |
| GET | /api/projects/:projectId/estimates | List estimate versions |
| POST | /api/projects/:projectId/estimates | Create new estimate version |
| GET | /api/estimates/:estimateId/compare/:otherEstimateId | Compare two versions |
| POST | /api/estimates/:estimateId/approve | Approve estimate |
| GET | /api/budgets/:budgetId/contingency | Get contingency status |
| POST | /api/budgets/:budgetId/contingency/draw | Draw from contingency |
| GET | /api/projects/:projectId/draw-requests | List draw requests |
| POST | /api/projects/:projectId/draw-requests | Create draw request |
| PUT | /api/draw-requests/:drawId | Update draw request |
| POST | /api/draw-requests/:drawId/submit | Submit draw request |
| POST | /api/draw-requests/:drawId/approve | Approve draw request |
| GET | /api/draw-requests/:drawId/export/aia | Export as AIA G702/G703 PDF |
| GET | /api/projects/:projectId/wip | Get WIP report for project |
| GET | /api/wip/summary | Multi-project WIP summary |
| POST | /api/wip/snapshot | Create period-end WIP snapshot |
| POST | /api/periods/:periodEnd/lock | Lock a financial period |
| GET | /api/budget-config | Get builder's budget configuration |
| PUT | /api/budget-config | Update builder's budget configuration |
| GET | /api/budgets/:budgetId/view/:audience | Get audience-specific budget view |
| GET | /api/financial/forecast | Revenue/expense/cash flow forecast |
| GET | /api/financial/kpis | Dashboard KPI data |

---

## UI Components

| Component | Description |
|-----------|-------------|
| BudgetSpreadsheet | Interactive grid for budget lines with committed/actual/projected columns |
| CostCodeManager | Hierarchical cost code tree with CRUD and import |
| BudgetSummaryCard | Project budget health at a glance (total, committed, actual, variance) |
| VarianceChart | Bar chart or waterfall showing budget vs. actual by cost code |
| EarnedValueDashboard | CPI, SPI gauges with trend lines |
| EstimateVersionCompare | Side-by-side diff of two estimate versions |
| ContingencyTracker | Visual contingency bar with drawdown history |
| DrawRequestForm | AIA G702/G703 form builder with supporting doc attachments |
| DrawRequestList | Status pipeline for all draw requests |
| WIPReportTable | WIP schedule with over/under billing columns |
| BudgetAlertBanner | In-context alerts on budget lines approaching threshold |
| MultiAudienceToggle | Switch between owner/PM/bank/accountant budget views |
| CashFlowChart | Monthly projected cash flow line chart |
| FinancialKPIGrid | Configurable KPI widget grid |
| BudgetTemplateManager | Create/edit/apply budget templates |
| MarkupConfigPanel | Builder admin for markup method and percentages |
| PeriodLockControl | Month-end close interface with lock/unlock |

---

## Dependencies

- **Module 3: Core Data Model** -- projects, cost codes base tables
- **Module 5: Notification Engine** -- budget alerts, draw request notifications
- **Module 7: Scheduling** -- earned value requires schedule data; draw auto-generation from progress
- **Module 10: Vendor Management** -- committed costs from vendor subcontracts
- **Module 11: Basic Invoicing** -- actual costs from approved invoices
- **Module 17: Change Order Management** -- CO impact on budget lines
- **Module 20: Purchasing** -- committed costs from approved POs
- **External: Accounting Systems** -- QuickBooks, Sage, Xero sync (GAP-432)

---

## Open Questions

1. Should the earned value management (GAP-275) be a standard feature or a premium/advanced tier feature? It adds complexity most small builders may not use.
2. For accounting integration (GAP-432), should V1 support just QuickBooks Online, with others added later?
3. How should the system handle retainage tracking -- per line item or per vendor? (Different builders handle this differently.)
4. Should assembly-based estimating (GAP-260) be built as a separate estimating module or integrated into the budget module?
5. For financial projections (GAP-440), how far out should the forecast extend? 3 months? 12 months? Configurable?
6. Should period locking (GAP-439) be hard lock (no changes possible) or soft lock (admin override with audit trail)?
7. What level of AIA G702/G703 compliance is needed? Pixel-perfect form reproduction or data-equivalent with custom formatting?
