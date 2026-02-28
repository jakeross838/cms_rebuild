'use client'

/**
 * Module 42: Data Migration React Query Hooks
 *
 * Covers migration jobs, field mappings, mapping templates, validation results, and reconciliation.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  MigrationJob,
  MigrationFieldMapping,
  MigrationMappingTemplate,
  MigrationValidationResult,
  MigrationReconciliation,
} from '@/types/data-migration'

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

// ── Migration Jobs ───────────────────────────────────────────────────────────

type MigrationJobListParams = {
  page?: number
  limit?: number
  status?: string
  source_platform?: string
  q?: string
}

type MigrationJobCreateInput = {
  name: string
  source_platform: string
  description?: string | null
  source_file_url?: string | null
  source_file_name?: string | null
}

const jobHooks = createApiHooks<MigrationJobListParams, MigrationJobCreateInput>(
  'migration-jobs',
  '/api/v2/data-migration/jobs'
)

export const useMigrationJobs = jobHooks.useList
export const useMigrationJob = jobHooks.useDetail
export const useCreateMigrationJob = jobHooks.useCreate
export const useUpdateMigrationJob = jobHooks.useUpdate
export const useDeleteMigrationJob = jobHooks.useDelete

// ── Migration Field Mappings ─────────────────────────────────────────────────

export function useMigrationMappings(jobId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery<{ data: MigrationFieldMapping[]; total: number }>({
    queryKey: ['migration-mappings', jobId, params],
    queryFn: () =>
      fetchJson(`/api/v2/data-migration/jobs/${jobId}/mappings${buildQs(params)}`),
    enabled: !!jobId,
  })
}

export function useCreateMigrationMapping(jobId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/data-migration/jobs/${jobId}/mappings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['migration-mappings', jobId] })
      qc.invalidateQueries({ queryKey: ['migration-jobs'] })
    },
  })
}

export function useUpdateMigrationMapping(jobId: string, mappingId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/data-migration/jobs/${jobId}/mappings/${mappingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['migration-mappings', jobId] })
      qc.invalidateQueries({ queryKey: ['migration-jobs'] })
    },
  })
}

export function useDeleteMigrationMapping(jobId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (mappingId: string) =>
      fetchJson(`/api/v2/data-migration/jobs/${jobId}/mappings/${mappingId}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['migration-mappings', jobId] })
      qc.invalidateQueries({ queryKey: ['migration-jobs'] })
    },
  })
}

// ── Migration Validation Results ─────────────────────────────────────────────

export function useMigrationValidations(jobId: string | null, params?: { page?: number; limit?: number; severity?: string; validation_type?: string }) {
  return useQuery<{ data: MigrationValidationResult[]; total: number }>({
    queryKey: ['migration-validations', jobId, params],
    queryFn: () =>
      fetchJson(`/api/v2/data-migration/jobs/${jobId}/validations${buildQs(params)}`),
    enabled: !!jobId,
  })
}

export function useUpdateMigrationValidation(jobId: string, validationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/data-migration/jobs/${jobId}/validations/${validationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['migration-validations', jobId] })
      qc.invalidateQueries({ queryKey: ['migration-jobs'] })
    },
  })
}

// ── Migration Reconciliation ─────────────────────────────────────────────────

export function useMigrationReconciliations(jobId: string | null, params?: { page?: number; limit?: number; status?: string }) {
  return useQuery<{ data: MigrationReconciliation[]; total: number }>({
    queryKey: ['migration-reconciliations', jobId, params],
    queryFn: () =>
      fetchJson(`/api/v2/data-migration/jobs/${jobId}/reconciliation${buildQs(params)}`),
    enabled: !!jobId,
  })
}

export function useUpdateMigrationReconciliation(jobId: string, reconciliationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/data-migration/jobs/${jobId}/reconciliation/${reconciliationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['migration-reconciliations', jobId] })
      qc.invalidateQueries({ queryKey: ['migration-jobs'] })
    },
  })
}

// ── Mapping Templates ────────────────────────────────────────────────────────

type TemplateListParams = {
  page?: number
  limit?: number
  source_platform?: string
  is_active?: boolean
  q?: string
}

type TemplateCreateInput = {
  name: string
  source_platform: string
  description?: string | null
  mappings?: unknown[]
  is_active?: boolean
}

const templateHooks = createApiHooks<TemplateListParams, TemplateCreateInput>(
  'migration-templates',
  '/api/v2/data-migration/templates'
)

export const useMigrationTemplates = templateHooks.useList
export const useMigrationTemplate = templateHooks.useDetail
export const useCreateMigrationTemplate = templateHooks.useCreate
export const useUpdateMigrationTemplate = templateHooks.useUpdate
export const useDeleteMigrationTemplate = templateHooks.useDelete

// ── Re-export types ──────────────────────────────────────────────────────────

export type { MigrationJob, MigrationFieldMapping, MigrationMappingTemplate, MigrationValidationResult, MigrationReconciliation }
