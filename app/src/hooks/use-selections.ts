'use client'

/**
 * Module 21: Selection Management React Query Hooks
 *
 * Covers: selections, selection categories, selection options,
 * selection history.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  Selection,
  SelectionCategory,
  SelectionOption,
  SelectionHistory,
} from '@/types/selections'

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

// ── Selections ──────────────────────────────────────────────────────────────

type SelectionListParams = {
  page?: number
  limit?: number
  job_id?: string
  category_id?: string
  status?: string
  room?: string
  q?: string
}

type SelectionCreateInput = {
  category_id: string
  option_id: string
  job_id: string
  room?: string | null
  status?: string
  change_reason?: string | null
}

const selectionHooks = createApiHooks<SelectionListParams, SelectionCreateInput>(
  'selections',
  '/api/v2/selections'
)

export const useSelections = selectionHooks.useList
export const useSelection = selectionHooks.useDetail
export const useCreateSelection = selectionHooks.useCreate
export const useUpdateSelection = selectionHooks.useUpdate
export const useDeleteSelection = selectionHooks.useDelete

// ── Selection History ───────────────────────────────────────────────────────

export function useSelectionHistory(selectionId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery<{ data: SelectionHistory[]; total: number }>({
    queryKey: ['selection-history', selectionId, params],
    queryFn: () =>
      fetchJson(`/api/v2/selections/${selectionId}/history${buildQs(params)}`),
    enabled: !!selectionId,
  })
}

// ── Selection Categories ────────────────────────────────────────────────────

type CategoryListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  room?: string
  pricing_model?: string
  q?: string
}

type CategoryCreateInput = {
  job_id: string
  name: string
  room?: string | null
  sort_order?: number
  pricing_model?: string
  allowance_amount?: number
  deadline?: string | null
  lead_time_buffer_days?: number
  assigned_to?: string | null
  status?: string
  designer_access?: boolean
  notes?: string | null
}

const categoryHooks = createApiHooks<CategoryListParams, CategoryCreateInput>(
  'selection-categories',
  '/api/v2/selections/categories'
)

export const useSelectionCategories = categoryHooks.useList
export const useSelectionCategory = categoryHooks.useDetail
export const useCreateSelectionCategory = categoryHooks.useCreate
export const useUpdateSelectionCategory = categoryHooks.useUpdate
export const useDeleteSelectionCategory = categoryHooks.useDelete

// ── Selection Options ───────────────────────────────────────────────────────

type OptionListParams = {
  page?: number
  limit?: number
  category_id?: string
  source?: string
  is_recommended?: boolean
  q?: string
}

type OptionCreateInput = {
  category_id: string
  name: string
  description?: string | null
  vendor_id?: string | null
  sku?: string | null
  model_number?: string | null
  unit_price: number
  quantity?: number
  lead_time_days?: number
  source?: string
  is_recommended?: boolean
  sort_order?: number
}

const optionHooks = createApiHooks<OptionListParams, OptionCreateInput>(
  'selection-options',
  '/api/v2/selections/options'
)

export const useSelectionOptions = optionHooks.useList
export const useSelectionOption = optionHooks.useDetail
export const useCreateSelectionOption = optionHooks.useCreate
export const useUpdateSelectionOption = optionHooks.useUpdate
export const useDeleteSelectionOption = optionHooks.useDelete

// ── Re-export types ─────────────────────────────────────────────────────────

export type {
  Selection,
  SelectionCategory,
  SelectionOption,
  SelectionHistory,
}
