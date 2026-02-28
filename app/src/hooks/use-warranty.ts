'use client'

/**
 * Module 31: Warranty & Home Care React Query Hooks
 *
 * Covers warranties, warranty claims, claim history, maintenance schedules, and maintenance tasks.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  Warranty,
  WarrantyClaim,
  WarrantyClaimHistory,
  MaintenanceSchedule,
  MaintenanceTask,
} from '@/types/warranty'

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

// ── Warranties ───────────────────────────────────────────────────────────────

type WarrantyListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  warranty_type?: string
  q?: string
}

type WarrantyCreateInput = {
  job_id: string
  title: string
  warranty_type: string
  start_date: string
  end_date: string
  description?: string | null
  vendor_id?: string | null
  status?: string
  coverage_details?: string | null
  exclusions?: string | null
  contact_name?: string | null
  contact_phone?: string | null
  contact_email?: string | null
}

const warrantyHooks = createApiHooks<WarrantyListParams, WarrantyCreateInput>(
  'warranties',
  '/api/v2/warranties'
)

export const useWarranties = warrantyHooks.useList
export const useWarranty = warrantyHooks.useDetail
export const useCreateWarranty = warrantyHooks.useCreate
export const useUpdateWarranty = warrantyHooks.useUpdate
export const useDeleteWarranty = warrantyHooks.useDelete

// ── Warranty Claims ──────────────────────────────────────────────────────────

type ClaimListParams = {
  page?: number
  limit?: number
  status?: string
  priority?: string
}

export function useWarrantyClaims(warrantyId: string | null, params?: ClaimListParams) {
  return useQuery<{ data: WarrantyClaim[]; total: number }>({
    queryKey: ['warranty-claims', warrantyId, params],
    queryFn: () =>
      fetchJson(`/api/v2/warranties/${warrantyId}/claims${buildQs(params)}`),
    enabled: !!warrantyId,
  })
}

export function useWarrantyClaim(warrantyId: string | null, claimId: string | null) {
  return useQuery<WarrantyClaim>({
    queryKey: ['warranty-claims', warrantyId, claimId],
    queryFn: () =>
      fetchJson(`/api/v2/warranties/${warrantyId}/claims/${claimId}`),
    enabled: !!warrantyId && !!claimId,
  })
}

export function useCreateWarrantyClaim(warrantyId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/warranties/${warrantyId}/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['warranty-claims', warrantyId] })
      qc.invalidateQueries({ queryKey: ['warranties'] })
    },
  })
}

export function useUpdateWarrantyClaim(warrantyId: string, claimId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/warranties/${warrantyId}/claims/${claimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['warranty-claims', warrantyId] })
      qc.invalidateQueries({ queryKey: ['warranties'] })
    },
  })
}

export function useResolveWarrantyClaim(warrantyId: string, claimId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/warranties/${warrantyId}/claims/${claimId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['warranty-claims', warrantyId] })
      qc.invalidateQueries({ queryKey: ['warranties'] })
    },
  })
}

// ── Warranty Claim History ───────────────────────────────────────────────────

export function useWarrantyClaimHistory(warrantyId: string | null, claimId: string | null) {
  return useQuery<{ data: WarrantyClaimHistory[]; total: number }>({
    queryKey: ['warranty-claim-history', warrantyId, claimId],
    queryFn: () =>
      fetchJson(`/api/v2/warranties/${warrantyId}/claims/${claimId}/history`),
    enabled: !!warrantyId && !!claimId,
  })
}

// ── Maintenance Schedules ────────────────────────────────────────────────────

type MaintenanceScheduleListParams = {
  page?: number
  limit?: number
  job_id?: string
  frequency?: string
  is_active?: boolean
  q?: string
}

type MaintenanceScheduleCreateInput = {
  job_id: string
  title: string
  frequency: string
  start_date: string
  description?: string | null
  category?: string | null
  assigned_to?: string | null
  assigned_vendor_id?: string | null
  end_date?: string | null
  estimated_cost?: number
  notes?: string | null
}

const maintenanceHooks = createApiHooks<MaintenanceScheduleListParams, MaintenanceScheduleCreateInput>(
  'maintenance-schedules',
  '/api/v2/maintenance-schedules'
)

export const useMaintenanceSchedules = maintenanceHooks.useList
export const useMaintenanceSchedule = maintenanceHooks.useDetail
export const useCreateMaintenanceSchedule = maintenanceHooks.useCreate
export const useUpdateMaintenanceSchedule = maintenanceHooks.useUpdate
export const useDeleteMaintenanceSchedule = maintenanceHooks.useDelete

// ── Maintenance Tasks ────────────────────────────────────────────────────────

export function useCompleteMaintenanceTask(scheduleId: string, taskId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/maintenance-schedules/${scheduleId}/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['maintenance-schedules'] })
    },
  })
}

// ── Warranty Claims (flat routes — no warranty_id required) ─────────────────

export function useWarrantyClaimFlat(claimId: string | null) {
  return useQuery({
    queryKey: ['warranty-claims-flat', claimId],
    queryFn: () => fetchJson(`/api/v2/warranty-claims/${claimId}`),
    enabled: !!claimId,
  })
}

export function useUpdateWarrantyClaimFlat(claimId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/warranty-claims/${claimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['warranty-claims-flat', claimId] })
      qc.invalidateQueries({ queryKey: ['warranty-claims'] })
      qc.invalidateQueries({ queryKey: ['warranties'] })
    },
  })
}

export function useCreateWarrantyClaimFlat() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson('/api/v2/warranty-claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['warranty-claims-flat'] })
      qc.invalidateQueries({ queryKey: ['warranty-claims'] })
      qc.invalidateQueries({ queryKey: ['warranties'] })
    },
  })
}

// ── Re-export types ──────────────────────────────────────────────────────────

export type { Warranty, WarrantyClaim, WarrantyClaimHistory, MaintenanceSchedule, MaintenanceTask }
