'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Data Collection', 'AI Processing', 'Report Generation', 'Review & Insights', 'Export & Distribution'
]

export default function ReportsAndForecastingHub() {
  return (
    <PageSpec
      title="Reports, Analytics & Forecasting"
      phase="Phase 0 - Foundation"
      planFile="views/reports/REPORTS_FORECASTING.md"
      description="Comprehensive reporting and forecasting hub for the entire construction operation. 90+ built-in report types across 11 categories plus a full custom report builder that exposes every data field in the system. Every report includes AI-generated executive summaries, anomaly detection, and natural language query support. Reports are generated from structured data processed through the AI layer — never raw data. Custom reports can be created from scratch, cloned from templates, or described in plain English for AI generation."
      workflow={constructionWorkflow}
      features={[
        // ── REPORT CATEGORIES ──
        'Eleven report categories: Financial, Tax & Accounting, Forecasting, Operational, Scheduling, Procurement, HR & Workforce, Compliance & Risk, Client-Facing, Sales & Pipeline, Executive — plus Custom Reports',

        // ══════════════════════════════════════════════════════════════
        // ── FINANCIAL REPORTS (17 types) ──
        // ══════════════════════════════════════════════════════════════
        'FINANCIAL — Job Cost Report: budget vs actual by cost code with variance analysis, drill-down to line items and linked invoices/POs',
        'FINANCIAL — WIP Schedule (Work in Progress): percentage-of-completion for all active jobs, earned revenue, over/under billing, required by banks/sureties/CPAs',
        'FINANCIAL — Over/Under Billing Report: identifies overbilled (liability) vs underbilled (asset) jobs for balance sheet accuracy',
        'FINANCIAL — Profit Fade/Gain Analysis: tracks how estimated profit margins change over project life, identifies erosion causes',
        'FINANCIAL — Cash Flow Report (Actual): actual cash inflows/outflows by week/month, beginning/ending balances',
        'FINANCIAL — AR Aging Report: receivables by client aged 0-30, 31-60, 61-90, 90+ days with collection status and DSO',
        'FINANCIAL — AP Aging Report: payables by vendor with aging buckets, early payment discount tracking, lien waiver status',
        'FINANCIAL — Profitability by Job: compare margins across all jobs, contract vs cost vs margin, $/SF benchmarking',
        'FINANCIAL — Profitability by Trade: which trades/cost codes are consistently over/under budget across all jobs',
        'FINANCIAL — Profitability by Client: margin, change order frequency, decision speed, warranty costs per client',
        'FINANCIAL — Draw Tracking Report: all draws across jobs with submission/approval/funding dates, days-to-fund, lien waiver status',
        'FINANCIAL — Retainage Report: retainage held by clients and owed to subs, expected release dates, conditions',
        'FINANCIAL — Backlog Report: contracted work not yet completed, remaining revenue, monthly burn rate, months of backlog',
        'FINANCIAL — Revenue Recognition: ASC 606 compliance, percentage-of-completion method, recognized vs deferred revenue',
        'FINANCIAL — Committed Cost Report: all POs and subcontracts, invoiced vs remaining commitment, uncommitted budget',
        'FINANCIAL — Change Order Summary: all COs across jobs by type (client/builder/unforeseen), volume, value, margin impact',
        'FINANCIAL — Estimate vs Actual (Post-Job): completed job analysis comparing original estimate to final cost per cost code, feeds estimating accuracy loop',

        // ══════════════════════════════════════════════════════════════
        // ── TAX & ACCOUNTING (9 types) — NEW CATEGORY ──
        // ══════════════════════════════════════════════════════════════
        'TAX — 1099 Preparation: vendor payments YTD, W-9 status, threshold tracking, entity type filtering',
        'TAX — Sales & Use Tax: taxable vs exempt purchases by jurisdiction, construction exemption certificates, multi-state filing support',
        'TAX — Depreciation Schedule: equipment and vehicle depreciation (straight-line, MACRS), Section 179 expensing, bonus depreciation, net book value',
        'TAX — Multi-State Payroll Tax: withholding by state, SUTA/FUTA obligations, new hire reporting, nexus tracking for multi-state operations',
        'ACCOUNTING — GL Trial Balance: period-end general ledger balances, adjusting entries, audit trail, exportable to CPA',
        'ACCOUNTING — Balance Sheet: assets (cash, AR, underbillings, equipment, WIP), liabilities (AP, overbillings, retention payable, loans), equity — by period',
        'ACCOUNTING — Income Statement (P&L): revenue by job, cost of revenue by cost code, gross profit, overhead detail, net income — period and YTD',
        'ACCOUNTING — Job Cost to GL Reconciliation: reconcile job cost subledger to general ledger entries, flag discrepancies, required for annual audit',
        'ACCOUNTING — Allowance Tracking: contract allowances vs actual spend per category across all jobs, client over/under on each allowance, trending',

        // ══════════════════════════════════════════════════════════════
        // ── FORECASTING (8 types) ──
        // ══════════════════════════════════════════════════════════════
        'FORECAST — Cash Flow Forecast: rolling 13-week and 6-12 month projections, expected draws, vendor payments, payroll, overhead, best/worst/likely scenarios',
        'FORECAST — Cost-to-Complete (EAC): per-job projection of final cost using CPI, committed remaining, estimated uncommitted, variance from budget',
        'FORECAST — Revenue Forecast: projected revenue by month/quarter from backlog burn rate, active job schedules, pipeline weighted value',
        'FORECAST — Backlog Burn-Down: when current backlog will be consumed, new contracts needed, pipeline conversion rates',
        'FORECAST — Schedule Completion Prediction: AI-predicted completion dates vs contractual, SPI index, risk factors, confidence intervals',
        'FORECAST — Labor Productivity Forecast: projected labor needs by trade based on historical productivity rates and remaining work',
        'FORECAST — Material Cost Trend Projection: price trends for lumber, steel, concrete, copper, etc. with 30/60/90 day outlook, PPI reference',
        'FORECAST — Proposal Pipeline Forecast: weighted pipeline value, win probability by stage, expected close dates, conversion rate trends',

        // ══════════════════════════════════════════════════════════════
        // ── OPERATIONAL REPORTS (13 types) ──
        // ══════════════════════════════════════════════════════════════
        'OPERATIONAL — Weekly Progress Report: tasks completed/in-progress/behind, schedule variance, issues, upcoming milestones, weather impact',
        'OPERATIONAL — Monthly Project Status: comprehensive snapshot combining financial + operational + safety + quality per job',
        'OPERATIONAL — Daily Log Summary (Cross-Job): aggregated daily activity across all active jobs on one page — manpower, work performed, issues',
        'OPERATIONAL — Resource Utilization: PM/superintendent/carpenter allocation across jobs, available vs actual hours, utilization rate',
        'OPERATIONAL — Vendor Performance Scorecard: on-time %, budget adherence, quality score, safety record, communication rating, trend arrow',
        'OPERATIONAL — Quality Metrics / QA Report: rework rate, defect rate, punch list items per job, inspection first-pass rate, warranty claim rate',
        'OPERATIONAL — Safety Incident Report: individual incident documentation with OSHA fields, root cause, corrective actions',
        'OPERATIONAL — Safety Summary: TRIR, DART rate, near-miss count, toolbox talk completion, PPE compliance, EMR',
        'OPERATIONAL — Permit & Inspection Status: all permits across jobs, required inspections checklist, schedule dependencies',
        'OPERATIONAL — RFI Status Report: open/answered/closed RFIs, aging, response time, cost/schedule impact',
        'OPERATIONAL — Submittal Tracking: review status pipeline, lead time tracking, revision history, schedule dependencies',
        'OPERATIONAL — Punch List Report: items by room/trade/vendor, status, aging, before/after photos, close-out rate',
        'OPERATIONAL — Equipment Utilization: deployed vs idle hours, utilization rate, maintenance schedule, cost per hour, rent vs own analysis',

        // ══════════════════════════════════════════════════════════════
        // ── SCHEDULING REPORTS (7 types) — NEW CATEGORY ──
        // ══════════════════════════════════════════════════════════════
        'SCHEDULE — 3-Week Lookahead: rolling short-range schedule across all jobs, assigned crews, constraint/roadblock tracking, printable for field distribution',
        'SCHEDULE — Weekly Work Plan: planned vs accomplished tasks, Percent Plan Complete (PPC) metric from Last Planner System, variance by crew',
        'SCHEDULE — Critical Path Report: activities on critical and near-critical path across all jobs, total float analysis, longest path identification',
        'SCHEDULE — Schedule Variance Report: planned vs actual start/finish, duration variance, critical path impact, delay causes by category',
        'SCHEDULE — Weather Delay Tracking: rain/wind days by job, force majeure days, historical vs actual comparison, time extension justification with NOAA data',
        'SCHEDULE — Constraint/Roadblock Log: open constraints preventing task starts (materials, RFIs, submittals, permits, inspections, client decisions) across all jobs',
        'SCHEDULE — Schedule Delay Analysis: forensic day-for-day delay analysis, concurrent delay identification, as-planned vs as-built comparison',

        // ══════════════════════════════════════════════════════════════
        // ── PROCUREMENT REPORTS (7 types) — NEW CATEGORY ──
        // ══════════════════════════════════════════════════════════════
        'PROCUREMENT — Purchase Order Status: all POs across company — open, partially received, fully received, closed, overdue deliveries',
        'PROCUREMENT — PO vs Invoice Variance (3-Way Match): PO amount vs received amount vs invoiced amount per vendor/job, flags discrepancies',
        'PROCUREMENT — Material Price Comparison: same material quoted across multiple vendors, historical price trends, volume discount tracking',
        'PROCUREMENT — Procurement Spend Analysis: total spend by vendor, material category, job, trade — with period-over-period trends',
        'PROCUREMENT — Delivery Performance: on-time vs late deliveries per vendor, average delay days, impact on schedule tasks',
        'PROCUREMENT — Subcontractor Payment History: payment history per sub, average days-to-pay, retention held, amounts outstanding, lien waiver compliance',
        'PROCUREMENT — Bid Comparison / Tabulation: side-by-side comparison of bids received per scope, normalized for inclusions/exclusions, recommendation',

        // ══════════════════════════════════════════════════════════════
        // ── HR & WORKFORCE (8 types) — NEW CATEGORY ──
        // ══════════════════════════════════════════════════════════════
        'HR — Certified Payroll (WH-347): weekly wage report for prevailing wage / Davis-Bacon projects, fringe benefits, apprentice tracking, multi-state support',
        'HR — Labor Burden Rate: fully burdened cost per hour per employee (wages + taxes + insurance + benefits + fringes), typically 30-40% markup',
        'HR — Labor Distribution: hours and cost allocated by job, phase, cost code, trade for each employee/crew, period comparison',
        'HR — Overtime Analysis: OT hours by employee, crew, job, trade — OT cost as % of total labor, trend analysis, threshold alerts',
        'HR — Cross-Job Headcount & Manpower: daily/weekly headcount by job by trade, total workforce capacity vs deployment, utilization rate',
        'HR — Employee Training & Certification: training completion status, certifications, license expirations, safety training hours, OSHA 10/30 tracking',
        'HR — Workers Comp Audit Report: payroll hours by classification code for annual WC audit, burdened rates, experience mod history',
        'HR — Time & Material (T&M) Log: T&M work tracked by day across all jobs — labor hours, material costs, equipment, markup, for T&M billing',

        // ══════════════════════════════════════════════════════════════
        // ── COMPLIANCE & RISK (10 types) ──
        // ══════════════════════════════════════════════════════════════
        'COMPLIANCE — Lien Waiver Tracking: vendor/draw matrix, waiver type, received/outstanding status, payment hold enforcement',
        'COMPLIANCE — Insurance Certificate (COI) Tracking: coverage types, limits, expiration dates, deficiency flags, auto-alerts at 30/14/7 days',
        'COMPLIANCE — COI Deficiency / Gap Analysis: vendors with expired/missing/below-minimum coverage by policy type, risk exposure quantification',
        'COMPLIANCE — License Expiration Report: contractor/trade licenses by vendor, expiration tracking, renewal status',
        'COMPLIANCE — OSHA Compliance: 300 Log, 300A Summary, 301 Reports, training records, site inspection records',
        'COMPLIANCE — Permit Compliance: active permits, expiration alerts, inspection completion status, conditions/corrections',
        'COMPLIANCE — Vendor Compliance (W-9 + Docs): W-9, COI, license, workers comp, signed agreement — compliance score per vendor',
        'COMPLIANCE — Subcontractor Prequalification Scorecard: financial capacity, safety metrics (TRIR, EMR), bonding capacity, insurance compliance, composite risk score',
        'COMPLIANCE — Workers Comp EMR Tracking: Experience Modification Rate by sub, trending over 3 years, prequalification impact',
        'COMPLIANCE — Claims & Incident Trend: insurance claims filed, resolution status, loss ratios, workers comp claims by trade, root cause patterns',

        // ══════════════════════════════════════════════════════════════
        // ── CLIENT-FACING REPORTS (7 types) ──
        // ══════════════════════════════════════════════════════════════
        'CLIENT — Progress Report: weekly/biweekly update with schedule summary, curated photos, work completed, next steps, AI-generated narrative',
        'CLIENT — Draw Request Package: G702 cover sheet, G703 continuation sheet, progress photos, all lien waivers, inspection results',
        'CLIENT — Selection Status Report: by room/category, allowance vs selected price, variance, status, overdue items',
        'CLIENT — Budget Summary: contract + approved COs + credits = current total, billed, paid, remaining — NO cost/margin data',
        'CLIENT — Photo Timeline: AI-curated milestone photos, organized by phase, with captions and progress narrative',
        'CLIENT — Change Order Presentation: scope, pricing (at contract markup), schedule impact, approval signature block',
        'CLIENT — Warranty Binder / Turnover Package: all warranties, as-builts, manuals, maintenance schedules, paint schedule, vendor contacts, CO',

        // ══════════════════════════════════════════════════════════════
        // ── SALES & PIPELINE (4 types) ──
        // ══════════════════════════════════════════════════════════════
        'PIPELINE — Lead Conversion Funnel: stage-by-stage conversion rates, velocity (avg days per stage), bottleneck identification',
        'PIPELINE — Proposal Tracking: proposals sent, viewed, time-spent, conversion rate, avg proposal-to-contract days',
        'PIPELINE — Bid Win/Loss Report: win rate by vendor/trade, price competitiveness, scope thoroughness, bid accuracy (bid vs final cost)',
        'PIPELINE — Marketing ROI: lead source effectiveness, cost per lead, cost per conversion, lifetime value by source',

        // ══════════════════════════════════════════════════════════════
        // ── EXECUTIVE (4 types) ──
        // ══════════════════════════════════════════════════════════════
        'EXECUTIVE — Company Financial Dashboard: cash, AR, AP, revenue, margin, forecast — all KPI cards with trend arrows',
        'EXECUTIVE — Multi-Job Status Summary: one-page all-jobs overview with traffic-light status (schedule/budget/cash)',
        'EXECUTIVE — Owner\'s Weekly Briefing: AI-generated email with draws submitted, invoices processed, jobs at risk, action items',
        'EXECUTIVE — KPI Benchmarks: NAHB benchmarks for gross margin, net margin, revenue/employee, jobs/PM, cost/SF, CO rate',

        // ══════════════════════════════════════════════════════════════
        // ── WARRANTY & POST-CONSTRUCTION (6 types) — NEW CATEGORY ──
        // ══════════════════════════════════════════════════════════════
        'WARRANTY — Service Request Log: all open/closed warranty claims across jobs, response time, resolution time, by trade/category/defect type',
        'WARRANTY — Cost by Trade: dollar amount of warranty work by trade/subcontractor, back-charge tracking, cost vs warranty reserve',
        'WARRANTY — Callback Rate: % of jobs requiring callbacks, callbacks per job, callback frequency trend, comparison to industry average',
        'WARRANTY — Response Time & SLA: average time from homeowner request to first response, to resolution, SLA compliance rate',
        'WARRANTY — Expiration Tracker: all active warranties across all jobs, grouped by expiration date, 30/60/90-day alerts, renewal reminders',
        'WARRANTY — Homeowner Satisfaction: post-construction and post-warranty NPS scores, CSAT, trend analysis, correlation to referral rate',

        // ══════════════════════════════════════════════════════════════
        // ── DOCUMENT MANAGEMENT (4 types) — NEW CATEGORY ──
        // ══════════════════════════════════════════════════════════════
        'DOCUMENT — Transmittal Log: all document transmittals sent/received across jobs, acknowledged, overdue responses',
        'DOCUMENT — Drawing Revision Log: current revision per sheet across all jobs, revision history, superseded drawings still in circulation',
        'DOCUMENT — Completeness Matrix: required documents per job/phase with missing/received status, close-out readiness percentage',
        'DOCUMENT — Closeout Document Tracker: as-built drawings, O&M manuals, attic stock, warranty certificates, final lien waivers, CO — across all jobs approaching completion',

        // ══════════════════════════════════════════════════════════════
        // ── CUSTOM REPORT BUILDER ──
        // ══════════════════════════════════════════════════════════════
        'CUSTOM — Report Builder: drag-and-drop field selection from any data source in the system (115+ entities, 1000+ fields)',
        'CUSTOM — Data Source Catalog: 15 data domains — Jobs, Financials, Budget, Schedule, Procurement, Invoices, Change Orders, Draws, Selections, Daily Logs, Documents, Vendors, Clients, Leads, HR/Time',
        'CUSTOM — Cross-Module Joins: combine data from any modules in a single report — e.g., invoices + POs + schedule + daily logs + vendors',
        'CUSTOM — Field Picker: browse by domain → entity → field hierarchy, drag to columns/rows/filters/values, field metadata shows type and description',
        'CUSTOM — Measures vs Dimensions: numeric fields available as measures (sum, avg, min, max, count, median, stdev), text/date fields as dimensions (group by)',
        'CUSTOM — Calculated Fields: create formula columns — arithmetic (cost + markup), ratios (actual / budget), conditionals (IF variance > 10% THEN "Over Budget"), date math (days between)',
        'CUSTOM — Filter Builder: rich operators per type — text (equals, contains, starts with, ends with, is empty), numbers (=, >, <, between), dates (before, after, range, relative: "last 30 days"), multi-select for enums',
        'CUSTOM — Grouping & Subtotals: group by any dimension with subtotal/grand total rows, multi-level grouping (by job → by trade → by vendor), collapsible groups',
        'CUSTOM — Conditional Formatting: color cells based on thresholds — red if over budget, green if ahead of schedule, yellow for warnings, configurable per column',
        'CUSTOM — Chart Types: table (default), bar, stacked bar, line, area, pie/donut, KPI card, combo (bar + line), sparklines in table cells',
        'CUSTOM — Dashboard Composer: arrange multiple report widgets on a single dashboard page, drag/resize layout, auto-refresh intervals, shared or personal',
        'CUSTOM — Save & Organize: name, tag, categorize, and organize custom reports in personal or shared folders, version history on every save',
        'CUSTOM — Clone from Template: start from any built-in report (90+ templates), modify columns/filters/grouping, save as new custom report',
        'CUSTOM — Scheduled Delivery: auto-generate and email reports daily/weekly/biweekly/monthly/quarterly — PDF or Excel, with stakeholder-specific formatting per recipient',
        'CUSTOM — Role-Based Visibility: personal (creator only), team (specific roles), company-wide — admin controls who can create/edit/view custom reports',
        'CUSTOM — Export: PDF (branded template with company logo), Excel (formatted with subtotals), CSV (raw data), print-optimized layouts',
        'CUSTOM — AI Report Creation: describe what you want in plain English — "Show me all jobs where margin has dropped more than 5% in the last 30 days" — AI generates the report definition',
        'CUSTOM — AI Report Enhancement: after creating a report, AI suggests additional columns, filters, or visualizations that would add insight',
        'CUSTOM — Report Snapshots: save point-in-time snapshots for trend comparison — compare this month\'s WIP to last month\'s, this quarter vs same quarter last year',
        'CUSTOM — Embeddable Widgets: any custom report can be pinned as a widget on the company dashboard or job dashboard',
        'CUSTOM — Power BI / Tableau Connector: export dataset definitions for advanced visualization in external BI tools (Phase 3+)',

        // ══════════════════════════════════════════════════════════════
        // ── GENERAL INFRASTRUCTURE ──
        // ══════════════════════════════════════════════════════════════
        'Natural language queries: "How much did we spend on windows across all jobs this year?"',
        'Scheduled report delivery via email (daily/weekly/monthly) with stakeholder-specific formatting',
        'Export to PDF, Excel, CSV with branded templates',
        'Report versioning and historical access',
        'Role-based report visibility (owner sees all, PM sees their jobs, accountant sees financial only)',
        'Dashboard widget generation from any report',
        'Comparison mode: period-over-period, job-vs-job, estimate-vs-actual',
        'Drill-through from any summary to underlying detail records',
        'Print-optimized layouts for bank packages and client presentations',
      ]}
      connections={[
        // Inputs — every module feeds reports
        { name: 'Jobs + Property Details', type: 'input', description: 'Job records, property attributes, status, team assignments' },
        { name: 'Budget Module', type: 'input', description: 'Original budget, revisions, committed, actual, projected by cost code' },
        { name: 'Invoice AI Extraction', type: 'input', description: 'All extracted invoice data, cost allocations, vendor matching' },
        { name: 'Draw Management', type: 'input', description: 'Draw submissions, approvals, funding, G702/G703 data' },
        { name: 'Schedule Module', type: 'input', description: 'Tasks, durations, actual progress, critical path, variance, constraints' },
        { name: 'Daily Log AI', type: 'input', description: 'Work performed, manpower, issues, weather, photos' },
        { name: 'Vendor Intelligence', type: 'input', description: 'Vendor scores, payment history, bid accuracy, COI/license status, EMR' },
        { name: 'Estimates', type: 'input', description: 'Original estimates for accuracy comparison' },
        { name: 'Change Orders', type: 'input', description: 'All COs with type, value, schedule impact' },
        { name: 'Selections Module', type: 'input', description: 'Selection status, allowance vs actual, lead times' },
        { name: 'Lien Waiver AI', type: 'input', description: 'Waiver type, status, coverage, compliance' },
        { name: 'COI AI Extraction', type: 'input', description: 'Insurance coverage, limits, expiration, compliance, deficiencies' },
        { name: 'Permit AI Extraction', type: 'input', description: 'Permit status, inspections, expiration' },
        { name: 'Purchase Orders', type: 'input', description: 'PO commitments, expected delivery, invoiced amounts, 3-way match' },
        { name: 'Lead/Pipeline CRM', type: 'input', description: 'Leads, stages, probabilities, conversion history, stage transitions' },
        { name: 'Contracts', type: 'input', description: 'Contract terms, allowances, retainage, payment schedules' },
        { name: 'Photo AI', type: 'input', description: 'Client-suitable photos for progress reports and draw packages' },
        { name: 'HR / Time Tracking', type: 'input', description: 'Labor hours, burden rates, crew assignments, overtime, certifications' },
        { name: 'Equipment Module', type: 'input', description: 'Utilization, maintenance, cost allocation, rent vs own' },
        { name: 'Warranty Module', type: 'input', description: 'Claims, costs, resolution times, reserve utilization, defect types, SLA' },
        { name: 'Safety Module', type: 'input', description: 'Incidents, training, compliance metrics, OSHA logs' },
        { name: 'WIP Snapshots', type: 'input', description: 'Period-locked WIP data for revenue recognition' },
        { name: 'Backlog Snapshots', type: 'input', description: 'Historical backlog tracking for trend analysis' },
        { name: 'Cost Intelligence', type: 'input', description: 'Historical pricing, $/SF data, material trends, PPI data' },
        { name: 'Document Management', type: 'input', description: 'Files, revisions, transmittals, completeness status, approvals' },
        { name: 'RFIs + Submittals', type: 'input', description: 'Status, aging, cost/schedule impact, response times' },
        { name: 'Punch Lists', type: 'input', description: 'Items, status, aging, vendor assignment, close-out rate' },
        { name: 'Client Surveys', type: 'input', description: 'NPS, CSAT, satisfaction scores, referral tracking' },
        { name: 'Bid Management', type: 'input', description: 'Bid packages, responses, comparisons, award history, accuracy records' },
        { name: 'QuickBooks GL', type: 'input', description: 'General ledger transactions for reconciliation, trial balance, financial statements' },
        // Outputs
        { name: 'Email Distribution', type: 'output', description: 'Scheduled reports and AI briefings sent via email' },
        { name: 'Dashboard Widgets', type: 'output', description: 'Any report can generate a dashboard widget' },
        { name: 'Client Portal', type: 'output', description: 'Client-facing reports published to portal' },
        { name: 'QuickBooks', type: 'output', description: 'Financial reports synced with accounting system' },
        { name: 'Document Storage', type: 'output', description: 'Generated reports stored as documents' },
        { name: 'Lender Portal', type: 'output', description: 'Draw packages and WIP reports for construction lenders' },
        { name: 'External BI Tools', type: 'output', description: 'Dataset export to Power BI, Tableau, Excel pivot tables' },
        { name: 'Estimating Feedback', type: 'output', description: 'Estimate vs actual analysis feeds back to improve future estimates' },
      ]}
      dataFields={[
        // Report Configuration
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'name', type: 'string', required: true, description: 'Report name' },
        { name: 'report_type', type: 'string', required: true, description: 'Category: financial | tax | forecast | operational | scheduling | procurement | hr | compliance | client | pipeline | executive | warranty | document | custom' },
        { name: 'report_template', type: 'string', required: true, description: 'Template key: wip_schedule | job_cost | cash_flow_forecast | gl_trial_balance | certified_payroll | po_status | custom | etc.' },
        { name: 'parameters', type: 'jsonb', description: 'Report parameters: date range, job filter, vendor filter, cost code filter, trade filter, etc.' },
        { name: 'date_range_start', type: 'date', description: 'Report period start' },
        { name: 'date_range_end', type: 'date', description: 'Report period end' },
        { name: 'job_ids', type: 'uuid[]', description: 'Jobs included (null = all)' },
        { name: 'generated_at', type: 'timestamptz', description: 'When report was generated' },
        { name: 'generated_by', type: 'uuid', description: 'User who generated' },
        { name: 'file_url', type: 'string', description: 'Stored report file (PDF/Excel)' },
        { name: 'is_favorite', type: 'boolean', description: 'Pinned to favorites' },

        // Scheduling
        { name: 'schedule_frequency', type: 'string', description: 'daily | weekly | biweekly | monthly | quarterly | annually' },
        { name: 'schedule_day', type: 'integer', description: 'Day of week (1-7) or month (1-31)' },
        { name: 'schedule_time', type: 'time', description: 'Time to generate' },
        { name: 'recipients', type: 'jsonb', description: 'Email distribution list with stakeholder type per recipient' },
        { name: 'stakeholder_format', type: 'string', description: 'Formatting: bank | owner | accountant | client | pm | surety — controls field visibility' },

        // Custom Report Definition
        { name: 'data_sources', type: 'jsonb', required: false, description: 'For custom reports: [{domain, entity, alias}] — which tables to query' },
        { name: 'columns', type: 'jsonb', required: false, description: 'For custom reports: [{field, source, label, aggregate, format, width, sort_order, conditional_format}]' },
        { name: 'filters', type: 'jsonb', required: false, description: 'For custom reports: [{field, operator, value, conjunction}] with AND/OR support' },
        { name: 'grouping', type: 'jsonb', required: false, description: 'For custom reports: [{field, level, show_subtotals}] — multi-level grouping' },
        { name: 'calculated_fields', type: 'jsonb', required: false, description: 'For custom reports: [{name, formula, format}] — user-defined computed columns' },
        { name: 'chart_config', type: 'jsonb', required: false, description: 'Visualization: {type, x_axis, y_axis, series, colors, legend_position}' },
        { name: 'is_template', type: 'boolean', description: 'System template (built-in) vs user-created' },
        { name: 'cloned_from', type: 'uuid', description: 'Source report if cloned from a template' },
        { name: 'version', type: 'integer', description: 'Report definition version (incremented on each save)' },
        { name: 'folder_id', type: 'uuid', description: 'Organization folder (personal or shared)' },

        // AI Metadata
        { name: 'ai_summary', type: 'text', description: 'AI-generated executive summary of findings' },
        { name: 'ai_anomalies', type: 'jsonb', description: 'Array of detected anomalies with severity and recommendation' },
        { name: 'ai_trends', type: 'jsonb', description: 'Identified trends with direction, magnitude, and drivers' },
        { name: 'ai_generated_definition', type: 'boolean', description: 'True if report was created via natural language AI request' },
        { name: 'ai_prompt', type: 'text', description: 'Original natural language prompt if AI-generated' },
        { name: 'comparison_baseline', type: 'string', description: 'What to compare against: prior_period | prior_year | budget | industry_benchmark | similar_jobs' },

        // Snapshot/History
        { name: 'snapshot_id', type: 'uuid', description: 'Link to saved point-in-time snapshot for trend comparison' },
        { name: 'snapshot_data', type: 'jsonb', description: 'Frozen report results at time of snapshot' },

        // Access Control
        { name: 'visibility', type: 'string', description: 'personal | team | company' },
        { name: 'allowed_roles', type: 'jsonb', description: 'Roles that can view this report' },
        { name: 'created_by', type: 'uuid', description: 'Report creator' },

        // ── KEY DATA FIELDS CONSUMED BY REPORTS ──

        // WIP Schedule fields
        { name: 'wip_contract_value', type: 'decimal', description: 'Contract + approved COs' },
        { name: 'wip_estimated_total_cost', type: 'decimal', description: 'Projected total cost at completion' },
        { name: 'wip_costs_to_date', type: 'decimal', description: 'Actual costs incurred' },
        { name: 'wip_percent_complete', type: 'decimal', description: 'Cost-to-cost % complete' },
        { name: 'wip_earned_revenue', type: 'decimal', description: 'Revenue recognized to date' },
        { name: 'wip_billings_to_date', type: 'decimal', description: 'Total billed/drawn' },
        { name: 'wip_over_under_billing', type: 'decimal', description: 'Billings minus earned revenue' },
        { name: 'wip_estimated_gross_profit', type: 'decimal', description: 'Contract value minus estimated total cost' },
        { name: 'wip_profit_fade', type: 'decimal', description: 'Change in estimated gross profit vs prior period' },
        { name: 'wip_backlog', type: 'decimal', description: 'Contract value minus earned revenue' },

        // Forecasting fields
        { name: 'forecast_week', type: 'date', description: 'Forecast period start date' },
        { name: 'forecast_opening_balance', type: 'decimal', description: 'Beginning cash balance' },
        { name: 'forecast_expected_inflows', type: 'decimal', description: 'Expected draw receipts + other income' },
        { name: 'forecast_expected_outflows', type: 'decimal', description: 'Expected vendor payments + payroll + overhead' },
        { name: 'forecast_closing_balance', type: 'decimal', description: 'Projected ending balance' },
        { name: 'forecast_scenario', type: 'string', description: 'best_case | likely | worst_case' },
        { name: 'forecast_confidence', type: 'decimal', description: 'AI confidence in projection (0-1)' },

        // Cost Performance Index fields
        { name: 'cpi', type: 'decimal', description: 'Cost Performance Index: EV / AC (< 1.0 = over budget)' },
        { name: 'spi', type: 'decimal', description: 'Schedule Performance Index: EV / PV (< 1.0 = behind schedule)' },
        { name: 'eac', type: 'decimal', description: 'Estimate at Completion: BAC / CPI' },
        { name: 'etc', type: 'decimal', description: 'Estimate to Complete: EAC - AC' },
        { name: 'tcpi', type: 'decimal', description: 'To-Complete Performance Index: remaining work / remaining budget' },

        // GL / Accounting fields
        { name: 'gl_account_id', type: 'uuid', description: 'General ledger account reference' },
        { name: 'gl_debit', type: 'decimal', description: 'Debit amount' },
        { name: 'gl_credit', type: 'decimal', description: 'Credit amount' },
        { name: 'gl_balance', type: 'decimal', description: 'Running balance' },
        { name: 'fiscal_period', type: 'string', description: 'Fiscal year + month (e.g., 2026-02)' },

        // Labor / HR fields
        { name: 'employee_id', type: 'uuid', description: 'Employee reference for labor reports' },
        { name: 'regular_hours', type: 'decimal', description: 'Regular hours worked' },
        { name: 'overtime_hours', type: 'decimal', description: 'OT hours worked' },
        { name: 'base_rate', type: 'decimal', description: 'Base hourly rate' },
        { name: 'burden_rate', type: 'decimal', description: 'Fully burdened rate (base + taxes + insurance + benefits)' },
        { name: 'burden_multiplier', type: 'decimal', description: 'Burden as multiplier of base rate (typically 1.30-1.45)' },
        { name: 'wc_class_code', type: 'string', description: 'Workers comp classification code' },
        { name: 'prevailing_wage_rate', type: 'decimal', description: 'Required prevailing wage rate (Davis-Bacon)' },
        { name: 'fringe_benefit_rate', type: 'decimal', description: 'Required fringe benefit rate' },
      ]}
      aiFeatures={[
        {
          name: 'Executive Summary Generation',
          description: 'Every report includes AI-generated key findings. Financial: "WIP shows 2 jobs overbilled ($45K liability), 1 underbilled ($22K asset). Net position: $23K overbilled. Profit fade on Smith Residence: margin dropped from 18% to 14% — framing overrun is primary driver." Operational: "4 of 5 active jobs on schedule. Miller Addition 8 days behind — drywall delay. Vendor ABC Electric top performer at 95% on-time."',
          trigger: 'On every report generation'
        },
        {
          name: 'Anomaly Detection & Red Flags',
          description: 'Automatically flags unusual data across all report types. Financial: "Electrical costs 22% above similar projects." Operational: "3 consecutive failed inspections on plumbing — vendor quality issue." Compliance: "4 vendor COIs expire within 30 days, 2 are on active jobs." Forecasting: "Cash forecast shows negative balance in week 7 under likely scenario." HR: "Overtime on Miller Addition is 3x company average — investigate."',
          trigger: 'On report generation'
        },
        {
          name: 'Natural Language Queries',
          description: 'Ask questions in plain English across all data. "How much did we spend on ABC Electric this year?" -> "$245K across 4 jobs, 12% increase vs last year, best reliability score of all electrical subs." "Which jobs are overbilled?" -> "Smith ($28K) and Johnson ($17K) — both have draws submitted exceeding earned revenue." "What\'s my labor burden rate for carpenters?" -> "$68.50/hr fully burdened (base: $48, taxes: $7.20, WC: $6.80, benefits: $6.50)."',
          trigger: 'On demand'
        },
        {
          name: 'AI Custom Report Creation',
          description: 'Describe a report in plain English, AI builds the full definition. "Show me all vendors with COIs expiring in the next 60 days who are on active jobs" -> AI creates a cross-module report joining vendors + COI tracking + job assignments, with columns for vendor name, job, policy type, expiration date, days remaining, sorted by expiration. User can refine, save, and schedule.',
          trigger: 'On demand in custom report builder'
        },
        {
          name: 'Predictive Cash Flow Intelligence',
          description: 'Incorporates client payment behavior ("Jones typically pays 12 days late"), seasonal patterns ("Q1 collections average 8 days slower"), and upcoming events ("3 draws due for submission next week totaling $185K"). Suggests actions: "Accelerate Draw #5 on Smith to avoid week 7 cash gap."',
          trigger: 'Weekly rolling forecast + real-time alerts'
        },
        {
          name: 'Profit Fade Early Warning',
          description: 'Detects margin erosion before it becomes critical. "Smith Residence margin has faded $32K over 3 months. Primary drivers: framing labor +$18K (roof complexity), lumber +$9K (price volatility), change order delays +$5K (client decision lag). Recommend: submit CO for roof complexity, lock lumber pricing on remaining POs."',
          trigger: 'Monthly analysis with real-time monitoring'
        },
        {
          name: 'Estimating Accuracy Feedback',
          description: 'Compares actual costs to original estimates at granular level across completed and active jobs. "Your foundation estimates for elevated coastal homes are 12% low on average — pile depth consistently underestimated. Your window estimates are 8% high — negotiated volume discounts not reflected."',
          trigger: 'On job completion + quarterly analysis'
        },
        {
          name: 'Vendor Intelligence Scoring',
          description: 'Calculates composite vendor scores from objective data: on-time completion rate (25%), budget adherence (25%), quality score from punch/rework/callbacks (25%), financial compliance — invoice accuracy, lien waiver timeliness, COI currency (25%). Ranks vendors by trade with trend arrows.',
          trigger: 'On report generation, continuous scoring'
        },
        {
          name: 'Benchmark Comparison (NAHB)',
          description: 'Contextualizes your performance against industry benchmarks from NAHB Cost of Doing Business Study. "Your gross margin (20.7%) matches industry average. Top quartile is 29.7% — gap is primarily in framing and site work. Your AR days (28) beat industry avg (35)."',
          trigger: 'On KPI and profitability reports'
        },
        {
          name: 'What-If Scenario Modeling',
          description: 'Model scenarios across forecasting reports. Cash flow: "What if Jones delays payment 30 days?" Revenue: "What if we close the Miller lead ($1.2M)?" Cost: "What if lumber increases 15%?" Labor: "What if we add a second framing crew?"',
          trigger: 'On demand in forecast reports'
        },
        {
          name: 'Stakeholder-Specific Formatting',
          description: 'Same data, different presentation by audience. Bank: WIP + over/under billing + backlog + lien waiver compliance. Owner: profitability + cash forecast + risk items. Accountant: revenue recognition + AP/AR aging + 1099 + GL trial balance. Client: progress photos + schedule + selections. Surety: backlog + WIP + profit fade + bonding capacity.',
          trigger: 'On report export/distribution'
        },
        {
          name: 'Scheduled AI Briefing',
          description: 'Weekly email digest customized by role. Owner: draws submitted, invoices processed, jobs at risk, action items. PM: their jobs\' schedule/budget health, upcoming milestones, overdue items. Office: AP/AR aging, COI expirations, lien waiver gaps. Configurable frequency and content.',
          trigger: 'Weekly (configurable: daily/weekly/monthly)'
        },
        {
          name: 'Material Cost Intelligence',
          description: 'Tracks material price trends from actual invoice data and external PPI sources. "Lumber down 8% from Q3 peak — good time to lock framing POs. Copper up 12% YTD — electrical bids from 3+ months ago may be stale."',
          trigger: 'Monthly trend analysis + on-demand'
        },
        {
          name: 'Custom Report Suggestions',
          description: 'After generating any report, AI suggests related insights. After a Job Cost Report: "3 cost codes are trending over budget — want me to create a cost-to-complete forecast for those codes?" After an AR Aging report: "2 clients are consistently paying 15+ days late — want me to generate a collection priority report?"',
          trigger: 'Post-report generation'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────────┐
│ Reports, Analytics & Forecasting      [+ Custom Report] [Ask AI ▾]     │
├─────────────────────────────────────────────────────────────────────────┤
│ AI: "WIP shows $23K net overbilling. Cash forecast tight week 7.        │
│ 2 vendor COIs expire this week. Framing estimates trending 12% low."    │
├─────────────────────────────────────────────────────────────────────────┤
│ Categories: Financial | Tax | Forecasting | Operational | Scheduling    │
│   Procurement | HR & Workforce | Compliance | Client | Pipeline         │
│   Executive | Warranty | Documents | ★ Custom Reports                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  FINANCIAL (17)                FORECASTING (8)                          │
│  ┌───────────────┐ ┌────────┐ ┌───────────────┐ ┌────────────────┐     │
│  │ WIP Schedule  │ │ Job    │ │ Cash Flow     │ │ Cost-to-       │     │
│  │ Required by   │ │ Cost   │ │ 13-week       │ │ Complete       │     │
│  │ bank monthly  │ │ Report │ │ rolling       │ │ EAC by job     │     │
│  │ [Generate]    │ │ [Gen]  │ │ [Generate]    │ │ [Generate]     │     │
│  └───────────────┘ └────────┘ └───────────────┘ └────────────────┘     │
│  + Over/Under | Profit Fade   + Revenue | Backlog Burn | Schedule       │
│  + Cash Flow | AR/AP Aging    + Labor | Material | Pipeline             │
│  + Profitability (Job/Trade/Client) | Draws | Retainage | Backlog      │
│  + Revenue Rec | Committed | Change Orders | Est vs Actual              │
│                                                                         │
│  TAX & ACCOUNTING (9)          SCHEDULING (7)                          │
│  ┌───────────────┐ ┌────────┐ ┌───────────────┐ ┌────────────────┐     │
│  │ GL Trial      │ │ P&L    │ │ 3-Week        │ │ Critical       │     │
│  │ Balance       │ │ Income │ │ Lookahead     │ │ Path           │     │
│  │ [Generate]    │ │ [Gen]  │ │ [Generate]    │ │ [Generate]     │     │
│  └───────────────┘ └────────┘ └───────────────┘ └────────────────┘     │
│  + Balance Sheet | Sales Tax  + Weekly Work Plan | Variance              │
│  + Depreciation | 1099        + Weather Delays | Constraints | Forensic  │
│  + JC-to-GL Reconciliation    |                                         │
│  + Allowance Tracking         |                                         │
│                                                                         │
│  PROCUREMENT (7)    HR & WORKFORCE (8)   COMPLIANCE (10)               │
│  PO Status          Certified Payroll    Lien Waiver Matrix             │
│  3-Way Match        Labor Distribution   COI Tracking                   │
│  Vendor Price Comp  Overtime Analysis    Sub Prequalification           │
│  Spend Analysis     Labor Burden Rate    Workers Comp EMR               │
│  [View All →]       [View All →]         [View All →]                   │
│                                                                         │
│  WARRANTY (6)       DOCUMENTS (4)        EXECUTIVE (4)                 │
│  Service Requests   Transmittal Log      Multi-Job Dashboard            │
│  Cost by Trade      Drawing Revisions    Owner Weekly Briefing          │
│  Callback Rate      Completeness Matrix  KPI vs NAHB Benchmarks        │
│  [View All →]       [View All →]         [View All →]                   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ ★ CUSTOM REPORT BUILDER                                         │    │
│  │                                                                  │    │
│  │ [+ New Blank Report]  [Clone from Template ▾]  [Ask AI to Build] │    │
│  │                                                                  │    │
│  │ Saved Custom Reports:                                            │    │
│  │ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │    │
│  │ │ ★ Weekly PM       │ │ ★ Bank Package   │ │ ★ Sub Pay +     │  │    │
│  │ │   Report          │ │   (WIP+Draws+LW) │ │   Compliance    │  │    │
│  │ │   Auto: Mon 8am   │ │   Auto: 1st/mo   │ │   On demand     │  │    │
│  │ │   [Run] [Edit]    │ │   [Run] [Edit]    │ │   [Run] [Edit]  │  │    │
│  │ └──────────────────┘ └──────────────────┘ └──────────────────┘  │    │
│  │                                                                  │    │
│  │ Data Sources: Jobs | Budget | Invoices | POs | Schedule |        │    │
│  │ Daily Logs | Vendors | Clients | Leads | Documents | HR |        │    │
│  │ Selections | Draws | Change Orders | Warranties | ...            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Ask AI: "Which subs have lien waivers outstanding on active       │    │
│  │ jobs where the next draw is due within 2 weeks?"                  │    │
│  │  → Found 4 vendors across 3 jobs. ABC Electric owes conditional   │    │
│  │    waiver for Draw #3 on Smith. XYZ Plumbing owes final waiver   │    │
│  │    for Draw #5 on Johnson. [View Full Report] [Save as Custom]   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  SCHEDULED REPORTS                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ WIP Schedule     Monthly (1st)    → bank@lender.com (bank)       │    │
│  │ Cash Forecast    Weekly (Mon)     → jake@co.com (owner)          │    │
│  │ GL Trial Bal     Monthly (close)  → cpa@firm.com (accountant)    │    │
│  │ COI Expiration   Weekly (Fri)     → office@co.com (office)       │    │
│  │ Sub Pay Summary  Biweekly (Fri)   → ap@co.com (office)           │    │
│  │ Weekly PM Brief  Weekly (Mon)     → jake@co.com (owner)          │    │
│  │ ★ Bank Package   Monthly (1st)    → bank@lender.com (bank)       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ CUSTOM REPORT BUILDER — Editor View                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Data Sources        Columns                     Preview                │
│  ┌────────────┐     ┌──────────────────────┐    ┌───────────────────┐   │
│  │ □ Jobs     │     │ Drag fields here:    │    │ Job    | Vendor   │   │
│  │   ■ name   │     │ ┌──────────────────┐ │    │ -------|--------- │   │
│  │   ■ status │     │ │ Job Name         │ │    │ Smith  | ABC Elec │   │
│  │   □ addr   │     │ │ Vendor Name      │ │    │ Smith  | XYZ Plmb │   │
│  │ □ Invoices │     │ │ SUM(Amount)      │ │    │ Jones  | ABC Elec │   │
│  │   ■ amount │     │ │ COI Expiry Date  │ │    │        |          │   │
│  │   ■ status │     │ └──────────────────┘ │    │ Totals:  $245,000 │   │
│  │ □ Vendors  │     │                      │    └───────────────────┘   │
│  │   ■ name   │     │ Filters:             │                           │
│  │   □ trade  │     │ Status = Active       │    Chart: [Bar ▾]         │
│  │ □ COIs     │     │ Amount > $5,000       │    Group: [By Job ▾]      │
│  │   ■ expiry │     │ + Add Filter          │    Sort:  [Amount desc]   │
│  └────────────┘     └──────────────────────┘                           │
│                                                                         │
│  [+ Calculated Field]  [Conditional Format]  [Save] [Schedule] [Export] │
│                                                                         │
│  AI: "Based on your data sources, you might also want to add           │
│  'Days Until COI Expiry' as a calculated field and filter to            │
│  show only vendors with < 30 days remaining."  [Apply Suggestion]      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
