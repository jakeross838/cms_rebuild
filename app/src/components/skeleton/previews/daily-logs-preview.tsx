'use client'

import { useState } from 'react'
import {
  Plus,
  Mic,
  Calendar,
  Filter,
  Search,
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
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DailyLog {
  id: string
  date: string
  dayOfWeek: string
  weather: {
    condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy'
    tempHigh: number
    tempLow: number
  }
  crewCount: number
  hoursWorked: number
  workCompleted: string
  photosCount: number
  notes?: string
  aiSummary?: string
}

const mockDailyLogs: DailyLog[] = [
  {
    id: '1',
    date: 'Feb 12, 2026',
    dayOfWeek: 'Thursday',
    weather: { condition: 'sunny', tempHigh: 72, tempLow: 58 },
    crewCount: 8,
    hoursWorked: 64,
    workCompleted: 'Completed roof sheathing on north side. Started window flashing installation. Delivered impact windows to site.',
    photosCount: 12,
    aiSummary: 'Productivity 12% above average for this crew size',
  },
  {
    id: '2',
    date: 'Feb 11, 2026',
    dayOfWeek: 'Wednesday',
    weather: { condition: 'cloudy', tempHigh: 68, tempLow: 55 },
    crewCount: 7,
    hoursWorked: 56,
    workCompleted: 'Continued roof framing. Hip rafters installed. Minor delay due to material delivery.',
    photosCount: 8,
    notes: 'Lumber delivery arrived 2 hours late',
  },
  {
    id: '3',
    date: 'Feb 10, 2026',
    dayOfWeek: 'Tuesday',
    weather: { condition: 'rainy', tempHigh: 65, tempLow: 52 },
    crewCount: 4,
    hoursWorked: 24,
    workCompleted: 'Interior work only due to rain. Installed electrical rough in master bedroom and bath.',
    photosCount: 5,
    notes: 'Heavy rain until noon, worked interior only',
  },
  {
    id: '4',
    date: 'Feb 9, 2026',
    dayOfWeek: 'Monday',
    weather: { condition: 'sunny', tempHigh: 74, tempLow: 60 },
    crewCount: 9,
    hoursWorked: 72,
    workCompleted: 'Roof framing started. Ridge beam set. Rafters cut and staged. ABC Framing crew on site.',
    photosCount: 15,
    aiSummary: 'Best productivity day this week - clear weather and full crew',
  },
  {
    id: '5',
    date: 'Feb 7, 2026',
    dayOfWeek: 'Friday',
    weather: { condition: 'windy', tempHigh: 70, tempLow: 56 },
    crewCount: 6,
    hoursWorked: 42,
    workCompleted: 'Wall framing completed. Prepared for roof framing. Safety stand-down for high winds 2-4pm.',
    photosCount: 10,
    notes: 'Wind gusts 35+ mph, stopped crane work',
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

function DailyLogCard({ log }: { log: DailyLog }) {
  const WeatherIcon = weatherIcons[log.weather.condition]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
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
          </div>

          {/* Work Summary */}
          <div className="flex-1">
            <p className="text-sm text-gray-700 line-clamp-2">{log.workCompleted}</p>
            {log.notes && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {log.notes}
              </p>
            )}
            {log.aiSummary && (
              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {log.aiSummary}
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
          <span className="font-medium">{log.crewCount}</span>
          <span className="text-gray-400">crew</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{log.hoursWorked}</span>
          <span className="text-gray-400">hours</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Camera className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{log.photosCount}</span>
          <span className="text-gray-400">photos</span>
        </div>
      </div>
    </div>
  )
}

export function DailyLogsPreview() {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('week')
  const [isRecording, setIsRecording] = useState(false)

  const totalHours = mockDailyLogs.reduce((sum, log) => sum + log.hoursWorked, 0)
  const totalPhotos = mockDailyLogs.reduce((sum, log) => sum + log.photosCount, 0)
  const avgCrew = Math.round(mockDailyLogs.reduce((sum, log) => sum + log.crewCount, 0) / mockDailyLogs.length)

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Daily Logs - Smith Residence</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">5 entries this week</span>
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
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Calendar className="h-4 w-4" />
              Date Range
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              New Entry
            </button>
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
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Thermometer className="h-4 w-4" />
            <span>72°F</span>
            <Sun className="h-4 w-4 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDateRange('week')}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors",
              dateRange === 'week'
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            This Week
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors",
              dateRange === 'month'
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            This Month
          </button>
          <button
            onClick={() => setDateRange('all')}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors",
              dateRange === 'all'
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            All Logs
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Timeline / Log List */}
      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        {mockDailyLogs.map(log => (
          <DailyLogCard key={log.id} log={log} />
        ))}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insight:</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-amber-700">
            <span>Crew productivity 15% higher on clear days</span>
            <span className="text-amber-400">|</span>
            <span>Rain delays averaged 4.2 hours this month</span>
            <span className="text-amber-400">|</span>
            <span>ABC Framing crew most productive (8.5 hrs/person)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
