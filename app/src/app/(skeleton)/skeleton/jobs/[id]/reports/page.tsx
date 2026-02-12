'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Job Data', 'AI Analysis', 'Report Selection', 'Generate', 'Review', 'Export/Share'
]

export default function JobReportsSkeleton() {
  return (
    <PageSpec
      title="Job Reports & Forecasting"
      phase="Phase 0 - Foundation"
      planFile="views/jobs/JOB_REPORTS.md"
      description="All reports scoped to a single job. 50+ built-in report types across financial, progress, scheduling, procurement, forecasting, client-facing, and closeout categories — plus a job-scoped custom report builder. Every report includes AI-generated insights specific to this job, with benchmarking against similar completed projects. Custom reports can query any data field on this job and be saved, scheduled, and shared."
      workflow={constructionWorkflow}
      features={[
        // ══════════════════════════════════════════════════════════════
        // ── JOB FINANCIAL REPORTS (11 types) ──
        // ══════════════════════════════════════════════════════════════
        'JOB COST REPORT — The core report: cost code tree with Original Budget, Approved Changes, Revised Budget, Committed (POs), Actual (invoices), Projected (AI), Variance — drill-down to every linked PO, invoice, and change order per line',
        'BUDGET VS ACTUAL — Visual comparison with heat map variance indicators, selection variance overlay (estimated vs actual selection prices), trend lines showing burn rate vs schedule progress',
        'COMMITTED COST REPORT — All POs and subcontracts for this job: committed amount, invoiced to date, paid, remaining commitment, uncommitted budget per cost code',
        'CHANGE ORDER LOG — All COs for this job: number, description, type (client/builder/unforeseen), amount, schedule impact, status, cumulative total, CO as % of original contract',
        'DRAW PACKAGE (G702/G703) — Generate complete draw request: AIA G702 cover sheet with contract summary, G703 continuation sheet with schedule of values + per-line % complete, supporting documentation checklist (progress photos, lien waivers, inspection results)',
        'DRAW HISTORY — All draws for this job: submitted/approved/funded dates, amounts, retainage, cumulative billed, remaining balance, days-to-fund tracking',
        'RETAINAGE SUMMARY — Retainage held by client + retainage owed to each sub: amounts, conditions for release, expected release dates',
        'LIEN WAIVER STATUS — Matrix: vendor rows x draw columns showing waiver type, received status, amount, outstanding waivers blocking payment',
        'INVOICE LOG — All invoices for this job: vendor, amount, PO match, cost code allocation, approval status, payment status, aging',
        'SUBCONTRACTOR PAYMENT SUMMARY — Per-sub on this job: contract amount, approved COs, invoiced, paid, retainage held, outstanding, lien waiver status, days-to-pay average',
        'ALLOWANCE TRACKING — Contract allowances vs actual spend per category: category, allowance amount, selected amount, variance, status, % used, remaining — summary and detail views',

        // ══════════════════════════════════════════════════════════════
        // ── JOB PROGRESS & OPERATIONAL REPORTS (11 types) ──
        // ══════════════════════════════════════════════════════════════
        'DAILY LOG REPORT — Formatted daily log with weather, work performed, manpower, deliveries, issues, photos — printable format',
        'WEEKLY PROGRESS REPORT — Tasks completed, in-progress, behind schedule, manpower summary, issues resolved/new, upcoming milestones, AI narrative summary, curated photos',
        'MONTHLY STATUS REPORT — Comprehensive: financial summary (budget health, draw status, cash flow), schedule summary (% complete, variance, critical path), quality summary (inspection results, punch items), risk assessment, next month priorities',
        'MANPOWER REPORT — Daily/weekly headcount by vendor/trade, hours logged, labor cost by trade, productivity metrics (if planned hours exist)',
        'VENDOR PERFORMANCE (JOB-SCOPED) — Per-vendor on this job: budget adherence, on-time %, punch items generated, invoice accuracy, lien waiver timeliness, overall score with job-specific context',
        'PERMIT & INSPECTION STATUS — All permits for this job, required inspections with pass/fail/pending status, corrections needed, schedule impact, next inspection due',
        'RFI LOG — All RFIs for this job: number, subject, days open, response status, cost/schedule impact, drawing reference',
        'SUBMITTAL LOG — All submittals: spec section, status, review notes, lead time remaining, schedule dependency',
        'T&M (TIME & MATERIAL) LOG — T&M work tracked by day: labor hours by trade, material costs, equipment charges, markup applied, T&M invoice status — for cost-plus and T&M billing',
        'DAILY PHOTO REPORT — All photos for a date range organized by area/room, with captions and AI tagging, printable gallery format',
        'COMMUNICATION LOG — All messages, emails, and decisions for this job: date, participants, subject, decision made, action items, linked entities',

        // ══════════════════════════════════════════════════════════════
        // ── JOB SCHEDULING REPORTS (6 types) ──
        // ══════════════════════════════════════════════════════════════
        'N-WEEK LOOKAHEAD — Rolling short-range schedule (configurable: 2/3/4/6 weeks) with tasks, assigned vendors/crews, constraint flags, printable for field distribution and subcontractor coordination',
        'WEEKLY WORK PLAN — Planned vs accomplished tasks for the week, Percent Plan Complete (PPC), reasons for non-completion categorized, crew commitments',
        'SCHEDULE VARIANCE REPORT — Planned vs actual for every task: start/finish variance, duration variance, critical path impact, delay cause categorization (weather, vendor, material, client decision, inspection), SPI calculation',
        'CRITICAL PATH REPORT — Activities on critical and near-critical path, total float analysis, longest path, bottleneck identification, predicted completion date',
        'WEATHER DELAY LOG — Rain/wind days on this job, force majeure events, comparison to historical weather for this location, time extension justification documentation',
        'CONSTRAINT/ROADBLOCK LOG — Open constraints preventing task starts: materials not delivered, RFIs unanswered, submittals pending, permits not issued, inspections not scheduled, client decisions pending — with schedule impact and aging',

        // ══════════════════════════════════════════════════════════════
        // ── JOB PROCUREMENT REPORTS (4 types) ──
        // ══════════════════════════════════════════════════════════════
        'PURCHASE ORDER STATUS — All POs for this job: PO number, vendor, amount, status (open/partial/received/closed), delivery date vs actual, items outstanding',
        'PO VS INVOICE VARIANCE — 3-way match for this job: PO amount vs received vs invoiced per vendor, flags discrepancies requiring resolution',
        'MATERIAL DELIVERY SCHEDULE — Expected deliveries for this job: item, vendor, expected date, lead time, schedule task dependency, status (ordered/shipped/received)',
        'DOCUMENT COMPLETENESS — Required documents per phase for this job: required vs received vs missing, close-out readiness percentage, critical missing items flagged',

        // ══════════════════════════════════════════════════════════════
        // ── JOB FORECASTING (5 types) ──
        // ══════════════════════════════════════════════════════════════
        'COST-TO-COMPLETE PROJECTION — Per cost code: costs to date, CPI, projected remaining cost, EAC (Estimate at Completion), variance from budget, AI confidence interval — "Framing projected at $92K (90% confidence: $88K-$96K)"',
        'SCHEDULE COMPLETION PREDICTION — AI-predicted completion date vs contractual: SPI, risk factors (weather window, material lead times, vendor capacity, inspection backlog), confidence intervals, comparison to similar completed jobs',
        'PROFITABILITY PROJECTION — Current margin % and projected final margin, margin trend over time (profit fade/gain chart), root cause analysis for variance, comparison to estimate and to similar jobs',
        'CASH FLOW IMPACT — This job\'s projected cash needs: upcoming vendor payments, expected draw timing, retainage release schedule, net cash position contribution by month',
        'SELECTION IMPACT FORECAST — Pending selections and their budget impact: allowance remaining, likely overage/credit based on similar selections, deadline risk for schedule-dependent items',

        // ══════════════════════════════════════════════════════════════
        // ── CLIENT-FACING REPORTS (4 types) ──
        // ══════════════════════════════════════════════════════════════
        'CLIENT PROGRESS REPORT — Filtered version for homeowner: schedule phase + % complete, curated AI-selected photos, work completed this period, upcoming milestones, selection deadlines, AI-generated narrative (excludes internal costs, margins, issues)',
        'CLIENT BUDGET SUMMARY — Contract + approved COs + credits = current total, amount billed, amount paid, retainage held, balance remaining — NO cost, margin, or vendor pricing data',
        'CLIENT SELECTION STATUS — By room then category: item, allowance, selected product, price, variance, status (pending/ordered/received/installed), days until deadline',
        'CLIENT CHANGE ORDER PRESENTATION — Scope description, pricing at contract markup, schedule impact, before/after comparison, approval signature block',

        // ══════════════════════════════════════════════════════════════
        // ── CLOSEOUT REPORTS (5 types) ──
        // ══════════════════════════════════════════════════════════════
        'PUNCH LIST SUMMARY — All punch items grouped by room/trade: description, status, days open, assigned vendor, before/after photos, completion rate, projected close-out date',
        'FINAL COST ANALYSIS — Complete financial post-mortem: original estimate vs final cost by cost code, change order impact, profit fade timeline, lessons learned, comparison to similar jobs',
        'WARRANTY BINDER — Auto-compiled: all product warranties with registration numbers, manufacturer contacts, maintenance schedules; as-built drawings; paint schedule (room, color, code, sheen); appliance manuals; vendor emergency contacts; certificate of occupancy; final lien waivers',
        'PROJECT COMPLETION REPORT — Everything in one document: final cost analysis, schedule performance, vendor ratings, quality summary (punch close-out stats), client satisfaction, photos timeline, key decisions log, lessons learned for future estimates',
        'AS-BUILT DOCUMENTATION STATUS — All as-built documents: drawings received vs required, O&M manuals, attic stock lists, product data sheets, test/balance reports — completeness percentage and missing items',

        // ══════════════════════════════════════════════════════════════
        // ── JOB CUSTOM REPORT BUILDER ──
        // ══════════════════════════════════════════════════════════════
        'CUSTOM — Job-Scoped Report Builder: create custom reports from any data on this job — budget, invoices, POs, schedule, daily logs, photos, selections, change orders, draws, documents, RFIs, submittals, vendors, punch list, warranties',
        'CUSTOM — Field Picker: browse all job data by domain, drag fields to columns, add filters, grouping, calculated fields — same full builder as company level but auto-scoped to this job',
        'CUSTOM — AI Report Creation: "Show me all vendors on this job with outstanding lien waivers and unpaid invoices" — AI builds the report instantly',
        'CUSTOM — Clone from Template: start from any built-in job report, modify columns/filters, save as custom — e.g., clone Job Cost Report and add selection variance columns',
        'CUSTOM — Save & Schedule: save job-level custom reports, schedule auto-generation (e.g., weekly progress report every Friday), email to team/client/lender',
        'CUSTOM — Cross-Report Dashboard: compose multiple report widgets on a single job dashboard view — e.g., budget health + schedule status + recent photos + upcoming milestones',

        // ══════════════════════════════════════════════════════════════
        // ── REPORT INFRASTRUCTURE ──
        // ══════════════════════════════════════════════════════════════
        'Comparison overlay: this job vs similar completed jobs (same SF range, foundation type, construction type)',
        'Export to PDF with branded template, Excel for accountant, CSV for raw data',
        'Email report to client, lender, team with stakeholder-appropriate formatting',
        'Report scheduling: auto-generate weekly progress or monthly status on a cadence',
        'Historical report access: every generated report stored with timestamp',
        'AI confidence indicators on all projected/forecasted values',
        'Drill-through from any summary line to source records (invoices, POs, daily logs)',
      ]}
      connections={[
        // Inputs
        { name: 'Job Record + Property Details', type: 'input', description: 'Job metadata, property attributes, status, team' },
        { name: 'Budget Lines', type: 'input', description: 'All budget lines with original, revised, committed, actual, projected' },
        { name: 'Invoice Extractions', type: 'input', description: 'All AI-extracted invoices allocated to this job' },
        { name: 'Purchase Orders', type: 'input', description: 'All POs for this job with commitment amounts, delivery dates, invoice matching' },
        { name: 'Draws', type: 'input', description: 'Draw history with G702/G703 data, status, funding dates' },
        { name: 'Change Orders', type: 'input', description: 'All COs with type, amount, schedule impact, approval status' },
        { name: 'Schedule Tasks', type: 'input', description: 'All tasks with planned/actual dates, dependencies, progress, constraints, float' },
        { name: 'Daily Logs', type: 'input', description: 'Work performed, manpower, issues, weather, photos — AI-extracted' },
        { name: 'Photos', type: 'input', description: 'AI-tagged photos with quality scores and client suitability' },
        { name: 'Selections', type: 'input', description: 'Selection status by room/category, allowance vs actual pricing' },
        { name: 'Lien Waivers', type: 'input', description: 'Waiver status per vendor per draw period' },
        { name: 'Permits + Inspections', type: 'input', description: 'Permit status, inspection results, schedule dependencies' },
        { name: 'RFIs + Submittals', type: 'input', description: 'Status logs with aging, cost/schedule impact' },
        { name: 'Contract', type: 'input', description: 'Contract terms, allowances, retainage %, payment schedule' },
        { name: 'Punch List', type: 'input', description: 'Items with status, before/after photos, aging' },
        { name: 'Warranties', type: 'input', description: 'Product warranties, registration numbers, maintenance schedules' },
        { name: 'Vendor Intelligence', type: 'input', description: 'Vendor scores scoped to this job' },
        { name: 'Cost Intelligence', type: 'input', description: 'Historical $/SF, similar job data for benchmarking' },
        { name: 'Weather Data', type: 'input', description: 'Historical and forecast weather for schedule variance and delay attribution' },
        { name: 'Time Entries', type: 'input', description: 'Employee labor hours, burden rates, cost allocations on this job' },
        { name: 'Messages + Emails', type: 'input', description: 'Communication history, decisions, action items on this job' },
        { name: 'Documents', type: 'input', description: 'All files, revisions, transmittals, approval status for this job' },
        // Outputs
        { name: 'Client Portal', type: 'output', description: 'Client-facing reports published to portal' },
        { name: 'Lender', type: 'output', description: 'Draw packages and progress reports for construction lender' },
        { name: 'Company Reports', type: 'output', description: 'Job data feeds company-wide aggregated reports' },
        { name: 'Email', type: 'output', description: 'Reports emailed to team, client, lender' },
        { name: 'Document Storage', type: 'output', description: 'Generated reports stored in job files' },
        { name: 'Estimating Feedback', type: 'output', description: 'Final cost analysis feeds estimating accuracy improvement' },
        { name: 'Job Dashboard Widgets', type: 'output', description: 'Custom report widgets embeddable on job dashboard' },
      ]}
      dataFields={[
        // Report Instance
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs — scoped to this job' },
        { name: 'report_template', type: 'string', required: true, description: 'Template: job_cost | budget_vs_actual | draw_package | schedule_variance | weekly_progress | monthly_status | cost_to_complete | client_progress | lookahead | custom | etc.' },
        { name: 'parameters', type: 'jsonb', description: 'Report parameters: date range, cost code filter, vendor filter, trade filter' },
        { name: 'generated_at', type: 'timestamptz', description: 'Generation timestamp' },
        { name: 'generated_by', type: 'uuid', description: 'User who generated' },
        { name: 'file_url', type: 'string', description: 'Stored report file' },
        { name: 'stakeholder_format', type: 'string', description: 'bank | owner | pm | client | accountant | lender' },

        // Custom Report Fields
        { name: 'data_sources', type: 'jsonb', description: 'For custom: [{domain, entity, alias}] — auto-scoped to this job' },
        { name: 'columns', type: 'jsonb', description: 'For custom: [{field, source, label, aggregate, format, conditional_format}]' },
        { name: 'filters', type: 'jsonb', description: 'For custom: [{field, operator, value, conjunction}]' },
        { name: 'grouping', type: 'jsonb', description: 'For custom: [{field, level, show_subtotals}]' },
        { name: 'calculated_fields', type: 'jsonb', description: 'For custom: [{name, formula, format}]' },
        { name: 'chart_config', type: 'jsonb', description: 'Visualization: {type, x_axis, y_axis, series, colors}' },
        { name: 'is_custom', type: 'boolean', description: 'True if user-created custom report' },
        { name: 'cloned_from', type: 'uuid', description: 'Source template if cloned' },
        { name: 'version', type: 'integer', description: 'Report definition version' },

        // Job Cost Report Fields
        { name: 'cost_code_id', type: 'uuid', description: 'Cost code for line-level detail' },
        { name: 'original_budget', type: 'decimal', description: 'Original estimate amount' },
        { name: 'approved_changes', type: 'decimal', description: 'Sum of approved COs for this code' },
        { name: 'revised_budget', type: 'decimal', description: 'Original + changes' },
        { name: 'committed', type: 'decimal', description: 'Sum of PO/subcontract amounts' },
        { name: 'actual', type: 'decimal', description: 'Sum of paid invoices' },
        { name: 'projected', type: 'decimal', description: 'AI-estimated final cost' },
        { name: 'variance', type: 'decimal', description: 'Revised - Projected (positive = under budget)' },
        { name: 'uncommitted_budget', type: 'decimal', description: 'Revised - Committed (positive = room remaining)' },

        // Earned Value / Performance
        { name: 'percent_complete', type: 'decimal', description: 'Schedule or cost-based % complete' },
        { name: 'cpi', type: 'decimal', description: 'Cost Performance Index (< 1.0 = over budget)' },
        { name: 'spi', type: 'decimal', description: 'Schedule Performance Index (< 1.0 = behind schedule)' },
        { name: 'eac', type: 'decimal', description: 'Estimate at Completion' },
        { name: 'etc', type: 'decimal', description: 'Estimate to Complete (remaining cost)' },
        { name: 'ai_confidence', type: 'decimal', description: 'AI confidence in projection (0-1)' },

        // G702/G703 Fields
        { name: 'g702_original_contract', type: 'decimal', description: 'Original contract sum' },
        { name: 'g702_net_changes', type: 'decimal', description: 'Net change by change orders' },
        { name: 'g702_contract_to_date', type: 'decimal', description: 'Current contract sum' },
        { name: 'g702_total_completed', type: 'decimal', description: 'Total completed and stored to date' },
        { name: 'g702_retainage', type: 'decimal', description: 'Retainage amount' },
        { name: 'g702_total_earned_less_retainage', type: 'decimal', description: 'Earned minus retainage' },
        { name: 'g702_previous_certificates', type: 'decimal', description: 'Previously certified payments' },
        { name: 'g702_current_payment_due', type: 'decimal', description: 'Current draw amount' },
        { name: 'g702_balance_to_finish', type: 'decimal', description: 'Remaining plus retainage' },
        { name: 'g703_sov_lines', type: 'jsonb', description: 'Schedule of values: [{item, description, scheduled_value, previous_pct, this_period_pct, stored_materials, total_pct, balance, retainage}]' },

        // Schedule Variance Fields
        { name: 'task_id', type: 'uuid', description: 'Schedule task reference' },
        { name: 'planned_start', type: 'date', description: 'Originally scheduled start' },
        { name: 'actual_start', type: 'date', description: 'Actual start date' },
        { name: 'planned_finish', type: 'date', description: 'Originally scheduled finish' },
        { name: 'actual_finish', type: 'date', description: 'Actual or projected finish' },
        { name: 'duration_variance_days', type: 'integer', description: 'Actual minus planned duration' },
        { name: 'is_critical_path', type: 'boolean', description: 'On critical path' },
        { name: 'total_float', type: 'integer', description: 'Total float in days (0 = critical)' },
        { name: 'delay_cause', type: 'string', description: 'weather | vendor | material | client_decision | inspection | design | other' },

        // Lookahead Fields
        { name: 'lookahead_weeks', type: 'integer', description: 'Number of weeks in lookahead (2, 3, 4, or 6)' },
        { name: 'constraint_type', type: 'string', description: 'material | rfi | submittal | permit | inspection | decision | predecessor | other' },
        { name: 'constraint_description', type: 'string', description: 'Description of what is blocking the task' },
        { name: 'constraint_resolved', type: 'boolean', description: 'Whether the constraint has been resolved' },
        { name: 'ppc_score', type: 'decimal', description: 'Percent Plan Complete for Last Planner reporting' },

        // Profitability Tracking
        { name: 'original_estimated_margin_pct', type: 'decimal', description: 'Margin at estimate time' },
        { name: 'current_projected_margin_pct', type: 'decimal', description: 'Current projected margin' },
        { name: 'margin_fade_amount', type: 'decimal', description: 'Dollar change in projected profit vs original estimate' },
        { name: 'margin_fade_pct', type: 'decimal', description: 'Percentage point change in margin' },
        { name: 'fade_drivers', type: 'jsonb', description: 'Array of {category, amount, description} explaining margin change' },

        // Allowance Tracking Fields
        { name: 'allowance_category', type: 'string', description: 'Allowance category (e.g., flooring, appliances, lighting, plumbing fixtures)' },
        { name: 'allowance_amount', type: 'decimal', description: 'Contract allowance amount' },
        { name: 'selected_amount', type: 'decimal', description: 'Actual selected/spent amount' },
        { name: 'allowance_variance', type: 'decimal', description: 'Allowance - Selected (positive = under, negative = over)' },
        { name: 'allowance_pct_used', type: 'decimal', description: 'Percentage of allowance consumed' },

        // AI Metadata
        { name: 'ai_summary', type: 'text', description: 'AI-generated executive summary' },
        { name: 'ai_anomalies', type: 'jsonb', description: 'Detected anomalies with severity' },
        { name: 'similar_job_comparison', type: 'jsonb', description: 'Benchmark data from similar completed projects' },
        { name: 'ai_generated_definition', type: 'boolean', description: 'True if custom report was AI-generated from natural language' },
        { name: 'ai_prompt', type: 'text', description: 'Original natural language request if AI-generated' },
      ]}
      aiFeatures={[
        {
          name: 'Job Health Score',
          description: 'Composite score (0-100) combining budget health (CPI), schedule health (SPI), documentation completeness, vendor performance, and compliance status. "Smith Residence: 78/100. Budget: 85 (slightly over on framing). Schedule: 72 (8 days behind on drywall). Docs: 90 (1 missing lien waiver). Compliance: 95 (all permits current)."',
          trigger: 'Real-time, displayed on every job report'
        },
        {
          name: 'Cost-to-Complete Intelligence',
          description: 'Goes beyond simple CPI projection. Incorporates: committed costs not yet invoiced, known upcoming expenses (scheduled deliveries, pending POs), historical cost curves for this project type, seasonal pricing adjustments, and pending change orders. "EAC for framing: $92K (budget: $85K). Remaining: $27K in committed POs + estimated $5K uncommitted. Confidence: 85%."',
          trigger: 'On cost-to-complete report generation'
        },
        {
          name: 'Schedule Prediction Engine',
          description: 'Predicts completion date using: actual progress vs plan, historical duration data for remaining trades, weather forecast for outdoor tasks, vendor capacity, material lead times for pending submittals, and inspection backlog for the jurisdiction. "Predicted completion: March 15 (contractual: March 1). 85% confidence. Primary risk: window delivery (8 weeks out, ordered 2 weeks late)."',
          trigger: 'Weekly recalculation'
        },
        {
          name: 'Similar Job Benchmarking',
          description: 'Automatically finds comparable completed jobs (matching on: SF range +/-20%, same foundation type, same construction type, same region) and overlays performance. "Compared to 8 similar 3,500 SF elevated coastal homes: your framing cost is 12% higher (roof complexity), electrical is 5% lower (good sub), overall $/SF is $285 vs avg $278."',
          trigger: 'On cost and profitability reports'
        },
        {
          name: 'Draw Package Auto-Generation',
          description: 'AI pre-fills the entire G702/G703 from current budget and schedule data. Calculates per-line % complete from daily log progress, invoice amounts, and task completion. Attaches relevant photos, collects lien waiver status, flags missing documents. "Draw #4 ready: $65K gross, $3,250 retainage, $61,750 net. Missing: ABC Electric lien waiver for this period."',
          trigger: 'On draw package generation'
        },
        {
          name: 'Variance Root Cause Analysis',
          description: 'When budget or schedule variance exceeds thresholds, AI explains why with linked evidence. Budget: "Electrical $8K over: $5K from 15 additional outlets (CO #3, approved), $3K from copper price increase (invoices #1847, #1923)." Schedule: "Drywall 8 days behind: 3 days weather (daily logs Dec 5-7), 5 days from late window delivery (PO #2045)."',
          trigger: 'On variance reports when thresholds exceeded'
        },
        {
          name: 'Client Report AI Narrative',
          description: 'Generates natural-language progress narrative from structured data, filtered for client appropriateness. "Great progress this week! The framing crew completed the second floor walls and began roof trusses. Your kitchen cabinets arrived on schedule — installation begins next Tuesday."',
          trigger: 'On client progress report generation'
        },
        {
          name: 'Closeout Intelligence',
          description: 'At project closeout, AI generates comprehensive final analysis. Compares every cost code to original estimate, identifies systemic estimating gaps, rates every vendor, calculates actual $/SF vs estimated, and generates lessons learned. "Key takeaway: elevated coastal homes need 15% more in foundation budget."',
          trigger: 'On project completion report generation'
        },
        {
          name: 'AI Custom Report Builder',
          description: 'Describe any job-scoped report in plain English. "Show me all invoices from vendors who have outstanding lien waivers, with the PO they match to and whether the PO amount matches" — AI creates the cross-module report joining invoices + lien waivers + POs, auto-filtered to this job. Suggests additional useful columns and filters.',
          trigger: 'On demand in custom report builder'
        },
        {
          name: 'Constraint & Risk Intelligence',
          description: 'Analyzes the constraint/roadblock log and predicts schedule impact. "3 open constraints on this job: unanswered RFI #12 (blocking electrical rough-in, 5 day impact), pending tile submittal (blocking tile install, 12 day lead time), client has not selected master bath fixtures (blocking plumbing trim, 8 day impact). Total potential delay: 12 days if not resolved by Feb 20."',
          trigger: 'On lookahead and constraint reports'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────────┐
│ Job Reports - Smith Residence            Health: 78/100 [●●●●○]         │
│ AI: "Schedule 8 days behind (drywall). Budget +$7K (framing roof).      │
│ 3 open constraints — window delivery is highest risk."                   │
├─────────────────────────────────────────────────────────────────────────┤
│ Categories: Financial | Progress | Scheduling | Procurement              │
│   Forecasting | Client | Closeout | ★ Custom Reports                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  FINANCIAL (11)                    PROGRESS & OPERATIONAL (11)          │
│  ┌────────────────────────┐       ┌────────────────────────┐            │
│  │ Job Cost Report        │       │ Weekly Progress        │            │
│  │ Budget: $450K          │       │ Week of Feb 3-7        │            │
│  │ Actual: $285K          │       │ 12 tasks completed     │            │
│  │ Projected: $457K       │       │ 2 behind schedule      │            │
│  │ [Generate] [Detail]    │       │ [Generate]             │            │
│  └────────────────────────┘       └────────────────────────┘            │
│  ┌────────────────────────┐       ┌────────────────────────┐            │
│  │ Draw Package (#4)      │       │ Manpower Report        │            │
│  │ Amount: $65,000        │       │ 14 workers on site     │            │
│  │ Retainage: $3,250      │       │ 6 trades active        │            │
│  │ Lien waivers: 8/9 ⚠   │       │ [Generate]             │            │
│  │ [Generate G702/G703]   │       └────────────────────────┘            │
│  └────────────────────────┘       + Daily Logs | Communication          │
│  + Committed | Change Orders      + RFI Log | Submittal Log             │
│  + Sub Payments | Allowances      + T&M Log | Vendor Perf | Photos      │
│  + Retainage | Lien Waivers       + Permits & Inspections               │
│                                                                         │
│  SCHEDULING (6)                    PROCUREMENT (4)                      │
│  ┌──────────────────────────┐     ┌──────────────────────────┐          │
│  │ 3-Week Lookahead        │     │ PO Status               │          │
│  │ 18 tasks in window      │     │ 12 open POs ($145K)     │          │
│  │ 3 constraints ⚠         │     │ 2 overdue deliveries ⚠  │          │
│  │ [Generate] [Print]      │     │ [Generate]              │          │
│  └──────────────────────────┘     └──────────────────────────┘          │
│  + Weekly Work Plan (PPC)         + 3-Way Match | Deliveries            │
│  + Schedule Variance | Crit Path  + Document Completeness               │
│  + Weather Delays | Constraints                                         │
│                                                                         │
│  FORECASTING (5)                                                        │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │ Cost-to-Complete                    Schedule Prediction       │       │
│  │ EAC: $457K (budget: $450K)          Predicted: Mar 15        │       │
│  │ CPI: 0.97 (slightly over)           Contractual: Mar 1       │       │
│  │ Confidence: 85%                     Confidence: 80%          │       │
│  │                                                               │       │
│  │ AI: "Framing trending $12K over. $7K from approved CO for    │       │
│  │ roof complexity. $5K from lumber price increase. Remaining    │       │
│  │ trades on track. 3 constraints need resolution by Feb 20."   │       │
│  └──────────────────────────────────────────────────────────────┘       │
│  + Profitability | Cash Flow Impact | Selection Impact                  │
│                                                                         │
│  CLIENT REPORTS              CLOSEOUT (when applicable)                 │
│  [Progress Report]           [Punch List Summary]                       │
│  [Budget Summary]            [Final Cost Analysis]                      │
│  [Selection Status]          [Warranty Binder]                          │
│  [Change Order Pres.]        [Completion Report]                        │
│                              [As-Built Doc Status]                      │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ ★ CUSTOM REPORTS                                                 │    │
│  │                                                                  │    │
│  │ [+ New Custom Report] [Clone from Template ▾] [Ask AI to Build]  │    │
│  │                                                                  │    │
│  │ Saved Custom Reports for This Job:                               │    │
│  │ ┌──────────────────┐ ┌──────────────────┐                       │    │
│  │ │ ★ Lender Package │ │ ★ Weekly Team    │                       │    │
│  │ │   (Draws+WIP+LW) │ │   Status         │                       │    │
│  │ │   [Run] [Edit]   │ │   [Run] [Edit]   │                       │    │
│  │ └──────────────────┘ └──────────────────┘                       │    │
│  │                                                                  │    │
│  │ Ask AI: "Show me all cost codes where actual > 80% of budget     │    │
│  │ but schedule progress is < 60%"                                  │    │
│  │ → Found 3 cost codes at risk of overrun before work completes.   │    │
│  │   [View Report] [Save as Custom]                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
