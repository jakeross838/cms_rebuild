'use client'

/**
 * Module 09: Budget & Cost Tracking React Query Hooks
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type { Budget, BudgetLine, CostTransaction } from '@/types/budget'

// ── Budgets ─────────────────────────────────────────────────────────────

type BudgetListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  q?: string
}

type BudgetCreateInput = {
  job_id: string
  name: string
  status?: string
  total_amount?: number
  notes?: string | null
}

const budgetHooks = createApiHooks<BudgetListParams, BudgetCreateInput>(
  'budgets',
  '/api/v1/budgets'
)

export const useBudgets = budgetHooks.useList
export const useBudget = budgetHooks.useDetail
export const useCreateBudget = budgetHooks.useCreate
export const useUpdateBudget = budgetHooks.useUpdate
export const useDeleteBudget = budgetHooks.useDelete

// ── Budget Lines ────────────────────────────────────────────────────────

export function useBudgetLines(budgetId: string | null, params?: { page?: number; limit?: number; cost_code_id?: string; phase?: string }) {
  const searchParams = new URLSearchParams()
  if (params) {
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.set(key, String(val))
      }
    }
  }
  const qs = searchParams.toString()

  return useQuery({
    queryKey: ['budget-lines', budgetId, params],
    queryFn: () => fetchJson(`/api/v1/budgets/${budgetId}/lines${qs ? `?${qs}` : ''}`),
    enabled: !!budgetId,
  })
}

export function useCreateBudgetLine(budgetId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v1/budgets/${budgetId}/lines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget-lines', budgetId] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

export function useUpdateBudgetLine(budgetId: string, lineId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v1/budgets/${budgetId}/lines/${lineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget-lines', budgetId] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

export function useDeleteBudgetLine(budgetId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (lineId: string) =>
      fetchJson(`/api/v1/budgets/${budgetId}/lines/${lineId}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget-lines', budgetId] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

// ── Cost Transactions ───────────────────────────────────────────────────

type TxnListParams = {
  page?: number
  limit?: number
  job_id?: string
  budget_line_id?: string
  cost_code_id?: string
  transaction_type?: string
  vendor_id?: string
  date_from?: string
  date_to?: string
}

type TxnCreateInput = {
  job_id: string
  budget_line_id?: string | null
  cost_code_id?: string | null
  transaction_type: string
  amount: number
  description?: string | null
  reference_type?: string | null
  reference_id?: string | null
  transaction_date?: string
  vendor_id?: string | null
}

const txnHooks = createApiHooks<TxnListParams, TxnCreateInput>(
  'cost-transactions',
  '/api/v1/cost-transactions'
)

export const useCostTransactions = txnHooks.useList
export const useCreateCostTransaction = txnHooks.useCreate

// ── Re-export types ─────────────────────────────────────────────────────

export type { Budget, BudgetLine, CostTransaction }
