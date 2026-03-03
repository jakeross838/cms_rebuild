import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'
import {
  useInvoiceExtractions,
  useInvoiceExtraction,
  useCreateInvoiceExtraction,
  useReviewExtraction,
  useExtractionRules,
  useExtractionRule,
} from '@/hooks/use-invoice-processing'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockExtractions = [
  { id: '1', document_id: 'd1', status: 'pending_review', vendor_match_id: 'v1' },
  { id: '2', document_id: 'd2', status: 'approved', vendor_match_id: 'v2' },
]

describe('use-invoice-processing hooks', () => {
  describe('useInvoiceExtractions', () => {
    it('fetches extraction list successfully', async () => {
      server.use(
        http.get('/api/v2/invoice-extractions', () =>
          HttpResponse.json({ data: mockExtractions, total: 2 })
        )
      )

      const { result } = renderHook(() => useInvoiceExtractions(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockExtractions, total: 2 })
    })

    it('handles server errors', async () => {
      server.use(
        http.get('/api/v2/invoice-extractions', () =>
          HttpResponse.json({ message: 'Error' }, { status: 500 })
        )
      )

      const { result } = renderHook(() => useInvoiceExtractions(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useInvoiceExtraction', () => {
    it('fetches a single extraction by id', async () => {
      server.use(
        http.get('/api/v2/invoice-extractions/1', () =>
          HttpResponse.json({ data: mockExtractions[0] })
        )
      )

      const { result } = renderHook(() => useInvoiceExtraction('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockExtractions[0] })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useInvoiceExtraction(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateInvoiceExtraction', () => {
    it('creates an extraction via POST', async () => {
      server.use(
        http.post('/api/v2/invoice-extractions', () =>
          HttpResponse.json({ data: { id: '3', document_id: 'd3' } })
        )
      )

      const { result } = renderHook(() => useCreateInvoiceExtraction(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ document_id: 'd3' })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useReviewExtraction', () => {
    it('submits a review decision via POST', async () => {
      server.use(
        http.post('/api/v2/invoice-extractions/1/review', () =>
          HttpResponse.json({ data: { status: 'approved' } })
        )
      )

      const { result } = renderHook(() => useReviewExtraction('1'), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ decision: 'approve' as never, notes: 'Looks good' })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useExtractionRule', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useExtractionRule(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})
