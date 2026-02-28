'use client'

/**
 * Module 27: RFI Management React Query Hooks
 *
 * Covers: RFIs, RFI responses, RFI routing, RFI templates,
 * and workflow actions (open, close).
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  Rfi,
  RfiResponse,
  RfiRouting,
  RfiTemplate,
} from '@/types/rfi-management'

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

// ── RFIs ────────────────────────────────────────────────────────────────────

type RfiListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  priority?: string
  category?: string
  assigned_to?: string
  q?: string
}

type RfiCreateInput = {
  job_id: string
  rfi_number: string
  subject: string
  question: string
  status?: string
  priority?: string
  category?: string
  assigned_to?: string | null
  due_date?: string | null
  cost_impact?: number
  schedule_impact_days?: number
  related_document_id?: string | null
}

const rfiHooks = createApiHooks<RfiListParams, RfiCreateInput>(
  'rfis',
  '/api/v2/rfis'
)

export const useRfis = rfiHooks.useList
export const useRfi = rfiHooks.useDetail
export const useCreateRfi = rfiHooks.useCreate
export const useUpdateRfi = rfiHooks.useUpdate
export const useDeleteRfi = rfiHooks.useDelete

// ── RFI Actions ─────────────────────────────────────────────────────────────

export function useOpenRfi(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      fetchJson(`/api/v2/rfis/${id}/open`, {
        method: 'POST',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rfis'] })
    },
  })
}

export function useCloseRfi(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: Record<string, unknown>) =>
      fetchJson(`/api/v2/rfis/${id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rfis'] })
    },
  })
}

// ── RFI Responses ───────────────────────────────────────────────────────────

type RfiResponseListParams = {
  page?: number
  limit?: number
}

export function useRfiResponses(rfiId: string | null, params?: RfiResponseListParams) {
  return useQuery<{ data: RfiResponse[]; total: number }>({
    queryKey: ['rfi-responses', rfiId, params],
    queryFn: () =>
      fetchJson(`/api/v2/rfis/${rfiId}/responses${buildQs(params)}`),
    enabled: !!rfiId,
  })
}

export function useRfiResponse(rfiId: string, respId: string | null) {
  return useQuery<{ data: RfiResponse }>({
    queryKey: ['rfi-responses', rfiId, respId],
    queryFn: () =>
      fetchJson(`/api/v2/rfis/${rfiId}/responses/${respId}`),
    enabled: !!respId,
  })
}

export function useCreateRfiResponse(rfiId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/rfis/${rfiId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rfi-responses', rfiId] })
      qc.invalidateQueries({ queryKey: ['rfis'] })
    },
  })
}

export function useUpdateRfiResponse(rfiId: string, respId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/rfis/${rfiId}/responses/${respId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rfi-responses', rfiId] })
      qc.invalidateQueries({ queryKey: ['rfis'] })
    },
  })
}

// ── RFI Routing ─────────────────────────────────────────────────────────────

export function useRfiRouting(rfiId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery<{ data: RfiRouting[]; total: number }>({
    queryKey: ['rfi-routing', rfiId, params],
    queryFn: () =>
      fetchJson(`/api/v2/rfis/${rfiId}/routing${buildQs(params)}`),
    enabled: !!rfiId,
  })
}

export function useRfiRoute(rfiId: string, routeId: string | null) {
  return useQuery<{ data: RfiRouting }>({
    queryKey: ['rfi-routing', rfiId, routeId],
    queryFn: () =>
      fetchJson(`/api/v2/rfis/${rfiId}/routing/${routeId}`),
    enabled: !!routeId,
  })
}

export function useCreateRfiRoute(rfiId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/rfis/${rfiId}/routing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rfi-routing', rfiId] })
      qc.invalidateQueries({ queryKey: ['rfis'] })
    },
  })
}

export function useUpdateRfiRoute(rfiId: string, routeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/rfis/${rfiId}/routing/${routeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rfi-routing', rfiId] })
    },
  })
}

// ── RFI Templates ───────────────────────────────────────────────────────────

type TemplateListParams = {
  page?: number
  limit?: number
  category?: string
  is_active?: boolean
  q?: string
}

type TemplateCreateInput = {
  name: string
  category: string
  subject_template?: string | null
  question_template?: string | null
  default_priority?: string
  is_active?: boolean
}

const templateHooks = createApiHooks<TemplateListParams, TemplateCreateInput>(
  'rfi-templates',
  '/api/v2/rfis/templates'
)

export const useRfiTemplates = templateHooks.useList
export const useRfiTemplate = templateHooks.useDetail
export const useCreateRfiTemplate = templateHooks.useCreate
export const useUpdateRfiTemplate = templateHooks.useUpdate
export const useDeleteRfiTemplate = templateHooks.useDelete

// ── Re-export types ─────────────────────────────────────────────────────────

export type {
  Rfi,
  RfiResponse,
  RfiRouting,
  RfiTemplate,
}
