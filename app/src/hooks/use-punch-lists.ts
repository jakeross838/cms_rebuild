'use client'

/**
 * Module 28: Punch List & Quality Checklists React Query Hooks
 *
 * Covers: punch items, punch photos, quality checklists,
 * checklist items, checklist templates, template items,
 * and workflow actions (complete, verify, approve).
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  PunchItem,
  PunchItemPhoto,
  QualityChecklist,
  QualityChecklistItem,
  QualityChecklistTemplate,
  QualityChecklistTemplateItem,
} from '@/types/punch-list'

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

// ── Punch Items ─────────────────────────────────────────────────────────────

type PunchItemListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  priority?: string
  category?: string
  assigned_to?: string
  assigned_vendor_id?: string
  q?: string
}

type PunchItemCreateInput = {
  job_id: string
  title: string
  description?: string | null
  location?: string | null
  room?: string | null
  status?: string
  priority?: string
  category?: string | null
  assigned_to?: string | null
  assigned_vendor_id?: string | null
  due_date?: string | null
  cost_estimate?: number | null
}

const punchItemHooks = createApiHooks<PunchItemListParams, PunchItemCreateInput>(
  'punch-items',
  '/api/v2/punch-list'
)

export const usePunchItems = punchItemHooks.useList
export const usePunchItem = punchItemHooks.useDetail
export const useCreatePunchItem = punchItemHooks.useCreate
export const useUpdatePunchItem = punchItemHooks.useUpdate
export const useDeletePunchItem = punchItemHooks.useDelete

// ── Punch Item Actions ──────────────────────────────────────────────────────

export function useCompletePunchItem(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: Record<string, unknown>) =>
      fetchJson(`/api/v2/punch-list/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['punch-items'] })
    },
  })
}

export function useVerifyPunchItem(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: Record<string, unknown>) =>
      fetchJson(`/api/v2/punch-list/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['punch-items'] })
    },
  })
}

// ── Punch Item Photos ───────────────────────────────────────────────────────

export function usePunchItemPhotos(punchItemId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery<{ data: PunchItemPhoto[]; total: number }>({
    queryKey: ['punch-photos', punchItemId, params],
    queryFn: () =>
      fetchJson(`/api/v2/punch-list/${punchItemId}/photos${buildQs(params)}`),
    enabled: !!punchItemId,
  })
}

export function useCreatePunchItemPhoto(punchItemId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/punch-list/${punchItemId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['punch-photos', punchItemId] })
      qc.invalidateQueries({ queryKey: ['punch-items'] })
    },
  })
}

export function useDeletePunchItemPhoto(punchItemId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (photoId: string) =>
      fetchJson(`/api/v2/punch-list/${punchItemId}/photos/${photoId}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['punch-photos', punchItemId] })
    },
  })
}

// ── Quality Checklists ──────────────────────────────────────────────────────

type ChecklistListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  template_id?: string
  inspector_id?: string
  q?: string
}

type ChecklistCreateInput = {
  job_id: string
  template_id?: string | null
  name: string
  description?: string | null
  status?: string
  inspector_id?: string | null
  inspection_date?: string | null
  location?: string | null
}

const checklistHooks = createApiHooks<ChecklistListParams, ChecklistCreateInput>(
  'quality-checklists',
  '/api/v2/quality-checklists'
)

export const useQualityChecklists = checklistHooks.useList
export const useQualityChecklist = checklistHooks.useDetail
export const useCreateQualityChecklist = checklistHooks.useCreate
export const useUpdateQualityChecklist = checklistHooks.useUpdate
export const useDeleteQualityChecklist = checklistHooks.useDelete

// ── Quality Checklist Actions ───────────────────────────────────────────────

export function useApproveQualityChecklist(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: Record<string, unknown>) =>
      fetchJson(`/api/v2/quality-checklists/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quality-checklists'] })
    },
  })
}

// ── Quality Checklist Items ─────────────────────────────────────────────────

export function useQualityChecklistItems(checklistId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery<{ data: QualityChecklistItem[]; total: number }>({
    queryKey: ['quality-checklist-items', checklistId, params],
    queryFn: () =>
      fetchJson(`/api/v2/quality-checklists/${checklistId}/items${buildQs(params)}`),
    enabled: !!checklistId,
  })
}

export function useCreateQualityChecklistItem(checklistId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/quality-checklists/${checklistId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quality-checklist-items', checklistId] })
      qc.invalidateQueries({ queryKey: ['quality-checklists'] })
    },
  })
}

export function useUpdateQualityChecklistItem(checklistId: string, itemId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/quality-checklists/${checklistId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quality-checklist-items', checklistId] })
      qc.invalidateQueries({ queryKey: ['quality-checklists'] })
    },
  })
}

export function useDeleteQualityChecklistItem(checklistId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) =>
      fetchJson(`/api/v2/quality-checklists/${checklistId}/items/${itemId}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quality-checklist-items', checklistId] })
      qc.invalidateQueries({ queryKey: ['quality-checklists'] })
    },
  })
}

// ── Quality Checklist Templates ─────────────────────────────────────────────

type TemplateListParams = {
  page?: number
  limit?: number
  category?: string
  trade?: string
  is_active?: boolean
  q?: string
}

type TemplateCreateInput = {
  name: string
  description?: string | null
  category?: string | null
  trade?: string | null
  is_active?: boolean
}

const templateHooks = createApiHooks<TemplateListParams, TemplateCreateInput>(
  'quality-checklist-templates',
  '/api/v2/quality-checklists/templates'
)

export const useQualityChecklistTemplates = templateHooks.useList
export const useQualityChecklistTemplate = templateHooks.useDetail
export const useCreateQualityChecklistTemplate = templateHooks.useCreate
export const useUpdateQualityChecklistTemplate = templateHooks.useUpdate
export const useDeleteQualityChecklistTemplate = templateHooks.useDelete

// ── Quality Checklist Template Items ────────────────────────────────────────

export function useQualityChecklistTemplateItems(templateId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery<{ data: QualityChecklistTemplateItem[]; total: number }>({
    queryKey: ['quality-checklist-template-items', templateId, params],
    queryFn: () =>
      fetchJson(`/api/v2/quality-checklists/templates/${templateId}/items${buildQs(params)}`),
    enabled: !!templateId,
  })
}

export function useCreateQualityChecklistTemplateItem(templateId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/quality-checklists/templates/${templateId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quality-checklist-template-items', templateId] })
      qc.invalidateQueries({ queryKey: ['quality-checklist-templates'] })
    },
  })
}

export function useUpdateQualityChecklistTemplateItem(templateId: string, itemId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/quality-checklists/templates/${templateId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quality-checklist-template-items', templateId] })
      qc.invalidateQueries({ queryKey: ['quality-checklist-templates'] })
    },
  })
}

export function useDeleteQualityChecklistTemplateItem(templateId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) =>
      fetchJson(`/api/v2/quality-checklists/templates/${templateId}/items/${itemId}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quality-checklist-template-items', templateId] })
      qc.invalidateQueries({ queryKey: ['quality-checklist-templates'] })
    },
  })
}

// ── Re-export types ─────────────────────────────────────────────────────────

export type {
  PunchItem,
  PunchItemPhoto,
  QualityChecklist,
  QualityChecklistItem,
  QualityChecklistTemplate,
  QualityChecklistTemplateItem,
}
