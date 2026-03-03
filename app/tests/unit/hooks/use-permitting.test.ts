import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

import {
  usePermits,
  usePermit,
  useCreatePermit,
  usePermitInspections,
  useCreatePermitInspection,
  usePermitDocuments,
  usePermitFees,
  useCreatePermitFee,
} from '@/hooks/use-permitting'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockPermit = {
  id: 'permit-1',
  job_id: 'job-1',
  permit_type: 'building',
  status: 'approved',
  permit_number: 'BLD-2026-0042',
  jurisdiction: 'City of Springfield',
  applied_date: '2026-01-05',
  issued_date: '2026-01-20',
  expiration_date: '2027-01-20',
  conditions: null,
  notes: null,
  created_at: '2026-01-05T09:00:00.000Z',
}

const mockPermitInspection = {
  id: 'pi-1',
  permit_id: 'permit-1',
  inspection_type: 'foundation',
  status: 'passed',
  scheduled_date: '2026-02-01',
}

const mockPermitDocument = {
  id: 'pdoc-1',
  permit_id: 'permit-1',
  document_name: 'Permit Application',
  file_url: '/files/permit-app.pdf',
}

const mockPermitFee = {
  id: 'pfee-1',
  permit_id: 'permit-1',
  fee_type: 'application',
  amount: 500.0,
  status: 'paid',
}

describe('use-permitting', () => {
  // ── Permits ────────────────────────────────────────────────────────────

  describe('usePermits (useList)', () => {
    it('fetches a list of permits', async () => {
      server.use(
        http.get('/api/v2/permits', () => {
          return HttpResponse.json({
            data: [mockPermit],
            total: 1,
          })
        })
      )

      const { result } = renderHook(() => usePermits(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockPermit],
        total: 1,
      })
    })

    it('handles server error gracefully', async () => {
      server.use(
        http.get('/api/v2/permits', () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          )
        })
      )

      const { result } = renderHook(() => usePermits(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeDefined()
    })
  })

  describe('usePermit (useDetail)', () => {
    it('fetches a single permit by id', async () => {
      server.use(
        http.get('/api/v2/permits/permit-1', () => {
          return HttpResponse.json({ data: mockPermit })
        })
      )

      const { result } = renderHook(() => usePermit('permit-1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({ data: mockPermit })
    })

    it('does not fetch when id is null', () => {
      const { result } = renderHook(() => usePermit(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreatePermit (useCreate)', () => {
    it('creates a permit via POST', async () => {
      server.use(
        http.post('/api/v2/permits', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>
          return HttpResponse.json({
            data: { id: 'permit-new', ...body },
          })
        })
      )

      const { result } = renderHook(() => useCreatePermit(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        job_id: 'job-1',
        permit_type: 'electrical',
        status: 'applied',
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toMatchObject({
        data: {
          id: 'permit-new',
          permit_type: 'electrical',
        },
      })
    })
  })

  // ── Permit Inspections ─────────────────────────────────────────────────

  describe('usePermitInspections', () => {
    it('fetches inspections for a permit', async () => {
      server.use(
        http.get('/api/v2/permits/permit-1/inspections', () => {
          return HttpResponse.json({
            data: [mockPermitInspection],
            total: 1,
          })
        })
      )

      const { result } = renderHook(
        () => usePermitInspections('permit-1'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockPermitInspection],
        total: 1,
      })
    })

    it('does not fetch when permitId is null', () => {
      const { result } = renderHook(
        () => usePermitInspections(null),
        { wrapper: createWrapper() }
      )

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  // ── Permit Documents ───────────────────────────────────────────────────

  describe('usePermitDocuments', () => {
    it('fetches documents for a permit', async () => {
      server.use(
        http.get('/api/v2/permits/permit-1/documents', () => {
          return HttpResponse.json({
            data: [mockPermitDocument],
            total: 1,
          })
        })
      )

      const { result } = renderHook(
        () => usePermitDocuments('permit-1'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockPermitDocument],
        total: 1,
      })
    })

    it('does not fetch when permitId is null', () => {
      const { result } = renderHook(
        () => usePermitDocuments(null),
        { wrapper: createWrapper() }
      )

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  // ── Permit Fees ────────────────────────────────────────────────────────

  describe('usePermitFees', () => {
    it('fetches fees for a permit', async () => {
      server.use(
        http.get('/api/v2/permits/permit-1/fees', () => {
          return HttpResponse.json({
            data: [mockPermitFee],
            total: 1,
          })
        })
      )

      const { result } = renderHook(
        () => usePermitFees('permit-1'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({
        data: [mockPermitFee],
        total: 1,
      })
    })

    it('does not fetch when permitId is null', () => {
      const { result } = renderHook(
        () => usePermitFees(null),
        { wrapper: createWrapper() }
      )

      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})
