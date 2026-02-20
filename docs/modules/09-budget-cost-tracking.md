# Module 9: Budget & Cost Tracking

**Phase:** 2 - Construction Core
**Status:** TODO
**Last Updated:** 2026-02-11

---

## Overview

Project budget creation and real-time cost tracking against budget lines. Tracks committed costs (signed subcontracts and POs), actual costs (paid invoices), and projected final costs with variance analysis. Supports multiple cost code systems, configurable budget hierarchies, change order impact tracking, budget contingency management, WIP reporting, and multi-audience budget views. Serves as the financial backbone connecting estimates, invoices, change orders, draw requests, and accounting.

## Proven Patterns from v1

### Variance Detection (Proven)
- variance-detector.js (40KB) - largest service file in v1
- Real-time check when linking invoice to PO
- Compares invoice amounts to PO line item amounts
- Returns warnings for significant variance (non-blocking)
- Budget lines track: original_amount, revised_amount, committed (POs), invoiced, paid

### Linkage Validation (Proven)
Audit endpoint checks for:
- Orphaned PO allocations (PO deleted)
- Orphaned PO line item references
- Orphaned CO allocations
- Draw status mismatches
- Allocation sum exceeds invoice
- Invoices with PO but no allocations

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
| GAP-547 | Sales tax on construction varies by state (all 50 states) | Medium |
| GAP-548 | Builders operating in multiple states (different tax rules per project) | Medium |
| GAP-549 | Tax rate lookups by address (zip code or parcel level) | Medium |
| GAP-550 | Tax exemption management (certificates on file, suppress tax) | Medium |
| GAP-551 | 1099 reporting that varies by builder entity type | Medium |
| GAP-552 | Payroll tax scope (platform vs. payroll system responsibility) | Low |
| 1030 | Daily cash position — bank balance, due out today/this week, draws pending | Daily cash position widget on dashboard linking to cash flow detail |
| 1047 | Invoice processing queue — review AI-extracted invoices; approve/code/dispute | End-of-day invoice review workflow with AI-assisted coding |
| 1051 | Weekly cash flow projection review — updated projections for all active projects | Weekly cash flow review dashboard with project-level projections |
| 1052 | Weekly budget variance review — line items trending over budget with action plans | Budget variance report highlighting at-risk line items with corrective action tracking |
| 1055 | Weekly draw request preparation — compile approved invoices, lien waivers, photos for next draw | Draw request preparation workflow aggregating required supporting documents |
| 1058 | Monthly WIP report generation — over/under billing analysis for accountant | WIP report generator with over/under billing analysis and export |
| 1059 | Monthly profitability review by project — which jobs are making money, which aren't, why | Per-project profitability dashboard with root cause analysis |
| 1064 | Vendor payment aging review — who are we behind on paying, cash flow implications | Vendor payment aging report with cash flow impact analysis |

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

#### Edge Cases & What-If Scenarios

1. **Cost code accidental deletion / orphan prevention.** When a cost code is deactivated or deleted, linked POs, invoices, budget lines, and change orders can become orphaned -- breaking financial reports and budget rollups. Required behavior:
   - **Soft-delete only** -- cost codes are never physically deleted; they are marked `is_active = false`.
   - **Pre-deactivation check** -- before deactivating, the system must scan for: open POs referencing this cost code, unpaid invoices allocated to this cost code, pending change orders modifying this cost code, and active budget lines with remaining commitment.
   - **Block deactivation** if any open/pending records exist -- force the user to reassign or close them first.
   - **Cascade display rules** -- deactivated cost codes still appear in historical reports but are hidden from new entry dropdowns.
   - **Merge workflow** -- allow merging one cost code into another, reassigning all linked records atomically.
   - **Database constraint:** Add a trigger or application-level check that prevents `is_active = false` when open/pending records reference the cost code.

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

#### Edge Cases & What-If Scenarios

1. **Three-column tracking clarity.** The three-column model (Budgeted, Committed, Actual) is powerful but can confuse users if the calculation behind each number is not transparent. Required behavior:
   - Each column header must include a tooltip or expandable help text explaining exactly which transactions feed that column.
   - **Budgeted** = original estimate line amount + approved CO adjustments.
   - **Committed** = sum of signed subcontract values + approved PO amounts for this cost code (only active/open commitments).
   - **Actual** = sum of paid invoice line items + direct cost entries posted against this cost code.
   - When any computed column (Projected Final, Variance, % Complete, Cost to Complete) is displayed, a "show calculation" link reveals the formula and source data.
   - If Committed > Budgeted on any line, the line must be visually flagged as over-committed even before actual costs are incurred.

2. **Accounting practice misalignment.** A builder's existing accounting practices may not align with the platform's assumptions about cost categorization, accrual vs. cash basis, or overhead allocation. Required behavior:
   - Chart of accounts mapping (Section 9.14) must be flexible enough to handle non-standard GL structures.
   - The system must support both accrual and cash basis perspectives on cost data, configurable per builder.
   - Budget reports must clearly label which accounting basis is being used.
   - When a builder's accounting system classifies a transaction differently than the platform (e.g., a cost the platform calls "direct" that the builder's CPA calls "overhead"), the mapping layer must handle the translation without requiring the builder to change their practices.

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

### 9.9 Inter-Job Cost Transfers

- **Material/Cost Transfers:** Transfer materials or costs between projects (Job A to Job B) with a formal transfer record.
- **Audit Trail:** Each transfer records the original job, destination job, reason for transfer, amount, and approver.
- **Budget Impact:** Transferring costs automatically adjusts budgets on both source (credit) and destination (debit) jobs.
- **Bulk Allocation:** Support common scenario of bulk material purchases allocated across multiple projects by quantity or percentage split.

### 9.10 Change Order Impact on Budget

- Approved change orders (Module 17) automatically update budget:
  - Add new budget lines for new scope.
  - Adjust existing budget lines for scope changes.
  - Update contract value.
  - Track CO impact separately (original budget vs. COs).
- Budget summary shows: Original Budget + Approved COs = Current Budget.

### 9.11 WIP Reporting (GAP-434)

- **Work-in-Progress (WIP) schedule**: standard construction accounting report.
- Calculation methods (configurable per builder/accountant preference):
  - Percentage of completion (cost-to-cost).
  - Percentage of completion (units of work).
  - Completed contract method.
- WIP fields per project: contract value, costs incurred, estimated costs to complete, % complete, earned revenue, billings to date, over/under billing.
- Multi-project WIP summary report.
- Period-locked WIP snapshots for month-end reporting (GAP-439).

### 9.12 Draw Requests / AIA Billing (GAP-441 through GAP-448)

- **Generate draw requests** from budget data:
  - AIA G702/G703 format (GAP-441) or custom format.
  - Auto-calculate from schedule progress (GAP-446) or manual entry.
- **Contract type variation** (GAP-443): fixed-price uses % complete billing, cost-plus uses actual costs + fee.
- **Stored materials** (GAP-444): bill for materials on-site but not installed (configurable per lender/builder).
- **Supporting documentation** (GAP-442): configurable required attachments (invoices, lien waivers, photos, inspection reports).
- **Approval routing** (GAP-445): Generate -> PM review -> Director approve -> send to client/lender.
- **Multiple lenders** (GAP-447): different draw formats and requirements per lender on the same project.
- **Reconciliation** (GAP-448): track approved draw amount vs. actual disbursement, flag gaps.

### 9.13 Multi-Audience Budget Views (GAP-280)

- **Owner/Client view**: 10-15 summary categories, no cost code detail, clean formatting.
- **PM/Superintendent view**: full detail with all cost codes, committed/actual/projected columns.
- **Bank/Lender view**: AIA G702/G703 format with retainage and stored materials.
- **Accountant view**: chart of accounts mapped view for QuickBooks/Sage reconciliation.
- Each view is a presentation layer over the same underlying data.
- Builder configures which view each role sees by default.

### 9.14 Accounting Integration (GAP-431, GAP-432, GAP-433, GAP-435, GAP-439)

- **Chart of accounts mapping** (GAP-431): each cost code maps to one or more GL accounts. Configurable per builder.
- **Accounting system sync** (GAP-432): export transactions to QuickBooks Desktop, QuickBooks Online, Sage, Xero. Import payments from accounting system.
- **Fiscal year** (GAP-433): configurable fiscal year start (not always January).
- **Bank accounts** (GAP-435): transactions can be tagged to specific bank accounts for reconciliation.
- **Period close** (GAP-439): lock financial data for completed periods. No edits to prior period without admin override and audit trail.

#### Edge Cases & What-If Scenarios

1. **Period locking rules.** Accounting periods can be "closed" but rules for handling pending transactions, grace periods, and override authority must be explicit. Required behavior:
   - **Soft lock (default)** -- period is locked for normal users; `owner` and `admin` roles can override with audit trail entry.
   - **Grace period** -- configurable window (default: 3 business days after period close) where transactions dated in the closed period can still be posted.
   - **Pending transaction handling** -- on period close, system alerts on any draft/pending transactions dated within the period; user must approve, backdate, or void them.
   - **Lock cascade** -- locking a period also locks all draws, invoices, and journal entries dated within that period.
   - **Unlock workflow** -- reopening a closed period requires `owner` approval and creates an audit log entry with reason.

### 9.15 Daily & Weekly Financial Operations (Gaps 1030, 1047, 1051, 1052, 1055, 1064)

**Daily Cash Position (Gap 1030):**
- Real-time cash position summary: current bank balance (from bank feed or manual entry), committed outflows (approved invoices due today/this week), expected inflows (draws submitted and pending), net position
- Dashboard widget for "My Day" view (Module 4) with drill-down to full detail
- Cash flow alert: warn when projected balance drops below configurable threshold
- Multi-bank account view: consolidated position across all builder bank accounts

**Invoice Processing Queue (Gap 1047):**
- End-of-day invoice review workflow for PMs and office staff
- Queue shows all invoices received today: AI-extracted data, suggested cost code, confidence level
- One-click approve for high-confidence AI extractions; manual review for low-confidence
- Bulk processing: review and approve/code/dispute multiple invoices in one session
- Dispute workflow: flag invoice with reason, auto-notify vendor, track resolution
- Integration with Module 11 (Invoicing) and Module 13 (Invoice AI)

**Weekly Cash Flow Projection (Gap 1051):**
- Updated cash flow projections for all active projects refreshed weekly
- Projection based on: scheduled draws, committed vendor payments, payment terms, historical collection patterns
- Cross-project cash flow summary: aggregate all projects into one cash flow view
- Scenario modeling: "What if Draw #4 is delayed two weeks?" impact on cash position
- Exportable for lender or accountant review

**Weekly Budget Variance Review (Gap 1052):**
- Budget variance report highlighting line items trending over budget across all projects
- Variance threshold alerts: configurable per cost code category (e.g., warn at 80%, alert at 95%)
- Corrective action tracking: for each over-budget line item, document the cause and action plan
- Trend analysis: is the variance growing or stabilizing?
- Comparison to contingency: are variances consuming contingency reserves?

**Weekly Draw Request Preparation (Gap 1055):**
- Draw request preparation dashboard aggregating all required supporting documents:
  - Approved invoices for the draw period
  - Lien waivers collected (conditional and unconditional)
  - Progress photos from daily logs
  - Inspection results for completed milestones
  - Schedule update showing percentage complete
- Checklist view: green (complete), yellow (in progress), red (missing) for each required document
- One-click package generation once all documents are assembled
- Draw request draft review before submission to lender

**Vendor Payment Aging (Gap 1064):**
- Vendor payment aging report: invoices grouped by 0-30, 31-60, 61-90, 90+ days
- Cash flow implications: total outstanding vendor payments vs. available cash
- Priority flagging: critical vendors (on active job sites) highlighted
- Payment scheduling: plan payment runs based on cash flow and vendor priority
- Vendor relationship impact: flag vendors who may stop work due to non-payment

### 9.16 Monthly Financial Operations (Gaps 1058, 1059)

**WIP Report Generation (Gap 1058):**
- Monthly WIP report auto-generated from current project data
- Over/under billing analysis per project: compare billings to date vs. earned revenue
- Export formats: PDF for accountant, Excel for analysis, direct integration with accounting system
- WIP trend: month-over-month comparison showing billing position improvement or deterioration
- Configurable WIP calculation method per builder/accountant preference (per section 9.11)

**Profitability Review by Project (Gap 1059):**
- Per-project profitability dashboard: contract value, costs to date, projected final cost, gross margin, net margin
- Ranking: projects sorted by profitability (highest to lowest margin)
- Root cause analysis for underperforming projects: which cost codes are over budget, which change orders eroded margin
- PM performance attribution: profitability by PM for portfolio-level analysis
- Profitability trend: month-over-month margin trend per project

### 9.17 Financial Projections & KPIs (GAP-438, GAP-440)

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

### 9.16 Tax Handling for Construction (GAP-547 through GAP-552)

Tax rules for construction vary significantly by state and jurisdiction. The budget and cost tracking module must integrate with the Configuration Engine's jurisdiction database (Module 2, Section 14) to apply correct tax treatment on every transaction.

- **Multi-state tax support** (GAP-547, GAP-548): sales tax on construction varies by state -- some states tax materials only, some tax labor, some tax neither. Each project inherits tax rules from its physical location, not the builder's home state. Builders operating in multiple states must have project-level tax rule resolution.
- **Tax rate lookups by address** (GAP-549): the system must support tax rate resolution down to zip code or parcel level where state law requires it. Integration with a tax rate API (e.g., Avalara, TaxJar, or state tax authority APIs) is required for jurisdictions with sub-county rate variations. For jurisdictions without API support, manual tax rate entry per project is the fallback.
- **Tax exemption management** (GAP-550): some clients have tax-exempt status (e.g., religious organizations, government entities). The system must track tax exemption certificates per client with: certificate number, issuing authority, expiration date, and a copy of the certificate on file. When a project is linked to a tax-exempt client, the system must suppress tax calculations on applicable line items and generate tax-exempt documentation for vendor invoices and material purchases.
- **1099 reporting** (GAP-551): the system must track vendor payments to support year-end 1099-NEC reporting. Required data per vendor per tax year: total payments, vendor TIN/EIN (from W-9 on file), vendor legal name and address. The system must generate 1099-ready data exports (not necessarily the 1099 form itself, but all data needed for the builder's CPA or accounting software to produce filings). Builders who are S-corps, sole proprietors, or other entity types have different reporting thresholds; the system must support configurable 1099 reporting thresholds per builder.
- **Payroll tax scope** (GAP-552): payroll tax calculation (FICA, FUTA, SUTA, state withholding) is the responsibility of the builder's payroll system (ADP, Gusto, etc.) or accounting software. The platform's responsibility is limited to: (a) tracking labor burden rates per employee that include payroll tax estimates for accurate job costing, (b) integrating with Module 34 (HR & Workforce) for hourly employee time data, and (c) providing labor cost exports that the payroll system can consume. The platform does not replace payroll software.

#### Edge Cases & What-If Scenarios

1. **Tax rate changes mid-project.** When a jurisdiction changes its tax rate during an active project, the system must apply the new rate to new transactions while preserving the rate applied to historical transactions. Each transaction must record the tax rate used at the time of entry. Tax reports must be able to show transactions grouped by applicable tax rate for accurate filing. The Configuration Engine's jurisdiction versioning (effective dates) ensures that rate lookups return the correct rate for the transaction date, not the current date.

### 9.17 Minimal Budget Mode (GAP-278)

- For builders who do not want full budgeting, provide a simplified mode:
  - Track actual costs only (no budget lines, no projections).
  - Cost entries allocated to cost codes and projects.
  - Basic reporting: total cost per project, cost per cost code.
  - Upgrade path: builder can enable full budget mode later and retroactively create budgets.

### 9.18 Financial Edge Cases

These scenarios cover unusual but real financial situations that construction builders encounter. The system must handle each without requiring workarounds.

1. **Client overpayment — refund processing and tracking (GAP-806).** When a client pays more than the amount due (e.g., overpays a draw request, pays before a credit is applied), the system must: (a) detect the overpayment by comparing payment received to amount invoiced/requested, (b) create a credit balance on the client's account, (c) allow the builder to apply the credit to the next draw or issue a refund, (d) track the refund process (approved, check issued, check cleared), and (e) reflect the overpayment and refund in AR reporting and cash flow. Overpayments must never silently disappear from the financial record.

2. **Vendor credit underpayment — collection and dispute tracking (GAP-807).** When a vendor owes a credit (e.g., returned materials, defective work correction, overbilling) but does not apply it, the system must: (a) create a vendor credit record linked to the original invoice/PO, (b) track the credit status (requested, acknowledged, disputed, applied, collected), (c) allow the builder to offset the credit against future payments to that vendor, (d) alert when a credit has been outstanding for more than a configurable period (default: 30 days), and (e) support formal dispute escalation if the vendor does not honor the credit.

3. **Construction loan with unusual draw structures (GAP-808).** Some lenders use non-standard draw schedules (e.g., front-loaded draws, milestone-based with non-standard milestones, draws tied to inspection milestones rather than cost completion). The system must: (a) support fully configurable draw schedules per lender — not just percentage-of-completion, (b) allow milestone-based draws where each milestone has a fixed amount and release conditions, (c) support hybrid draw structures (some lines % complete, some milestone-based), and (d) validate each draw request against the lender's specific structure before submission.

4. **Multiple funding sources per project (GAP-809).** Some projects have multiple funding sources — client pays some, lender funds some, investor funds some, insurance covers some. The system must: (a) track multiple funding sources per project with their respective amounts and terms, (b) allocate draw requests to the correct funding source based on configurable rules, (c) track receivables separately per funding source (different AR aging per source), and (d) reconcile total funding against total contract amount. Each funding source may have different draw formats and documentation requirements.

5. **Barter arrangements (GAP-810).** Occasionally a vendor trades work for other consideration (e.g., builder does renovation for the electrician, electrician does wiring for the builder). The system must: (a) allow recording barter transactions with fair market value for both sides, (b) track the barter as both a receivable (work the builder is owed) and a payable (work the builder owes), (c) reflect barter transactions in budget actuals at fair market value, and (d) flag barter transactions for 1099 reporting (IRS requires reporting barter income at fair market value).

6. **Escrow requirements for deposits (GAP-811).** Some jurisdictions require client deposits to be held in escrow or trust accounts. The system must: (a) track which jurisdiction's escrow rules apply per project, (b) record deposits with trust account reference and escrow status, (c) enforce jurisdiction-specific deposit caps (e.g., some states limit deposits to a percentage of contract value), (d) track deposit application against draws with proper trust account accounting, and (e) alert when escrow handling does not comply with the applicable jurisdiction's rules. Integrates with the state_legal_requirements table in Module 38.

7. **Insurance proceeds after damage (GAP-812).** When a project sustains damage (storm, fire, theft) and insurance covers reconstruction, the system must: (a) create a separate budget section or cost code category for insurance-funded reconstruction work, (b) track insurance claim amounts, deductibles, and proceeds received, (c) link insurance proceeds to specific reconstruction costs for auditing, (d) handle the timing gap between work performed and insurance payment (builder may fund reconstruction before reimbursement), and (e) report insurance-funded work separately from original contract work in profitability analysis.

8. **Cost-plus client audit support (GAP-813).** Cost-plus contracts give clients the right to audit costs. The system must: (a) provide a client-accessible cost report showing every direct cost with supporting documentation (invoice image, PO, receipt), (b) support configurable transparency levels — some builders show vendor names and amounts, others show category totals only, (c) export audit packages with all supporting documentation organized by cost code, (d) track the audit process (requested, documentation provided, questions raised, resolved), and (e) maintain an immutable record of what was presented to the client at each audit.

9. **Progress billing when work is complete but not inspected (GAP-814).** Work may be physically complete but not yet inspected and approved. The system must: (a) allow configurable billing rules — bill on completion, bill on inspection approval, or bill on a hybrid basis, (b) track the difference between "work complete" and "work inspected and approved" as separate status fields, (c) support lender requirements that may restrict billing uninspected work, and (d) alert when completed work has not been inspected within a configurable window (prevents billing delays).

10. **Force majeure financial impact (GAP-815).** Force majeure events (hurricanes, pandemics, supply chain disruptions) create financial impacts beyond schedule delays. The system must track: (a) cost escalation due to the event (material price increases, labor rate changes), (b) extended general conditions costs (additional months of project overhead), (c) remobilization costs (getting crews back after a stoppage), (d) the financial documentation required to support a force majeure claim under the contract, and (e) the net financial impact compared to the original budget. Link to the contract's force majeure clause for reference.

11. **Bonus/penalty clauses (GAP-816).** Some contracts include milestone bonuses (early completion) or penalties (late completion). The system must: (a) store bonus/penalty terms per contract milestone (milestone, target date, bonus amount or rate, penalty amount or rate), (b) track actual vs. target dates for each milestone, (c) calculate the financial impact automatically as milestones are completed, (d) include bonus/penalty projections in profitability forecasting, and (e) alert the PM when a milestone bonus is at risk or a penalty is accruing.

12. **Liquidated damages calculation (GAP-817).** When a contract specifies liquidated damages (daily rate for exceeding the completion date), the system must: (a) store the LD rate and trigger conditions per contract, (b) calculate accruing liquidated damages daily once the completion date is exceeded, (c) display the LD exposure prominently on the project dashboard and financial reports, (d) include LD projections in cost-to-complete and profitability forecasts, and (e) track any LD waivers or reductions negotiated with the client.

13. **Shared costs between projects (GAP-818).** Builders sometimes share costs across projects — bulk material purchases, shared equipment, or shared labor. The system must: (a) support configurable allocation methods (by percentage, by square footage, by project count, by actual usage), (b) create allocation records that split a single cost across multiple project budgets, (c) ensure the total allocations equal the original cost (no rounding errors that create phantom costs), and (d) provide audit trail showing the allocation method and calculation for each split. Extends the inter-job cost transfer feature (Section 9.9).

14. **Year-end financial close processes (GAP-819).** At fiscal year-end, the system must support: (a) a year-end close process that prevents changes to the closed fiscal year's transactions, (b) accrual entries for work performed but not yet invoiced (and vice versa), (c) WIP schedule adjustments for year-end reporting, (d) a fiscal year rollover that carries forward open project balances, and (e) the ability to reopen a closed year (with owner approval) for audit adjustments. Extends the period locking feature (Section 9.14).

15. **Multi-year project financial reporting (GAP-820).** Projects spanning multiple fiscal years require: (a) year-over-year cost reporting per project (costs incurred per fiscal year), (b) revenue recognition that allocates revenue to the correct fiscal year per ASC 606, (c) WIP schedule snapshots per fiscal year-end, and (d) budget-to-actual comparisons that account for cost escalation across years.

16. **Currency conversion for imported materials (GAP-821).** Builders importing materials from overseas must track: (a) purchase amounts in the original currency and converted USD equivalent, (b) the exchange rate used at time of purchase and at time of payment (if different), (c) exchange rate gain/loss between commitment and payment, and (d) budget projections that factor in exchange rate risk. This is a Phase 3+ feature for builders with international procurement.

17. **Contingency drawdown authorization (GAP-822).** The system must support configurable approval requirements for contingency use: (a) different approval thresholds (e.g., PM can approve up to $5K, director up to $25K, owner for any amount), (b) documentation requirements per drawdown (reason, supporting documents, related cost code), (c) remaining contingency balance prominently displayed after each draw, and (d) historical analysis of contingency usage patterns for future estimating. Extends Section 9.8.

18. **Budget contingency reallocation (GAP-823).** When contingency funds need to be moved to specific cost codes, the system must: (a) create a formal reallocation record (from contingency to cost code X, amount, reason, approver), (b) update both the contingency balance and the destination cost code's budget, (c) maintain audit trail showing the reallocation chain, and (d) distinguish between contingency used for overruns (negative) vs. contingency released back to profit (positive). Extends Section 9.8.

19. **Profit margin analysis with all factors (GAP-824).** True profitability requires accounting for more than just direct costs vs. contract amount. The system must calculate profit margin that includes: (a) change order impact (both revenue and cost side), (b) warranty costs incurred after project completion (charged back to the project), (c) general conditions overrun (actual overhead vs. budgeted), (d) punch list costs, and (e) callbacks and rework costs. This "true profit" metric should be available alongside the simpler "budget profit" metric for completed projects.

20. **Cash-basis vs. accrual-basis reporting toggle (GAP-825).** Different builders and their accountants prefer different accounting bases. The system must: (a) store all transactions with both the transaction date (accrual) and the payment date (cash basis), (b) provide a reporting toggle that switches between cash-basis and accrual-basis views without duplicating data, (c) clearly label which basis is being displayed on every financial report, and (d) support builders who use cash basis internally but accrual basis for tax/banking purposes (dual reporting). Extends the accounting practice alignment in Section 9.3.

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
- **Module 11: Native Accounting (GL/AP/AR)** -- actual costs from approved invoices
- **Module 17: Change Order Management** -- CO impact on budget lines
- **Module 20: Purchasing** -- committed costs from approved POs
- **External: Accounting Systems** -- QuickBooks, Sage, Xero sync (GAP-432)

---

## Unusual Business Scenarios — Budget Edge Cases

### Client Bankruptcy Mid-Construction (GAP-599)
When a client goes bankrupt during an active construction project, the system must support:
- **Lien filing documentation:** Generate lien-ready reports including all costs incurred, materials on site, work completed by trade, and supporting invoices/receipts. Reports formatted per state lien filing requirements.
- **Project financial freeze:** Place the project budget in a "legal hold" state that preserves all current data, prevents new commitments (POs, subcontracts), and blocks draw request generation until the hold is lifted.
- **Partial billing closeout:** Generate a partial final billing package showing: work completed to date, materials stored on site, retainage held, payments received, and balance due. Support both AIA G702 format and custom formats for bankruptcy court filing.
- **Cost segregation:** Tag all costs as pre-bankruptcy vs. post-bankruptcy for legal proceedings. Track builder's protective costs (site securing, material protection) separately.
- **Vendor notification workflow:** Generate bulk notifications to all project vendors informing them of the project hold, with instructions for lien filing and payment claim procedures.
- **Project hold status:** Project enters a "bankruptcy hold" status distinct from normal pause — visible on all dashboards and reports.

### Natural Disaster Damages In-Progress Project (GAP-613)
When a natural disaster (hurricane, tornado, flood, fire) damages an in-progress project, the system must support:
- **Insurance claim documentation:** Generate a comprehensive damage report including: pre-disaster project status (schedule %, budget committed/spent), pre-disaster photos (from daily logs), post-disaster documentation, scope of damage by trade/phase, and estimated reconstruction costs.
- **Budget impact tracking:** Create a "disaster recovery" budget section that tracks reconstruction costs separately from original budget. Original budget is preserved as-is; reconstruction costs tracked in parallel.
- **Schedule rebuild:** System supports creating a "post-disaster" schedule baseline. Original schedule preserved for insurance/contract time extension documentation. New schedule reflects reconstruction sequencing.
- **Vendor re-engagement:** Track which vendors need to return for reconstruction work, which scopes need re-bidding, and which completed work was destroyed and must be redone.
- **Client communication:** Generate client-facing disaster impact reports showing timeline extension, cost impact (covered by insurance vs. out-of-pocket), and reconstruction plan.
- **Force majeure documentation:** Link disaster event to weather records, generate time extension documentation per contract requirements.

---

## Open Questions

1. Should the earned value management (GAP-275) be a standard feature or a premium/advanced tier feature? It adds complexity most small builders may not use.
2. For accounting integration (GAP-432), should V1 support just QuickBooks Online, with others added later?
3. How should the system handle retainage tracking -- per line item or per vendor? (Different builders handle this differently.)
4. Should assembly-based estimating (GAP-260) be built as a separate estimating module or integrated into the budget module?
5. For financial projections (GAP-440), how far out should the forecast extend? 3 months? 12 months? Configurable?
6. Should period locking (GAP-439) be hard lock (no changes possible) or soft lock (admin override with audit trail)?
7. What level of AIA G702/G703 compliance is needed? Pixel-perfect form reproduction or data-equivalent with custom formatting?

