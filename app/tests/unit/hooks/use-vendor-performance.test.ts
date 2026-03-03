import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'
import {
  useVendorScores,
  useVendorScore,
  useVendorScoreHistory,
  useVendorJobRatings,
  useVendorJobRating,
  useCreateVendorJobRating,
  useWarrantyCallbacks,
  useWarrantyCallback,
  useVendorNotes,
  useVendorNote,
} from '@/hooks/use-vendor-performance'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockScores = [
  { id: '1', vendor_id: 'v1', overall_score: 92, quality_score: 95 },
  { id: '2', vendor_id: 'v2', overall_score: 78, quality_score: 80 },
]

describe('use-vendor-performance hooks', () => {
  describe('useVendorScores', () => {
    it('fetches vendor scores list successfully', async () => {
      server.use(
        http.get('/api/v2/vendor-performance/scores', () =>
          HttpResponse.json({ data: mockScores, total: 2 })
        )
      )

      const { result } = renderHook(() => useVendorScores(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockScores, total: 2 })
    })

    it('handles server errors', async () => {
      server.use(
        http.get('/api/v2/vendor-performance/scores', () =>
          HttpResponse.json({ message: 'Error' }, { status: 500 })
        )
      )

      const { result } = renderHook(() => useVendorScores(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useVendorScore', () => {
    it('fetches a single vendor score by vendor id', async () => {
      server.use(
        http.get('/api/v2/vendor-performance/scores/v1', () =>
          HttpResponse.json({ data: mockScores[0] })
        )
      )

      const { result } = renderHook(() => useVendorScore('v1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockScores[0] })
    })

    it('does not fetch when vendor id is null', () => {
      const { result } = renderHook(() => useVendorScore(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateVendorJobRating', () => {
    it('creates a job rating via POST', async () => {
      server.use(
        http.post('/api/v2/vendor-performance/job-ratings', () =>
          HttpResponse.json({ data: { id: '3', vendor_id: 'v1', overall_rating: 4 } })
        )
      )

      const { result } = renderHook(() => useCreateVendorJobRating(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ vendor_id: 'v1', job_id: 'j1', overall_rating: 4 })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useVendorScoreHistory', () => {
    it('does not fetch when vendor id is null', () => {
      const { result } = renderHook(() => useVendorScoreHistory(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useWarrantyCallback', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useWarrantyCallback(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})
