'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { JobOverviewPreview } from '@/components/skeleton/previews/job-overview-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Jobs List', 'Job Dashboard', 'Budget', 'Schedule', 'Daily Logs', 'Photos', 'Files'
]

export default function JobDashboardSkeleton() {
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
        <JobOverviewPreview />
      ) : (
        <PageSpec
          title="Job Dashboard"
          phase="Phase 0 - Foundation"
          planFile="views/jobs/JOB_DETAIL.md"
          description="Central hub for a single job. Overview of budget status, schedule progress, recent activity, weather, team roster, risk register, milestone tracker, and quick access to all job-related features. AI health score and predicted completion date displayed prominently."
          workflow={constructionWorkflow}
          features={[
            'Job header with status, client, address, key dates, AI health score (GAP-645)',
            'Budget summary: Contract, Costs, Billed, Profit with drill-down links',
            'Schedule progress with key milestone tracker and AI-predicted dates (GAP-653)',
            'Recent activity feed with cross-module ref IDs (invoices, photos, logs, inspections, selections, punch-list)',
            'Quick action buttons: Add Invoice, Add Photo, Create Task, Add Log, plus 12 quick links with badge counts',
            'Weather widget with 3-day forecast and outdoor risk flags (GAP-656)',
            'Team roster with PM, superintendent, and active vendor/trade assignments (GAP-652)',
            'Risk register with AI-detected and manual risk items, likelihood/impact matrix (GAP-654)',
            'Quick stats: days since start, days remaining, predicted completion date (GAP-657)',
            'Project metadata: type, square footage, lot/subdivision, warranty status',
            'Client contact links: phone and email direct from header',
            'Document shortcuts and client portal link',
            'Job-scoped navigation tabs',
          ]}
          connections={[
            { name: 'Jobs List', type: 'input', description: 'Navigation from jobs list' },
            { name: 'Budget', type: 'bidirectional', description: 'Budget summary with drill-down to detail' },
            { name: 'Schedule', type: 'bidirectional', description: 'Milestone tracker and schedule summary' },
            { name: 'Invoices', type: 'input', description: 'Recent invoices with ref IDs' },
            { name: 'Photos', type: 'input', description: 'Recent photos shown in activity' },
            { name: 'Daily Logs', type: 'input', description: 'Recent logs shown in activity' },
            { name: 'Tasks', type: 'input', description: 'Pending tasks displayed' },
            { name: 'Client', type: 'input', description: 'Client info, contact links in header' },
            { name: 'Users', type: 'input', description: 'Team roster assignments' },
            { name: 'Weather API', type: 'input', description: '3-day forecast for job site location (NOAA)' },
            { name: 'Change Orders', type: 'input', description: 'CO count and amounts in activity' },
            { name: 'Selections', type: 'input', description: 'Selection activity items' },
            { name: 'Punch List', type: 'input', description: 'Punch list activity items' },
            { name: 'Permits', type: 'input', description: 'Permit/inspection status in activity' },
            { name: 'Vendors', type: 'input', description: 'Active trade assignments on team roster' },
            { name: 'Warranty', type: 'input', description: 'Warranty status in header' },
          ]}
          dataFields={[
            { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
            { name: 'name', type: 'string', required: true, description: 'Job name' },
            { name: 'job_number', type: 'string', description: 'Reference number' },
            { name: 'status', type: 'string', required: true, description: 'Job status (active, pre-construction, warranty, closed)' },
            { name: 'address', type: 'string', description: 'Full address' },
            { name: 'client_id', type: 'uuid', description: 'FK to clients' },
            { name: 'client_phone', type: 'string', description: 'Client phone for quick contact' },
            { name: 'client_email', type: 'string', description: 'Client email for quick contact' },
            { name: 'contract_amount', type: 'decimal', description: 'Total contract' },
            { name: 'start_date', type: 'date', description: 'Start date' },
            { name: 'target_completion', type: 'date', description: 'Target completion' },
            { name: 'predicted_completion', type: 'date', description: 'AI-predicted completion date' },
            { name: 'percent_complete', type: 'decimal', description: 'Progress %' },
            { name: 'project_type', type: 'string', description: 'New Build, Renovation, Addition, etc.' },
            { name: 'square_footage', type: 'integer', description: 'Total square footage' },
            { name: 'lot_subdivision', type: 'string', description: 'Lot number and subdivision name' },
            { name: 'ai_health_score', type: 'integer', description: 'AI health score 0-100' },
            { name: 'weather_data', type: 'jsonb', description: '3-day forecast for job site' },
            { name: 'milestones', type: 'jsonb', description: 'Key milestones with AI-predicted dates' },
            { name: 'team_assignments', type: 'jsonb', description: 'PM, super, and vendor assignments' },
            { name: 'risk_items', type: 'jsonb', description: 'AI-detected and manual risk items' },
            { name: 'warranty_status', type: 'string', description: 'Active, expired, or N/A' },
          ]}
          aiFeatures={[
            { name: 'Health Score', description: 'AI calculates job health (0-100) based on budget variance, schedule adherence, activity frequency, and risk factors. Displayed as color-coded badge on header.', trigger: 'Real-time' },
            { name: 'Risk Detection', description: 'AI identifies risks from project data: budget trending over, schedule slipping, vendor no-shows, weather threats, permit delays. Populates risk register automatically.', trigger: 'Continuous monitoring' },
            { name: 'Predicted Completion', description: 'AI predicts actual completion date based on historical pace, remaining work, and identified risks. Shows variance from target.', trigger: 'Daily recalculation' },
            { name: 'Milestone Prediction', description: 'AI predicts completion dates for each milestone based on current progress rate and dependencies. Flags milestones likely to miss their target.', trigger: 'On milestone update' },
            { name: 'Next Steps', description: 'AI suggests next actions based on project phase, pending items, and upcoming milestones.', trigger: 'On page load' },
            { name: 'Weather Impact', description: 'AI flags outdoor tasks at risk from adverse weather in 3-day forecast. Suggests schedule adjustments.', trigger: 'Daily forecast update' },
          ]}
          mockupAscii={`
┌──────────────────────────────────────────────────────────────────────┐
│ <- Jobs | Smith Residence          * Active  Health: 87/100   [Edit] │
│ #2024-015 | 123 Oak St, Austin TX | New Build | 3,200 SF            │
│ Client: John Smith (phone)(email) | PM: Jake R. | 145 days in       │
│ Target: Mar 15 | AI Predicted: Mar 22 (+7 days)                     │
├──────────────────────────────────────────────────────────────────────┤
│ Overview | Budget | Schedule | Invoices | Photos | Files | Logs      │
├───────────────────────────┬──────────────────────────────────────────┤
│ WEATHER  72F Sunny        │ KEY MILESTONES                           │
│ Tomorrow: Rain (outdoor!) │ [done] Foundation - Oct 5                │
│ Fri: Clear                │ [done] Framing - Nov 12                  │
├───────────────────────────┤ [>>]   Drywall - Dec 20 (AI: Dec 22)    │
│ BUDGET              [->]  │ [ ]    Cabinets - Jan 15                 │
│ Contract: $450,000        │ [ ]    Final - Mar 15 (AI: Mar 22 !)    │
│ Costs:    $285,000        ├──────────────────────────────────────────┤
│ Profit:   $165K (37%)     │ TEAM ROSTER                              │
├───────────────────────────┤ PM: Jake R. (online)                     │
│ RISK REGISTER        [->] │ Super: Mike B. (on-site)                 │
│ ! Rain may delay drywall  │ ABC Electric - Rough-in (Active)         │
│ ! Budget 2% over on elec  │ BuildRight Framing - Complete            │
├───────────────────────────┤ Premier Plumbing - Scheduled next wk     │
│ AI: "On track. Watch      ├──────────────────────────────────────────┤
│  weather Friday."         │ ACTIVITY FEED                            │
│                           │ * INV-2024-089 uploaded - 2h ago         │
│                           │ * Daily log #145 - Yesterday             │
│                           │ * Inspection PASSED - Dec 16             │
│                           │ * 4 photos added - Dec 15                │
└───────────────────────────┴──────────────────────────────────────────┘
`}
        />
      )}
    </div>
  )
}
