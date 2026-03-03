import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'
import {
  useDocumentClassifications,
  useDocumentClassification,
  useCreateDocumentClassification,
  useExtractionTemplates,
  useDocumentExtractions,
  useProcessingQueue,
  useProcessingQueueItem,
  useExtractionRules,
} from '@/hooks/use-ai-documents'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockClassifications = [
  { id: '1', document_id: 'd1', classified_type: 'invoice', confidence_score: 0.95 },
  { id: '2', document_id: 'd2', classified_type: 'receipt', confidence_score: 0.87 },
]

describe('use-ai-documents hooks', () => {
  describe('useDocumentClassifications', () => {
    it('fetches classifications list successfully', async () => {
      server.use(
        http.get('/api/v2/ai-documents/classifications', () =>
          HttpResponse.json({ data: mockClassifications, total: 2 })
        )
      )

      const { result } = renderHook(() => useDocumentClassifications(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockClassifications, total: 2 })
    })

    it('handles server errors', async () => {
      server.use(
        http.get('/api/v2/ai-documents/classifications', () =>
          HttpResponse.json({ message: 'Error' }, { status: 500 })
        )
      )

      const { result } = renderHook(() => useDocumentClassifications(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useDocumentClassification', () => {
    it('fetches a single classification by id', async () => {
      server.use(
        http.get('/api/v2/ai-documents/classifications/1', () =>
          HttpResponse.json({ data: mockClassifications[0] })
        )
      )

      const { result } = renderHook(() => useDocumentClassification('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockClassifications[0] })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useDocumentClassification(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateDocumentClassification', () => {
    it('creates a classification via POST', async () => {
      server.use(
        http.post('/api/v2/ai-documents/classifications', () =>
          HttpResponse.json({ data: { id: '3', classified_type: 'contract' } })
        )
      )

      const { result } = renderHook(() => useCreateDocumentClassification(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ document_id: 'd3', classified_type: 'contract' })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useExtractionTemplates', () => {
    it('fetches extraction templates list', async () => {
      server.use(
        http.get('/api/v2/ai-documents/templates', () =>
          HttpResponse.json({ data: [{ id: 't1', name: 'Invoice Template' }], total: 1 })
        )
      )

      const { result } = renderHook(() => useExtractionTemplates(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: [{ id: 't1', name: 'Invoice Template' }], total: 1 })
    })
  })

  describe('useProcessingQueueItem', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useProcessingQueueItem(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})
