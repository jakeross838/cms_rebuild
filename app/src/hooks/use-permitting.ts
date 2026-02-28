'use client'

/**
 * Module 32: Permitting & Inspections React Query Hooks
 *
 * Covers permits, inspections, inspection results, permit documents, and permit fees.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  Permit,
  PermitInspection,
  InspectionResult,
  PermitDocument,
  PermitFee,
} from '@/types/permitting'

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

// ── Permits ──────────────────────────────────────────────────────────────────

type PermitListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  permit_type?: string
  q?: string
}

type PermitCreateInput = {
  job_id: string
  permit_type: string
  status?: string
  permit_number?: string | null
  jurisdiction?: string | null
  applied_date?: string | null
  issued_date?: string | null
  expiration_date?: string | null
  conditions?: string | null
  notes?: string | null
}

const permitHooks = createApiHooks<PermitListParams, PermitCreateInput>(
  'permits',
  '/api/v2/permits'
)

export const usePermits = permitHooks.useList
export const usePermit = permitHooks.useDetail
export const useCreatePermit = permitHooks.useCreate
export const useUpdatePermit = permitHooks.useUpdate
export const useDeletePermit = permitHooks.useDelete

// ── Permit Inspections ───────────────────────────────────────────────────────

type InspectionListParams = {
  page?: number
  limit?: number
  status?: string
  inspection_type?: string
}

export function usePermitInspections(permitId: string | null, params?: InspectionListParams) {
  return useQuery<{ data: PermitInspection[]; total: number }>({
    queryKey: ['permit-inspections', permitId, params],
    queryFn: () =>
      fetchJson(`/api/v2/permits/${permitId}/inspections${buildQs(params)}`),
    enabled: !!permitId,
  })
}

export function useCreatePermitInspection(permitId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/permits/${permitId}/inspections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permit-inspections', permitId] })
      qc.invalidateQueries({ queryKey: ['permits'] })
    },
  })
}

// ── Permit Documents ─────────────────────────────────────────────────────────

export function usePermitDocuments(permitId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery<{ data: PermitDocument[]; total: number }>({
    queryKey: ['permit-documents', permitId, params],
    queryFn: () =>
      fetchJson(`/api/v2/permits/${permitId}/documents${buildQs(params)}`),
    enabled: !!permitId,
  })
}

export function useCreatePermitDocument(permitId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/permits/${permitId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permit-documents', permitId] })
      qc.invalidateQueries({ queryKey: ['permits'] })
    },
  })
}

// ── Permit Fees ──────────────────────────────────────────────────────────────

export function usePermitFees(permitId: string | null, params?: { page?: number; limit?: number; status?: string }) {
  return useQuery<{ data: PermitFee[]; total: number }>({
    queryKey: ['permit-fees', permitId, params],
    queryFn: () =>
      fetchJson(`/api/v2/permits/${permitId}/fees${buildQs(params)}`),
    enabled: !!permitId,
  })
}

export function useCreatePermitFee(permitId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/permits/${permitId}/fees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permit-fees', permitId] })
      qc.invalidateQueries({ queryKey: ['permits'] })
    },
  })
}

// ── Re-export types ──────────────────────────────────────────────────────────

export type { Permit, PermitInspection, InspectionResult, PermitDocument, PermitFee }
