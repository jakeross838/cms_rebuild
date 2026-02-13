'use client'

import { useState } from 'react'
import {
  Plus,
  Mic,
  Calendar,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Users,
  Clock,
  Camera,
  ChevronRight,
  Sparkles,
  FileText,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Truck,
  HardHat,
  ClipboardCheck,
  Eye,
  Lock,
  MessageSquare,
  Droplets,
  Brain,
  Shield,
  Pencil,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

interface WorkItem {
  description: string
  trade: string
  phase: string
  location: string
  percentComplete?: number
  scheduleTaskId?: string
}

interface ManpowerEntry {
  vendorName: string
  headcount: number
  hours: number
  trade: string
  checkedInVia: 'manual' | 'qr_code' | 'geofence'
}

interface DeliveryEntry {
  description: string
  vendorName: string
  poMatched?: string
  receivedBy: string
  hasDiscrepancy: boolean
}

interface IssueEntry {
  description: string
  category: 'weather_delay' | 'material_delay' | 'rework' | 'safety' | 'design_conflict' | 'inspection_fail' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  scheduleImpactDays?: number
  triggeredEntity?: string
  status: 'open' | 'in_progress' | 'resolved'
}

interface VisitorEntry {
  name: string
  company: string
  purpose: string
  timeIn: string
  timeOut?: string
}

interface DailyLog {
  id: string
  date: string
  dayOfWeek: string
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'returned'
  isImmutable: boolean
  weather: {
    condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy'
    tempHigh: number
    tempLow: number
    precipitation: number
    windMph: number
    humidity: number
    source: 'api' | 'manual'
  }
  workPerformed: WorkItem[]
  manpower: ManpowerEntry[]
  deliveries: DeliveryEntry[]
  issues: IssueEntry[]
  visitors: VisitorEntry[]
  photosCount: number
  photoMinimum: number
  submittedBy?: string
  submittedAt?: string
  reviewedBy?: string
  reviewNote?: string
  hasAmendments: boolean
  hasVoiceTranscript: boolean
  aiSummary?: string
  aiClientSummary?: string
  scheduleUpdates: number
}

const mockDailyLogs: DailyLog[] = [
  {
    id: '1',
    date: 'Feb 12, 2026',
    dayOfWeek: 'Thursday',
    status: 'draft',
    isImmutable: false,
    weather: { condition: 'sunny', tempHigh: 72, tempLow: 58, precipitation: 0, windMph: 8, humidity: 55, source: 'api' },
    workPerformed: [
      { description: 'Completed roof sheathing on north side', trade: 'Framing', phase: 'Framing', location: 'Roof - North', percentComplete: 85 },
      { description: 'Started window flashing installation', trade: 'Waterproofing', phase: 'Rough-In', location: 'Exterior', percentComplete: 15 },
    ],
    manpower: [
      { vendorName: 'ABC Framing', headcount: 5, hours: 40, trade: 'Framing', checkedInVia: 'qr_code' },
      { vendorName: 'General Labor', headcount: 3, hours: 24, trade: 'General', checkedInVia: 'manual' },
    ],
    deliveries: [
      { description: 'PGT Impact Windows - 12 units', vendorName: 'PGT Industries', poMatched: 'PO-023', receivedBy: 'Mike Johnson', hasDiscrepancy: false },
    ],
    issues: [],
    visitors: [],
    photosCount: 12,
    photoMinimum: 4,
    hasAmendments: false,
    hasVoiceTranscript: true,
    aiSummary: 'Productivity 12% above average for this crew size. Roof sheathing nearing completion.',
    aiClientSummary: 'Great progress today -- roof sheathing nearly complete and impact windows delivered to site.',
    scheduleUpdates: 2,
  },
  {
    id: '2',
    date: 'Feb 11, 2026',
    dayOfWeek: 'Wednesday',
    status: 'submitted',
    isImmutable: true,
    weather: { condition: 'cloudy', tempHigh: 68, tempLow: 55, precipitation: 0, windMph: 12, humidity: 65, source: 'api' },
    workPerformed: [
      { description: 'Continued roof framing -- hip rafters installed', trade: 'Framing', phase: 'Framing', location: 'Roof', percentComplete: 70 },
      { description: 'Electrical panel set in garage', trade: 'Electrical', phase: 'Rough-In', location: 'Garage' },
    ],
    manpower: [
      { vendorName: 'ABC Framing', headcount: 4, hours: 32, trade: 'Framing', checkedInVia: 'qr_code' },
      { vendorName: 'Sparks Electric', headcount: 3, hours: 24, trade: 'Electrical', checkedInVia: 'manual' },
    ],
    deliveries: [
      { description: 'Lumber delivery - rafters and sheathing', vendorName: '84 Lumber', poMatched: 'PO-019', receivedBy: 'Tom Wilson', hasDiscrepancy: false },
    ],
    issues: [
      { description: 'Lumber delivery arrived 2 hours late -- delayed rafter cutting', category: 'material_delay', severity: 'medium', scheduleImpactDays: 0, status: 'resolved' },
    ],
    visitors: [],
    photosCount: 8,
    photoMinimum: 4,
    submittedBy: 'Mike Johnson',
    submittedAt: '5:45 PM',
    hasAmendments: false,
    hasVoiceTranscript: false,
    aiSummary: 'Solid day despite lumber delay. Electrical rough-in beginning ahead of schedule.',
    aiClientSummary: 'Roof framing continuing well. Electrical work has started in the garage.',
    scheduleUpdates: 1,
  },
  {
    id: '3',
    date: 'Feb 10, 2026',
    dayOfWeek: 'Tuesday',
    status: 'approved',
    isImmutable: true,
    weather: { condition: 'rainy', tempHigh: 65, tempLow: 52, precipitation: 1.2, windMph: 15, humidity: 88, source: 'api' },
    workPerformed: [
      { description: 'Interior electrical rough-in -- master bedroom and bath', trade: 'Electrical', phase: 'Rough-In', location: 'Master Suite', percentComplete: 40 },
    ],
    manpower: [
      { vendorName: 'Sparks Electric', headcount: 4, hours: 24, trade: 'Electrical', checkedInVia: 'manual' },
    ],
    deliveries: [],
    issues: [
      { description: 'Heavy rain until noon -- no exterior work possible', category: 'weather_delay', severity: 'medium', scheduleImpactDays: 0.5, triggeredEntity: 'Schedule Note', status: 'resolved' },
    ],
    visitors: [
      { name: 'Bob Anderson', company: 'Client', purpose: 'Site visit -- reviewed framing progress', timeIn: '2:00 PM', timeOut: '3:15 PM' },
    ],
    photosCount: 5,
    photoMinimum: 4,
    submittedBy: 'Mike Johnson',
    submittedAt: '6:10 PM',
    reviewedBy: 'John Smith',
    hasAmendments: false,
    hasVoiceTranscript: true,
    aiSummary: 'Rain delay limited crew to interior work only. Electrical rough-in progressing well in master suite.',
    aiClientSummary: 'Due to rain, work focused indoors today. Electrical wiring progressing in the master suite.',
    scheduleUpdates: 1,
  },
  {
    id: '4',
    date: 'Feb 9, 2026',
    dayOfWeek: 'Monday',
    status: 'approved',
    isImmutable: true,
    weather: { condition: 'sunny', tempHigh: 74, tempLow: 60, precipitation: 0, windMph: 5, humidity: 45, source: 'api' },
    workPerformed: [
      { description: 'Roof framing started -- ridge beam set', trade: 'Framing', phase: 'Framing', location: 'Roof', percentComplete: 25 },
      { description: 'Rafters cut and staged for installation', trade: 'Framing', phase: 'Framing', location: 'Staging Area' },
      { description: 'Plumbing top-out in master bath', trade: 'Plumbing', phase: 'Rough-In', location: 'Master Bath', percentComplete: 100 },
    ],
    manpower: [
      { vendorName: 'ABC Framing', headcount: 6, hours: 48, trade: 'Framing', checkedInVia: 'qr_code' },
      { vendorName: 'Gulf Plumbing', headcount: 2, hours: 16, trade: 'Plumbing', checkedInVia: 'manual' },
      { vendorName: 'General Labor', headcount: 1, hours: 8, trade: 'General', checkedInVia: 'manual' },
    ],
    deliveries: [
      { description: 'Roof trusses - engineered (14 units)', vendorName: 'Southern Truss Co.', poMatched: 'PO-021', receivedBy: 'Mike Johnson', hasDiscrepancy: false },
    ],
    issues: [],
    visitors: [],
    photosCount: 15,
    photoMinimum: 4,
    submittedBy: 'Mike Johnson',
    submittedAt: '5:30 PM',
    reviewedBy: 'John Smith',
    hasAmendments: false,
    hasVoiceTranscript: true,
    aiSummary: 'Best productivity day this week -- clear weather and full crew. Roof framing started strong.',
    aiClientSummary: 'Exciting day! Roof framing has begun with the ridge beam set. Plumbing completed in the master bathroom.',
    scheduleUpdates: 3,
  },
  {
    id: '5',
    date: 'Feb 7, 2026',
    dayOfWeek: 'Friday',
    status: 'approved',
    isImmutable: true,
    weather: { condition: 'windy', tempHigh: 70, tempLow: 56, precipitation: 0, windMph: 35, humidity: 50, source: 'api' },
    workPerformed: [
      { description: 'Wall framing completed -- all exterior and interior walls standing', trade: 'Framing', phase: 'Framing', location: 'Entire House', percentComplete: 100 },
      { description: 'Prepared staging area for roof framing', trade: 'Framing', phase: 'Framing', location: 'Exterior' },
    ],
    manpower: [
      { vendorName: 'ABC Framing', headcount: 4, hours: 28, trade: 'Framing', checkedInVia: 'qr_code' },
      { vendorName: 'General Labor', headcount: 2, hours: 14, trade: 'General', checkedInVia: 'manual' },
    ],
    deliveries: [],
    issues: [
      { description: 'Wind gusts 35+ mph -- stopped crane work at 2 PM, safety stand-down', category: 'safety', severity: 'high', scheduleImpactDays: 0.25, triggeredEntity: 'Safety Obs.', status: 'resolved' },
    ],
    visitors: [
      { name: 'Jim Torres', company: 'County Building Dept.', purpose: 'Framing inspection', timeIn: '10:00 AM', timeOut: '11:30 AM' },
    ],
    photosCount: 10,
    photoMinimum: 4,
    submittedBy: 'Mike Johnson',
    submittedAt: '4:15 PM',
    reviewedBy: 'John Smith',
    hasAmendments: true,
    hasVoiceTranscript: false,
    aiSummary: 'Wall framing milestone reached despite wind delay. Safety stand-down properly documented.',
    aiClientSummary: 'All walls are now framed! Roof framing preparations underway for next week.',
    scheduleUpdates: 2,
  },
  {
    id: '6',
    date: 'Feb 6, 2026',
    dayOfWeek: 'Thursday',
    status: 'returned',
    isImmutable: false,
    weather: { condition: 'sunny', tempHigh: 71, tempLow: 57, precipitation: 0, windMph: 10, humidity: 52, source: 'api' },
    workPerformed: [
      { description: 'Interior wall framing -- bedrooms 2 and 3', trade: 'Framing', phase: 'Framing', location: 'Bedrooms', percentComplete: 90 },
    ],
    manpower: [
      { vendorName: 'ABC Framing', headcount: 5, hours: 40, trade: 'Framing', checkedInVia: 'qr_code' },
    ],
    deliveries: [],
    issues: [],
    visitors: [],
    photosCount: 2,
    photoMinimum: 4,
    hasAmendments: false,
    hasVoiceTranscript: false,
    reviewNote: 'Please add more photos -- minimum 4 required. Also need manpower hours for ABC Framing crew.',
    scheduleUpdates: 0,
  },
]

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: CloudSnow,
  windy: Wind,
}

const weatherColors = {
  sunny: 'text-yellow-500 bg-yellow-50',
  cloudy: 'text-gray-500 bg-gray-100',
  rainy: 'text-blue-500 bg-blue-50',
  snowy: 'text-cyan-500 bg-cyan-50',
  windy: 'text-teal-500 bg-teal-50',
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600', icon: Pencil },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: FileText },
  in_review: { label: 'In Review', color: 'bg-yellow-100 text-yellow-700', icon: Eye },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  returned: { label: 'Returned', color: 'bg-orange-100 text-orange-700', icon: RotateCcw },
}

const severityConfig: Record<string, { color: string }> = {
  low: { color: 'bg-gray-100 text-gray-600' },
  medium: { color: 'bg-yellow-100 text-yellow-700' },
  high: { color: 'bg-orange-100 text-orange-700' },
  critical: { color: 'bg-red-100 text-red-700' },
}

const issueCategoryLabels: Record<string, string> = {
  weather_delay: 'Weather',
  material_delay: 'Material',
  rework: 'Rework',
  safety: 'Safety',
  design_conflict: 'Design',
  inspection_fail: 'Inspection',
  other: 'Other',
}

function DailyLogCard({ log }: { log: DailyLog }) {
  const WeatherIcon = weatherIcons[log.weather.condition]
  const statusCfg = statusConfig[log.status]
  const StatusIcon = statusCfg.icon
  const totalManpower = log.manpower.reduce((sum, m) => sum + m.headcount, 0)
  const totalHours = log.manpower.reduce((sum, m) => sum + m.hours, 0)
  const photoBelowMinimum = log.photosCount < log.photoMinimum

  return (
    <div className={cn(
      "bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer",
      log.status === 'returned' ? "border-orange-300" : "border-gray-200",
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Date */}
          <div className="text-center min-w-[60px]">
            <div className="text-2xl font-bold text-gray-900">{log.date.split(' ')[1].replace(',', '')}</div>
            <div className="text-xs text-gray-500 uppercase">{log.date.split(' ')[0]}</div>
            <div className="text-xs text-gray-400">{log.dayOfWeek}</div>
          </div>

          {/* Weather */}
          <div className={cn(
            "flex flex-col items-center justify-center p-2 rounded-lg min-w-[70px]",
            weatherColors[log.weather.condition]
          )}>
            <WeatherIcon className="h-6 w-6" />
            <div className="text-xs mt-1 font-medium">
              {log.weather.tempHigh}° / {log.weather.tempLow}°
            </div>
            {log.weather.precipitation > 0 && (
              <div className="text-xs flex items-center gap-0.5 mt-0.5">
                <Droplets className="h-3 w-3" />
                {log.weather.precipitation}&quot;
              </div>
            )}
            {log.weather.source === 'api' && (
              <div className="text-[10px] text-gray-400 mt-0.5">auto</div>
            )}
          </div>

          {/* Work Summary */}
          <div className="flex-1">
            {/* Status + immutability badges */}
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5", statusCfg.color)}>
                <StatusIcon className="h-3 w-3" />
                {statusCfg.label}
              </span>
              {log.isImmutable && (
                <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Lock className="h-3 w-3" />
                  Immutable
                </span>
              )}
              {log.hasAmendments && (
                <span className="text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded">
                  Amended
                </span>
              )}
              {log.hasVoiceTranscript && (
                <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Mic className="h-3 w-3" />
                  Voice
                </span>
              )}
              {log.scheduleUpdates > 0 && (
                <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                  {log.scheduleUpdates} schedule update{log.scheduleUpdates > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Work performed summary */}
            <div className="space-y-0.5">
              {log.workPerformed.slice(0, 2).map((work, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="truncate">{work.description}</span>
                  {work.percentComplete !== undefined && (
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded flex-shrink-0">
                      {work.percentComplete}%
                    </span>
                  )}
                </div>
              ))}
              {log.workPerformed.length > 2 && (
                <div className="text-xs text-gray-400">+{log.workPerformed.length - 2} more work items</div>
              )}
            </div>

            {/* Issues */}
            {log.issues.length > 0 && (
              <div className="mt-1.5">
                {log.issues.map((issue, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span className={cn("px-1.5 py-0.5 rounded", severityConfig[issue.severity]?.color)}>
                      {issue.severity}
                    </span>
                    <span className="text-gray-500">{issueCategoryLabels[issue.category]}</span>
                    <span className="text-gray-600 truncate">{issue.description}</span>
                    {issue.scheduleImpactDays && issue.scheduleImpactDays > 0 && (
                      <span className="text-xs bg-red-50 text-red-600 px-1 py-0.5 rounded flex-shrink-0">
                        -{issue.scheduleImpactDays}d
                      </span>
                    )}
                    {issue.triggeredEntity && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-1 py-0.5 rounded flex-shrink-0">
                        {issue.triggeredEntity}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Deliveries */}
            {log.deliveries.length > 0 && (
              <div className="mt-1">
                {log.deliveries.map((delivery, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                    <Truck className="h-3 w-3 text-gray-400" />
                    <span className="truncate">{delivery.description}</span>
                    {delivery.poMatched && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-1 py-0.5 rounded flex-shrink-0">
                        {delivery.poMatched}
                      </span>
                    )}
                    {delivery.hasDiscrepancy && (
                      <span className="text-xs bg-red-50 text-red-600 px-1 py-0.5 rounded flex-shrink-0">
                        Discrepancy
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Visitors */}
            {log.visitors.length > 0 && (
              <div className="mt-1">
                {log.visitors.map((visitor, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                    <HardHat className="h-3 w-3" />
                    <span>{visitor.name} ({visitor.company}) -- {visitor.purpose}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Review note */}
            {log.reviewNote && (
              <div className="flex items-start gap-1 mt-1.5 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>{log.reviewNote}</span>
              </div>
            )}

            {/* AI summaries */}
            {log.aiSummary && (
              <p className="text-xs text-blue-600 mt-1.5 flex items-center gap-1">
                <Sparkles className="h-3 w-3 flex-shrink-0" />
                <span>{log.aiSummary}</span>
              </p>
            )}
          </div>
        </div>

        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-6 mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{totalManpower}</span>
          <span className="text-gray-400">crew</span>
          <span className="text-xs text-gray-400">
            ({log.manpower.map(m => m.vendorName).join(', ')})
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{totalHours}</span>
          <span className="text-gray-400">hours</span>
        </div>
        <div className={cn(
          "flex items-center gap-1.5 text-sm",
          photoBelowMinimum ? "text-amber-600" : "text-gray-600"
        )}>
          <Camera className={cn("h-4 w-4", photoBelowMinimum ? "text-amber-500" : "text-gray-400")} />
          <span className="font-medium">{log.photosCount}</span>
          <span className={photoBelowMinimum ? "text-amber-500" : "text-gray-400"}>
            photos {photoBelowMinimum ? `(min ${log.photoMinimum})` : ''}
          </span>
          {photoBelowMinimum && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
        </div>
        {log.submittedBy && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 ml-auto">
            Submitted by {log.submittedBy} at {log.submittedAt}
            {log.reviewedBy && <span>| Reviewed by {log.reviewedBy}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

export function DailyLogsPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState({ defaultTab: 'week' })
  const [isRecording, setIsRecording] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('All Statuses')
  const [weatherFilter, setWeatherFilter] = useState<string>('All Weather')

  const filteredLogs = sortItems(
    mockDailyLogs.filter(log => {
      if (!matchesSearch(log, search, ['dayOfWeek', 'date'])) return false
      if (statusFilter !== 'All Statuses') {
        if (statusFilter === 'Draft' && log.status !== 'draft') return false
        if (statusFilter === 'Submitted' && log.status !== 'submitted') return false
        if (statusFilter === 'Approved' && log.status !== 'approved') return false
        if (statusFilter === 'Returned' && log.status !== 'returned') return false
        if (statusFilter === 'Has Issues' && log.issues.length === 0) return false
      }
      if (weatherFilter !== 'All Weather') {
        if (weatherFilter === 'Rain Days' && log.weather.condition !== 'rainy') return false
        if (weatherFilter === 'Wind Days' && log.weather.condition !== 'windy') return false
        if (weatherFilter === 'Clear Days' && log.weather.condition !== 'sunny') return false
      }
      return true
    }),
    activeSort as keyof DailyLog | '',
    sortDirection,
  )

  const totalHours = mockDailyLogs.reduce((sum, log) => sum + log.manpower.reduce((s, m) => s + m.hours, 0), 0)
  const totalPhotos = mockDailyLogs.reduce((sum, log) => sum + log.photosCount, 0)
  const avgCrew = Math.round(mockDailyLogs.reduce((sum, log) => sum + log.manpower.reduce((s, m) => s + m.headcount, 0), 0) / mockDailyLogs.length)
  const totalIssues = mockDailyLogs.reduce((sum, log) => sum + log.issues.length, 0)
  const weatherDelayDays = mockDailyLogs.reduce((sum, log) => {
    return sum + log.issues.filter(i => i.category === 'weather_delay').reduce((s, i) => s + (i.scheduleImpactDays || 0), 0)
  }, 0)
  const draftCount = mockDailyLogs.filter(l => l.status === 'draft').length
  const returnedCount = mockDailyLogs.filter(l => l.status === 'returned').length
  const approvedCount = mockDailyLogs.filter(l => l.status === 'approved').length

  // Missing log detection (gap in dates)
  const hasMissingLog = true // Feb 8 (Saturday) would be expected if work calendar includes it

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Daily Logs - Smith Residence</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{mockDailyLogs.length} entries this week</span>
              {draftCount > 0 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{draftCount} draft</span>
              )}
              {returnedCount > 0 && (
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">{returnedCount} returned</span>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {totalHours} total hours
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {avgCrew} avg crew
              </span>
              <span className="flex items-center gap-1">
                <Camera className="h-4 w-4" />
                {totalPhotos} photos
              </span>
              {totalIssues > 0 && (
                <span className="flex items-center gap-1 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  {totalIssues} issue{totalIssues > 1 ? 's' : ''}
                </span>
              )}
              {weatherDelayDays > 0 && (
                <span className="flex items-center gap-1 text-blue-600">
                  <CloudRain className="h-4 w-4" />
                  {weatherDelayDays}d weather delay
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Entry Form */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full transition-all",
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
            title="Voice-to-text dictation"
          >
            <Mic className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <input
              type="text"
              placeholder={isRecording ? "Listening... Describe today's work" : "Quick entry: Describe today's work or click mic to dictate..."}
              className={cn(
                "w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                isRecording ? "border-red-300 bg-red-50" : "border-gray-200"
              )}
            />
            {isRecording && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-red-500 rounded animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-6 bg-red-500 rounded animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-3 bg-red-500 rounded animate-pulse" style={{ animationDelay: '300ms' }} />
                  <div className="w-1 h-5 bg-red-500 rounded animate-pulse" style={{ animationDelay: '450ms' }} />
                  <div className="w-1 h-4 bg-red-500 rounded animate-pulse" style={{ animationDelay: '600ms' }} />
                </div>
                <span className="text-xs text-red-600">Recording voice input...</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-1.5 bg-yellow-50 px-2.5 py-1.5 rounded-lg">
              <Thermometer className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-700">72°F</span>
              <Sun className="h-4 w-4 text-yellow-500" />
              <span className="text-xs text-yellow-600">auto</span>
            </div>
          </div>
        </div>
        {/* Quick action buttons */}
        <div className="flex items-center gap-2 mt-3">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <Camera className="h-3.5 w-3.5" />
            Quick Photo
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <AlertTriangle className="h-3.5 w-3.5" />
            Report Issue
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <Truck className="h-3.5 w-3.5" />
            Log Delivery
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <ClipboardCheck className="h-3.5 w-3.5" />
            Inspection
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <Shield className="h-3.5 w-3.5" />
            Safety Obs.
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <HardHat className="h-3.5 w-3.5" />
            Visitor
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search logs..."
          tabs={[
            { key: 'week', label: 'This Week', count: mockDailyLogs.length },
            { key: 'month', label: 'This Month' },
            { key: 'all', label: 'All Logs' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Statuses',
              value: statusFilter,
              options: [
                { value: 'Draft', label: 'Draft' },
                { value: 'Submitted', label: 'Submitted' },
                { value: 'Approved', label: 'Approved' },
                { value: 'Returned', label: 'Returned' },
                { value: 'Has Issues', label: 'Has Issues' },
              ],
              onChange: setStatusFilter,
            },
            {
              label: 'All Weather',
              value: weatherFilter,
              options: [
                { value: 'Clear Days', label: 'Clear Days' },
                { value: 'Rain Days', label: 'Rain Days' },
                { value: 'Wind Days', label: 'Wind Days' },
              ],
              onChange: setWeatherFilter,
            },
          ]}
          sortOptions={[
            { value: 'date', label: 'Date' },
            { value: 'status', label: 'Status' },
            { value: 'photosCount', label: 'Photos' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[
            { icon: Calendar, label: 'Calendar View', onClick: () => {} },
            { icon: FileText, label: 'Export PDF', onClick: () => {} },
            { icon: Plus, label: 'New Entry', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filteredLogs.length}
          totalCount={mockDailyLogs.length}
        />
      </div>

      {/* Summary Stats Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-6 gap-3">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-gray-900">{mockDailyLogs.length}</div>
            <div className="text-xs text-gray-500">Logs</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-blue-700">{totalHours}</div>
            <div className="text-xs text-blue-600">Hours</div>
          </div>
          <div className="bg-green-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-green-700">{approvedCount}</div>
            <div className="text-xs text-green-600">Approved</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-purple-700">{avgCrew}</div>
            <div className="text-xs text-purple-600">Avg Crew</div>
          </div>
          <div className={cn("rounded-lg p-2 text-center", totalIssues > 0 ? "bg-amber-50" : "bg-gray-50")}>
            <div className={cn("text-lg font-bold", totalIssues > 0 ? "text-amber-700" : "text-gray-700")}>{totalIssues}</div>
            <div className={cn("text-xs", totalIssues > 0 ? "text-amber-600" : "text-gray-500")}>Issues</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-indigo-700">{totalPhotos}</div>
            <div className="text-xs text-indigo-600">Photos</div>
          </div>
        </div>
      </div>

      {/* Timeline / Log List */}
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {filteredLogs.map(log => (
          <DailyLogCard key={log.id} log={log} />
        ))}
        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No daily logs found matching your criteria</p>
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insights:</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-amber-700">
            <span className="flex items-center gap-1">
              <Brain className="h-3.5 w-3.5" />
              Crew productivity 15% higher on clear days
            </span>
            <span className="text-amber-400">|</span>
            <span>Weather delays totaled {weatherDelayDays} day{weatherDelayDays !== 1 ? 's' : ''} this week (contract allows 10 total)</span>
            <span className="text-amber-400">|</span>
            <span>ABC Framing averaging 8.5 hrs/person -- above benchmark</span>
            <span className="text-amber-400">|</span>
            <span>4 schedule tasks auto-updated from log entries</span>
          </div>
        </div>
      </div>
    </div>
  )
}
