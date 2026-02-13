'use client'

import { useState } from 'react'
import {
  Plus,
  Calendar,
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
  Camera,
  Phone,
  AlertTriangle,
  Link2,
  Wrench,
  ListChecks,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type InspectionStatus = 'ready_to_schedule' | 'scheduled' | 'passed' | 'failed' | 'conditional' | 'cancelled' | 'rescheduled'
type InspectionResult = 'pass' | 'fail' | 'conditional_pass' | 'no_show' | null

interface Deficiency {
  description: string
  responsibleVendor: string
  correctionTaskCreated: boolean
  resolved: boolean
  photos: number
}

interface Inspection {
  id: string
  type: string
  sequenceOrder: number
  prerequisite?: string
  date: string
  time: string
  inspector: string
  inspectorPhone: string
  status: InspectionStatus
  result: InspectionResult
  notes?: string
  linkedPermit: string
  projectName: string
  deficiencies?: Deficiency[]
  reinspectionOf?: string
  photos: number
  preInspectionChecklist?: { item: string; checked: boolean }[]
  scheduleImpact?: string
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockInspections: Inspection[] = [
  {
    id: '1',
    type: 'Foundation',
    sequenceOrder: 1,
    date: 'Feb 14, 2026',
    time: '9:00 AM',
    inspector: 'Mike Thompson',
    inspectorPhone: '(843) 724-3785',
    status: 'scheduled',
    result: null,
    linkedPermit: 'BP-2025-0842',
    projectName: 'Smith Residence',
    photos: 0,
    preInspectionChecklist: [
      { item: 'Rebar placement per engineered plan', checked: true },
      { item: 'Form boards secure and level', checked: true },
      { item: 'Vapor barrier installed', checked: true },
      { item: 'Plumbing stubs in place', checked: false },
      { item: 'Electrical conduit in slab', checked: false },
    ],
  },
  {
    id: '2',
    type: 'Electrical Rough-In',
    sequenceOrder: 4,
    prerequisite: 'Framing must pass',
    date: 'Feb 18, 2026',
    time: '2:00 PM',
    inspector: 'Sarah Chen',
    inspectorPhone: '(843) 724-3786',
    status: 'scheduled',
    result: null,
    linkedPermit: 'BP-2025-0842',
    projectName: 'Smith Residence',
    photos: 0,
    preInspectionChecklist: [
      { item: 'All boxes nailed at proper height', checked: false },
      { item: 'Wire supports within 12" of box', checked: false },
      { item: 'Panel clearance (36") maintained', checked: false },
      { item: 'GFCI/AFCI protection per code', checked: false },
      { item: 'Smoke/CO detector locations wired', checked: false },
    ],
  },
  {
    id: '3',
    type: 'Framing',
    sequenceOrder: 2,
    prerequisite: 'Foundation must pass',
    date: 'Feb 12, 2026',
    time: '10:30 AM',
    inspector: 'Mike Thompson',
    inspectorPhone: '(843) 724-3785',
    status: 'passed',
    result: 'pass',
    notes: 'All framing meets IRC 2021 code requirements. Hurricane straps properly installed per engineered plan. Shear walls verified.',
    linkedPermit: 'BP-2025-0842',
    projectName: 'Smith Residence',
    photos: 4,
  },
  {
    id: '4',
    type: 'Plumbing Rough-In',
    sequenceOrder: 3,
    prerequisite: 'Foundation must pass',
    date: 'Feb 11, 2026',
    time: '11:00 AM',
    inspector: 'James Rodriguez',
    inspectorPhone: '(843) 724-3787',
    status: 'failed',
    result: 'fail',
    notes: 'Two deficiencies found requiring correction before re-inspection.',
    linkedPermit: 'PL-2026-1102',
    projectName: 'Smith Residence',
    photos: 3,
    deficiencies: [
      {
        description: 'Water heater vent clearance insufficient - requires 6" from combustible materials, currently at 3"',
        responsibleVendor: 'Jones Plumbing',
        correctionTaskCreated: true,
        resolved: true,
        photos: 2,
      },
      {
        description: 'P-trap missing under laundry sink drain - required per IPC 2021 Section 1002',
        responsibleVendor: 'Jones Plumbing',
        correctionTaskCreated: true,
        resolved: true,
        photos: 1,
      },
    ],
    scheduleImpact: 'Insulation cannot start until plumbing re-inspection passes. 2-day delay propagated to drywall.',
  },
  {
    id: '5',
    type: 'Plumbing Rough-In (Re-inspection)',
    sequenceOrder: 3,
    date: 'Feb 15, 2026',
    time: '1:00 PM',
    inspector: 'James Rodriguez',
    inspectorPhone: '(843) 724-3787',
    status: 'rescheduled',
    result: null,
    notes: 'Re-inspection after both corrections verified by Jones Plumbing',
    linkedPermit: 'PL-2026-1102',
    projectName: 'Smith Residence',
    photos: 0,
    reinspectionOf: 'CLM-2026-004',
  },
  {
    id: '6',
    type: 'Roofing',
    sequenceOrder: 5,
    prerequisite: 'Framing must pass',
    date: 'Feb 10, 2026',
    time: '9:30 AM',
    inspector: 'Sarah Chen',
    inspectorPhone: '(843) 724-3786',
    status: 'passed',
    result: 'pass',
    notes: 'Impact-rated underlayment verified (Sharkskin Ultra SA). Fastener pattern compliant with HVHZ requirements. Ridge vent properly installed.',
    linkedPermit: 'BP-2025-0842',
    projectName: 'Smith Residence',
    photos: 6,
  },
  {
    id: '7',
    type: 'HVAC Rough-In',
    sequenceOrder: 4,
    prerequisite: 'Framing must pass',
    date: 'Feb 20, 2026',
    time: '10:00 AM',
    inspector: 'Mike Thompson',
    inspectorPhone: '(843) 724-3785',
    status: 'scheduled',
    result: null,
    linkedPermit: 'BP-2025-0842',
    projectName: 'Smith Residence',
    photos: 0,
    preInspectionChecklist: [
      { item: 'Ductwork properly supported and sealed', checked: false },
      { item: 'Refrigerant line clearances met', checked: false },
      { item: 'Condensate drain piped per code', checked: false },
      { item: 'Equipment access maintained', checked: false },
    ],
  },
  {
    id: '8',
    type: 'Insulation',
    sequenceOrder: 6,
    prerequisite: 'All rough-in inspections must pass',
    date: '-',
    time: '-',
    inspector: 'TBD',
    inspectorPhone: '-',
    status: 'ready_to_schedule',
    result: null,
    linkedPermit: 'BP-2025-0842',
    projectName: 'Smith Residence',
    photos: 0,
    scheduleImpact: 'Blocked: Waiting for plumbing re-inspection and electrical rough-in to pass',
  },
  {
    id: '9',
    type: 'Drywall (Pre-Cover)',
    sequenceOrder: 7,
    prerequisite: 'Insulation must pass',
    date: '-',
    time: '-',
    inspector: 'TBD',
    inspectorPhone: '-',
    status: 'ready_to_schedule',
    result: null,
    linkedPermit: 'BP-2025-0842',
    projectName: 'Smith Residence',
    photos: 0,
  },
  {
    id: '10',
    type: 'Final Building',
    sequenceOrder: 10,
    prerequisite: 'All prior inspections must pass',
    date: '-',
    time: '-',
    inspector: 'TBD',
    inspectorPhone: '-',
    status: 'ready_to_schedule',
    result: null,
    linkedPermit: 'BP-2025-0842',
    projectName: 'Smith Residence',
    photos: 0,
    preInspectionChecklist: [
      { item: 'All permits current and posted', checked: false },
      { item: 'All prior inspections passed', checked: false },
      { item: 'Utilities connected and operational', checked: false },
      { item: 'Address posted and visible', checked: false },
      { item: 'Smoke/CO detectors installed and tested', checked: false },
      { item: 'Egress windows meet code', checked: false },
      { item: 'GFCIs tested', checked: false },
    ],
  },
]

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const statusConfig = {
  ready_to_schedule: {
    label: 'Ready to Schedule',
    color: 'bg-gray-100 text-gray-700',
    icon: ListChecks,
    iconColor: 'text-gray-500',
  },
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
  conditional: {
    label: 'Conditional Pass',
    color: 'bg-amber-100 text-amber-700',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-500',
    icon: XCircle,
    iconColor: 'text-gray-400',
  },
  rescheduled: {
    label: 'Rescheduled',
    color: 'bg-amber-100 text-amber-700',
    icon: AlertCircle,
    iconColor: 'text-amber-500',
  },
}

// Calendar data
const calendarDays = [
  { day: 'Mon', date: 10, inspections: [{ type: 'Roofing', time: '9:30 AM', status: 'passed' as InspectionStatus }] },
  { day: 'Tue', date: 11, inspections: [{ type: 'Plumbing', time: '11:00 AM', status: 'failed' as InspectionStatus }] },
  { day: 'Wed', date: 12, inspections: [{ type: 'Framing', time: '10:30 AM', status: 'passed' as InspectionStatus }] },
  { day: 'Thu', date: 13, inspections: [] },
  { day: 'Fri', date: 14, inspections: [{ type: 'Foundation', time: '9:00 AM', status: 'scheduled' as InspectionStatus }] },
  { day: 'Sat', date: 15, inspections: [{ type: 'Plumb Re-insp', time: '1:00 PM', status: 'rescheduled' as InspectionStatus }] },
  { day: 'Sun', date: 16, inspections: [] },
]

// ---------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------

function InspectionCard({ inspection }: { inspection: Inspection }) {
  const config = statusConfig[inspection.status]
  const StatusIcon = config.icon

  return (
    <div className={cn(
      "bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer",
      inspection.status === 'failed' ? 'border-red-200' :
      inspection.scheduleImpact ? 'border-l-4 border-l-amber-400' : 'border-gray-200'
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {/* Status Icon */}
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0",
            inspection.status === 'passed' ? 'bg-green-50' :
            inspection.status === 'failed' ? 'bg-red-50' :
            inspection.status === 'rescheduled' || inspection.status === 'conditional' ? 'bg-amber-50' :
            inspection.status === 'ready_to_schedule' ? 'bg-gray-50' :
            'bg-blue-50'
          )}>
            <StatusIcon className={cn("h-5 w-5", config.iconColor)} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-gray-900">{inspection.type}</h4>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", config.color)}>
                {config.label}
              </span>
              {inspection.reinspectionOf && (
                <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  Re-inspection
                </span>
              )}
              {inspection.photos > 0 && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Camera className="h-3 w-3" />
                  {inspection.photos}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500 flex-wrap">
              {inspection.date !== '-' && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {inspection.date}
                </span>
              )}
              {inspection.time !== '-' && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {inspection.time}
                </span>
              )}
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {inspection.inspector}
              </span>
              {inspection.inspectorPhone !== '-' && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Phone className="h-3 w-3" />
                  {inspection.inspectorPhone}
                </span>
              )}
            </div>

            {/* Prerequisite */}
            {inspection.prerequisite && inspection.status === 'ready_to_schedule' && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Prerequisite: {inspection.prerequisite}
              </p>
            )}

            {/* Notes */}
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

            {/* Deficiencies */}
            {inspection.deficiencies && inspection.deficiencies.length > 0 && (
              <div className="mt-2 space-y-2">
                <p className="text-xs font-medium text-red-700">Deficiencies ({inspection.deficiencies.length}):</p>
                {inspection.deficiencies.map((def, idx) => (
                  <div key={idx} className={cn(
                    "p-2 rounded border text-xs",
                    def.resolved ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  )}>
                    <div className="flex items-start justify-between">
                      <p className={def.resolved ? 'text-green-700' : 'text-red-700'}>{def.description}</p>
                      {def.resolved && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0 ml-2" />}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-gray-500">
                      <span className="flex items-center gap-1"><Wrench className="h-3 w-3" />{def.responsibleVendor}</span>
                      {def.correctionTaskCreated && <span className="text-blue-600 flex items-center gap-1"><ClipboardCheck className="h-3 w-3" />Task created</span>}
                      {def.photos > 0 && <span className="flex items-center gap-1"><Camera className="h-3 w-3" />{def.photos} photos</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pre-inspection Checklist */}
            {inspection.preInspectionChecklist && inspection.status === 'scheduled' && (
              <div className="mt-2 p-2 bg-blue-50 rounded">
                <p className="text-xs font-medium text-blue-700 mb-1 flex items-center gap-1">
                  <ListChecks className="h-3 w-3" />
                  Pre-Inspection Checklist ({inspection.preInspectionChecklist.filter(i => i.checked).length}/{inspection.preInspectionChecklist.length})
                </p>
                <div className="space-y-0.5">
                  {inspection.preInspectionChecklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs">
                      {item.checked ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <div className="h-3 w-3 rounded-full border border-gray-300" />
                      )}
                      <span className={item.checked ? 'text-green-700' : 'text-gray-600'}>{item.item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule Impact */}
            {inspection.scheduleImpact && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-amber-700">{inspection.scheduleImpact}</span>
              </div>
            )}
          </div>
        </div>

        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-2" />
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

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function InspectionsPreview() {
  const [inspectorFilter, setInspectorFilter] = useState<string>('all')
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  // Stats
  const totalInspections = mockInspections.length
  const readyToSchedule = mockInspections.filter(i => i.status === 'ready_to_schedule').length
  const scheduledCount = mockInspections.filter(i => i.status === 'scheduled' || i.status === 'rescheduled').length
  const passedCount = mockInspections.filter(i => i.status === 'passed').length
  const failedCount = mockInspections.filter(i => i.status === 'failed').length
  const completedCount = passedCount + failedCount
  const passRate = completedCount > 0 ? Math.round((passedCount / completedCount) * 100) : 0
  const deficiencyCount = mockInspections.reduce((sum, i) => sum + (i.deficiencies?.length ?? 0), 0)
  const unresolvedDeficiencies = mockInspections.reduce((sum, i) => sum + (i.deficiencies?.filter(d => !d.resolved).length ?? 0), 0)

  const inspectors = [...new Set(mockInspections.map(i => i.inspector).filter(i => i !== 'TBD'))]

  const filteredInspections = sortItems(
    mockInspections.filter(i => {
      if (!matchesSearch(i, search, ['type', 'inspector', 'projectName', 'linkedPermit', 'notes'])) return false
      if (activeTab !== 'all' && i.status !== activeTab) return false
      if (inspectorFilter !== 'all' && i.inspector !== inspectorFilter) return false
      return true
    }),
    activeSort as keyof Inspection | '',
    sortDirection,
  )

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Inspections - Smith Residence</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {scheduledCount} upcoming
              </span>
              {failedCount > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {failedCount} failed
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <ClipboardCheck className="h-4 w-4" />
                {totalInspections} total
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {passRate}% pass rate ({passedCount}/{completedCount})
              </span>
              {unresolvedDeficiencies > 0 && (
                <span className="flex items-center gap-1 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  {unresolvedDeficiencies} unresolved deficiencies
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={cn("p-2", viewMode === 'list' ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50")}
              >
                <ClipboardCheck className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={cn("p-2", viewMode === 'calendar' ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50")}
              >
                <Calendar className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-6 gap-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-lg">
              <ListChecks className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-700">{readyToSchedule}</div>
              <div className="text-xs text-gray-500">Ready to Schedule</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <CalendarClock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">{scheduledCount}</div>
              <div className="text-xs text-blue-600">Scheduled</div>
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
              <div className="text-2xl font-bold text-red-700">{failedCount}</div>
              <div className="text-xs text-red-600">Failed</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-700">{deficiencyCount}</div>
              <div className="text-xs text-amber-600">Deficiencies ({unresolvedDeficiencies} open)</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-700">{passedCount}</div>
              <div className="text-xs text-purple-600">Passed Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search inspections, inspectors, permits..."
          tabs={[
            { key: 'all', label: 'All', count: mockInspections.length },
            { key: 'ready_to_schedule', label: 'Ready', count: readyToSchedule },
            { key: 'scheduled', label: 'Scheduled', count: mockInspections.filter(i => i.status === 'scheduled').length },
            { key: 'passed', label: 'Passed', count: passedCount },
            { key: 'failed', label: 'Failed', count: failedCount },
            { key: 'rescheduled', label: 'Rescheduled', count: mockInspections.filter(i => i.status === 'rescheduled').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Inspectors',
              value: inspectorFilter,
              options: inspectors.map(i => ({ value: i, label: i })),
              onChange: (v) => setInspectorFilter(v),
            },
          ]}
          sortOptions={[
            { value: 'type', label: 'Type' },
            { value: 'date', label: 'Date' },
            { value: 'inspector', label: 'Inspector' },
            { value: 'status', label: 'Status' },
            { value: 'sequenceOrder', label: 'Sequence' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[
            { icon: Plus, label: 'Schedule Inspection', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filteredInspections.length}
          totalCount={mockInspections.length}
        />
      </div>

      {/* Content Area */}
      <div className="p-4">
        {viewMode === 'calendar' ? (
          <CalendarView />
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {filteredInspections.map(inspection => (
              <InspectionCard key={inspection.id} inspection={inspection} />
            ))}
            {filteredInspections.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No inspections found matching your criteria</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Inspection Intelligence:</span>
          </div>
          <div className="space-y-1 text-sm text-amber-700">
            <p>&#x2022; Foundation inspection Friday: ensure plumbing stubs and electrical conduit in slab before 9 AM</p>
            <p>&#x2022; Mike Thompson prefers morning inspections -- schedule before 11 AM for faster turnaround</p>
            <p>&#x2022; Plumbing re-inspection Saturday: verify water heater vent clearance (6") and laundry P-trap installed</p>
            <p>&#x2022; Electrical rough-in checklist 40% incomplete -- panel clearance (36") is most common fail point for Sarah Chen</p>
            <p>&#x2022; Insulation inspection blocked until plumbing re-inspection passes. 2-day schedule delay propagating to drywall.</p>
            <p>&#x2022; Historical: Jones Plumbing has 78% first-pass rate (below avg 85%). Recommend extra QC before scheduling inspections.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
