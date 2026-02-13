'use client'

import { useState } from 'react'
import {
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Download,
  MoreVertical,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  Navigation,
  WifiOff,
  Camera,
  DollarSign,
  FileText,
  XCircle,
  Link2,
  ArrowRight,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

// ── Types ───────────────────────────────────────────────────────────────

interface TimeEntry {
  id: string
  employeeName: string
  jobSite: string
  clockInTime: string
  clockOutTime: string
  hoursWorked: number
  overtimeHours: number
  costCode: string
  costCodeDescription: string
  breakMinutes: number
  status: 'approved' | 'pending' | 'flagged' | 'rejected' | 'disputed'
  location?: string
  gpsVerified: boolean
  geofenceStatus: 'inside' | 'outside' | 'unknown'
  isOfflineEntry: boolean
  photoVerification: boolean
  driveTime?: number
  notes?: string
  flagReason?: string
}

interface EmployeeTimeSummary {
  id: string
  name: string
  role: string
  crew?: string
  hoursThisWeek: number
  overtimeHours: number
  jobsWorked: number
  status: 'clocked-in' | 'clocked-out' | 'on-break'
  lastClockTime?: string
  currentJob?: string
  baseWage: number
  burdenedRate: number
  workersCompClass: string
  gpsVerified: boolean
}

interface TimesheetSummary {
  id: string
  employeeName: string
  periodStart: string
  periodEnd: string
  totalRegularHours: number
  totalOvertimeHours: number
  totalPtoHours: number
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'amended'
  submittedAt?: string
  approvedBy?: string
  rejectionNotes?: string
  laborCost: number
  burdenedCost: number
  projectBreakdown: Array<{ job: string; hours: number; costCode: string }>
}

interface AiInsight {
  type: 'warning' | 'info' | 'success' | 'alert'
  title: string
  message: string
}

// ── Mock Data ───────────────────────────────────────────────────────────

const mockEmployees: EmployeeTimeSummary[] = [
  {
    id: '1',
    name: 'Marcus Rodriguez',
    role: 'Framing Crew Lead',
    crew: 'Crew Alpha',
    hoursThisWeek: 42.5,
    overtimeHours: 2.5,
    jobsWorked: 2,
    status: 'clocked-out',
    lastClockTime: '4:30 PM Today',
    currentJob: 'Smith Residence',
    baseWage: 38.00,
    burdenedRate: 56.24,
    workersCompClass: '5403 - Carpentry',
    gpsVerified: true,
  },
  {
    id: '2',
    name: 'Sarah Chen',
    role: 'HVAC Technician',
    crew: 'Crew Bravo',
    hoursThisWeek: 40.0,
    overtimeHours: 0,
    jobsWorked: 3,
    status: 'clocked-in',
    lastClockTime: 'Since 8:00 AM',
    currentJob: 'Harbor View Custom Home',
    baseWage: 42.00,
    burdenedRate: 62.16,
    workersCompClass: '5183 - HVAC',
    gpsVerified: true,
  },
  {
    id: '3',
    name: 'James Thompson',
    role: 'Electrician',
    crew: 'Crew Bravo',
    hoursThisWeek: 38.5,
    overtimeHours: 0,
    jobsWorked: 2,
    status: 'clocked-out',
    lastClockTime: '3:45 PM Today',
    baseWage: 45.00,
    burdenedRate: 66.60,
    workersCompClass: '5190 - Electrical',
    gpsVerified: true,
  },
  {
    id: '4',
    name: 'Lisa Martinez',
    role: 'General Laborer',
    crew: 'Crew Alpha',
    hoursThisWeek: 44.0,
    overtimeHours: 4.0,
    jobsWorked: 4,
    status: 'clocked-out',
    lastClockTime: '5:15 PM Today',
    baseWage: 22.00,
    burdenedRate: 32.56,
    workersCompClass: '5403 - Carpentry',
    gpsVerified: true,
  },
  {
    id: '5',
    name: 'David Nguyen',
    role: 'Finish Carpenter',
    crew: 'Crew Alpha',
    hoursThisWeek: 36.0,
    overtimeHours: 0,
    jobsWorked: 1,
    status: 'on-break',
    lastClockTime: 'Break since 12:00 PM',
    currentJob: 'Johnson Beach House',
    baseWage: 35.00,
    burdenedRate: 51.80,
    workersCompClass: '5437 - Finish Carpentry',
    gpsVerified: true,
  },
]

const mockTimeEntries: TimeEntry[] = [
  {
    id: '1',
    employeeName: 'Marcus Rodriguez',
    jobSite: 'Smith Residence Remodel',
    clockInTime: '7:00 AM',
    clockOutTime: '4:30 PM',
    hoursWorked: 9.0,
    overtimeHours: 1.0,
    costCode: 'FR-100',
    costCodeDescription: 'Framing - Rough',
    breakMinutes: 30,
    status: 'approved',
    location: '1234 Oak St, Charleston SC',
    gpsVerified: true,
    geofenceStatus: 'inside',
    isOfflineEntry: false,
    photoVerification: true,
  },
  {
    id: '2',
    employeeName: 'Sarah Chen',
    jobSite: 'Harbor View Custom Home',
    clockInTime: '8:00 AM',
    clockOutTime: 'Currently Clocked In',
    hoursWorked: 6.5,
    overtimeHours: 0,
    costCode: 'HV-205',
    costCodeDescription: 'HVAC - Rough-In',
    breakMinutes: 30,
    status: 'pending',
    location: '5678 Beach Rd, Mount Pleasant SC',
    gpsVerified: true,
    geofenceStatus: 'inside',
    isOfflineEntry: false,
    photoVerification: false,
  },
  {
    id: '3',
    employeeName: 'James Thompson',
    jobSite: 'Johnson Electrical Upgrade',
    clockInTime: '6:30 AM',
    clockOutTime: '3:45 PM',
    hoursWorked: 8.75,
    overtimeHours: 0,
    costCode: 'EL-150',
    costCodeDescription: 'Electrical - Rough',
    breakMinutes: 45,
    status: 'flagged',
    location: '9012 Elm Ave, Charleston SC',
    gpsVerified: true,
    geofenceStatus: 'inside',
    isOfflineEntry: false,
    photoVerification: false,
    flagReason: 'Break time 45 min exceeds configured 30 min maximum. Verify break was legitimate.',
  },
  {
    id: '4',
    employeeName: 'Lisa Martinez',
    jobSite: 'Coastal Retreat Construction',
    clockInTime: '7:30 AM',
    clockOutTime: '5:15 PM',
    hoursWorked: 9.25,
    overtimeHours: 1.25,
    costCode: 'GN-080',
    costCodeDescription: 'General Labor - Cleanup',
    breakMinutes: 30,
    status: 'approved',
    location: '2468 Lighthouse Ln, Kiawah SC',
    gpsVerified: true,
    geofenceStatus: 'inside',
    isOfflineEntry: false,
    photoVerification: true,
  },
  {
    id: '5',
    employeeName: 'David Nguyen',
    jobSite: 'Johnson Beach House',
    clockInTime: '7:00 AM',
    clockOutTime: 'On Break',
    hoursWorked: 5.0,
    overtimeHours: 0,
    costCode: 'FN-300',
    costCodeDescription: 'Finish Carpentry - Trim',
    breakMinutes: 0,
    status: 'pending',
    location: '3421 Surf Dr, Folly Beach SC',
    gpsVerified: true,
    geofenceStatus: 'inside',
    isOfflineEntry: false,
    photoVerification: false,
  },
  {
    id: '6',
    employeeName: 'Marcus Rodriguez',
    jobSite: 'Miller Addition',
    clockInTime: '7:00 AM',
    clockOutTime: '12:00 PM',
    hoursWorked: 4.5,
    overtimeHours: 0,
    costCode: 'FR-100',
    costCodeDescription: 'Framing - Rough',
    breakMinutes: 30,
    status: 'pending',
    location: '567 Pine St, Charleston SC',
    gpsVerified: false,
    geofenceStatus: 'outside',
    isOfflineEntry: true,
    photoVerification: false,
    flagReason: 'GPS location 0.8mi outside geofence. Entry was submitted offline.',
    notes: 'Drove to site from Miller Addition to pick up materials',
    driveTime: 25,
  },
]

const mockTimesheets: TimesheetSummary[] = [
  {
    id: '1',
    employeeName: 'Marcus Rodriguez',
    periodStart: 'Feb 3',
    periodEnd: 'Feb 9',
    totalRegularHours: 40.0,
    totalOvertimeHours: 2.5,
    totalPtoHours: 0,
    status: 'submitted',
    submittedAt: 'Feb 10, 8:00 AM',
    laborCost: 1615.00,
    burdenedCost: 2389.80,
    projectBreakdown: [
      { job: 'Smith Residence', hours: 28, costCode: 'FR-100' },
      { job: 'Miller Addition', hours: 14.5, costCode: 'FR-100' },
    ],
  },
  {
    id: '2',
    employeeName: 'Sarah Chen',
    periodStart: 'Feb 3',
    periodEnd: 'Feb 9',
    totalRegularHours: 40.0,
    totalOvertimeHours: 0,
    totalPtoHours: 0,
    status: 'approved',
    submittedAt: 'Feb 10, 7:30 AM',
    approvedBy: 'Jake Ross',
    laborCost: 1680.00,
    burdenedCost: 2486.40,
    projectBreakdown: [
      { job: 'Harbor View Custom Home', hours: 24, costCode: 'HV-205' },
      { job: 'Smith Residence', hours: 8, costCode: 'HV-210' },
      { job: 'Johnson Beach House', hours: 8, costCode: 'HV-205' },
    ],
  },
  {
    id: '3',
    employeeName: 'Lisa Martinez',
    periodStart: 'Feb 3',
    periodEnd: 'Feb 9',
    totalRegularHours: 40.0,
    totalOvertimeHours: 4.0,
    totalPtoHours: 0,
    status: 'rejected',
    submittedAt: 'Feb 10, 9:00 AM',
    rejectionNotes: 'Friday entry shows 10.5 hours but break not logged. Please resubmit with accurate break time.',
    laborCost: 1012.00,
    burdenedCost: 1497.76,
    projectBreakdown: [
      { job: 'Coastal Retreat', hours: 20, costCode: 'GN-080' },
      { job: 'Smith Residence', hours: 16, costCode: 'GN-080' },
      { job: 'Miller Addition', hours: 8, costCode: 'GN-080' },
    ],
  },
]

const aiInsights: AiInsight[] = [
  {
    type: 'warning',
    title: 'Overtime Alert',
    message: 'Lisa Martinez has 44 hours this week (4 hrs OT). At current pace, she will hit 48+ hours if she works a full day tomorrow. Burdened OT cost: $48.84/hr.',
  },
  {
    type: 'alert',
    title: 'Geofence Violation',
    message: 'Marcus Rodriguez entry #6 clocked in 0.8 miles outside Miller Addition geofence. Entry was submitted offline. Supervisor review recommended.',
  },
  {
    type: 'info',
    title: 'Break Compliance',
    message: 'James Thompson took a 45-min break - SC labor law does not mandate paid breaks, but company policy limits to 30 min. Flagged for supervisor review.',
  },
  {
    type: 'success',
    title: 'GPS Verification',
    message: '9 of 10 clock-ins today verified within job site geofence. 1 flagged (offline entry from Marcus Rodriguez).',
  },
  {
    type: 'info',
    title: 'Cost Code Suggestion',
    message: 'David Nguyen clocked into Johnson Beach House. Based on project phase (finish) and role (finish carpenter), suggested cost code: FN-300 (Finish Carpentry - Trim). Auto-assigned.',
  },
  {
    type: 'warning',
    title: 'Timesheet Pending',
    message: '2 timesheets for week of Feb 3-9 still pending approval. Monday noon deadline approaching. Employees: Marcus Rodriguez, James Thompson.',
  },
]

// ── Sub-components ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TimeEntry['status'] }) {
  const config = {
    approved: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-200',
      icon: CheckCircle,
      label: 'Approved',
    },
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      icon: Clock,
      label: 'Pending',
    },
    flagged: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: AlertTriangle,
      label: 'Flagged',
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: XCircle,
      label: 'Rejected',
    },
    disputed: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      border: 'border-purple-200',
      icon: AlertCircle,
      label: 'Disputed',
    },
  }

  const { bg, text, border, icon: Icon, label } = config[status]

  return (
    <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', bg, text, border)}>
      <Icon className="h-3 w-3" />
      {label}
    </div>
  )
}

function TimesheetStatusBadge({ status }: { status: TimesheetSummary['status'] }) {
  const config: Record<TimesheetSummary['status'], { bg: string; text: string; label: string }> = {
    draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
    submitted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Submitted' },
    approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
    amended: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Amended' },
  }
  const { bg, text, label } = config[status]
  return (
    <span className={cn('text-xs px-2 py-0.5 rounded font-medium', bg, text)}>
      {label}
    </span>
  )
}

function EmployeeCard({ employee }: { employee: EmployeeTimeSummary }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{employee.name}</h4>
          <p className="text-xs text-gray-500">{employee.role}</p>
          {employee.crew && (
            <p className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
              <Users className="h-3 w-3" /> {employee.crew}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {employee.gpsVerified && (
            <span title="GPS Verified"><Navigation className="h-3.5 w-3.5 text-green-500" /></span>
          )}
          <div
            className={cn(
              'w-3 h-3 rounded-full',
              employee.status === 'clocked-in' ? 'bg-green-500 animate-pulse' :
              employee.status === 'on-break' ? 'bg-amber-500' :
              'bg-gray-300'
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <div className="text-lg font-bold text-gray-900">{employee.hoursThisWeek}h</div>
          <div className="text-xs text-gray-500">This Week</div>
        </div>
        <div>
          <div className={cn("text-lg font-bold", employee.overtimeHours > 0 ? "text-orange-600" : "text-gray-400")}>
            {employee.overtimeHours}h
          </div>
          <div className="text-xs text-gray-500">Overtime</div>
        </div>
        <div>
          <div className="text-lg font-bold text-gray-900">{employee.jobsWorked}</div>
          <div className="text-xs text-gray-500">Jobs</div>
        </div>
      </div>

      {/* Labor burden */}
      <div className="bg-gray-50 rounded p-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Base: ${employee.baseWage.toFixed(2)}/hr</span>
          <span className="font-medium text-gray-700">Burdened: ${employee.burdenedRate.toFixed(2)}/hr</span>
        </div>
        <div className="text-xs text-gray-400 mt-0.5">{employee.workersCompClass}</div>
      </div>

      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600">{employee.lastClockTime}</p>
          {employee.currentJob && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {employee.currentJob}
            </p>
          )}
        </div>
        <span className={cn(
          "text-xs px-2 py-0.5 rounded",
          employee.status === 'clocked-in' ? "bg-green-100 text-green-700" :
          employee.status === 'on-break' ? "bg-amber-100 text-amber-700" :
          "bg-gray-100 text-gray-600"
        )}>
          {employee.status === 'clocked-in' ? 'Active' :
           employee.status === 'on-break' ? 'On Break' : 'Off'}
        </span>
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────

export function TimeClockPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState({ defaultTab: 'team' })
  const [selectedJob, setSelectedJob] = useState('all')
  const [selectedCrew, setSelectedCrew] = useState('all')

  const filteredEntries = sortItems(
    mockTimeEntries.filter(e => {
      if (!matchesSearch(e, search, ['employeeName', 'jobSite', 'costCode', 'costCodeDescription'])) return false
      if (selectedJob !== 'all' && e.jobSite !== selectedJob) return false
      return true
    }),
    activeSort as keyof TimeEntry | '',
    sortDirection,
  )

  const filteredEmployees = mockEmployees.filter(e => {
    if (!matchesSearch(e, search, ['name', 'role', 'crew'])) return false
    if (selectedCrew !== 'all' && e.crew !== selectedCrew) return false
    return true
  })

  // Calculate stats
  const totalHoursToday = mockTimeEntries.reduce((sum, e) => sum + e.hoursWorked, 0)
  const overtimeHours = mockEmployees.reduce((sum, e) => sum + e.overtimeHours, 0)
  const flaggedEntries = mockTimeEntries.filter(e => e.status === 'flagged').length
  const clockedInCount = mockEmployees.filter(e => e.status === 'clocked-in' || e.status === 'on-break').length
  const gpsVerifiedPct = Math.round((mockTimeEntries.filter(e => e.gpsVerified).length / mockTimeEntries.length) * 100)
  const pendingTimesheets = mockTimesheets.filter(t => t.status === 'submitted').length

  const jobSites = Array.from(new Set(mockTimeEntries.map(e => e.jobSite)))
  const crews = Array.from(new Set(mockEmployees.filter(e => e.crew).map(e => e.crew!)))

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Time Clock Management</h3>
            <p className="text-sm text-gray-500 mt-0.5">Week of February 10, 2026 (Pay Period: Biweekly)</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <FileText className="h-4 w-4" />
              Payroll Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Clock className="h-4 w-4" />
              Manual Entry
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalHoursToday.toFixed(1)}h</div>
              <div className="text-xs text-gray-500">Hours Today</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{clockedInCount}</div>
              <div className="text-xs text-gray-500">Clocked In</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{overtimeHours}h</div>
              <div className="text-xs text-gray-500">OT This Week</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", flaggedEntries > 0 ? "bg-red-100" : "bg-green-100")}>
              <Zap className={cn("h-5 w-5", flaggedEntries > 0 ? "text-red-600" : "text-green-600")} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{flaggedEntries}</div>
              <div className="text-xs text-gray-500">Flagged</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Navigation className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">{gpsVerifiedPct}%</div>
              <div className="text-xs text-gray-500">GPS Verified</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", pendingTimesheets > 0 ? "bg-blue-100" : "bg-gray-100")}>
              <FileText className={cn("h-5 w-5", pendingTimesheets > 0 ? "text-blue-600" : "text-gray-500")} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{pendingTimesheets}</div>
              <div className="text-xs text-gray-500">Timesheets Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-module connection badges */}
      <div className="bg-white border-b border-gray-200 px-6 py-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Connected to:</span>
          {[
            { label: 'Budget & Cost Tracking', color: 'bg-green-50 text-green-700 border-green-200' },
            { label: 'Daily Logs', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { label: 'Financial Reporting', color: 'bg-purple-50 text-purple-700 border-purple-200' },
            { label: 'Scheduling', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
            { label: 'Payroll Export', color: 'bg-orange-50 text-orange-700 border-orange-200' },
          ].map(badge => (
            <span key={badge.label} className={cn("text-xs px-2 py-0.5 rounded border flex items-center gap-1", badge.color)}>
              <Link2 className="h-3 w-3" />
              {badge.label}
            </span>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search employees, jobs, cost codes..."
          tabs={[
            { key: 'team', label: 'Team Overview' },
            { key: 'entries', label: 'Time Entries', count: mockTimeEntries.length },
            { key: 'timesheets', label: 'Timesheets', count: mockTimesheets.filter(t => t.status === 'submitted').length },
            { key: 'pending', label: 'Pending Review', count: mockTimeEntries.filter(e => e.status !== 'approved').length },
            { key: 'insights', label: 'AI Insights', count: aiInsights.filter(i => i.type === 'warning' || i.type === 'alert').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={
            activeTab === 'team'
              ? [
                  {
                    label: 'All Crews',
                    value: selectedCrew,
                    options: crews.map(c => ({ value: c, label: c })),
                    onChange: setSelectedCrew,
                  },
                ]
              : activeTab === 'entries'
              ? [
                  {
                    label: 'All Job Sites',
                    value: selectedJob,
                    options: jobSites.map(job => ({ value: job, label: job })),
                    onChange: setSelectedJob,
                  },
                ]
              : []
          }
          sortOptions={
            activeTab === 'entries' || activeTab === 'team'
              ? [
                  { value: 'employeeName', label: 'Employee' },
                  { value: 'hoursWorked', label: 'Hours' },
                  { value: 'status', label: 'Status' },
                  { value: 'jobSite', label: 'Job Site' },
                ]
              : []
          }
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[
            { icon: Download, label: 'Export', onClick: () => {}, variant: 'primary' },
          ]}
        />
      </div>

      {/* Content */}
      <div className="bg-white">
        {/* ── Team Overview Tab ── */}
        {activeTab === 'team' && (
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              {filteredEmployees.map(employee => (
                <EmployeeCard key={employee.id} employee={employee} />
              ))}
            </div>
          </div>
        )}

        {/* ── Time Entries Tab ── */}
        {activeTab === 'entries' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Job Site</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">In / Out</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Hours</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">OT</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Cost Code</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">GPS</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map(entry => (
                    <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{entry.employeeName}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          {entry.isOfflineEntry && (
                            <span className="flex items-center gap-0.5 text-amber-600">
                              <WifiOff className="h-3 w-3" /> Offline
                            </span>
                          )}
                          {entry.photoVerification && (
                            <span className="flex items-center gap-0.5 text-blue-600">
                              <Camera className="h-3 w-3" /> Photo
                            </span>
                          )}
                          {entry.driveTime && (
                            <span className="text-gray-400">+{entry.driveTime}min drive</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{entry.jobSite}</td>
                      <td className="py-3 px-4 text-gray-600">
                        <div>{entry.clockInTime}</div>
                        <div className="text-xs text-gray-400">{entry.clockOutTime}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">{entry.hoursWorked}h</td>
                      <td className="py-3 px-4">
                        {entry.overtimeHours > 0 ? (
                          <span className="text-orange-600 font-medium">{entry.overtimeHours}h</span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                          {entry.costCode}
                        </span>
                        <div className="text-xs text-gray-400 mt-0.5">{entry.costCodeDescription}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {entry.gpsVerified ? (
                            <Navigation className={cn(
                              "h-4 w-4",
                              entry.geofenceStatus === 'inside' ? "text-green-500" :
                              entry.geofenceStatus === 'outside' ? "text-red-500" :
                              "text-gray-400"
                            )} />
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                          {entry.geofenceStatus === 'outside' && (
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={entry.status} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Timesheets Tab ── */}
        {activeTab === 'timesheets' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">Weekly Timesheets (Feb 3 - Feb 9)</h4>
              <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Batch Approve <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {mockTimesheets.map(ts => (
              <div key={ts.id} className={cn(
                "border rounded-lg p-4",
                ts.status === 'rejected' ? "border-red-200 bg-red-50" :
                ts.status === 'approved' ? "border-green-200 bg-green-50" :
                "border-gray-200 bg-white"
              )}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h5 className="font-semibold text-gray-900">{ts.employeeName}</h5>
                    <p className="text-xs text-gray-500">{ts.periodStart} - {ts.periodEnd}</p>
                    {ts.submittedAt && (
                      <p className="text-xs text-gray-400">Submitted: {ts.submittedAt}</p>
                    )}
                  </div>
                  <TimesheetStatusBadge status={ts.status} />
                </div>

                <div className="grid grid-cols-5 gap-3 mb-3">
                  <div className="bg-white rounded p-2 border border-gray-100">
                    <div className="text-xs text-gray-500">Regular</div>
                    <div className="font-bold text-gray-900">{ts.totalRegularHours}h</div>
                  </div>
                  <div className="bg-white rounded p-2 border border-gray-100">
                    <div className="text-xs text-gray-500">Overtime</div>
                    <div className={cn("font-bold", ts.totalOvertimeHours > 0 ? "text-orange-600" : "text-gray-400")}>
                      {ts.totalOvertimeHours}h
                    </div>
                  </div>
                  <div className="bg-white rounded p-2 border border-gray-100">
                    <div className="text-xs text-gray-500">PTO</div>
                    <div className={cn("font-bold", ts.totalPtoHours > 0 ? "text-blue-600" : "text-gray-400")}>
                      {ts.totalPtoHours}h
                    </div>
                  </div>
                  <div className="bg-white rounded p-2 border border-gray-100">
                    <div className="text-xs text-gray-500">Labor Cost</div>
                    <div className="font-bold text-gray-900">${ts.laborCost.toLocaleString()}</div>
                  </div>
                  <div className="bg-white rounded p-2 border border-gray-100">
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      Burdened <DollarSign className="h-3 w-3" />
                    </div>
                    <div className="font-bold text-gray-900">${ts.burdenedCost.toLocaleString()}</div>
                  </div>
                </div>

                {/* Project breakdown */}
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">Project Breakdown:</div>
                  <div className="flex flex-wrap gap-2">
                    {ts.projectBreakdown.map((pb, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {pb.job}: {pb.hours}h ({pb.costCode})
                      </span>
                    ))}
                  </div>
                </div>

                {ts.rejectionNotes && (
                  <div className="mb-3 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
                    <span className="font-medium">Rejection Notes:</span> {ts.rejectionNotes}
                  </div>
                )}

                {ts.status === 'submitted' && (
                  <div className="flex items-center gap-2 justify-end pt-3 border-t border-gray-100">
                    <button className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100">
                      Reject
                    </button>
                    <button className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                      Approve
                    </button>
                  </div>
                )}
                {ts.approvedBy && (
                  <div className="text-xs text-green-600 pt-2 border-t border-gray-100">
                    Approved by {ts.approvedBy}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Pending Review Tab ── */}
        {activeTab === 'pending' && (
          <div className="p-6">
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-4">Entries Pending Review</h4>
              <div className="space-y-3">
                {mockTimeEntries
                  .filter(e => e.status !== 'approved')
                  .map(entry => (
                    <div key={entry.id} className={cn(
                      "border rounded-lg p-4",
                      entry.status === 'flagged' ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"
                    )}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="font-semibold text-gray-900">{entry.employeeName}</h5>
                          <p className="text-sm text-gray-600">{entry.jobSite}</p>
                          {entry.location && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <MapPin className="h-3 w-3" />
                              {entry.location}
                              {entry.gpsVerified && entry.geofenceStatus === 'inside' && (
                                <span className="text-green-600 flex items-center gap-0.5 ml-1">
                                  <Navigation className="h-3 w-3" /> Inside Geofence
                                </span>
                              )}
                              {entry.geofenceStatus === 'outside' && (
                                <span className="text-red-600 flex items-center gap-0.5 ml-1">
                                  <AlertTriangle className="h-3 w-3" /> Outside Geofence
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <StatusBadge status={entry.status} />
                      </div>

                      <div className="grid grid-cols-5 gap-4 mb-3 pt-3 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500">Clock In</p>
                          <p className="font-medium text-gray-900">{entry.clockInTime}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Clock Out</p>
                          <p className="font-medium text-gray-900">{entry.clockOutTime}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Hours</p>
                          <p className="font-medium text-gray-900">{entry.hoursWorked}h</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Break</p>
                          <p className="font-medium text-gray-900">{entry.breakMinutes}m</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Cost Code</p>
                          <p className="font-medium text-blue-700">{entry.costCode}</p>
                        </div>
                      </div>

                      {/* Indicators */}
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        {entry.isOfflineEntry && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1">
                            <WifiOff className="h-3 w-3" /> Offline Entry
                          </span>
                        )}
                        {entry.photoVerification && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1">
                            <Camera className="h-3 w-3" /> Photo Verified
                          </span>
                        )}
                        {entry.driveTime && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            Drive time: {entry.driveTime}min
                          </span>
                        )}
                      </div>

                      {entry.flagReason && (
                        <div className="mb-3 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
                          <AlertTriangle className="h-3 w-3 inline mr-1" />
                          {entry.flagReason}
                        </div>
                      )}
                      {entry.notes && (
                        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                          Employee note: {entry.notes}
                        </div>
                      )}

                      <div className="flex items-center gap-2 justify-end">
                        <button className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100">
                          Reject
                        </button>
                        <button className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ── AI Insights Tab ── */}
        {activeTab === 'insights' && (
          <div className="p-6">
            <div className="space-y-3">
              {aiInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'border rounded-lg p-4 flex items-start gap-3',
                    insight.type === 'warning' && 'bg-yellow-50 border-yellow-200',
                    insight.type === 'alert' && 'bg-red-50 border-red-200',
                    insight.type === 'info' && 'bg-blue-50 border-blue-200',
                    insight.type === 'success' && 'bg-green-50 border-green-200'
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {insight.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                    {insight.type === 'alert' && <AlertCircle className="h-5 w-5 text-red-600" />}
                    {insight.type === 'info' && <AlertCircle className="h-5 w-5 text-blue-600" />}
                    {insight.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                  <div className="flex-1">
                    <h5
                      className={cn(
                        'font-semibold',
                        insight.type === 'warning' && 'text-yellow-900',
                        insight.type === 'alert' && 'text-red-900',
                        insight.type === 'info' && 'text-blue-900',
                        insight.type === 'success' && 'text-green-900'
                      )}
                    >
                      {insight.title}
                    </h5>
                    <p
                      className={cn(
                        'text-sm mt-0.5',
                        insight.type === 'warning' && 'text-yellow-700',
                        insight.type === 'alert' && 'text-red-700',
                        insight.type === 'info' && 'text-blue-700',
                        insight.type === 'success' && 'text-green-700'
                      )}
                    >
                      {insight.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Features Summary */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h5 className="font-semibold text-blue-900 mb-2">AI-Powered Time Management</h5>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>GPS geofence verification with auto-suggest job site based on proximity</li>
                    <li>Anomaly detection: unusual hours, break patterns, geofence violations</li>
                    <li>Automated break reminders based on state-specific labor laws (SC/FL/NC)</li>
                    <li>Cost code suggestions based on job phase, worker role, and recent patterns</li>
                    <li>Overtime projection: predicts weekly OT and burdened cost impact</li>
                    <li>Timesheet compliance: auto-flag missing entries, late submissions</li>
                    <li>Payroll export validation: catches discrepancies before export</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Insights Footer Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700">
            <span className="font-medium text-amber-800">Time Intelligence:</span>{' '}
            Lisa Martinez trending to 48h this week ($48.84/hr burdened OT).
            Marcus entry #6 outside geofence - offline sync.
            2 timesheets pending Monday noon deadline.
          </div>
        </div>
      </div>
    </div>
  )
}
