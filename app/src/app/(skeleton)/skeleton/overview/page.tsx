'use client'

import { useState } from 'react'

import {
  Eye,
  BookOpen,
} from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { OverviewPreview } from '@/components/skeleton/previews/overview-preview'
import { cn } from '@/lib/utils'

export default function OverviewPage() {
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

      {/* Tab Content */}
      {activeTab === 'preview' ? (
        <OverviewPreview />
      ) : (
        <PageSpec
          title="Company Overview"
          phase="Phase 0 - Core Operations"
          planFile="views/overview/OVERVIEW.md"
          description="High-level dashboard providing company-wide visibility. Real-time metrics on active jobs, revenue, AR/AP status. AI-powered insights highlighting risks and opportunities. Quick actions for common tasks. Team activity feed showing recent updates across the company. Sales pipeline visualization at a glance."
          workflow={['Dashboard', 'Metrics', 'Analytics', 'Decision Making']}
          features={[
            'KPI cards with sparkline trends and drill-down links (GAP-632, GAP-624)',
            'Real-time "Needs Attention" priority queue with dismiss/snooze (GAP-629)',
            'AI-generated insights categorized by financial/schedule/crew/material/client',
            'Quick action buttons with keyboard shortcuts - 3-click rule (UX Principle 3)',
            'Team activity feed with online/field/offline status',
            'Sales pipeline summary with conversion rates by stage',
            'Weekly meeting preparation auto-generated from project data (GAP-1057)',
            'Accounts receivable and payable with trend arrows',
            'Pipeline visualization with opportunity counts',
            'Revenue trending with comparison mode',
            'Weather for primary job site locations',
            'Cross-module connection badges on all items',
            'Drill-down from any number to detail page (GAP-624)',
          ]}
          connections={[
            { name: 'Jobs', type: 'input', description: 'Job status, progress, and risk scores aggregated' },
            { name: 'Financial Dashboard', type: 'input', description: 'AR, AP, revenue, cash position data' },
            { name: 'Sales Pipeline', type: 'input', description: 'Pipeline stages, values, and conversion rates' },
            { name: 'Team Directory', type: 'input', description: 'Team members, status, and current activity' },
            { name: 'Inspections', type: 'input', description: 'Upcoming inspections with permit refs' },
            { name: 'Schedule', type: 'input', description: 'Schedule health and delay alerts' },
            { name: 'Budget', type: 'input', description: 'Budget threshold alerts across jobs' },
            { name: 'RFIs', type: 'input', description: 'Stalled RFIs needing attention' },
            { name: 'Vendors', type: 'input', description: 'Expired insurance and compliance items' },
            { name: 'Draws', type: 'input', description: 'Overdue draw approvals' },
            { name: 'Weather API', type: 'input', description: 'Weather conditions for job sites' },
            { name: 'Notifications', type: 'input', description: 'Notification bell count (Module 5)' },
            { name: 'All Pages', type: 'output', description: 'Drill-down navigation to all system pages' },
          ]}
          dataFields={[
            { name: 'company_id', type: 'uuid', required: true, description: 'Primary key' },
            { name: 'active_job_count', type: 'integer', description: 'Count of active jobs' },
            { name: 'revenue_mtd', type: 'decimal', description: 'Month-to-date revenue' },
            { name: 'revenue_target', type: 'decimal', description: 'Monthly revenue target' },
            { name: 'accounts_receivable', type: 'decimal', description: 'Total AR balance' },
            { name: 'accounts_payable', type: 'decimal', description: 'Total AP balance' },
            { name: 'pipeline_value', type: 'decimal', description: 'Total sales pipeline value' },
            { name: 'profit_margin_ytd', type: 'decimal', description: 'Year-to-date profit margin %' },
            { name: 'team_member_count', type: 'integer', description: 'Total active team members' },
          ]}
          aiFeatures={[
            {
              name: 'Metric Anomaly Detection',
              description: 'Flags unusual patterns: "Revenue down 15% from trend. Check: 2 jobs paused, 1 delayed invoice. Recommend follow-up with clients."',
              trigger: 'Real-time continuous monitoring'
            },
            {
              name: 'Risk Scoring',
              description: 'Prioritizes issues requiring attention: "3 high-risk alerts: Smith Residence 8 days behind schedule (93% probability of delay), AR aging $125K over 45 days, Miller Addition profit margin 2% below target."',
              trigger: 'Daily dashboard load'
            },
            {
              name: 'AI Insights Panel',
              description: 'Generated recommendations: "Recommend calling Johnson Builders today - contract signed 3 hours ago, proposal accepted 2 weeks ago, no kick-off scheduled. 92% probability they\'re waiting on schedule confirmation."',
              trigger: 'Every dashboard refresh'
            },
            {
              name: 'Cash Flow Forecast',
              description: 'Predicts cash position: "Cash position will drop below $50K in 10 days if 3 invoices not collected. XYZ Corp is 8 days from payment - recommend reminder call today."',
              trigger: 'Daily'
            },
            {
              name: 'Team Productivity Tracking',
              description: 'Monitors team efficiency: "Crew efficiency on Johnson project up 14% week-over-week. Recommend applying same crew composition to similar scope items on other jobs."',
              trigger: 'Weekly synthesis'
            },
            {
              name: 'Material Cost Intelligence',
              description: 'Alerts on market changes: "Lumber prices up 7% this week. 4 active jobs with high framing exposure. Recommend review estimate adequacy for Davis and Thompson projects."',
              trigger: 'Daily market check'
            },
            {
              name: 'Pipeline Stage Prediction',
              description: 'Forecasts conversion: "5 proposals in system averaging 65% conversion rate. Projected $820K new revenue if all convert (historical: 68%). Risk: 2 proposals over 30 days old with no follow-up contact."',
              trigger: 'Daily pipeline analysis'
            },
            {
              name: 'Action Priority Ranking',
              description: 'Sequences most impactful tasks: "Top 3 actions today: (1) Collect overdue invoice $125K, (2) Resolve Smith schedule delay risk, (3) Close Thompson proposal (4 days old, 1% decay per day)."',
              trigger: 'Every navigation to overview'
            },
          ]}
          mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Company Overview                    [Today] [Full Report]           │
├─────────────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ Active Jobs  │ │ Revenue MTD  │ │    A/R       │ │    A/P       │ │
│ │ 18           │ │ $2.4M        │ │ $1.8M        │ │ $945K        │ │
│ │ +3 vs month  │ │ +12.5% vs tgt│ │ -8.3% vs mo  │ │ +5.2% vs mo  │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ AI Insights & Alerts                 Quick Actions                   │
│ ┌─────────────────────────────────┐ ┌──────────────────────────────┐ │
│ │ Material Cost Alert - HIGH       │ │ + Start New Job              │ │
│ │ Lumber +7% this week            │ │ Send Invoice                 │ │
│ │ Actionable                      │ │ View Reports                 │ │
│ │                                 │ │ Team Schedule                │ │
│ │ Cash Flow Opportunity - HIGH     │ └──────────────────────────────┘ │
│ │ Miller can invoice 2 wks early  │                                   │
│ │ Actionable                      │ Sales Pipeline Summary           │
│ │                                 │ ┌──────────────────────────────┐ │
│ │ Crew Efficiency +14% - MEDIUM   │ │ Leads: 12 ($580K)   ████░░░ │ │
│ │ Johnson project performing well │ │ Est:   8 ($820K)    ███░░░░░ │ │
│ │                                 │ │ Props: 5 ($1.2M)    ██░░░░░░ │ │
│ │ Overdue Invoices - HIGH         │ │ Cont:  3 ($650K)    █░░░░░░░ │ │
│ │ 3 invoices over 45 days         │ └──────────────────────────────┘ │
│ │ Actionable                      │                                   │
│ └─────────────────────────────────┘ Team Activity                    │
│                                      ┌──────────────────────────────┐ │
│ Company Health:                      │ Jake Wilson - 3 active jobs  │ │
│ 18 active jobs on track. Revenue    │ Sarah Chen - 5 active jobs   │ │
│ +12.5% above target. Strong cash    │ Mike Johnson - 2 active jobs │ │
│ position with $1.8M in receivables. │ Lisa Martinez - Accounting   │ │
│ Team productivity up 8%.            │ View team directory          │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
`}
        />
      )}
    </div>
  )
}
