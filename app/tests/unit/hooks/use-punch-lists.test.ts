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

// ── Punch Items List ────────────────────────────────────────────────────────

describe('usePunchItems', () => {
  it('fetches a list of punch items', async () => {
    const mockItems = [
      { id: 'pi-1', title: 'Touch up paint - master bath', job_id: 'job-1', status: 'open', priority: 'medium' },
      { id: 'pi-2', title: 'Fix cabinet door alignment', job_id: 'job-1', status: 'completed', priority: 'low' },
    ]

    server.use(
      http.get('/api/v2/punch-list', () => {
        return HttpResponse.json({ data: mockItems, total: 2 })
      }),
    )

    const { usePunchItems } = await import('@/hooks/use-punch-lists')
    const { result } = renderHook(() => usePunchItems(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockItems, total: 2 })
  })

  it('handles server error on punch items list', async () => {
    server.use(
      http.get('/api/v2/punch-list', () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })
      }),
    )

    const { usePunchItems } = await import('@/hooks/use-punch-lists')
    const { result } = renderHook(() => usePunchItems(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

// ── Punch Item Detail ───────────────────────────────────────────────────────

describe('usePunchItem', () => {
  it('fetches a single punch item by id', async () => {
    const mockItem = { id: 'pi-1', title: 'Touch up paint - master bath', job_id: 'job-1', status: 'open' }

    server.use(
      http.get('/api/v2/punch-list/pi-1', () => {
        return HttpResponse.json({ data: mockItem })
      }),
    )

    const { usePunchItem } = await import('@/hooks/use-punch-lists')
    const { result } = renderHook(() => usePunchItem('pi-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockItem })
  })

  it('does not fetch when id is null', async () => {
    const { usePunchItem } = await import('@/hooks/use-punch-lists')
    const { result } = renderHook(() => usePunchItem(null), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

// ── Create Punch Item ───────────────────────────────────────────────────────

describe('useCreatePunchItem', () => {
  it('creates a new punch item via POST', async () => {
    const newItem = {
      job_id: 'job-1',
      title: 'Replace cracked tile in foyer',
      location: 'Foyer',
      priority: 'high',
      category: 'flooring',
      assigned_vendor_id: 'vendor-1',
    }

    server.use(
      http.post('/api/v2/punch-list', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ data: { id: 'pi-new', ...(body as any) } }, { status: 201 })
      }),
    )

    const { useCreatePunchItem } = await import('@/hooks/use-punch-lists')
    const { result } = renderHook(() => useCreatePunchItem(), { wrapper: createWrapper() })

    result.current.mutate(newItem)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: { id: 'pi-new', ...newItem } })
  })
})

// ── Punch Item Photos (nested) ──────────────────────────────────────────────

describe('usePunchItemPhotos', () => {
  it('fetches photos for a punch item', async () => {
    const mockPhotos = [
      { id: 'photo-1', punch_item_id: 'pi-1', url: '/uploads/photo1.jpg', caption: 'Before' },
      { id: 'photo-2', punch_item_id: 'pi-1', url: '/uploads/photo2.jpg', caption: 'After' },
    ]

    server.use(
      http.get('/api/v2/punch-list/pi-1/photos', () => {
        return HttpResponse.json({ data: mockPhotos, total: 2 })
      }),
    )

    const { usePunchItemPhotos } = await import('@/hooks/use-punch-lists')
    const { result } = renderHook(() => usePunchItemPhotos('pi-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockPhotos, total: 2 })
  })

  it('does not fetch photos when punchItemId is null', async () => {
    const { usePunchItemPhotos } = await import('@/hooks/use-punch-lists')
    const { result } = renderHook(() => usePunchItemPhotos(null), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

// ── Quality Checklists ──────────────────────────────────────────────────────

describe('useQualityChecklists', () => {
  it('fetches a list of quality checklists', async () => {
    const mockChecklists = [
      { id: 'qc-1', name: 'Framing Inspection', job_id: 'job-1', status: 'in_progress' },
    ]

    server.use(
      http.get('/api/v2/quality-checklists', () => {
        return HttpResponse.json({ data: mockChecklists, total: 1 })
      }),
    )

    const { useQualityChecklists } = await import('@/hooks/use-punch-lists')
    const { result } = renderHook(() => useQualityChecklists(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockChecklists, total: 1 })
  })
})
