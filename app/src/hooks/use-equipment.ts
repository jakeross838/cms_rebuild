'use client'

/**
 * Module 35: Equipment & Asset Management React Query Hooks
 *
 * Covers equipment, assignments, maintenance, inspections, and costs.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  Equipment,
  EquipmentAssignment,
  EquipmentMaintenance,
  EquipmentInspection,
  EquipmentCost,
} from '@/types/equipment'

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

// ── Equipment ────────────────────────────────────────────────────────────────

type EquipmentListParams = {
  page?: number
  limit?: number
  status?: string
  equipment_type?: string
  ownership_type?: string
  q?: string
}

type EquipmentCreateInput = {
  name: string
  equipment_type: string
  ownership_type: string
  description?: string | null
  status?: string
  make?: string | null
  model?: string | null
  serial_number?: string | null
  year?: number | null
  purchase_date?: string | null
  purchase_price?: number | null
  current_value?: number | null
  daily_rate?: number | null
  location?: string | null
  notes?: string | null
}

const equipmentHooks = createApiHooks<EquipmentListParams, EquipmentCreateInput>(
  'equipment',
  '/api/v2/equipment'
)

export const useEquipmentList = equipmentHooks.useList
export const useEquipmentDetail = equipmentHooks.useDetail
export const useCreateEquipment = equipmentHooks.useCreate
export const useUpdateEquipment = equipmentHooks.useUpdate
export const useDeleteEquipment = equipmentHooks.useDelete

// ── Equipment Assignments ────────────────────────────────────────────────────

export function useEquipmentAssignments(equipmentId: string | null, params?: { page?: number; limit?: number; status?: string }) {
  return useQuery<{ data: EquipmentAssignment[]; total: number }>({
    queryKey: ['equipment-assignments', equipmentId, params],
    queryFn: () =>
      fetchJson(`/api/v2/equipment/${equipmentId}/assignments${buildQs(params)}`),
    enabled: !!equipmentId,
  })
}

export function useCreateEquipmentAssignment(equipmentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/equipment/${equipmentId}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['equipment-assignments', equipmentId] })
      qc.invalidateQueries({ queryKey: ['equipment'] })
    },
  })
}

export function useUpdateEquipmentAssignment(assignmentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/equipment/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['equipment-assignments'] })
      qc.invalidateQueries({ queryKey: ['equipment'] })
    },
  })
}

// ── Equipment Maintenance ────────────────────────────────────────────────────

export function useEquipmentMaintenance(equipmentId: string | null, params?: { page?: number; limit?: number; status?: string; maintenance_type?: string }) {
  return useQuery<{ data: EquipmentMaintenance[]; total: number }>({
    queryKey: ['equipment-maintenance', equipmentId, params],
    queryFn: () =>
      fetchJson(`/api/v2/equipment/${equipmentId}/maintenance${buildQs(params)}`),
    enabled: !!equipmentId,
  })
}

export function useCreateEquipmentMaintenance(equipmentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/equipment/${equipmentId}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['equipment-maintenance', equipmentId] })
      qc.invalidateQueries({ queryKey: ['equipment'] })
    },
  })
}

export function useUpdateEquipmentMaintenance(maintenanceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/equipment/maintenance/${maintenanceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['equipment-maintenance'] })
      qc.invalidateQueries({ queryKey: ['equipment'] })
    },
  })
}

// ── Equipment Inspections ────────────────────────────────────────────────────

export function useEquipmentInspections(equipmentId: string | null, params?: { page?: number; limit?: number; inspection_type?: string }) {
  return useQuery<{ data: EquipmentInspection[]; total: number }>({
    queryKey: ['equipment-inspections', equipmentId, params],
    queryFn: () =>
      fetchJson(`/api/v2/equipment/${equipmentId}/inspections${buildQs(params)}`),
    enabled: !!equipmentId,
  })
}

export function useCreateEquipmentInspection(equipmentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/equipment/${equipmentId}/inspections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['equipment-inspections', equipmentId] })
      qc.invalidateQueries({ queryKey: ['equipment'] })
    },
  })
}

export function useUpdateEquipmentInspection(inspectionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/equipment/inspections/${inspectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['equipment-inspections'] })
      qc.invalidateQueries({ queryKey: ['equipment'] })
    },
  })
}

// ── Equipment Costs ──────────────────────────────────────────────────────────

export function useEquipmentCosts(equipmentId: string | null, params?: { page?: number; limit?: number; cost_type?: string; job_id?: string }) {
  return useQuery<{ data: EquipmentCost[]; total: number }>({
    queryKey: ['equipment-costs', equipmentId, params],
    queryFn: () =>
      fetchJson(`/api/v2/equipment/${equipmentId}/costs${buildQs(params)}`),
    enabled: !!equipmentId,
  })
}

export function useCreateEquipmentCost(equipmentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/equipment/${equipmentId}/costs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['equipment-costs', equipmentId] })
      qc.invalidateQueries({ queryKey: ['equipment'] })
    },
  })
}

export function useUpdateEquipmentCost(costId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/equipment/costs/${costId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['equipment-costs'] })
      qc.invalidateQueries({ queryKey: ['equipment'] })
    },
  })
}

// ── Re-export types ──────────────────────────────────────────────────────────

export type { Equipment, EquipmentAssignment, EquipmentMaintenance, EquipmentInspection, EquipmentCost }
