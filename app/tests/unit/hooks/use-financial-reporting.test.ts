import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'
import {
  useReportDefinitions,
  useReportDefinition,
  useCreateReportDefinition,
  useGenerateReport,
  useReportSnapshots,
  useReportSnapshot,
  useReportSchedules,
  useFinancialPeriods,
  useFinancialPeriod,
} from '@/hooks/use-financial-reporting'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockDefinitions = [
  { id: '1', name: 'Profit & Loss', report_type: 'pnl', is_active: true },
  { id: '2', name: 'Cash Flow', report_type: 'cash_flow', is_active: true },
]

describe('use-financial-reporting hooks', () => {
  describe('useReportDefinitions', () => {
    it('fetches report definitions list successfully', async () => {
      server.use(
        http.get('/api/v2/reports/definitions', () =>
          HttpResponse.json({ data: mockDefinitions, total: 2 })
        )
      )

      const { result } = renderHook(() => useReportDefinitions(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockDefinitions, total: 2 })
    })

    it('handles server errors', async () => {
      server.use(
        http.get('/api/v2/reports/definitions', () =>
          HttpResponse.json({ message: 'Error' }, { status: 500 })
        )
      )

      const { result } = renderHook(() => useReportDefinitions(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useReportDefinition', () => {
    it('fetches a single report definition by id', async () => {
      server.use(
        http.get('/api/v2/reports/definitions/1', () =>
          HttpResponse.json({ data: mockDefinitions[0] })
        )
      )

      const { result } = renderHook(() => useReportDefinition('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockDefinitions[0] })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useReportDefinition(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateReportDefinition', () => {
    it('creates a report definition via POST', async () => {
      server.use(
        http.post('/api/v2/reports/definitions', () =>
          HttpResponse.json({ data: { id: '3', name: 'WIP Report' } })
        )
      )

      const { result } = renderHook(() => useCreateReportDefinition(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ name: 'WIP Report', report_type: 'wip' })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useReportSnapshot', () => {
    it('does not fetch when snapshot id is null', () => {
      const { result } = renderHook(() => useReportSnapshot(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useFinancialPeriod', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useFinancialPeriod(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})
