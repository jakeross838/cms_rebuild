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

describe('useVendors', () => {
  it('fetches vendor list successfully', async () => {
    const { useVendors } = await import('@/hooks/use-vendors')
    server.use(
      http.get('/api/v1/vendors', () => {
        return HttpResponse.json({
          data: [
            { id: 'v1', name: 'ABC Plumbing', trade: 'plumbing' },
            { id: 'v2', name: 'XYZ Electric', trade: 'electrical' },
          ],
          total: 2,
        })
      })
    )
    const { result } = renderHook(() => useVendors(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
    const listData = result.current.data as any
    expect(listData.data).toHaveLength(2)
    expect(listData.data[0].name).toBe('ABC Plumbing')
  })

  it('handles fetch error', async () => {
    const { useVendors } = await import('@/hooks/use-vendors')
    server.use(
      http.get('/api/v1/vendors', () => {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      })
    )
    const { result } = renderHook(() => useVendors(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

describe('useVendor', () => {
  it('fetches a single vendor by id', async () => {
    const { useVendor } = await import('@/hooks/use-vendors')
    server.use(
      http.get('/api/v1/vendors/v1', () => {
        return HttpResponse.json({ data: { id: 'v1', name: 'ABC Plumbing', trade: 'plumbing' } })
      })
    )
    const { result } = renderHook(() => useVendor('v1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data.name).toBe('ABC Plumbing')
  })

  it('does not fetch when id is null', async () => {
    const { useVendor } = await import('@/hooks/use-vendors')
    const { result } = renderHook(() => useVendor(null), { wrapper: createWrapper() })
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateVendor', () => {
  it('creates a vendor successfully', async () => {
    const { useCreateVendor } = await import('@/hooks/use-vendors')
    server.use(
      http.post('/api/v1/vendors', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ data: { id: 'new-v1', name: body.name } }, { status: 201 })
      })
    )
    const { result } = renderHook(() => useCreateVendor(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ name: 'New Vendor', trade: 'framing' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data.name).toBe('New Vendor')
  })
})

describe('useDeleteVendor', () => {
  it('deletes a vendor successfully', async () => {
    const { useDeleteVendor } = await import('@/hooks/use-vendors')
    server.use(
      http.delete('/api/v1/vendors/v-del', () => {
        return HttpResponse.json({ data: { id: 'v-del', deleted: true } })
      })
    )
    const { result } = renderHook(() => useDeleteVendor(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('v-del')
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
