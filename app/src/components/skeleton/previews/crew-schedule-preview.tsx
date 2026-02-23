'use client'

import { useState } from 'react'

import {
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertTriangle,
  Clock,
  Briefcase,
  TrendingUp,
  Plane,
  MoreHorizontal,
  GripVertical,
  Shield,
  Building2,
  CalendarDays,
  Cloud,
  CloudRain,
  Sun,
  Users,
  Zap,
  Calendar,
  Truck,
  ClipboardCheck,
  CheckSquare,
  AlertCircle,
  Move,
} from 'lucide-react'

import { FilterBar } from '@/components/skeleton/filter-bar'
import { AIFeaturesPanel, AIFeatureCard } from '@/components/skeleton/ui'
import { useFilterState, matchesSearch } from '@/hooks/use-filter-state'
import { cn } from '@/lib/utils'

interface Assignment {
  id: string
  jobName: string
  task: string
  color: string
  phase?: string
  isCriticalPath?: boolean
  hours?: number
  startTime?: string
  endTime?: string
  requiresCert?: string
}

interface Certification {
  name: string
  valid: boolean
  expiryDate?: string
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
  actualHours?: number
  overtimeHours?: number
  costRate?: number
}

interface WeatherDay {
  day: number
  condition: 'sunny' | 'cloudy' | 'rain'
  impactsOutdoor: boolean
}

interface TwoWeekItem {
  type: 'task' | 'delivery' | 'inspection' | 'confirmation'
  title: string
  date: string
  assignee?: string
  job?: string
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
    actualHours: 38,
    overtimeHours: 0,
    costRate: 75,
    certifications: [
      { name: 'OSHA 30', valid: true, expiryDate: '2027-05-15' },
      { name: 'PMP', valid: true, expiryDate: '2026-12-01' },
    ],
    assignments: {
      1: { id: '1', jobName: 'Smith', task: 'Site Visit', color: 'blue', phase: 'Rough-In', hours: 8, startTime: '8:00 AM', endTime: '4:30 PM' },
      2: { id: '2', jobName: 'Smith', task: 'Client Mtg', color: 'blue', phase: 'Rough-In', hours: 8, startTime: '9:00 AM', endTime: '5:30 PM' },
      3: { id: '3', jobName: 'Johnson', task: 'Site Visit', color: 'green', phase: 'MEP', hours: 8, startTime: '7:00 AM', endTime: '3:30 PM' },
      4: { id: '4', jobName: 'Smith', task: 'Inspection', color: 'blue', phase: 'Rough-In', hours: 8, startTime: '8:00 AM', endTime: '4:30 PM' },
      5: { id: '5', jobName: 'Office', task: 'Admin', color: 'gray', hours: 8, startTime: '8:00 AM', endTime: '4:30 PM' },
    }
  },
  {
    id: '2',
    name: 'Sarah Mitchell',
    role: 'Project Manager',
    trade: 'General',
    utilization: 110,
    status: 'conflict',
    conflictDay: 3,
    weeklyHours: 40,
    scheduledHours: 44,
    actualHours: 46,
    overtimeHours: 4,
    costRate: 65,
    certifications: [
      { name: 'OSHA 10', valid: true, expiryDate: '2026-08-20' },
    ],
    assignments: {
      1: { id: '6', jobName: 'Smith', task: 'Budget', color: 'blue', phase: 'Admin', hours: 8, startTime: '8:00 AM', endTime: '4:30 PM' },
      2: { id: '7', jobName: 'Harbor View', task: 'Walkthrough', color: 'amber', hours: 8, startTime: '8:00 AM', endTime: '4:30 PM' },
      3: { id: '8', jobName: 'CONFLICT', task: 'Smith + Harbor View', color: 'red', hours: 12, startTime: '7:00 AM', endTime: '7:00 PM' },
      4: { id: '9', jobName: 'Davis', task: 'Estimate', color: 'purple', phase: 'Pre-Con', hours: 8, startTime: '8:00 AM', endTime: '4:30 PM' },
      5: { id: '10', jobName: 'Smith', task: 'Closeout', color: 'blue', phase: 'Closeout', hours: 8, startTime: '8:00 AM', endTime: '4:30 PM' },
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
    actualHours: 34,
    overtimeHours: 0,
    costRate: 55,
    certifications: [
      { name: 'OSHA 30', valid: true, expiryDate: '2027-03-10' },
      { name: 'First Aid', valid: true, expiryDate: '2026-09-15' },
    ],
    assignments: {
      1: { id: '11', jobName: 'Johnson', task: 'Framing', color: 'green', phase: 'Framing', isCriticalPath: true, hours: 8, startTime: '6:00 AM', endTime: '2:30 PM' },
      2: { id: '12', jobName: 'Johnson', task: 'Framing', color: 'green', phase: 'Framing', isCriticalPath: true, hours: 8, startTime: '6:00 AM', endTime: '2:30 PM' },
      3: { id: '13', jobName: 'Johnson', task: 'Framing', color: 'green', phase: 'Framing', isCriticalPath: true, hours: 8, startTime: '6:00 AM', endTime: '2:30 PM' },
      4: { id: '14', jobName: 'Johnson', task: 'Framing', color: 'green', phase: 'Framing', isCriticalPath: true, hours: 8, startTime: '6:00 AM', endTime: '2:30 PM' },
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
    actualHours: 22,
    overtimeHours: 0,
    costRate: 45,
    certifications: [
      { name: 'OSHA 10', valid: true, expiryDate: '2026-11-30' },
      { name: 'First Aid', valid: false, expiryDate: '2026-01-15' },
    ],
    assignments: {
      1: { id: '15', jobName: 'Smith', task: 'Photos', color: 'blue', phase: 'QC', hours: 8, startTime: '8:00 AM', endTime: '4:30 PM', requiresCert: 'First Aid' },
      2: { id: '16', jobName: 'Smith', task: 'Daily Log', color: 'blue', phase: 'Admin', hours: 8, startTime: '8:00 AM', endTime: '4:30 PM' },
      3: null,
      4: { id: '17', jobName: 'Davis', task: 'Demo', color: 'purple', phase: 'Demo', hours: 8, startTime: '7:00 AM', endTime: '3:30 PM', requiresCert: 'First Aid' },
      5: { id: '18', jobName: 'Davis', task: 'Demo', color: 'purple', phase: 'Demo', hours: 8, startTime: '7:00 AM', endTime: '3:30 PM' },
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
    actualHours: 42,
    overtimeHours: 2,
    costRate: 50,
    certifications: [
      { name: 'OSHA 10', valid: true, expiryDate: '2026-07-22' },
      { name: 'ACI Cert', valid: true, expiryDate: '2027-01-05' },
    ],
    assignments: {
      1: { id: '19', jobName: 'Harbor View', task: 'Concrete', color: 'amber', phase: 'Foundation', isCriticalPath: true, hours: 8, startTime: '5:30 AM', endTime: '2:00 PM' },
      2: { id: '20', jobName: 'Harbor View', task: 'Concrete', color: 'amber', phase: 'Foundation', isCriticalPath: true, hours: 8, startTime: '5:30 AM', endTime: '2:00 PM' },
      3: { id: '21', jobName: 'Harbor View', task: 'Concrete', color: 'amber', phase: 'Foundation', isCriticalPath: true, hours: 8, startTime: '5:30 AM', endTime: '2:00 PM' },
      4: { id: '22', jobName: 'Johnson', task: 'Support', color: 'green', hours: 8, startTime: '6:00 AM', endTime: '2:30 PM' },
      5: { id: '23', jobName: 'Johnson', task: 'Support', color: 'green', hours: 8, startTime: '6:00 AM', endTime: '2:30 PM' },
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
    actualHours: 0,
    overtimeHours: 0,
    costRate: 55,
    certifications: [
      { name: 'OSHA 30', valid: true, expiryDate: '2027-02-28' },
      { name: 'Journeyman Elec', valid: true, expiryDate: '2028-06-15' },
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
    actualHours: 16,
    overtimeHours: 0,
    costRate: 28,
    certifications: [
      { name: 'OSHA 10', valid: true, expiryDate: '2026-10-10' },
    ],
    assignments: {
      1: { id: '24', jobName: 'Smith', task: 'Cleanup', color: 'blue', hours: 8, startTime: '9:00 AM', endTime: '5:30 PM' },
      2: null,
      3: null,
      4: { id: '25', jobName: 'Smith', task: 'Cleanup', color: 'blue', hours: 8, startTime: '9:00 AM', endTime: '5:30 PM' },
      5: null,
    }
  },
]

// Two-week look-ahead mock data
const mockTwoWeekItems: TwoWeekItem[] = [
  // This week
  { type: 'task', title: 'Complete Smith rough-in', date: 'Feb 12', assignee: 'Jake Ross', job: 'Smith Residence' },
  { type: 'delivery', title: 'HVAC equipment delivery', date: 'Feb 13', job: 'Johnson Beach' },
  { type: 'inspection', title: 'Electrical rough-in inspection', date: 'Feb 14', job: 'Smith Residence' },
  { type: 'confirmation', title: 'Confirm Harbor View pour date', date: 'Feb 14', assignee: 'Carlos Mendez' },
  // Next week
  { type: 'task', title: 'Start Johnson MEP', date: 'Feb 17', assignee: 'Mike Rodriguez', job: 'Johnson Beach' },
  { type: 'task', title: 'Davis demolition phase', date: 'Feb 18', assignee: 'Tom Williams', job: 'Davis Addition' },
  { type: 'delivery', title: 'Windows delivery', date: 'Feb 18', job: 'Smith Residence' },
  { type: 'delivery', title: 'Concrete materials', date: 'Feb 19', job: 'Harbor View' },
  { type: 'inspection', title: 'Foundation inspection', date: 'Feb 20', job: 'Harbor View' },
  { type: 'inspection', title: 'Framing inspection', date: 'Feb 21', job: 'Johnson Beach' },
  { type: 'confirmation', title: 'Client walkthrough confirmation', date: 'Feb 21', assignee: 'Sarah Mitchell', job: 'Smith Residence' },
]

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const weekDates = ['Feb 10', 'Feb 11', 'Feb 12', 'Feb 13', 'Feb 14']

// Month view data
const monthWeeks = [
  { weekNum: 7, dates: ['Feb 10', 'Feb 11', 'Feb 12', 'Feb 13', 'Feb 14'] },
  { weekNum: 8, dates: ['Feb 17', 'Feb 18', 'Feb 19', 'Feb 20', 'Feb 21'] },
  { weekNum: 9, dates: ['Feb 24', 'Feb 25', 'Feb 26', 'Feb 27', 'Feb 28'] },
  { weekNum: 10, dates: ['Mar 3', 'Mar 4', 'Mar 5', 'Mar 6', 'Mar 7'] },
]

const jobColors: Record<string, string> = {
  blue: 'bg-stone-100 text-stone-700 border-stone-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  purple: 'bg-warm-100 text-warm-700 border-warm-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  gray: 'bg-warm-100 text-warm-600 border-warm-200',
  red: 'bg-red-100 text-red-700 border-red-200',
}

function WeatherIcon({ condition }: { condition: string }) {
  switch (condition) {
    case 'sunny': return <Sun className="h-3 w-3 text-amber-500" />
    case 'cloudy': return <Cloud className="h-3 w-3 text-warm-400" />
    case 'rain': return <CloudRain className="h-3 w-3 text-stone-500" />
    default: return <Sun className="h-3 w-3 text-amber-500" />
  }
}

function AssignmentCell({
  assignment,
  isToday,
  weather,
  hasExpiredCert,
  isDragOver,
}: {
  assignment: Assignment | null
  isToday: boolean
  weather?: WeatherDay
  hasExpiredCert?: boolean
  isDragOver?: boolean
}) {
  const isBlocked = hasExpiredCert && assignment?.requiresCert

  if (!assignment) {
    return (
      <div className={cn(
        "h-full min-h-[60px] flex items-center justify-center text-warm-400 text-xs border-r border-warm-100 transition-colors",
        isToday && "bg-stone-50/50",
        weather?.impactsOutdoor && "bg-red-50/30",
        isDragOver && "bg-stone-100 border-2 border-dashed border-stone-400"
      )}>
        <span className="text-warm-300">---</span>
      </div>
    )
  }

  return (
    <div className={cn(
      "h-full min-h-[60px] p-1 border-r border-warm-100 transition-colors",
      isToday && "bg-stone-50/50",
      weather?.impactsOutdoor && "bg-red-50/30",
      isDragOver && "bg-stone-100 border-2 border-dashed border-stone-400"
    )}>
      <div
        className={cn(
          "h-full p-2 rounded border text-xs cursor-grab active:cursor-grabbing group relative",
          jobColors[assignment.color],
          isBlocked && "opacity-60 border-red-400 border-2"
        )}
        title={assignment.startTime && assignment.endTime ? `${assignment.startTime} - ${assignment.endTime}` : undefined}
      >
        {/* Drag handle */}
        <div className="absolute left-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-3 w-3 text-warm-400" />
        </div>
        <div className="flex items-center gap-1 pl-2">
          <span className="font-medium truncate">{assignment.jobName}</span>
          {assignment.isCriticalPath ? <Zap className="h-2.5 w-2.5 text-red-500 flex-shrink-0" /> : null}
          {isBlocked ? <AlertCircle className="h-2.5 w-2.5 text-red-500 flex-shrink-0" /> : null}
        </div>
        <div className="text-[10px] opacity-75 truncate pl-2">{assignment.task}</div>
        {assignment.phase ? <div className="text-[9px] opacity-50 truncate pl-2">{assignment.phase}</div> : null}
        <div className="flex items-center gap-1 pl-2">
          {assignment.hours ? <span className="text-[9px] opacity-50">{assignment.hours}h</span> : null}
          {assignment.startTime && assignment.endTime ? <span className="text-[9px] opacity-40 ml-1">{assignment.startTime}</span> : null}
        </div>
      </div>
    </div>
  )
}

function TeamMemberRow({ member, showTwoWeek }: { member: TeamMember; showTwoWeek?: boolean }) {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('')

  // Check for expired certifications
  const hasExpiredCert = member.certifications?.some(cert => !cert.valid)
  const expiredCerts = member.certifications?.filter(cert => !cert.valid) || []

  // Calculate hours variance
  const scheduledHours = member.scheduledHours || 0
  const actualHours = member.actualHours || 0
  const hoursVariance = actualHours - scheduledHours

  // Overtime color coding
  const getOvertimeColor = (ot: number) => {
    if (ot === 0) return 'text-warm-400'
    if (ot <= 4) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <>
      {/* Expired cert alert row */}
      {hasExpiredCert ? <tr className="bg-red-50 border-b border-red-100">
          <td colSpan={showTwoWeek ? 10 : 9} className="py-1.5 px-3">
            <div className="flex items-center gap-2 text-red-700 text-xs">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="font-medium">{member.name}:</span>
              {expiredCerts.map(cert => (
                <span key={cert.name}>
                  {cert.name} expired {cert.expiryDate ? `(${cert.expiryDate})` : ''} - review assignments
                </span>
              ))}
            </div>
          </td>
        </tr> : null}
      <tr className={cn(
        "border-b border-warm-100 hover:bg-warm-50/50",
        hasExpiredCert && "bg-red-50/30"
      )}>
        <td className="py-2 px-3 sticky left-0 bg-white border-r border-warm-200 z-10">
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-medium",
              member.status === 'pto' ? 'bg-warm-300' :
              member.status === 'conflict' ? 'bg-red-400' :
              member.status === 'light-duty' ? 'bg-amber-400' : 'bg-stone-500'
            )}>
              {getInitials(member.name)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-sm text-warm-900 truncate">{member.name}</span>
                {member.status === 'pto' && (
                  <Plane className="h-3 w-3 text-warm-400 flex-shrink-0" />
                )}
                {member.status === 'conflict' && (
                  <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                )}
                {member.status === 'light-duty' && (
                  <Shield className="h-3 w-3 text-amber-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-warm-500">
                <span>{member.role}</span>
                {member.trade ? <span className="text-warm-300">|</span> : null}
                {member.trade ? <span>{member.trade}</span> : null}
              </div>
              {/* Certifications */}
              {member.certifications ? <div className="flex items-center gap-1 mt-0.5">
                  {member.certifications.map(cert => (
                    <span
                      key={cert.name}
                      className={cn(
                        "text-[9px] px-1 rounded",
                        cert.valid ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600 font-medium"
                      )}
                    >
                      {cert.valid ? cert.name : `${cert.name} EXPIRED`}
                    </span>
                  ))}
                </div> : null}
            </div>
          </div>
        </td>
        {[1, 2, 3, 4, 5].map(day => (
          <td key={day} className="p-0">
            <AssignmentCell
              assignment={member.assignments[day]}
              isToday={day === 3}
              weather={mockWeather.find(w => w.day === day)}
              hasExpiredCert={hasExpiredCert}
            />
          </td>
        ))}
        <td className="py-2 px-2 text-center">
          <div className="text-xs text-warm-500">
            {scheduledHours}/{member.weeklyHours || 40}
          </div>
          <div className={cn(
            "text-[10px]",
            hoursVariance > 0 ? "text-red-500" : hoursVariance < 0 ? "text-green-500" : "text-warm-400"
          )}>
            Actual: {actualHours}h
          </div>
        </td>
        {/* Overtime column */}
        <td className="py-2 px-2 text-center">
          <div className={cn(
            "text-sm font-medium",
            getOvertimeColor(member.overtimeHours || 0)
          )}>
            {member.overtimeHours || 0}h
          </div>
        </td>
        <td className="py-2 px-2 text-center">
          <div className={cn(
            "text-sm font-medium",
            member.utilization > 100 ? "text-red-600" :
            member.utilization >= 80 ? "text-green-600" :
            member.utilization >= 50 ? "text-amber-600" : "text-warm-400"
          )}>
            {member.utilization}%
          </div>
        </td>
        <td className="py-2 px-2 text-center text-xs text-warm-500">
          ${((member.costRate || 0) * (member.scheduledHours || 0)).toLocaleString()}
        </td>
        <td className="py-2 px-3">
          <button className="p-1 hover:bg-warm-100 rounded">
            <MoreHorizontal className="h-4 w-4 text-warm-400" />
          </button>
        </td>
      </tr>
    </>
  )
}

// Monthly view calendar component
function MonthlyCalendarView({ members }: { members: TeamMember[] }) {
  // Calculate daily assignment counts per person for month view
  const getDailyCount = (memberId: string, weekNum: number, dayIndex: number) => {
    const member = members.find(m => m.id === memberId)
    if (!member) return 0
    // For demo, use week 1 data and vary slightly
    const assignment = member.assignments[dayIndex + 1]
    return assignment ? 1 : 0
  }

  // Calculate weekly utilization color
  const getWeekUtilColor = (util: number) => {
    if (util >= 90) return 'bg-green-100 text-green-700'
    if (util >= 70) return 'bg-amber-100 text-amber-700'
    if (util >= 50) return 'bg-amber-100 text-amber-700'
    return 'bg-warm-100 text-warm-500'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-warm-100 border-b border-warm-200">
          <tr>
            <th className="text-left py-2 px-3 font-medium text-warm-600 text-sm sticky left-0 bg-warm-100 z-10 w-48">
              Team Member
            </th>
            {monthWeeks.map(week => (
              <th key={week.weekNum} colSpan={5} className="text-center py-2 px-1 font-medium text-warm-600 text-xs border-l border-warm-200">
                <div>Week {week.weekNum}</div>
                <div className="text-[10px] text-warm-400 font-normal">{week.dates[0]} - {week.dates[4]}</div>
              </th>
            ))}
            <th className="text-center py-2 px-2 font-medium text-warm-600 text-xs w-16">Total</th>
          </tr>
          <tr className="bg-warm-50">
            <th className="sticky left-0 bg-warm-50 z-10" />
            {monthWeeks.map(week => (
              weekDays.map((day, idx) => (
                <th key={`${week.weekNum}-${day}`} className="text-center py-1 px-1 text-[10px] text-warm-400 font-normal">
                  {day}
                </th>
              ))
            ))}
            <th />
          </tr>
        </thead>
        <tbody className="bg-white">
          {members.map(member => {
            // Calculate weekly totals for this member
            const weeklyTotals = monthWeeks.map((week, weekIdx) => {
              let total = 0
              for (let d = 0; d < 5; d++) {
                total += getDailyCount(member.id, week.weekNum, d)
              }
              // Simulate varying utilization
              return Math.round(member.utilization * (0.8 + Math.random() * 0.4))
            })
            const monthTotal = weeklyTotals.reduce((sum, w) => sum + w, 0)

            return (
              <tr key={member.id} className="border-b border-warm-100 hover:bg-warm-50/50">
                <td className="py-2 px-3 sticky left-0 bg-white border-r border-warm-200 z-10">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-medium",
                      member.status === 'pto' ? 'bg-warm-300' : 'bg-stone-500'
                    )}>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-xs font-medium truncate">{member.name}</span>
                  </div>
                </td>
                {monthWeeks.map((week, weekIdx) => (
                  weekDays.map((_, dayIdx) => {
                    const count = getDailyCount(member.id, week.weekNum, dayIdx)
                    return (
                      <td key={`${week.weekNum}-${dayIdx}`} className="p-0.5 text-center border-l border-warm-50">
                        <div className={cn(
                          "w-6 h-6 mx-auto rounded text-[10px] flex items-center justify-center",
                          count > 0 ? 'bg-stone-100 text-stone-700' : 'text-warm-300'
                        )}>
                          {count > 0 ? count : '-'}
                        </div>
                      </td>
                    )
                  })
                ))}
                <td className="py-2 px-2 text-center">
                  <div className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded",
                    getWeekUtilColor(member.utilization)
                  )}>
                    {member.utilization}%
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Two-week look-ahead component
function TwoWeekLookAhead({ items }: { items: TwoWeekItem[] }) {
  const thisWeekItems = items.filter(i => parseInt(i.date.split(' ')[1]) <= 14)
  const nextWeekItems = items.filter(i => parseInt(i.date.split(' ')[1]) > 14)

  const getTypeIcon = (type: TwoWeekItem['type']) => {
    switch (type) {
      case 'task': return <Calendar className="h-3.5 w-3.5 text-stone-500" />
      case 'delivery': return <Truck className="h-3.5 w-3.5 text-stone-600" />
      case 'inspection': return <ClipboardCheck className="h-3.5 w-3.5 text-amber-500" />
      case 'confirmation': return <CheckSquare className="h-3.5 w-3.5 text-green-500" />
    }
  }

  const getTypeBg = (type: TwoWeekItem['type']) => {
    switch (type) {
      case 'task': return 'bg-stone-50 border-stone-200'
      case 'delivery': return 'bg-warm-50 border-warm-200'
      case 'inspection': return 'bg-amber-50 border-amber-200'
      case 'confirmation': return 'bg-green-50 border-green-200'
    }
  }

  const getCounts = (items: TwoWeekItem[]) => ({
    tasks: items.filter(i => i.type === 'task').length,
    deliveries: items.filter(i => i.type === 'delivery').length,
    inspections: items.filter(i => i.type === 'inspection').length,
    confirmations: items.filter(i => i.type === 'confirmation').length,
  })

  const thisWeekCounts = getCounts(thisWeekItems)
  const nextWeekCounts = getCounts(nextWeekItems)

  return (
    <div className="p-4 space-y-4">
      {/* Summary counts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-warm-50 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-warm-700 mb-2">This Week (Feb 10-14)</h4>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-center">
              <div className="text-lg font-bold text-stone-600">{thisWeekCounts.tasks}</div>
              <div className="text-warm-500">Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-stone-600">{thisWeekCounts.deliveries}</div>
              <div className="text-warm-500">Deliveries</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-600">{thisWeekCounts.inspections}</div>
              <div className="text-warm-500">Inspections</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{thisWeekCounts.confirmations}</div>
              <div className="text-warm-500">Confirm</div>
            </div>
          </div>
        </div>
        <div className="bg-warm-50 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-warm-700 mb-2">Next Week (Feb 17-21)</h4>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-center">
              <div className="text-lg font-bold text-stone-600">{nextWeekCounts.tasks}</div>
              <div className="text-warm-500">Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-stone-600">{nextWeekCounts.deliveries}</div>
              <div className="text-warm-500">Deliveries</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-600">{nextWeekCounts.inspections}</div>
              <div className="text-warm-500">Inspections</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{nextWeekCounts.confirmations}</div>
              <div className="text-warm-500">Confirm</div>
            </div>
          </div>
        </div>
      </div>

      {/* This Week details */}
      <div>
        <h4 className="text-sm font-semibold text-warm-700 mb-2 flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          This Week
        </h4>
        <div className="space-y-2">
          {thisWeekItems.map((item, idx) => (
            <div key={idx} className={cn("p-2 rounded border text-sm flex items-center gap-3", getTypeBg(item.type))}>
              {getTypeIcon(item.type)}
              <span className="font-medium text-warm-700 w-16">{item.date}</span>
              <span className="flex-1">{item.title}</span>
              {item.job ? <span className="text-xs text-warm-500">{item.job}</span> : null}
              {item.assignee ? <span className="text-xs bg-white px-2 py-0.5 rounded">{item.assignee}</span> : null}
            </div>
          ))}
        </div>
      </div>

      {/* Next Week details */}
      <div>
        <h4 className="text-sm font-semibold text-warm-700 mb-2 flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Next Week
        </h4>
        <div className="space-y-2">
          {nextWeekItems.map((item, idx) => (
            <div key={idx} className={cn("p-2 rounded border text-sm flex items-center gap-3", getTypeBg(item.type))}>
              {getTypeIcon(item.type)}
              <span className="font-medium text-warm-700 w-16">{item.date}</span>
              <span className="flex-1">{item.title}</span>
              {item.job ? <span className="text-xs text-warm-500">{item.job}</span> : null}
              {item.assignee ? <span className="text-xs bg-white px-2 py-0.5 rounded">{item.assignee}</span> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CrewSchedulePreview() {
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'two-week'>('week')

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

  // Calculate stats dynamically
  const totalCrew = mockTeamMembers.length
  const activeCrew = mockTeamMembers.filter(m => m.status !== 'pto').length
  const avgUtilization = Math.round(
    mockTeamMembers.filter(m => m.status !== 'pto').reduce((sum, m) => sum + m.utilization, 0) / activeCrew
  )
  const conflicts = mockTeamMembers.filter(m => m.status === 'conflict').length
  const onPto = mockTeamMembers.filter(m => m.status === 'pto').length
  const totalScheduledHours = mockTeamMembers.reduce((sum, m) => sum + (m.scheduledHours || 0), 0)
  const totalActualHours = mockTeamMembers.reduce((sum, m) => sum + (m.actualHours || 0), 0)
  const totalOvertimeHours = mockTeamMembers.reduce((sum, m) => sum + (m.overtimeHours || 0), 0)
  const totalLaborCost = mockTeamMembers.reduce((sum, m) => sum + ((m.costRate || 0) * (m.scheduledHours || 0)), 0)
  const availableCapacity = mockTeamMembers.filter(m => m.status !== 'pto' && m.utilization < 80).length
  const criticalPathAssignments = mockTeamMembers.reduce((count, m) => {
    return count + Object.values(m.assignments).filter(a => a?.isCriticalPath).length
  }, 0)

  // Count expired certifications
  const expiredCertCount = mockTeamMembers.reduce((count, m) => {
    return count + (m.certifications?.filter(c => !c.valid).length || 0)
  }, 0)

  // Count outdoor tasks affected by weather
  const outdoorTasksAffected = mockTeamMembers.reduce((count, m) => {
    const assignment = m.assignments[3] // Wednesday is rainy
    if (assignment && (assignment.task.includes('Concrete') || assignment.task.includes('Framing') || assignment.task.includes('Demo'))) {
      return count + 1
    }
    return 0
  }, 0)

  // Dynamic AI insights based on actual data
  const generateAIFeatures = () => {
    const features = []

    // Find member with lowest utilization for auto-schedule recommendation
    const lowUtilMember = mockTeamMembers
      .filter(m => m.status === 'active' && m.utilization < 70)
      .sort((a, b) => a.utilization - b.utilization)[0]

    if (lowUtilMember) {
      features.push({
        feature: 'Auto-Schedule',
        trigger: 'real-time',
        severity: 'info' as const,
        insight: `Recommend: Move ${lowUtilMember.name} to Harbor View Tuesday (closer to home, reduces commute conflict). Current utilization: ${lowUtilMember.utilization}%`,
        confidence: 87,
        action: {
          label: 'Apply',
          onClick: () => console.log('Auto-schedule applied'),
        },
      })
    }

    // Conflict detection based on actual conflicts
    const conflictMember = mockTeamMembers.find(m => m.status === 'conflict')
    if (conflictMember) {
      const conflictAssignment = Object.entries(conflictMember.assignments).find(([_, a]) => a?.color === 'red')
      if (conflictAssignment) {
        const availableMember = mockTeamMembers.find(m => m.status === 'active' && m.utilization < 70 && m.id !== conflictMember.id)
        features.push({
          feature: 'Conflict Detection',
          trigger: 'real-time',
          severity: 'critical' as const,
          insight: `${conflictMember.name} double-booked Wed: ${conflictAssignment[1]?.task}. Resolve: Reassign Harbor View to ${availableMember?.name || 'available crew member'}`,
          confidence: 95,
          action: {
            label: 'Resolve',
            onClick: () => console.log('Conflict resolved'),
          },
        })
      }
    }

    // Capacity planning based on actual hours
    const weeklyCapacity = activeCrew * 40
    const hoursNeeded = totalScheduledHours + 40 // Simulating next week needs more
    const gap = hoursNeeded - weeklyCapacity
    if (gap > 0 || totalOvertimeHours > 0) {
      features.push({
        feature: 'Capacity Planning',
        trigger: 'daily',
        severity: 'warning' as const,
        insight: `Next week: ${hoursNeeded} hours needed, ${weeklyCapacity} hours available. Gap: ${gap > 0 ? gap : 0} hours. Current OT: ${totalOvertimeHours}h. Consider: OT or temp hire`,
        confidence: 82,
        action: {
          label: 'Plan',
          onClick: () => console.log('Capacity planning'),
        },
      })
    }

    // Weather impact based on actual rainy day and outdoor tasks
    if (outdoorTasksAffected > 0) {
      features.push({
        feature: 'Weather Impact',
        trigger: 'daily',
        severity: 'warning' as const,
        insight: `Rain forecast Wednesday. ${outdoorTasksAffected} outdoor tasks affected (Harbor View concrete). Fallback: Johnson interior work available`,
        confidence: 78,
        action: {
          label: 'View Fallbacks',
          onClick: () => console.log('View fallback options'),
        },
      })
    }

    return features
  }

  const aiFeatures = generateAIFeatures()

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-warm-900">Crew Schedule</h3>
              <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                Week of February 10, 2026
              </span>
              {conflicts > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />{conflicts} conflict{conflicts > 1 ? 's' : ''}
                </span>
              )}
              {expiredCertCount > 0 && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{expiredCertCount} expired cert{expiredCertCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="text-sm text-warm-500 mt-0.5">
              Resource allocation across all active projects
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-warm-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('week')}
                className={cn(
                  "px-3 py-1.5 text-sm",
                  viewMode === 'week' ? "bg-stone-50 text-stone-600 font-medium" : "text-warm-500 hover:bg-warm-50"
                )}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={cn(
                  "px-3 py-1.5 text-sm",
                  viewMode === 'month' ? "bg-stone-50 text-stone-600 font-medium" : "text-warm-500 hover:bg-warm-50"
                )}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('two-week')}
                className={cn(
                  "px-3 py-1.5 text-sm",
                  viewMode === 'two-week' ? "bg-stone-50 text-stone-600 font-medium" : "text-warm-500 hover:bg-warm-50"
                )}
              >
                2-Week
              </button>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700">
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
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="grid grid-cols-9 gap-3">
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warm-500 text-xs">
              <Users className="h-3.5 w-3.5" />
              Crew
            </div>
            <div className="text-lg font-bold text-warm-900 mt-1">{totalCrew}</div>
            <div className="text-[10px] text-warm-400">{activeCrew} active</div>
          </div>
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warm-500 text-xs">
              <TrendingUp className="h-3.5 w-3.5" />
              Avg Util
            </div>
            <div className={cn("text-lg font-bold mt-1", avgUtilization >= 80 ? "text-green-600" : "text-amber-600")}>{avgUtilization}%</div>
          </div>
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warm-500 text-xs">
              <Clock className="h-3.5 w-3.5" />
              Scheduled
            </div>
            <div className="text-lg font-bold text-warm-900 mt-1">{totalScheduledHours}h</div>
            <div className={cn(
              "text-[10px]",
              totalActualHours > totalScheduledHours ? "text-red-500" : totalActualHours < totalScheduledHours ? "text-green-500" : "text-warm-400"
            )}>
              Actual: {totalActualHours}h
            </div>
          </div>
          <div className={cn("rounded-lg p-3", totalOvertimeHours > 0 ? "bg-red-50" : "bg-warm-50")}>
            <div className={cn("flex items-center gap-2 text-xs", totalOvertimeHours > 0 ? "text-red-600" : "text-warm-500")}>
              <Zap className="h-3.5 w-3.5" />
              Overtime
            </div>
            <div className={cn("text-lg font-bold mt-1", totalOvertimeHours > 0 ? "text-red-600" : "text-warm-900")}>{totalOvertimeHours}h</div>
          </div>
          <div className={cn("rounded-lg p-3", conflicts > 0 ? "bg-red-50" : "bg-warm-50")}>
            <div className={cn("flex items-center gap-2 text-xs", conflicts > 0 ? "text-red-600" : "text-warm-500")}>
              <AlertTriangle className="h-3.5 w-3.5" />
              Conflicts
            </div>
            <div className={cn("text-lg font-bold mt-1", conflicts > 0 ? "text-red-700" : "text-warm-900")}>{conflicts}</div>
          </div>
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warm-500 text-xs">
              <Plane className="h-3.5 w-3.5" />
              PTO
            </div>
            <div className="text-lg font-bold text-warm-900 mt-1">{onPto}</div>
          </div>
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warm-500 text-xs">
              <Briefcase className="h-3.5 w-3.5" />
              Available
            </div>
            <div className="text-lg font-bold text-green-600 mt-1">{availableCapacity}</div>
            <div className="text-[10px] text-warm-400">below 80%</div>
          </div>
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warm-500 text-xs">
              <Building2 className="h-3.5 w-3.5" />
              Labor Cost
            </div>
            <div className="text-lg font-bold text-warm-900 mt-1">${(totalLaborCost / 1000).toFixed(1)}K</div>
          </div>
          <div className={cn("rounded-lg p-3", expiredCertCount > 0 ? "bg-amber-50" : "bg-warm-50")}>
            <div className={cn("flex items-center gap-2 text-xs", expiredCertCount > 0 ? "text-amber-600" : "text-warm-500")}>
              <AlertCircle className="h-3.5 w-3.5" />
              Cert Issues
            </div>
            <div className={cn("text-lg font-bold mt-1", expiredCertCount > 0 ? "text-amber-700" : "text-warm-900")}>{expiredCertCount}</div>
          </div>
        </div>
      </div>

      {/* Cross-module badges */}
      <div className="bg-white border-b border-warm-200 px-4 py-2">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-warm-500 font-medium">Active Projects:</span>
          <span className="bg-stone-50 text-stone-600 px-2 py-0.5 rounded">Smith Residence - Rough-In</span>
          <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded">Johnson Beach - Framing</span>
          <span className="bg-warm-50 text-stone-600 px-2 py-0.5 rounded">Davis Addition - Pre-Con</span>
          <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded">Harbor View - Foundation</span>
          <span className="ml-auto text-warm-400">Critical path tasks: {criticalPathAssignments}</span>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white border-b border-warm-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-warm-100 rounded-lg transition-colors">
            <ChevronLeft className="h-5 w-5 text-warm-600" />
          </button>
          <button className="p-1.5 hover:bg-warm-100 rounded-lg transition-colors">
            <ChevronRight className="h-5 w-5 text-warm-600" />
          </button>
          <button className="px-3 py-1 text-sm text-stone-600 hover:bg-stone-50 rounded-lg font-medium">
            Today
          </button>
          <span className="text-warm-300 ml-2">|</span>
          <button
            onClick={() => setViewMode('two-week')}
            className={cn(
              "px-3 py-1 text-sm rounded-lg flex items-center gap-1",
              viewMode === 'two-week' ? "bg-stone-50 text-stone-600 font-medium" : "text-warm-600 hover:bg-warm-50"
            )}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            2-Week Look-Ahead
          </button>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Move className="h-3.5 w-3.5 text-warm-400" />
            <span className="text-warm-500">Drag to reassign</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-stone-100 border border-stone-200" />
            <span className="text-warm-600">Smith</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-200" />
            <span className="text-warm-600">Johnson</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-warm-100 border border-warm-200" />
            <span className="text-warm-600">Davis</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-100 border border-amber-200" />
            <span className="text-warm-600">Harbor View</span>
          </div>
        </div>
      </div>

      {/* Schedule Grid - changes based on viewMode */}
      {viewMode === 'week' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-warm-100 border-b border-warm-200">
              <tr>
                <th className="text-left py-2 px-3 font-medium text-warm-600 text-sm sticky left-0 bg-warm-100 z-10 w-56 border-r border-warm-200">
                  Team Member
                </th>
                {weekDays.map((day, idx) => {
                  const weather = mockWeather[idx]
                  return (
                    <th
                      key={day}
                      className={cn(
                        "text-center py-2 px-3 font-medium text-sm min-w-[120px]",
                        idx === 2 ? "bg-stone-100 text-stone-700" : "text-warm-600",
                        weather?.impactsOutdoor && "bg-red-50"
                      )}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>{day}</span>
                        {weather ? <WeatherIcon condition={weather.condition} /> : null}
                      </div>
                      <div className="text-xs font-normal">{weekDates[idx]}</div>
                    </th>
                  )
                })}
                <th className="text-center py-2 px-2 font-medium text-warm-600 text-xs w-16">Hours</th>
                <th className="text-center py-2 px-2 font-medium text-warm-600 text-xs w-12">OT</th>
                <th className="text-center py-2 px-2 font-medium text-warm-600 text-xs w-14">Util</th>
                <th className="text-center py-2 px-2 font-medium text-warm-600 text-xs w-16">Cost</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredMembers.map(member => (
                <TeamMemberRow key={member.id} member={member} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'month' && (
        <MonthlyCalendarView members={filteredMembers} />
      )}

      {viewMode === 'two-week' && (
        <TwoWeekLookAhead items={mockTwoWeekItems} />
      )}

      {/* Legend */}
      <div className="bg-white border-t border-warm-200 px-4 py-2">
        <div className="flex items-center gap-6 text-xs text-warm-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>80-100%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>50-79%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-warm-300" />
            <span>&lt;50%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>&gt;100% Conflict</span>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <Plane className="h-3.5 w-3.5 text-warm-400" />
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
            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
            <span>Cert Issue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GripVertical className="h-3.5 w-3.5 text-warm-300" />
            <span>Drag to reassign</span>
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="bg-white border-t border-warm-200 px-4 py-4">
        <AIFeaturesPanel
          title="Resource Intelligence"
          features={aiFeatures}
          columns={2}
        />
      </div>
    </div>
  )
}
