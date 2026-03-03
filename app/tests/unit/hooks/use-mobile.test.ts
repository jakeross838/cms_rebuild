import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'
import {
  usePushTokens,
  useCreatePushToken,
  useSyncQueue,
  useCreateSyncQueueItem,
  useDeletePushToken,
} from '@/hooks/use-mobile'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockTokens = [
  { id: '1', provider: 'apns', token: 'abc123', is_active: true },
  { id: '2', provider: 'fcm', token: 'def456', is_active: true },
]

describe('use-mobile hooks', () => {
  describe('usePushTokens', () => {
    it('fetches push tokens list successfully', async () => {
      server.use(
        http.get('/api/v2/mobile/push-tokens', () =>
          HttpResponse.json({ data: mockTokens, total: 2 })
        )
      )

      const { result } = renderHook(() => usePushTokens(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockTokens, total: 2 })
    })

    it('handles server errors', async () => {
      server.use(
        http.get('/api/v2/mobile/push-tokens', () =>
          HttpResponse.json({ message: 'Error' }, { status: 500 })
        )
      )

      const { result } = renderHook(() => usePushTokens(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useCreatePushToken', () => {
    it('creates a push token via POST', async () => {
      server.use(
        http.post('/api/v2/mobile/push-tokens', () =>
          HttpResponse.json({ data: { id: '3', provider: 'apns', token: 'new123' } })
        )
      )

      const { result } = renderHook(() => useCreatePushToken(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ provider: 'apns', token: 'new123' })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useSyncQueue', () => {
    it('fetches sync queue list', async () => {
      server.use(
        http.get('/api/v2/mobile/sync-queue', () =>
          HttpResponse.json({ data: [{ id: 'q1', status: 'pending', entity_type: 'daily_log' }], total: 1 })
        )
      )

      const { result } = renderHook(() => useSyncQueue(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useCreateSyncQueueItem', () => {
    it('creates a sync queue item via POST', async () => {
      server.use(
        http.post('/api/v2/mobile/sync-queue', () =>
          HttpResponse.json({ data: { id: 'q2', status: 'pending' } })
        )
      )

      const { result } = renderHook(() => useCreateSyncQueueItem(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ entity_type: 'photo', payload: {} })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useDeletePushToken', () => {
    it('deletes a push token via DELETE', async () => {
      server.use(
        http.delete('/api/v2/mobile/push-tokens/1', () =>
          HttpResponse.json({ success: true })
        )
      )

      const { result } = renderHook(() => useDeletePushToken(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate('1')
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })
})
