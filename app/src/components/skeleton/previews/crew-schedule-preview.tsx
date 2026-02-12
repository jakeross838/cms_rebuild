'use client'

import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Calendar,
  List,
  Sparkles,
  AlertTriangle,
  User,
  Clock,
  Briefcase,
  TrendingUp,
  Plane,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Assignment {
  id: string
  jobName: string
  task: string
  color: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  avatar?: string
  assignments: { [day: number]: Assignment | null }
  utilization: number
  status: 'active' | 'pto' | 'conflict'
  conflictDay?: number
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Jake Ross',
    role: 'Project Manager',
    utilization: 100,
    status: 'active',
    assignments: {
      1: { id: '1', jobName: 'Smith', task: 'Site Visit', color: 'blue' },
      2: { id: '2', jobName: 'Smith', task: 'Client Mtg', color: 'blue' },
      3: { id: '3', jobName: 'Johnson', task: 'Site Visit', color: 'green' },
      4: { id: '4', jobName: 'Smith', task: 'Inspection', color: 'blue' },
      5: { id: '5', jobName: 'Office', task: 'Admin', color: 'gray' },
    }
  },
  {
    id: '2',
    name: 'Sarah Mitchell',
    role: 'Project Manager',
    utilization: 110,
    status: 'conflict',
    conflictDay: 2,
    assignments: {
      1: { id: '6', jobName: 'Smith', task: 'Budget', color: 'blue' },
      2: { id: '7', jobName: 'CONFLICT', task: '2 Jobs', color: 'red' },
      3: { id: '8', jobName: 'Smith', task: 'Punch List', color: 'blue' },
      4: { id: '9', jobName: 'Davis', task: 'Estimate', color: 'purple' },
      5: { id: '10', jobName: 'Smith', task: 'Closeout', color: 'blue' },
    }
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    role: 'Superintendent',
    utilization: 80,
    status: 'active',
    assignments: {
      1: { id: '11', jobName: 'Johnson', task: 'Framing', color: 'green' },
      2: { id: '12', jobName: 'Johnson', task: 'Framing', color: 'green' },
      3: { id: '13', jobName: 'Johnson', task: 'Framing', color: 'green' },
      4: { id: '14', jobName: 'Johnson', task: 'Framing', color: 'green' },
      5: null,
    }
  },
  {
    id: '4',
    name: 'Tom Williams',
    role: 'Foreman',
    utilization: 60,
    status: 'active',
    assignments: {
      1: { id: '15', jobName: 'Smith', task: 'Photos', color: 'blue' },
      2: { id: '16', jobName: 'Smith', task: 'Daily Log', color: 'blue' },
      3: null,
      4: { id: '17', jobName: 'Davis', task: 'Demo', color: 'purple' },
      5: { id: '18', jobName: 'Davis', task: 'Demo', color: 'purple' },
    }
  },
  {
    id: '5',
    name: 'Carlos Mendez',
    role: 'Foreman',
    utilization: 100,
    status: 'active',
    assignments: {
      1: { id: '19', jobName: 'Harbor View', task: 'Concrete', color: 'amber' },
      2: { id: '20', jobName: 'Harbor View', task: 'Concrete', color: 'amber' },
      3: { id: '21', jobName: 'Harbor View', task: 'Concrete', color: 'amber' },
      4: { id: '22', jobName: 'Johnson', task: 'Support', color: 'green' },
      5: { id: '23', jobName: 'Johnson', task: 'Support', color: 'green' },
    }
  },
  {
    id: '6',
    name: 'David Chen',
    role: 'Superintendent',
    utilization: 0,
    status: 'pto',
    assignments: {
      1: null,
      2: null,
      3: null,
      4: null,
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

function AssignmentCell({ assignment, isToday }: { assignment: Assignment | null, isToday: boolean }) {
  if (!assignment) {
    return (
      <div className={cn(
        "h-full min-h-[60px] flex items-center justify-center text-gray-400 text-xs border-r border-gray-100",
        isToday && "bg-blue-50/50"
      )}>
        <span className="text-gray-300">---</span>
      </div>
    )
  }

  return (
    <div className={cn(
      "h-full min-h-[60px] p-1 border-r border-gray-100",
      isToday && "bg-blue-50/50"
    )}>
      <div className={cn(
        "h-full p-2 rounded border text-xs",
        jobColors[assignment.color]
      )}>
        <div className="font-medium truncate">{assignment.jobName}</div>
        <div className="text-[10px] opacity-75 truncate">{assignment.task}</div>
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
            member.status === 'conflict' ? 'bg-red-400' : 'bg-blue-500'
          )}>
            {getInitials(member.name)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-sm text-gray-900">{member.name}</span>
              {member.status === 'pto' && (
                <Plane className="h-3 w-3 text-gray-400" />
              )}
              {member.status === 'conflict' && (
                <AlertTriangle className="h-3 w-3 text-red-500" />
              )}
            </div>
            <div className="text-xs text-gray-500">{member.role}</div>
          </div>
        </div>
      </td>
      {[1, 2, 3, 4, 5].map(day => (
        <td key={day} className="p-0">
          <AssignmentCell
            assignment={member.assignments[day]}
            isToday={day === 3}
          />
        </td>
      ))}
      <td className="py-2 px-3 text-center">
        <div className={cn(
          "text-sm font-medium",
          member.utilization > 100 ? "text-red-600" :
          member.utilization >= 80 ? "text-green-600" :
          member.utilization >= 50 ? "text-amber-600" : "text-gray-400"
        )}>
          {member.utilization}%
        </div>
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

  // Calculate stats
  const totalCrew = mockTeamMembers.length
  const activeCrew = mockTeamMembers.filter(m => m.status !== 'pto').length
  const avgUtilization = Math.round(
    mockTeamMembers.filter(m => m.status !== 'pto').reduce((sum, m) => sum + m.utilization, 0) / activeCrew
  )
  const conflicts = mockTeamMembers.filter(m => m.status === 'conflict').length
  const onPto = mockTeamMembers.filter(m => m.status === 'pto').length

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Crew Schedule</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                Week of February 10, 2026
              </span>
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
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Add Assignment
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <User className="h-4 w-4" />
              Total Crew
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{totalCrew}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Briefcase className="h-4 w-4" />
              Active
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{activeCrew}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <TrendingUp className="h-4 w-4" />
              Avg Utilization
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{avgUtilization}%</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            conflicts > 0 ? "bg-red-50" : "bg-gray-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              conflicts > 0 ? "text-red-600" : "text-gray-500"
            )}>
              <AlertTriangle className="h-4 w-4" />
              Conflicts
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              conflicts > 0 ? "text-red-700" : "text-gray-900"
            )}>
              {conflicts}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Plane className="h-4 w-4" />
              On PTO
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{onPto}</div>
          </div>
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
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200" />
            <span className="text-gray-600">Smith Residence</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-200" />
            <span className="text-gray-600">Johnson Beach</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-purple-100 border border-purple-200" />
            <span className="text-gray-600">Davis Addition</span>
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
              <th className="text-left py-2 px-3 font-medium text-gray-600 text-sm sticky left-0 bg-gray-100 z-10 w-48 border-r border-gray-200">
                Team Member
              </th>
              {weekDays.map((day, idx) => (
                <th
                  key={day}
                  className={cn(
                    "text-center py-2 px-3 font-medium text-sm min-w-[120px]",
                    idx === 2 ? "bg-blue-100 text-blue-700" : "text-gray-600"
                  )}
                >
                  <div>{day}</div>
                  <div className="text-xs font-normal">{weekDates[idx]}</div>
                </th>
              ))}
              <th className="text-center py-2 px-3 font-medium text-gray-600 text-sm w-20">Util</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {mockTeamMembers.map(member => (
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
            <span>80-100% Utilized</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>50-79% Utilized</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span>&lt;50% Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>&gt;100% Conflict</span>
          </div>
          <div className="flex items-center gap-1.5 ml-4">
            <Plane className="h-3.5 w-3.5 text-gray-400" />
            <span>PTO / Unavailable</span>
          </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Suggestions:</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-amber-700">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Sarah is double-booked Tuesday - reassign Smith punch list to Tom (has availability)
            </span>
            <span className="text-amber-400">|</span>
            <span>Tom at 60% - available for additional assignments Wed</span>
            <span className="text-amber-400">|</span>
            <span>David returns from PTO Monday - consider reassigning Harbor View support</span>
          </div>
        </div>
      </div>
    </div>
  )
}
