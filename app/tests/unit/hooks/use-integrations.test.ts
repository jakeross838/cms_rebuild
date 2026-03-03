import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'
import {
  useIntegrationConnections,
  useIntegrationConnection,
  useCreateIntegrationConnection,
  useSyncMappings,
  useSyncLogs,
  useSyncConflicts,
  useIntegrationListing,
  useIntegrationInstalls,
} from '@/hooks/use-integrations'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockConnections = [
  { id: '1', provider: 'quickbooks', status: 'connected' },
  { id: '2', provider: 'xero', status: 'disconnected' },
]

describe('use-integrations hooks', () => {
  describe('useIntegrationConnections', () => {
    it('fetches connections list successfully', async () => {
      server.use(
        http.get('/api/v2/integrations/connections', () =>
          HttpResponse.json({ data: mockConnections, total: 2 })
        )
      )

      const { result } = renderHook(() => useIntegrationConnections(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockConnections, total: 2 })
    })

    it('handles server errors', async () => {
      server.use(
        http.get('/api/v2/integrations/connections', () =>
          HttpResponse.json({ message: 'Error' }, { status: 500 })
        )
      )

      const { result } = renderHook(() => useIntegrationConnections(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useIntegrationConnection', () => {
    it('fetches a single connection by id', async () => {
      server.use(
        http.get('/api/v2/integrations/connections/1', () =>
          HttpResponse.json({ data: mockConnections[0] })
        )
      )

      const { result } = renderHook(() => useIntegrationConnection('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockConnections[0] })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useIntegrationConnection(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateIntegrationConnection', () => {
    it('creates a connection via POST', async () => {
      server.use(
        http.post('/api/v2/integrations/connections', () =>
          HttpResponse.json({ data: { id: '3', provider: 'sage' } })
        )
      )

      const { result } = renderHook(() => useCreateIntegrationConnection(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ provider: 'sage' })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useSyncLogs', () => {
    it('fetches sync logs list', async () => {
      server.use(
        http.get('/api/v2/integrations/sync-logs', () =>
          HttpResponse.json({ data: [{ id: 'l1', status: 'success' }], total: 1 })
        )
      )

      const { result } = renderHook(() => useSyncLogs(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useIntegrationListing', () => {
    it('does not fetch when slug is null', () => {
      const { result } = renderHook(() => useIntegrationListing(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})
