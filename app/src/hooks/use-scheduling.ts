'use client'

/**
 * Module 07: Scheduling & Calendar React Query Hooks
 *
 * Provides typed hooks for schedule tasks, dependencies, baselines, and weather records.
 */

import { createApiHooks } from '@/hooks/use-api'
import type { ScheduleTask, ScheduleDependency, ScheduleBaseline, WeatherRecord } from '@/types/scheduling'

// ── Schedule Tasks ──────────────────────────────────────────────────────

type TaskListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  parent_task_id?: string
  phase?: string
  trade?: string
  q?: string
}

type TaskCreateInput = {
  name: string
  job_id: string
  parent_task_id?: string | null
  description?: string | null
  phase?: string | null
  trade?: string | null
  task_type?: string
  planned_start?: string | null
  planned_end?: string | null
  actual_start?: string | null
  actual_end?: string | null
  duration_days?: number | null
  progress_pct?: number
  status?: string
  assigned_to?: string | null
  assigned_vendor_id?: string | null
  is_critical_path?: boolean
  total_float?: number | null
  sort_order?: number
  notes?: string | null
}

const taskHooks = createApiHooks<TaskListParams, TaskCreateInput>(
  'schedule-tasks',
  '/api/v1/schedule-tasks'
)

export const useScheduleTasks = taskHooks.useList
export const useScheduleTask = taskHooks.useDetail
export const useCreateScheduleTask = taskHooks.useCreate
export const useUpdateScheduleTask = taskHooks.useUpdate
export const useDeleteScheduleTask = taskHooks.useDelete

// ── Schedule Dependencies ───────────────────────────────────────────────

type DependencyListParams = {
  job_id?: string
}

type DependencyCreateInput = {
  predecessor_id: string
  successor_id: string
  dependency_type?: string
  lag_days?: number
}

const depHooks = createApiHooks<DependencyListParams, DependencyCreateInput>(
  'schedule-dependencies',
  '/api/v1/schedule-dependencies'
)

export const useScheduleDependencies = depHooks.useList
export const useScheduleDependency = depHooks.useDetail
export const useCreateScheduleDependency = depHooks.useCreate
export const useDeleteScheduleDependency = depHooks.useDelete

// ── Schedule Baselines ──────────────────────────────────────────────────

type BaselineListParams = {
  page?: number
  limit?: number
  job_id?: string
}

type BaselineCreateInput = {
  job_id: string
  name: string
  snapshot_date?: string
  baseline_data?: Record<string, unknown>
}

const baselineHooks = createApiHooks<BaselineListParams, BaselineCreateInput>(
  'schedule-baselines',
  '/api/v1/schedule-baselines'
)

export const useScheduleBaselines = baselineHooks.useList
export const useScheduleBaseline = baselineHooks.useDetail
export const useCreateScheduleBaseline = baselineHooks.useCreate
export const useDeleteScheduleBaseline = baselineHooks.useDelete

// ── Weather Records ─────────────────────────────────────────────────────

type WeatherListParams = {
  page?: number
  limit?: number
  job_id?: string
  start_date?: string
  end_date?: string
}

type WeatherCreateInput = {
  job_id: string
  record_date: string
  high_temp?: number | null
  low_temp?: number | null
  conditions?: string | null
  precipitation_inches?: number | null
  wind_mph?: number | null
  is_work_day?: boolean
  notes?: string | null
}

const weatherHooks = createApiHooks<WeatherListParams, WeatherCreateInput>(
  'weather-records',
  '/api/v1/weather-records'
)

export const useWeatherRecords = weatherHooks.useList
export const useWeatherRecord = weatherHooks.useDetail
export const useCreateWeatherRecord = weatherHooks.useCreate
export const useUpdateWeatherRecord = weatherHooks.useUpdate
export const useDeleteWeatherRecord = weatherHooks.useDelete

// ── Re-export types for convenience ─────────────────────────────────────

export type { ScheduleTask, ScheduleDependency, ScheduleBaseline, WeatherRecord }
