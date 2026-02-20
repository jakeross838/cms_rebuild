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
  Bell,
  Banknote,
  MessageSquare,
  Truck,
  ShieldAlert,
  Eye,
  Sun,
  Moon,
  CloudRain,
  RefreshCw,
  Wallet,
  FileWarning,
  Mail,
  Phone,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SummaryCard {
  id: string
  label: string
  value: string
  change: number
  changeLabel: string
  icon: React.ElementType
  trend: 'up' | 'down' | 'neutral'
  color: 'blue' | 'green' | 'amber' | 'purple'
  sparkline?: number[]
}

interface TaskDue {
  id: string
  title: string
  job: string
  jobId: string
  assignee: string
  dueTime: string
  priority: 'high' | 'medium' | 'low'
  sourceModule: string
  type: 'approval' | 'task' | 'rfi' | 'inspection' | 'selection' | 'invoice'
}

interface UpcomingInspection {
  id: string
  type: string
  job: string
  jobId: string
  date: string
  time: string
  status: 'scheduled' | 'pending-confirmation' | 'confirmed'
  inspector?: string
  permitRef?: string
}

interface RecentActivity {
  id: string
  action: string
  subject: string
  user: string
  timestamp: string
  type: 'job' | 'invoice' | 'change-order' | 'document' | 'daily-log' | 'approval' | 'selection'
  jobRef?: string
}

interface OvernightAlert {
  id: string
  message: string
  category: 'action_required' | 'informational' | 'resolved'
  source: string
  timestamp: string
  jobRef?: string
}

interface CashPosition {
  bankBalance: number
  dueOutToday: number
  dueOutThisWeek: number
  drawsPending: number
  netPosition: number
  status: 'green' | 'yellow' | 'red'
}

interface VendorFollowUp {
  id: string
  vendorName: string
  job: string
  category: 'overdue_bid' | 'overdue_invoice' | 'unanswered_rfi' | 'expired_insurance' | 'unacknowledged_bid'
  daysOverdue: number
  description: string
}

interface ClientMessage {
  id: string
  clientName: string
  job: string
  preview: string
  waitTime: string
  waitMinutes: number
  type: 'portal_message' | 'meeting'
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

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
    sparkline: [8, 9, 9, 10, 10, 11, 10, 11, 12, 12, 12, 12],
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
    sparkline: [3200, 3400, 3600, 3500, 3800, 3900, 4000, 3800, 4100, 4000, 4200, 4200],
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
    sparkline: [650, 700, 720, 780, 810, 830, 850, 860, 870, 880, 890, 892],
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
    sparkline: [16, 15.8, 15.5, 15.2, 15, 14.8, 14.5, 14.6, 14.4, 14.3, 14.2, 14.2],
  },
]

const tasksDueToday: TaskDue[] = [
  {
    id: '1',
    title: 'Review framing inspection report',
    job: 'Smith Residence',
    jobId: 'J-2026-001',
    assignee: 'Jake',
    dueTime: '10:00 AM',
    priority: 'high',
    sourceModule: 'Inspections',
    type: 'inspection',
  },
  {
    id: '2',
    title: 'Approve draw request #4 - $125,000',
    job: 'Johnson Beach House',
    jobId: 'J-2026-003',
    assignee: 'Sarah',
    dueTime: '12:00 PM',
    priority: 'high',
    sourceModule: 'Draws',
    type: 'approval',
  },
  {
    id: '3',
    title: 'Approve PO for impact windows',
    job: 'Miller Addition',
    jobId: 'J-2025-012',
    assignee: 'Jake',
    dueTime: '2:00 PM',
    priority: 'medium',
    sourceModule: 'Purchase Orders',
    type: 'approval',
  },
  {
    id: '4',
    title: 'Respond to RFI #8 - foundation detail',
    job: 'Wilson Custom Home',
    jobId: 'J-2026-005',
    assignee: 'Mike',
    dueTime: '3:00 PM',
    priority: 'medium',
    sourceModule: 'RFIs',
    type: 'rfi',
  },
  {
    id: '5',
    title: 'Schedule final walkthrough',
    job: 'Davis Coastal Home',
    jobId: 'J-2025-008',
    assignee: 'Mike',
    dueTime: '4:00 PM',
    priority: 'low',
    sourceModule: 'Tasks',
    type: 'task',
  },
]

const upcomingInspections: UpcomingInspection[] = [
  {
    id: '1',
    type: 'Framing Inspection',
    job: 'Smith Residence',
    jobId: 'J-2026-001',
    date: 'Tomorrow',
    time: '9:00 AM',
    status: 'confirmed',
    inspector: 'County Bldg Dept',
    permitRef: 'BLD-2026-0045',
  },
  {
    id: '2',
    type: 'Electrical Rough-In',
    job: 'Wilson Custom Home',
    jobId: 'J-2026-005',
    date: 'Feb 14',
    time: '10:30 AM',
    status: 'scheduled',
    inspector: 'County Bldg Dept',
    permitRef: 'BLD-2026-0052',
  },
  {
    id: '3',
    type: 'Final Inspection',
    job: 'Miller Addition',
    jobId: 'J-2025-012',
    date: 'Feb 15',
    time: '2:00 PM',
    status: 'pending-confirmation',
    permitRef: 'BLD-2025-0198',
  },
  {
    id: '4',
    type: 'Foundation Inspection',
    job: 'Anderson Pool House',
    jobId: 'J-2026-007',
    date: 'Feb 16',
    time: '8:30 AM',
    status: 'scheduled',
    inspector: 'County Bldg Dept',
    permitRef: 'BLD-2026-0061',
  },
]

const recentActivity: RecentActivity[] = [
  {
    id: '1',
    action: 'Invoice approved',
    subject: 'Draw #4 - $125,000',
    user: 'Sarah',
    timestamp: '15 min ago',
    type: 'approval',
    jobRef: 'J-2026-003',
  },
  {
    id: '2',
    action: 'Change order approved',
    subject: 'CO-003: Kitchen upgrade (+$18,500)',
    user: 'Jake',
    timestamp: '45 min ago',
    type: 'change-order',
    jobRef: 'J-2026-001',
  },
  {
    id: '3',
    action: 'Daily log submitted',
    subject: 'Smith Residence - Framing progress 85%',
    user: 'Mike',
    timestamp: '1 hour ago',
    type: 'daily-log',
    jobRef: 'J-2026-001',
  },
  {
    id: '4',
    action: 'Selection finalized',
    subject: 'Master bath tile - Porcelain Marble Look',
    user: 'Sarah Smith (Client)',
    timestamp: '2 hours ago',
    type: 'selection',
    jobRef: 'J-2026-001',
  },
  {
    id: '5',
    action: 'Job status updated',
    subject: 'Miller Addition moved to Closeout',
    user: 'Jake',
    timestamp: '2 hours ago',
    type: 'job',
    jobRef: 'J-2025-012',
  },
  {
    id: '6',
    action: 'Contract signed',
    subject: 'Thompson Renovation - $385,000',
    user: 'Client',
    timestamp: '3 hours ago',
    type: 'document',
    jobRef: 'J-2026-008',
  },
]

const overnightAlerts: OvernightAlert[] = [
  {
    id: '1',
    message: 'Weather alert: Heavy rain forecast Thu-Fri. 3 jobs have outdoor tasks scheduled.',
    category: 'action_required',
    source: 'Weather API',
    timestamp: '5:30 AM',
    jobRef: 'Multiple',
  },
  {
    id: '2',
    message: 'ABC Lumber invoice #4521 ($24,800) received via email and auto-processed. 96% confidence.',
    category: 'informational',
    source: 'AI Invoice Processing',
    timestamp: '11:45 PM',
    jobRef: 'J-2026-001',
  },
  {
    id: '3',
    message: 'Budget threshold alert: Wilson Custom Home electrical costs at 92% of budget.',
    category: 'action_required',
    source: 'Budget Monitoring',
    timestamp: '12:00 AM',
    jobRef: 'J-2026-005',
  },
  {
    id: '4',
    message: 'Client portal: Sarah Smith viewed draw request #4 and left a comment.',
    category: 'informational',
    source: 'Client Portal',
    timestamp: '9:15 PM',
    jobRef: 'J-2026-001',
  },
]

const mockCashPosition: CashPosition = {
  bankBalance: 847500,
  dueOutToday: 48200,
  dueOutThisWeek: 156800,
  drawsPending: 285000,
  netPosition: 927500,
  status: 'green',
}

const vendorFollowUps: VendorFollowUp[] = [
  {
    id: '1',
    vendorName: 'Coastal Electric',
    job: 'Wilson Custom Home',
    category: 'expired_insurance',
    daysOverdue: 5,
    description: 'GL insurance expired Feb 7',
  },
  {
    id: '2',
    vendorName: 'Premier Plumbing',
    job: 'Smith Residence',
    category: 'overdue_invoice',
    daysOverdue: 12,
    description: 'Invoice #3847 - $8,450 unprocessed',
  },
  {
    id: '3',
    vendorName: 'Southeast Roofing',
    job: 'Anderson Pool House',
    category: 'overdue_bid',
    daysOverdue: 3,
    description: 'Bid response past due date',
  },
]

const clientMessages: ClientMessage[] = [
  {
    id: '1',
    clientName: 'Sarah Smith',
    job: 'Smith Residence',
    preview: 'Question about the tile options for master bath...',
    waitTime: '4 hours',
    waitMinutes: 240,
    type: 'portal_message',
  },
  {
    id: '2',
    clientName: 'Tom Johnson',
    job: 'Johnson Beach House',
    preview: 'Weekly progress meeting',
    waitTime: 'Today 2:00 PM',
    waitMinutes: 0,
    type: 'meeting',
  },
]

// ---------------------------------------------------------------------------
// Color utilities
// ---------------------------------------------------------------------------

const cardColorClasses = {
  blue: {
    bg: 'bg-stone-50',
    icon: 'bg-stone-100 text-stone-600',
    text: 'text-stone-600',
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

  const strokeColor = color === 'green' ? '#22c55e' : color === 'blue' ? '#3b82f6' : color === 'amber' ? '#f59e0b' : '#8b5cf6'

  return (
    <svg viewBox="0 0 60 22" className="w-16 h-5">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  )
}

function SummaryCardComponent({ card }: { card: SummaryCard }) {
  const colors = cardColorClasses[card.color]
  const Icon = card.icon

  return (
    <div className={cn("rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow", colors.bg)}>
      <div className="flex items-center justify-between mb-2">
        <div className={cn("p-2 rounded-lg", colors.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-2">
          {card.sparkline && (
            <MiniSparkline data={card.sparkline} color={card.color} />
          )}
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
      </div>
      <div className="text-2xl font-bold text-warm-900">{card.value}</div>
      <div className="text-sm text-warm-500 mt-1">{card.label}</div>
      <div className="text-xs text-warm-400 mt-0.5">{card.changeLabel}</div>
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
    <div className="bg-white rounded-lg border border-warm-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-warm-900 text-sm">{title}</h4>
        <Icon className="h-4 w-4 text-warm-400" />
      </div>
      <div className={cn("bg-warm-50 rounded-lg flex items-center justify-center", height)}>
        <div className="text-center">
          {chartType === 'bar' && (
            <div className="flex justify-center gap-1 mb-2">
              {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                <div
                  key={i}
                  className="w-4 bg-gradient-to-t from-stone-500 to-stone-300 rounded-t"
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
          <span className="text-xs text-warm-400">Chart visualization</span>
        </div>
      </div>
    </div>
  )
}

function OvernightAlertWidget({ alerts }: { alerts: OvernightAlert[] }) {
  const getCategoryConfig = (category: OvernightAlert['category']) => {
    switch (category) {
      case 'action_required': return { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-700', icon: ShieldAlert }
      case 'informational': return { bg: 'bg-stone-50', text: 'text-stone-700', badge: 'bg-stone-100 text-stone-700', icon: Bell }
      case 'resolved': return { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100 text-green-700', icon: CheckSquare }
    }
  }

  return (
    <div className="bg-white rounded-lg border border-warm-200">
      <div className="px-4 py-3 border-b border-warm-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-indigo-600" />
            <h4 className="font-medium text-warm-900 text-sm">Overnight Summary</h4>
          </div>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">
            {alerts.filter(a => a.category === 'action_required').length} need action
          </span>
        </div>
      </div>
      <div className="divide-y divide-warm-100">
        {alerts.map(alert => {
          const config = getCategoryConfig(alert.category)
          const AlertIcon = config.icon
          return (
            <div key={alert.id} className={cn("px-4 py-2.5 hover:bg-warm-50 cursor-pointer", alert.category === 'action_required' && 'bg-red-50/30')}>
              <div className="flex items-start gap-3">
                <div className={cn("p-1 rounded-lg mt-0.5", config.badge)}>
                  <AlertIcon className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-warm-700">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-warm-400">
                    <span>{alert.source}</span>
                    <span className="text-warm-300">|</span>
                    <span>{alert.timestamp}</span>
                    {alert.jobRef && (
                      <>
                        <span className="text-warm-300">|</span>
                        <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded">{alert.jobRef}</span>
                      </>
                    )}
                  </div>
                </div>
                {alert.category === 'action_required' && (
                  <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium flex-shrink-0">Action</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CashPositionWidget({ data }: { data: CashPosition }) {
  const statusColors = {
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: 'Comfortable' },
    yellow: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: 'Tight' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'Action Needed' },
  }
  const status = statusColors[data.status]

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    return `$${amount.toLocaleString()}`
  }

  return (
    <div className={cn("rounded-lg border p-4", status.bg, status.border)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-warm-600" />
          <h4 className="font-medium text-warm-900 text-sm">Daily Cash Position</h4>
        </div>
        <span className={cn("text-xs px-2 py-0.5 rounded font-medium", status.text, data.status === 'green' ? 'bg-green-100' : data.status === 'yellow' ? 'bg-amber-100' : 'bg-red-100')}>
          {status.label}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-warm-600">Bank Balance</span>
          <span className="text-sm font-semibold text-warm-900">{formatCurrency(data.bankBalance)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-warm-600">Due Out Today</span>
          <span className="text-sm font-medium text-red-600">-{formatCurrency(data.dueOutToday)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-warm-600">Due Out This Week</span>
          <span className="text-sm font-medium text-red-600">-{formatCurrency(data.dueOutThisWeek)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-warm-600">Draws Pending</span>
          <span className="text-sm font-medium text-green-600">+{formatCurrency(data.drawsPending)}</span>
        </div>
        <div className="border-t border-warm-200 pt-2 flex items-center justify-between">
          <span className="text-sm font-medium text-warm-900">Net Position</span>
          <span className="text-base font-bold text-warm-900">{formatCurrency(data.netPosition)}</span>
        </div>
      </div>
      <button className="mt-3 text-xs text-stone-600 hover:text-stone-700 font-medium flex items-center gap-1">
        View cash flow forecast
        <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  )
}

function VendorFollowUpWidget({ items }: { items: VendorFollowUp[] }) {
  const getCategoryConfig = (cat: VendorFollowUp['category']) => {
    switch (cat) {
      case 'expired_insurance': return { label: 'Insurance', bg: 'bg-red-100 text-red-700', icon: ShieldAlert }
      case 'overdue_invoice': return { label: 'Invoice', bg: 'bg-amber-100 text-amber-700', icon: FileWarning }
      case 'overdue_bid': return { label: 'Bid', bg: 'bg-orange-100 text-orange-700', icon: Clock }
      case 'unanswered_rfi': return { label: 'RFI', bg: 'bg-purple-100 text-purple-700', icon: MessageSquare }
      case 'unacknowledged_bid': return { label: 'Bid Inv.', bg: 'bg-stone-100 text-stone-700', icon: Mail }
    }
  }

  return (
    <div className="bg-white rounded-lg border border-warm-200">
      <div className="px-4 py-3 border-b border-warm-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-orange-600" />
            <h4 className="font-medium text-warm-900 text-sm">Vendor Follow-Up</h4>
          </div>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-medium">
            {items.length} items
          </span>
        </div>
      </div>
      <div className="divide-y divide-warm-100">
        {items.map(item => {
          const config = getCategoryConfig(item.category)
          return (
            <div key={item.id} className="px-4 py-2.5 hover:bg-warm-50 cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-warm-900">{item.vendorName}</span>
                    <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", config.bg)}>{config.label}</span>
                  </div>
                  <p className="text-xs text-warm-500 mt-0.5">{item.description}</p>
                  <span className="text-xs text-warm-400">{item.job}</span>
                </div>
                <span className="text-xs font-medium text-red-600 flex-shrink-0">{item.daysOverdue}d overdue</span>
              </div>
            </div>
          )
        })}
      </div>
      <div className="px-4 py-2 border-t border-warm-200 bg-warm-50">
        <button className="text-sm text-stone-600 hover:text-stone-700 font-medium flex items-center gap-1">
          View all vendor items
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function ClientQueueWidget({ messages }: { messages: ClientMessage[] }) {
  return (
    <div className="bg-white rounded-lg border border-warm-200">
      <div className="px-4 py-3 border-b border-warm-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-cyan-600" />
            <h4 className="font-medium text-warm-900 text-sm">Client Messages</h4>
          </div>
          <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded font-medium">
            {messages.filter(m => m.type === 'portal_message').length} awaiting
          </span>
        </div>
      </div>
      <div className="divide-y divide-warm-100">
        {messages.map(msg => (
          <div key={msg.id} className="px-4 py-2.5 hover:bg-warm-50 cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-warm-900">{msg.clientName}</span>
                  {msg.type === 'meeting' && (
                    <span className="text-xs bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">Meeting</span>
                  )}
                </div>
                <p className="text-xs text-warm-500 mt-0.5 truncate">{msg.preview}</p>
                <span className="text-xs text-warm-400">{msg.job}</span>
              </div>
              <div className="flex-shrink-0 text-right">
                {msg.type === 'portal_message' && (
                  <span className={cn(
                    "text-xs font-medium px-1.5 py-0.5 rounded",
                    msg.waitMinutes > 120 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {msg.waitTime}
                  </span>
                )}
                {msg.type === 'meeting' && (
                  <span className="text-xs text-warm-500">{msg.waitTime}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TasksList({ tasks }: { tasks: TaskDue[] }) {
  const getPriorityColor = (priority: TaskDue['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-amber-100 text-amber-700'
      case 'low': return 'bg-warm-100 text-warm-600'
    }
  }

  const getTypeColor = (type: TaskDue['type']) => {
    switch (type) {
      case 'approval': return 'bg-green-50 text-green-600'
      case 'task': return 'bg-stone-50 text-stone-600'
      case 'rfi': return 'bg-purple-50 text-purple-600'
      case 'inspection': return 'bg-amber-50 text-amber-600'
      case 'selection': return 'bg-pink-50 text-pink-600'
      case 'invoice': return 'bg-emerald-50 text-emerald-600'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-warm-200">
      <div className="px-4 py-3 border-b border-warm-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-stone-600" />
            <h4 className="font-medium text-warm-900 text-sm">My Day - Due Today</h4>
          </div>
          <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium">
            {tasks.length} items
          </span>
        </div>
        <p className="text-xs text-warm-400 mt-1">Cross-project priority queue sorted by urgency</p>
      </div>
      <div className="divide-y divide-warm-100">
        {tasks.map(task => (
          <div key={task.id} className="px-4 py-3 hover:bg-warm-50 cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-warm-900 text-sm">{task.title}</div>
                <div className="text-xs text-warm-500 mt-0.5 flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {task.job}
                  </span>
                  <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded">{task.jobId}</span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {task.assignee}
                  </span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <div className="flex items-center gap-1">
                  <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", getTypeColor(task.type))}>
                    {task.sourceModule}
                  </span>
                  <span className={cn("text-xs px-2 py-0.5 rounded font-medium", getPriorityColor(task.priority))}>
                    {task.priority}
                  </span>
                </div>
                <span className="text-xs text-warm-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {task.dueTime}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 border-t border-warm-200 bg-warm-50">
        <button className="text-sm text-stone-600 hover:text-stone-700 font-medium flex items-center gap-1">
          View all tasks
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function InspectionsList({ inspections }: { inspections: UpcomingInspection[] }) {
  return (
    <div className="bg-white rounded-lg border border-warm-200">
      <div className="px-4 py-3 border-b border-warm-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-green-600" />
            <h4 className="font-medium text-warm-900 text-sm">Upcoming Inspections</h4>
          </div>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
            {inspections.length} scheduled
          </span>
        </div>
      </div>
      <div className="divide-y divide-warm-100">
        {inspections.map(inspection => (
          <div key={inspection.id} className="px-4 py-3 hover:bg-warm-50 cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium text-warm-900 text-sm">{inspection.type}</div>
                <div className="text-xs text-warm-500 mt-0.5 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {inspection.job}
                  </span>
                  <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded">{inspection.jobId}</span>
                </div>
                {inspection.permitRef && (
                  <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded mt-1 inline-block">
                    {inspection.permitRef}
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-warm-900">{inspection.date}</div>
                <div className="text-xs text-warm-500">{inspection.time}</div>
                {inspection.status === 'confirmed' && (
                  <div className="flex items-center gap-1 text-xs text-green-600 mt-1 justify-end">
                    <CheckSquare className="h-3 w-3" />
                    Confirmed
                  </div>
                )}
                {inspection.status === 'pending-confirmation' && (
                  <div className="flex items-center gap-1 text-xs text-amber-600 mt-1 justify-end">
                    <AlertCircle className="h-3 w-3" />
                    Pending
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 border-t border-warm-200 bg-warm-50">
        <button className="text-sm text-stone-600 hover:text-stone-700 font-medium flex items-center gap-1">
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
      case 'daily-log': return ClipboardCheck
      case 'approval': return CheckSquare
      case 'selection': return Eye
    }
  }

  const getTypeColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'job': return 'bg-stone-100 text-stone-600'
      case 'invoice': return 'bg-green-100 text-green-600'
      case 'change-order': return 'bg-amber-100 text-amber-600'
      case 'document': return 'bg-purple-100 text-purple-600'
      case 'daily-log': return 'bg-cyan-100 text-cyan-600'
      case 'approval': return 'bg-emerald-100 text-emerald-600'
      case 'selection': return 'bg-pink-100 text-pink-600'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-warm-200">
      <div className="px-4 py-3 border-b border-warm-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-600" />
            <h4 className="font-medium text-warm-900 text-sm">Recent Activity</h4>
          </div>
        </div>
      </div>
      <div className="divide-y divide-warm-100">
        {activities.map(activity => {
          const Icon = getTypeIcon(activity.type)
          return (
            <div key={activity.id} className="px-4 py-3 hover:bg-warm-50 cursor-pointer">
              <div className="flex items-start gap-3">
                <div className={cn("p-1.5 rounded-lg", getTypeColor(activity.type))}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-warm-900">
                    <span className="font-medium">{activity.action}</span>
                    <span className="text-warm-500"> - {activity.subject}</span>
                  </div>
                  <div className="text-xs text-warm-500 mt-0.5 flex items-center gap-2">
                    <span>{activity.user}</span>
                    <span className="text-warm-300">|</span>
                    <span>{activity.timestamp}</span>
                    {activity.jobRef && (
                      <>
                        <span className="text-warm-300">|</span>
                        <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded">{activity.jobRef}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="px-4 py-2 border-t border-warm-200 bg-warm-50">
        <button className="text-sm text-stone-600 hover:text-stone-700 font-medium flex items-center gap-1">
          View all activity
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function PendingApprovalsBar() {
  const approvals = [
    { label: 'Invoices', count: 3, amount: '$96,450' },
    { label: 'Change Orders', count: 2, amount: '$31,500' },
    { label: 'POs', count: 1, amount: '$24,800' },
    { label: 'Draws', count: 1, amount: '$125,000' },
  ]

  return (
    <div className="bg-white border-b border-warm-200 px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <Bell className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-medium text-warm-700">Pending Approvals</span>
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
          {approvals.reduce((sum, a) => sum + a.count, 0)} total
        </span>
      </div>
      <div className="flex items-center gap-3">
        {approvals.map(approval => (
          <div
            key={approval.label}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors"
          >
            <span className="text-xs font-medium text-amber-800">{approval.count}</span>
            <span className="text-xs text-amber-700">{approval.label}</span>
            <span className="text-xs font-semibold text-amber-900">{approval.amount}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function DashboardPreview() {
  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-warm-900">Company Dashboard</h3>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">All Systems Operational</span>
              <span className="flex items-center gap-1 text-xs text-warm-400">
                <RefreshCw className="h-3 w-3" />
                Auto-refresh: 5 min
              </span>
            </div>
            <div className="text-sm text-warm-500 mt-0.5 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                February 12, 2026
              </span>
              <span className="flex items-center gap-1">
                <Sun className="h-4 w-4 text-amber-500" />
                72F, Sunny - Wilmington, NC
              </span>
              <span className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                Revenue trending 8% above target
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Calendar className="h-4 w-4" />
              This Month
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Eye className="h-4 w-4" />
              Customize
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700">
              <BarChart3 className="h-4 w-4" />
              Full Report
            </button>
          </div>
        </div>
      </div>

      {/* Pending Approvals Bar */}
      <PendingApprovalsBar />

      {/* Summary Cards with Sparklines */}
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="grid grid-cols-4 gap-4">
          {summaryCards.map(card => (
            <SummaryCardComponent key={card.id} card={card} />
          ))}
        </div>
      </div>

      {/* Overnight Alerts + Cash Position Row */}
      <div className="p-4 grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <OvernightAlertWidget alerts={overnightAlerts} />
        </div>
        <CashPositionWidget data={mockCashPosition} />
      </div>

      {/* Charts Row */}
      <div className="px-4 pb-4 grid grid-cols-3 gap-4">
        <ChartPlaceholder title="Revenue Trend" icon={LineChart} chartType="line" />
        <ChartPlaceholder title="Job Status Breakdown" icon={PieChart} chartType="pie" />
        <ChartPlaceholder title="Cash Flow Forecast" icon={BarChart3} chartType="bar" />
      </div>

      {/* Quick Lists Row */}
      <div className="px-4 pb-4 grid grid-cols-3 gap-4">
        <TasksList tasks={tasksDueToday} />
        <InspectionsList inspections={upcomingInspections} />
        <ActivityFeed activities={recentActivity} />
      </div>

      {/* Vendor Follow-Up + Client Messages Row */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-4">
        <VendorFollowUpWidget items={vendorFollowUps} />
        <ClientQueueWidget messages={clientMessages} />
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
            <span className="ml-1 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">AI-generated</span>
          </p>
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="px-4 py-4 bg-white border-t border-warm-200">
        <AIFeaturesPanel
          title="Dashboard AI Features"
          columns={2}
          features={[
            {
              feature: 'Priority Alerts',
              trigger: 'real-time',
              insight: 'AI-ranked urgent items needing attention. Currently flagging 3 high-priority items: overdue draw approval, expired vendor insurance, and weather-impacted schedule conflicts.',
              severity: 'critical',
              confidence: 94,
            },
            {
              feature: 'Project Health',
              trigger: 'daily',
              insight: 'Overall project health scoring across your portfolio. 9 of 12 active jobs rated "Healthy", 2 rated "At Risk" due to budget overruns, 1 rated "Critical" requiring immediate attention.',
              severity: 'warning',
              confidence: 91,
            },
            {
              feature: 'Action Recommendations',
              trigger: 'real-time',
              insight: 'Suggested next actions based on current state: Schedule Thompson Renovation kick-off, follow up on 3 overdue invoices, and review Wilson Custom Home electrical budget before next draw.',
              severity: 'info',
              confidence: 87,
            },
            {
              feature: 'Risk Indicators',
              trigger: 'daily',
              insight: 'Early warning for project risks. Detecting potential schedule slip on Anderson Pool House due to permit delays, and cash flow tightness projected for end of month if draws are not submitted.',
              severity: 'warning',
              confidence: 82,
            },
            {
              feature: 'Performance Insights',
              trigger: 'weekly',
              insight: 'Key metrics and trends: Revenue trending 8% above target, profit margin 0.8% below target, client satisfaction score at 94%. Draw cycle time improved by 2 days vs last quarter.',
              severity: 'success',
              confidence: 96,
            },
          ]}
        />
      </div>
    </div>
  )
}
