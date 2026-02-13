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
  Sun,
  CloudRain,
  Wind,
  Thermometer,
  Flag,
  Diamond,
  Shield,
  ExternalLink,
  Phone,
  Mail,
  Wrench,
  Hash,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  status: 'pre-con' | 'active' | 'closeout' | 'complete' | 'warranty'
  progress: number
  contractValue: number
  currentContractValue: number
  costToDate: number
  billedToDate: number
  projectedMargin: number
  pmAssigned: string
  superintendent: string
  startDate: string
  expectedCompletion: string
  predictedCompletion: string
  jobNumber: string
  projectType: string
  squareFootage: number
  lotNumber: string
  subdivision: string
  daysSinceStart: number
  estimatedDaysRemaining: number
  aiRiskScore: number
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
  drillDownTo?: string
}

interface ActivityItem {
  id: string
  type: 'daily-log' | 'photo' | 'change-order' | 'invoice' | 'rfi' | 'selection' | 'comment' | 'inspection' | 'punch-list'
  title: string
  description: string
  user: string
  timestamp: string
  metadata?: string
  refId?: string
}

interface QuickLink {
  id: string
  label: string
  icon: React.ElementType
  count?: number
  alert?: boolean
  badgeColor?: string
}

interface WeatherData {
  current: { condition: string; temp: number; icon: React.ElementType }
  forecast: { day: string; condition: string; high: number; low: number; icon: React.ElementType; riskFlag?: boolean }[]
}

interface Milestone {
  id: string
  name: string
  date: string
  predictedDate?: string
  status: 'completed' | 'current' | 'upcoming' | 'at-risk'
  completedDate?: string
}

interface TeamAssignment {
  id: string
  name: string
  role: string
  company?: string
  phone: string
  trade?: string
  status: 'active' | 'scheduled' | 'completed'
}

interface RiskItem {
  id: string
  description: string
  likelihood: 'high' | 'medium' | 'low'
  impact: 'high' | 'medium' | 'low'
  status: 'open' | 'mitigated' | 'occurred'
  source: 'ai' | 'manual'
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

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
  contractValue: 2250000,
  currentContractValue: 2450000,
  costToDate: 1425000,
  billedToDate: 1350000,
  projectedMargin: 11.2,
  pmAssigned: 'Jake Mitchell',
  superintendent: 'Mike Thompson',
  startDate: 'Jan 15, 2026',
  expectedCompletion: 'Aug 30, 2026',
  predictedCompletion: 'Sep 4, 2026',
  jobNumber: 'J-2026-001',
  projectType: 'Custom Home',
  squareFootage: 4200,
  lotNumber: 'Lot 15',
  subdivision: 'Ocean Ridge',
  daysSinceStart: 28,
  estimatedDaysRemaining: 200,
  aiRiskScore: 72,
}

const mockMetrics: MetricCard[] = [
  {
    id: '1',
    label: 'Contract Value',
    value: '$2.45M',
    subValue: 'Original: $2.25M (+$200K COs)',
    icon: DollarSign,
    status: 'neutral',
    drillDownTo: '/budget',
  },
  {
    id: '2',
    label: 'Budget Status',
    value: '11.2%',
    subValue: 'Projected Margin',
    trend: 'down',
    trendValue: '-3.8% from 15% target',
    icon: BarChart3,
    status: 'warning',
    drillDownTo: '/budget',
  },
  {
    id: '3',
    label: 'Schedule Status',
    value: '+5 days',
    subValue: 'vs. baseline',
    trend: 'down',
    trendValue: 'Weather delays (AI predicted)',
    icon: CalendarDays,
    status: 'warning',
    drillDownTo: '/schedule',
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
    drillDownTo: '/change-orders',
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
    refId: 'Phase: Framing',
  },
  {
    id: '3',
    type: 'change-order',
    title: 'Change Order #5 Approved',
    description: 'Client approved upgraded impact windows - PGT WinGuard series.',
    user: 'Sarah Smith (Client)',
    timestamp: 'Yesterday',
    metadata: '+$18,500',
    refId: 'CO-005',
  },
  {
    id: '4',
    type: 'invoice',
    title: 'Draw Request #4 Submitted',
    description: 'Submitted for client approval - Framing milestone complete.',
    user: 'Jake Mitchell',
    timestamp: 'Yesterday',
    metadata: '$245,000',
    refId: 'DRW-004',
  },
  {
    id: '5',
    type: 'rfi',
    title: 'RFI #12 Response Received',
    description: 'Architect clarified window header detail for master bedroom.',
    user: 'Design Associates',
    timestamp: '2 days ago',
    refId: 'RFI-012',
  },
  {
    id: '6',
    type: 'inspection',
    title: 'Framing Inspection Passed',
    description: 'Rough framing inspection completed with no corrections required.',
    user: 'County Building Dept',
    timestamp: '3 days ago',
    refId: 'BLD-2026-0045',
  },
  {
    id: '7',
    type: 'selection',
    title: 'Master Bath Tile Selected',
    description: 'Client selected Porcelain Marble Look 24x24 - Lead time 3 weeks.',
    user: 'Sarah Smith (Client)',
    timestamp: '3 days ago',
    metadata: '$4,200 (under allowance by $800)',
    refId: 'SEL-MB-001',
  },
]

const mockQuickLinks: QuickLink[] = [
  { id: '1', label: 'Budget', icon: DollarSign, alert: true, badgeColor: 'amber' },
  { id: '2', label: 'Schedule', icon: Calendar, alert: true, badgeColor: 'amber' },
  { id: '3', label: 'Daily Logs', icon: ClipboardList, count: 47 },
  { id: '4', label: 'Photos', icon: Camera, count: 234 },
  { id: '5', label: 'Documents', icon: FileText, count: 56 },
  { id: '6', label: 'Change Orders', icon: FileEdit, count: 6 },
  { id: '7', label: 'Invoices', icon: Receipt, count: 4 },
  { id: '8', label: 'Selections', icon: Package, count: 28 },
  { id: '9', label: 'RFIs', icon: MessageSquare, count: 12 },
  { id: '10', label: 'Team', icon: Users },
  { id: '11', label: 'Punch List', icon: Wrench, count: 0 },
  { id: '12', label: 'Permits', icon: Shield, count: 3 },
]

const mockWeather: WeatherData = {
  current: { condition: 'Sunny', temp: 72, icon: Sun },
  forecast: [
    { day: 'Wed', condition: 'Sunny', high: 74, low: 58, icon: Sun },
    { day: 'Thu', condition: 'Rain', high: 65, low: 52, icon: CloudRain, riskFlag: true },
    { day: 'Fri', condition: 'Rain', high: 62, low: 50, icon: CloudRain, riskFlag: true },
  ],
}

const mockMilestones: Milestone[] = [
  { id: '1', name: 'Permit Issued', date: 'Jan 10', status: 'completed', completedDate: 'Jan 8' },
  { id: '2', name: 'Breaking Ground', date: 'Jan 15', status: 'completed', completedDate: 'Jan 15' },
  { id: '3', name: 'Foundation Complete', date: 'Feb 1', status: 'completed', completedDate: 'Feb 3' },
  { id: '4', name: 'Framing Complete', date: 'Feb 15', status: 'current', predictedDate: 'Feb 18' },
  { id: '5', name: 'Dry-In', date: 'Mar 1', status: 'upcoming', predictedDate: 'Mar 5' },
  { id: '6', name: 'Rough-In Complete', date: 'Apr 15', status: 'upcoming' },
  { id: '7', name: 'Drywall Complete', date: 'May 15', status: 'upcoming' },
  { id: '8', name: 'Substantial Completion', date: 'Aug 15', status: 'upcoming' },
]

const mockTeam: TeamAssignment[] = [
  { id: '1', name: 'Jake Mitchell', role: 'Project Manager', phone: '(910) 555-0101', status: 'active' },
  { id: '2', name: 'Mike Thompson', role: 'Superintendent', phone: '(910) 555-0102', status: 'active' },
  { id: '3', name: 'BuildRight Framing', role: 'Framing', company: 'BuildRight LLC', phone: '(910) 555-0201', trade: 'Framing', status: 'active' },
  { id: '4', name: 'Coastal Electric', role: 'Electrical', company: 'Coastal Electric Inc', phone: '(910) 555-0202', trade: 'Electrical', status: 'scheduled' },
  { id: '5', name: 'Premier Plumbing', role: 'Plumbing', company: 'Premier Plumbing Co', phone: '(910) 555-0203', trade: 'Plumbing', status: 'scheduled' },
]

const mockRisks: RiskItem[] = [
  { id: '1', description: 'Weather delays impacting outdoor work schedule', likelihood: 'high', impact: 'medium', status: 'occurred', source: 'ai' },
  { id: '2', description: 'Selection delays may push finish timeline', likelihood: 'medium', impact: 'medium', status: 'open', source: 'ai' },
  { id: '3', description: 'Material cost escalation on specialty items', likelihood: 'medium', impact: 'high', status: 'open', source: 'manual' },
]

// ---------------------------------------------------------------------------
// Status configs
// ---------------------------------------------------------------------------

const statuses = [
  { id: 'pre-con', label: 'Pre-Construction', color: 'bg-blue-500', bgLight: 'bg-blue-50', textColor: 'text-blue-700' },
  { id: 'active', label: 'Active', color: 'bg-green-500', bgLight: 'bg-green-50', textColor: 'text-green-700' },
  { id: 'closeout', label: 'Closeout', color: 'bg-amber-500', bgLight: 'bg-amber-50', textColor: 'text-amber-700' },
  { id: 'complete', label: 'Complete', color: 'bg-gray-500', bgLight: 'bg-gray-100', textColor: 'text-gray-700' },
  { id: 'warranty', label: 'Warranty', color: 'bg-purple-500', bgLight: 'bg-purple-50', textColor: 'text-purple-700' },
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
    case 'inspection': return Shield
    case 'punch-list': return Wrench
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
    case 'inspection': return 'bg-emerald-100 text-emerald-600'
    case 'punch-list': return 'bg-orange-100 text-orange-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function SummaryHeader({ job }: { job: JobOverview }) {
  const statusConfig = getStatusConfig(job.status)

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700'
    if (score >= 60) return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-xl", statusConfig.bgLight)}>
            <Building2 className={cn("h-8 w-8", statusConfig.textColor)} />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{job.name}</h2>
              <span className={cn(
                "text-xs px-2.5 py-1 rounded font-medium",
                statusConfig.bgLight,
                statusConfig.textColor
              )}>
                {statusConfig.label}
              </span>
              <span className="text-xs text-gray-400 font-mono">{job.jobNumber}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{job.projectType}</span>
              <span className={cn("text-xs px-2 py-0.5 rounded font-medium", getRiskColor(job.aiRiskScore))}>
                Health: {job.aiRiskScore}/100
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-gray-400" />
                <span>{job.client}</span>
                <a href={`mailto:${job.clientEmail}`} className="text-blue-500 hover:text-blue-600">
                  <Mail className="h-3.5 w-3.5" />
                </a>
                <a href={`tel:${job.clientPhone}`} className="text-blue-500 hover:text-blue-600">
                  <Phone className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{job.address}, {job.city}, {job.state} {job.zip}</span>
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
                {job.predictedCompletion !== job.expectedCompletion && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                    AI predicted: {job.predictedCompletion}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Hash className="h-4 w-4 text-gray-400" />
                <span>{job.squareFootage.toLocaleString()} SF</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <span>{job.subdivision} - {job.lotNumber}</span>
              <span className="text-gray-300">|</span>
              <span>Day {job.daysSinceStart} of ~{job.daysSinceStart + job.estimatedDaysRemaining}</span>
              <span className="text-gray-300">|</span>
              <span>~{job.estimatedDaysRemaining} days remaining</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Project Manager</div>
          <div className="font-medium text-gray-900">{job.pmAssigned}</div>
          <div className="text-sm text-gray-500 mt-1">Superintendent</div>
          <div className="font-medium text-gray-900">{job.superintendent}</div>
          <button className="mt-2 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 justify-end">
            <ExternalLink className="h-3 w-3" />
            Client Portal
          </button>
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
    <div className={cn("rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow", colors.bg)}>
      <div className="flex items-start justify-between">
        <div className={cn("p-2 rounded-lg", colors.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        {metric.trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            metric.trend === 'up' ? "text-green-600" : metric.trend === 'down' ? "text-amber-600" : "text-gray-500"
          )}>
            {metric.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : metric.trend === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
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
      {metric.drillDownTo && (
        <div className="mt-1 flex items-center gap-1 text-xs text-blue-500">
          <ExternalLink className="h-3 w-3" />
          View details
        </div>
      )}
    </div>
  )
}

function WeatherWidget({ weather }: { weather: WeatherData }) {
  const CurrentIcon = weather.current.icon
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900 text-sm">Site Weather</h4>
        <span className="text-xs text-gray-400">Wilmington, NC</span>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <CurrentIcon className="h-8 w-8 text-amber-500" />
        <div>
          <div className="text-2xl font-bold text-gray-900">{weather.current.temp}F</div>
          <div className="text-sm text-gray-500">{weather.current.condition}</div>
        </div>
      </div>
      <div className="space-y-2">
        {weather.forecast.map((day, i) => {
          const ForecastIcon = day.icon
          return (
            <div key={i} className={cn("flex items-center justify-between px-2 py-1.5 rounded", day.riskFlag ? "bg-red-50" : "")}>
              <div className="flex items-center gap-2">
                <ForecastIcon className={cn("h-4 w-4", day.riskFlag ? "text-red-500" : "text-gray-400")} />
                <span className="text-sm text-gray-700">{day.day}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{day.high}F / {day.low}F</span>
                {day.riskFlag && (
                  <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">Outdoor risk</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MilestoneTracker({ milestones }: { milestones: Milestone[] }) {
  const getMilestoneConfig = (status: Milestone['status']) => {
    switch (status) {
      case 'completed': return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', line: 'bg-green-500' }
      case 'current': return { icon: Flag, color: 'text-blue-600', bg: 'bg-blue-100', line: 'bg-blue-500' }
      case 'upcoming': return { icon: Diamond, color: 'text-gray-400', bg: 'bg-gray-100', line: 'bg-gray-300' }
      case 'at-risk': return { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100', line: 'bg-amber-500' }
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h4 className="font-semibold text-gray-900 text-sm">Key Milestones</h4>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {milestones.map((milestone, idx) => {
            const config = getMilestoneConfig(milestone.status)
            const Icon = config.icon
            return (
              <div key={milestone.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn("p-1 rounded-full", config.bg)}>
                    <Icon className={cn("h-3.5 w-3.5", config.color)} />
                  </div>
                  {idx < milestones.length - 1 && (
                    <div className={cn("w-0.5 h-4 mt-1", config.line)} />
                  )}
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <span className={cn("text-sm font-medium", milestone.status === 'completed' ? 'text-gray-500' : 'text-gray-900')}>
                      {milestone.name}
                    </span>
                    {milestone.completedDate && (
                      <span className="text-xs text-green-600 ml-2">{milestone.completedDate}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">{milestone.date}</span>
                    {milestone.predictedDate && milestone.predictedDate !== milestone.date && (
                      <div className="text-xs text-amber-600 font-medium">AI: {milestone.predictedDate}</div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function TeamRoster({ team }: { team: TeamAssignment[] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900 text-sm">Project Team</h4>
          <span className="text-xs text-gray-400">{team.length} members</span>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {team.map(member => (
          <div key={member.id} className="px-4 py-2.5 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-900">{member.name}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{member.role}</span>
                  {member.trade && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{member.trade}</span>
                  )}
                </div>
                {member.company && (
                  <span className="text-xs text-gray-400">{member.company}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded font-medium",
                  member.status === 'active' ? "bg-green-100 text-green-700" :
                  member.status === 'scheduled' ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-600"
                )}>
                  {member.status}
                </span>
                <a href={`tel:${member.phone}`} className="text-gray-400 hover:text-blue-600">
                  <Phone className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RiskRegister({ risks }: { risks: RiskItem[] }) {
  const getLikelihoodColor = (val: string) => {
    switch (val) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-amber-100 text-amber-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900 text-sm">Risk Register</h4>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
            {risks.filter(r => r.status === 'open').length} open
          </span>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {risks.map(risk => (
          <div key={risk.id} className="px-4 py-2.5 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-700">{risk.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", getLikelihoodColor(risk.likelihood))}>
                    L: {risk.likelihood}
                  </span>
                  <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", getLikelihoodColor(risk.impact))}>
                    I: {risk.impact}
                  </span>
                  {risk.source === 'ai' && (
                    <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">AI-detected</span>
                  )}
                </div>
              </div>
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ml-2",
                risk.status === 'open' ? "bg-red-100 text-red-700" :
                risk.status === 'mitigated' ? "bg-green-100 text-green-700" :
                "bg-amber-100 text-amber-700"
              )}>
                {risk.status}
              </span>
            </div>
          </div>
        ))}
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
        {activities.map((activity) => {
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
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {activity.refId && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{activity.refId}</span>
                      )}
                      {activity.metadata && (
                        <span className={cn(
                          "text-xs font-medium px-2 py-1 rounded",
                          activity.type === 'change-order' ? "bg-amber-100 text-amber-700" :
                          activity.type === 'invoice' ? "bg-green-100 text-green-700" :
                          activity.type === 'selection' ? "bg-pink-100 text-pink-700" :
                          "bg-gray-100 text-gray-600"
                        )}>
                          {activity.metadata}
                        </span>
                      )}
                    </div>
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
        <div className="grid grid-cols-6 gap-3">
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
                    <div className={cn("absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white",
                      link.badgeColor === 'amber' ? 'bg-amber-500' : 'bg-red-500'
                    )} />
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
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
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
                Client engagement excellent - 100% draw approval rate, avg 2-day turnaround. Selection completion at 60%.
              </p>
            </div>
          </div>
          <div className="mt-2 text-right">
            <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">AI-generated health analysis</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

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

      {/* Quick Links */}
      <div className="px-6 py-4">
        <QuickLinksGrid links={mockQuickLinks} />
      </div>

      {/* Main Content Grid */}
      <div className="px-6 pb-4 grid grid-cols-3 gap-6">
        {/* Activity Timeline - Takes 2 columns */}
        <div className="col-span-2">
          <ActivityTimeline activities={mockActivity} />
        </div>

        {/* Right sidebar - Takes 1 column */}
        <div className="col-span-1 space-y-4">
          <WeatherWidget weather={mockWeather} />
          <MilestoneTracker milestones={mockMilestones} />
        </div>
      </div>

      {/* Team & Risk Row */}
      <div className="px-6 pb-4 grid grid-cols-2 gap-6">
        <TeamRoster team={mockTeam} />
        <RiskRegister risks={mockRisks} />
      </div>

      {/* AI Insights Bar */}
      <AIInsightsBar />
    </div>
  )
}
