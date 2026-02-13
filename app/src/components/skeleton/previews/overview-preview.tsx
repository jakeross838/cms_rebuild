'use client'

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  Sparkles,
  Users,
  Target,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Calendar,
  Sun,
  CloudRain,
  Wallet,
  MessageSquare,
  Truck,
  FileText,
  ShieldAlert,
  Bell,
  Building2,
  ClipboardList,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MetricCard {
  id: string
  label: string
  value: string
  unit?: string
  change: number
  changeLabel: string
  icon: React.ElementType
  trend: 'up' | 'down' | 'neutral'
  color: 'blue' | 'green' | 'amber' | 'purple' | 'red'
  sparkline?: number[]
  drillDownTo?: string
}

interface AIInsight {
  id: string
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  actionable: boolean
  category: 'financial' | 'schedule' | 'crew' | 'material' | 'client'
  relatedJob?: string
  relatedJobId?: string
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  shortcut?: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  activeJobs: number
  avatar: string
  status: 'online' | 'field' | 'offline'
  currentActivity?: string
}

interface PipelineItem {
  id: string
  stage: string
  count: number
  value: string
  color: string
  conversionRate?: string
}

interface NeedsAttentionItem {
  id: string
  title: string
  description: string
  urgency: 'critical' | 'high' | 'medium'
  age: string
  module: string
  jobRef?: string
  icon: React.ElementType
}

interface MeetingAgendaItem {
  id: string
  topic: string
  jobRef?: string
  source: string
  status: 'alert' | 'update' | 'decision'
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const metricCards: MetricCard[] = [
  {
    id: '1',
    label: 'Active Jobs',
    value: '18',
    change: 3,
    changeLabel: 'vs last month',
    icon: Briefcase,
    trend: 'up',
    color: 'blue',
    sparkline: [12, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18],
    drillDownTo: '/jobs',
  },
  {
    id: '2',
    label: 'Revenue MTD',
    value: '$2.4M',
    change: 12.5,
    changeLabel: 'vs target',
    icon: TrendingUp,
    trend: 'up',
    color: 'green',
    sparkline: [1800, 1900, 2000, 2050, 2100, 2150, 2200, 2250, 2300, 2350, 2380, 2400],
    drillDownTo: '/financial/dashboard',
  },
  {
    id: '3',
    label: 'Accounts Receivable',
    value: '$1.8M',
    change: -8.3,
    changeLabel: 'down from last month',
    icon: DollarSign,
    trend: 'down',
    color: 'amber',
    sparkline: [2100, 2050, 2000, 1950, 1920, 1900, 1880, 1860, 1840, 1820, 1810, 1800],
    drillDownTo: '/financial/receivables',
  },
  {
    id: '4',
    label: 'Accounts Payable',
    value: '$945K',
    change: 5.2,
    changeLabel: 'up from last month',
    icon: AlertCircle,
    trend: 'up',
    color: 'purple',
    sparkline: [800, 820, 840, 860, 870, 880, 900, 910, 920, 930, 940, 945],
    drillDownTo: '/financial/payables',
  },
]

const aiInsights: AIInsight[] = [
  {
    id: '1',
    title: 'Material Cost Alert',
    description: 'Lumber prices up 7% this week. 4 active jobs with high framing exposure. Recommend updating estimates for Davis and Thompson projects.',
    severity: 'high',
    actionable: true,
    category: 'material',
    relatedJob: 'Multiple',
  },
  {
    id: '2',
    title: 'Cash Flow Opportunity',
    description: 'Miller Addition can be invoiced 2 weeks early based on milestone completion. Impact: +$125K cash injection this week.',
    severity: 'high',
    actionable: true,
    category: 'financial',
    relatedJob: 'Miller Addition',
    relatedJobId: 'J-2025-012',
  },
  {
    id: '3',
    title: 'Crew Efficiency Gain',
    description: 'Johnson project crew efficiency up 14% with new scheduling approach. Recommend applying same crew composition to similar scope on Wilson job.',
    severity: 'medium',
    actionable: false,
    category: 'crew',
    relatedJob: 'Johnson Beach House',
    relatedJobId: 'J-2026-003',
  },
  {
    id: '4',
    title: 'Overdue Invoice Follow-up',
    description: '3 invoices over 45 days old totaling $96K. Historical data: these clients respond after 2nd reminder call.',
    severity: 'high',
    actionable: true,
    category: 'financial',
  },
  {
    id: '5',
    title: 'Selection Delay Risk',
    description: 'Smith Residence master bath tile selection overdue by 3 days. May impact tile install schedule (2-week lead time).',
    severity: 'medium',
    actionable: true,
    category: 'client',
    relatedJob: 'Smith Residence',
    relatedJobId: 'J-2026-001',
  },
]

const quickActions: QuickAction[] = [
  {
    id: '1',
    title: 'Start New Job',
    description: 'Create and setup a new project',
    icon: Briefcase,
    color: 'bg-blue-100 text-blue-600',
    shortcut: 'Ctrl+N',
  },
  {
    id: '2',
    title: 'Create Daily Log',
    description: 'Voice or text entry for today',
    icon: ClipboardList,
    color: 'bg-green-100 text-green-600',
  },
  {
    id: '3',
    title: 'Send Invoice',
    description: 'Create and send payment request',
    icon: DollarSign,
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    id: '4',
    title: 'View Reports',
    description: 'Financial and operational reports',
    icon: TrendingUp,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: '5',
    title: 'Team Schedule',
    description: 'View crew assignments and availability',
    icon: Users,
    color: 'bg-amber-100 text-amber-600',
  },
  {
    id: '6',
    title: 'Approve Invoices',
    description: '3 invoices pending your approval',
    icon: CheckCircle2,
    color: 'bg-cyan-100 text-cyan-600',
  },
]

const teamActivity: TeamMember[] = [
  {
    id: '1',
    name: 'Jake Wilson',
    role: 'Project Manager',
    activeJobs: 3,
    avatar: 'JW',
    status: 'online',
    currentActivity: 'Reviewing budgets',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    role: 'Estimator',
    activeJobs: 5,
    avatar: 'SC',
    status: 'online',
    currentActivity: 'Working on Thompson estimate',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    role: 'Superintendent',
    activeJobs: 2,
    avatar: 'MJ',
    status: 'field',
    currentActivity: 'On-site: Smith Residence',
  },
  {
    id: '4',
    name: 'Lisa Martinez',
    role: 'Office Manager',
    activeJobs: 0,
    avatar: 'LM',
    status: 'online',
    currentActivity: 'Processing invoices',
  },
]

const pipelineData: PipelineItem[] = [
  { id: '1', stage: 'Leads', count: 12, value: '$580K', color: 'bg-blue-500', conversionRate: '42%' },
  { id: '2', stage: 'Estimates', count: 8, value: '$820K', color: 'bg-blue-400', conversionRate: '63%' },
  { id: '3', stage: 'Proposals', count: 5, value: '$1.2M', color: 'bg-blue-300', conversionRate: '60%' },
  { id: '4', stage: 'Contracts', count: 3, value: '$650K', color: 'bg-blue-200', conversionRate: '100%' },
]

const needsAttentionItems: NeedsAttentionItem[] = [
  {
    id: '1',
    title: 'Overdue draw approval',
    description: 'Draw #5 Smith Residence - 5 days overdue ($185,000)',
    urgency: 'critical',
    age: '5 days',
    module: 'Draws',
    jobRef: 'J-2026-001',
    icon: DollarSign,
  },
  {
    id: '2',
    title: 'Expired vendor insurance',
    description: 'Coastal Electric GL expired Feb 7',
    urgency: 'high',
    age: '5 days',
    module: 'Compliance',
    icon: ShieldAlert,
  },
  {
    id: '3',
    title: 'Stalled RFI',
    description: 'RFI #14 - HVAC duct routing, no response in 8 days',
    urgency: 'high',
    age: '8 days',
    module: 'RFIs',
    jobRef: 'J-2026-005',
    icon: MessageSquare,
  },
  {
    id: '4',
    title: 'Budget threshold reached',
    description: 'Wilson Home electrical at 92% of budget - 60% complete',
    urgency: 'medium',
    age: 'Today',
    module: 'Budget',
    jobRef: 'J-2026-005',
    icon: AlertTriangle,
  },
]

const meetingAgendaItems: MeetingAgendaItem[] = [
  { id: '1', topic: 'Smith Residence: 5-day schedule slip - recovery plan', jobRef: 'J-2026-001', source: 'Schedule', status: 'alert' },
  { id: '2', topic: 'Wilson Home: Electrical budget at 92%', jobRef: 'J-2026-005', source: 'Budget', status: 'alert' },
  { id: '3', topic: 'Miller Addition: Final inspection tomorrow', jobRef: 'J-2025-012', source: 'Inspections', status: 'update' },
  { id: '4', topic: 'Thompson Renovation: Kick-off scheduling needed', jobRef: 'J-2026-008', source: 'New Contract', status: 'decision' },
]

const aiFeaturesData = [
  {
    feature: 'Health Scoring',
    trigger: 'Real-time',
    insight: 'Overall project health assessment based on budget, schedule, and resource utilization across all active jobs.',
    severity: 'success' as const,
    confidence: 92,
  },
  {
    feature: 'Risk Detection',
    trigger: 'Real-time',
    insight: 'Identifies potential issues before they become problems - currently tracking 3 medium-risk items across your portfolio.',
    severity: 'warning' as const,
    confidence: 87,
  },
  {
    feature: 'Progress Tracking',
    trigger: 'Daily',
    insight: 'AI-verified completion status shows 18 jobs at 94% average schedule adherence with automated milestone validation.',
    severity: 'info' as const,
    confidence: 95,
  },
  {
    feature: 'Action Priorities',
    trigger: 'Real-time',
    insight: 'Ranked list of next actions: 1) Approve Draw #5, 2) Follow up on overdue invoices, 3) Review material cost changes.',
    severity: 'critical' as const,
    confidence: 88,
  },
  {
    feature: 'Trend Analysis',
    trigger: 'Weekly',
    insight: 'Key metric trends show revenue up 12.5%, crew efficiency improved 8%, and receivables collection rate increased by 15%.',
    severity: 'success' as const,
    confidence: 91,
  },
]

// ---------------------------------------------------------------------------
// Color utilities
// ---------------------------------------------------------------------------

const cardColorClasses = {
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', text: 'text-blue-600' },
  green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', text: 'text-green-600' },
  amber: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', text: 'text-amber-600' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', text: 'text-purple-600' },
  red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', text: 'text-red-600' },
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 60
    const y = 20 - ((v - min) / range) * 18
    return `${x},${y}`
  }).join(' ')

  const strokeColor = color === 'green' ? '#22c55e' : color === 'blue' ? '#3b82f6' : color === 'amber' ? '#f59e0b' : color === 'purple' ? '#8b5cf6' : '#ef4444'

  return (
    <svg viewBox="0 0 60 22" className="w-16 h-5">
      <polyline fill="none" stroke={strokeColor} strokeWidth="1.5" points={points} />
    </svg>
  )
}

function MetricCardComponent({ card }: { card: MetricCard }) {
  const colors = cardColorClasses[card.color]
  const Icon = card.icon

  return (
    <div className={cn("rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow", colors.bg)}>
      <div className="flex items-center justify-between mb-2">
        <div className={cn("p-2 rounded-lg", colors.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-2">
          {card.sparkline && <MiniSparkline data={card.sparkline} color={card.color} />}
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            card.trend === 'up' ? "text-green-600" : card.trend === 'down' ? "text-red-600" : "text-gray-600"
          )}>
            {card.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : card.trend === 'down' ? <ArrowDownRight className="h-3 w-3" /> : null}
            {card.change > 0 ? '+' : ''}{Math.abs(card.change)}%
          </div>
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{card.value}</div>
      <div className="text-sm text-gray-500 mt-1">{card.label}</div>
      <div className="text-xs text-gray-400 mt-0.5">{card.changeLabel}</div>
      {card.drillDownTo && (
        <div className="mt-1 flex items-center gap-1 text-xs text-blue-500">
          <ExternalLink className="h-3 w-3" />
          Click to drill down
        </div>
      )}
    </div>
  )
}

function AIInsightsPanel() {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <h4 className="font-medium text-gray-900 text-sm">AI Insights & Alerts</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">
            {aiInsights.filter(i => i.severity === 'high').length} high
          </span>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
            {aiInsights.length} total
          </span>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {aiInsights.map(insight => (
          <div
            key={insight.id}
            className={cn(
              "px-4 py-3 hover:bg-gray-50 cursor-pointer",
              insight.severity === 'high' && 'bg-red-50/30'
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-1.5 rounded-lg mt-0.5",
                insight.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
              )}>
                {insight.severity === 'high' ? (
                  <AlertTriangle className="h-3.5 w-3.5" />
                ) : (
                  <Zap className="h-3.5 w-3.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-gray-900">{insight.title}</span>
                  {insight.actionable && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Actionable</span>
                  )}
                  <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{insight.category}</span>
                  {insight.relatedJobId && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{insight.relatedJobId}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          View all insights
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function NeedsAttentionPanel() {
  const getUrgencyConfig = (urgency: NeedsAttentionItem['urgency']) => {
    switch (urgency) {
      case 'critical': return { bg: 'bg-red-100 text-red-700', dot: 'bg-red-500' }
      case 'high': return { bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' }
      case 'medium': return { bg: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' }
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-red-600" />
            <h4 className="font-medium text-gray-900 text-sm">Needs Attention</h4>
          </div>
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">
            {needsAttentionItems.length} items
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Prioritized by urgency and age - dismiss or snooze</p>
      </div>
      <div className="divide-y divide-gray-100">
        {needsAttentionItems.map(item => {
          const urgencyConfig = getUrgencyConfig(item.urgency)
          const Icon = item.icon
          return (
            <div key={item.id} className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-start gap-3">
                <div className={cn("p-1.5 rounded-lg mt-0.5", urgencyConfig.bg)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">{item.title}</span>
                    <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", urgencyConfig.bg)}>{item.urgency}</span>
                    {item.jobRef && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{item.jobRef}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span>{item.module}</span>
                    <span className="text-gray-300">|</span>
                    <span>{item.age} old</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function QuickActionsPanel() {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-blue-600" />
          <h4 className="font-medium text-gray-900 text-sm">Quick Actions</h4>
          <span className="text-xs text-gray-400">3-click rule: complete common tasks fast</span>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {quickActions.map(action => {
          const Icon = action.icon
          return (
            <div key={action.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", action.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">{action.title}</div>
                    <div className="text-xs text-gray-500">{action.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {action.shortcut && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">{action.shortcut}</span>
                  )}
                  <ArrowRight className="h-4 w-4 text-gray-300" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TeamActivityPanel() {
  const getStatusConfig = (status: TeamMember['status']) => {
    switch (status) {
      case 'online': return { dot: 'bg-green-500', label: 'Online' }
      case 'field': return { dot: 'bg-blue-500', label: 'In Field' }
      case 'offline': return { dot: 'bg-gray-400', label: 'Offline' }
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-purple-600" />
          <h4 className="font-medium text-gray-900 text-sm">Team Activity</h4>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {teamActivity.map(member => {
          const statusConfig = getStatusConfig(member.status)
          return (
            <div key={member.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                      {member.avatar}
                    </div>
                    <div className={cn("absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white", statusConfig.dot)} />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">{member.name}</div>
                    <div className="text-xs text-gray-500">{member.role}</div>
                    {member.currentActivity && (
                      <div className="text-xs text-gray-400 mt-0.5">{member.currentActivity}</div>
                    )}
                  </div>
                </div>
                {member.activeJobs > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    <Briefcase className="h-3 w-3" />
                    {member.activeJobs}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          View team directory
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function PipelineSummary() {
  const totalValue = '$3.25M'
  const totalCount = pipelineData.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-green-600" />
            <h4 className="font-medium text-gray-900 text-sm">Sales Pipeline</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{totalCount} opportunities</span>
            <span className="text-sm font-semibold text-gray-900">{totalValue}</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {pipelineData.map((item) => (
            <div key={item.id}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.stage}</div>
                  <div className="text-xs text-gray-500">{item.count} opportunities</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{item.value}</div>
                  {item.conversionRate && (
                    <div className="text-xs text-gray-400">{item.conversionRate} conversion</div>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={cn("h-full rounded-full", item.color)}
                  style={{ width: `${(item.count / 12) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          View pipeline
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function MeetingPrep() {
  const getStatusConfig = (status: MeetingAgendaItem['status']) => {
    switch (status) {
      case 'alert': return 'bg-red-100 text-red-700'
      case 'update': return 'bg-blue-100 text-blue-700'
      case 'decision': return 'bg-amber-100 text-amber-700'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-600" />
            <h4 className="font-medium text-gray-900 text-sm">Weekly Meeting Prep</h4>
          </div>
          <button className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium hover:bg-indigo-200">
            Generate Agenda
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">Auto-generated from project data</p>
      </div>
      <div className="divide-y divide-gray-100">
        {meetingAgendaItems.map(item => (
          <div key={item.id} className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-start gap-2">
              <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium mt-0.5 flex-shrink-0", getStatusConfig(item.status))}>
                {item.status}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">{item.topic}</p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                  <span>{item.source}</span>
                  {item.jobRef && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{item.jobRef}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function OverviewPreview() {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Company Overview</h3>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">All Systems Operational</span>
            </div>
            <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-3">
              <span>Real-time metrics and actionable insights</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1">
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                72F Sunny - Wilmington, NC
              </span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1 text-gray-400">
                <Calendar className="h-3.5 w-3.5" />
                Feb 12, 2026
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Clock className="h-4 w-4" />
              Today
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <TrendingUp className="h-4 w-4" />
              Full Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Row with Sparklines */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-4 gap-4">
          {metricCards.map(card => (
            <MetricCardComponent key={card.id} card={card} />
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          <AIInsightsPanel />
          <NeedsAttentionPanel />
          <PipelineSummary />
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <QuickActionsPanel />
          <TeamActivityPanel />
          <MeetingPrep />
        </div>
      </div>

      {/* AI Features Panel Section */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <AIFeaturesPanel
            title="AI-Powered Features"
            features={aiFeaturesData}
            columns={2}
          />
        </div>
      </div>

      {/* Company Health Summary */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Company Health:</span>
          </div>
          <p className="text-sm text-amber-700">
            18 active jobs on track. Revenue is 12.5% above target this month.
            Cash position strong with $1.8M in receivables actively being collected.
            Team productivity up 8% with new scheduling optimization.
            Pipeline shows $3.25M in opportunities with 60% average conversion rate.
            <span className="ml-1 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">AI-generated</span>
          </p>
        </div>
      </div>
    </div>
  )
}
