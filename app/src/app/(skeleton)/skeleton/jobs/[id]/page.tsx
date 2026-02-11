'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Jobs List', 'Job Dashboard', 'Budget', 'Schedule', 'Daily Logs', 'Photos', 'Files'
]

export default function JobDashboardSkeleton() {
  return (
    <PageSpec
      title="Job Dashboard"
      phase="Phase 0 - Foundation"
      planFile="views/jobs/JOB_DETAIL.md"
      description="Central hub for a single job. Overview of budget status, schedule progress, recent activity, and quick access to all job-related features."
      workflow={constructionWorkflow}
      features={[
        'Job header with status, client, address, key dates',
        'Budget summary: Contract, Costs, Billed, Profit',
        'Schedule progress with next milestones',
        'Recent activity feed (invoices, photos, logs)',
        'Quick action buttons: Add Invoice, Add Photo, Create Task',
        'Weather widget for job site location',
        'Team assignments and contact info',
        'Document shortcuts',
        'Client portal link',
        'Job-scoped navigation tabs',
      ]}
      connections={[
        { name: 'Jobs List', type: 'input', description: 'Navigation from jobs list' },
        { name: 'Budget', type: 'bidirectional', description: 'Budget summary and link to detail' },
        { name: 'Schedule', type: 'bidirectional', description: 'Schedule summary and link' },
        { name: 'Invoices', type: 'input', description: 'Recent invoices displayed' },
        { name: 'Photos', type: 'input', description: 'Recent photos shown' },
        { name: 'Daily Logs', type: 'input', description: 'Recent logs shown' },
        { name: 'Tasks', type: 'input', description: 'Pending tasks displayed' },
        { name: 'Client', type: 'input', description: 'Client info in header' },
        { name: 'Users', type: 'input', description: 'Team assignments' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'name', type: 'string', required: true, description: 'Job name' },
        { name: 'job_number', type: 'string', description: 'Reference number' },
        { name: 'status', type: 'string', required: true, description: 'Job status' },
        { name: 'address', type: 'string', description: 'Full address' },
        { name: 'client_id', type: 'uuid', description: 'FK to clients' },
        { name: 'contract_amount', type: 'decimal', description: 'Total contract' },
        { name: 'start_date', type: 'date', description: 'Start date' },
        { name: 'target_completion', type: 'date', description: 'Target completion' },
        { name: 'percent_complete', type: 'decimal', description: 'Progress %' },
      ]}
      aiFeatures={[
        { name: 'Health Score', description: 'AI calculates job health based on budget, schedule, and activity metrics', trigger: 'Real-time' },
        { name: 'Risk Alerts', description: 'Proactive warnings about budget overruns, schedule delays, or activity gaps', trigger: 'Continuous monitoring' },
        { name: 'Next Steps', description: 'AI suggests next actions based on project phase and pending items', trigger: 'On page load' },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ ← Jobs  |  Smith Residence                    ● Active   [Edit] [...] │
│ 123 Oak Street, Austin TX  |  Client: John Smith  |  PM: Jake R.     │
├─────────────────────────────────────────────────────────────────────┤
│ Tabs: Overview | Budget | Schedule | Invoices | Photos | Files       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐   │
│  │ BUDGET SUMMARY              │  │ SCHEDULE                    │   │
│  │ Contract:    $450,000       │  │ Progress: 65%               │   │
│  │ Costs:       $285,000       │  │ [████████████░░░░░░░░]      │   │
│  │ Billed:      $285,000       │  │                             │   │
│  │ Gross Profit: $165,000 (37%)│  │ Next: Drywall finishing     │   │
│  │ [View Budget →]             │  │ Due: Dec 20                 │   │
│  └─────────────────────────────┘  └─────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐   │
│  │ RECENT ACTIVITY             │  │ QUICK ACTIONS               │   │
│  │ • Invoice uploaded - 2h ago │  │ [+ Invoice] [+ Photo]       │   │
│  │ • Daily log - Yesterday     │  │ [+ Task] [+ Note]           │   │
│  │ • 4 photos added - Dec 15   │  │                             │   │
│  │ [View All →]                │  │ [Open Client Portal]        │   │
│  └─────────────────────────────┘  └─────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
