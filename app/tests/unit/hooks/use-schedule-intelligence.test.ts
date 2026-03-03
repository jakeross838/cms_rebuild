import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'
import {
  useSchedulePredictions,
  useSchedulePrediction,
  useCreateSchedulePrediction,
  useScheduleWeatherEvents,
  useScheduleWeatherEvent,
  useScheduleRiskScores,
  useScheduleScenarios,
  useScheduleScenario,
  useWeatherForecast,
} from '@/hooks/use-schedule-intelligence'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockPredictions = [
  { id: '1', job_id: 'j1', prediction_type: 'completion_date', confidence_score: 0.85 },
  { id: '2', job_id: 'j2', prediction_type: 'delay_risk', confidence_score: 0.72 },
]

describe('use-schedule-intelligence hooks', () => {
  describe('useSchedulePredictions', () => {
    it('fetches predictions list successfully', async () => {
      server.use(
        http.get('/api/v2/schedule-intelligence/predictions', () =>
          HttpResponse.json({ data: mockPredictions, total: 2 })
        )
      )

      const { result } = renderHook(() => useSchedulePredictions(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockPredictions, total: 2 })
    })

    it('handles server errors', async () => {
      server.use(
        http.get('/api/v2/schedule-intelligence/predictions', () =>
          HttpResponse.json({ message: 'Error' }, { status: 500 })
        )
      )

      const { result } = renderHook(() => useSchedulePredictions(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useSchedulePrediction', () => {
    it('fetches a single prediction by id', async () => {
      server.use(
        http.get('/api/v2/schedule-intelligence/predictions/1', () =>
          HttpResponse.json({ data: mockPredictions[0] })
        )
      )

      const { result } = renderHook(() => useSchedulePrediction('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockPredictions[0] })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useSchedulePrediction(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateSchedulePrediction', () => {
    it('creates a prediction via POST', async () => {
      server.use(
        http.post('/api/v2/schedule-intelligence/predictions', () =>
          HttpResponse.json({ data: { id: '3', prediction_type: 'cost_overrun' } })
        )
      )

      const { result } = renderHook(() => useCreateSchedulePrediction(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({
          job_id: 'j1',
          prediction_type: 'cost_overrun',
          predicted_value: { amount: 5000 },
        })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useScheduleWeatherEvent', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useScheduleWeatherEvent(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useWeatherForecast', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useWeatherForecast(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})
