import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'
import {
  useApiKeys,
  useApiKey,
  useCreateApiKey,
  useWebhooks,
  useWebhook,
  useMarketplaceTemplates,
  useMarketplaceTemplate,
  useMarketplaceInstalls,
  useMarketplaceReviews,
} from '@/hooks/use-marketplace'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockApiKeys = [
  { id: '1', name: 'Production Key', status: 'active' },
  { id: '2', name: 'Staging Key', status: 'active' },
]

describe('use-marketplace hooks', () => {
  describe('useApiKeys', () => {
    it('fetches API keys list successfully', async () => {
      server.use(
        http.get('/api/v2/api-keys', () =>
          HttpResponse.json({ data: mockApiKeys, total: 2 })
        )
      )

      const { result } = renderHook(() => useApiKeys(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockApiKeys, total: 2 })
    })

    it('handles server errors', async () => {
      server.use(
        http.get('/api/v2/api-keys', () =>
          HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
        )
      )

      const { result } = renderHook(() => useApiKeys(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useApiKey', () => {
    it('fetches a single API key by id', async () => {
      server.use(
        http.get('/api/v2/api-keys/1', () =>
          HttpResponse.json({ data: mockApiKeys[0] })
        )
      )

      const { result } = renderHook(() => useApiKey('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockApiKeys[0] })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useApiKey(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateApiKey', () => {
    it('creates an API key via POST', async () => {
      server.use(
        http.post('/api/v2/api-keys', () =>
          HttpResponse.json({ data: { id: '3', name: 'Dev Key' } })
        )
      )

      const { result } = renderHook(() => useCreateApiKey(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ name: 'Dev Key' })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useMarketplaceTemplate', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useMarketplaceTemplate(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useMarketplaceInstalls', () => {
    it('fetches marketplace installs list', async () => {
      server.use(
        http.get('/api/v2/marketplace/installs', () =>
          HttpResponse.json({ data: [{ id: 'i1', status: 'installed' }], total: 1 })
        )
      )

      const { result } = renderHook(() => useMarketplaceInstalls(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })
})
