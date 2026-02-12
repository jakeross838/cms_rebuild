'use client'

import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Calendar,
  List,
  ClipboardCheck,
  Truck,
  Wrench,
  HardHat,
  Building2,
  Sparkles,
  Clock,
  AlertTriangle,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalendarTask {
  id: string
  jobName: string
  taskType: 'inspection' | 'delivery' | 'work' | 'meeting'
  vendor?: string
  time?: string
  status: 'scheduled' | 'in-progress' | 'completed'
  day: number
}

interface Job {
  id: string
  name: string
  color: string
}

const mockJobs: Job[] = [
  { id: '1', name: 'Smith Residence', color: 'blue' },
  { id: '2', name: 'Johnson Remodel', color: 'green' },
  { id: '3', name: 'Harbor View Custom', color: 'purple' },
  { id: '4', name: 'Coastal Retreat', color: 'amber' },
]

const mockTasks: CalendarTask[] = [
  // Week 1
  { id: '1', jobName: 'Smith Residence', taskType: 'work', vendor: 'ABC Framing', time: '8:00 AM', status: 'completed', day: 3 },
  { id: '2', jobName: 'Johnson Remodel', taskType: 'inspection', vendor: 'County Inspector', time: '10:00 AM', status: 'completed', day: 3 },
  { id: '3', jobName: 'Smith Residence', taskType: 'delivery', vendor: 'ABC Lumber', time: '7:30 AM', status: 'completed', day: 4 },
  { id: '4', jobName: 'Harbor View Custom', taskType: 'work', vendor: 'Smith Electric', time: '9:00 AM', status: 'completed', day: 4 },
  { id: '5', jobName: 'Coastal Retreat', taskType: 'meeting', vendor: 'Owner', time: '2:00 PM', status: 'completed', day: 5 },
  { id: '6', jobName: 'Smith Residence', taskType: 'work', vendor: 'ABC Framing', time: '8:00 AM', status: 'completed', day: 6 },
  { id: '7', jobName: 'Johnson Remodel', taskType: 'work', vendor: 'Jones Plumbing', time: '8:00 AM', status: 'completed', day: 7 },
  // Week 2
  { id: '8', jobName: 'Smith Residence', taskType: 'inspection', vendor: 'County Inspector', time: '9:00 AM', status: 'scheduled', day: 10 },
  { id: '9', jobName: 'Harbor View Custom', taskType: 'delivery', vendor: 'PGT Industries', time: '10:00 AM', status: 'scheduled', day: 10 },
  { id: '10', jobName: 'Johnson Remodel', taskType: 'work', vendor: 'Cool Air HVAC', time: '8:00 AM', status: 'scheduled', day: 11 },
  { id: '11', jobName: 'Smith Residence', taskType: 'work', vendor: 'Smith Electric', time: '8:00 AM', status: 'in-progress', day: 12 },
  { id: '12', jobName: 'Coastal Retreat', taskType: 'inspection', vendor: 'County Inspector', time: '11:00 AM', status: 'scheduled', day: 12 },
  { id: '13', jobName: 'Harbor View Custom', taskType: 'work', vendor: 'Gulf Coast Concrete', time: '7:00 AM', status: 'scheduled', day: 13 },
  { id: '14', jobName: 'Smith Residence', taskType: 'delivery', vendor: 'ABC Lumber', time: '8:00 AM', status: 'scheduled', day: 14 },
  // Week 3
  { id: '15', jobName: 'Johnson Remodel', taskType: 'inspection', vendor: 'County Inspector', time: '10:00 AM', status: 'scheduled', day: 17 },
  { id: '16', jobName: 'Smith Residence', taskType: 'work', vendor: 'Jones Plumbing', time: '8:00 AM', status: 'scheduled', day: 18 },
  { id: '17', jobName: 'Harbor View Custom', taskType: 'meeting', vendor: 'Owner', time: '3:00 PM', status: 'scheduled', day: 19 },
  { id: '18', jobName: 'Coastal Retreat', taskType: 'delivery', vendor: 'PGT Industries', time: '9:00 AM', status: 'scheduled', day: 20 },
  { id: '19', jobName: 'Smith Residence', taskType: 'inspection', vendor: 'County Inspector', time: '2:00 PM', status: 'scheduled', day: 21 },
  // Week 4
  { id: '20', jobName: 'Johnson Remodel', taskType: 'work', vendor: 'Coastal Paint Pros', time: '8:00 AM', status: 'scheduled', day: 24 },
  { id: '21', jobName: 'Harbor View Custom', taskType: 'inspection', vendor: 'County Inspector', time: '9:00 AM', status: 'scheduled', day: 25 },
  { id: '22', jobName: 'Smith Residence', taskType: 'work', vendor: 'Cool Air HVAC', time: '8:00 AM', status: 'scheduled', day: 26 },
  { id: '23', jobName: 'Coastal Retreat', taskType: 'work', vendor: 'ABC Framing', time: '8:00 AM', status: 'scheduled', day: 27 },
  { id: '24', jobName: 'Smith Residence', taskType: 'meeting', vendor: 'Owner', time: '4:00 PM', status: 'scheduled', day: 28 },
]

const taskTypeConfig = {
  inspection: {
    icon: ClipboardCheck,
    label: 'Inspection',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  delivery: {
    icon: Truck,
    label: 'Delivery',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  work: {
    icon: Wrench,
    label: 'Work',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  meeting: {
    icon: HardHat,
    label: 'Meeting',
    color: 'bg-green-100 text-green-700 border-green-200',
  },
}

const jobColors: Record<string, string> = {
  'Smith Residence': 'border-l-blue-500',
  'Johnson Remodel': 'border-l-green-500',
  'Harbor View Custom': 'border-l-purple-500',
  'Coastal Retreat': 'border-l-amber-500',
}

function TaskCard({ task }: { task: CalendarTask }) {
  const config = taskTypeConfig[task.taskType]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "text-xs p-1.5 rounded border-l-2 bg-white border border-gray-100 hover:shadow-sm transition-shadow cursor-pointer",
        jobColors[task.jobName],
        task.status === 'completed' && "opacity-60"
      )}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className="h-3 w-3 flex-shrink-0" />
        <span className="font-medium truncate">{task.jobName}</span>
      </div>
      {task.vendor && (
        <div className="text-gray-500 truncate">{task.vendor}</div>
      )}
      {task.time && (
        <div className="text-gray-400 text-[10px]">{task.time}</div>
      )}
    </div>
  )
}

function CalendarDay({
  day,
  tasks,
  isToday,
  isCurrentMonth
}: {
  day: number
  tasks: CalendarTask[]
  isToday: boolean
  isCurrentMonth: boolean
}) {
  const maxVisibleTasks = 3
  const visibleTasks = tasks.slice(0, maxVisibleTasks)
  const remainingCount = tasks.length - maxVisibleTasks

  return (
    <div
      className={cn(
        "min-h-[120px] p-1 border-r border-b border-gray-100",
        !isCurrentMonth && "bg-gray-50",
        isToday && "bg-blue-50"
      )}
    >
      <div
        className={cn(
          "text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full",
          isToday && "bg-blue-600 text-white",
          !isToday && isCurrentMonth && "text-gray-900",
          !isCurrentMonth && "text-gray-400"
        )}
      >
        {day}
      </div>
      <div className="space-y-1">
        {visibleTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
        {remainingCount > 0 && (
          <div className="text-xs text-gray-500 text-center py-0.5 hover:text-blue-600 cursor-pointer">
            +{remainingCount} more
          </div>
        )}
      </div>
    </div>
  )
}

export function CalendarPreview() {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [selectedJob, setSelectedJob] = useState<string>('all')
  const [selectedTaskType, setSelectedTaskType] = useState<string>('all')
  const [currentMonth] = useState('February 2026')

  // Filter tasks
  const filteredTasks = mockTasks.filter(task => {
    if (selectedJob !== 'all' && task.jobName !== selectedJob) return false
    if (selectedTaskType !== 'all' && task.taskType !== selectedTaskType) return false
    return true
  })

  // Calculate stats
  const today = 12
  const tasksThisWeek = filteredTasks.filter(t => t.day >= 10 && t.day <= 14).length
  const inspectionsScheduled = filteredTasks.filter(t => t.taskType === 'inspection' && t.status === 'scheduled').length
  const deliveriesExpected = filteredTasks.filter(t => t.taskType === 'delivery' && t.status === 'scheduled').length

  // Group tasks by day
  const tasksByDay: Record<number, CalendarTask[]> = {}
  filteredTasks.forEach(task => {
    if (!tasksByDay[task.day]) {
      tasksByDay[task.day] = []
    }
    tasksByDay[task.day].push(task)
  })

  // Generate calendar days (Feb 2026 starts on Sunday)
  const daysInMonth = 28
  const startDay = 0 // Sunday
  const prevMonthDays = startDay
  const calendarDays: { day: number; isCurrentMonth: boolean }[] = []

  // Previous month days (Jan 2026 has 31 days)
  for (let i = prevMonthDays - 1; i >= 0; i--) {
    calendarDays.push({ day: 31 - i, isCurrentMonth: false })
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, isCurrentMonth: true })
  }

  // Next month days to fill the grid
  const remainingDays = 35 - calendarDays.length
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({ day: i, isCurrentMonth: false })
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Operations Calendar</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {filteredTasks.length} tasks scheduled
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {tasksThisWeek} tasks this week
              </span>
              <span className="flex items-center gap-1">
                <ClipboardCheck className="h-4 w-4" />
                {inspectionsScheduled} inspections
              </span>
              <span className="flex items-center gap-1">
                <Truck className="h-4 w-4" />
                {deliveriesExpected} deliveries
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('calendar')}
                className={cn(
                  "p-2",
                  viewMode === 'calendar' ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"
                )}
              >
                <Calendar className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2",
                  viewMode === 'list' ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{tasksThisWeek}</div>
              <div className="text-xs text-gray-500">Tasks This Week</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <ClipboardCheck className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{inspectionsScheduled}</div>
              <div className="text-xs text-gray-500">Inspections Scheduled</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Truck className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{deliveriesExpected}</div>
              <div className="text-xs text-gray-500">Deliveries Expected</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{mockJobs.length}</div>
              <div className="text-xs text-gray-500">Active Jobs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Job:</span>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Jobs</option>
            {mockJobs.map(job => (
              <option key={job.id} value={job.name}>{job.name}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500 ml-4">Task Type:</span>
          <select
            value={selectedTaskType}
            onChange={(e) => setSelectedTaskType(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="work">Work</option>
            <option value="inspection">Inspection</option>
            <option value="delivery">Delivery</option>
            <option value="meeting">Meeting</option>
          </select>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border-l-2 border-l-blue-500 border border-gray-200" />
            <span className="text-gray-600">Smith Residence</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border-l-2 border-l-green-500 border border-gray-200" />
            <span className="text-gray-600">Johnson Remodel</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border-l-2 border-l-purple-500 border border-gray-200" />
            <span className="text-gray-600">Harbor View</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border-l-2 border-l-amber-500 border border-gray-200" />
            <span className="text-gray-600">Coastal Retreat</span>
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
          <h4 className="font-semibold text-gray-900 ml-2">{currentMonth}</h4>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map(day => (
            <div
              key={day}
              className="text-center py-2 text-sm font-medium text-gray-500 border-r border-gray-100 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((dayInfo, index) => (
            <CalendarDay
              key={index}
              day={dayInfo.day}
              tasks={dayInfo.isCurrentMonth ? (tasksByDay[dayInfo.day] || []) : []}
              isToday={dayInfo.isCurrentMonth && dayInfo.day === today}
              isCurrentMonth={dayInfo.isCurrentMonth}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Wrench className="h-3.5 w-3.5 text-blue-600" />
            <span>Work</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ClipboardCheck className="h-3.5 w-3.5 text-purple-600" />
            <span>Inspection</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-amber-600" />
            <span>Delivery</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HardHat className="h-3.5 w-3.5 text-green-600" />
            <span>Meeting</span>
          </div>
          <div className="flex items-center gap-1.5 ml-4">
            <Eye className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-400">Completed tasks are dimmed</span>
          </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Scheduling Suggestions:</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-amber-700">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Move Smith inspection to AM - inspector typically unavailable after 2pm
            </span>
            <span className="text-amber-400">|</span>
            <span>PGT delivery on Feb 10 may conflict with concrete pour - consider rescheduling</span>
            <span className="text-amber-400">|</span>
            <span>ABC Framing available Feb 15-16 if needed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
