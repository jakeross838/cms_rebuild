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

// ── Estimates List ──────────────────────────────────────────────────────────

describe('useEstimates', () => {
  it('fetches a list of estimates', async () => {
    const mockEstimates = [
      { id: 'est-1', name: 'Kitchen Remodel', estimate_type: 'detailed', status: 'draft' },
      { id: 'est-2', name: 'New Build Phase 1', estimate_type: 'conceptual', status: 'approved' },
    ]

    server.use(
      http.get('/api/v2/estimates', () => {
        return HttpResponse.json({ data: mockEstimates, total: 2 })
      }),
    )

    const { useEstimates } = await import('@/hooks/use-estimating')
    const { result } = renderHook(() => useEstimates(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockEstimates, total: 2 })
  })

  it('handles server error on estimates list', async () => {
    server.use(
      http.get('/api/v2/estimates', () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })
      }),
    )

    const { useEstimates } = await import('@/hooks/use-estimating')
    const { result } = renderHook(() => useEstimates(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

// ── Estimate Detail ─────────────────────────────────────────────────────────

describe('useEstimate', () => {
  it('fetches a single estimate by id', async () => {
    const mockEstimate = { id: 'est-1', name: 'Kitchen Remodel', estimate_type: 'detailed', status: 'draft' }

    server.use(
      http.get('/api/v2/estimates/est-1', () => {
        return HttpResponse.json({ data: mockEstimate })
      }),
    )

    const { useEstimate } = await import('@/hooks/use-estimating')
    const { result } = renderHook(() => useEstimate('est-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockEstimate })
  })

  it('does not fetch when id is null', async () => {
    const { useEstimate } = await import('@/hooks/use-estimating')
    const { result } = renderHook(() => useEstimate(null), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

// ── Create Estimate ─────────────────────────────────────────────────────────

describe('useCreateEstimate', () => {
  it('creates a new estimate via POST', async () => {
    const newEstimate = {
      name: 'Bathroom Addition',
      estimate_type: 'detailed',
      job_id: 'job-1',
      markup_pct: 15,
      overhead_pct: 10,
      profit_pct: 8,
    }

    server.use(
      http.post('/api/v2/estimates', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ data: { id: 'est-new', ...(body as any) } }, { status: 201 })
      }),
    )

    const { useCreateEstimate } = await import('@/hooks/use-estimating')
    const { result } = renderHook(() => useCreateEstimate(), { wrapper: createWrapper() })

    result.current.mutate(newEstimate)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: { id: 'est-new', ...newEstimate } })
  })
})

// ── Estimate Sections (nested) ──────────────────────────────────────────────

describe('useEstimateSections', () => {
  it('fetches sections for an estimate', async () => {
    const mockSections = [
      { id: 'sec-1', estimate_id: 'est-1', name: 'Demolition', sort_order: 1 },
      { id: 'sec-2', estimate_id: 'est-1', name: 'Framing', sort_order: 2 },
    ]

    server.use(
      http.get('/api/v2/estimates/est-1/sections', () => {
        return HttpResponse.json({ data: mockSections, total: 2 })
      }),
    )

    const { useEstimateSections } = await import('@/hooks/use-estimating')
    const { result } = renderHook(() => useEstimateSections('est-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockSections, total: 2 })
  })

  it('does not fetch sections when estimateId is null', async () => {
    const { useEstimateSections } = await import('@/hooks/use-estimating')
    const { result } = renderHook(() => useEstimateSections(null), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

// ── Assemblies ──────────────────────────────────────────────────────────────

describe('useAssemblies', () => {
  it('fetches a list of assemblies', async () => {
    const mockAssemblies = [
      { id: 'asm-1', name: 'Standard Interior Wall', category: 'framing', is_active: true },
    ]

    server.use(
      http.get('/api/v2/assemblies', () => {
        return HttpResponse.json({ data: mockAssemblies, total: 1 })
      }),
    )

    const { useAssemblies } = await import('@/hooks/use-estimating')
    const { result } = renderHook(() => useAssemblies(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockAssemblies, total: 1 })
  })
})
