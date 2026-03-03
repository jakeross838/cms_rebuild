import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

import { useNotifications } from '@/hooks/use-notifications'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0, refetchInterval: false },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockNotification = {
  id: 'notif-1',
  company_id: 'company-1',
  user_id: 'user-1',
  event_type: 'invoice.created',
  category: 'financial',
  title: 'New Invoice Received',
  body: 'Invoice #1234 has been submitted for review.',
  entity_type: 'invoice',
  entity_id: 'inv-1',
  url_path: '/invoices/inv-1',
  urgency: 'normal',
  read: false,
  read_at: null,
  archived: false,
  snoozed_until: null,
  triggered_by: 'user-2',
  job_id: 'job-1',
  created_at: '2026-01-28T14:00:00.000Z',
}

describe('use-notifications', () => {
  describe('useNotifications', () => {
    it('fetches notifications and unread count', async () => {
      server.use(
        http.get('/api/v2/notifications', () => {
          return HttpResponse.json({
            data: [mockNotification],
            pagination: {
              page: 1,
              limit: 20,
              total: 1,
              totalPages: 1,
              hasMore: false,
            },
          })
        }),
        http.get('/api/v2/notifications/unread-count', () => {
          return HttpResponse.json({
            data: { count: 3 },
          })
        })
      )

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.notifications).toEqual([mockNotification])
      expect(result.current.unreadCount).toBe(3)
    })

    it('returns empty notifications on server error', async () => {
      server.use(
        http.get('/api/v2/notifications', () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          )
        }),
        http.get('/api/v2/notifications/unread-count', () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          )
        })
      )

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      // Falls back to empty array when data is undefined
      expect(result.current.notifications).toEqual([])
    })

    it('provides markAsRead mutation function', async () => {
      server.use(
        http.get('/api/v2/notifications', () => {
          return HttpResponse.json({
            data: [mockNotification],
            pagination: {
              page: 1,
              limit: 20,
              total: 1,
              totalPages: 1,
              hasMore: false,
            },
          })
        }),
        http.get('/api/v2/notifications/unread-count', () => {
          return HttpResponse.json({ data: { count: 1 } })
        }),
        http.put('/api/v2/notifications/notif-1', () => {
          return HttpResponse.json({ data: { success: true } })
        })
      )

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(typeof result.current.markAsRead).toBe('function')
      expect(typeof result.current.markAllAsRead).toBe('function')
      expect(typeof result.current.archiveNotification).toBe('function')
    })

    it('provides markAllAsRead mutation function', async () => {
      server.use(
        http.get('/api/v2/notifications', () => {
          return HttpResponse.json({
            data: [],
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              totalPages: 0,
              hasMore: false,
            },
          })
        }),
        http.get('/api/v2/notifications/unread-count', () => {
          return HttpResponse.json({ data: { count: 0 } })
        }),
        http.put('/api/v2/notifications/read-all', () => {
          return HttpResponse.json({ data: { success: true } })
        })
      )

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(typeof result.current.markAllAsRead).toBe('function')
    })
  })
})
