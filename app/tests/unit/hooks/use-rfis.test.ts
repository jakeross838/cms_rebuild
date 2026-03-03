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

// ── RFIs ────────────────────────────────────────────────────────────────────

describe('useRfis', () => {
  it('fetches a list of RFIs', async () => {
    const mockRfis = [
      { id: 'rfi-1', rfi_number: 'RFI-001', subject: 'Foundation specs', status: 'open' },
      { id: 'rfi-2', rfi_number: 'RFI-002', subject: 'Roof material', status: 'closed' },
    ]

    server.use(
      http.get('/api/v2/rfis', () => {
        return HttpResponse.json({ data: mockRfis, total: 2 })
      }),
    )

    const { useRfis } = await import('@/hooks/use-rfis')
    const { result } = renderHook(() => useRfis(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockRfis, total: 2 })
  })

  it('handles server error on RFI list', async () => {
    server.use(
      http.get('/api/v2/rfis', () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })
      }),
    )

    const { useRfis } = await import('@/hooks/use-rfis')
    const { result } = renderHook(() => useRfis(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

// ── RFI Detail ──────────────────────────────────────────────────────────────

describe('useRfi', () => {
  it('fetches a single RFI by id', async () => {
    const mockRfi = { id: 'rfi-1', rfi_number: 'RFI-001', subject: 'Foundation specs', status: 'open' }

    server.use(
      http.get('/api/v2/rfis/rfi-1', () => {
        return HttpResponse.json({ data: mockRfi })
      }),
    )

    const { useRfi } = await import('@/hooks/use-rfis')
    const { result } = renderHook(() => useRfi('rfi-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockRfi })
  })

  it('does not fetch when id is null', async () => {
    const { useRfi } = await import('@/hooks/use-rfis')
    const { result } = renderHook(() => useRfi(null), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

// ── Create RFI ──────────────────────────────────────────────────────────────

describe('useCreateRfi', () => {
  it('creates a new RFI via POST', async () => {
    const newRfi = {
      job_id: 'job-1',
      rfi_number: 'RFI-003',
      subject: 'Electrical panel location',
      question: 'Where should the main panel be located?',
      status: 'draft',
      priority: 'high',
    }

    server.use(
      http.post('/api/v2/rfis', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ data: { id: 'rfi-new', ...(body as any) } }, { status: 201 })
      }),
    )

    const { useCreateRfi } = await import('@/hooks/use-rfis')
    const { result } = renderHook(() => useCreateRfi(), { wrapper: createWrapper() })

    result.current.mutate(newRfi)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: { id: 'rfi-new', ...newRfi } })
  })
})

// ── RFI Responses (nested) ──────────────────────────────────────────────────

describe('useRfiResponses', () => {
  it('fetches responses for an RFI', async () => {
    const mockResponses = [
      { id: 'resp-1', rfi_id: 'rfi-1', response_text: 'Panel goes in garage', status: 'submitted' },
    ]

    server.use(
      http.get('/api/v2/rfis/rfi-1/responses', () => {
        return HttpResponse.json({ data: mockResponses, total: 1 })
      }),
    )

    const { useRfiResponses } = await import('@/hooks/use-rfis')
    const { result } = renderHook(() => useRfiResponses('rfi-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockResponses, total: 1 })
  })

  it('does not fetch when rfiId is null', async () => {
    const { useRfiResponses } = await import('@/hooks/use-rfis')
    const { result } = renderHook(() => useRfiResponses(null), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

// ── RFI Templates ───────────────────────────────────────────────────────────

describe('useRfiTemplates', () => {
  it('fetches a list of RFI templates', async () => {
    const mockTemplates = [
      { id: 'tpl-1', name: 'General RFI', category: 'general', is_active: true },
    ]

    server.use(
      http.get('/api/v2/rfis/templates', () => {
        return HttpResponse.json({ data: mockTemplates, total: 1 })
      }),
    )

    const { useRfiTemplates } = await import('@/hooks/use-rfis')
    const { result } = renderHook(() => useRfiTemplates(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockTemplates, total: 1 })
  })
})
