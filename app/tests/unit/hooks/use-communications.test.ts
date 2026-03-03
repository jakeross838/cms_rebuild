import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

import {
  useCommunications,
  useCommunication,
  useCreateCommunication,
  useUpdateCommunication,
  useDeleteCommunication,
} from '@/hooks/use-communications'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockCommunication = {
  id: 'comm-1',
  job_id: 'job-1',
  subject: 'Site Update',
  message_body: 'Foundation pour completed.',
  communication_type: 'email',
  status: 'sent',
  priority: 'normal',
  recipient: 'client@example.com',
  notes: null,
  created_at: '2026-01-15T10:00:00.000Z',
}

describe('use-communications', () => {
  describe('useCommunications (useList)', () => {
    it('fetches a list of communications', async () => {
      server.use(
        http.get('/api/v2/communications', () => {
          return HttpResponse.json({
            data: [mockCommunication],
            total: 1,
          })
        })
      )

      const { result } = renderHook(() => useCommunications(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockCommunication],
        total: 1,
      })
    })

    it('handles server error gracefully', async () => {
      server.use(
        http.get('/api/v2/communications', () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          )
        })
      )

      const { result } = renderHook(() => useCommunications(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeDefined()
    })
  })

  describe('useCommunication (useDetail)', () => {
    it('fetches a single communication by id', async () => {
      server.use(
        http.get('/api/v2/communications/comm-1', () => {
          return HttpResponse.json({ data: mockCommunication })
        })
      )

      const { result } = renderHook(() => useCommunication('comm-1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({ data: mockCommunication })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useCommunication(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateCommunication (useCreate)', () => {
    it('creates a communication via POST', async () => {
      server.use(
        http.post('/api/v2/communications', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>
          return HttpResponse.json({
            data: { id: 'comm-new', ...body },
          })
        })
      )

      const { result } = renderHook(() => useCreateCommunication(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        job_id: 'job-1',
        subject: 'New Message',
        message_body: 'Hello from test',
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toMatchObject({
        data: {
          id: 'comm-new',
          subject: 'New Message',
        },
      })
    })
  })
})
