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
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
}

interface AIInsight {
  id: string
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  actionable: boolean
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  activeJobs: number
  avatar: string
}

interface PipelineItem {
  id: string
  stage: string
  count: number
  value: string
  color: string
}

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
  },
]

const aiInsights: AIInsight[] = [
  {
    id: '1',
    title: 'Material Cost Alert',
    description: 'Lumber prices up 7% this week. Recommend updating estimates for framing projects.',
    severity: 'high',
    actionable: true,
  },
  {
    id: '2',
    title: 'Cash Flow Opportunity',
    description: 'Miller Addition can be invoiced 2 weeks early. Impact: +$125K cash injection.',
    severity: 'high',
    actionable: true,
  },
  {
    id: '3',
    title: 'Crew Efficiency Gain',
    description: 'Johnson project crew efficiency up 14% with new scheduling system.',
    severity: 'medium',
    actionable: false,
  },
  {
    id: '4',
    title: 'Overdue Invoice Follow-up',
    description: '3 invoices over 45 days old. Recommend personal outreach today.',
    severity: 'high',
    actionable: true,
  },
]

const quickActions: QuickAction[] = [
  {
    id: '1',
    title: 'Start New Job',
    description: 'Create and setup a new project',
    icon: Briefcase,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: '2',
    title: 'Send Invoice',
    description: 'Create and send payment request',
    icon: DollarSign,
    color: 'bg-green-100 text-green-600',
  },
  {
    id: '3',
    title: 'View Reports',
    description: 'Financial and operational reports',
    icon: TrendingUp,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: '4',
    title: 'Team Schedule',
    description: 'View crew assignments and availability',
    icon: Users,
    color: 'bg-amber-100 text-amber-600',
  },
]

const teamActivity: TeamMember[] = [
  {
    id: '1',
    name: 'Jake Wilson',
    role: 'Project Manager',
    activeJobs: 3,
    avatar: 'JW',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    role: 'Estimator',
    activeJobs: 5,
    avatar: 'SC',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    role: 'Crew Lead',
    activeJobs: 2,
    avatar: 'MJ',
  },
  {
    id: '4',
    name: 'Lisa Martinez',
    role: 'Accounting',
    activeJobs: 0,
    avatar: 'LM',
  },
]

const pipelineData: PipelineItem[] = [
  { id: '1', stage: 'Leads', count: 12, value: '$580K', color: 'bg-blue-500' },
  { id: '2', stage: 'Estimates', count: 8, value: '$820K', color: 'bg-blue-400' },
  { id: '3', stage: 'Proposals', count: 5, value: '$1.2M', color: 'bg-blue-300' },
  { id: '4', stage: 'Contracts', count: 3, value: '$650K', color: 'bg-blue-200' },
]

const cardColorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    text: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    text: 'text-green-600',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-100 text-amber-600',
    text: 'text-amber-600',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-600',
    text: 'text-purple-600',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-600',
    text: 'text-red-600',
  },
}

function MetricCardComponent({ card }: { card: MetricCard }) {
  const colors = cardColorClasses[card.color]
  const Icon = card.icon

  return (
    <div className={cn("rounded-lg p-4", colors.bg)}>
      <div className="flex items-center justify-between mb-2">
        <div className={cn("p-2 rounded-lg", colors.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium",
          card.trend === 'up' ? "text-green-600" : card.trend === 'down' ? "text-red-600" : "text-gray-600"
        )}>
          {card.trend === 'up' ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : card.trend === 'down' ? (
            <ArrowDownRight className="h-3 w-3" />
          ) : null}
          {card.change > 0 ? '+' : ''}{Math.abs(card.change)}%
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{card.value}</div>
      <div className="text-sm text-gray-500 mt-1">{card.label}</div>
      <div className="text-xs text-gray-400 mt-0.5">{card.changeLabel}</div>
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
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
          4 alerts
        </span>
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
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-900">{insight.title}</span>
                  {insight.actionable && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                      Actionable
                    </span>
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

function QuickActionsPanel() {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-blue-600" />
          <h4 className="font-medium text-gray-900 text-sm">Quick Actions</h4>
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
                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-600" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TeamActivityPanel() {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-purple-600" />
          <h4 className="font-medium text-gray-900 text-sm">Team Activity</h4>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {teamActivity.map(member => (
          <div key={member.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                  {member.avatar}
                </div>
                <div>
                  <div className="font-medium text-sm text-gray-900">{member.name}</div>
                  <div className="text-xs text-gray-500">{member.role}</div>
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
        ))}
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
  const totalValue = pipelineData.reduce((sum, item) => {
    const value = parseInt(item.value.replace(/[$,K]/g, ''))
    return sum + value
  }, 0)

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-green-600" />
            <h4 className="font-medium text-gray-900 text-sm">Sales Pipeline</h4>
          </div>
          <span className="text-sm font-semibold text-gray-900">${totalValue}K total</span>
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
            <div className="text-sm text-gray-500 mt-0.5">Real-time metrics and actionable insights</div>
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

      {/* Key Metrics Row */}
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
          <PipelineSummary />
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <QuickActionsPanel />
          <TeamActivityPanel />
        </div>
      </div>

      {/* Company Health Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="font-medium text-sm text-green-800">Company Health:</span>
          </div>
          <p className="text-sm text-green-700">
            18 active jobs on track. Revenue is 12.5% above target this month.
            Cash position strong with $1.8M in receivables actively being collected.
            Team productivity up 8% with new scheduling optimization.
          </p>
        </div>
      </div>
    </div>
  )
}
