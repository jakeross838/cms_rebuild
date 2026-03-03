import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
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

// ── Change Orders (standard CRUD from createApiHooks) ────────────────────────

describe('useChangeOrders', () => {
  it('fetches change order list successfully', async () => {
    const { useChangeOrders } = await import('@/hooks/use-change-orders')
    server.use(
      http.get('/api/v2/change-orders', () => {
        return HttpResponse.json({
          data: [
            { id: 'co1', title: 'Add deck', change_type: 'addition', status: 'draft', amount: 15000 },
            { id: 'co2', title: 'Upgrade fixtures', change_type: 'modification', status: 'approved', amount: 3000 },
          ],
          total: 2,
        })
      })
    )
    const { result } = renderHook(() => useChangeOrders(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const listData = result.current.data as any
    expect(listData.data).toHaveLength(2)
    expect(listData.data[0].title).toBe('Add deck')
  })

  it('handles fetch error', async () => {
    const { useChangeOrders } = await import('@/hooks/use-change-orders')
    server.use(
      http.get('/api/v2/change-orders', () => {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      })
    )
    const { result } = renderHook(() => useChangeOrders(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useChangeOrder', () => {
  it('fetches a single change order by id', async () => {
    const { useChangeOrder } = await import('@/hooks/use-change-orders')
    server.use(
      http.get('/api/v2/change-orders/co1', () => {
        return HttpResponse.json({
          data: { id: 'co1', title: 'Add deck', change_type: 'addition', amount: 15000 },
        })
      })
    )
    const { result } = renderHook(() => useChangeOrder('co1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data.title).toBe('Add deck')
  })

  it('does not fetch when id is null', async () => {
    const { useChangeOrder } = await import('@/hooks/use-change-orders')
    const { result } = renderHook(() => useChangeOrder(null), { wrapper: createWrapper() })
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateChangeOrder', () => {
  it('creates a change order successfully', async () => {
    const { useCreateChangeOrder } = await import('@/hooks/use-change-orders')
    server.use(
      http.post('/api/v2/change-orders', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          { data: { id: 'new-co1', title: body.title, change_type: body.change_type } },
          { status: 201 }
        )
      })
    )
    const { result } = renderHook(() => useCreateChangeOrder(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ job_id: 'j1', title: 'Extra bathroom', change_type: 'addition' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data.title).toBe('Extra bathroom')
  })
})

describe('useDeleteChangeOrder', () => {
  it('deletes a change order successfully', async () => {
    const { useDeleteChangeOrder } = await import('@/hooks/use-change-orders')
    server.use(
      http.delete('/api/v2/change-orders/co-del', () => {
        return HttpResponse.json({ data: { id: 'co-del', deleted: true } })
      })
    )
    const { result } = renderHook(() => useDeleteChangeOrder(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('co-del')
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ── Change Order Items ───────────────────────────────────────────────────────

describe('useChangeOrderItems', () => {
  it('fetches items for a change order', async () => {
    const { useChangeOrderItems } = await import('@/hooks/use-change-orders')
    server.use(
      http.get('/api/v2/change-orders/co1/items', () => {
        return HttpResponse.json({
          data: [
            { id: 'ci1', description: 'Lumber', quantity: 100, unit_price: 15 },
          ],
        })
      })
    )
    const { result } = renderHook(() => useChangeOrderItems('co1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data).toHaveLength(1)
  })

  it('does not fetch when changeOrderId is null', async () => {
    const { useChangeOrderItems } = await import('@/hooks/use-change-orders')
    const { result } = renderHook(() => useChangeOrderItems(null), { wrapper: createWrapper() })
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateChangeOrderItem', () => {
  it('creates a change order item successfully', async () => {
    const { useCreateChangeOrderItem } = await import('@/hooks/use-change-orders')
    server.use(
      http.post('/api/v2/change-orders/co1/items', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          { data: { id: 'new-ci1', description: body.description } },
          { status: 201 }
        )
      })
    )
    const { result } = renderHook(() => useCreateChangeOrderItem('co1'), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ description: 'Extra tile', quantity: 50, unit_price: 8 })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ── Submit & Approve Change Order ────────────────────────────────────────────

describe('useSubmitChangeOrder', () => {
  it('submits a change order for approval', async () => {
    const { useSubmitChangeOrder } = await import('@/hooks/use-change-orders')
    server.use(
      http.post('/api/v2/change-orders/co1/submit', () => {
        return HttpResponse.json({ data: { id: 'co1', status: 'pending_approval' } })
      })
    )
    const { result } = renderHook(() => useSubmitChangeOrder('co1'), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ notes: 'Ready for review' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useApproveChangeOrder', () => {
  it('approves a change order', async () => {
    const { useApproveChangeOrder } = await import('@/hooks/use-change-orders')
    server.use(
      http.post('/api/v2/change-orders/co1/approve', () => {
        return HttpResponse.json({ data: { id: 'co1', status: 'approved' } })
      })
    )
    const { result } = renderHook(() => useApproveChangeOrder('co1'), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ notes: 'Looks good' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
