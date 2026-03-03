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

describe('useCostCodes', () => {
  it('fetches cost code list successfully', async () => {
    const { useCostCodes } = await import('@/hooks/use-cost-codes')
    server.use(
      http.get('/api/v1/cost-codes', () => {
        return HttpResponse.json({
          data: [
            { id: 'cc1', code: '01-100', name: 'General Conditions', division: '01' },
            { id: 'cc2', code: '03-300', name: 'Concrete', division: '03' },
          ],
          total: 2,
        })
      })
    )
    const { result } = renderHook(() => useCostCodes(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
    const listData = result.current.data as any
    expect(listData.data).toHaveLength(2)
    expect(listData.data[0].code).toBe('01-100')
  })

  it('handles fetch error', async () => {
    const { useCostCodes } = await import('@/hooks/use-cost-codes')
    server.use(
      http.get('/api/v1/cost-codes', () => {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
      })
    )
    const { result } = renderHook(() => useCostCodes(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

describe('useCostCode', () => {
  it('fetches a single cost code by id', async () => {
    const { useCostCode } = await import('@/hooks/use-cost-codes')
    server.use(
      http.get('/api/v1/cost-codes/cc1', () => {
        return HttpResponse.json({ data: { id: 'cc1', code: '01-100', name: 'General Conditions' } })
      })
    )
    const { result } = renderHook(() => useCostCode('cc1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data.code).toBe('01-100')
  })

  it('does not fetch when id is null', async () => {
    const { useCostCode } = await import('@/hooks/use-cost-codes')
    const { result } = renderHook(() => useCostCode(null), { wrapper: createWrapper() })
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateCostCode', () => {
  it('creates a cost code successfully', async () => {
    const { useCreateCostCode } = await import('@/hooks/use-cost-codes')
    server.use(
      http.post('/api/v1/cost-codes', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          { data: { id: 'new-cc1', code: body.code, name: body.name } },
          { status: 201 }
        )
      })
    )
    const { result } = renderHook(() => useCreateCostCode(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ code: '04-400', name: 'Masonry' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data.code).toBe('04-400')
  })
})

describe('useDeleteCostCode', () => {
  it('deletes a cost code successfully', async () => {
    const { useDeleteCostCode } = await import('@/hooks/use-cost-codes')
    server.use(
      http.delete('/api/v1/cost-codes/cc-del', () => {
        return HttpResponse.json({ data: { id: 'cc-del', deleted: true } })
      })
    )
    const { result } = renderHook(() => useDeleteCostCode(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('cc-del')
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
