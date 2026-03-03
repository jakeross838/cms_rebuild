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

describe('useInvoices', () => {
  it('fetches invoice list successfully', async () => {
    const { useInvoices } = await import('@/hooks/use-invoices')
    server.use(
      http.get('/api/v2/invoices', () => {
        return HttpResponse.json({
          data: [
            { id: 'inv1', invoice_number: 'INV-001', amount: 5000, status: 'pending' },
            { id: 'inv2', invoice_number: 'INV-002', amount: 12000, status: 'paid' },
          ],
          total: 2,
        })
      })
    )
    const { result } = renderHook(() => useInvoices(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
    const listData = result.current.data as any
    expect(listData.data).toHaveLength(2)
    expect(listData.data[0].invoice_number).toBe('INV-001')
  })

  it('handles fetch error', async () => {
    const { useInvoices } = await import('@/hooks/use-invoices')
    server.use(
      http.get('/api/v2/invoices', () => {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
      })
    )
    const { result } = renderHook(() => useInvoices(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

describe('useInvoice', () => {
  it('fetches a single invoice by id', async () => {
    const { useInvoice } = await import('@/hooks/use-invoices')
    server.use(
      http.get('/api/v2/invoices/inv1', () => {
        return HttpResponse.json({
          data: { id: 'inv1', invoice_number: 'INV-001', amount: 5000 },
        })
      })
    )
    const { result } = renderHook(() => useInvoice('inv1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data.invoice_number).toBe('INV-001')
  })

  it('does not fetch when id is null', async () => {
    const { useInvoice } = await import('@/hooks/use-invoices')
    const { result } = renderHook(() => useInvoice(null), { wrapper: createWrapper() })
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateInvoice', () => {
  it('creates an invoice successfully', async () => {
    const { useCreateInvoice } = await import('@/hooks/use-invoices')
    server.use(
      http.post('/api/v2/invoices', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          { data: { id: 'new-inv1', amount: body.amount, invoice_number: 'INV-003' } },
          { status: 201 }
        )
      })
    )
    const { result } = renderHook(() => useCreateInvoice(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ amount: 7500, invoice_number: 'INV-003', job_id: 'j1' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data.invoice_number).toBe('INV-003')
  })
})

describe('useDeleteInvoice', () => {
  it('deletes an invoice successfully', async () => {
    const { useDeleteInvoice } = await import('@/hooks/use-invoices')
    server.use(
      http.delete('/api/v2/invoices/inv-del', () => {
        return HttpResponse.json({ data: { id: 'inv-del', deleted: true } })
      })
    )
    const { result } = renderHook(() => useDeleteInvoice(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('inv-del')
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
