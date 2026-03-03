import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'
import {
  useVendorPortalSettings,
  useVendorPortalInvitations,
  useVendorPortalInvitation,
  useCreateVendorPortalInvitation,
  useVendorPortalAccessList,
  useVendorPortalAccess,
  useVendorSubmissions,
  useVendorSubmission,
  useVendorMessages,
  useVendorMessage,
} from '@/hooks/use-vendor-portal'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockInvitations = [
  { id: '1', vendor_name: 'ABC Plumbing', email: 'abc@example.com', status: 'pending' },
  { id: '2', vendor_name: 'XYZ Electric', email: 'xyz@example.com', status: 'accepted' },
]

describe('use-vendor-portal hooks', () => {
  describe('useVendorPortalSettings', () => {
    it('fetches vendor portal settings successfully', async () => {
      server.use(
        http.get('/api/v2/vendor-portal/settings', () =>
          HttpResponse.json({ data: { is_enabled: true, allow_invoices: true } })
        )
      )

      const { result } = renderHook(() => useVendorPortalSettings(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: { is_enabled: true, allow_invoices: true } })
    })
  })

  describe('useVendorPortalInvitations', () => {
    it('fetches invitations list successfully', async () => {
      server.use(
        http.get('/api/v2/vendor-portal/invitations', () =>
          HttpResponse.json({ data: mockInvitations, total: 2 })
        )
      )

      const { result } = renderHook(() => useVendorPortalInvitations(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ data: mockInvitations, total: 2 })
    })

    it('handles server errors', async () => {
      server.use(
        http.get('/api/v2/vendor-portal/invitations', () =>
          HttpResponse.json({ message: 'Error' }, { status: 500 })
        )
      )

      const { result } = renderHook(() => useVendorPortalInvitations(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useVendorPortalInvitation', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useVendorPortalInvitation(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateVendorPortalInvitation', () => {
    it('creates an invitation via POST', async () => {
      server.use(
        http.post('/api/v2/vendor-portal/invitations', () =>
          HttpResponse.json({ data: { id: '3', vendor_name: 'New Vendor', email: 'new@example.com' } })
        )
      )

      const { result } = renderHook(() => useCreateVendorPortalInvitation(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        result.current.mutate({ vendor_name: 'New Vendor', email: 'new@example.com' })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useVendorSubmission', () => {
    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useVendorSubmission(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})
