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
  ListChecks,
  Image,
  FolderOpen,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIFeaturesPanel, type AIFeatureCardProps } from '@/components/skeleton/ui'

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
  aiHealthScore: number
  warrantyStatus: 'in-construction' | 'warranty-period' | 'warranty-expired'
  warrantyEndDate?: string
  phaseProgress: { phase: string; percent: number }[]
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

interface DocumentShortcut {
  id: string
  name: string
  icon: React.ElementType
  lastUpdated: string
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

interface NextStepItem {
  id: string
  action: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  assignee: string
}

type JobTab = 'overview' | 'budget' | 'schedule' | 'invoices' | 'photos' | 'files' | 'daily-logs'

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
  aiHealthScore: 72,
  warrantyStatus: 'in-construction',
  warrantyEndDate: 'Mar 2027',
  phaseProgress: [
    { phase: 'Site Work', percent: 100 },
    { phase: 'Foundation', percent: 100 },
    { phase: 'Framing', percent: 85 },
    { phase: 'Roofing', percent: 60 },
    { phase: 'MEP Rough-In', percent: 20 },
    { phase: 'Insulation & Drywall', percent: 0 },
    { phase: 'Finishes', percent: 0 },
    { phase: 'Final', percent: 0 },
  ],
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

const mockDocumentShortcuts: DocumentShortcut[] = [
  { id: '1', name: 'Contract', icon: FileText, lastUpdated: 'Jan 10, 2026' },
  { id: '2', name: 'Plans', icon: BookOpen, lastUpdated: 'Jan 8, 2026' },
  { id: '3', name: 'Specifications', icon: ClipboardList, lastUpdated: 'Jan 8, 2026' },
  { id: '4', name: 'Permits', icon: Shield, lastUpdated: 'Feb 5, 2026' },
  { id: '5', name: 'Insurance', icon: Shield, lastUpdated: 'Jan 3, 2026' },
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

const mockNextSteps: NextStepItem[] = [
  { id: '1', action: 'Schedule electrical rough-in inspection', priority: 'urgent', assignee: 'Mike Thompson' },
  { id: '2', action: 'Follow up on cabinet submittal', priority: 'high', assignee: 'Jake Mitchell' },
  { id: '3', action: 'Review upcoming draw request', priority: 'high', assignee: 'Jake Mitchell' },
  { id: '4', action: 'Confirm HVAC delivery date', priority: 'medium', assignee: 'Mike Thompson' },
  { id: '5', action: 'Send weekly update to client', priority: 'medium', assignee: 'Jake Mitchell' },
]

const mockAIFeatures: AIFeatureCardProps[] = [
  {
    feature: 'Job Health Summary',
    trigger: 'Real-time',
    insight: 'Health Score: 72/100. Factors: Budget (+15), Schedule (-8), Quality (+10), Client Comm (+5)',
    severity: 'warning',
    confidence: 85,
  },
  {
    feature: 'Next Steps',
    trigger: 'Daily',
    insight: 'Recommended: 1. Schedule framing inspection (urgent), 2. Review CO-004 pricing, 3. Send weekly update to client',
    severity: 'info',
    confidence: 90,
  },
  {
    feature: 'Risk Detection',
    trigger: 'Real-time',
    insight: '2 new risks detected: Weather delay likely Thu-Fri, ABC Drywall availability concern week of Mar 10',
    severity: 'warning',
    confidence: 78,
  },
  {
    feature: 'Predicted Completion',
    trigger: 'On change',
    insight: 'Current trajectory: Mar 28 (original: Mar 22). Main factors: Permit delay, weather forecast',
    severity: 'warning',
    confidence: 82,
  },
  {
    feature: 'Milestone Alert',
    trigger: 'Real-time',
    insight: 'Drywall start at risk. Dependency: Framing inspection must pass by Feb 20',
    severity: 'critical',
    confidence: 88,
  },
]

// ---------------------------------------------------------------------------
// Status configs
// ---------------------------------------------------------------------------

const statuses = [
  { id: 'pre-con', label: 'Pre-Construction', color: 'bg-stone-500', bgLight: 'bg-stone-50', textColor: 'text-stone-700' },
  { id: 'active', label: 'Active', color: 'bg-green-500', bgLight: 'bg-green-50', textColor: 'text-green-700' },
  { id: 'closeout', label: 'Closeout', color: 'bg-amber-500', bgLight: 'bg-amber-50', textColor: 'text-amber-700' },
  { id: 'complete', label: 'Complete', color: 'bg-warm-500', bgLight: 'bg-warm-100', textColor: 'text-warm-700' },
  { id: 'warranty', label: 'Warranty', color: 'bg-purple-500', bgLight: 'bg-purple-50', textColor: 'text-purple-700' },
]

const warrantyStatuses = {
  'in-construction': { label: 'In Construction', color: 'bg-stone-100 text-stone-700' },
  'warranty-period': { label: 'Warranty Period', color: 'bg-purple-100 text-purple-700' },
  'warranty-expired': { label: 'Warranty Expired', color: 'bg-warm-100 text-warm-600' },
}

const jobTabs: { id: JobTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'budget', label: 'Budget' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'photos', label: 'Photos' },
  { id: 'files', label: 'Files' },
  { id: 'daily-logs', label: 'Daily Logs' },
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
    case 'daily-log': return 'bg-stone-100 text-stone-600'
    case 'photo': return 'bg-purple-100 text-purple-600'
    case 'change-order': return 'bg-amber-100 text-amber-600'
    case 'invoice': return 'bg-green-100 text-green-600'
    case 'rfi': return 'bg-cyan-100 text-cyan-600'
    case 'selection': return 'bg-pink-100 text-pink-600'
    case 'comment': return 'bg-warm-100 text-warm-600'
    case 'inspection': return 'bg-emerald-100 text-emerald-600'
    case 'punch-list': return 'bg-orange-100 text-orange-600'
    default: return 'bg-warm-100 text-warm-600'
  }
}

function getPriorityConfig(priority: NextStepItem['priority']) {
  switch (priority) {
    case 'urgent': return { color: 'bg-red-100 text-red-700', label: 'Urgent' }
    case 'high': return { color: 'bg-amber-100 text-amber-700', label: 'High' }
    case 'medium': return { color: 'bg-stone-100 text-stone-700', label: 'Medium' }
    case 'low': return { color: 'bg-warm-100 text-warm-600', label: 'Low' }
  }
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function JobNavigationTabs({ activeTab }: { activeTab: JobTab }) {
  return (
    <div className="bg-white border-b border-warm-200">
      <div className="flex items-center gap-1 px-6">
        {jobTabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-stone-500 text-stone-600"
                : "border-transparent text-warm-500 hover:text-warm-700 hover:border-warm-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function SummaryHeader({ job }: { job: JobOverview }) {
  const statusConfig = getStatusConfig(job.status)
  const warrantyConfig = warrantyStatuses[job.warrantyStatus]

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700'
    if (score >= 60) return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="bg-white border-b border-warm-200 px-6 py-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-xl", statusConfig.bgLight)}>
            <Building2 className={cn("h-8 w-8", statusConfig.textColor)} />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-warm-900">{job.name}</h2>
              <span className={cn(
                "text-xs px-2.5 py-1 rounded font-medium",
                statusConfig.bgLight,
                statusConfig.textColor
              )}>
                {statusConfig.label}
              </span>
              <span className="text-xs text-warm-400 font-mono">{job.jobNumber}</span>
              <span className="text-xs bg-warm-100 text-warm-600 px-1.5 py-0.5 rounded">{job.projectType}</span>
              <span className={cn("text-xs px-2 py-0.5 rounded font-medium", getHealthColor(job.aiHealthScore))}>
                Health: {job.aiHealthScore}/100
              </span>
              {/* Warranty Status Badge */}
              <span className={cn("text-xs px-2 py-0.5 rounded font-medium", warrantyConfig.color)}>
                {warrantyConfig.label}
                {job.warrantyStatus === 'warranty-period' && job.warrantyEndDate && (
                  <span className="ml-1">- Ends: {job.warrantyEndDate}</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-warm-600">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-warm-400" />
                <span>{job.client}</span>
                <a href={`mailto:${job.clientEmail}`} className="text-stone-500 hover:text-stone-600">
                  <Mail className="h-3.5 w-3.5" />
                </a>
                <a href={`tel:${job.clientPhone}`} className="text-stone-500 hover:text-stone-600">
                  <Phone className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-warm-400" />
                <span>{job.address}, {job.city}, {job.state} {job.zip}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-warm-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-warm-400" />
                <span>Started: {job.startDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-warm-400" />
                <span>Expected: {job.expectedCompletion}</span>
                {job.predictedCompletion !== job.expectedCompletion && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                    AI predicted: {job.predictedCompletion}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Hash className="h-4 w-4 text-warm-400" />
                <span>{job.squareFootage.toLocaleString()} SF</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-warm-400">
              <span>{job.subdivision} - {job.lotNumber}</span>
              <span className="text-warm-300">|</span>
              <span>Day {job.daysSinceStart} of ~{job.daysSinceStart + job.estimatedDaysRemaining}</span>
              <span className="text-warm-300">|</span>
              <span>~{job.estimatedDaysRemaining} days remaining</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-warm-500">Project Manager</div>
          <div className="font-medium text-warm-900">{job.pmAssigned}</div>
          <div className="text-sm text-warm-500 mt-1">Superintendent</div>
          <div className="font-medium text-warm-900">{job.superintendent}</div>
          <button className="mt-2 text-xs text-stone-600 hover:text-stone-700 flex items-center gap-1 justify-end">
            <ExternalLink className="h-3 w-3" />
            Client Portal
          </button>
        </div>
      </div>
    </div>
  )
}

function PercentCompleteVisualization({ job }: { job: JobOverview }) {
  const statusConfig = getStatusConfig(job.status)

  return (
    <div className="bg-white rounded-lg border border-warm-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-warm-900">Project Progress</h4>
        <span className={cn("text-2xl font-bold", statusConfig.textColor)}>{job.progress}%</span>
      </div>

      {/* Large Progress Bar */}
      <div className="mb-4">
        <div className="h-6 bg-warm-100 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all flex items-center justify-end pr-2", statusConfig.color)}
            style={{ width: `${job.progress}%` }}
          >
            {job.progress > 15 && (
              <span className="text-xs font-medium text-white">{job.progress}% Complete</span>
            )}
          </div>
        </div>
      </div>

      {/* Phase Breakdown */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-warm-500 uppercase tracking-wide mb-2">Progress by Phase</div>
        {job.phaseProgress.map((phase, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-32 text-xs text-warm-600 truncate">{phase.phase}</div>
            <div className="flex-1 h-2 bg-warm-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  phase.percent === 100 ? "bg-green-500" :
                  phase.percent > 0 ? "bg-stone-500" : "bg-warm-200"
                )}
                style={{ width: `${phase.percent}%` }}
              />
            </div>
            <div className="w-10 text-xs text-right text-warm-500">{phase.percent}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DocumentShortcuts({ documents }: { documents: DocumentShortcut[] }) {
  return (
    <div className="bg-white rounded-lg border border-warm-200">
      <div className="px-4 py-3 border-b border-warm-200">
        <h4 className="font-semibold text-warm-900 text-sm">Key Documents</h4>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-5 gap-2">
          {documents.map(doc => {
            const Icon = doc.icon
            return (
              <button
                key={doc.id}
                className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-warm-50 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-warm-100 group-hover:bg-stone-100 transition-colors">
                  <Icon className="h-4 w-4 text-warm-600 group-hover:text-stone-600 transition-colors" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-warm-700 group-hover:text-stone-600 transition-colors">
                    {doc.name}
                  </div>
                  <div className="text-[10px] text-warm-400">{doc.lastUpdated}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function NextStepsCard({ steps }: { steps: NextStepItem[] }) {
  return (
    <div className="bg-gradient-to-br from-stone-50 to-indigo-50 rounded-lg border border-stone-200">
      <div className="px-4 py-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-stone-600" />
          <h4 className="font-semibold text-stone-900 text-sm">Next Steps</h4>
          <span className="text-xs bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-medium">AI Recommended</span>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-2">
          {steps.map((step, idx) => {
            const priorityConfig = getPriorityConfig(step.priority)
            return (
              <div key={step.id} className="flex items-start gap-3 p-2 bg-white/60 rounded-lg">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-stone-100 text-stone-700 text-xs font-medium flex items-center justify-center">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-warm-800">{step.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", priorityConfig.color)}>
                      {priorityConfig.label}
                    </span>
                    <span className="text-xs text-warm-500">{step.assignee}</span>
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

function MetricCardComponent({ metric }: { metric: MetricCard }) {
  const Icon = metric.icon

  const statusColors = {
    good: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', text: 'text-green-600' },
    warning: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', text: 'text-amber-600' },
    critical: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', text: 'text-red-600' },
    neutral: { bg: 'bg-warm-50', icon: 'bg-warm-100 text-warm-600', text: 'text-warm-600' },
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
            metric.trend === 'up' ? "text-green-600" : metric.trend === 'down' ? "text-amber-600" : "text-warm-500"
          )}>
            {metric.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : metric.trend === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
            {metric.trendValue}
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-warm-900">{metric.value}</div>
        <div className="text-sm text-warm-600 mt-0.5">{metric.label}</div>
        {metric.subValue && (
          <div className="text-xs text-warm-400 mt-0.5">{metric.subValue}</div>
        )}
      </div>
      {metric.drillDownTo && (
        <div className="mt-1 flex items-center gap-1 text-xs text-stone-500">
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
    <div className="bg-white rounded-lg border border-warm-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-warm-900 text-sm">Site Weather</h4>
        <span className="text-xs text-warm-400">Wilmington, NC</span>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <CurrentIcon className="h-8 w-8 text-amber-500" />
        <div>
          <div className="text-2xl font-bold text-warm-900">{weather.current.temp}F</div>
          <div className="text-sm text-warm-500">{weather.current.condition}</div>
        </div>
      </div>
      <div className="space-y-2">
        {weather.forecast.map((day, i) => {
          const ForecastIcon = day.icon
          return (
            <div key={i} className={cn("flex items-center justify-between px-2 py-1.5 rounded", day.riskFlag ? "bg-red-50" : "")}>
              <div className="flex items-center gap-2">
                <ForecastIcon className={cn("h-4 w-4", day.riskFlag ? "text-red-500" : "text-warm-400")} />
                <span className="text-sm text-warm-700">{day.day}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-warm-500">{day.high}F / {day.low}F</span>
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
      case 'current': return { icon: Flag, color: 'text-stone-600', bg: 'bg-stone-100', line: 'bg-stone-500' }
      case 'upcoming': return { icon: Diamond, color: 'text-warm-400', bg: 'bg-warm-100', line: 'bg-warm-300' }
      case 'at-risk': return { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100', line: 'bg-amber-500' }
    }
  }

  return (
    <div className="bg-white rounded-lg border border-warm-200">
      <div className="px-4 py-3 border-b border-warm-200">
        <h4 className="font-semibold text-warm-900 text-sm">Key Milestones</h4>
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
                    <span className={cn("text-sm font-medium", milestone.status === 'completed' ? 'text-warm-500' : 'text-warm-900')}>
                      {milestone.name}
                    </span>
                    {milestone.completedDate && (
                      <span className="text-xs text-green-600 ml-2">{milestone.completedDate}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-warm-500">{milestone.date}</span>
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
    <div className="bg-white rounded-lg border border-warm-200">
      <div className="px-4 py-3 border-b border-warm-200">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-warm-900 text-sm">Project Team</h4>
          <span className="text-xs text-warm-400">{team.length} members</span>
        </div>
      </div>
      <div className="divide-y divide-warm-100">
        {team.map(member => (
          <div key={member.id} className="px-4 py-2.5 hover:bg-warm-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-warm-900">{member.name}</span>
                  <span className="text-xs bg-warm-100 text-warm-600 px-1.5 py-0.5 rounded">{member.role}</span>
                  {member.trade && (
                    <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded">{member.trade}</span>
                  )}
                </div>
                {member.company && (
                  <span className="text-xs text-warm-400">{member.company}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded font-medium",
                  member.status === 'active' ? "bg-green-100 text-green-700" :
                  member.status === 'scheduled' ? "bg-stone-100 text-stone-700" :
                  "bg-warm-100 text-warm-600"
                )}>
                  {member.status}
                </span>
                <a href={`tel:${member.phone}`} className="text-warm-400 hover:text-stone-600">
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
      default: return 'bg-warm-100 text-warm-700'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-warm-200">
      <div className="px-4 py-3 border-b border-warm-200">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-warm-900 text-sm">Risk Register</h4>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
            {risks.filter(r => r.status === 'open').length} open
          </span>
        </div>
      </div>
      <div className="divide-y divide-warm-100">
        {risks.map(risk => (
          <div key={risk.id} className="px-4 py-2.5 hover:bg-warm-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-warm-700">{risk.description}</p>
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
    <div className="bg-white rounded-lg border border-warm-200">
      <div className="px-4 py-3 border-b border-warm-200">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-warm-900">Recent Activity</h4>
          <button className="text-sm text-stone-600 hover:text-stone-700 font-medium flex items-center gap-1">
            View All
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="divide-y divide-warm-100">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type)
          const colorClass = getActivityColor(activity.type)

          return (
            <div key={activity.id} className="px-4 py-3 hover:bg-warm-50">
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg flex-shrink-0", colorClass)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-warm-900 text-sm">{activity.title}</div>
                      <div className="text-sm text-warm-600 mt-0.5">{activity.description}</div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {activity.refId && (
                        <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded">{activity.refId}</span>
                      )}
                      {activity.metadata && (
                        <span className={cn(
                          "text-xs font-medium px-2 py-1 rounded",
                          activity.type === 'change-order' ? "bg-amber-100 text-amber-700" :
                          activity.type === 'invoice' ? "bg-green-100 text-green-700" :
                          activity.type === 'selection' ? "bg-pink-100 text-pink-700" :
                          "bg-warm-100 text-warm-600"
                        )}>
                          {activity.metadata}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-warm-400">
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
    <div className="bg-white rounded-lg border border-warm-200">
      <div className="px-4 py-3 border-b border-warm-200">
        <h4 className="font-semibold text-warm-900">Quick Links</h4>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-6 gap-3">
          {links.map(link => {
            const Icon = link.icon
            return (
              <button
                key={link.id}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-warm-50 transition-colors group relative"
              >
                <div className="relative">
                  <div className="p-2.5 rounded-lg bg-warm-100 group-hover:bg-stone-100 transition-colors">
                    <Icon className="h-5 w-5 text-warm-600 group-hover:text-stone-600 transition-colors" />
                  </div>
                  {link.alert && (
                    <div className={cn("absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white",
                      link.badgeColor === 'amber' ? 'bg-amber-500' : 'bg-red-500'
                    )} />
                  )}
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-warm-700 group-hover:text-stone-600 transition-colors">
                    {link.label}
                  </div>
                  {link.count !== undefined && (
                    <div className="text-xs text-warm-400">{link.count}</div>
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

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function JobOverviewPreview() {
  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Summary Header */}
      <SummaryHeader job={mockJob} />

      {/* Job Navigation Tabs */}
      <JobNavigationTabs activeTab="overview" />

      {/* Key Metrics Cards */}
      <div className="bg-white border-b border-warm-200 px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          {mockMetrics.map(metric => (
            <MetricCardComponent key={metric.id} metric={metric} />
          ))}
        </div>
      </div>

      {/* Percent Complete + Next Steps Row */}
      <div className="px-6 py-4 grid grid-cols-2 gap-6">
        <PercentCompleteVisualization job={mockJob} />
        <NextStepsCard steps={mockNextSteps} />
      </div>

      {/* Document Shortcuts */}
      <div className="px-6 pb-4">
        <DocumentShortcuts documents={mockDocumentShortcuts} />
      </div>

      {/* Quick Links */}
      <div className="px-6 pb-4">
        <QuickLinksGrid links={mockQuickLinks} />
      </div>

      {/* AI Features Panel */}
      <div className="px-6 pb-4">
        <AIFeaturesPanel
          title="AI Insights"
          features={mockAIFeatures}
          columns={2}
        />
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
    </div>
  )
}
