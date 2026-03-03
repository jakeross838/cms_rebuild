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

// ── Purchase Orders (standard CRUD from createApiHooks) ──────────────────────

describe('usePurchaseOrders', () => {
  it('fetches purchase order list successfully', async () => {
    const { usePurchaseOrders } = await import('@/hooks/use-purchase-orders')
    server.use(
      http.get('/api/v2/purchase-orders', () => {
        return HttpResponse.json({
          data: [
            { id: 'po1', po_number: 'PO-001', title: 'Lumber Order', status: 'draft', total_amount: 8500 },
            { id: 'po2', po_number: 'PO-002', title: 'Plumbing Fixtures', status: 'approved', total_amount: 3200 },
          ],
          total: 2,
        })
      })
    )
    const { result } = renderHook(() => usePurchaseOrders(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const listData = result.current.data as any
    expect(listData.data).toHaveLength(2)
    expect(listData.data[0].po_number).toBe('PO-001')
  })

  it('handles fetch error', async () => {
    const { usePurchaseOrders } = await import('@/hooks/use-purchase-orders')
    server.use(
      http.get('/api/v2/purchase-orders', () => {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
      })
    )
    const { result } = renderHook(() => usePurchaseOrders(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('usePurchaseOrder', () => {
  it('fetches a single purchase order by id', async () => {
    const { usePurchaseOrder } = await import('@/hooks/use-purchase-orders')
    server.use(
      http.get('/api/v2/purchase-orders/po1', () => {
        return HttpResponse.json({
          data: { id: 'po1', po_number: 'PO-001', title: 'Lumber Order', total_amount: 8500 },
        })
      })
    )
    const { result } = renderHook(() => usePurchaseOrder('po1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data.title).toBe('Lumber Order')
  })

  it('does not fetch when id is null', async () => {
    const { usePurchaseOrder } = await import('@/hooks/use-purchase-orders')
    const { result } = renderHook(() => usePurchaseOrder(null), { wrapper: createWrapper() })
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreatePurchaseOrder', () => {
  it('creates a purchase order successfully', async () => {
    const { useCreatePurchaseOrder } = await import('@/hooks/use-purchase-orders')
    server.use(
      http.post('/api/v2/purchase-orders', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          { data: { id: 'new-po1', title: body.title, vendor_id: body.vendor_id } },
          { status: 201 }
        )
      })
    )
    const { result } = renderHook(() => useCreatePurchaseOrder(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ job_id: 'j1', vendor_id: 'v1', title: 'Electrical Supplies' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data.title).toBe('Electrical Supplies')
  })
})

describe('useDeletePurchaseOrder', () => {
  it('deletes a purchase order successfully', async () => {
    const { useDeletePurchaseOrder } = await import('@/hooks/use-purchase-orders')
    server.use(
      http.delete('/api/v2/purchase-orders/po-del', () => {
        return HttpResponse.json({ data: { id: 'po-del', deleted: true } })
      })
    )
    const { result } = renderHook(() => useDeletePurchaseOrder(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('po-del')
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ── PO Lines ─────────────────────────────────────────────────────────────────

describe('usePurchaseOrderLines', () => {
  it('fetches lines for a purchase order', async () => {
    const { usePurchaseOrderLines } = await import('@/hooks/use-purchase-orders')
    server.use(
      http.get('/api/v2/purchase-orders/po1/lines', () => {
        return HttpResponse.json({
          data: [
            { id: 'pl1', description: '2x4 Lumber', quantity: 200, unit_price: 5.5 },
          ],
        })
      })
    )
    const { result } = renderHook(() => usePurchaseOrderLines('po1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data).toHaveLength(1)
  })

  it('does not fetch when poId is null', async () => {
    const { usePurchaseOrderLines } = await import('@/hooks/use-purchase-orders')
    const { result } = renderHook(() => usePurchaseOrderLines(null), { wrapper: createWrapper() })
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreatePoLine', () => {
  it('creates a PO line successfully', async () => {
    const { useCreatePoLine } = await import('@/hooks/use-purchase-orders')
    server.use(
      http.post('/api/v2/purchase-orders/po1/lines', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          { data: { id: 'new-pl1', description: body.description } },
          { status: 201 }
        )
      })
    )
    const { result } = renderHook(() => useCreatePoLine('po1'), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ description: 'Plywood sheets', quantity: 50, unit_price: 35 })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ── PO Receipts ──────────────────────────────────────────────────────────────

describe('usePurchaseOrderReceipts', () => {
  it('fetches receipts for a purchase order', async () => {
    const { usePurchaseOrderReceipts } = await import('@/hooks/use-purchase-orders')
    server.use(
      http.get('/api/v2/purchase-orders/po1/receipts', () => {
        return HttpResponse.json({
          data: [
            { id: 'pr1', received_date: '2026-01-20', received_by: 'u1' },
          ],
        })
      })
    )
    const { result } = renderHook(() => usePurchaseOrderReceipts('po1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data).toHaveLength(1)
  })

  it('does not fetch when poId is null', async () => {
    const { usePurchaseOrderReceipts } = await import('@/hooks/use-purchase-orders')
    const { result } = renderHook(() => usePurchaseOrderReceipts(null), { wrapper: createWrapper() })
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

// ── Approve & Send PO ────────────────────────────────────────────────────────

describe('useApprovePurchaseOrder', () => {
  it('approves a purchase order', async () => {
    const { useApprovePurchaseOrder } = await import('@/hooks/use-purchase-orders')
    server.use(
      http.post('/api/v2/purchase-orders/po1/approve', () => {
        return HttpResponse.json({ data: { id: 'po1', status: 'approved' } })
      })
    )
    const { result } = renderHook(() => useApprovePurchaseOrder('po1'), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ notes: 'Approved' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useSendPurchaseOrder', () => {
  it('sends a purchase order to vendor', async () => {
    const { useSendPurchaseOrder } = await import('@/hooks/use-purchase-orders')
    server.use(
      http.post('/api/v2/purchase-orders/po1/send', () => {
        return HttpResponse.json({ data: { id: 'po1', status: 'sent' } })
      })
    )
    const { result } = renderHook(() => useSendPurchaseOrder('po1'), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ delivery_method: 'email', email: 'vendor@test.com' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
