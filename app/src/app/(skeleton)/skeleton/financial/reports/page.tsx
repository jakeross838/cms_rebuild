'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { ReportsPreview } from '@/components/skeleton/previews/reports-preview'
import { cn } from '@/lib/utils'

const reportsWorkflow = ['Select Report', 'Set Parameters', 'Generate', 'Review', 'Export/Share']

export default function FinancialReportsPage() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button onClick={() => setActiveTab('preview')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'preview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <Eye className="h-4 w-4" />UI Preview
        </button>
        <button onClick={() => setActiveTab('spec')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'spec' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <BookOpen className="h-4 w-4" />Specification
        </button>
      </div>
      {activeTab === 'preview' ? <ReportsPreview /> : <PageSpec
      title="Financial Reports"
      phase="Phase 2 - Reporting"
      planFile="views/financial/REPORTS.md"
      description="Generate standard and custom financial reports. Income statements, balance sheets, job cost reports, WIP schedules, and more. Export for accounting, banking, and tax purposes."
      workflow={reportsWorkflow}
      features={[
        'Standard report library: 19+ reports across 5 categories (financial, tax, client-facing, company-wide, operations)',
        'Report categories: Financial (WIP, job cost, P&L, cash flow, AR/AP aging, retainage, vendor payments)',
        'Report categories: Tax & Accounting (1099 preparation, sales tax, insurance audit data)',
        'Report categories: Client-Facing (owner budget report, monthly update, draw request G702/G703)',
        'Report categories: Company-Wide (business performance, benchmarking, PM ranking)',
        'Custom report builder (drag-and-drop, data source selection, calculated fields)',
        'Report branding configuration (logo, colors, header/footer)',
        'Report access control (owner-only, management, team, specific roles)',
        'Client-facing vs internal audience selector per report',
        'AI-generated narrative summaries (Gap #456) on supported reports',
        'Data freshness timestamp on every report',
        'Period lock awareness (locked/unlocked data indicator)',
        'Scheduled reports with configurable frequency (daily/weekly/biweekly/monthly/quarterly)',
        'Conditional delivery (only send if criteria met, e.g., variance > 5%)',
        'Delivery tracking (sent, opened, not opened per recipient)',
        'Pause/resume schedules',
        'Multi-format export: PDF (branded), Excel (formulas), CSV (raw), Word (narrative)',
        'Bulk export as ZIP file',
        'Quick generate with report/period/job/audience selectors',
        'Report regeneration and redistribution with "corrected" label',
        'Report version history with parameter snapshots',
        'Cross-project benchmarking with industry comparison (Gap #455)',
        'Fiscal year-aware date ranges (Gap #433)',
      ]}
      connections={[
        { name: 'Budgets', type: 'input', description: 'Budget data, cost codes, variance' },
        { name: 'Invoices', type: 'input', description: 'Actual costs and revenue' },
        { name: 'Change Orders', type: 'input', description: 'CO impact on contract and budget' },
        { name: 'Purchase Orders', type: 'input', description: 'Committed costs and AP data' },
        { name: 'Draws', type: 'input', description: 'Draw amounts and status' },
        { name: 'Schedule', type: 'input', description: 'Progress for WIP and earned value' },
        { name: 'Jobs', type: 'input', description: 'Project data and PM assignments' },
        { name: 'Vendors', type: 'input', description: 'Vendor 1099 data, W-9 status' },
        { name: 'QuickBooks', type: 'bidirectional', description: 'GL accounts, synced data' },
        { name: 'Financial Settings', type: 'input', description: 'Fiscal year, WIP method, overhead rate' },
        { name: 'Period Locks', type: 'input', description: 'Locked period status' },
        { name: 'Client Portal', type: 'output', description: 'Client-facing reports published to portal' },
        { name: 'Document Storage', type: 'output', description: 'Generated report files' },
        { name: 'Notifications', type: 'output', description: 'Scheduled delivery via email' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Report definition ID' },
        { name: 'name', type: 'string', required: true, description: 'Report name' },
        { name: 'report_type', type: 'string', required: true, description: 'job_profitability | cash_flow | wip | ar_aging | ap_aging | 1099 | custom | ...' },
        { name: 'category', type: 'string', required: true, description: 'financial | tax | client_facing | company_wide | operations | custom' },
        { name: 'audience', type: 'string', description: 'internal | client | bank | both' },
        { name: 'access_roles', type: 'text[]', description: 'Roles that can view this report' },
        { name: 'data_sources', type: 'text[]', description: 'Data sources used (budgets, invoices, POs, etc.)' },
        { name: 'columns', type: 'jsonb', description: 'Field definitions and display order' },
        { name: 'filters', type: 'jsonb', description: 'Default filters (date range, project, status)' },
        { name: 'parameters', type: 'jsonb', description: 'Runtime parameters' },
        { name: 'date_range_start', type: 'date', description: 'Report start date' },
        { name: 'date_range_end', type: 'date', description: 'Report end date' },
        { name: 'include_ai_narrative', type: 'boolean', description: 'Include AI-generated summary' },
        { name: 'include_branding', type: 'boolean', description: 'Apply builder branding to output' },
        { name: 'generated_at', type: 'timestamp', description: 'Generation timestamp' },
        { name: 'generated_by', type: 'uuid', description: 'User who generated' },
        { name: 'data_freshness', type: 'timestamp', description: 'Most recent transaction included' },
        { name: 'file_urls', type: 'jsonb', description: 'Generated files by format (pdf, excel, csv)' },
        { name: 'schedule_type', type: 'string', description: 'daily | weekly | biweekly | monthly | quarterly' },
        { name: 'schedule_day', type: 'integer', description: 'Day of week (0-6) or month (1-31)' },
        { name: 'schedule_time', type: 'time', description: 'Delivery time' },
        { name: 'recipients', type: 'jsonb', description: 'Email distribution list' },
        { name: 'conditional_rules', type: 'jsonb', description: 'Conditions for delivery' },
        { name: 'is_active', type: 'boolean', description: 'Schedule active/paused' },
      ]}
      aiFeatures={[
        {
          name: 'Report Recommendations',
          description: 'Suggests relevant reports based on calendar and activity. "Month-end in 3 days. WIP due for bank. January period unlocked."',
          trigger: 'Calendar-based'
        },
        {
          name: 'AI Narrative Generation',
          description: 'LLM-powered narrative summaries for financial reports. "3 of 5 projects on budget. Smith Residence margin eroding. Cash tight in March."',
          trigger: 'On report generation (opt-in)'
        },
        {
          name: 'Anomaly Highlighting',
          description: 'Flags unusual items in generated reports. "Job cost report: 3 cost codes significantly over budget highlighted."',
          trigger: 'On generation'
        },
        {
          name: 'Trend Analysis',
          description: 'Compares to historical reports. "Gross margin 2% below same period last year. Contributing factors: framing labor, material costs."',
          trigger: 'On report view'
        },
        {
          name: 'Delivery Tracking',
          description: 'Monitors report engagement. "94% open rate. Job Cost Detail not opened by ops@rossbuilt.com last 2 deliveries."',
          trigger: 'On scheduled delivery'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Financial Reports                              [+ Custom Report]    │
├─────────────────────────────────────────────────────────────────────┤
│ STANDARD REPORTS                                                    │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Work in Progress (WIP)                                         │ │
│ │    Over/under billing analysis for all active jobs              │ │
│ │    Last run: Jan 15, 2025 | [Generate] [Schedule] [History]     │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ Job Cost Summary                                               │ │
│ │    Budget vs actual for all jobs                                │ │
│ │    Last run: Jan 20, 2025 | [Generate] [Schedule] [History]     │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ AP Aging Report                                                │ │
│ │    Outstanding payables by aging bucket                         │ │
│ │    Last run: Jan 22, 2025 | [Generate] [Schedule] [History]     │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ AR Aging Report                                                │ │
│ │    Outstanding receivables by aging bucket                      │ │
│ │    Last run: Jan 22, 2025 | [Generate] [Schedule] [History]     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ SCHEDULED REPORTS                                                   │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ WIP Report      Monthly (1st)    -> jake@rossbuilt.com          │ │
│ │ Cash Flow       Weekly (Mon)     -> accounting@rossbuilt.com    │ │
│ │ Job Cost Detail Monthly (15th)   -> ops@rossbuilt.com           │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ AI: "Month-end in 3 days. WIP report due for bank review."         │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
