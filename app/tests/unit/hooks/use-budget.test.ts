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

// ── Budgets (standard CRUD from createApiHooks) ──────────────────────────────

describe('useBudgets', () => {
  it('fetches budget list successfully', async () => {
    const { useBudgets } = await import('@/hooks/use-budget')
    server.use(
      http.get('/api/v1/budgets', () => {
        return HttpResponse.json({
          data: [
            { id: 'b1', name: 'Main Budget', job_id: 'j1', total_amount: 500000 },
          ],
          total: 1,
        })
      })
    )
    const { result } = renderHook(() => useBudgets(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const listData = result.current.data as any
    expect(listData.data).toHaveLength(1)
    expect(listData.data[0].name).toBe('Main Budget')
  })

  it('handles fetch error', async () => {
    const { useBudgets } = await import('@/hooks/use-budget')
    server.use(
      http.get('/api/v1/budgets', () => {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
      })
    )
    const { result } = renderHook(() => useBudgets(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useBudget', () => {
  it('fetches a single budget by id', async () => {
    const { useBudget } = await import('@/hooks/use-budget')
    server.use(
      http.get('/api/v1/budgets/b1', () => {
        return HttpResponse.json({ data: { id: 'b1', name: 'Main Budget' } })
      })
    )
    const { result } = renderHook(() => useBudget('b1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data.name).toBe('Main Budget')
  })

  it('does not fetch when id is null', async () => {
    const { useBudget } = await import('@/hooks/use-budget')
    const { result } = renderHook(() => useBudget(null), { wrapper: createWrapper() })
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateBudget', () => {
  it('creates a budget successfully', async () => {
    const { useCreateBudget } = await import('@/hooks/use-budget')
    server.use(
      http.post('/api/v1/budgets', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          { data: { id: 'new-b1', name: body.name, job_id: body.job_id } },
          { status: 201 }
        )
      })
    )
    const { result } = renderHook(() => useCreateBudget(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ job_id: 'j1', name: 'Phase 2 Budget' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data.name).toBe('Phase 2 Budget')
  })
})

describe('useDeleteBudget', () => {
  it('deletes a budget successfully', async () => {
    const { useDeleteBudget } = await import('@/hooks/use-budget')
    server.use(
      http.delete('/api/v1/budgets/b-del', () => {
        return HttpResponse.json({ data: { id: 'b-del', deleted: true } })
      })
    )
    const { result } = renderHook(() => useDeleteBudget(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('b-del')
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ── Budget Lines (nested under budget) ───────────────────────────────────────

describe('useBudgetLines', () => {
  it('fetches budget lines for a budget', async () => {
    const { useBudgetLines } = await import('@/hooks/use-budget')
    server.use(
      http.get('/api/v1/budgets/b1/lines', () => {
        return HttpResponse.json({
          data: [
            { id: 'bl1', budget_id: 'b1', cost_code_id: 'cc1', amount: 25000 },
          ],
          total: 1,
        })
      })
    )
    const { result } = renderHook(() => useBudgetLines('b1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data).toHaveLength(1)
  })

  it('does not fetch when budgetId is null', async () => {
    const { useBudgetLines } = await import('@/hooks/use-budget')
    const { result } = renderHook(() => useBudgetLines(null), { wrapper: createWrapper() })
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateBudgetLine', () => {
  it('creates a budget line successfully', async () => {
    const { useCreateBudgetLine } = await import('@/hooks/use-budget')
    server.use(
      http.post('/api/v1/budgets/b1/lines', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          { data: { id: 'new-bl1', budget_id: 'b1', amount: body.amount } },
          { status: 201 }
        )
      })
    )
    const { result } = renderHook(() => useCreateBudgetLine('b1'), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ cost_code_id: 'cc1', amount: 15000 })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteBudgetLine', () => {
  it('deletes a budget line successfully', async () => {
    const { useDeleteBudgetLine } = await import('@/hooks/use-budget')
    server.use(
      http.delete('/api/v1/budgets/b1/lines/bl-del', () => {
        return HttpResponse.json({ data: { id: 'bl-del', deleted: true } })
      })
    )
    const { result } = renderHook(() => useDeleteBudgetLine('b1'), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('bl-del')
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ── Cost Transactions ────────────────────────────────────────────────────────

describe('useCostTransactions', () => {
  it('fetches cost transactions successfully', async () => {
    const { useCostTransactions } = await import('@/hooks/use-budget')
    server.use(
      http.get('/api/v1/cost-transactions', () => {
        return HttpResponse.json({
          data: [
            { id: 't1', job_id: 'j1', transaction_type: 'expense', amount: 1500 },
          ],
          total: 1,
        })
      })
    )
    const { result } = renderHook(() => useCostTransactions(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).data).toHaveLength(1)
  })
})

describe('useCreateCostTransaction', () => {
  it('creates a cost transaction successfully', async () => {
    const { useCreateCostTransaction } = await import('@/hooks/use-budget')
    server.use(
      http.post('/api/v1/cost-transactions', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          { data: { id: 'new-t1', job_id: body.job_id, amount: body.amount } },
          { status: 201 }
        )
      })
    )
    const { result } = renderHook(() => useCreateCostTransaction(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ job_id: 'j1', transaction_type: 'expense', amount: 2500 })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
