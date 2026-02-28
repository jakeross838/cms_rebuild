'use client'

/**
 * Module 26: Bid Management React Query Hooks
 *
 * Covers: bid packages, bid invitations, bid responses,
 * bid comparisons, bid awards, and workflow actions
 * (publish, close, award).
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  BidPackage,
  BidInvitation,
  BidResponse,
  BidComparison,
  BidAward,
} from '@/types/bid-management'

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

// ── Bid Packages ────────────────────────────────────────────────────────────

type BidPackageListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  trade?: string
  q?: string
}

type BidPackageCreateInput = {
  job_id: string
  title: string
  description?: string | null
  trade?: string | null
  scope_of_work?: string | null
  bid_due_date?: string | null
  status?: string
}

const bidPackageHooks = createApiHooks<BidPackageListParams, BidPackageCreateInput>(
  'bid-packages',
  '/api/v2/bid-packages'
)

export const useBidPackages = bidPackageHooks.useList
export const useBidPackage = bidPackageHooks.useDetail
export const useCreateBidPackage = bidPackageHooks.useCreate
export const useUpdateBidPackage = bidPackageHooks.useUpdate
export const useDeleteBidPackage = bidPackageHooks.useDelete

// ── Bid Package Actions ─────────────────────────────────────────────────────

export function usePublishBidPackage(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      fetchJson(`/api/v2/bid-packages/${id}/publish`, {
        method: 'POST',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bid-packages'] })
    },
  })
}

export function useCloseBidPackage(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      fetchJson(`/api/v2/bid-packages/${id}/close`, {
        method: 'POST',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bid-packages'] })
    },
  })
}

export function useAwardBidPackage(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/bid-packages/${id}/award`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bid-packages'] })
      qc.invalidateQueries({ queryKey: ['bid-responses', id] })
      qc.invalidateQueries({ queryKey: ['bid-invitations', id] })
    },
  })
}

// ── Bid Invitations ─────────────────────────────────────────────────────────

type InvitationListParams = {
  page?: number
  limit?: number
  status?: string
  vendor_id?: string
}

export function useBidInvitations(bidPackageId: string | null, params?: InvitationListParams) {
  return useQuery<{ data: BidInvitation[]; total: number }>({
    queryKey: ['bid-invitations', bidPackageId, params],
    queryFn: () =>
      fetchJson(`/api/v2/bid-packages/${bidPackageId}/invitations${buildQs(params)}`),
    enabled: !!bidPackageId,
  })
}

export function useBidInvitation(bidPackageId: string, invId: string | null) {
  return useQuery<{ data: BidInvitation }>({
    queryKey: ['bid-invitations', bidPackageId, invId],
    queryFn: () =>
      fetchJson(`/api/v2/bid-packages/${bidPackageId}/invitations/${invId}`),
    enabled: !!invId,
  })
}

export function useCreateBidInvitation(bidPackageId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/bid-packages/${bidPackageId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bid-invitations', bidPackageId] })
      qc.invalidateQueries({ queryKey: ['bid-packages'] })
    },
  })
}

export function useUpdateBidInvitation(bidPackageId: string, invId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/bid-packages/${bidPackageId}/invitations/${invId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bid-invitations', bidPackageId] })
    },
  })
}

// ── Bid Responses ───────────────────────────────────────────────────────────

type ResponseListParams = {
  page?: number
  limit?: number
  vendor_id?: string
  is_qualified?: boolean
}

export function useBidResponses(bidPackageId: string | null, params?: ResponseListParams) {
  return useQuery<{ data: BidResponse[]; total: number }>({
    queryKey: ['bid-responses', bidPackageId, params],
    queryFn: () =>
      fetchJson(`/api/v2/bid-packages/${bidPackageId}/responses${buildQs(params)}`),
    enabled: !!bidPackageId,
  })
}

export function useBidResponse(bidPackageId: string, respId: string | null) {
  return useQuery<{ data: BidResponse }>({
    queryKey: ['bid-responses', bidPackageId, respId],
    queryFn: () =>
      fetchJson(`/api/v2/bid-packages/${bidPackageId}/responses/${respId}`),
    enabled: !!respId,
  })
}

export function useCreateBidResponse(bidPackageId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/bid-packages/${bidPackageId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bid-responses', bidPackageId] })
      qc.invalidateQueries({ queryKey: ['bid-packages'] })
    },
  })
}

export function useUpdateBidResponse(bidPackageId: string, respId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/bid-packages/${bidPackageId}/responses/${respId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bid-responses', bidPackageId] })
    },
  })
}

// ── Bid Comparisons ─────────────────────────────────────────────────────────

export function useBidComparisons(bidPackageId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery<{ data: BidComparison[]; total: number }>({
    queryKey: ['bid-comparisons', bidPackageId, params],
    queryFn: () =>
      fetchJson(`/api/v2/bid-packages/${bidPackageId}/comparisons${buildQs(params)}`),
    enabled: !!bidPackageId,
  })
}

export function useBidComparison(bidPackageId: string, compId: string | null) {
  return useQuery<{ data: BidComparison }>({
    queryKey: ['bid-comparisons', bidPackageId, compId],
    queryFn: () =>
      fetchJson(`/api/v2/bid-packages/${bidPackageId}/comparisons/${compId}`),
    enabled: !!compId,
  })
}

export function useCreateBidComparison(bidPackageId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/bid-packages/${bidPackageId}/comparisons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bid-comparisons', bidPackageId] })
    },
  })
}

export function useUpdateBidComparison(bidPackageId: string, compId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/bid-packages/${bidPackageId}/comparisons/${compId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bid-comparisons', bidPackageId] })
    },
  })
}

// ── Re-export types ─────────────────────────────────────────────────────────

export type {
  BidPackage,
  BidInvitation,
  BidResponse,
  BidComparison,
  BidAward,
}
