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

// ── Lien Waivers List ───────────────────────────────────────────────────────

describe('useLienWaivers', () => {
  it('fetches a list of lien waivers', async () => {
    const mockWaivers = [
      { id: 'lw-1', job_id: 'job-1', waiver_type: 'conditional_progress', status: 'pending', amount: 25000 },
      { id: 'lw-2', job_id: 'job-1', waiver_type: 'unconditional_final', status: 'approved', amount: 80000 },
    ]

    server.use(
      http.get('/api/v2/lien-waivers', () => {
        return HttpResponse.json({ data: mockWaivers, total: 2 })
      }),
    )

    const { useLienWaivers } = await import('@/hooks/use-lien-waivers')
    const { result } = renderHook(() => useLienWaivers(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockWaivers, total: 2 })
  })

  it('handles server error on lien waivers list', async () => {
    server.use(
      http.get('/api/v2/lien-waivers', () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })
      }),
    )

    const { useLienWaivers } = await import('@/hooks/use-lien-waivers')
    const { result } = renderHook(() => useLienWaivers(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

// ── Lien Waiver Detail ──────────────────────────────────────────────────────

describe('useLienWaiver', () => {
  it('fetches a single lien waiver by id', async () => {
    const mockWaiver = { id: 'lw-1', job_id: 'job-1', waiver_type: 'conditional_progress', status: 'pending' }

    server.use(
      http.get('/api/v2/lien-waivers/lw-1', () => {
        return HttpResponse.json({ data: mockWaiver })
      }),
    )

    const { useLienWaiver } = await import('@/hooks/use-lien-waivers')
    const { result } = renderHook(() => useLienWaiver('lw-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockWaiver })
  })

  it('does not fetch when id is null', async () => {
    const { useLienWaiver } = await import('@/hooks/use-lien-waivers')
    const { result } = renderHook(() => useLienWaiver(null), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

// ── Create Lien Waiver ──────────────────────────────────────────────────────

describe('useCreateLienWaiver', () => {
  it('creates a new lien waiver via POST', async () => {
    const newWaiver = {
      job_id: 'job-1',
      vendor_id: 'vendor-1',
      waiver_type: 'conditional_progress',
      amount: 15000,
      through_date: '2026-03-01',
    }

    server.use(
      http.post('/api/v2/lien-waivers', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ data: { id: 'lw-new', ...(body as any) } }, { status: 201 })
      }),
    )

    const { useCreateLienWaiver } = await import('@/hooks/use-lien-waivers')
    const { result } = renderHook(() => useCreateLienWaiver(), { wrapper: createWrapper() })

    result.current.mutate(newWaiver)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: { id: 'lw-new', ...newWaiver } })
  })
})

// ── Lien Waiver Templates ───────────────────────────────────────────────────

describe('useLienWaiverTemplates', () => {
  it('fetches a list of lien waiver templates', async () => {
    const mockTemplates = [
      { id: 'tpl-1', template_name: 'CA Conditional Progress', waiver_type: 'conditional_progress', state_code: 'CA' },
    ]

    server.use(
      http.get('/api/v2/lien-waiver-templates', () => {
        return HttpResponse.json({ data: mockTemplates, total: 1 })
      }),
    )

    const { useLienWaiverTemplates } = await import('@/hooks/use-lien-waivers')
    const { result } = renderHook(() => useLienWaiverTemplates(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockTemplates, total: 1 })
  })
})

// ── Lien Waiver Tracking ────────────────────────────────────────────────────

describe('useLienWaiverTracking', () => {
  it('fetches lien waiver tracking records', async () => {
    const mockTracking = [
      { id: 'trk-1', job_id: 'job-1', vendor_id: 'vendor-1', is_compliant: true },
    ]

    server.use(
      http.get('/api/v2/lien-waiver-tracking', () => {
        return HttpResponse.json({ data: mockTracking, total: 1 })
      }),
    )

    const { useLienWaiverTracking } = await import('@/hooks/use-lien-waivers')
    const { result } = renderHook(() => useLienWaiverTracking(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockTracking, total: 1 })
  })
})
