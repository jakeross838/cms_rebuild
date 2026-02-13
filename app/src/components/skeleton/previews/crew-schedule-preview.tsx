'use client'

import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  AlertTriangle,
  User,
  Clock,
  Briefcase,
  TrendingUp,
  Plane,
  MoreHorizontal,
  GripVertical,
  Shield,
  Building2,
  Wrench,
  CalendarDays,
  Cloud,
  CloudRain,
  Sun,
  Users,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch } from '@/hooks/use-filter-state'

interface Assignment {
  id: string
  jobName: string
  task: string
  color: string
  phase?: string
  isCriticalPath?: boolean
  hours?: number
}

interface Certification {
  name: string
  valid: boolean
}

interface TeamMember {
  id: string
  name: string
  role: 'Project Manager' | 'Superintendent' | 'Foreman' | 'Laborer'
  avatar?: string
  assignments: { [day: number]: Assignment | null }
  utilization: number
  status: 'active' | 'pto' | 'conflict' | 'light-duty'
  conflictDay?: number
  trade?: string
  certifications?: Certification[]
  weeklyHours?: number
  scheduledHours?: number
  overtimeHours?: number
  costRate?: number
}

interface WeatherDay {
  day: number
  condition: 'sunny' | 'cloudy' | 'rain'
  impactsOutdoor: boolean
}

const mockWeather: WeatherDay[] = [
  { day: 1, condition: 'sunny', impactsOutdoor: false },
  { day: 2, condition: 'cloudy', impactsOutdoor: false },
  { day: 3, condition: 'rain', impactsOutdoor: true },
  { day: 4, condition: 'sunny', impactsOutdoor: false },
  { day: 5, condition: 'sunny', impactsOutdoor: false },
]

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Jake Ross',
    role: 'Project Manager',
    trade: 'General',
    utilization: 100,
    status: 'active',
    weeklyHours: 40,
    scheduledHours: 40,
    overtimeHours: 0,
    costRate: 75,
    certifications: [
      { name: 'OSHA 30', valid: true },
      { name: 'PMP', valid: true },
    ],
    assignments: {
      1: { id: '1', jobName: 'Smith', task: 'Site Visit', color: 'blue', phase: 'Rough-In', hours: 8 },
      2: { id: '2', jobName: 'Smith', task: 'Client Mtg', color: 'blue', phase: 'Rough-In', hours: 8 },
      3: { id: '3', jobName: 'Johnson', task: 'Site Visit', color: 'green', phase: 'MEP', hours: 8 },
      4: { id: '4', jobName: 'Smith', task: 'Inspection', color: 'blue', phase: 'Rough-In', hours: 8 },
      5: { id: '5', jobName: 'Office', task: 'Admin', color: 'gray', hours: 8 },
    }
  },
  {
    id: '2',
    name: 'Sarah Mitchell',
    role: 'Project Manager',
    trade: 'General',
    utilization: 110,
    status: 'conflict',
    conflictDay: 2,
    weeklyHours: 40,
    scheduledHours: 44,
    overtimeHours: 4,
    costRate: 65,
    certifications: [
      { name: 'OSHA 10', valid: true },
    ],
    assignments: {
      1: { id: '6', jobName: 'Smith', task: 'Budget', color: 'blue', phase: 'Admin', hours: 8 },
      2: { id: '7', jobName: 'CONFLICT', task: '2 Jobs', color: 'red', hours: 12 },
      3: { id: '8', jobName: 'Smith', task: 'Punch List', color: 'blue', phase: 'QC', hours: 8 },
      4: { id: '9', jobName: 'Davis', task: 'Estimate', color: 'purple', phase: 'Pre-Con', hours: 8 },
      5: { id: '10', jobName: 'Smith', task: 'Closeout', color: 'blue', phase: 'Closeout', hours: 8 },
    }
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    role: 'Superintendent',
    trade: 'Carpentry',
    utilization: 80,
    status: 'active',
    weeklyHours: 40,
    scheduledHours: 32,
    overtimeHours: 0,
    costRate: 55,
    certifications: [
      { name: 'OSHA 30', valid: true },
      { name: 'First Aid', valid: true },
    ],
    assignments: {
      1: { id: '11', jobName: 'Johnson', task: 'Framing', color: 'green', phase: 'Framing', isCriticalPath: true, hours: 8 },
      2: { id: '12', jobName: 'Johnson', task: 'Framing', color: 'green', phase: 'Framing', isCriticalPath: true, hours: 8 },
      3: { id: '13', jobName: 'Johnson', task: 'Framing', color: 'green', phase: 'Framing', isCriticalPath: true, hours: 8 },
      4: { id: '14', jobName: 'Johnson', task: 'Framing', color: 'green', phase: 'Framing', isCriticalPath: true, hours: 8 },
      5: null,
    }
  },
  {
    id: '4',
    name: 'Tom Williams',
    role: 'Foreman',
    trade: 'General',
    utilization: 60,
    status: 'active',
    weeklyHours: 40,
    scheduledHours: 24,
    overtimeHours: 0,
    costRate: 45,
    certifications: [
      { name: 'OSHA 10', valid: true },
      { name: 'First Aid', valid: false },
    ],
    assignments: {
      1: { id: '15', jobName: 'Smith', task: 'Photos', color: 'blue', phase: 'QC', hours: 8 },
      2: { id: '16', jobName: 'Smith', task: 'Daily Log', color: 'blue', phase: 'Admin', hours: 8 },
      3: null,
      4: { id: '17', jobName: 'Davis', task: 'Demo', color: 'purple', phase: 'Demo', hours: 8 },
      5: { id: '18', jobName: 'Davis', task: 'Demo', color: 'purple', phase: 'Demo', hours: 8 },
    }
  },
  {
    id: '5',
    name: 'Carlos Mendez',
    role: 'Foreman',
    trade: 'Concrete',
    utilization: 100,
    status: 'active',
    weeklyHours: 40,
    scheduledHours: 40,
    overtimeHours: 0,
    costRate: 50,
    certifications: [
      { name: 'OSHA 10', valid: true },
      { name: 'ACI Cert', valid: true },
    ],
    assignments: {
      1: { id: '19', jobName: 'Harbor View', task: 'Concrete', color: 'amber', phase: 'Foundation', isCriticalPath: true, hours: 8 },
      2: { id: '20', jobName: 'Harbor View', task: 'Concrete', color: 'amber', phase: 'Foundation', isCriticalPath: true, hours: 8 },
      3: { id: '21', jobName: 'Harbor View', task: 'Concrete', color: 'amber', phase: 'Foundation', isCriticalPath: true, hours: 8 },
      4: { id: '22', jobName: 'Johnson', task: 'Support', color: 'green', hours: 8 },
      5: { id: '23', jobName: 'Johnson', task: 'Support', color: 'green', hours: 8 },
    }
  },
  {
    id: '6',
    name: 'David Chen',
    role: 'Superintendent',
    trade: 'Electrical',
    utilization: 0,
    status: 'pto',
    weeklyHours: 40,
    scheduledHours: 0,
    overtimeHours: 0,
    costRate: 55,
    certifications: [
      { name: 'OSHA 30', valid: true },
      { name: 'Journeyman Elec', valid: true },
    ],
    assignments: {
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
    }
  },
  {
    id: '7',
    name: 'Luis Fernandez',
    role: 'Laborer',
    trade: 'General',
    utilization: 40,
    status: 'light-duty',
    weeklyHours: 40,
    scheduledHours: 16,
    overtimeHours: 0,
    costRate: 28,
    certifications: [
      { name: 'OSHA 10', valid: true },
    ],
    assignments: {
      1: { id: '24', jobName: 'Smith', task: 'Cleanup', color: 'blue', hours: 8 },
      2: null,
      3: null,
      4: { id: '25', jobName: 'Smith', task: 'Cleanup', color: 'blue', hours: 8 },
      5: null,
    }
  },
]

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const weekDates = ['Feb 10', 'Feb 11', 'Feb 12', 'Feb 13', 'Feb 14']

const jobColors: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
  red: 'bg-red-100 text-red-700 border-red-200',
}

function WeatherIcon({ condition }: { condition: string }) {
  switch (condition) {
    case 'sunny': return <Sun className="h-3 w-3 text-amber-500" />
    case 'cloudy': return <Cloud className="h-3 w-3 text-gray-400" />
    case 'rain': return <CloudRain className="h-3 w-3 text-blue-500" />
    default: return <Sun className="h-3 w-3 text-amber-500" />
  }
}

function AssignmentCell({ assignment, isToday, weather }: { assignment: Assignment | null; isToday: boolean; weather?: WeatherDay }) {
  if (!assignment) {
    return (
      <div className={cn(
        "h-full min-h-[60px] flex items-center justify-center text-gray-400 text-xs border-r border-gray-100",
        isToday && "bg-blue-50/50",
        weather?.impactsOutdoor && "bg-red-50/30"
      )}>
        <span className="text-gray-300">---</span>
      </div>
    )
  }

  return (
    <div className={cn(
      "h-full min-h-[60px] p-1 border-r border-gray-100",
      isToday && "bg-blue-50/50",
      weather?.impactsOutdoor && "bg-red-50/30"
    )}>
      <div className={cn(
        "h-full p-2 rounded border text-xs cursor-grab active:cursor-grabbing",
        jobColors[assignment.color]
      )}>
        <div className="flex items-center gap-1">
          <GripVertical className="h-3 w-3 opacity-30" />
          <span className="font-medium truncate">{assignment.jobName}</span>
          {assignment.isCriticalPath && <Zap className="h-2.5 w-2.5 text-red-500 flex-shrink-0" />}
        </div>
        <div className="text-[10px] opacity-75 truncate">{assignment.task}</div>
        {assignment.phase && (
          <div className="text-[9px] opacity-50 truncate">{assignment.phase}</div>
        )}
        {assignment.hours && (
          <div className="text-[9px] opacity-50">{assignment.hours}h</div>
        )}
      </div>
    </div>
  )
}

function TeamMemberRow({ member }: { member: TeamMember }) {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('')

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50">
      <td className="py-2 px-3 sticky left-0 bg-white border-r border-gray-200 z-10">
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-medium",
            member.status === 'pto' ? 'bg-gray-300' :
            member.status === 'conflict' ? 'bg-red-400' :
            member.status === 'light-duty' ? 'bg-amber-400' : 'bg-blue-500'
          )}>
            {getInitials(member.name)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-sm text-gray-900 truncate">{member.name}</span>
              {member.status === 'pto' && (
                <Plane className="h-3 w-3 text-gray-400 flex-shrink-0" />
              )}
              {member.status === 'conflict' && (
                <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
              )}
              {member.status === 'light-duty' && (
                <Shield className="h-3 w-3 text-amber-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>{member.role}</span>
              {member.trade && <span className="text-gray-300">|</span>}
              {member.trade && <span>{member.trade}</span>}
            </div>
            {/* Certifications */}
            {member.certifications && (
              <div className="flex items-center gap-1 mt-0.5">
                {member.certifications.map(cert => (
                  <span
                    key={cert.name}
                    className={cn(
                      "text-[9px] px-1 rounded",
                      cert.valid ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600 line-through"
                    )}
                  >
                    {cert.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>
      {[1, 2, 3, 4, 5].map(day => (
        <td key={day} className="p-0">
          <AssignmentCell
            assignment={member.assignments[day]}
            isToday={day === 3}
            weather={mockWeather.find(w => w.day === day)}
          />
        </td>
      ))}
      <td className="py-2 px-2 text-center">
        <div className="text-xs text-gray-500">
          {member.scheduledHours || 0}/{member.weeklyHours || 40}
        </div>
        {(member.overtimeHours || 0) > 0 && (
          <div className="text-[10px] text-red-500 font-medium">+{member.overtimeHours}h OT</div>
        )}
      </td>
      <td className="py-2 px-2 text-center">
        <div className={cn(
          "text-sm font-medium",
          member.utilization > 100 ? "text-red-600" :
          member.utilization >= 80 ? "text-green-600" :
          member.utilization >= 50 ? "text-amber-600" : "text-gray-400"
        )}>
          {member.utilization}%
        </div>
      </td>
      <td className="py-2 px-2 text-center text-xs text-gray-500">
        ${((member.costRate || 0) * (member.scheduledHours || 0)).toLocaleString()}
      </td>
      <td className="py-2 px-3">
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </td>
    </tr>
  )
}

export function CrewSchedulePreview() {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')

  const { search, setSearch, activeTab, setActiveTab } = useFilterState({ defaultTab: 'all' })

  // Filter members
  const filteredMembers = mockTeamMembers.filter(member => {
    if (activeTab === 'active' && (member.status === 'pto')) return false
    if (activeTab === 'conflicts' && member.status !== 'conflict') return false
    if (activeTab === 'available' && member.utilization >= 80) return false
    if (activeTab === 'supers' && member.role !== 'Superintendent') return false
    if (search && !matchesSearch(member, search, ['name', 'role', 'trade'])) return false
    return true
  })

  // Calculate stats
  const totalCrew = mockTeamMembers.length
  const activeCrew = mockTeamMembers.filter(m => m.status !== 'pto').length
  const avgUtilization = Math.round(
    mockTeamMembers.filter(m => m.status !== 'pto').reduce((sum, m) => sum + m.utilization, 0) / activeCrew
  )
  const conflicts = mockTeamMembers.filter(m => m.status === 'conflict').length
  const onPto = mockTeamMembers.filter(m => m.status === 'pto').length
  const totalScheduledHours = mockTeamMembers.reduce((sum, m) => sum + (m.scheduledHours || 0), 0)
  const totalOvertimeHours = mockTeamMembers.reduce((sum, m) => sum + (m.overtimeHours || 0), 0)
  const totalLaborCost = mockTeamMembers.reduce((sum, m) => sum + ((m.costRate || 0) * (m.scheduledHours || 0)), 0)
  const availableCapacity = mockTeamMembers.filter(m => m.status !== 'pto' && m.utilization < 80).length
  const criticalPathAssignments = mockTeamMembers.reduce((count, m) => {
    return count + Object.values(m.assignments).filter(a => a?.isCriticalPath).length
  }, 0)

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Crew Schedule</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                Week of February 10, 2026
              </span>
              {conflicts > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />{conflicts} conflict{conflicts > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              Resource allocation across all active projects
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('week')}
                className={cn(
                  "px-3 py-1.5 text-sm",
                  viewMode === 'week' ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={cn(
                  "px-3 py-1.5 text-sm",
                  viewMode === 'month' ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                Month
              </button>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Add Assignment
            </button>
          </div>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search crew, role, trade..."
          tabs={[
            { key: 'all', label: 'All Crew', count: mockTeamMembers.length },
            { key: 'active', label: 'Active', count: activeCrew },
            { key: 'conflicts', label: 'Conflicts', count: conflicts },
            { key: 'available', label: 'Available', count: availableCapacity },
            { key: 'supers', label: 'Supers Only', count: mockTeamMembers.filter(m => m.role === 'Superintendent').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          resultCount={filteredMembers.length}
          totalCount={mockTeamMembers.length}
        />
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-8 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Users className="h-3.5 w-3.5" />
              Crew
            </div>
            <div className="text-lg font-bold text-gray-900 mt-1">{totalCrew}</div>
            <div className="text-[10px] text-gray-400">{activeCrew} active</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <TrendingUp className="h-3.5 w-3.5" />
              Avg Util
            </div>
            <div className={cn("text-lg font-bold mt-1", avgUtilization >= 80 ? "text-green-600" : "text-amber-600")}>{avgUtilization}%</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Clock className="h-3.5 w-3.5" />
              Scheduled
            </div>
            <div className="text-lg font-bold text-gray-900 mt-1">{totalScheduledHours}h</div>
          </div>
          <div className={cn("rounded-lg p-3", totalOvertimeHours > 0 ? "bg-red-50" : "bg-gray-50")}>
            <div className={cn("flex items-center gap-2 text-xs", totalOvertimeHours > 0 ? "text-red-600" : "text-gray-500")}>
              <Zap className="h-3.5 w-3.5" />
              Overtime
            </div>
            <div className={cn("text-lg font-bold mt-1", totalOvertimeHours > 0 ? "text-red-600" : "text-gray-900")}>{totalOvertimeHours}h</div>
          </div>
          <div className={cn("rounded-lg p-3", conflicts > 0 ? "bg-red-50" : "bg-gray-50")}>
            <div className={cn("flex items-center gap-2 text-xs", conflicts > 0 ? "text-red-600" : "text-gray-500")}>
              <AlertTriangle className="h-3.5 w-3.5" />
              Conflicts
            </div>
            <div className={cn("text-lg font-bold mt-1", conflicts > 0 ? "text-red-700" : "text-gray-900")}>{conflicts}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Plane className="h-3.5 w-3.5" />
              PTO
            </div>
            <div className="text-lg font-bold text-gray-900 mt-1">{onPto}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Briefcase className="h-3.5 w-3.5" />
              Available
            </div>
            <div className="text-lg font-bold text-green-600 mt-1">{availableCapacity}</div>
            <div className="text-[10px] text-gray-400">below 80%</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Building2 className="h-3.5 w-3.5" />
              Labor Cost
            </div>
            <div className="text-lg font-bold text-gray-900 mt-1">${(totalLaborCost / 1000).toFixed(1)}K</div>
          </div>
        </div>
      </div>

      {/* Cross-module badges */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-gray-500 font-medium">Active Projects:</span>
          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Smith Residence - Rough-In</span>
          <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded">Johnson Beach - Framing</span>
          <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded">Davis Addition - Pre-Con</span>
          <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded">Harbor View - Foundation</span>
          <span className="ml-auto text-gray-400">Critical path tasks: {criticalPathAssignments}</span>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
          <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg font-medium">
            Today
          </button>
          <span className="text-gray-300 ml-2">|</span>
          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            2-Week Look-Ahead
          </button>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200" />
            <span className="text-gray-600">Smith</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-200" />
            <span className="text-gray-600">Johnson</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-purple-100 border border-purple-200" />
            <span className="text-gray-600">Davis</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-100 border border-amber-200" />
            <span className="text-gray-600">Harbor View</span>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-3 font-medium text-gray-600 text-sm sticky left-0 bg-gray-100 z-10 w-56 border-r border-gray-200">
                Team Member
              </th>
              {weekDays.map((day, idx) => {
                const weather = mockWeather[idx]
                return (
                  <th
                    key={day}
                    className={cn(
                      "text-center py-2 px-3 font-medium text-sm min-w-[120px]",
                      idx === 2 ? "bg-blue-100 text-blue-700" : "text-gray-600",
                      weather?.impactsOutdoor && "bg-red-50"
                    )}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>{day}</span>
                      {weather && <WeatherIcon condition={weather.condition} />}
                    </div>
                    <div className="text-xs font-normal">{weekDates[idx]}</div>
                  </th>
                )
              })}
              <th className="text-center py-2 px-2 font-medium text-gray-600 text-xs w-16">Hours</th>
              <th className="text-center py-2 px-2 font-medium text-gray-600 text-xs w-14">Util</th>
              <th className="text-center py-2 px-2 font-medium text-gray-600 text-xs w-16">Cost</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {filteredMembers.map(member => (
              <TeamMemberRow key={member.id} member={member} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>80-100%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>50-79%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span>&lt;50%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>&gt;100% Conflict</span>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <Plane className="h-3.5 w-3.5 text-gray-400" />
            <span>PTO</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-amber-500" />
            <span>Light Duty</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-red-500" />
            <span>Critical Path</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GripVertical className="h-3.5 w-3.5 text-gray-300" />
            <span>Drag to reassign</span>
          </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Resource Intelligence:</span>
          </div>
          <div className="text-sm text-amber-700 space-y-1">
            <p>
              <span className="font-medium">Conflict Resolution:</span> Sarah double-booked Tuesday (Smith budget + Harbor View walkthrough). Recommend: reassign Smith budget review to Tom (60% utilized, has Smith access). Saves $20/hr on rate differential.
            </p>
            <p>
              <span className="font-medium">Weather Impact:</span> Rain forecasted Wednesday — Carlos&apos;s Harbor View concrete may be blocked. Interior fallback: redirect to Johnson support if pour postponed.
            </p>
            <p>
              <span className="font-medium">Capacity Planning:</span> David returns from PTO Monday Feb 17. Next week: 3 jobs need superintendent coverage — assign David to Harbor View electrical (his specialty). Tom has 16h available this week — recommend additional assignments.
            </p>
            <p>
              <span className="font-medium">Certification Alert:</span> Tom Williams First Aid cert expired. Required for foreman role on active job sites. Renewal class available Feb 20.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
