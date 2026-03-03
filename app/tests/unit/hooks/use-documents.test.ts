import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

import {
  useDocuments,
  useDocument,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
} from '@/hooks/use-documents'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockDocument = {
  id: 'doc-1',
  job_id: 'job-1',
  file_name: 'blueprint-v2.pdf',
  file_type: 'application/pdf',
  file_size: 2048000,
  storage_path: '/uploads/job-1/blueprint-v2.pdf',
  folder: 'Blueprints',
  description: 'Updated foundation blueprint',
  uploaded_by: 'user-1',
  tags: 'blueprint,foundation',
  created_at: '2026-01-20T08:30:00.000Z',
}

describe('use-documents', () => {
  describe('useDocuments (useList)', () => {
    it('fetches a list of documents', async () => {
      server.use(
        http.get('/api/v2/documents', () => {
          return HttpResponse.json({
            data: [mockDocument],
            total: 1,
          })
        })
      )

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockDocument],
        total: 1,
      })
    })

    it('handles server error gracefully', async () => {
      server.use(
        http.get('/api/v2/documents', () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          )
        })
      )

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeDefined()
    })
  })

  describe('useDocument (useDetail)', () => {
    it('fetches a single document by id', async () => {
      server.use(
        http.get('/api/v2/documents/doc-1', () => {
          return HttpResponse.json({ data: mockDocument })
        })
      )

      const { result } = renderHook(() => useDocument('doc-1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({ data: mockDocument })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useDocument(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateDocument (useCreate)', () => {
    it('creates a document via POST', async () => {
      server.use(
        http.post('/api/v2/documents', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>
          return HttpResponse.json({
            data: { id: 'doc-new', ...body },
          })
        })
      )

      const { result } = renderHook(() => useCreateDocument(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        file_name: 'invoice-123.pdf',
        job_id: 'job-1',
        folder: 'Invoices',
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toMatchObject({
        data: {
          id: 'doc-new',
          file_name: 'invoice-123.pdf',
        },
      })
    })
  })
})
