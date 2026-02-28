'use client'

/**
 * Module 20: Estimating Engine React Query Hooks
 *
 * Covers: estimates, estimate sections, estimate line items,
 * assemblies, assembly items, estimate versions.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  Estimate,
  EstimateSection,
  EstimateLineItem,
  Assembly,
  AssemblyItem,
  EstimateVersion,
} from '@/types/estimating'

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

// ── Estimates ───────────────────────────────────────────────────────────────

type EstimateListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  estimate_type?: string
  q?: string
}

type EstimateCreateInput = {
  job_id?: string | null
  name: string
  description?: string | null
  status?: string
  estimate_type: string
  contract_type?: string | null
  markup_type?: string | null
  markup_pct?: number | null
  overhead_pct?: number | null
  profit_pct?: number | null
  valid_until?: string | null
  notes?: string | null
}

const estimateHooks = createApiHooks<EstimateListParams, EstimateCreateInput>(
  'estimates',
  '/api/v2/estimates'
)

export const useEstimates = estimateHooks.useList
export const useEstimate = estimateHooks.useDetail
export const useCreateEstimate = estimateHooks.useCreate
export const useUpdateEstimate = estimateHooks.useUpdate
export const useDeleteEstimate = estimateHooks.useDelete

// ── Estimate Sections ───────────────────────────────────────────────────────

type SectionListParams = {
  page?: number
  limit?: number
}

export function useEstimateSections(estimateId: string | null, params?: SectionListParams) {
  return useQuery<{ data: EstimateSection[]; total: number }>({
    queryKey: ['estimate-sections', estimateId, params],
    queryFn: () =>
      fetchJson(`/api/v2/estimates/${estimateId}/sections${buildQs(params)}`),
    enabled: !!estimateId,
  })
}

export function useCreateEstimateSection(estimateId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/estimates/${estimateId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['estimate-sections', estimateId] })
      qc.invalidateQueries({ queryKey: ['estimates'] })
    },
  })
}

// ── Estimate Line Items ─────────────────────────────────────────────────────

type LineListParams = {
  page?: number
  limit?: number
  section_id?: string
  item_type?: string
}

export function useEstimateLines(estimateId: string | null, params?: LineListParams) {
  return useQuery<{ data: EstimateLineItem[]; total: number }>({
    queryKey: ['estimate-lines', estimateId, params],
    queryFn: () =>
      fetchJson(`/api/v2/estimates/${estimateId}/lines${buildQs(params)}`),
    enabled: !!estimateId,
  })
}

export function useCreateEstimateLine(estimateId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/estimates/${estimateId}/lines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['estimate-lines', estimateId] })
      qc.invalidateQueries({ queryKey: ['estimates'] })
    },
  })
}

export function useUpdateEstimateLine(estimateId: string, lineId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/estimates/${estimateId}/lines/${lineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['estimate-lines', estimateId] })
      qc.invalidateQueries({ queryKey: ['estimates'] })
    },
  })
}

export function useDeleteEstimateLine(estimateId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (lineId: string) =>
      fetchJson(`/api/v2/estimates/${estimateId}/lines/${lineId}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['estimate-lines', estimateId] })
      qc.invalidateQueries({ queryKey: ['estimates'] })
    },
  })
}

// ── Estimate Versions ───────────────────────────────────────────────────────

export function useEstimateVersions(estimateId: string | null) {
  return useQuery<{ data: EstimateVersion[]; total: number }>({
    queryKey: ['estimate-versions', estimateId],
    queryFn: () => fetchJson(`/api/v2/estimates/${estimateId}/versions`),
    enabled: !!estimateId,
  })
}

export function useCreateEstimateVersion(estimateId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/estimates/${estimateId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['estimate-versions', estimateId] })
      qc.invalidateQueries({ queryKey: ['estimates'] })
    },
  })
}

// ── Assemblies ──────────────────────────────────────────────────────────────

type AssemblyListParams = {
  page?: number
  limit?: number
  category?: string
  is_active?: boolean
  q?: string
}

type AssemblyCreateInput = {
  name: string
  description?: string | null
  category?: string | null
  parameter_unit?: string | null
  is_active?: boolean
}

const assemblyHooks = createApiHooks<AssemblyListParams, AssemblyCreateInput>(
  'assemblies',
  '/api/v2/assemblies'
)

export const useAssemblies = assemblyHooks.useList
export const useAssembly = assemblyHooks.useDetail
export const useCreateAssembly = assemblyHooks.useCreate
export const useUpdateAssembly = assemblyHooks.useUpdate
export const useDeleteAssembly = assemblyHooks.useDelete

// ── Assembly Items ──────────────────────────────────────────────────────────

export function useAssemblyItems(assemblyId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery<{ data: AssemblyItem[]; total: number }>({
    queryKey: ['assembly-items', assemblyId, params],
    queryFn: () =>
      fetchJson(`/api/v2/assemblies/${assemblyId}/items${buildQs(params)}`),
    enabled: !!assemblyId,
  })
}

export function useCreateAssemblyItem(assemblyId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/assemblies/${assemblyId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assembly-items', assemblyId] })
      qc.invalidateQueries({ queryKey: ['assemblies'] })
    },
  })
}

// ── Re-export types ─────────────────────────────────────────────────────────

export type {
  Estimate,
  EstimateSection,
  EstimateLineItem,
  Assembly,
  AssemblyItem,
  EstimateVersion,
}
