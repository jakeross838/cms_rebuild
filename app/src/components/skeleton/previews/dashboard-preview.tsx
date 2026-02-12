'use client'

import {
  Briefcase,
  DollarSign,
  TrendingUp,
  Percent,
  BarChart3,
  LineChart,
  PieChart,
  CheckSquare,
  ClipboardCheck,
  Activity,
  Sparkles,
  Clock,
  ChevronRight,
  Calendar,
  User,
  Building2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SummaryCard {
  id: string
  label: string
  value: string
  change: number
  changeLabel: string
  icon: React.ElementType
  trend: 'up' | 'down' | 'neutral'
  color: 'blue' | 'green' | 'amber' | 'purple'
}

interface TaskDue {
  id: string
  title: string
  job: string
  assignee: string
  dueTime: string
  priority: 'high' | 'medium' | 'low'
}

interface UpcomingInspection {
  id: string
  type: string
  job: string
  date: string
  time: string
  status: 'scheduled' | 'pending-confirmation'
}

interface RecentActivity {
  id: string
  action: string
  subject: string
  user: string
  timestamp: string
  type: 'job' | 'invoice' | 'change-order' | 'document'
}

const summaryCards: SummaryCard[] = [
  {
    id: '1',
    label: 'Active Jobs',
    value: '12',
    change: 2,
    changeLabel: 'new this month',
    icon: Briefcase,
    trend: 'up',
    color: 'blue',
  },
  {
    id: '2',
    label: 'Pipeline Value',
    value: '$4.2M',
    change: 15.3,
    changeLabel: 'vs last quarter',
    icon: DollarSign,
    trend: 'up',
    color: 'green',
  },
  {
    id: '3',
    label: 'Revenue MTD',
    value: '$892K',
    change: 8.5,
    changeLabel: 'vs last month',
    icon: TrendingUp,
    trend: 'up',
    color: 'amber',
  },
  {
    id: '4',
    label: 'Profit Margin',
    value: '14.2%',
    change: -1.2,
    changeLabel: 'vs target 15%',
    icon: Percent,
    trend: 'down',
    color: 'purple',
  },
]

const tasksDueToday: TaskDue[] = [
  {
    id: '1',
    title: 'Review framing inspection report',
    job: 'Smith Residence',
    assignee: 'Jake',
    dueTime: '10:00 AM',
    priority: 'high',
  },
  {
    id: '2',
    title: 'Send draw request to client',
    job: 'Johnson Beach House',
    assignee: 'Sarah',
    dueTime: '12:00 PM',
    priority: 'high',
  },
  {
    id: '3',
    title: 'Approve PO for windows',
    job: 'Miller Addition',
    assignee: 'Jake',
    dueTime: '2:00 PM',
    priority: 'medium',
  },
  {
    id: '4',
    title: 'Schedule final walkthrough',
    job: 'Davis Coastal Home',
    assignee: 'Mike',
    dueTime: '4:00 PM',
    priority: 'low',
  },
]

const upcomingInspections: UpcomingInspection[] = [
  {
    id: '1',
    type: 'Framing Inspection',
    job: 'Smith Residence',
    date: 'Tomorrow',
    time: '9:00 AM',
    status: 'scheduled',
  },
  {
    id: '2',
    type: 'Electrical Rough-In',
    job: 'Wilson Custom Home',
    date: 'Feb 14',
    time: '10:30 AM',
    status: 'scheduled',
  },
  {
    id: '3',
    type: 'Final Inspection',
    job: 'Miller Addition',
    date: 'Feb 15',
    time: '2:00 PM',
    status: 'pending-confirmation',
  },
  {
    id: '4',
    type: 'Foundation Inspection',
    job: 'Anderson Pool House',
    date: 'Feb 16',
    time: '8:30 AM',
    status: 'scheduled',
  },
]

const recentActivity: RecentActivity[] = [
  {
    id: '1',
    action: 'Invoice sent',
    subject: 'Draw #4 - $125,000',
    user: 'Sarah',
    timestamp: '15 min ago',
    type: 'invoice',
  },
  {
    id: '2',
    action: 'Change order approved',
    subject: 'CO-003: Kitchen upgrade',
    user: 'Jake',
    timestamp: '45 min ago',
    type: 'change-order',
  },
  {
    id: '3',
    action: 'Daily log submitted',
    subject: 'Smith Residence',
    user: 'Mike',
    timestamp: '1 hour ago',
    type: 'document',
  },
  {
    id: '4',
    action: 'Job status updated',
    subject: 'Miller Addition to Closeout',
    user: 'Jake',
    timestamp: '2 hours ago',
    type: 'job',
  },
  {
    id: '5',
    action: 'Contract signed',
    subject: 'Thompson Renovation',
    user: 'Client',
    timestamp: '3 hours ago',
    type: 'document',
  },
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
}

function SummaryCardComponent({ card }: { card: SummaryCard }) {
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
          card.trend === 'up' ? "text-green-600" : "text-red-600"
        )}>
          {card.trend === 'up' ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {card.change > 0 ? '+' : ''}{card.change}%
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{card.value}</div>
      <div className="text-sm text-gray-500 mt-1">{card.label}</div>
      <div className="text-xs text-gray-400 mt-0.5">{card.changeLabel}</div>
    </div>
  )
}

function ChartPlaceholder({ title, icon: Icon, height = "h-48", chartType = "bar" }: {
  title: string
  icon: React.ElementType
  height?: string
  chartType?: 'bar' | 'line' | 'pie'
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
        <Icon className="h-4 w-4 text-gray-400" />
      </div>
      <div className={cn("bg-gray-50 rounded-lg flex items-center justify-center", height)}>
        <div className="text-center">
          {chartType === 'bar' && (
            <div className="flex justify-center gap-1 mb-2">
              {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                <div
                  key={i}
                  className="w-4 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                  style={{ height: `${h}%`, maxHeight: '120px' }}
                />
              ))}
            </div>
          )}
          {chartType === 'line' && (
            <div className="flex items-end justify-center gap-1 mb-2 h-24">
              <svg viewBox="0 0 200 80" className="w-48 h-20">
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  points="0,60 20,55 40,45 60,50 80,35 100,40 120,25 140,30 160,20 180,15 200,10"
                />
                <polyline
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="4"
                  points="0,50 20,48 40,52 60,45 80,48 100,42 120,45 140,40 160,38 180,35 200,32"
                />
              </svg>
            </div>
          )}
          {chartType === 'pie' && (
            <div className="flex justify-center mb-2">
              <svg viewBox="0 0 100 100" className="w-24 h-24">
                <circle cx="50" cy="50" r="40" fill="#e5e7eb" />
                <circle
                  cx="50"
                  cy="50"
                  r="20"
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="40"
                  strokeDasharray="50 126"
                  transform="rotate(-90 50 50)"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="20"
                  fill="transparent"
                  stroke="#22c55e"
                  strokeWidth="40"
                  strokeDasharray="30 126"
                  strokeDashoffset="-50"
                  transform="rotate(-90 50 50)"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="20"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="40"
                  strokeDasharray="25 126"
                  strokeDashoffset="-80"
                  transform="rotate(-90 50 50)"
                />
                <circle cx="50" cy="50" r="15" fill="white" />
              </svg>
            </div>
          )}
          <span className="text-xs text-gray-400">Chart visualization</span>
        </div>
      </div>
    </div>
  )
}

function TasksList({ tasks }: { tasks: TaskDue[] }) {
  const getPriorityColor = (priority: TaskDue['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-amber-100 text-amber-700'
      case 'low': return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-blue-600" />
            <h4 className="font-medium text-gray-900 text-sm">Tasks Due Today</h4>
          </div>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
            {tasks.length} tasks
          </span>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {tasks.map(task => (
          <div key={task.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">{task.title}</div>
                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {task.job}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {task.assignee}
                  </span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className={cn("text-xs px-2 py-0.5 rounded font-medium", getPriorityColor(task.priority))}>
                  {task.priority}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {task.dueTime}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          View all tasks
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function InspectionsList({ inspections }: { inspections: UpcomingInspection[] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-green-600" />
            <h4 className="font-medium text-gray-900 text-sm">Upcoming Inspections</h4>
          </div>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
            {inspections.length} scheduled
          </span>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {inspections.map(inspection => (
          <div key={inspection.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium text-gray-900 text-sm">{inspection.type}</div>
                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {inspection.job}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{inspection.date}</div>
                <div className="text-xs text-gray-500">{inspection.time}</div>
                {inspection.status === 'pending-confirmation' && (
                  <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    Pending
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          View all inspections
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function ActivityFeed({ activities }: { activities: RecentActivity[] }) {
  const getTypeIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'job': return Building2
      case 'invoice': return DollarSign
      case 'change-order': return TrendingUp
      case 'document': return ClipboardCheck
    }
  }

  const getTypeColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'job': return 'bg-blue-100 text-blue-600'
      case 'invoice': return 'bg-green-100 text-green-600'
      case 'change-order': return 'bg-amber-100 text-amber-600'
      case 'document': return 'bg-purple-100 text-purple-600'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-600" />
            <h4 className="font-medium text-gray-900 text-sm">Recent Activity</h4>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {activities.map(activity => {
          const Icon = getTypeIcon(activity.type)
          return (
            <div key={activity.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-start gap-3">
                <div className={cn("p-1.5 rounded-lg", getTypeColor(activity.type))}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900">
                    <span className="font-medium">{activity.action}</span>
                    <span className="text-gray-500"> - {activity.subject}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                    <span>{activity.user}</span>
                    <span className="text-gray-300">|</span>
                    <span>{activity.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          View all activity
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function DashboardPreview() {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Company Dashboard</h3>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">All Systems Operational</span>
            </div>
            <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                February 12, 2026
              </span>
              <span className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                Revenue trending 8% above target
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Calendar className="h-4 w-4" />
              This Month
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <BarChart3 className="h-4 w-4" />
              Full Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-4 gap-4">
          {summaryCards.map(card => (
            <SummaryCardComponent key={card.id} card={card} />
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="p-4 grid grid-cols-3 gap-4">
        <ChartPlaceholder title="Revenue Trend" icon={LineChart} chartType="line" />
        <ChartPlaceholder title="Job Status Breakdown" icon={PieChart} chartType="pie" />
        <ChartPlaceholder title="Cash Flow" icon={BarChart3} chartType="bar" />
      </div>

      {/* Quick Lists Row */}
      <div className="px-4 pb-4 grid grid-cols-3 gap-4">
        <TasksList tasks={tasksDueToday} />
        <InspectionsList inspections={upcomingInspections} />
        <ActivityFeed activities={recentActivity} />
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Company Intelligence:</span>
          </div>
          <p className="text-sm text-amber-700">
            Profit margin is 0.8% below target due to material cost increases on Smith Residence.
            3 invoices totaling $96K are overdue - recommend follow-up calls today.
            Miller Addition final inspection tomorrow has 92% pass probability based on similar projects.
            Consider scheduling Thompson Renovation kick-off meeting - contract signed 3 hours ago.
          </p>
        </div>
      </div>
    </div>
  )
}
