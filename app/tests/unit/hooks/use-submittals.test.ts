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

// ── Submittals List ─────────────────────────────────────────────────────────

describe('useSubmittals', () => {
  it('fetches a list of submittals', async () => {
    const mockSubmittals = [
      { id: 'sub-1', title: 'Flooring samples', job_id: 'job-1', status: 'pending' },
      { id: 'sub-2', title: 'Window specs', job_id: 'job-1', status: 'approved' },
    ]

    server.use(
      http.get('/api/v2/submittals', () => {
        return HttpResponse.json({ data: mockSubmittals, total: 2 })
      }),
    )

    const { useSubmittals } = await import('@/hooks/use-submittals')
    const { result } = renderHook(() => useSubmittals(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockSubmittals, total: 2 })
  })

  it('handles server error on submittals list', async () => {
    server.use(
      http.get('/api/v2/submittals', () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })
      }),
    )

    const { useSubmittals } = await import('@/hooks/use-submittals')
    const { result } = renderHook(() => useSubmittals(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

// ── Submittal Detail ────────────────────────────────────────────────────────

describe('useSubmittal', () => {
  it('fetches a single submittal by id', async () => {
    const mockSubmittal = { id: 'sub-1', title: 'Flooring samples', job_id: 'job-1', status: 'pending' }

    server.use(
      http.get('/api/v2/submittals/sub-1', () => {
        return HttpResponse.json({ data: mockSubmittal })
      }),
    )

    const { useSubmittal } = await import('@/hooks/use-submittals')
    const { result } = renderHook(() => useSubmittal('sub-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockSubmittal })
  })

  it('does not fetch when id is null', async () => {
    const { useSubmittal } = await import('@/hooks/use-submittals')
    const { result } = renderHook(() => useSubmittal(null), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

// ── Create Submittal ────────────────────────────────────────────────────────

describe('useCreateSubmittal', () => {
  it('creates a new submittal via POST', async () => {
    const newSubmittal = {
      job_id: 'job-1',
      title: 'Cabinet hardware',
      spec_section: '06 41 00',
      status: 'draft',
      priority: 'medium',
    }

    server.use(
      http.post('/api/v2/submittals', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ data: { id: 'sub-new', ...(body as any) } }, { status: 201 })
      }),
    )

    const { useCreateSubmittal } = await import('@/hooks/use-submittals')
    const { result } = renderHook(() => useCreateSubmittal(), { wrapper: createWrapper() })

    result.current.mutate(newSubmittal)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: { id: 'sub-new', ...newSubmittal } })
  })
})

// ── Delete Submittal ────────────────────────────────────────────────────────

describe('useDeleteSubmittal', () => {
  it('deletes a submittal via DELETE', async () => {
    server.use(
      http.delete('/api/v2/submittals/sub-1', () => {
        return HttpResponse.json({ data: { id: 'sub-1', deleted: true } })
      }),
    )

    const { useDeleteSubmittal } = await import('@/hooks/use-submittals')
    const { result } = renderHook(() => useDeleteSubmittal(), { wrapper: createWrapper() })

    result.current.mutate('sub-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ── Update Submittal ────────────────────────────────────────────────────────

describe('useUpdateSubmittal', () => {
  it('updates a submittal via PATCH', async () => {
    server.use(
      http.patch('/api/v2/submittals/sub-1', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ data: { id: 'sub-1', ...(body as any) } })
      }),
    )

    const { useUpdateSubmittal } = await import('@/hooks/use-submittals')
    const { result } = renderHook(() => useUpdateSubmittal('sub-1'), { wrapper: createWrapper() })

    result.current.mutate({ status: 'approved' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: { id: 'sub-1', status: 'approved' } })
  })
})
