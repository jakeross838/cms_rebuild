import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'
import {
  useTemplatePublishers,
  useTemplatePublisher,
  useCreateTemplatePublisher,
  useSharedTemplates,
  useSharedTemplate,
  useTemplateVersions,
  useTemplateInstalls,
  useTemplateReviews,
} from '@/hooks/use-templates'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockPublishers = [
  { id: '1', display_name: 'Ross Homes', publisher_type: 'company', is_verified: true },
  { id: '2', display_name: 'Template Co', publisher_type: 'individual', is_verified: false },
]

describe('use-templates hooks', () => {
  describe('useTemplatePublishers', () => {
    it('fetches publishers list successfully', async () => {
      server.use(
        http.get('/api/v2/marketplace/publishers', () =>
          HttpResponse.json({ data: mockPublishers, total: 2 })
        )
      )

      const { result } = renderHook(() => useTemplatePublishers(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockPublishers, total: 2 })
    })

    it('handles server errors', async () => {
      server.use(
        http.get('/api/v2/marketplace/publishers', () =>
          HttpResponse.json({ message: 'Error' }, { status: 500 })
        )
      )

      const { result } = renderHook(() => useTemplatePublishers(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useTemplatePublisher', () => {
    it('fetches a single publisher by id', async () => {
      server.use(
        http.get('/api/v2/marketplace/publishers/1', () =>
          HttpResponse.json({ data: mockPublishers[0] })
        )
      )

      const { result } = renderHook(() => useTemplatePublisher('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockPublishers[0] })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useTemplatePublisher(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateTemplatePublisher', () => {
    it('creates a publisher via POST', async () => {
      server.use(
        http.post('/api/v2/marketplace/publishers', () =>
          HttpResponse.json({ data: { id: '3', display_name: 'New Publisher' } })
        )
      )

      const { result } = renderHook(() => useCreateTemplatePublisher(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ display_name: 'New Publisher', publisher_type: 'company' })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useTemplateVersions', () => {
    it('fetches template versions for a template', async () => {
      server.use(
        http.get('/api/v2/marketplace/templates/t1/versions', () =>
          HttpResponse.json({ data: [{ id: 'v1', version: '1.0.0' }], total: 1 })
        )
      )

      const { result } = renderHook(() => useTemplateVersions('t1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })

    it('does not fetch when template id is null', () => {
      const { result } = renderHook(() => useTemplateVersions(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useSharedTemplate', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useSharedTemplate(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})
