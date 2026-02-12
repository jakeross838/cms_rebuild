'use client'

import { useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  Calendar,
  List,
  ChevronRight,
  Clock,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarClock,
  Sparkles,
  ClipboardCheck,
  Building2,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type InspectionStatus = 'scheduled' | 'passed' | 'failed' | 'rescheduled'

interface Inspection {
  id: string
  type: string
  date: string
  time: string
  inspector: string
  status: InspectionStatus
  result?: string
  notes?: string
  linkedPermit: string
  projectName: string
}

const mockInspections: Inspection[] = [
  {
    id: '1',
    type: 'Foundation',
    date: 'Feb 14, 2026',
    time: '9:00 AM',
    inspector: 'Mike Thompson',
    status: 'scheduled',
    linkedPermit: 'BLD-2026-001234',
    projectName: 'Smith Residence',
  },
  {
    id: '2',
    type: 'Electrical Rough-In',
    date: 'Feb 13, 2026',
    time: '2:00 PM',
    inspector: 'Sarah Chen',
    status: 'scheduled',
    linkedPermit: 'BLD-2026-001234',
    projectName: 'Smith Residence',
  },
  {
    id: '3',
    type: 'Framing',
    date: 'Feb 12, 2026',
    time: '10:30 AM',
    inspector: 'Mike Thompson',
    status: 'passed',
    result: 'Approved',
    notes: 'All framing meets code requirements. Hurricane straps properly installed.',
    linkedPermit: 'BLD-2026-001234',
    projectName: 'Smith Residence',
  },
  {
    id: '4',
    type: 'Plumbing Rough-In',
    date: 'Feb 11, 2026',
    time: '11:00 AM',
    inspector: 'James Rodriguez',
    status: 'failed',
    result: 'Corrections Required',
    notes: 'Water heater vent clearance insufficient. P-trap missing under laundry sink.',
    linkedPermit: 'BLD-2026-001234',
    projectName: 'Smith Residence',
  },
  {
    id: '5',
    type: 'Plumbing Rough-In (Re-inspection)',
    date: 'Feb 15, 2026',
    time: '1:00 PM',
    inspector: 'James Rodriguez',
    status: 'rescheduled',
    notes: 'Re-inspection after corrections made',
    linkedPermit: 'BLD-2026-001234',
    projectName: 'Smith Residence',
  },
  {
    id: '6',
    type: 'Roofing',
    date: 'Feb 10, 2026',
    time: '9:30 AM',
    inspector: 'Sarah Chen',
    status: 'passed',
    result: 'Approved',
    notes: 'Impact-rated underlayment verified. Fastener pattern compliant.',
    linkedPermit: 'BLD-2026-001234',
    projectName: 'Smith Residence',
  },
  {
    id: '7',
    type: 'HVAC Rough-In',
    date: 'Feb 17, 2026',
    time: '10:00 AM',
    inspector: 'Mike Thompson',
    status: 'scheduled',
    linkedPermit: 'BLD-2026-001234',
    projectName: 'Smith Residence',
  },
]

const statusConfig = {
  scheduled: {
    label: 'Scheduled',
    color: 'bg-blue-100 text-blue-700',
    icon: CalendarClock,
    iconColor: 'text-blue-500',
  },
  passed: {
    label: 'Passed',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle2,
    iconColor: 'text-green-500',
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
    iconColor: 'text-red-500',
  },
  rescheduled: {
    label: 'Rescheduled',
    color: 'bg-amber-100 text-amber-700',
    icon: AlertCircle,
    iconColor: 'text-amber-500',
  },
}

// Calendar data for the current week
const calendarDays = [
  { day: 'Mon', date: 10, inspections: [{ type: 'Roofing', time: '9:30 AM', status: 'passed' as InspectionStatus }] },
  { day: 'Tue', date: 11, inspections: [{ type: 'Plumbing', time: '11:00 AM', status: 'failed' as InspectionStatus }] },
  { day: 'Wed', date: 12, inspections: [{ type: 'Framing', time: '10:30 AM', status: 'passed' as InspectionStatus }] },
  { day: 'Thu', date: 13, inspections: [{ type: 'Electrical', time: '2:00 PM', status: 'scheduled' as InspectionStatus }] },
  { day: 'Fri', date: 14, inspections: [{ type: 'Foundation', time: '9:00 AM', status: 'scheduled' as InspectionStatus }] },
  { day: 'Sat', date: 15, inspections: [{ type: 'Plumbing Re-insp', time: '1:00 PM', status: 'rescheduled' as InspectionStatus }] },
  { day: 'Sun', date: 16, inspections: [] },
]

function InspectionCard({ inspection }: { inspection: Inspection }) {
  const config = statusConfig[inspection.status]
  const StatusIcon = config.icon

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {/* Status Icon */}
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg",
            inspection.status === 'passed' ? 'bg-green-50' :
            inspection.status === 'failed' ? 'bg-red-50' :
            inspection.status === 'rescheduled' ? 'bg-amber-50' :
            'bg-blue-50'
          )}>
            <StatusIcon className={cn("h-5 w-5", config.iconColor)} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900">{inspection.type}</h4>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", config.color)}>
                {config.label}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {inspection.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {inspection.time}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {inspection.inspector}
              </span>
            </div>

            {inspection.notes && (
              <p className={cn(
                "text-sm mt-2 p-2 rounded-md",
                inspection.status === 'failed' ? 'bg-red-50 text-red-700' :
                inspection.status === 'passed' ? 'bg-green-50 text-green-700' :
                'bg-gray-50 text-gray-600'
              )}>
                <FileText className="h-3.5 w-3.5 inline mr-1.5" />
                {inspection.notes}
              </p>
            )}
          </div>
        </div>

        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span>{inspection.projectName}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-blue-600">
          <ClipboardCheck className="h-4 w-4" />
          <span>{inspection.linkedPermit}</span>
        </div>
      </div>
    </div>
  )
}

function CalendarView() {
  const today = 12

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <h4 className="font-medium text-gray-900">February 2026</h4>
          <button className="p-1 hover:bg-gray-100 rounded">
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        <span className="text-sm text-gray-500">Week of Feb 10</span>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day) => (
          <div
            key={day.day}
            className={cn(
              "flex flex-col items-center p-2 rounded-lg min-h-[100px]",
              day.date === today ? "bg-blue-50 ring-2 ring-blue-500" : "bg-gray-50"
            )}
          >
            <span className="text-xs text-gray-500 mb-1">{day.day}</span>
            <span className={cn(
              "text-lg font-semibold mb-2",
              day.date === today ? "text-blue-700" : "text-gray-700"
            )}>
              {day.date}
            </span>
            {day.inspections.map((insp, idx) => {
              const inspConfig = statusConfig[insp.status]
              return (
                <div
                  key={idx}
                  className={cn(
                    "w-full text-xs p-1.5 rounded mb-1 truncate",
                    inspConfig.color
                  )}
                  title={`${insp.type} - ${insp.time}`}
                >
                  <div className="font-medium truncate">{insp.type}</div>
                  <div className="text-[10px] opacity-75">{insp.time}</div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export function InspectionsPreview() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [statusFilter, setStatusFilter] = useState<'all' | InspectionStatus>('all')

  // Calculate stats
  const totalInspections = mockInspections.length
  const upcomingThisWeek = mockInspections.filter(i => i.status === 'scheduled' || i.status === 'rescheduled').length
  const passedCount = mockInspections.filter(i => i.status === 'passed').length
  const failedCount = mockInspections.filter(i => i.status === 'failed').length
  const completedCount = passedCount + failedCount
  const passRate = completedCount > 0 ? Math.round((passedCount / completedCount) * 100) : 0
  const failedRequiringReinspection = mockInspections.filter(i => i.status === 'failed').length

  const filteredInspections = statusFilter === 'all'
    ? mockInspections
    : mockInspections.filter(i => i.status === statusFilter)

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Inspections - Smith Residence</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {upcomingThisWeek} upcoming this week
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <ClipboardCheck className="h-4 w-4" />
                {totalInspections} total inspections
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {passRate}% pass rate
              </span>
              {failedRequiringReinspection > 0 && (
                <span className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-4 w-4" />
                  {failedRequiringReinspection} requiring re-inspection
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2",
                  viewMode === 'list' ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"
                )}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={cn(
                  "p-2",
                  viewMode === 'calendar' ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"
                )}
              >
                <Calendar className="h-4 w-4" />
              </button>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Schedule Inspection
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <CalendarClock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">{upcomingThisWeek}</div>
              <div className="text-xs text-blue-600">Upcoming This Week</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">{passRate}%</div>
              <div className="text-xs text-green-600">Pass Rate</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-700">{failedRequiringReinspection}</div>
              <div className="text-xs text-red-600">Requiring Re-inspection</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
              <ClipboardCheck className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-700">{passedCount}</div>
              <div className="text-xs text-purple-600">Passed Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors",
              statusFilter === 'all'
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('scheduled')}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors",
              statusFilter === 'scheduled'
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            Scheduled
          </button>
          <button
            onClick={() => setStatusFilter('passed')}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors",
              statusFilter === 'passed'
                ? "bg-green-100 text-green-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            Passed
          </button>
          <button
            onClick={() => setStatusFilter('failed')}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors",
              statusFilter === 'failed'
                ? "bg-red-100 text-red-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            Failed
          </button>
          <button
            onClick={() => setStatusFilter('rescheduled')}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors",
              statusFilter === 'rescheduled'
                ? "bg-amber-100 text-amber-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            Rescheduled
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search inspections..."
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {viewMode === 'calendar' ? (
          <CalendarView />
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {filteredInspections.map(inspection => (
              <InspectionCard key={inspection.id} inspection={inspection} />
            ))}
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Inspection Tips:</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-amber-700">
            <span>Ensure electrical panel clearance (36") before Thursday's inspection</span>
            <span className="text-amber-400">|</span>
            <span>Mike Thompson prefers morning inspections - schedule before 11 AM for faster approvals</span>
            <span className="text-amber-400">|</span>
            <span>Plumbing re-inspection: verify P-trap installed and vent clearance documented</span>
          </div>
        </div>
      </div>
    </div>
  )
}
