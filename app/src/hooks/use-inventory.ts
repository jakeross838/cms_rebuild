'use client'

/**
 * Module 52: Inventory & Materials Management React Query Hooks
 *
 * Covers: inventory items, locations, stock levels, transactions,
 *         material requests, material request approval.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  InventoryItem,
  InventoryLocation,
  InventoryStock,
  InventoryTransaction,
  MaterialRequest,
  MaterialRequestItem,
} from '@/types/inventory'

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildQs(params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return ''
  const sp = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      sp.set(key, String(val))
    }
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}

// ── Inventory Items ─────────────────────────────────────────────────────────

type ItemListParams = {
  page?: number
  limit?: number
  category?: string
  is_active?: boolean
  q?: string
}

type ItemCreateInput = {
  name: string
  sku?: string | null
  description?: string | null
  category?: string | null
  unit_of_measure: string
  unit_cost: number
  reorder_point?: number
  reorder_quantity?: number
  is_active?: boolean
}

const itemHooks = createApiHooks<ItemListParams, ItemCreateInput>(
  'inventory-items',
  '/api/v2/inventory/items'
)

export const useInventoryItems = itemHooks.useList
export const useInventoryItem = itemHooks.useDetail
export const useCreateInventoryItem = itemHooks.useCreate
export const useUpdateInventoryItem = itemHooks.useUpdate
export const useDeleteInventoryItem = itemHooks.useDelete

// ── Inventory Locations ─────────────────────────────────────────────────────

type LocationListParams = {
  page?: number
  limit?: number
  location_type?: string
  is_active?: boolean
  job_id?: string
  q?: string
}

type LocationCreateInput = {
  name: string
  location_type: string
  address?: string | null
  job_id?: string | null
  is_active?: boolean
}

const locationHooks = createApiHooks<LocationListParams, LocationCreateInput>(
  'inventory-locations',
  '/api/v2/inventory/locations'
)

export const useInventoryLocations = locationHooks.useList
export const useInventoryLocation = locationHooks.useDetail
export const useCreateInventoryLocation = locationHooks.useCreate
export const useUpdateInventoryLocation = locationHooks.useUpdate
export const useDeleteInventoryLocation = locationHooks.useDelete

// ── Inventory Stock ─────────────────────────────────────────────────────────

type StockListParams = {
  page?: number
  limit?: number
  item_id?: string
  location_id?: string
}

/** List stock levels across items and locations */
export function useInventoryStock(params?: StockListParams) {
  return useQuery<{ data: InventoryStock[]; total: number }>({
    queryKey: ['inventory-stock', params],
    queryFn: () => fetchJson(`/api/v2/inventory/stock${buildQs(params)}`),
  })
}

// ── Inventory Transactions ──────────────────────────────────────────────────

type TransactionListParams = {
  page?: number
  limit?: number
  item_id?: string
  location_id?: string
  transaction_type?: string
  job_id?: string
  date_from?: string
  date_to?: string
}

type TransactionCreateInput = {
  item_id: string
  from_location_id?: string | null
  to_location_id?: string | null
  transaction_type: string
  quantity: number
  unit_cost?: number | null
  reference_type?: string | null
  reference_id?: string | null
  job_id?: string | null
  cost_code_id?: string | null
  notes?: string | null
}

/** List inventory transactions */
export function useInventoryTransactions(params?: TransactionListParams) {
  return useQuery<{ data: InventoryTransaction[]; total: number }>({
    queryKey: ['inventory-transactions', params],
    queryFn: () => fetchJson(`/api/v2/inventory/transactions${buildQs(params)}`),
  })
}

/** Create an inventory transaction (receive, transfer, consume, adjust, return) */
export function useCreateInventoryTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: TransactionCreateInput) =>
      fetchJson('/api/v2/inventory/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-transactions'] })
      qc.invalidateQueries({ queryKey: ['inventory-stock'] })
      qc.invalidateQueries({ queryKey: ['inventory-items'] })
    },
  })
}

// ── Material Requests ───────────────────────────────────────────────────────

type MaterialRequestListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  priority?: string
  q?: string
}

type MaterialRequestCreateInput = {
  job_id?: string | null
  priority?: string
  needed_by?: string | null
  notes?: string | null
  items?: {
    item_id?: string | null
    description?: string | null
    quantity_requested: number
    unit?: string | null
    notes?: string | null
  }[]
}

const materialRequestHooks = createApiHooks<MaterialRequestListParams, MaterialRequestCreateInput>(
  'material-requests',
  '/api/v2/material-requests'
)

export const useMaterialRequests = materialRequestHooks.useList
export const useMaterialRequest = materialRequestHooks.useDetail
export const useCreateMaterialRequest = materialRequestHooks.useCreate
export const useUpdateMaterialRequest = materialRequestHooks.useUpdate
export const useDeleteMaterialRequest = materialRequestHooks.useDelete

// ── Approve Material Request ────────────────────────────────────────────────

/** Approve a material request */
export function useApproveMaterialRequest(requestId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: { notes?: string }) =>
      fetchJson(`/api/v2/material-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data ?? {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['material-requests'] })
      qc.invalidateQueries({ queryKey: ['material-requests', requestId] })
    },
  })
}

// ── Re-export types ─────────────────────────────────────────────────────────

export type {
  InventoryItem,
  InventoryLocation,
  InventoryStock,
  InventoryTransaction,
  MaterialRequest,
  MaterialRequestItem,
}
