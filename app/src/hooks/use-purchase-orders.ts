'use client'

/**
 * Module 18: Purchase Order Management React Query Hooks
 *
 * Covers: purchase orders, PO lines, receipts, approve, send.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  PurchaseOrder,
  PurchaseOrderLine,
  PoReceipt,
  PoReceiptLine,
} from '@/types/purchase-orders'

// ── Purchase Orders ─────────────────────────────────────────────────────────

type PoListParams = {
  page?: number
  limit?: number
  job_id?: string
  vendor_id?: string
  status?: string
  q?: string
}

type PoCreateInput = {
  job_id: string
  vendor_id: string
  po_number?: string
  title: string
  status?: string
  budget_id?: string | null
  cost_code_id?: string | null
  subtotal?: number | null
  tax_amount?: number | null
  shipping_amount?: number | null
  total_amount?: number | null
  delivery_date?: string | null
  shipping_address?: string | null
  terms?: string | null
  notes?: string | null
  description?: string | null
}

const poHooks = createApiHooks<PoListParams, PoCreateInput>(
  'purchase-orders',
  '/api/v2/purchase-orders'
)

export const usePurchaseOrders = poHooks.useList
export const usePurchaseOrder = poHooks.useDetail
export const useCreatePurchaseOrder = poHooks.useCreate
export const useUpdatePurchaseOrder = poHooks.useUpdate
export const useDeletePurchaseOrder = poHooks.useDelete

// ── PO Lines ────────────────────────────────────────────────────────────────

/** Fetch lines for a purchase order */
export function usePurchaseOrderLines(poId: string | null) {
  return useQuery<{ data: PurchaseOrderLine[] }>({
    queryKey: ['po-lines', poId],
    queryFn: () => fetchJson(`/api/v2/purchase-orders/${poId}/lines`),
    enabled: !!poId,
  })
}

/** Create a line on a purchase order */
export function useCreatePoLine(poId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/purchase-orders/${poId}/lines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['po-lines', poId] })
      qc.invalidateQueries({ queryKey: ['purchase-orders'] })
    },
  })
}

/** Update a line on a purchase order */
export function useUpdatePoLine(poId: string, lineId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/purchase-orders/${poId}/lines/${lineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['po-lines', poId] })
      qc.invalidateQueries({ queryKey: ['purchase-orders'] })
    },
  })
}

/** Delete a line from a purchase order */
export function useDeletePoLine(poId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (lineId: string) =>
      fetchJson(`/api/v2/purchase-orders/${poId}/lines/${lineId}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['po-lines', poId] })
      qc.invalidateQueries({ queryKey: ['purchase-orders'] })
    },
  })
}

// ── PO Receipts ─────────────────────────────────────────────────────────────

/** Fetch receipts for a purchase order */
export function usePurchaseOrderReceipts(poId: string | null) {
  return useQuery<{ data: PoReceipt[] }>({
    queryKey: ['po-receipts', poId],
    queryFn: () => fetchJson(`/api/v2/purchase-orders/${poId}/receipts`),
    enabled: !!poId,
  })
}

/** Create a receipt on a purchase order */
export function useCreatePoReceipt(poId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/purchase-orders/${poId}/receipts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['po-receipts', poId] })
      qc.invalidateQueries({ queryKey: ['po-lines', poId] })
      qc.invalidateQueries({ queryKey: ['purchase-orders'] })
    },
  })
}

// ── Approve PO ──────────────────────────────────────────────────────────────

/** Approve a purchase order */
export function useApprovePurchaseOrder(poId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: { notes?: string }) =>
      fetchJson(`/api/v2/purchase-orders/${poId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data ?? {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-orders'] })
      qc.invalidateQueries({ queryKey: ['purchase-orders', poId] })
    },
  })
}

// ── Send PO ─────────────────────────────────────────────────────────────────

/** Send a purchase order to the vendor */
export function useSendPurchaseOrder(poId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: { delivery_method?: string; email?: string }) =>
      fetchJson(`/api/v2/purchase-orders/${poId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data ?? {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-orders'] })
      qc.invalidateQueries({ queryKey: ['purchase-orders', poId] })
    },
  })
}

// ── Re-export types ─────────────────────────────────────────────────────────

export type {
  PurchaseOrder,
  PurchaseOrderLine,
  PoReceipt,
  PoReceiptLine,
}
