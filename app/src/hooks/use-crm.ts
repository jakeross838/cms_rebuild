'use client'

/**
 * Module 36: Lead Pipeline & CRM React Query Hooks
 *
 * Covers leads, lead activities, lead sources, pipelines, and pipeline stages.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  Lead,
  LeadActivity,
  LeadSourceRecord,
  Pipeline,
  PipelineStage,
} from '@/types/crm'

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

// ── Leads ────────────────────────────────────────────────────────────────────

type LeadListParams = {
  page?: number
  limit?: number
  status?: string
  priority?: string
  source?: string
  pipeline_id?: string
  stage_id?: string
  assigned_to?: string
  q?: string
}

type LeadCreateInput = {
  first_name: string
  last_name: string
  source: string
  status?: string
  priority?: string
  email?: string | null
  phone?: string | null
  address?: string | null
  lot_address?: string | null
  source_detail?: string | null
  project_type?: string | null
  budget_range_low?: number | null
  budget_range_high?: number | null
  timeline?: string | null
  pipeline_id?: string | null
  stage_id?: string | null
  assigned_to?: string | null
  estimated_value?: number | null
  expected_contract_value?: number | null
  probability_pct?: number | null
  notes?: string | null
}

const leadHooks = createApiHooks<LeadListParams, LeadCreateInput>(
  'leads',
  '/api/v2/crm/leads'
)

export const useLeads = leadHooks.useList
export const useLead = leadHooks.useDetail
export const useCreateLead = leadHooks.useCreate
export const useUpdateLead = leadHooks.useUpdate
export const useDeleteLead = leadHooks.useDelete

// ── Lead Activities ──────────────────────────────────────────────────────────

export function useLeadActivities(leadId: string | null, params?: { page?: number; limit?: number; activity_type?: string }) {
  return useQuery<{ data: LeadActivity[]; total: number }>({
    queryKey: ['lead-activities', leadId, params],
    queryFn: () =>
      fetchJson(`/api/v2/crm/leads/${leadId}/activities${buildQs(params)}`),
    enabled: !!leadId,
  })
}

export function useCreateLeadActivity(leadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/crm/leads/${leadId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lead-activities', leadId] })
      qc.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useUpdateLeadActivity(leadId: string, activityId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/crm/leads/${leadId}/activities/${activityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lead-activities', leadId] })
      qc.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useDeleteLeadActivity(leadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (activityId: string) =>
      fetchJson(`/api/v2/crm/leads/${leadId}/activities/${activityId}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lead-activities', leadId] })
      qc.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

// ── Lead Sources ─────────────────────────────────────────────────────────────

type SourceListParams = {
  page?: number
  limit?: number
  source_type?: string
  is_active?: boolean
  q?: string
}

type SourceCreateInput = {
  name: string
  source_type: string
  description?: string | null
  is_active?: boolean
}

const sourceHooks = createApiHooks<SourceListParams, SourceCreateInput>(
  'lead-sources',
  '/api/v2/crm/sources'
)

export const useLeadSources = sourceHooks.useList
export const useLeadSource = sourceHooks.useDetail
export const useCreateLeadSource = sourceHooks.useCreate
export const useUpdateLeadSource = sourceHooks.useUpdate
export const useDeleteLeadSource = sourceHooks.useDelete

// ── Pipelines ────────────────────────────────────────────────────────────────

type PipelineListParams = {
  page?: number
  limit?: number
  is_active?: boolean
  q?: string
}

type PipelineCreateInput = {
  name: string
  description?: string | null
  is_default?: boolean
  is_active?: boolean
}

const pipelineHooks = createApiHooks<PipelineListParams, PipelineCreateInput>(
  'pipelines',
  '/api/v2/crm/pipelines'
)

export const usePipelines = pipelineHooks.useList
export const usePipeline = pipelineHooks.useDetail
export const useCreatePipeline = pipelineHooks.useCreate
export const useUpdatePipeline = pipelineHooks.useUpdate
export const useDeletePipeline = pipelineHooks.useDelete

// ── Pipeline Stages ──────────────────────────────────────────────────────────

export function usePipelineStages(pipelineId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery<{ data: PipelineStage[]; total: number }>({
    queryKey: ['pipeline-stages', pipelineId, params],
    queryFn: () =>
      fetchJson(`/api/v2/crm/pipelines/${pipelineId}/stages${buildQs(params)}`),
    enabled: !!pipelineId,
  })
}

export function useCreatePipelineStage(pipelineId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/crm/pipelines/${pipelineId}/stages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pipeline-stages', pipelineId] })
      qc.invalidateQueries({ queryKey: ['pipelines'] })
    },
  })
}

export function useUpdatePipelineStage(pipelineId: string, stageId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/crm/pipelines/${pipelineId}/stages/${stageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pipeline-stages', pipelineId] })
      qc.invalidateQueries({ queryKey: ['pipelines'] })
    },
  })
}

export function useDeletePipelineStage(pipelineId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (stageId: string) =>
      fetchJson(`/api/v2/crm/pipelines/${pipelineId}/stages/${stageId}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pipeline-stages', pipelineId] })
      qc.invalidateQueries({ queryKey: ['pipelines'] })
    },
  })
}

// ── Re-export types ──────────────────────────────────────────────────────────

export type { Lead, LeadActivity, LeadSourceRecord, Pipeline, PipelineStage }
