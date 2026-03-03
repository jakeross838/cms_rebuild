import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'
import {
  useClientPortalSettings,
  useClientPortalInvitations,
  useClientPortalInvitation,
  useCreateClientPortalInvitation,
  useClientApprovals,
  useClientApproval,
  useClientMessages,
  useClientPayments,
  usePortalUpdate,
} from '@/hooks/use-full-client-portal'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockInvitations = [
  { id: '1', job_id: 'j1', email: 'client@example.com', status: 'pending' },
  { id: '2', job_id: 'j2', email: 'other@example.com', status: 'accepted' },
]

describe('use-full-client-portal hooks', () => {
  describe('useClientPortalSettings', () => {
    it('fetches portal settings successfully', async () => {
      server.use(
        http.get('/api/v2/client-portal/settings', () =>
          HttpResponse.json({ data: { is_active: true, welcome_message: 'Welcome' } })
        )
      )

      const { result } = renderHook(() => useClientPortalSettings(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: { is_active: true, welcome_message: 'Welcome' } })
    })
  })

  describe('useClientPortalInvitations', () => {
    it('fetches invitations list successfully', async () => {
      server.use(
        http.get('/api/v2/client-portal/invitations', () =>
          HttpResponse.json({ data: mockInvitations, total: 2 })
        )
      )

      const { result } = renderHook(() => useClientPortalInvitations(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockInvitations, total: 2 })
    })

    it('handles server errors', async () => {
      server.use(
        http.get('/api/v2/client-portal/invitations', () =>
          HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
        )
      )

      const { result } = renderHook(() => useClientPortalInvitations(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useClientPortalInvitation', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useClientPortalInvitation(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateClientPortalInvitation', () => {
    it('creates an invitation via POST', async () => {
      server.use(
        http.post('/api/v2/client-portal/invitations', () =>
          HttpResponse.json({ data: { id: '3', email: 'new@example.com' } })
        )
      )

      const { result } = renderHook(() => useCreateClientPortalInvitation(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ job_id: 'j1', email: 'new@example.com' })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('usePortalUpdate', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => usePortalUpdate(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})
