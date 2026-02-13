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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

interface TimeEntry {
  id: string
  employeeName: string
  jobSite: string
  clockInTime: string
  clockOutTime: string
  hoursWorked: number
  costCode: string
  breakMinutes: number
  status: 'approved' | 'pending' | 'flagged'
  location?: string
}

interface EmployeeTimeSummary {
  id: string
  name: string
  role: string
  hoursThisWeek: number
  overtimeHours: number
  jobsWorked: number
  status: 'clocked-in' | 'clocked-out'
  lastClockTime?: string
}

const mockEmployees: EmployeeTimeSummary[] = [
  {
    id: '1',
    name: 'Marcus Rodriguez',
    role: 'Framing Crew Lead',
    hoursThisWeek: 42.5,
    overtimeHours: 2.5,
    jobsWorked: 2,
    status: 'clocked-out',
    lastClockTime: '4:30 PM Today',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    role: 'HVAC Technician',
    hoursThisWeek: 40.0,
    overtimeHours: 0,
    jobsWorked: 3,
    status: 'clocked-in',
    lastClockTime: 'Currently working',
  },
  {
    id: '3',
    name: 'James Thompson',
    role: 'Electrician',
    hoursThisWeek: 38.5,
    overtimeHours: 0,
    jobsWorked: 2,
    status: 'clocked-out',
    lastClockTime: '3:45 PM Today',
  },
  {
    id: '4',
    name: 'Lisa Martinez',
    role: 'General Laborer',
    hoursThisWeek: 44.0,
    overtimeHours: 4.0,
    jobsWorked: 4,
    status: 'clocked-out',
    lastClockTime: '5:15 PM Today',
  },
]

const mockTimeEntries: TimeEntry[] = [
  {
    id: '1',
    employeeName: 'Marcus Rodriguez',
    jobSite: 'Smith Residence Remodel',
    clockInTime: '7:00 AM',
    clockOutTime: '4:30 PM',
    hoursWorked: 9.5,
    costCode: 'FR-100',
    breakMinutes: 30,
    status: 'approved',
    location: 'Smith Residence, 1234 Oak St',
  },
  {
    id: '2',
    employeeName: 'Sarah Chen',
    jobSite: 'Harbor View Custom Home',
    clockInTime: '8:00 AM',
    clockOutTime: 'Currently Clocked In',
    hoursWorked: 8.0,
    costCode: 'HV-205',
    breakMinutes: 30,
    status: 'pending',
    location: 'Harbor View, 5678 Beach Rd',
  },
  {
    id: '3',
    employeeName: 'James Thompson',
    jobSite: 'Johnson Electrical Upgrade',
    clockInTime: '6:30 AM',
    clockOutTime: '3:45 PM',
    hoursWorked: 9.0,
    costCode: 'EL-150',
    breakMinutes: 45,
    status: 'flagged',
    location: 'Johnson Residence, 9012 Elm Ave',
  },
  {
    id: '4',
    employeeName: 'Lisa Martinez',
    jobSite: 'Coastal Retreat Construction',
    clockInTime: '7:30 AM',
    clockOutTime: '5:15 PM',
    hoursWorked: 9.75,
    costCode: 'GN-080',
    breakMinutes: 30,
    status: 'approved',
    location: 'Coastal Retreat, 2468 Lighthouse Ln',
  },
]

const aiInsights = [
  {
    type: 'warning',
    title: 'Overtime Alert',
    message: 'Lisa Martinez will exceed 40 hours this week if she works 4+ hours tomorrow',
  },
  {
    type: 'info',
    title: 'Break Reminder',
    message: 'James Thompson took a 45-min break today - CA law requires breaks every 4 hours',
  },
  {
    type: 'success',
    title: 'Location Verified',
    message: 'All 4 clock-ins today matched job site GPS coordinates within 100ft',
  },
]

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
  }

  const { bg, text, border, icon: Icon, label } = config[status]

  return (
    <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', bg, text, border)}>
      <Icon className="h-3 w-3" />
      {label}
    </div>
  )
}

function EmployeeCard({ employee }: { employee: EmployeeTimeSummary }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{employee.name}</h4>
          <p className="text-xs text-gray-500">{employee.role}</p>
        </div>
        <div
          className={cn(
            'w-3 h-3 rounded-full',
            employee.status === 'clocked-in' ? 'bg-green-500' : 'bg-gray-300'
          )}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <div className="text-lg font-bold text-gray-900">{employee.hoursThisWeek}h</div>
          <div className="text-xs text-gray-500">This Week</div>
        </div>
        <div>
          <div className="text-lg font-bold text-orange-600">{employee.overtimeHours}h</div>
          <div className="text-xs text-gray-500">Overtime</div>
        </div>
        <div>
          <div className="text-lg font-bold text-gray-900">{employee.jobsWorked}</div>
          <div className="text-xs text-gray-500">Jobs</div>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-600">{employee.lastClockTime}</p>
      </div>
    </div>
  )
}

export function TimeClockPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState({ defaultTab: 'team' })
  const [selectedJob, setSelectedJob] = useState('all')

  const filteredEntries = sortItems(
    mockTimeEntries.filter(e => {
      if (!matchesSearch(e, search, ['employeeName', 'jobSite', 'costCode'])) return false
      if (selectedJob !== 'all' && e.jobSite !== selectedJob) return false
      return true
    }),
    activeSort as keyof TimeEntry | '',
    sortDirection,
  )

  const filteredEmployees = mockEmployees.filter(e => {
    if (!matchesSearch(e, search, ['name', 'role'])) return false
    return true
  })

  // Calculate stats
  const totalHoursToday = mockTimeEntries.reduce((sum, e) => sum + e.hoursWorked, 0)
  const overtimeHours = mockEmployees.reduce((sum, e) => sum + e.overtimeHours, 0)
  const flaggedEntries = mockTimeEntries.filter(e => e.status === 'flagged').length
  const clockedInCount = mockEmployees.filter(e => e.status === 'clocked-in').length

  const jobSites = Array.from(new Set(mockTimeEntries.map(e => e.jobSite)))

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Time Clock Management</h3>
            <p className="text-sm text-gray-500 mt-0.5">Week of February 10, 2026</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalHoursToday.toFixed(1)}h</div>
              <div className="text-xs text-gray-500">Hours Logged Today</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{clockedInCount}</div>
              <div className="text-xs text-gray-500">Currently Clocked In</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{overtimeHours}h</div>
              <div className="text-xs text-gray-500">Overtime This Week</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center",
              flaggedEntries > 0 ? "bg-red-100" : "bg-green-100"
            )}>
              <Zap className={cn("h-5 w-5", flaggedEntries > 0 ? "text-red-600" : "text-green-600")} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{flaggedEntries}</div>
              <div className="text-xs text-gray-500">Flagged Entries</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search employees, jobs..."
          tabs={[
            { key: 'team', label: 'Team Overview' },
            { key: 'pending', label: 'Pending Review', count: mockTimeEntries.filter(e => e.status !== 'approved').length },
            { key: 'insights', label: 'AI Insights' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={
            activeTab === 'team'
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
            activeTab === 'team'
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
        {activeTab === 'team' && (
          <div>
            {/* Employee Cards Grid */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {filteredEmployees.map(employee => (
                  <EmployeeCard key={employee.id} employee={employee} />
                ))}
              </div>

              {/* Time Entries Table */}
              <div className="mt-8">
                <h4 className="font-semibold text-gray-900 mb-4">Time Entries</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Employee</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Job Site</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Clock In</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Clock Out</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Hours</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Cost Code</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntries.map(entry => (
                        <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900 font-medium">{entry.employeeName}</td>
                          <td className="py-3 px-4 text-gray-600">{entry.jobSite}</td>
                          <td className="py-3 px-4 text-gray-600">{entry.clockInTime}</td>
                          <td className="py-3 px-4 text-gray-600">{entry.clockOutTime}</td>
                          <td className="py-3 px-4 font-medium text-gray-900">{entry.hoursWorked}h</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                              {entry.costCode}
                            </span>
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
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="p-6">
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-4">Entries Pending Review</h4>
              <div className="space-y-3">
                {mockTimeEntries
                  .filter(e => e.status !== 'approved')
                  .map(entry => (
                    <div key={entry.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="font-semibold text-gray-900">{entry.employeeName}</h5>
                          <p className="text-sm text-gray-600">{entry.jobSite}</p>
                          {entry.location && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <MapPin className="h-3 w-3" />
                              {entry.location}
                            </div>
                          )}
                        </div>
                        <StatusBadge status={entry.status} />
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-3 pt-3 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500">Clock In</p>
                          <p className="font-medium text-gray-900">{entry.clockInTime}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Clock Out</p>
                          <p className="font-medium text-gray-900">{entry.clockOutTime}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Hours Worked</p>
                          <p className="font-medium text-gray-900">{entry.hoursWorked}h</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Break Time</p>
                          <p className="font-medium text-gray-900">{entry.breakMinutes}m</p>
                        </div>
                      </div>

                      {entry.status === 'flagged' && (
                        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                          Break time exceeds 45 minutes - verify breaks were legitimate work breaks
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

        {activeTab === 'insights' && (
          <div className="p-6">
            <div className="space-y-3">
              {aiInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'border rounded-lg p-4 flex items-start gap-3',
                    insight.type === 'warning' && 'bg-yellow-50 border-yellow-200',
                    insight.type === 'info' && 'bg-blue-50 border-blue-200',
                    insight.type === 'success' && 'bg-green-50 border-green-200'
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {insight.type === 'warning' && (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    )}
                    {insight.type === 'info' && (
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                    )}
                    {insight.type === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h5
                      className={cn(
                        'font-semibold',
                        insight.type === 'warning' && 'text-yellow-900',
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

            {/* Additional AI Features */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h5 className="font-semibold text-blue-900 mb-2">AI-Powered Features</h5>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>Location verification ensures all clock-ins match job site GPS</li>
                    <li>Anomaly detection flags unusual patterns (excessive hours, breaks, locations)</li>
                    <li>Automated break reminders based on state-specific labor laws</li>
                    <li>Cost code suggestions based on job phase and worker role</li>
                    <li>Payroll compliance monitoring with overtime calculations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
