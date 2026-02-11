'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

export default function FinancialReportsPage() {
  return (
    <PageSpec
      title="Financial Reports"
      phase="Phase 2 - Reporting"
      planFile="views/financial/REPORTS.md"
      description="Generate standard and custom financial reports. Income statements, balance sheets, job cost reports, WIP schedules, and more. Export for accounting, banking, and tax purposes."
      workflow={['Select Report', 'Set Parameters', 'Generate', 'Review', 'Export/Share']}
      features={[
        'Work in Progress (WIP) report',
        'Job cost summary',
        'Job cost detail',
        'Income statement',
        'Cash flow statement',
        'AR aging report',
        'AP aging report',
        'Vendor payment history',
        'Subcontractor analysis',
        '1099 preparation',
        'Sales tax report',
        'Custom report builder',
        'Scheduled reports',
        'PDF/Excel export',
        'Email distribution',
        'Report templates',
      ]}
      connections={[
        { name: 'All Financial Data', type: 'input', description: 'All sources' },
        { name: 'Jobs', type: 'input', description: 'Job data' },
        { name: 'QuickBooks', type: 'bidirectional', description: 'Accounting data' },
        { name: 'Document Storage', type: 'output', description: 'Saved reports' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Report ID' },
        { name: 'report_type', type: 'string', required: true, description: 'Type of report' },
        { name: 'parameters', type: 'jsonb', description: 'Report parameters' },
        { name: 'date_range_start', type: 'date', description: 'Start date' },
        { name: 'date_range_end', type: 'date', description: 'End date' },
        { name: 'generated_at', type: 'timestamp', description: 'Generation time' },
        { name: 'generated_by', type: 'uuid', description: 'User who generated' },
        { name: 'file_url', type: 'string', description: 'Stored report file' },
        { name: 'schedule', type: 'jsonb', description: 'Recurring schedule' },
        { name: 'recipients', type: 'jsonb', description: 'Email distribution' },
      ]}
      aiFeatures={[
        {
          name: 'Report Recommendations',
          description: 'Suggests relevant reports. "Month-end approaching. Generate WIP report for bank covenant review?"',
          trigger: 'Calendar-based'
        },
        {
          name: 'Anomaly Highlighting',
          description: 'Flags unusual items in reports. "Job cost report: 3 cost codes significantly over budget highlighted."',
          trigger: 'On generation'
        },
        {
          name: 'Trend Analysis',
          description: 'Compares to historical reports. "Gross margin 2% below same period last year. Contributing factors..."',
          trigger: 'On report view'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Financial Reports                              [+ Custom Report]    │
├─────────────────────────────────────────────────────────────────────┤
│ STANDARD REPORTS                                                    │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 📊 Work in Progress (WIP)                                       │ │
│ │    Over/under billing analysis for all active jobs              │ │
│ │    Last run: Jan 15, 2025 | [Generate] [Schedule] [History]     │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ 📊 Job Cost Summary                                             │ │
│ │    Budget vs actual for all jobs                                │ │
│ │    Last run: Jan 20, 2025 | [Generate] [Schedule] [History]     │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ 📊 AP Aging Report                                              │ │
│ │    Outstanding payables by aging bucket                         │ │
│ │    Last run: Jan 22, 2025 | [Generate] [Schedule] [History]     │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ 📊 AR Aging Report                                              │ │
│ │    Outstanding receivables by aging bucket                      │ │
│ │    Last run: Jan 22, 2025 | [Generate] [Schedule] [History]     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ SCHEDULED REPORTS                                                   │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ WIP Report      Monthly (1st)    → jake@rossbuilt.com          │ │
│ │ Cash Flow       Weekly (Mon)     → accounting@rossbuilt.com    │ │
│ │ Job Cost Detail Monthly (15th)   → ops@rossbuilt.com           │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ 💡 AI: "Month-end in 3 days. WIP report due for bank review."      │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
