'use client'

/**
 * Module 17: Change Order Management React Query Hooks
 *
 * Covers: change orders, change order items, submit, approve.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  ChangeOrder,
  ChangeOrderItem,
  ChangeOrderHistory,
} from '@/types/change-orders'

// ── Change Orders ───────────────────────────────────────────────────────────

type ChangeOrderListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  change_type?: string
  q?: string
}

type ChangeOrderCreateInput = {
  job_id: string
  co_number?: string
  title: string
  description?: string | null
  change_type: string
  status?: string
  amount?: number
  cost_impact?: number
  schedule_impact_days?: number
  requested_by_type?: string | null
  requested_by_id?: string | null
  budget_id?: string | null
  document_id?: string | null
}

const changeOrderHooks = createApiHooks<ChangeOrderListParams, ChangeOrderCreateInput>(
  'change-orders',
  '/api/v2/change-orders'
)

export const useChangeOrders = changeOrderHooks.useList
export const useChangeOrder = changeOrderHooks.useDetail
export const useCreateChangeOrder = changeOrderHooks.useCreate
export const useUpdateChangeOrder = changeOrderHooks.useUpdate
export const useDeleteChangeOrder = changeOrderHooks.useDelete

// ── Change Order Items ──────────────────────────────────────────────────────

/** Fetch items for a change order */
export function useChangeOrderItems(changeOrderId: string | null) {
  return useQuery<{ data: ChangeOrderItem[] }>({
    queryKey: ['change-order-items', changeOrderId],
    queryFn: () => fetchJson(`/api/v2/change-orders/${changeOrderId}/items`),
    enabled: !!changeOrderId,
  })
}

/** Create an item on a change order */
export function useCreateChangeOrderItem(changeOrderId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/change-orders/${changeOrderId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['change-order-items', changeOrderId] })
      qc.invalidateQueries({ queryKey: ['change-orders'] })
    },
  })
}

/** Update an item on a change order */
export function useUpdateChangeOrderItem(changeOrderId: string, itemId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/change-orders/${changeOrderId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['change-order-items', changeOrderId] })
      qc.invalidateQueries({ queryKey: ['change-orders'] })
    },
  })
}

/** Delete an item from a change order */
export function useDeleteChangeOrderItem(changeOrderId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) =>
      fetchJson(`/api/v2/change-orders/${changeOrderId}/items/${itemId}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['change-order-items', changeOrderId] })
      qc.invalidateQueries({ queryKey: ['change-orders'] })
    },
  })
}

// ── Submit Change Order ─────────────────────────────────────────────────────

/** Submit a change order for approval */
export function useSubmitChangeOrder(changeOrderId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: { notes?: string }) =>
      fetchJson(`/api/v2/change-orders/${changeOrderId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data ?? {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['change-orders'] })
      qc.invalidateQueries({ queryKey: ['change-orders', changeOrderId] })
    },
  })
}

// ── Approve Change Order ────────────────────────────────────────────────────

/** Approve a change order */
export function useApproveChangeOrder(changeOrderId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: { notes?: string }) =>
      fetchJson(`/api/v2/change-orders/${changeOrderId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data ?? {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['change-orders'] })
      qc.invalidateQueries({ queryKey: ['change-orders', changeOrderId] })
    },
  })
}

// ── Re-export types ─────────────────────────────────────────────────────────

export type {
  ChangeOrder,
  ChangeOrderItem,
  ChangeOrderHistory,
}
