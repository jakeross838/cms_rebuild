import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'
import {
  useAdvancedReports,
  useAdvancedReport,
  useCreateAdvancedReport,
  useGenerateReport,
} from '@/hooks/use-advanced-reporting'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockReports = [
  { id: '1', name: 'Monthly P&L', report_type: 'financial', status: 'active' },
  { id: '2', name: 'Job Cost Summary', report_type: 'project', status: 'draft' },
]

describe('use-advanced-reporting hooks', () => {
  describe('useAdvancedReports', () => {
    it('fetches reports list successfully', async () => {
      server.use(
        http.get('/api/v2/advanced-reports', () =>
          HttpResponse.json({ data: mockReports, total: 2 })
        )
      )

      const { result } = renderHook(() => useAdvancedReports(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockReports, total: 2 })
    })

    it('handles server errors', async () => {
      server.use(
        http.get('/api/v2/advanced-reports', () =>
          HttpResponse.json({ message: 'Server error' }, { status: 500 })
        )
      )

      const { result } = renderHook(() => useAdvancedReports(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useAdvancedReport', () => {
    it('fetches a single report by id', async () => {
      server.use(
        http.get('/api/v2/advanced-reports/1', () =>
          HttpResponse.json({ data: mockReports[0] })
        )
      )

      const { result } = renderHook(() => useAdvancedReport('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockReports[0] })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useAdvancedReport(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateAdvancedReport', () => {
    it('creates a report via POST', async () => {
      server.use(
        http.post('/api/v2/advanced-reports', () =>
          HttpResponse.json({ data: { id: '3', name: 'New Report' } })
        )
      )

      const { result } = renderHook(() => useCreateAdvancedReport(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ name: 'New Report' })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useGenerateReport', () => {
    it('generates a report via POST', async () => {
      server.use(
        http.post('/api/v2/reports/definitions/1/generate', () =>
          HttpResponse.json({ data: { snapshot_id: 's1' } })
        )
      )

      const { result } = renderHook(() => useGenerateReport('1'), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ period: 'monthly' })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })
})
