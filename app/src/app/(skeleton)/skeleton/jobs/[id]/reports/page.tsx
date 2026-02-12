'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { ReportsPreview } from '@/components/skeleton/previews/reports-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Job Data', 'AI Analysis', 'Report Selection', 'Generate', 'Review', 'Export/Share'
]

export default function JobReportsSkeleton() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('preview')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'preview'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <Eye className="h-4 w-4" />
          UI Preview
        </button>
        <button
          onClick={() => setActiveTab('spec')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'spec'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <BookOpen className="h-4 w-4" />
          Specification
        </button>
      </div>

      {/* Content */}
      {activeTab === 'preview' ? (
        <ReportsPreview />
      ) : (
        <PageSpec
          title="Job Reports & Forecasting"
          phase="Phase 0 - Foundation"
          planFile="views/jobs/JOB_REPORTS.md"
          description="All reports scoped to a single job. 50+ built-in report types across financial, progress, scheduling, procurement, forecasting, client-facing, and closeout categories - plus a job-scoped custom report builder. Every report includes AI-generated insights specific to this job, with benchmarking against similar completed projects. Custom reports can query any data field on this job and be saved, scheduled, and shared."
          workflow={constructionWorkflow}
          features={[
            // JOB FINANCIAL REPORTS
            'JOB COST REPORT - The core report: cost code tree with Original Budget, Approved Changes, Revised Budget, Committed (POs), Actual (invoices), Projected (AI), Variance - drill-down to every linked PO, invoice, and change order per line',
            'BUDGET VS ACTUAL - Visual comparison with heat map variance indicators, selection variance overlay (estimated vs actual selection prices), trend lines showing burn rate vs schedule progress',
            'COMMITTED COST REPORT - All POs and subcontracts for this job: committed amount, invoiced to date, paid, remaining commitment, uncommitted budget per cost code',
            'CHANGE ORDER LOG - All COs for this job: number, description, type (client/builder/unforeseen), amount, schedule impact, status, cumulative total, CO as % of original contract',
            'DRAW PACKAGE (G702/G703) - Generate complete draw request: AIA G702 cover sheet with contract summary, G703 continuation sheet with schedule of values + per-line % complete, supporting documentation checklist',
            'DRAW HISTORY - All draws for this job: submitted/approved/funded dates, amounts, retainage, cumulative billed, remaining balance, days-to-fund tracking',
            'RETAINAGE SUMMARY - Retainage held by client + retainage owed to each sub: amounts, conditions for release, expected release dates',
            'LIEN WAIVER STATUS - Matrix: vendor rows x draw columns showing waiver type, received status, amount, outstanding waivers blocking payment',
            'INVOICE LOG - All invoices for this job: vendor, amount, PO match, cost code allocation, approval status, payment status, aging',
            'SUBCONTRACTOR PAYMENT SUMMARY - Per-sub on this job: contract amount, approved COs, invoiced, paid, retainage held, outstanding, lien waiver status, days-to-pay average',
            'ALLOWANCE TRACKING - Contract allowances vs actual spend per category: category, allowance amount, selected amount, variance, status, % used, remaining',

            // JOB PROGRESS & OPERATIONAL REPORTS
            'DAILY LOG REPORT - Formatted daily log with weather, work performed, manpower, deliveries, issues, photos - printable format',
            'WEEKLY PROGRESS REPORT - Tasks completed, in-progress, behind schedule, manpower summary, issues resolved/new, upcoming milestones, AI narrative summary, curated photos',
            'MONTHLY STATUS REPORT - Comprehensive: financial summary, schedule summary, quality summary, risk assessment, next month priorities',
            'MANPOWER REPORT - Daily/weekly headcount by vendor/trade, hours logged, labor cost by trade, productivity metrics',
            'VENDOR PERFORMANCE (JOB-SCOPED) - Per-vendor on this job: budget adherence, on-time %, punch items generated, invoice accuracy, lien waiver timeliness, overall score',

            // JOB SCHEDULING REPORTS
            'N-WEEK LOOKAHEAD - Rolling short-range schedule (configurable: 2/3/4/6 weeks) with tasks, assigned vendors/crews, constraint flags, printable for field distribution',
            'SCHEDULE VARIANCE REPORT - Planned vs actual for every task: start/finish variance, duration variance, critical path impact, delay cause categorization, SPI calculation',
            'CRITICAL PATH REPORT - Activities on critical and near-critical path, total float analysis, longest path, bottleneck identification, predicted completion date',

            // JOB FORECASTING
            'COST-TO-COMPLETE PROJECTION - Per cost code: costs to date, CPI, projected remaining cost, EAC (Estimate at Completion), variance from budget, AI confidence interval',
            'SCHEDULE COMPLETION PREDICTION - AI-predicted completion date vs contractual: SPI, risk factors, confidence intervals, comparison to similar completed jobs',
            'PROFITABILITY PROJECTION - Current margin % and projected final margin, margin trend over time, root cause analysis for variance',

            // CLIENT-FACING REPORTS
            'CLIENT PROGRESS REPORT - Filtered version for homeowner: schedule phase + % complete, curated photos, work completed, upcoming milestones, AI-generated narrative',
            'CLIENT BUDGET SUMMARY - Contract + approved COs + credits = current total, amount billed, amount paid, retainage held, balance remaining',
            'CLIENT SELECTION STATUS - By room then category: item, allowance, selected product, price, variance, status, days until deadline',

            // CUSTOM REPORT BUILDER
            'CUSTOM - Job-Scoped Report Builder: create custom reports from any data on this job',
            'CUSTOM - AI Report Creation: "Show me all vendors on this job with outstanding lien waivers and unpaid invoices" - AI builds the report instantly',

            // REPORT INFRASTRUCTURE
            'Comparison overlay: this job vs similar completed jobs (same SF range, foundation type, construction type)',
            'Export to PDF with branded template, Excel for accountant, CSV for raw data',
            'Email report to client, lender, team with stakeholder-appropriate formatting',
            'Report scheduling: auto-generate weekly progress or monthly status on a cadence',
            'AI confidence indicators on all projected/forecasted values',
          ]}
          connections={[
            { name: 'Job Record + Property Details', type: 'input', description: 'Job metadata, property attributes, status, team' },
            { name: 'Budget Lines', type: 'input', description: 'All budget lines with original, revised, committed, actual, projected' },
            { name: 'Invoice Extractions', type: 'input', description: 'All AI-extracted invoices allocated to this job' },
            { name: 'Purchase Orders', type: 'input', description: 'All POs for this job with commitment amounts, delivery dates, invoice matching' },
            { name: 'Draws', type: 'input', description: 'Draw history with G702/G703 data, status, funding dates' },
            { name: 'Change Orders', type: 'input', description: 'All COs with type, amount, schedule impact, approval status' },
            { name: 'Schedule Tasks', type: 'input', description: 'All tasks with planned/actual dates, dependencies, progress, constraints, float' },
            { name: 'Daily Logs', type: 'input', description: 'Work performed, manpower, issues, weather, photos - AI-extracted' },
            { name: 'Photos', type: 'input', description: 'AI-tagged photos with quality scores and client suitability' },
            { name: 'Selections', type: 'input', description: 'Selection status by room/category, allowance vs actual pricing' },
            { name: 'Lien Waivers', type: 'input', description: 'Waiver status per vendor per draw period' },
            { name: 'Client Portal', type: 'output', description: 'Client-facing reports published to portal' },
            { name: 'Lender', type: 'output', description: 'Draw packages and progress reports for construction lender' },
            { name: 'Email', type: 'output', description: 'Reports emailed to team, client, lender' },
            { name: 'Document Storage', type: 'output', description: 'Generated reports stored in job files' },
          ]}
          dataFields={[
            // Report Instance
            { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
            { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs - scoped to this job' },
            { name: 'report_template', type: 'string', required: true, description: 'Template: job_cost | budget_vs_actual | draw_package | schedule_variance | weekly_progress | etc.' },
            { name: 'parameters', type: 'jsonb', description: 'Report parameters: date range, cost code filter, vendor filter, trade filter' },
            { name: 'generated_at', type: 'timestamptz', description: 'Generation timestamp' },
            { name: 'generated_by', type: 'uuid', description: 'User who generated' },
            { name: 'file_url', type: 'string', description: 'Stored report file' },
            { name: 'stakeholder_format', type: 'string', description: 'bank | owner | pm | client | accountant | lender' },

            // Job Cost Report Fields
            { name: 'cost_code_id', type: 'uuid', description: 'Cost code for line-level detail' },
            { name: 'original_budget', type: 'decimal', description: 'Original estimate amount' },
            { name: 'approved_changes', type: 'decimal', description: 'Sum of approved COs for this code' },
            { name: 'revised_budget', type: 'decimal', description: 'Original + changes' },
            { name: 'committed', type: 'decimal', description: 'Sum of PO/subcontract amounts' },
            { name: 'actual', type: 'decimal', description: 'Sum of paid invoices' },
            { name: 'projected', type: 'decimal', description: 'AI-estimated final cost' },
            { name: 'variance', type: 'decimal', description: 'Revised - Projected (positive = under budget)' },

            // Earned Value / Performance
            { name: 'percent_complete', type: 'decimal', description: 'Schedule or cost-based % complete' },
            { name: 'cpi', type: 'decimal', description: 'Cost Performance Index (< 1.0 = over budget)' },
            { name: 'spi', type: 'decimal', description: 'Schedule Performance Index (< 1.0 = behind schedule)' },
            { name: 'eac', type: 'decimal', description: 'Estimate at Completion' },
            { name: 'ai_confidence', type: 'decimal', description: 'AI confidence in projection (0-1)' },

            // AI Metadata
            { name: 'ai_summary', type: 'text', description: 'AI-generated executive summary' },
            { name: 'ai_anomalies', type: 'jsonb', description: 'Detected anomalies with severity' },
            { name: 'similar_job_comparison', type: 'jsonb', description: 'Benchmark data from similar completed projects' },
          ]}
          aiFeatures={[
            {
              name: 'Job Health Score',
              description: 'Composite score (0-100) combining budget health (CPI), schedule health (SPI), documentation completeness, vendor performance, and compliance status.',
              trigger: 'Real-time, displayed on every job report'
            },
            {
              name: 'Cost-to-Complete Intelligence',
              description: 'Goes beyond simple CPI projection. Incorporates: committed costs not yet invoiced, known upcoming expenses, historical cost curves, seasonal pricing adjustments, and pending change orders.',
              trigger: 'On cost-to-complete report generation'
            },
            {
              name: 'Schedule Prediction Engine',
              description: 'Predicts completion date using: actual progress vs plan, historical duration data, weather forecast, vendor capacity, material lead times, and inspection backlog.',
              trigger: 'Weekly recalculation'
            },
            {
              name: 'Similar Job Benchmarking',
              description: 'Automatically finds comparable completed jobs and overlays performance. "Compared to 8 similar 3,500 SF elevated coastal homes: your framing cost is 12% higher (roof complexity)."',
              trigger: 'On cost and profitability reports'
            },
            {
              name: 'Draw Package Auto-Generation',
              description: 'AI pre-fills the entire G702/G703 from current budget and schedule data. Calculates per-line % complete from daily log progress, invoice amounts, and task completion.',
              trigger: 'On draw package generation'
            },
            {
              name: 'Variance Root Cause Analysis',
              description: 'When budget or schedule variance exceeds thresholds, AI explains why with linked evidence.',
              trigger: 'On variance reports when thresholds exceeded'
            },
            {
              name: 'Client Report AI Narrative',
              description: 'Generates natural-language progress narrative from structured data, filtered for client appropriateness.',
              trigger: 'On client progress report generation'
            },
            {
              name: 'AI Custom Report Builder',
              description: 'Describe any job-scoped report in plain English. AI creates the cross-module report joining invoices + lien waivers + POs, auto-filtered to this job.',
              trigger: 'On demand in custom report builder'
            },
          ]}
          mockupAscii={`
┌─────────────────────────────────────────────────────────────────────────┐
│ Job Reports - Smith Residence            Health: 78/100                  │
│ AI: "Schedule 8 days behind (drywall). Budget +$7K (framing roof).       │
│ 3 open constraints - window delivery is highest risk."                   │
├─────────────────────────────────────────────────────────────────────────┤
│ Categories: Financial | Progress | Scheduling | Procurement              │
│   Forecasting | Client | Closeout | Custom Reports                       │
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
│  │ Lien waivers: 8/9      │       │ [Generate]             │            │
│  │ [Generate G702/G703]   │       └────────────────────────┘            │
│  └────────────────────────┘                                             │
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
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ CUSTOM REPORTS                                                  │    │
│  │                                                                  │    │
│  │ [+ New Custom Report] [Clone from Template] [Ask AI to Build]    │    │
│  │                                                                  │    │
│  │ Ask AI: "Show me all cost codes where actual > 80% of budget     │    │
│  │ but schedule progress is < 60%"                                  │    │
│  │ -> Found 3 cost codes at risk of overrun before work completes.  │    │
│  │   [View Report] [Save as Custom]                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
`}
        />
      )}
    </div>
  )
}
