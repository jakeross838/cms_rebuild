import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

// ── Draw Requests List ──────────────────────────────────────────────────────

describe('useDrawRequests', () => {
  it('fetches a list of draw requests', async () => {
    const mockDrawRequests = [
      { id: 'dr-1', job_id: 'job-1', draw_number: 1, status: 'draft', current_due: 50000 },
      { id: 'dr-2', job_id: 'job-1', draw_number: 2, status: 'submitted', current_due: 75000 },
    ]

    server.use(
      http.get('/api/v2/draw-requests', () => {
        return HttpResponse.json({ data: mockDrawRequests, total: 2 })
      }),
    )

    const { useDrawRequests } = await import('@/hooks/use-draw-requests')
    const { result } = renderHook(() => useDrawRequests(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockDrawRequests, total: 2 })
  })

  it('handles server error on draw requests list', async () => {
    server.use(
      http.get('/api/v2/draw-requests', () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })
      }),
    )

    const { useDrawRequests } = await import('@/hooks/use-draw-requests')
    const { result } = renderHook(() => useDrawRequests(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

// ── Draw Request Detail ─────────────────────────────────────────────────────

describe('useDrawRequest', () => {
  it('fetches a single draw request by id', async () => {
    const mockDrawRequest = { id: 'dr-1', job_id: 'job-1', draw_number: 1, status: 'draft', current_due: 50000 }

    server.use(
      http.get('/api/v2/draw-requests/dr-1', () => {
        return HttpResponse.json({ data: mockDrawRequest })
      }),
    )

    const { useDrawRequest } = await import('@/hooks/use-draw-requests')
    const { result } = renderHook(() => useDrawRequest('dr-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockDrawRequest })
  })

  it('does not fetch when id is null', async () => {
    const { useDrawRequest } = await import('@/hooks/use-draw-requests')
    const { result } = renderHook(() => useDrawRequest(null), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

// ── Create Draw Request ─────────────────────────────────────────────────────

describe('useCreateDrawRequest', () => {
  it('creates a new draw request via POST', async () => {
    const newDrawRequest = {
      job_id: 'job-1',
      application_date: '2026-03-01',
      period_to: '2026-03-31',
      contract_amount: 500000,
      retainage_pct: 10,
    }

    server.use(
      http.post('/api/v2/draw-requests', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ data: { id: 'dr-new', ...(body as any) } }, { status: 201 })
      }),
    )

    const { useCreateDrawRequest } = await import('@/hooks/use-draw-requests')
    const { result } = renderHook(() => useCreateDrawRequest(), { wrapper: createWrapper() })

    result.current.mutate(newDrawRequest)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: { id: 'dr-new', ...newDrawRequest } })
  })
})

// ── Draw Request Lines (nested) ─────────────────────────────────────────────

describe('useDrawRequestLines', () => {
  it('fetches lines for a draw request', async () => {
    const mockLines = [
      { id: 'drl-1', draw_request_id: 'dr-1', description: 'Foundation', scheduled_value: 80000 },
      { id: 'drl-2', draw_request_id: 'dr-1', description: 'Framing', scheduled_value: 120000 },
    ]

    server.use(
      http.get('/api/v2/draw-requests/dr-1/lines', () => {
        return HttpResponse.json({ data: mockLines })
      }),
    )

    const { useDrawRequestLines } = await import('@/hooks/use-draw-requests')
    const { result } = renderHook(() => useDrawRequestLines('dr-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockLines })
  })

  it('does not fetch lines when drawRequestId is null', async () => {
    const { useDrawRequestLines } = await import('@/hooks/use-draw-requests')
    const { result } = renderHook(() => useDrawRequestLines(null), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

// ── Submit Draw Request (action) ────────────────────────────────────────────

describe('useSubmitDrawRequest', () => {
  it('submits a draw request for review', async () => {
    server.use(
      http.post('/api/v2/draw-requests/dr-1/submit', () => {
        return HttpResponse.json({ data: { id: 'dr-1', status: 'submitted' } })
      }),
    )

    const { useSubmitDrawRequest } = await import('@/hooks/use-draw-requests')
    const { result } = renderHook(() => useSubmitDrawRequest('dr-1'), { wrapper: createWrapper() })

    result.current.mutate({ notes: 'Ready for review' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: { id: 'dr-1', status: 'submitted' } })
  })
})
