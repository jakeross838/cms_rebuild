'use client'

/**
 * Module 22: Vendor Performance Scoring React Query Hooks
 *
 * Covers: vendor scores, score history, job performance ratings,
 * warranty callbacks, vendor notes.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import type {
  VendorScore,
  VendorScoreHistory,
  VendorJobPerformance,
  VendorWarrantyCallback,
  VendorNote,
} from '@/types/vendor-performance'

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

// ── Vendor Scores ───────────────────────────────────────────────────────────

type ScoreListParams = {
  page?: number
  limit?: number
  min_score?: number
  max_score?: number
  q?: string
}

export function useVendorScores(params?: ScoreListParams) {
  return useQuery<{ data: VendorScore[]; total: number }>({
    queryKey: ['vendor-scores', params],
    queryFn: () =>
      fetchJson(`/api/v2/vendor-performance/scores${buildQs(params)}`),
  })
}

export function useVendorScore(vendorId: string | null) {
  return useQuery<{ data: VendorScore }>({
    queryKey: ['vendor-scores', vendorId],
    queryFn: () =>
      fetchJson(`/api/v2/vendor-performance/scores/${vendorId}`),
    enabled: !!vendorId,
  })
}

export function useUpdateVendorScore(vendorId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/vendor-performance/scores/${vendorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-scores'] })
    },
  })
}

// ── Vendor Score History ────────────────────────────────────────────────────

export function useVendorScoreHistory(vendorId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery<{ data: VendorScoreHistory[]; total: number }>({
    queryKey: ['vendor-score-history', vendorId, params],
    queryFn: () =>
      fetchJson(`/api/v2/vendor-performance/scores/${vendorId}/history${buildQs(params)}`),
    enabled: !!vendorId,
  })
}

// ── Job Performance Ratings ─────────────────────────────────────────────────

type JobRatingListParams = {
  page?: number
  limit?: number
  vendor_id?: string
  job_id?: string
  trade?: string
}

export function useVendorJobRatings(params?: JobRatingListParams) {
  return useQuery<{ data: VendorJobPerformance[]; total: number }>({
    queryKey: ['vendor-job-ratings', params],
    queryFn: () =>
      fetchJson(`/api/v2/vendor-performance/job-ratings${buildQs(params)}`),
  })
}

export function useVendorJobRating(id: string | null) {
  return useQuery<{ data: VendorJobPerformance }>({
    queryKey: ['vendor-job-ratings', id],
    queryFn: () =>
      fetchJson(`/api/v2/vendor-performance/job-ratings/${id}`),
    enabled: !!id,
  })
}

export function useCreateVendorJobRating() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson('/api/v2/vendor-performance/job-ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-job-ratings'] })
      qc.invalidateQueries({ queryKey: ['vendor-scores'] })
    },
  })
}

export function useUpdateVendorJobRating(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/vendor-performance/job-ratings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-job-ratings'] })
      qc.invalidateQueries({ queryKey: ['vendor-scores'] })
    },
  })
}

export function useDeleteVendorJobRating() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/v2/vendor-performance/job-ratings/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-job-ratings'] })
      qc.invalidateQueries({ queryKey: ['vendor-scores'] })
    },
  })
}

// ── Warranty Callbacks ──────────────────────────────────────────────────────

type CallbackListParams = {
  page?: number
  limit?: number
  vendor_id?: string
  job_id?: string
  status?: string
  severity?: string
}

export function useWarrantyCallbacks(params?: CallbackListParams) {
  return useQuery<{ data: VendorWarrantyCallback[]; total: number }>({
    queryKey: ['vendor-callbacks', params],
    queryFn: () =>
      fetchJson(`/api/v2/vendor-performance/callbacks${buildQs(params)}`),
  })
}

export function useWarrantyCallback(id: string | null) {
  return useQuery<{ data: VendorWarrantyCallback }>({
    queryKey: ['vendor-callbacks', id],
    queryFn: () =>
      fetchJson(`/api/v2/vendor-performance/callbacks/${id}`),
    enabled: !!id,
  })
}

export function useCreateWarrantyCallback() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson('/api/v2/vendor-performance/callbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-callbacks'] })
      qc.invalidateQueries({ queryKey: ['vendor-scores'] })
    },
  })
}

export function useUpdateWarrantyCallback(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/vendor-performance/callbacks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-callbacks'] })
      qc.invalidateQueries({ queryKey: ['vendor-scores'] })
    },
  })
}

export function useResolveWarrantyCallback(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/vendor-performance/callbacks/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-callbacks'] })
      qc.invalidateQueries({ queryKey: ['vendor-scores'] })
    },
  })
}

// ── Vendor Notes ────────────────────────────────────────────────────────────

type NoteListParams = {
  page?: number
  limit?: number
  vendor_id?: string
  is_internal?: boolean
}

export function useVendorNotes(params?: NoteListParams) {
  return useQuery<{ data: VendorNote[]; total: number }>({
    queryKey: ['vendor-notes', params],
    queryFn: () =>
      fetchJson(`/api/v2/vendor-performance/notes${buildQs(params)}`),
  })
}

export function useVendorNote(id: string | null) {
  return useQuery<{ data: VendorNote }>({
    queryKey: ['vendor-notes', id],
    queryFn: () =>
      fetchJson(`/api/v2/vendor-performance/notes/${id}`),
    enabled: !!id,
  })
}

export function useCreateVendorNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson('/api/v2/vendor-performance/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-notes'] })
    },
  })
}

export function useUpdateVendorNote(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/vendor-performance/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-notes'] })
    },
  })
}

export function useDeleteVendorNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/v2/vendor-performance/notes/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-notes'] })
    },
  })
}

// ── Re-export types ─────────────────────────────────────────────────────────

export type {
  VendorScore,
  VendorScoreHistory,
  VendorJobPerformance,
  VendorWarrantyCallback,
  VendorNote,
}
