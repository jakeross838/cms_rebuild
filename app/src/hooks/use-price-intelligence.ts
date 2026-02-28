'use client'

/**
 * Module 23: Price Intelligence React Query Hooks
 *
 * Covers: master items, vendor item prices, price history,
 * labor rates, labor rate history.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  MasterItem,
  VendorItemPrice,
  PriceHistory,
  LaborRate,
  LaborRateHistory,
} from '@/types/price-intelligence'

// ── Helpers ─────────────────────────────────────────────────────────────────

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

// ── Master Items ────────────────────────────────────────────────────────────

type ItemListParams = {
  page?: number
  limit?: number
  category?: string
  unit_of_measure?: string
  q?: string
}

type ItemCreateInput = {
  name: string
  description?: string | null
  category: string
  unit_of_measure: string
  default_unit_price: number
  sku?: string | null
}

const itemHooks = createApiHooks<ItemListParams, ItemCreateInput>(
  'price-items',
  '/api/v2/price-intelligence/items'
)

export const useMasterItems = itemHooks.useList
export const useMasterItem = itemHooks.useDetail
export const useCreateMasterItem = itemHooks.useCreate
export const useUpdateMasterItem = itemHooks.useUpdate
export const useDeleteMasterItem = itemHooks.useDelete

// ── Vendor Item Prices ──────────────────────────────────────────────────────

type VendorPriceListParams = {
  page?: number
  limit?: number
  vendor_id?: string
}

export function useVendorItemPrices(itemId: string | null, params?: VendorPriceListParams) {
  return useQuery<{ data: VendorItemPrice[]; total: number }>({
    queryKey: ['vendor-item-prices', itemId, params],
    queryFn: () =>
      fetchJson(`/api/v2/price-intelligence/items/${itemId}/prices${buildQs(params)}`),
    enabled: !!itemId,
  })
}

export function useCreateVendorItemPrice(itemId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/price-intelligence/items/${itemId}/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-item-prices', itemId] })
      qc.invalidateQueries({ queryKey: ['price-items'] })
    },
  })
}

// ── Price History ───────────────────────────────────────────────────────────

export function usePriceHistory(itemId: string | null, params?: { page?: number; limit?: number; vendor_id?: string }) {
  return useQuery<{ data: PriceHistory[]; total: number }>({
    queryKey: ['price-history', itemId, params],
    queryFn: () =>
      fetchJson(`/api/v2/price-intelligence/items/${itemId}/price-history${buildQs(params)}`),
    enabled: !!itemId,
  })
}

// ── Labor Rates ─────────────────────────────────────────────────────────────

type LaborRateListParams = {
  page?: number
  limit?: number
  trade?: string
  skill_level?: string
  region?: string
  q?: string
}

type LaborRateCreateInput = {
  trade: string
  skill_level: string
  hourly_rate: number
  overtime_rate?: number | null
  region?: string | null
  notes?: string | null
}

const laborRateHooks = createApiHooks<LaborRateListParams, LaborRateCreateInput>(
  'labor-rates',
  '/api/v2/price-intelligence/labor-rates'
)

export const useLaborRates = laborRateHooks.useList
export const useLaborRate = laborRateHooks.useDetail
export const useCreateLaborRate = laborRateHooks.useCreate
export const useUpdateLaborRate = laborRateHooks.useUpdate
export const useDeleteLaborRate = laborRateHooks.useDelete

// ── Labor Rate History ──────────────────────────────────────────────────────

export function useLaborRateHistory(laborRateId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery<{ data: LaborRateHistory[]; total: number }>({
    queryKey: ['labor-rate-history', laborRateId, params],
    queryFn: () =>
      fetchJson(`/api/v2/price-intelligence/labor-rates/${laborRateId}/history${buildQs(params)}`),
    enabled: !!laborRateId,
  })
}

// ── Re-export types ─────────────────────────────────────────────────────────

export type {
  MasterItem,
  VendorItemPrice,
  PriceHistory,
  LaborRate,
  LaborRateHistory,
}
