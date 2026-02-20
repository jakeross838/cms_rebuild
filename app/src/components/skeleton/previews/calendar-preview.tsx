'use client'

import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
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
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Flag,
  Target,
  Zap,
  Users,
  ThermometerSun,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { AIFeaturesPanel } from '@/components/skeleton/ui'
import { useFilterState, matchesSearch } from '@/hooks/use-filter-state'

interface CalendarTask {
  id: string
  jobName: string
  taskType: 'inspection' | 'delivery' | 'work' | 'meeting' | 'milestone' | 'deadline'
  vendor?: string
  time?: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'blocked' | 'overdue'
  day: number
  isCriticalPath?: boolean
  phase?: string
  dependencyCount?: number
  weatherSensitive?: boolean
  notes?: string
}

interface Job {
  id: string
  name: string
  color: string
  scheduleHealth: 'on-track' | 'at-risk' | 'behind'
  percentComplete: number
}

interface WeatherDay {
  day: number
  high: number
  low: number
  condition: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rain' | 'storm'
  precipitation: number
  windMph: number
  impactsOutdoorWork: boolean
}

const mockJobs: Job[] = [
  { id: '1', name: 'Smith Residence', color: 'blue', scheduleHealth: 'on-track', percentComplete: 62 },
  { id: '2', name: 'Johnson Remodel', color: 'green', scheduleHealth: 'at-risk', percentComplete: 45 },
  { id: '3', name: 'Harbor View Custom', color: 'purple', scheduleHealth: 'on-track', percentComplete: 28 },
  { id: '4', name: 'Coastal Retreat', color: 'amber', scheduleHealth: 'behind', percentComplete: 15 },
]

const mockTasks: CalendarTask[] = [
  // Week 1
  { id: '1', jobName: 'Smith Residence', taskType: 'work', vendor: 'ABC Framing', time: '8:00 AM', status: 'completed', day: 3, phase: 'Framing' },
  { id: '2', jobName: 'Johnson Remodel', taskType: 'inspection', vendor: 'County Inspector', time: '10:00 AM', status: 'completed', day: 3 },
  { id: '3', jobName: 'Smith Residence', taskType: 'delivery', vendor: 'ABC Lumber', time: '7:30 AM', status: 'completed', day: 4, notes: 'Trusses - 2nd delivery' },
  { id: '4', jobName: 'Harbor View Custom', taskType: 'work', vendor: 'Smith Electric', time: '9:00 AM', status: 'completed', day: 4, phase: 'Rough-In', isCriticalPath: true },
  { id: '5', jobName: 'Coastal Retreat', taskType: 'meeting', vendor: 'Owner', time: '2:00 PM', status: 'completed', day: 5 },
  { id: '6', jobName: 'Smith Residence', taskType: 'milestone', time: '5:00 PM', status: 'completed', day: 6, notes: 'Framing complete' },
  { id: '7', jobName: 'Johnson Remodel', taskType: 'work', vendor: 'Jones Plumbing', time: '8:00 AM', status: 'completed', day: 7, phase: 'Rough-In' },
  // Week 2
  { id: '8', jobName: 'Smith Residence', taskType: 'inspection', vendor: 'County Inspector', time: '9:00 AM', status: 'scheduled', day: 10, notes: 'Framing inspection' },
  { id: '9', jobName: 'Harbor View Custom', taskType: 'delivery', vendor: 'PGT Industries', time: '10:00 AM', status: 'scheduled', day: 10, notes: 'Impact windows - 24 units' },
  { id: '10', jobName: 'Johnson Remodel', taskType: 'work', vendor: 'Cool Air HVAC', time: '8:00 AM', status: 'scheduled', day: 11, phase: 'MEP Rough-In', isCriticalPath: true },
  { id: '11', jobName: 'Smith Residence', taskType: 'work', vendor: 'Smith Electric', time: '8:00 AM', status: 'in-progress', day: 12, phase: 'Rough-In', isCriticalPath: true, weatherSensitive: false },
  { id: '12', jobName: 'Coastal Retreat', taskType: 'inspection', vendor: 'County Inspector', time: '11:00 AM', status: 'scheduled', day: 12 },
  { id: '25', jobName: 'Coastal Retreat', taskType: 'deadline', time: '5:00 PM', status: 'overdue', day: 12, notes: 'Permit application deadline - OVERDUE' },
  { id: '13', jobName: 'Harbor View Custom', taskType: 'work', vendor: 'Gulf Coast Concrete', time: '7:00 AM', status: 'blocked', day: 13, phase: 'Foundation', weatherSensitive: true, notes: 'Rain forecasted - concrete pour blocked' },
  { id: '14', jobName: 'Smith Residence', taskType: 'delivery', vendor: 'ABC Lumber', time: '8:00 AM', status: 'scheduled', day: 14, notes: 'Finish lumber package' },
  // Week 3
  { id: '15', jobName: 'Johnson Remodel', taskType: 'inspection', vendor: 'County Inspector', time: '10:00 AM', status: 'scheduled', day: 17 },
  { id: '16', jobName: 'Smith Residence', taskType: 'work', vendor: 'Jones Plumbing', time: '8:00 AM', status: 'scheduled', day: 18, phase: 'Rough-In', isCriticalPath: true },
  { id: '17', jobName: 'Harbor View Custom', taskType: 'meeting', vendor: 'Owner', time: '3:00 PM', status: 'scheduled', day: 19, notes: 'Selection review meeting' },
  { id: '18', jobName: 'Coastal Retreat', taskType: 'delivery', vendor: 'PGT Industries', time: '9:00 AM', status: 'scheduled', day: 20, notes: 'Windows - 8 units' },
  { id: '19', jobName: 'Smith Residence', taskType: 'milestone', time: '5:00 PM', status: 'scheduled', day: 21, notes: 'Rough-in complete / inspection ready' },
  // Week 4
  { id: '20', jobName: 'Johnson Remodel', taskType: 'work', vendor: 'Coastal Paint Pros', time: '8:00 AM', status: 'scheduled', day: 24, phase: 'Finishes' },
  { id: '21', jobName: 'Harbor View Custom', taskType: 'inspection', vendor: 'County Inspector', time: '9:00 AM', status: 'scheduled', day: 25 },
  { id: '22', jobName: 'Smith Residence', taskType: 'work', vendor: 'Cool Air HVAC', time: '8:00 AM', status: 'scheduled', day: 26, phase: 'MEP Rough-In', weatherSensitive: false },
  { id: '23', jobName: 'Coastal Retreat', taskType: 'work', vendor: 'ABC Framing', time: '8:00 AM', status: 'scheduled', day: 27, phase: 'Framing', weatherSensitive: true },
  { id: '24', jobName: 'Smith Residence', taskType: 'meeting', vendor: 'Owner', time: '4:00 PM', status: 'scheduled', day: 28, notes: 'Pre-drywall walkthrough' },
]

const mockWeather: WeatherDay[] = [
  { day: 10, high: 78, low: 62, condition: 'sunny', precipitation: 0, windMph: 8, impactsOutdoorWork: false },
  { day: 11, high: 80, low: 64, condition: 'partly-cloudy', precipitation: 0, windMph: 12, impactsOutdoorWork: false },
  { day: 12, high: 76, low: 60, condition: 'cloudy', precipitation: 0.1, windMph: 15, impactsOutdoorWork: false },
  { day: 13, high: 72, low: 58, condition: 'rain', precipitation: 1.5, windMph: 20, impactsOutdoorWork: true },
  { day: 14, high: 74, low: 59, condition: 'partly-cloudy', precipitation: 0.05, windMph: 10, impactsOutdoorWork: false },
]

const taskTypeConfig: Record<string, { icon: typeof Wrench; label: string; color: string }> = {
  inspection: {
    icon: ClipboardCheck,
    label: 'Inspection',
    color: 'bg-warm-100 text-warm-700 border-warm-200',
  },
  delivery: {
    icon: Truck,
    label: 'Delivery',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  work: {
    icon: Wrench,
    label: 'Work',
    color: 'bg-stone-100 text-stone-700 border-stone-200',
  },
  meeting: {
    icon: HardHat,
    label: 'Meeting',
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  milestone: {
    icon: Flag,
    label: 'Milestone',
    color: 'bg-stone-100 text-stone-700 border-stone-200',
  },
  deadline: {
    icon: Target,
    label: 'Deadline',
    color: 'bg-red-100 text-red-700 border-red-200',
  },
}

const jobColors: Record<string, string> = {
  'Smith Residence': 'border-l-stone-500',
  'Johnson Remodel': 'border-l-green-500',
  'Harbor View Custom': 'border-l-purple-500',
  'Coastal Retreat': 'border-l-amber-500',
}

function WeatherIcon({ condition }: { condition: string }) {
  switch (condition) {
    case 'sunny': return <Sun className="h-3.5 w-3.5 text-amber-500" />
    case 'partly-cloudy': return <Cloud className="h-3.5 w-3.5 text-warm-400" />
    case 'cloudy': return <Cloud className="h-3.5 w-3.5 text-warm-500" />
    case 'rain': return <CloudRain className="h-3.5 w-3.5 text-stone-500" />
    case 'storm': return <Zap className="h-3.5 w-3.5 text-red-500" />
    default: return <Sun className="h-3.5 w-3.5 text-amber-500" />
  }
}

function TaskCard({ task }: { task: CalendarTask }) {
  const config = taskTypeConfig[task.taskType]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "text-xs p-1.5 rounded border-l-2 bg-white border border-warm-100 hover:shadow-sm transition-shadow cursor-pointer",
        jobColors[task.jobName],
        task.status === 'completed' && "opacity-60",
        task.status === 'blocked' && "bg-red-50 border-red-200",
        task.status === 'overdue' && "bg-red-50 border-red-300",
      )}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className="h-3 w-3 flex-shrink-0" />
        <span className="font-medium truncate">{task.jobName}</span>
        {task.isCriticalPath && <Zap className="h-2.5 w-2.5 text-red-500 flex-shrink-0" />}
        {task.status === 'overdue' && <AlertTriangle className="h-2.5 w-2.5 text-red-600 flex-shrink-0" />}
        {task.status === 'blocked' && <CloudRain className="h-2.5 w-2.5 text-stone-600 flex-shrink-0" />}
      </div>
      {task.vendor && (
        <div className="text-warm-500 truncate">{task.vendor}</div>
      )}
      {task.time && (
        <div className="text-warm-400 text-[10px]">{task.time}</div>
      )}
    </div>
  )
}

function CalendarDay({
  day,
  tasks,
  isToday,
  isCurrentMonth,
  weather,
}: {
  day: number
  tasks: CalendarTask[]
  isToday: boolean
  isCurrentMonth: boolean
  weather?: WeatherDay
}) {
  const maxVisibleTasks = 3
  const visibleTasks = tasks.slice(0, maxVisibleTasks)
  const remainingCount = tasks.length - maxVisibleTasks

  return (
    <div
      className={cn(
        "min-h-[120px] p-1 border-r border-b border-warm-100",
        !isCurrentMonth && "bg-warm-50",
        isToday && "bg-stone-50",
        weather?.impactsOutdoorWork && isCurrentMonth && "bg-red-50/30",
      )}
    >
      <div className="flex items-center justify-between mb-0.5">
        <div
          className={cn(
            "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
            isToday && "bg-stone-600 text-white",
            !isToday && isCurrentMonth && "text-warm-900",
            !isCurrentMonth && "text-warm-400"
          )}
        >
          {day}
        </div>
        {weather && isCurrentMonth && (
          <div className="flex items-center gap-0.5" title={`${weather.high}F / ${weather.low}F, ${weather.condition}, Wind: ${weather.windMph}mph`}>
            <WeatherIcon condition={weather.condition} />
            <span className="text-[10px] text-warm-400">{weather.high}°</span>
            {weather.impactsOutdoorWork && (
              <AlertTriangle className="h-2.5 w-2.5 text-red-400" />
            )}
          </div>
        )}
      </div>
      <div className="space-y-1">
        {visibleTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
        {remainingCount > 0 && (
          <div className="text-xs text-warm-500 text-center py-0.5 hover:text-stone-600 cursor-pointer">
            +{remainingCount} more
          </div>
        )}
      </div>
    </div>
  )
}

export function CalendarPreview() {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')

  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState({ defaultTab: 'all' })

  // Filter tasks
  const filteredTasks = mockTasks.filter(task => {
    if (activeTab === 'work' && task.taskType !== 'work') return false
    if (activeTab === 'inspections' && task.taskType !== 'inspection') return false
    if (activeTab === 'deliveries' && task.taskType !== 'delivery') return false
    if (activeTab === 'milestones' && task.taskType !== 'milestone' && task.taskType !== 'deadline') return false
    if (activeTab === 'critical' && !task.isCriticalPath) return false
    if (search && !matchesSearch(task, search, ['jobName', 'vendor', 'notes', 'phase'])) return false
    return true
  })

  // Calculate stats
  const today = 12
  const tasksThisWeek = filteredTasks.filter(t => t.day >= 10 && t.day <= 14).length
  const inspectionsScheduled = filteredTasks.filter(t => t.taskType === 'inspection' && t.status === 'scheduled').length
  const deliveriesExpected = filteredTasks.filter(t => t.taskType === 'delivery' && t.status === 'scheduled').length
  const criticalPathTasks = filteredTasks.filter(t => t.isCriticalPath).length
  const blockedTasks = filteredTasks.filter(t => t.status === 'blocked').length
  const overdueTasks = filteredTasks.filter(t => t.status === 'overdue').length
  const weatherImpactDays = mockWeather.filter(w => w.impactsOutdoorWork).length

  // Group tasks by day
  const tasksByDay: Record<number, CalendarTask[]> = {}
  filteredTasks.forEach(task => {
    if (!tasksByDay[task.day]) tasksByDay[task.day] = []
    tasksByDay[task.day].push(task)
  })

  // Weather by day
  const weatherByDay: Record<number, WeatherDay> = {}
  mockWeather.forEach(w => { weatherByDay[w.day] = w })

  // Generate calendar days (Feb 2026 starts on Sunday)
  const daysInMonth = 28
  const calendarDays: { day: number; isCurrentMonth: boolean }[] = []
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, isCurrentMonth: true })
  }
  const remainingDays = 35 - calendarDays.length
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({ day: i, isCurrentMonth: false })
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-warm-900">Operations Calendar</h3>
              <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                {filteredTasks.length} events
              </span>
              {overdueTasks > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />{overdueTasks} overdue
                </span>
              )}
              {blockedTasks > 0 && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1">
                  <CloudRain className="h-3 w-3" />{blockedTasks} weather blocked
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-warm-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('calendar')}
                className={cn(
                  "p-2",
                  viewMode === 'calendar' ? "bg-stone-50 text-stone-600" : "text-warm-400 hover:bg-warm-50"
                )}
              >
                <Calendar className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2",
                  viewMode === 'list' ? "bg-stone-50 text-stone-600" : "text-warm-400 hover:bg-warm-50"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700">
              <Plus className="h-4 w-4" />
              Add Event
            </button>
          </div>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search events, jobs, vendors..."
          tabs={[
            { key: 'all', label: 'All Events', count: mockTasks.length },
            { key: 'work', label: 'Work', count: mockTasks.filter(t => t.taskType === 'work').length },
            { key: 'inspections', label: 'Inspections', count: mockTasks.filter(t => t.taskType === 'inspection').length },
            { key: 'deliveries', label: 'Deliveries', count: mockTasks.filter(t => t.taskType === 'delivery').length },
            { key: 'milestones', label: 'Milestones', count: mockTasks.filter(t => t.taskType === 'milestone' || t.taskType === 'deadline').length },
            { key: 'critical', label: 'Critical Path', count: mockTasks.filter(t => t.isCriticalPath).length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'day', label: 'Date' },
            { value: 'jobName', label: 'Job' },
            { value: 'taskType', label: 'Type' },
            { value: 'status', label: 'Status' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          resultCount={filteredTasks.length}
          totalCount={mockTasks.length}
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="grid grid-cols-7 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-stone-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-stone-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-warm-900">{tasksThisWeek}</div>
              <div className="text-xs text-warm-500">This Week</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warm-100 flex items-center justify-center">
              <ClipboardCheck className="h-5 w-5 text-stone-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-warm-900">{inspectionsScheduled}</div>
              <div className="text-xs text-warm-500">Inspections</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Truck className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-warm-900">{deliveriesExpected}</div>
              <div className="text-xs text-warm-500">Deliveries</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-warm-900">{mockJobs.length}</div>
              <div className="text-xs text-warm-500">Active Jobs</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Zap className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-red-600">{criticalPathTasks}</div>
              <div className="text-xs text-warm-500">Critical Path</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", weatherImpactDays > 0 ? "bg-red-100" : "bg-green-100")}>
              <ThermometerSun className={cn("h-5 w-5", weatherImpactDays > 0 ? "text-red-600" : "text-green-600")} />
            </div>
            <div>
              <div className={cn("text-xl font-bold", weatherImpactDays > 0 ? "text-red-600" : "text-warm-900")}>{weatherImpactDays}</div>
              <div className="text-xs text-warm-500">Weather Days</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-stone-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-stone-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-warm-900">{mockTasks.filter(t => t.taskType === 'meeting').length}</div>
              <div className="text-xs text-warm-500">Meetings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Health Bar */}
      <div className="bg-white border-b border-warm-200 px-4 py-2">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-warm-500 font-medium">Schedule Health:</span>
          {mockJobs.map(job => (
            <div key={job.id} className="flex items-center gap-1.5">
              <div className={cn(
                "w-2 h-2 rounded-full",
                job.scheduleHealth === 'on-track' ? 'bg-green-500' :
                job.scheduleHealth === 'at-risk' ? 'bg-amber-500' : 'bg-red-500'
              )} />
              <span className="text-warm-600">{job.name}</span>
              <span className={cn(
                "font-medium",
                job.scheduleHealth === 'on-track' ? 'text-green-600' :
                job.scheduleHealth === 'at-risk' ? 'text-amber-600' : 'text-red-600'
              )}>
                {job.percentComplete}%
              </span>
            </div>
          ))}
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
          <h4 className="font-semibold text-warm-900 ml-2">February 2026</h4>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm text-stone-600 hover:text-stone-700 font-medium">
            Today
          </button>
          <span className="text-warm-300">|</span>
          <button className="text-sm text-warm-600 hover:text-stone-600 flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            2-Week Look-Ahead
          </button>
          <span className="text-warm-300">|</span>
          <button className="text-sm text-warm-600 hover:text-stone-600 flex items-center gap-1">
            <Wind className="h-3.5 w-3.5" />
            Weather Overlay
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-warm-200">
          {weekDays.map(day => (
            <div
              key={day}
              className="text-center py-2 text-sm font-medium text-warm-500 border-r border-warm-100 last:border-r-0"
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
              weather={dayInfo.isCurrentMonth ? weatherByDay[dayInfo.day] : undefined}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white border-t border-warm-200 px-4 py-2">
        <div className="flex items-center gap-6 text-xs text-warm-500">
          <div className="flex items-center gap-1.5">
            <Wrench className="h-3.5 w-3.5 text-stone-600" />
            <span>Work</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ClipboardCheck className="h-3.5 w-3.5 text-stone-600" />
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
          <div className="flex items-center gap-1.5">
            <Flag className="h-3.5 w-3.5 text-stone-600" />
            <span>Milestone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-red-600" />
            <span>Deadline</span>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <Zap className="h-3.5 w-3.5 text-red-500" />
            <span className="text-red-500">Critical Path</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-warm-400" />
            <span className="text-warm-400">Completed dimmed</span>
          </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Schedule Intelligence:</span>
          </div>
          <div className="text-sm text-amber-700 space-y-1">
            <p>
              <span className="font-medium">Weather Impact:</span> Rain forecasted Thu Feb 13 (1.5&quot; precip, 20mph wind). Harbor View concrete pour blocked — reschedule to Mon Feb 17. Coastal Retreat framing unaffected (interior work).
            </p>
            <p>
              <span className="font-medium">Conflict:</span> County Inspector scheduled at Smith (9 AM) and Coastal Retreat (11 AM) on Wed Feb 12. Confirm inspector availability for both.
            </p>
            <p>
              <span className="font-medium">Critical Path:</span> Smith Residence electrical rough-in (critical path) on track. If delayed, project completion shifts by equal days. Jones Plumbing available Feb 18 as scheduled.
            </p>
            <p>
              <span className="font-medium">Overdue:</span> Coastal Retreat permit application deadline passed. Escalate to PM immediately.
            </p>
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <AIFeaturesPanel
        features={[
          {
            feature: 'Conflict Detection',
            insight: 'Identifies scheduling conflicts',
          },
          {
            feature: 'Optimal Timing',
            insight: 'Suggests best times for inspections/meetings',
          },
          {
            feature: 'Travel Optimization',
            insight: 'Groups appointments by location',
          },
          {
            feature: 'Resource Balancing',
            insight: 'Identifies over/under scheduled days',
          },
          {
            feature: 'Weather Awareness',
            insight: 'Flags outdoor activities on bad weather days',
          },
        ]}
      />
    </div>
  )
}
