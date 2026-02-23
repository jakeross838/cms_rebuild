'use client'

import { useState } from 'react'

import Link from 'next/link'

import { Eye, BookOpen, ArrowRight } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { JobsListPreview } from '@/components/skeleton/previews/jobs-list-preview'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Leads', 'Estimates', 'Proposals', 'Contracts',
  'Jobs List', 'Job Dashboard', 'Budget', 'Schedule',
  'POs', 'Invoices', 'Draws', 'Closeout'
]

export default function JobsListSkeleton() {
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
        <div className="ml-auto">
          <Link
            href="/skeleton/jobs/1"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-stone-600 text-white hover:bg-stone-700 transition-colors"
          >
            Enter Job View
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      {activeTab === 'preview' ? <JobsListPreview /> : <PageSpec
      title="Jobs List"
      phase="Phase 0 - Foundation"
      planFile="views/jobs/JOBS_LIST.md"
      description="View and manage all construction projects. Central hub with AI-powered risk detection, completion predictions, and cross-job pattern analysis. Every job feeds intelligence that improves future estimates and schedules."
      workflow={constructionWorkflow}
      features={[
        'Card grid view with job photos, status, budget health, and AI risk indicators',
        'Table list view with sortable columns',
        'Quick filters: All, Active, Pre-construction, Completed, Warranty, At Risk',
        'Advanced filters: Status, Client, Assigned User, Budget Range, Date Range, Coastal/Elevated',
        'Bulk actions: Change status, Assign user, Export',
        'Status quick-change without opening detail',
        'Real-time search across name, address, job number',
        'AI risk badges on cards (budget, schedule, documentation)',
        'Predicted completion dates with confidence levels',
        'Cross-job comparison metrics ($/SF, duration, change orders)',
        'Pagination with customizable page size',
      ]}
      connections={[
        { name: 'Clients', type: 'input', description: 'Client information displayed on job cards' },
        { name: 'Users', type: 'input', description: 'Assignment display and filtering' },
        { name: 'Photos', type: 'input', description: 'Featured job photo on cards' },
        { name: 'Dashboard', type: 'output', description: 'Job counts and metrics feed dashboard' },
        { name: 'Reports', type: 'output', description: 'Job data used in reporting' },
        { name: 'Job Create', type: 'output', description: 'New Job button navigates to create page' },
        { name: 'Job Detail', type: 'output', description: 'Card/row click navigates to detail' },
        { name: 'Cost Intelligence', type: 'bidirectional', description: 'Job costs feed learning; estimates pull from history' },
        { name: 'Schedule Intelligence', type: 'bidirectional', description: 'Actual durations feed future scheduling' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'name', type: 'string', required: true, description: 'Job/project name' },
        { name: 'job_number', type: 'string', description: 'Optional reference number' },
        { name: 'address', type: 'string', description: 'Project address' },
        { name: 'city', type: 'string', description: 'City' },
        { name: 'state', type: 'string', description: 'State' },
        { name: 'client_id', type: 'uuid', required: true, description: 'FK to clients' },
        { name: 'status', type: 'string', required: true, description: 'Pre-construction, Active, On Hold, Completed, Warranty, Cancelled' },
        { name: 'contract_amount', type: 'decimal', description: 'Total contract value' },
        { name: 'square_footage', type: 'integer', description: 'Project SF for $/SF calculations' },
        { name: 'project_type', type: 'string', description: 'New construction, renovation, addition' },
        { name: 'is_coastal', type: 'boolean', description: 'Coastal/elevated construction' },
        { name: 'flood_zone', type: 'string', description: 'FEMA flood zone' },
        { name: 'percent_complete', type: 'decimal', description: 'Calculated from budget/draws' },
        { name: 'start_date', type: 'date', description: 'Project start date' },
        { name: 'target_completion', type: 'date', description: 'Target completion date' },
        { name: 'predicted_completion', type: 'date', description: 'AI-predicted completion' },
        { name: 'ai_risk_score', type: 'decimal', description: 'AI-calculated risk score 0-100' },
        { name: 'photo_url', type: 'string', description: 'Featured job photo' },
      ]}
      aiFeatures={[
        {
          name: 'Risk Detection & Scoring',
          description: 'Identifies jobs at risk based on: budget variance trends, schedule slippage, daily log gaps, invoice processing delays, client communication patterns, and vendor reliability on job. Assigns 0-100 risk score with breakdown by category.',
          trigger: 'Real-time monitoring, recalculates on data changes'
        },
        {
          name: 'Completion Prediction',
          description: 'Predicts completion date with confidence intervals using: current progress, schedule variance by phase, vendor performance history, weather patterns, and similar job comparisons. "85% likely by March 15, 95% by April 1."',
          trigger: 'Daily recalculation'
        },
        {
          name: 'Profitability Forecasting',
          description: 'Projects final profitability based on current burn rate, change order trends, and cost-to-complete estimates. Alerts when projected margin drops below threshold. Compares to similar completed jobs.',
          trigger: 'On budget/invoice changes'
        },
        {
          name: 'Cross-Job Pattern Recognition',
          description: 'Identifies patterns across jobs: "Jobs with Vendor X framing have 15% fewer change orders." "Island jobs average 2 weeks longer than mainland." "Your 2-story homes cost 8% more per SF than 1-story."',
          trigger: 'Weekly analysis and on-demand insights'
        },
        {
          name: 'Attention Prioritization',
          description: 'Ranks jobs by urgency considering: upcoming milestones, overdue items, client response pending, vendor delays, documentation gaps. "Job X needs attention—3 overdue items and client waiting on selection response."',
          trigger: 'Real-time, feeds daily briefing'
        },
        {
          name: 'Similar Job Comparison',
          description: 'Auto-groups comparable jobs (by SF, type, location, complexity) and surfaces insights: "This 3,200 SF coastal home is tracking 8% over average—difference is framing (+$12K) due to complex roof design."',
          trigger: 'On job detail view'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ [Filters]                              Cards | List    [+ New Job]   │
├─────────────────────────────────────────────────────────────────────┤
│ AI Summary: 2 jobs need attention | 1 at risk | 3 on track          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │               │
│  │ │  Photo   │ │  │ │  Photo   │ │  │ │  Photo   │ │               │
│  │ │  ⚠ Risk  │ │  │ │          │ │  │ │          │ │               │
│  │ └──────────┘ │  │ └──────────┘ │  │ └──────────┘ │               │
│  │ Smith Home   │  │ Johnson Res  │  │ Miller Add   │               │
│  │ AMI Coastal  │  │ Bradenton    │  │ Longboat Key │               │
│  │ ● Active     │  │ ● Pre-Con    │  │ ● Active     │               │
│  │              │  │              │  │              │               │
│  │ $2.45M       │  │ $1.82M       │  │ $380,000     │               │
│  │ $700/SF      │  │ $650/SF      │  │ $760/SF      │               │
│  │ 65% → Mar 15 │  │ 0% → Jul 1   │  │ 40% → Feb 1  │               │
│  │ Risk: 72 ⚠   │  │ Risk: 15 ✓   │  │ Risk: 28 ✓   │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                     │
│ ⚠ = Budget trending over  |  ✓ = On track                          │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
