'use client'

/**
 * Module 15: Draw Request Management React Query Hooks
 *
 * Covers: draw requests, draw request lines, submit, approve, history.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  DrawRequest,
  DrawRequestLine,
  DrawRequestHistory,
} from '@/types/draw-requests'

// ── Draw Requests ───────────────────────────────────────────────────────────

type DrawRequestListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  q?: string
}

type DrawRequestCreateInput = {
  job_id: string
  draw_number?: number
  application_date: string
  period_to: string
  contract_amount?: number
  retainage_pct?: number
  notes?: string | null
  lender_reference?: string | null
}

const drawRequestHooks = createApiHooks<DrawRequestListParams, DrawRequestCreateInput>(
  'draw-requests',
  '/api/v2/draw-requests'
)

export const useDrawRequests = drawRequestHooks.useList
export const useDrawRequest = drawRequestHooks.useDetail
export const useCreateDrawRequest = drawRequestHooks.useCreate
export const useUpdateDrawRequest = drawRequestHooks.useUpdate
export const useDeleteDrawRequest = drawRequestHooks.useDelete

// ── Draw Request Lines ──────────────────────────────────────────────────────

/** Fetch lines for a draw request */
export function useDrawRequestLines(drawRequestId: string | null) {
  return useQuery<{ data: DrawRequestLine[] }>({
    queryKey: ['draw-request-lines', drawRequestId],
    queryFn: () => fetchJson(`/api/v2/draw-requests/${drawRequestId}/lines`),
    enabled: !!drawRequestId,
  })
}

/** Create a line on a draw request */
export function useCreateDrawRequestLine(drawRequestId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/draw-requests/${drawRequestId}/lines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['draw-request-lines', drawRequestId] })
      qc.invalidateQueries({ queryKey: ['draw-requests'] })
    },
  })
}

// ── Submit Draw Request ─────────────────────────────────────────────────────

/** Submit a draw request for review */
export function useSubmitDrawRequest(drawRequestId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: { notes?: string }) =>
      fetchJson(`/api/v2/draw-requests/${drawRequestId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data ?? {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['draw-requests'] })
      qc.invalidateQueries({ queryKey: ['draw-requests', drawRequestId] })
    },
  })
}

// ── Approve Draw Request ────────────────────────────────────────────────────

/** Approve a draw request */
export function useApproveDrawRequest(drawRequestId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: { notes?: string }) =>
      fetchJson(`/api/v2/draw-requests/${drawRequestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data ?? {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['draw-requests'] })
      qc.invalidateQueries({ queryKey: ['draw-requests', drawRequestId] })
    },
  })
}

// ── Re-export types ─────────────────────────────────────────────────────────

export type {
  DrawRequest,
  DrawRequestLine,
  DrawRequestHistory,
}
