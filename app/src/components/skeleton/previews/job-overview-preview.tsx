'use client'

import {
  Building2,
  User,
  MapPin,
  DollarSign,
  Sparkles,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Camera,
  ClipboardList,
  Receipt,
  ChevronRight,
  Activity,
  BarChart3,
  CalendarDays,
  FileEdit,
  MessageSquare,
  Package,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface JobOverview {
  id: string
  name: string
  client: string
  clientEmail: string
  clientPhone: string
  address: string
  city: string
  state: string
  zip: string
  status: 'pre-con' | 'active' | 'closeout' | 'complete'
  progress: number
  contractValue: number
  pmAssigned: string
  superintendent: string
  startDate: string
  expectedCompletion: string
  jobNumber: string
}

interface MetricCard {
  id: string
  label: string
  value: string
  subValue?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  status: 'good' | 'warning' | 'critical' | 'neutral'
  icon: React.ElementType
}

interface ActivityItem {
  id: string
  type: 'daily-log' | 'photo' | 'change-order' | 'invoice' | 'rfi' | 'selection' | 'comment'
  title: string
  description: string
  user: string
  timestamp: string
  metadata?: string
}

interface QuickLink {
  id: string
  label: string
  icon: React.ElementType
  count?: number
  alert?: boolean
}

const mockJob: JobOverview = {
  id: '1',
  name: 'Smith Residence',
  client: 'John & Sarah Smith',
  clientEmail: 'jsmith@email.com',
  clientPhone: '(910) 555-1234',
  address: '1234 Ocean Drive',
  city: 'Wilmington',
  state: 'NC',
  zip: '28401',
  status: 'active',
  progress: 65,
  contractValue: 2450000,
  pmAssigned: 'Jake Mitchell',
  superintendent: 'Mike Thompson',
  startDate: 'Jan 15, 2026',
  expectedCompletion: 'Aug 30, 2026',
  jobNumber: 'J-2026-001',
}

const mockMetrics: MetricCard[] = [
  {
    id: '1',
    label: 'Contract Value',
    value: '$2.45M',
    subValue: 'Original: $2.25M',
    icon: DollarSign,
    status: 'neutral',
  },
  {
    id: '2',
    label: 'Budget Status',
    value: '11.2%',
    subValue: 'Projected Margin',
    trend: 'down',
    trendValue: '-3.8% from target',
    icon: BarChart3,
    status: 'warning',
  },
  {
    id: '3',
    label: 'Schedule Status',
    value: '+5 days',
    subValue: 'vs. baseline',
    trend: 'down',
    trendValue: 'Weather delays',
    icon: CalendarDays,
    status: 'warning',
  },
  {
    id: '4',
    label: 'Change Orders',
    value: '$200K',
    subValue: '4 approved, 2 pending',
    trend: 'up',
    trendValue: '+$45K this month',
    icon: FileEdit,
    status: 'good',
  },
]

const mockActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'daily-log',
    title: 'Daily Log Submitted',
    description: 'Framing crew completed 2nd floor wall framing. Passed rough framing inspection.',
    user: 'Mike Thompson',
    timestamp: '2 hours ago',
    metadata: 'Crew: 6 | Hours: 48',
  },
  {
    id: '2',
    type: 'photo',
    title: '12 Photos Added',
    description: 'Roof framing progress photos uploaded to Framing phase.',
    user: 'Jake Mitchell',
    timestamp: '4 hours ago',
  },
  {
    id: '3',
    type: 'change-order',
    title: 'Change Order #5 Approved',
    description: 'Client approved upgraded impact windows - PGT WinGuard series.',
    user: 'Sarah Smith (Client)',
    timestamp: 'Yesterday',
    metadata: '+$18,500',
  },
  {
    id: '4',
    type: 'invoice',
    title: 'Draw Request #4 Submitted',
    description: 'Submitted for client approval - Framing milestone complete.',
    user: 'Jake Mitchell',
    timestamp: 'Yesterday',
    metadata: '$245,000',
  },
  {
    id: '5',
    type: 'rfi',
    title: 'RFI #12 Response Received',
    description: 'Architect clarified window header detail for master bedroom.',
    user: 'Design Associates',
    timestamp: '2 days ago',
  },
]

const mockQuickLinks: QuickLink[] = [
  { id: '1', label: 'Budget', icon: DollarSign, alert: true },
  { id: '2', label: 'Schedule', icon: Calendar, alert: true },
  { id: '3', label: 'Daily Logs', icon: ClipboardList, count: 47 },
  { id: '4', label: 'Photos', icon: Camera, count: 234 },
  { id: '5', label: 'Documents', icon: FileText, count: 56 },
  { id: '6', label: 'Change Orders', icon: FileEdit, count: 6 },
  { id: '7', label: 'Invoices', icon: Receipt, count: 4 },
  { id: '8', label: 'Selections', icon: Package, count: 28 },
  { id: '9', label: 'RFIs', icon: MessageSquare, count: 12 },
  { id: '10', label: 'Team', icon: Users },
]

const statuses = [
  { id: 'pre-con', label: 'Pre-Construction', color: 'bg-blue-500', bgLight: 'bg-blue-50', textColor: 'text-blue-700' },
  { id: 'active', label: 'Active', color: 'bg-green-500', bgLight: 'bg-green-50', textColor: 'text-green-700' },
  { id: 'closeout', label: 'Closeout', color: 'bg-amber-500', bgLight: 'bg-amber-50', textColor: 'text-amber-700' },
  { id: 'complete', label: 'Complete', color: 'bg-gray-500', bgLight: 'bg-gray-100', textColor: 'text-gray-700' },
]

function getStatusConfig(status: JobOverview['status']) {
  return statuses.find(s => s.id === status) || statuses[0]
}

function getActivityIcon(type: ActivityItem['type']) {
  switch (type) {
    case 'daily-log': return ClipboardList
    case 'photo': return Camera
    case 'change-order': return FileEdit
    case 'invoice': return Receipt
    case 'rfi': return MessageSquare
    case 'selection': return Package
    case 'comment': return MessageSquare
    default: return Activity
  }
}

function getActivityColor(type: ActivityItem['type']) {
  switch (type) {
    case 'daily-log': return 'bg-blue-100 text-blue-600'
    case 'photo': return 'bg-purple-100 text-purple-600'
    case 'change-order': return 'bg-amber-100 text-amber-600'
    case 'invoice': return 'bg-green-100 text-green-600'
    case 'rfi': return 'bg-cyan-100 text-cyan-600'
    case 'selection': return 'bg-pink-100 text-pink-600'
    case 'comment': return 'bg-gray-100 text-gray-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}

function SummaryHeader({ job }: { job: JobOverview }) {
  const statusConfig = getStatusConfig(job.status)

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-xl", statusConfig.bgLight)}>
            <Building2 className={cn("h-8 w-8", statusConfig.textColor)} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">{job.name}</h2>
              <span className={cn(
                "text-xs px-2.5 py-1 rounded-full font-medium",
                statusConfig.bgLight,
                statusConfig.textColor
              )}>
                {statusConfig.label}
              </span>
              <span className="text-xs text-gray-400 font-mono">{job.jobNumber}</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-gray-400" />
                <span>{job.client}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{job.address}, {job.city}, {job.state}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Started: {job.startDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>Expected: {job.expectedCompletion}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Project Manager</div>
          <div className="font-medium text-gray-900">{job.pmAssigned}</div>
          <div className="text-sm text-gray-500 mt-1">Superintendent</div>
          <div className="font-medium text-gray-900">{job.superintendent}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className={cn("text-sm font-semibold", statusConfig.textColor)}>{job.progress}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", statusConfig.color)}
            style={{ width: `${job.progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function MetricCardComponent({ metric }: { metric: MetricCard }) {
  const Icon = metric.icon

  const statusColors = {
    good: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', text: 'text-green-600' },
    warning: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', text: 'text-amber-600' },
    critical: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', text: 'text-red-600' },
    neutral: { bg: 'bg-gray-50', icon: 'bg-gray-100 text-gray-600', text: 'text-gray-600' },
  }

  const colors = statusColors[metric.status]

  return (
    <div className={cn("rounded-lg p-4", colors.bg)}>
      <div className="flex items-start justify-between">
        <div className={cn("p-2 rounded-lg", colors.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        {metric.trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            metric.trend === 'up' ? "text-green-600" : metric.trend === 'down' ? "text-amber-600" : "text-gray-500"
          )}>
            {metric.trend === 'up' ? (
              <TrendingUp className="h-3 w-3" />
            ) : metric.trend === 'down' ? (
              <TrendingDown className="h-3 w-3" />
            ) : null}
            {metric.trendValue}
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
        <div className="text-sm text-gray-600 mt-0.5">{metric.label}</div>
        {metric.subValue && (
          <div className="text-xs text-gray-400 mt-0.5">{metric.subValue}</div>
        )}
      </div>
    </div>
  )
}

function ActivityTimeline({ activities }: { activities: ActivityItem[] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">Recent Activity</h4>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View All
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type)
          const colorClass = getActivityColor(activity.type)

          return (
            <div key={activity.id} className="px-4 py-3 hover:bg-gray-50">
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg flex-shrink-0", colorClass)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{activity.title}</div>
                      <div className="text-sm text-gray-600 mt-0.5">{activity.description}</div>
                    </div>
                    {activity.metadata && (
                      <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded flex-shrink-0",
                        activity.type === 'change-order' ? "bg-amber-100 text-amber-700" :
                        activity.type === 'invoice' ? "bg-green-100 text-green-700" :
                        "bg-gray-100 text-gray-600"
                      )}>
                        {activity.metadata}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                    <span>{activity.user}</span>
                    <span>-</span>
                    <span>{activity.timestamp}</span>
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

function QuickLinksGrid({ links }: { links: QuickLink[] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h4 className="font-semibold text-gray-900">Quick Links</h4>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-5 gap-3">
          {links.map(link => {
            const Icon = link.icon
            return (
              <button
                key={link.id}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors group relative"
              >
                <div className="relative">
                  <div className="p-2.5 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors">
                    <Icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                  </div>
                  {link.alert && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-amber-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    {link.label}
                  </div>
                  {link.count !== undefined && (
                    <div className="text-xs text-gray-400">{link.count}</div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AIInsightsBar() {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-6 py-4">
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="p-1.5 bg-amber-100 rounded-lg">
            <Sparkles className="h-4 w-4 text-amber-600" />
          </div>
          <span className="font-semibold text-sm text-amber-800">Job Health Summary</span>
        </div>
        <div className="flex-1">
          <div className="flex items-start gap-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                Budget trending 3.8% below target margin. Carpentry costs $15K over - recommend change order for roof complexity.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                5-day schedule slip due to weather. Rain forecast Thu-Fri may add 2 more days. Consider weekend crew for recovery.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-700">
                Client engagement excellent - 100% draw approval rate, avg 2-day turnaround.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function JobOverviewPreview() {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Summary Header */}
      <SummaryHeader job={mockJob} />

      {/* Key Metrics Cards */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          {mockMetrics.map(metric => (
            <MetricCardComponent key={metric.id} metric={metric} />
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="p-6 grid grid-cols-3 gap-6">
        {/* Activity Timeline - Takes 2 columns */}
        <div className="col-span-2">
          <ActivityTimeline activities={mockActivity} />
        </div>

        {/* Quick Links - Takes 1 column */}
        <div className="col-span-1">
          <QuickLinksGrid links={mockQuickLinks} />
        </div>
      </div>

      {/* AI Insights Bar */}
      <AIInsightsBar />
    </div>
  )
}
