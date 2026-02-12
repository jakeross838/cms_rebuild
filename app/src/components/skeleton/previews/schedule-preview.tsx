'use client'

import { useState } from 'react'
import {
  Plus,
  Download,
  Calendar,
  List,
  ChevronRight,
  Cloud,
  CloudRain,
  Sun,
  Waves,
  Sparkles,
  AlertTriangle,
  User,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScheduleTask {
  id: string
  name: string
  phase: string
  startWeek: number
  duration: number
  percentComplete: number
  isMilestone?: boolean
  isOutdoor?: boolean
  isTideSensitive?: boolean
  isCriticalPath?: boolean
  vendor?: string
  leadTime?: number
  aiNote?: string
  weatherRisk?: boolean
}

const mockTasks: ScheduleTask[] = [
  { id: '1', name: 'Excavation', phase: 'Foundation', startWeek: 1, duration: 1, percentComplete: 100, isOutdoor: true },
  { id: '2', name: 'Pilings', phase: 'Foundation', startWeek: 2, duration: 2, percentComplete: 100, isTideSensitive: true, aiNote: 'Requires low tide windows' },
  { id: '3', name: 'Grade Beams', phase: 'Foundation', startWeek: 4, duration: 1, percentComplete: 75 },
  { id: 'm1', name: 'Foundation Complete', phase: 'Foundation', startWeek: 5, duration: 0, percentComplete: 0, isMilestone: true },
  { id: '4', name: 'Floor System', phase: 'Framing', startWeek: 5, duration: 1, percentComplete: 50, isCriticalPath: true },
  { id: '5', name: 'Wall Framing', phase: 'Framing', startWeek: 6, duration: 2, percentComplete: 25, vendor: 'ABC Framing', isCriticalPath: true, aiNote: 'ABC typically +2 days on coastal' },
  { id: '6', name: 'Roof Framing', phase: 'Framing', startWeek: 8, duration: 3, percentComplete: 0, vendor: 'ABC Framing', isCriticalPath: true, aiNote: 'Complex hip roof - AI suggests 18 days' },
  { id: 'm2', name: 'Dried In', phase: 'Framing', startWeek: 11, duration: 0, percentComplete: 0, isMilestone: true },
  { id: '7', name: 'Impact Windows', phase: 'Exterior', startWeek: 1, duration: 10, percentComplete: 0, leadTime: 10, vendor: 'PGT', aiNote: '16-week lead time - ordered' },
  { id: '8', name: 'Electrical Rough', phase: 'MEP Rough', startWeek: 11, duration: 2, percentComplete: 0, vendor: 'Smith Electric', weatherRisk: true },
  { id: '9', name: 'Plumbing Rough', phase: 'MEP Rough', startWeek: 11, duration: 2, percentComplete: 0, vendor: 'Jones Plumbing' },
  { id: '10', name: 'HVAC Rough', phase: 'MEP Rough', startWeek: 12, duration: 1, percentComplete: 0, vendor: 'Cool Air HVAC' },
]

const weeks = ['Nov 4', 'Nov 11', 'Nov 18', 'Nov 25', 'Dec 2', 'Dec 9', 'Dec 16', 'Dec 23', 'Dec 30', 'Jan 6', 'Jan 13', 'Jan 20']
const weatherData = [
  { icon: Sun, temp: '72°' },
  { icon: Sun, temp: '70°' },
  { icon: Cloud, temp: '68°' },
  { icon: CloudRain, temp: '65°' },
  { icon: CloudRain, temp: '63°' },
  { icon: Sun, temp: '67°' },
  { icon: Sun, temp: '70°' },
  { icon: Cloud, temp: '68°' },
  { icon: Sun, temp: '72°' },
  { icon: Sun, temp: '74°' },
  { icon: Cloud, temp: '71°' },
  { icon: Sun, temp: '73°' },
]

function GanttBar({ task, totalWeeks }: { task: ScheduleTask; totalWeeks: number }) {
  if (task.isMilestone) {
    const position = ((task.startWeek - 0.5) / totalWeeks) * 100
    return (
      <div className="relative h-6">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-purple-500 transform rotate-45"
          style={{ left: `${position}%`, marginLeft: '-8px' }}
        />
      </div>
    )
  }

  const startPercent = ((task.startWeek - 1) / totalWeeks) * 100
  const widthPercent = (task.duration / totalWeeks) * 100
  const progressWidth = (task.percentComplete / 100) * widthPercent

  return (
    <div className="relative h-6">
      {task.leadTime && (
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2 bg-gray-200 rounded"
          style={{
            left: `${startPercent}%`,
            width: `${(task.leadTime / totalWeeks) * 100}%`
          }}
        />
      )}
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 h-5 rounded",
          task.isCriticalPath ? "bg-red-200" : "bg-blue-200",
          task.leadTime && "mt-1"
        )}
        style={{
          left: `${startPercent}%`,
          width: `${widthPercent}%`
        }}
      >
        <div
          className={cn(
            "h-full rounded-l",
            task.isCriticalPath ? "bg-red-500" : "bg-blue-500"
          )}
          style={{ width: `${task.percentComplete}%` }}
        />
      </div>
      {task.weatherRisk && (
        <div
          className="absolute top-1/2 -translate-y-1/2 -mt-3"
          style={{ left: `${startPercent + widthPercent / 2}%` }}
        >
          <CloudRain className="h-4 w-4 text-amber-500" />
        </div>
      )}
      {task.isTideSensitive && (
        <div
          className="absolute top-1/2 -translate-y-1/2 -mt-3"
          style={{ left: `${startPercent + widthPercent / 2}%` }}
        >
          <Waves className="h-4 w-4 text-cyan-500" />
        </div>
      )}
    </div>
  )
}

export function SchedulePreview() {
  const [viewMode, setViewMode] = useState<'gantt' | 'list'>('gantt')
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['Foundation', 'Framing', 'MEP Rough']))

  const phases = [...new Set(mockTasks.map(t => t.phase))]

  const togglePhase = (phase: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev)
      if (next.has(phase)) {
        next.delete(phase)
      } else {
        next.add(phase)
      }
      return next
    })
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Schedule - Smith Residence</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">In Progress</span>
            </div>
            <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Predicted: Mar 15 (85% confidence)
              </span>
              <span className="flex items-center gap-1 text-amber-600">
                <CloudRain className="h-4 w-4" />
                Rain forecast Thu-Fri
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('gantt')}
                className={cn(
                  "p-2",
                  viewMode === 'gantt' ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"
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
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Weather Strip */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex">
          <div className="w-48 flex-shrink-0" />
          <div className="flex-1 grid grid-cols-12 gap-1">
            {weatherData.map((day, i) => (
              <div key={i} className={cn(
                "text-center py-1 rounded",
                day.icon === CloudRain && "bg-amber-50"
              )}>
                <day.icon className={cn(
                  "h-4 w-4 mx-auto",
                  day.icon === Sun ? "text-yellow-500" :
                  day.icon === CloudRain ? "text-amber-500" : "text-gray-400"
                )} />
                <div className="text-xs text-gray-500">{day.temp}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="overflow-x-auto">
        {/* Week Headers */}
        <div className="flex border-b border-gray-200 bg-gray-100 sticky top-0">
          <div className="w-48 flex-shrink-0 px-4 py-2 font-medium text-gray-600 text-sm">Task</div>
          <div className="flex-1 grid grid-cols-12">
            {weeks.map((week, i) => (
              <div key={i} className="text-center py-2 text-xs text-gray-500 border-l border-gray-200">
                {week}
              </div>
            ))}
          </div>
        </div>

        {/* Task Rows */}
        <div className="bg-white">
          {phases.map(phase => {
            const phaseTasks = mockTasks.filter(t => t.phase === phase)
            const isExpanded = expandedPhases.has(phase)

            return (
              <div key={phase}>
                {/* Phase Header */}
                <div
                  className="flex items-center border-b border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100"
                  onClick={() => togglePhase(phase)}
                >
                  <div className="w-48 flex-shrink-0 px-4 py-2 flex items-center gap-2">
                    <ChevronRight className={cn("h-4 w-4 text-gray-400 transition-transform", isExpanded && "rotate-90")} />
                    <span className="font-medium text-gray-900">{phase}</span>
                    <span className="text-xs text-gray-400">({phaseTasks.length})</span>
                  </div>
                  <div className="flex-1 h-8 relative">
                    {/* Phase summary bar could go here */}
                  </div>
                </div>

                {/* Tasks */}
                {isExpanded && phaseTasks.map(task => (
                  <div key={task.id} className="flex items-center border-b border-gray-100 hover:bg-blue-50">
                    <div className="w-48 flex-shrink-0 px-4 py-2 pl-10">
                      <div className="flex items-center gap-2">
                        {task.isMilestone ? (
                          <span className="text-purple-600 font-medium text-sm">◆ {task.name}</span>
                        ) : (
                          <span className="text-sm text-gray-700">{task.name}</span>
                        )}
                        {task.isCriticalPath && !task.isMilestone && (
                          <span className="text-xs bg-red-100 text-red-700 px-1 rounded">Critical</span>
                        )}
                      </div>
                      {task.vendor && (
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <User className="h-3 w-3" />
                          {task.vendor}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 px-2 py-1 relative">
                      <div className="grid grid-cols-12 h-6 relative">
                        {/* Grid lines */}
                        {weeks.map((_, i) => (
                          <div key={i} className="border-l border-gray-100 h-full" />
                        ))}
                        {/* Gantt bar */}
                        <div className="absolute inset-0">
                          <GanttBar task={task} totalWeeks={12} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 bg-blue-500 rounded" />
            <span>Complete</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 bg-blue-200 rounded" />
            <span>Remaining</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 bg-red-500 rounded" />
            <span>Critical Path</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-purple-500 transform rotate-45" />
            <span>Milestone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-2 bg-gray-200 rounded" />
            <span>Lead Time</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Waves className="h-4 w-4 text-cyan-500" />
            <span>Tide Required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CloudRain className="h-4 w-4 text-amber-500" />
            <span>Weather Risk</span>
          </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insight:</span>
          </div>
          <p className="text-sm text-amber-700">
            Moving HVAC rough before electrical rough saves 3 days on critical path. No resource conflicts detected.
            ABC Framing typically runs +2 days on coastal elevated homes—schedule adjusted.
          </p>
        </div>
      </div>
    </div>
  )
}
