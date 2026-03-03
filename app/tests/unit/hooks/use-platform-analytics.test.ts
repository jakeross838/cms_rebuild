import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'
import {
  usePlatformMetrics,
  usePlatformMetric,
  useCreatePlatformMetric,
  useHealthScores,
  useHealthScore,
  useFeatureUsageEvents,
  useExperiments,
  useExperiment,
  useReleases,
} from '@/hooks/use-platform-analytics'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockMetrics = [
  { id: '1', metric_type: 'active_users', metric_value: 1500, period: 'daily' },
  { id: '2', metric_type: 'revenue', metric_value: 50000, period: 'monthly' },
]

describe('use-platform-analytics hooks', () => {
  describe('usePlatformMetrics', () => {
    it('fetches platform metrics list successfully', async () => {
      server.use(
        http.get('/api/v2/analytics/metrics', () =>
          HttpResponse.json({ data: mockMetrics, total: 2 })
        )
      )

      const { result } = renderHook(() => usePlatformMetrics(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockMetrics, total: 2 })
    })

    it('handles server errors', async () => {
      server.use(
        http.get('/api/v2/analytics/metrics', () =>
          HttpResponse.json({ message: 'Error' }, { status: 500 })
        )
      )

      const { result } = renderHook(() => usePlatformMetrics(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('usePlatformMetric', () => {
    it('fetches a single metric by id', async () => {
      server.use(
        http.get('/api/v2/analytics/metrics/1', () =>
          HttpResponse.json({ data: mockMetrics[0] })
        )
      )

      const { result } = renderHook(() => usePlatformMetric('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockMetrics[0] })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => usePlatformMetric(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreatePlatformMetric', () => {
    it('creates a metric via POST', async () => {
      server.use(
        http.post('/api/v2/analytics/metrics', () =>
          HttpResponse.json({ data: { id: '3', metric_type: 'signups' } })
        )
      )

      const { result } = renderHook(() => useCreatePlatformMetric(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ metric_type: 'signups', metric_value: 42, snapshot_date: '2026-03-01' })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useExperiment', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useExperiment(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useFeatureUsageEvents', () => {
    it('fetches feature usage events list', async () => {
      server.use(
        http.get('/api/v2/analytics/events', () =>
          HttpResponse.json({ data: [{ id: 'e1', feature_key: 'search', event_type: 'click' }], total: 1 })
        )
      )

      const { result } = renderHook(() => useFeatureUsageEvents(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })
})
