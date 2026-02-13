'use client'

import { useState } from 'react'
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  MoreHorizontal,
  Sparkles,
  Building2,
  Users,
  User,
  Calendar,
  ClipboardCheck,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  HardHat,
  BookOpen,
  Printer,
  ChevronRight,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

interface SafetyMetric {
  label: string
  value: string
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  status: 'success' | 'warning' | 'danger' | 'neutral'
  icon: React.ElementType
}

interface ToolboxTalk {
  id: string
  topic: string
  job: string
  scheduledDate: string
  scheduledTime: string
  requiredAttendees: number
  status: 'upcoming' | 'in-progress' | 'completed'
}

interface SafetyIncident {
  id: string
  type: 'incident' | 'near-miss' | 'observation'
  description: string
  job: string
  reportedBy: string
  date: string
  severity: 'low' | 'medium' | 'high'
  status: 'open' | 'under-review' | 'closed'
  correctiveAction?: string
  oshaRecordable: boolean
}

interface SafetyInspection {
  id: string
  type: string
  job: string
  inspector: string
  scheduledDate: string
  scheduledTime: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'issues-found'
  issueCount?: number
}

const safetyMetrics: SafetyMetric[] = [
  {
    label: 'Days Without Incident',
    value: '127',
    change: 'Record!',
    status: 'success',
    icon: Shield,
  },
  {
    label: 'YTD Incidents',
    value: '2',
    change: '-1 vs LY',
    trend: 'down',
    status: 'success',
    icon: AlertTriangle,
  },
  {
    label: 'Near Misses This Month',
    value: '5',
    change: '+2 review',
    trend: 'up',
    status: 'warning',
    icon: AlertCircle,
  },
  {
    label: 'Training Compliance',
    value: '94%',
    change: '3 gaps',
    status: 'warning',
    icon: Users,
  },
]

const upcomingToolboxTalks: ToolboxTalk[] = [
  {
    id: '1',
    topic: 'Fall Protection',
    job: 'Smith Residence',
    scheduledDate: 'Tomorrow',
    scheduledTime: '7:00 AM',
    requiredAttendees: 8,
    status: 'upcoming',
  },
  {
    id: '2',
    topic: 'Electrical Safety',
    job: 'Johnson Beach House',
    scheduledDate: 'Feb 14',
    scheduledTime: '7:00 AM',
    requiredAttendees: 6,
    status: 'upcoming',
  },
  {
    id: '3',
    topic: 'Heat Illness Prevention',
    job: 'All Sites',
    scheduledDate: 'Feb 17',
    scheduledTime: '7:00 AM',
    requiredAttendees: 15,
    status: 'upcoming',
  },
]

const recentIncidents: SafetyIncident[] = [
  {
    id: '1',
    type: 'near-miss',
    description: 'Unsecured ladder nearly fell when worker climbed',
    job: 'Smith Residence',
    reportedBy: 'Mike Smith',
    date: 'Jan 25',
    severity: 'medium',
    status: 'under-review',
    correctiveAction: 'Ladder securing protocol added to daily checklist',
    oshaRecordable: false,
  },
  {
    id: '2',
    type: 'near-miss',
    description: 'Material stacked too high, shifted during wind',
    job: 'Johnson Beach House',
    reportedBy: 'Tom Wilson',
    date: 'Jan 22',
    severity: 'low',
    status: 'closed',
    correctiveAction: 'Max stack height reminder added to delivery protocol',
    oshaRecordable: false,
  },
  {
    id: '3',
    type: 'observation',
    description: 'Missing safety glasses on 2 workers',
    job: 'Miller Addition',
    reportedBy: 'Sarah Johnson',
    date: 'Jan 20',
    severity: 'low',
    status: 'closed',
    correctiveAction: 'PPE reminder at morning meeting',
    oshaRecordable: false,
  },
]

const safetyInspections: SafetyInspection[] = [
  {
    id: '1',
    type: 'Site Safety Inspection',
    job: 'Johnson Beach House',
    inspector: 'Mike Smith',
    scheduledDate: 'Wed',
    scheduledTime: '9:00 AM',
    status: 'scheduled',
  },
  {
    id: '2',
    type: 'Fall Protection Audit',
    job: 'Smith Residence',
    inspector: 'Tom Wilson',
    scheduledDate: 'Thu',
    scheduledTime: '10:00 AM',
    status: 'scheduled',
  },
  {
    id: '3',
    type: 'Fire Extinguisher Check',
    job: 'All Sites',
    inspector: 'Sarah Johnson',
    scheduledDate: 'Fri',
    scheduledTime: '2:00 PM',
    status: 'scheduled',
  },
]

interface TrainingGap {
  employee: string
  training: string
  job: string
  dueDate: string
}

const trainingGaps: TrainingGap[] = [
  { employee: 'New Hire 1', training: 'OSHA 10', job: 'Smith Residence', dueDate: 'Before start' },
  { employee: 'New Hire 2', training: 'OSHA 10', job: 'Smith Residence', dueDate: 'Before start' },
  { employee: 'Tom Wilson', training: 'Fall Protection Refresher', job: 'All Sites', dueDate: 'Feb 28' },
]

function MetricCard({ metric }: { metric: SafetyMetric }) {
  const Icon = metric.icon

  return (
    <div className={cn(
      "rounded-lg p-4",
      metric.status === 'success' ? "bg-green-50" :
      metric.status === 'warning' ? "bg-amber-50" :
      metric.status === 'danger' ? "bg-red-50" :
      "bg-gray-50"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className={cn(
          "p-2 rounded-lg",
          metric.status === 'success' ? "bg-green-100" :
          metric.status === 'warning' ? "bg-amber-100" :
          metric.status === 'danger' ? "bg-red-100" :
          "bg-gray-100"
        )}>
          <Icon className={cn(
            "h-5 w-5",
            metric.status === 'success' ? "text-green-600" :
            metric.status === 'warning' ? "text-amber-600" :
            metric.status === 'danger' ? "text-red-600" :
            "text-gray-600"
          )} />
        </div>
        {metric.change && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            metric.trend === 'down' ? "text-green-600" :
            metric.trend === 'up' && metric.status === 'warning' ? "text-amber-600" :
            "text-gray-600"
          )}>
            {metric.trend === 'up' && <TrendingUp className="h-3 w-3" />}
            {metric.trend === 'down' && <TrendingDown className="h-3 w-3" />}
            {metric.change}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
      <div className="text-sm text-gray-500">{metric.label}</div>
    </div>
  )
}

function ToolboxTalkCard({ talk }: { talk: ToolboxTalk }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{talk.topic}</h4>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {talk.job}
            </p>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {talk.scheduledDate} {talk.scheduledTime}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {talk.requiredAttendees} required
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="View Materials">
            <BookOpen className="h-4 w-4" />
          </button>
          <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="Print Sign-In">
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function IncidentCard({ incident }: { incident: SafetyIncident }) {
  return (
    <div className={cn(
      "bg-white rounded-lg border p-4",
      incident.severity === 'high' ? "border-red-200" :
      incident.severity === 'medium' ? "border-amber-200" :
      "border-gray-200"
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs px-2 py-0.5 rounded font-medium",
            incident.type === 'incident' ? "bg-red-100 text-red-700" :
            incident.type === 'near-miss' ? "bg-amber-100 text-amber-700" :
            "bg-blue-100 text-blue-700"
          )}>
            {incident.type === 'incident' ? 'Incident' :
             incident.type === 'near-miss' ? 'Near Miss' :
             'Observation'}
          </span>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded font-medium",
            incident.status === 'open' ? "bg-red-100 text-red-700" :
            incident.status === 'under-review' ? "bg-amber-100 text-amber-700" :
            "bg-green-100 text-green-700"
          )}>
            {incident.status === 'open' ? 'Open' :
             incident.status === 'under-review' ? 'Under Review' :
             'Closed'}
          </span>
        </div>
        <span className="text-xs text-gray-500">{incident.date}</span>
      </div>
      <p className="text-sm text-gray-900 mb-2">{incident.description}</p>
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
        <span className="flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {incident.job}
        </span>
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {incident.reportedBy}
        </span>
      </div>
      {incident.correctiveAction && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
          <span className="font-medium">Corrective Action:</span> {incident.correctiveAction}
        </div>
      )}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {incident.oshaRecordable && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">OSHA Recordable</span>
          )}
        </div>
        <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
          View Details <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

function InspectionItem({ inspection }: { inspection: SafetyInspection }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <ClipboardCheck className="h-4 w-4 text-green-600" />
        </div>
        <div>
          <div className="font-medium text-gray-900 text-sm">{inspection.type}</div>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>{inspection.job}</span>
            <span className="text-gray-300">|</span>
            <span>{inspection.inspector}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium text-gray-900">{inspection.scheduledDate}</div>
        <div className="text-xs text-gray-500">{inspection.scheduledTime}</div>
      </div>
    </div>
  )
}

export function SafetyPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState({ defaultTab: 'dashboard' })

  // Filtered incidents for the incidents tab
  const filteredIncidents = sortItems(
    recentIncidents.filter(incident => {
      if (!matchesSearch(incident, search, ['description', 'job', 'reportedBy', 'type'])) return false
      return true
    }),
    activeSort as keyof SafetyIncident | '',
    sortDirection,
  )

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Safety Management</h3>
            <p className="text-sm text-gray-500">Track safety programs, incidents, and training</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <ClipboardCheck className="h-4 w-4" />
              New Inspection
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
              <AlertTriangle className="h-4 w-4" />
              Report Incident
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar with Search + Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search safety records..."
          tabs={[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'incidents', label: 'Incidents & Near Misses', count: recentIncidents.length },
            { key: 'training', label: 'Training & Compliance' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={
            activeTab === 'incidents'
              ? [
                  { value: 'date', label: 'Date' },
                  { value: 'severity', label: 'Severity' },
                  { value: 'status', label: 'Status' },
                  { value: 'job', label: 'Job' },
                ]
              : []
          }
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Metrics */}
            <div className="grid grid-cols-4 gap-4">
              {safetyMetrics.map((metric, i) => (
                <MetricCard key={i} metric={metric} />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Upcoming Toolbox Talks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    Upcoming Toolbox Talks
                  </h4>
                  <button className="text-xs text-blue-600 hover:text-blue-700">Schedule New</button>
                </div>
                <div className="space-y-2">
                  {upcomingToolboxTalks.map(talk => (
                    <ToolboxTalkCard key={talk.id} talk={talk} />
                  ))}
                </div>
              </div>

              {/* Upcoming Inspections */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-green-600" />
                    Upcoming Inspections
                  </h4>
                  <button className="text-xs text-blue-600 hover:text-blue-700">View All</button>
                </div>
                <div>
                  {safetyInspections.map(inspection => (
                    <InspectionItem key={inspection.id} inspection={inspection} />
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Near Misses */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  Recent Near Misses (Review Required)
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {recentIncidents.filter(i => i.status !== 'closed').map(incident => (
                  <IncidentCard key={incident.id} incident={incident} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {filteredIncidents.map(incident => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
            {filteredIncidents.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No incidents found matching your search</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'training' && (
          <div className="space-y-4">
            {/* Training Gaps */}
            <div className="bg-white rounded-lg border border-amber-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h4 className="font-medium text-gray-900">Training Gaps</h4>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
                  {trainingGaps.length} employees
                </span>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Employee</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Required Training</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Job Assignment</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Due</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {trainingGaps.map((gap, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-sm text-gray-900">{gap.employee}</td>
                      <td className="px-3 py-2 text-sm text-gray-600">{gap.training}</td>
                      <td className="px-3 py-2 text-sm text-gray-600">{gap.job}</td>
                      <td className="px-3 py-2 text-sm text-amber-600 font-medium">{gap.dueDate}</td>
                      <td className="px-3 py-2">
                        <button className="text-xs text-blue-600 hover:text-blue-700">Schedule</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Training Compliance by Category */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 mb-4">Training Compliance by Category</h4>
              <div className="space-y-3">
                {[
                  { category: 'OSHA 10/30', compliant: 12, total: 15, percentage: 80 },
                  { category: 'Fall Protection', compliant: 14, total: 15, percentage: 93 },
                  { category: 'First Aid/CPR', compliant: 10, total: 15, percentage: 67 },
                  { category: 'Hazard Communication', compliant: 15, total: 15, percentage: 100 },
                ].map(item => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{item.category}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {item.compliant}/{item.total} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          item.percentage >= 90 ? "bg-green-500" :
                          item.percentage >= 70 ? "bg-amber-500" :
                          "bg-red-500"
                        )}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Safety Intelligence:</span>
          </div>
          <p className="text-sm text-amber-700">
            Consider heat safety toolbox talk - forecast shows 95F this week.
            Near-misses up 40% this month - common factor: afternoon timeframe. Consider fatigue management discussion.
            3 crew members on Smith job missing fall protection training - schedule before roofing phase.
          </p>
        </div>
      </div>
    </div>
  )
}
