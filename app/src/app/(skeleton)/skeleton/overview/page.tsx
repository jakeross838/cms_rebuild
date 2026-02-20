'use client'

import Link from 'next/link'
import {
  Building2,
  HardHat,
  Briefcase,
  DollarSign,
  Users,
  CheckSquare,
  UserCircle,
  MessageSquare,
  Truck,
  FileCheck,
  Clock,
  Shield,
  PieChart,
  Settings,
  ArrowRight,
  Sparkles,
  Database,
  Layers,
  Search,
  PanelRightOpen,
  Target,
  ClipboardCheck,
  Calendar,
  Eye,
  BookOpen,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { OverviewPreview } from '@/components/skeleton/previews/overview-preview'
import { PageSpec } from '@/components/skeleton/page-spec'

interface Page {
  name: string
  href: string
  description: string
  aiFeatures?: number
  uiPattern?: string
}

interface Category {
  name: string
  icon: React.ElementType
  phase: number
  color: string
  pages: Page[]
}

const categories: Category[] = [
  {
    name: 'Sales Pipeline',
    icon: Target,
    phase: 0,
    color: 'blue',
    pages: [
      { name: 'Leads', href: '/skeleton/leads', description: 'Pipeline view with AI scoring. Click lead opens detail panel.', aiFeatures: 6, uiPattern: 'List + Detail Panel' },
      { name: 'Estimates', href: '/skeleton/estimates', description: 'Selection-based estimating. Pick products, pricing auto-fills.', aiFeatures: 9, uiPattern: 'List + Inline Editor' },
      { name: 'Proposals', href: '/skeleton/proposals', description: 'Show selection options to clients. Tier comparison, upgrades.', aiFeatures: 8, uiPattern: 'List + Generator' },
      { name: 'Contracts', href: '/skeleton/contracts', description: 'Contract templates with e-signature. Status tracking.', uiPattern: 'List + Detail Panel' },
    ],
  },
  {
    name: 'Library',
    icon: Database,
    phase: 0,
    color: 'blue',
    pages: [
      { name: 'Selections Catalog', href: '/skeleton/library/selections', description: 'Master product/material library. Pricing tiers, vendor links.', aiFeatures: 8, uiPattern: 'Tree + Cards' },
      { name: 'Assemblies', href: '/skeleton/library/assemblies', description: 'Reusable estimate templates. Kitchen package, bathroom package.', uiPattern: 'Library + Editor' },
      { name: 'Cost Codes', href: '/skeleton/library/cost-codes', description: 'Cost code library. Drag to reorder. Bulk import/export.', uiPattern: 'Tree + Editor' },
      { name: 'Templates', href: '/skeleton/library/templates', description: 'Document and email templates.', uiPattern: 'Library + Editor' },
    ],
  },
  {
    name: 'Directory',
    icon: Users,
    phase: 0,
    color: 'blue',
    pages: [
      { name: 'Clients', href: '/skeleton/directory/clients', description: 'Client list with intelligence. Preferences and history.', aiFeatures: 8, uiPattern: 'List + Profile Panel' },
      { name: 'Vendors', href: '/skeleton/directory/vendors', description: 'Vendor list with scorecards. Performance tracking.', aiFeatures: 10, uiPattern: 'List + Profile Panel' },
      { name: 'Team', href: '/skeleton/directory/team', description: 'Employee management. Certifications, availability.', uiPattern: 'List + Profile Panel' },
      { name: 'Contacts', href: '/skeleton/directory/contacts', description: 'General contacts directory.', uiPattern: 'List + Detail Panel' },
    ],
  },
  {
    name: 'Operations',
    icon: Calendar,
    phase: 0,
    color: 'green',
    pages: [
      { name: 'Calendar', href: '/skeleton/operations/calendar', description: 'Company-wide calendar. All events in one view.', uiPattern: 'Calendar + Agenda' },
      { name: 'Crew Schedule', href: '/skeleton/operations/crew-schedule', description: 'Resource allocation across jobs.', aiFeatures: 6, uiPattern: 'Resource Grid' },
      { name: 'Equipment', href: '/skeleton/operations/equipment', description: 'Tool and equipment tracking.', uiPattern: 'List + Map' },
      { name: 'Deliveries', href: '/skeleton/operations/deliveries', description: 'Track material deliveries.', aiFeatures: 6, uiPattern: 'List + Calendar' },
    ],
  },
  {
    name: 'Financial',
    icon: DollarSign,
    phase: 0,
    color: 'green',
    pages: [
      { name: 'Dashboard', href: '/skeleton/financial/dashboard', description: 'Financial overview. Cash, AR, AP, margins.', aiFeatures: 6, uiPattern: 'Dashboard + KPIs' },
      { name: 'Accounts Receivable', href: '/skeleton/financial/receivables', description: 'Money owed to you. Aging, collection.', aiFeatures: 8, uiPattern: 'List + Aging' },
      { name: 'Accounts Payable', href: '/skeleton/financial/payables', description: 'Money you owe. Payment scheduling.', aiFeatures: 8, uiPattern: 'List + Scheduling' },
      { name: 'Cash Flow', href: '/skeleton/financial/cash-flow', description: 'Cash flow forecasting.', aiFeatures: 10, uiPattern: 'Chart + Forecast' },
      { name: 'Profitability', href: '/skeleton/financial/profitability', description: 'Job profitability analysis.', aiFeatures: 8, uiPattern: 'Dashboard + Drill-down' },
      { name: 'Reports', href: '/skeleton/financial/reports', description: 'Financial reports. WIP, P&L, etc.', aiFeatures: 6, uiPattern: 'Report Gallery' },
    ],
  },
  {
    name: 'Compliance',
    icon: ClipboardCheck,
    phase: 1,
    color: 'purple',
    pages: [
      { name: 'Insurance', href: '/skeleton/compliance/insurance', description: 'Insurance tracking. COIs, expiration alerts.', aiFeatures: 6, uiPattern: 'List + Alerts' },
      { name: 'Licenses', href: '/skeleton/compliance/licenses', description: 'Licenses and certifications.', aiFeatures: 4, uiPattern: 'List + Expiration' },
      { name: 'Safety', href: '/skeleton/compliance/safety', description: 'Safety management. Incidents, training.', aiFeatures: 6, uiPattern: 'Dashboard + Log' },
    ],
  },
  {
    name: 'Company',
    icon: Building2,
    phase: 0,
    color: 'gray',
    pages: [
      { name: 'Settings', href: '/skeleton/company/settings', description: 'Company configuration.', uiPattern: 'Tabbed Settings' },
      { name: 'Integrations', href: '/skeleton/company/integrations', description: 'QuickBooks, email, calendar connections.', uiPattern: 'Integration Gallery' },
      { name: 'Custom Dashboards', href: '/skeleton/company/dashboards', description: 'Build custom dashboards.', uiPattern: 'Dashboard Builder' },
      { name: 'Email Marketing', href: '/skeleton/company/email-marketing', description: 'Client outreach campaigns.', uiPattern: 'Campaign Builder' },
    ],
  },
  {
    name: 'Jobs',
    icon: Briefcase,
    phase: 0,
    color: 'blue',
    pages: [
      { name: 'All Jobs', href: '/skeleton/jobs', description: 'Job list. Click to enter job context.', aiFeatures: 6, uiPattern: 'Cards + Filter' },
    ],
  },
  {
    name: 'Job Context Views',
    icon: HardHat,
    phase: 0,
    color: 'orange',
    pages: [
      { name: 'Job Overview', href: '/skeleton/jobs/example', description: 'Job dashboard with key metrics.', aiFeatures: 8, uiPattern: 'Dashboard + Actions' },
      { name: 'Budget', href: '/skeleton/jobs/example/budget', description: 'Selection vs actual tracking.', aiFeatures: 10, uiPattern: 'Data Grid + Charts' },
      { name: 'Schedule', href: '/skeleton/jobs/example/schedule', description: 'Gantt chart with dependencies.', aiFeatures: 10, uiPattern: 'Gantt + Calendar' },
      { name: 'Daily Logs', href: '/skeleton/jobs/example/daily-logs', description: 'Voice-to-text entry. AI extraction.', aiFeatures: 10, uiPattern: 'Timeline + Voice' },
      { name: 'Selections', href: '/skeleton/jobs/example/selections', description: 'Job selections tracking.', aiFeatures: 6, uiPattern: 'List + Status' },
      { name: 'Purchase Orders', href: '/skeleton/jobs/example/purchase-orders', description: 'Job POs with budget tracking.', aiFeatures: 8, uiPattern: 'List + Budget' },
      { name: 'Invoices', href: '/skeleton/jobs/example/invoices', description: 'Job invoices with PO matching.', aiFeatures: 10, uiPattern: 'List + Review' },
      { name: 'Draws', href: '/skeleton/jobs/example/draws', description: 'Draw requests for this job.', aiFeatures: 8, uiPattern: 'List + Builder' },
      { name: 'Change Orders', href: '/skeleton/jobs/example/change-orders', description: 'Change order management.', aiFeatures: 8, uiPattern: 'List + Approval' },
      { name: 'RFIs', href: '/skeleton/jobs/example/rfis', description: 'RFI tracking and responses.', aiFeatures: 8, uiPattern: 'List + Thread' },
      { name: 'Submittals', href: '/skeleton/jobs/example/submittals', description: 'Submittal workflow.', aiFeatures: 6, uiPattern: 'List + Workflow' },
      { name: 'Punch List', href: '/skeleton/jobs/example/punch-list', description: 'Punch items by location.', aiFeatures: 6, uiPattern: 'List + Photo Markup' },
      { name: 'Permits', href: '/skeleton/jobs/example/permits', description: 'Permit tracking.', aiFeatures: 6, uiPattern: 'List + Status' },
      { name: 'Inspections', href: '/skeleton/jobs/example/inspections', description: 'Inspection scheduling.', aiFeatures: 8, uiPattern: 'List + Checklist' },
      { name: 'Lien Waivers', href: '/skeleton/jobs/example/lien-waivers', description: 'Lien waiver collection.', aiFeatures: 6, uiPattern: 'List + Compliance' },
      { name: 'Photos', href: '/skeleton/jobs/example/photos', description: 'Photo gallery by phase.', uiPattern: 'Gallery + Lightbox' },
      { name: 'Documents', href: '/skeleton/jobs/example/files', description: 'Document management.', uiPattern: 'File Browser' },
      { name: 'Team', href: '/skeleton/jobs/example/team', description: 'Job team roster.', uiPattern: 'List + Contact' },
      { name: 'Communications', href: '/skeleton/jobs/example/communications', description: 'Job communication history.', aiFeatures: 6, uiPattern: 'Timeline + Search' },
      { name: 'Warranties', href: '/skeleton/jobs/example/warranties', description: 'Product warranties.', aiFeatures: 4, uiPattern: 'List + Expiration' },
    ],
  },
  {
    name: 'Client Portal',
    icon: UserCircle,
    phase: 0,
    color: 'cyan',
    pages: [
      { name: 'Portal', href: '/skeleton/portal', description: 'Client-facing dashboard. Selection picker.', aiFeatures: 8, uiPattern: 'Dashboard + Tabs' },
    ],
  },
]

const colorClasses: Record<string, { bg: string; text: string; badge: string; border: string }> = {
  blue: { bg: 'bg-stone-50', text: 'text-stone-700', badge: 'bg-stone-100', border: 'border-stone-200' },
  green: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100', border: 'border-green-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100', border: 'border-purple-200' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100', border: 'border-orange-200' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-700', badge: 'bg-pink-100', border: 'border-pink-200' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', badge: 'bg-cyan-100', border: 'border-cyan-200' },
  yellow: { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100', border: 'border-amber-200' },
  gray: { bg: 'bg-warm-50', text: 'text-warm-700', badge: 'bg-warm-100', border: 'border-warm-200' },
}

export default function OverviewPage() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')
  const [search, setSearch] = useState('')
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null)

  const totalPages = categories.reduce((sum, cat) => sum + cat.pages.length, 0)
  const totalAIFeatures = categories.reduce(
    (sum, cat) => sum + cat.pages.reduce((s, p) => s + (p.aiFeatures || 0), 0),
    0
  )

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      pages: cat.pages.filter(
        (page) =>
          (selectedPhase === null || cat.phase === selectedPhase) &&
          (search === '' ||
            page.name.toLowerCase().includes(search.toLowerCase()) ||
            page.description.toLowerCase().includes(search.toLowerCase()))
      ),
    }))
    .filter((cat) => cat.pages.length > 0)

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
