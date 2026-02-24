/**
 * Module 07: Scheduling & Calendar Types
 */

// ── Status & Enum Types ──────────────────────────────────────────────────

export type ScheduleTaskStatus = 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'on_hold'

export type ScheduleTaskType = 'task' | 'milestone' | 'summary'

export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF'

export type WeatherCondition =
  | 'sunny'
  | 'partly_cloudy'
  | 'cloudy'
  | 'rain'
  | 'heavy_rain'
  | 'thunderstorm'
  | 'snow'
  | 'ice'
  | 'fog'
  | 'windy'
  | 'extreme_heat'
  | 'extreme_cold'

// ── Interfaces ───────────────────────────────────────────────────────────

export interface ScheduleTask {
  id: string
  company_id: string
  job_id: string
  parent_task_id: string | null
  name: string
  description: string | null
  phase: string | null
  trade: string | null
  task_type: ScheduleTaskType
  planned_start: string | null
  planned_end: string | null
  actual_start: string | null
  actual_end: string | null
  duration_days: number | null
  progress_pct: number
  status: ScheduleTaskStatus
  assigned_to: string | null
  assigned_vendor_id: string | null
  is_critical_path: boolean
  total_float: number | null
  sort_order: number
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ScheduleDependency {
  id: string
  predecessor_id: string
  successor_id: string
  dependency_type: DependencyType
  lag_days: number
  created_at: string
}

export interface ScheduleBaseline {
  id: string
  company_id: string
  job_id: string
  name: string
  snapshot_date: string
  baseline_data: Record<string, unknown>
  created_by: string | null
  created_at: string
}

export interface WeatherRecord {
  id: string
  company_id: string
  job_id: string
  record_date: string
  high_temp: number | null
  low_temp: number | null
  conditions: string | null
  precipitation_inches: number | null
  wind_mph: number | null
  is_work_day: boolean
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// ── Constants ────────────────────────────────────────────────────────────

/** Task status options with display labels */
export const TASK_STATUSES: { value: ScheduleTaskStatus; label: string }[] = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'on_hold', label: 'On Hold' },
]

/** Task type options with display labels */
export const TASK_TYPES: { value: ScheduleTaskType; label: string }[] = [
  { value: 'task', label: 'Task' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'summary', label: 'Summary' },
]

/** Dependency type options with display labels */
export const DEPENDENCY_TYPES: { value: DependencyType; label: string }[] = [
  { value: 'FS', label: 'Finish-to-Start' },
  { value: 'SS', label: 'Start-to-Start' },
  { value: 'FF', label: 'Finish-to-Finish' },
  { value: 'SF', label: 'Start-to-Finish' },
]

/** Common weather conditions for manual entry */
export const WEATHER_CONDITIONS: string[] = [
  'sunny',
  'partly_cloudy',
  'cloudy',
  'rain',
  'heavy_rain',
  'thunderstorm',
  'snow',
  'ice',
  'fog',
  'windy',
  'extreme_heat',
  'extreme_cold',
]
