'use client'

/**
 * Module 14: Lien Waiver Management React Query Hooks
 *
 * Covers: lien waivers, lien waiver templates, lien waiver tracking, approval.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  LienWaiver,
  LienWaiverTemplate,
  LienWaiverTracking,
} from '@/types/lien-waivers'

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

// ── Lien Waivers ────────────────────────────────────────────────────────────

type WaiverListParams = {
  page?: number
  limit?: number
  job_id?: string
  vendor_id?: string
  status?: string
  waiver_type?: string
  q?: string
}

type WaiverCreateInput = {
  job_id: string
  vendor_id?: string | null
  waiver_type: string
  status?: string
  amount?: number | null
  through_date?: string | null
  check_number?: string | null
  claimant_name?: string | null
  notes?: string | null
  document_id?: string | null
  payment_id?: string | null
}

const waiverHooks = createApiHooks<WaiverListParams, WaiverCreateInput>(
  'lien-waivers',
  '/api/v2/lien-waivers'
)

export const useLienWaivers = waiverHooks.useList
export const useLienWaiver = waiverHooks.useDetail
export const useCreateLienWaiver = waiverHooks.useCreate
export const useUpdateLienWaiver = waiverHooks.useUpdate
export const useDeleteLienWaiver = waiverHooks.useDelete

// ── Approve a Lien Waiver ───────────────────────────────────────────────────

/** Approve a lien waiver */
export function useApproveLienWaiver(waiverId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: { notes?: string }) =>
      fetchJson(`/api/v2/lien-waivers/${waiverId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data ?? {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lien-waivers'] })
      qc.invalidateQueries({ queryKey: ['lien-waivers', waiverId] })
    },
  })
}

// ── Lien Waiver Templates ───────────────────────────────────────────────────

type TemplateListParams = {
  page?: number
  limit?: number
  waiver_type?: string
  state_code?: string
  q?: string
}

type TemplateCreateInput = {
  waiver_type: string
  template_name: string
  template_content?: string | null
  state_code?: string | null
  is_default?: boolean
}

const templateHooks = createApiHooks<TemplateListParams, TemplateCreateInput>(
  'lien-waiver-templates',
  '/api/v2/lien-waiver-templates'
)

export const useLienWaiverTemplates = templateHooks.useList
export const useLienWaiverTemplate = templateHooks.useDetail
export const useCreateLienWaiverTemplate = templateHooks.useCreate
export const useUpdateLienWaiverTemplate = templateHooks.useUpdate
export const useDeleteLienWaiverTemplate = templateHooks.useDelete

// ── Lien Waiver Tracking ────────────────────────────────────────────────────

type TrackingListParams = {
  page?: number
  limit?: number
  job_id?: string
  vendor_id?: string
  is_compliant?: boolean
}

/** List lien waiver tracking records */
export function useLienWaiverTracking(params?: TrackingListParams) {
  return useQuery<{ data: LienWaiverTracking[]; total: number }>({
    queryKey: ['lien-waiver-tracking', params],
    queryFn: () => fetchJson(`/api/v2/lien-waiver-tracking${buildQs(params)}`),
  })
}

/** Fetch a single lien waiver tracking record */
export function useLienWaiverTrackingDetail(trackingId: string | null) {
  return useQuery({
    queryKey: ['lien-waiver-tracking', trackingId],
    queryFn: () => fetchJson(`/api/v2/lien-waiver-tracking/${trackingId}`),
    enabled: !!trackingId,
  })
}

/** Create a lien waiver tracking record */
export function useCreateLienWaiverTracking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson('/api/v2/lien-waiver-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lien-waiver-tracking'] })
    },
  })
}

/** Update a lien waiver tracking record */
export function useUpdateLienWaiverTracking(trackingId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/lien-waiver-tracking/${trackingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lien-waiver-tracking'] })
    },
  })
}

// ── Re-export types ─────────────────────────────────────────────────────────

export type {
  LienWaiver,
  LienWaiverTemplate,
  LienWaiverTracking,
}
