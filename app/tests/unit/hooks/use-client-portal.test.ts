import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'
import {
  useClientMessages,
  useClientMessage,
  useCreateClientMessage,
  useClientApprovals,
  useClientApproval,
  useClientInvitations,
  useClientPayments,
  usePortalSettings,
  useBasicPortalSettings,
} from '@/hooks/use-client-portal'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockMessages = [
  { id: '1', job_id: 'j1', message_text: 'Hello', sender_type: 'client' },
  { id: '2', job_id: 'j1', message_text: 'Update on project', sender_type: 'builder' },
]

describe('use-client-portal hooks', () => {
  describe('useClientMessages', () => {
    it('fetches messages list successfully', async () => {
      server.use(
        http.get('/api/v2/client-portal/messages', () =>
          HttpResponse.json({ data: mockMessages, total: 2 })
        )
      )

      const { result } = renderHook(() => useClientMessages(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockMessages, total: 2 })
    })

    it('handles server errors', async () => {
      server.use(
        http.get('/api/v2/client-portal/messages', () =>
          HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
        )
      )

      const { result } = renderHook(() => useClientMessages(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useClientMessage', () => {
    it('fetches a single message by id', async () => {
      server.use(
        http.get('/api/v2/client-portal/messages/1', () =>
          HttpResponse.json({ data: mockMessages[0] })
        )
      )

      const { result } = renderHook(() => useClientMessage('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockMessages[0] })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useClientMessage(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateClientMessage', () => {
    it('creates a message via POST', async () => {
      server.use(
        http.post('/api/v2/client-portal/messages', () =>
          HttpResponse.json({ data: { id: '3', message_text: 'New message' } })
        )
      )

      const { result } = renderHook(() => useCreateClientMessage(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ job_id: 'j1', message_text: 'New message' })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useClientApproval', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useClientApproval(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useBasicPortalSettings', () => {
    it('fetches portal settings for a job', async () => {
      server.use(
        http.get('/api/v2/portal/settings', () =>
          HttpResponse.json({ data: { job_id: 'j1', is_active: true } })
        )
      )

      const { result } = renderHook(() => useBasicPortalSettings('j1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })

    it('does not fetch when job id is null', () => {
      const { result } = renderHook(() => useBasicPortalSettings(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})
