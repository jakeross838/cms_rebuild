import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

import {
  useScheduleTasks,
  useScheduleTask,
  useCreateScheduleTask,
  useScheduleDependencies,
  useScheduleDependency,
  useCreateScheduleDependency,
  useScheduleBaselines,
  useScheduleBaseline,
  useCreateScheduleBaseline,
  useWeatherRecords,
  useWeatherRecord,
  useCreateWeatherRecord,
} from '@/hooks/use-scheduling'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockTask = {
  id: 'task-1',
  name: 'Foundation Pour',
  job_id: 'job-1',
  phase: 'foundation',
  trade: 'concrete',
  task_type: 'task',
  planned_start: '2026-02-01',
  planned_end: '2026-02-05',
  status: 'in_progress',
  progress_pct: 40,
  is_critical_path: true,
  sort_order: 1,
  created_at: '2026-01-15T10:00:00.000Z',
}

const mockDependency = {
  id: 'dep-1',
  predecessor_id: 'task-1',
  successor_id: 'task-2',
  dependency_type: 'finish_to_start',
  lag_days: 0,
}

const mockBaseline = {
  id: 'bl-1',
  job_id: 'job-1',
  name: 'Original Schedule',
  snapshot_date: '2026-01-10',
  baseline_data: {},
  created_at: '2026-01-10T08:00:00.000Z',
}

const mockWeather = {
  id: 'wx-1',
  job_id: 'job-1',
  record_date: '2026-02-01',
  high_temp: 65,
  low_temp: 42,
  conditions: 'partly_cloudy',
  precipitation_inches: 0,
  wind_mph: 10,
  is_work_day: true,
  notes: null,
}

describe('use-scheduling', () => {
  // ── Schedule Tasks ─────────────────────────────────────────────────────

  describe('useScheduleTasks (useList)', () => {
    it('fetches a list of schedule tasks', async () => {
      server.use(
        http.get('/api/v1/schedule-tasks', () => {
          return HttpResponse.json({
            data: [mockTask],
            total: 1,
          })
        })
      )

      const { result } = renderHook(() => useScheduleTasks(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockTask],
        total: 1,
      })
    })

    it('handles server error gracefully', async () => {
      server.use(
        http.get('/api/v1/schedule-tasks', () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          )
        })
      )

      const { result } = renderHook(() => useScheduleTasks(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeDefined()
    })
  })

  describe('useScheduleTask (useDetail)', () => {
    it('fetches a single task by id', async () => {
      server.use(
        http.get('/api/v1/schedule-tasks/task-1', () => {
          return HttpResponse.json({ data: mockTask })
        })
      )

      const { result } = renderHook(() => useScheduleTask('task-1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({ data: mockTask })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useScheduleTask(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateScheduleTask (useCreate)', () => {
    it('creates a task via POST', async () => {
      server.use(
        http.post('/api/v1/schedule-tasks', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>
          return HttpResponse.json({
            data: { id: 'task-new', ...body },
          })
        })
      )

      const { result } = renderHook(() => useCreateScheduleTask(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        name: 'Framing',
        job_id: 'job-1',
        phase: 'framing',
        trade: 'carpentry',
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toMatchObject({
        data: {
          id: 'task-new',
          name: 'Framing',
        },
      })
    })
  })

  // ── Schedule Dependencies ──────────────────────────────────────────────

  describe('useScheduleDependencies (useList)', () => {
    it('fetches a list of dependencies', async () => {
      server.use(
        http.get('/api/v1/schedule-dependencies', () => {
          return HttpResponse.json({
            data: [mockDependency],
            total: 1,
          })
        })
      )

      const { result } = renderHook(() => useScheduleDependencies(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockDependency],
        total: 1,
      })
    })
  })

  describe('useScheduleDependency (useDetail)', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useScheduleDependency(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateScheduleDependency (useCreate)', () => {
    it('creates a dependency via POST', async () => {
      server.use(
        http.post('/api/v1/schedule-dependencies', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>
          return HttpResponse.json({
            data: { id: 'dep-new', ...body },
          })
        })
      )

      const { result } = renderHook(() => useCreateScheduleDependency(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        predecessor_id: 'task-1',
        successor_id: 'task-3',
        dependency_type: 'finish_to_start',
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toMatchObject({
        data: {
          id: 'dep-new',
          predecessor_id: 'task-1',
        },
      })
    })
  })

  // ── Schedule Baselines ─────────────────────────────────────────────────

  describe('useScheduleBaselines (useList)', () => {
    it('fetches a list of baselines', async () => {
      server.use(
        http.get('/api/v1/schedule-baselines', () => {
          return HttpResponse.json({
            data: [mockBaseline],
            total: 1,
          })
        })
      )

      const { result } = renderHook(() => useScheduleBaselines(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockBaseline],
        total: 1,
      })
    })
  })

  describe('useScheduleBaseline (useDetail)', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useScheduleBaseline(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  // ── Weather Records ────────────────────────────────────────────────────

  describe('useWeatherRecords (useList)', () => {
    it('fetches a list of weather records', async () => {
      server.use(
        http.get('/api/v1/weather-records', () => {
          return HttpResponse.json({
            data: [mockWeather],
            total: 1,
          })
        })
      )

      const { result } = renderHook(() => useWeatherRecords(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockWeather],
        total: 1,
      })
    })
  })

  describe('useWeatherRecord (useDetail)', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useWeatherRecord(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateWeatherRecord (useCreate)', () => {
    it('creates a weather record via POST', async () => {
      server.use(
        http.post('/api/v1/weather-records', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>
          return HttpResponse.json({
            data: { id: 'wx-new', ...body },
          })
        })
      )

      const { result } = renderHook(() => useCreateWeatherRecord(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        job_id: 'job-1',
        record_date: '2026-02-02',
        high_temp: 70,
        low_temp: 45,
        conditions: 'sunny',
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toMatchObject({
        data: {
          id: 'wx-new',
          conditions: 'sunny',
        },
      })
    })
  })
})
