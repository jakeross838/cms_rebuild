import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

import {
  useInspections,
  useInspection,
  useCreateInspection,
  useUpdateInspection,
  useDeleteInspection,
} from '@/hooks/use-inspections'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockInspection = {
  id: 'insp-1',
  job_id: 'job-1',
  permit_id: 'permit-1',
  inspection_type: 'foundation',
  status: 'scheduled',
  scheduled_date: '2026-02-15',
  scheduled_time: '09:00',
  inspector_name: 'Bob Inspector',
  inspector_phone: '(555) 333-4444',
  is_reinspection: false,
  original_inspection_id: null,
  completed_at: null,
  notes: null,
  created_at: '2026-01-25T12:00:00.000Z',
}

describe('use-inspections', () => {
  describe('useInspections (useList)', () => {
    it('fetches a list of inspections', async () => {
      server.use(
        http.get('/api/v2/inspections', () => {
          return HttpResponse.json({
            data: [mockInspection],
            total: 1,
          })
        })
      )

      const { result } = renderHook(() => useInspections(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockInspection],
        total: 1,
      })
    })

    it('handles server error gracefully', async () => {
      server.use(
        http.get('/api/v2/inspections', () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          )
        })
      )

      const { result } = renderHook(() => useInspections(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeDefined()
    })
  })

  describe('useInspection (useDetail)', () => {
    it('fetches a single inspection by id', async () => {
      server.use(
        http.get('/api/v2/inspections/insp-1', () => {
          return HttpResponse.json({ data: mockInspection })
        })
      )

      const { result } = renderHook(() => useInspection('insp-1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({ data: mockInspection })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => useInspection(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateInspection (useCreate)', () => {
    it('creates an inspection via POST', async () => {
      server.use(
        http.post('/api/v2/inspections', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>
          return HttpResponse.json({
            data: { id: 'insp-new', ...body },
          })
        })
      )

      const { result } = renderHook(() => useCreateInspection(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        job_id: 'job-1',
        permit_id: 'permit-1',
        inspection_type: 'framing',
        status: 'requested',
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toMatchObject({
        data: {
          id: 'insp-new',
          inspection_type: 'framing',
        },
      })
    })
  })
})
