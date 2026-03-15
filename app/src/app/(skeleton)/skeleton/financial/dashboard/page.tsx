'use client'
import dynamic from 'next/dynamic'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { cn } from '@/lib/utils'
const FinancialDashboardPreview = dynamic(() => import('@/components/skeleton/previews/financial-dashboard-preview').then(mod => mod.FinancialDashboardPreview), { ssr: false })

export default function FinancialDashboardPage() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')

  return (
    <div className="space-y-4">
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
      {activeTab === 'preview' ? (
        <FinancialDashboardPreview />
      ) : (
        <PageSpec
          title="Financial Dashboard"
          phase="Phase 0 - Foundation"
          planFile="views/financial/DASHBOARD.md"
          description="Company-wide financial overview showing cash position, accounts receivable, accounts payable, profitability, and key financial metrics. The command center for understanding your company's financial health at a glance."
          workflow={['View Metrics', 'Drill Down', 'Take Action', 'Monitor Trends']}
          features={[
            'KPI summary cards with sparkline trends (GAP-632)',
            'Pending approvals bar with counts by type (GAP-629)',
            'Overnight alert review since last session (GAP-1029)',
            'Daily cash position widget with color-coded status (GAP-1030)',
            'Cash flow forecast chart',
            'Revenue trend chart with comparison toggle (GAP-626)',
            'Job status breakdown pie chart',
            'My Day priority queue across all projects (GAP-528, 1028)',
            'Upcoming inspections with permit cross-refs',
            'Real-time activity feed with filtering (GAP-631)',
            'Vendor follow-up queue with categorized items (GAP-1035)',
            'Client communication queue with response aging (GAP-1034)',
            'Date range selector with presets (GAP-625)',
            'Customizable widget layout (GAP-621)',
            'Auto-refresh with configurable interval (GAP-627)',
            'Export dashboard as PDF (GAP-628)',
            'Drill-down from any number to detail page (GAP-624)',
            'Weather for primary job site locations',
            'AI-generated company intelligence summary',
          ]}
          connections={[
            { name: 'Accounts Receivable', type: 'output', description: 'AR details drill-down' },
            { name: 'Accounts Payable', type: 'output', description: 'AP details drill-down' },
            { name: 'Cash Flow', type: 'output', description: 'Cash flow forecast drill-down' },
            { name: 'Job Profitability', type: 'output', description: 'Margin analysis by job' },
            { name: 'Draws', type: 'input', description: 'Outstanding draws pending approval' },
            { name: 'Invoices', type: 'input', description: 'Pending invoice approvals' },
            { name: 'QuickBooks', type: 'bidirectional', description: 'Sync status indicator' },
            { name: 'Schedule', type: 'input', description: 'Upcoming inspections and milestones' },
            { name: 'Daily Logs', type: 'input', description: 'Recent field activity' },
            { name: 'Notifications', type: 'input', description: 'Overnight alerts and bell count (Module 5)' },
            { name: 'Vendors', type: 'input', description: 'Vendor follow-up queue items' },
            { name: 'Client Portal', type: 'input', description: 'Client messages awaiting response' },
            { name: 'Tasks', type: 'input', description: 'My Day cross-project task queue' },
            { name: 'Change Orders', type: 'input', description: 'Pending CO approvals' },
            { name: 'Permits', type: 'input', description: 'Permit references on inspections' },
            { name: 'Weather API', type: 'input', description: 'Weather for job site locations' },
          ]}
          dataFields={[
            { name: 'cash_on_hand', type: 'decimal', description: 'Current bank balance' },
            { name: 'ar_total', type: 'decimal', description: 'Total receivables' },
            { name: 'ar_current', type: 'decimal', description: 'Current (0-30 days)' },
            { name: 'ar_30_60', type: 'decimal', description: '30-60 days aging' },
            { name: 'ar_60_90', type: 'decimal', description: '60-90 days aging' },
            { name: 'ar_over_90', type: 'decimal', description: 'Over 90 days aging' },
            { name: 'ap_total', type: 'decimal', description: 'Total payables' },
            { name: 'ap_due_today', type: 'decimal', description: 'Payments due today' },
            { name: 'ap_due_this_week', type: 'decimal', description: 'Payments due this week' },
            { name: 'draws_pending', type: 'decimal', description: 'Draw requests pending funding' },
            { name: 'net_cash_position', type: 'decimal', description: 'Bank minus commitments plus inflows' },
            { name: 'cash_status', type: 'string', description: 'green | yellow | red health indicator' },
            { name: 'revenue_mtd', type: 'decimal', description: 'Month to date revenue' },
            { name: 'revenue_ytd', type: 'decimal', description: 'Year to date revenue' },
            { name: 'profit_margin', type: 'decimal', description: 'Average profit margin' },
            { name: 'active_contract_value', type: 'decimal', description: 'Total contract value' },
            { name: 'active_job_count', type: 'integer', description: 'Count of active jobs' },
            { name: 'pipeline_value', type: 'decimal', description: 'Total sales pipeline' },
            { name: 'pending_approvals', type: 'jsonb', description: 'Counts by type: invoices, COs, POs, draws' },
            { name: 'overnight_alerts', type: 'jsonb', description: 'Events since last session' },
            { name: 'kpi_sparklines', type: 'jsonb', description: 'Trend data arrays per KPI' },
          ]}
          aiFeatures={[
            {
              name: 'Cash Flow Alert',
              description: 'Warns of potential cash issues. "Based on AP due and AR collection rates, cash may be tight in 3 weeks. Accelerate Draw #5?"',
              trigger: 'Daily analysis'
            },
            {
              name: 'Collection Recommendations',
              description: 'Suggests collection actions. "2 draws over 30 days. Historical: these clients pay after 2nd reminder."',
              trigger: 'Weekly review'
            },
            {
              name: 'Profitability Insights',
              description: 'Highlights margin trends. "Profit margins declining 2% this quarter. Primary driver: lumber costs."',
              trigger: 'Monthly analysis'
            },
            {
              name: 'Overnight Summary',
              description: 'Summarizes events since last session: emails, vendor messages, inspection results, weather changes, budget alerts.',
              trigger: 'On first load of the day (GAP-1029)'
            },
            {
              name: 'Priority Queue Ranking',
              description: 'Sequences most impactful tasks: "Top 3 actions: (1) Collect overdue $96K, (2) Approve draw #4, (3) Resolve Smith schedule delay."',
              trigger: 'Every dashboard load (GAP-1028)'
            },
            {
              name: 'Inspection Pass Probability',
              description: 'Predicts inspection outcomes. "Miller Addition final inspection: 92% pass probability based on similar projects."',
              trigger: 'When inspections are upcoming'
            },
          ]}
          mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Financial Dashboard                          Last sync: 5 min ago   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│ │ 💵 CASH     │ │ 📥 AR       │ │ 📤 AP       │ │ 📈 MARGIN   │    │
│ │ $847,500   │ │ $485,000    │ │ $312,000    │ │ 17.5%       │    │
│ │ ▲ +$125K   │ │ 3 overdue   │ │ 5 due soon  │ │ ▼ -0.5%     │    │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │
│                                                                     │
│ ┌────────────────────────────────┐ ┌────────────────────────────┐  │
│ │ ACCOUNTS RECEIVABLE AGING     │ │ 30-DAY CASH FORECAST       │  │
│ │                               │ │                            │  │
│ │ Current   ████████████ $320K │ │  Week 1: $892K ▲           │  │
│ │ 30-60     ████ $95K          │ │  Week 2: $745K ▼           │  │
│ │ 60-90     ██ $45K            │ │  Week 3: $680K ⚠ Low       │  │
│ │ 90+       █ $25K ⚠           │ │  Week 4: $820K ▲           │  │
│ │                               │ │                            │  │
│ │ [View Details]                │ │ [View Forecast]            │  │
│ └────────────────────────────────┘ └────────────────────────────┘  │
│                                                                     │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ ⚠ ALERTS                                                       │ │
│ │ • Draw #5 Smith Residence overdue by 5 days ($185,000)        │ │
│ │ • AP to ABC Lumber due in 3 days ($24,000)                    │ │
│ │ • Cash forecast shows potential shortfall Week 3              │ │
│ └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ Active Contracts: $8.4M | Revenue MTD: $485K | YTD: $2.1M          │
└─────────────────────────────────────────────────────────────────────┘
`}
        />
      )}
    </div>
  )
}
