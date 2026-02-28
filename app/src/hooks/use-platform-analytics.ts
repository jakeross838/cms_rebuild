'use client'

/**
 * Module 49: Platform Analytics React Query Hooks
 *
 * Covers platform metrics, tenant health scores, feature usage events, A/B experiments, and deployment releases.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  PlatformMetricsSnapshot,
  TenantHealthScore,
  FeatureUsageEvent,
  AbExperiment,
  DeploymentRelease,
} from '@/types/platform-analytics'

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

// ── Platform Metrics ─────────────────────────────────────────────────────────

type MetricsListParams = {
  page?: number
  limit?: number
  metric_type?: string
  period?: string
  start_date?: string
  end_date?: string
}

type MetricsCreateInput = {
  metric_type: string
  metric_value: number
  snapshot_date: string
  period?: string
  breakdown?: Record<string, unknown>
}

const metricsHooks = createApiHooks<MetricsListParams, MetricsCreateInput>(
  'platform-metrics',
  '/api/v2/analytics/metrics'
)

export const usePlatformMetrics = metricsHooks.useList
export const usePlatformMetric = metricsHooks.useDetail
export const useCreatePlatformMetric = metricsHooks.useCreate
export const useUpdatePlatformMetric = metricsHooks.useUpdate
export const useDeletePlatformMetric = metricsHooks.useDelete

// ── Tenant Health Scores ─────────────────────────────────────────────────────

type HealthScoreListParams = {
  page?: number
  limit?: number
  risk_level?: string
  company_id?: string
}

type HealthScoreCreateInput = {
  company_id: string
  score_date: string
  overall_score: number
  adoption_score?: number
  engagement_score?: number
  satisfaction_score?: number
  growth_score?: number
  risk_level?: string
  churn_probability?: number
  notes?: string | null
}

const healthHooks = createApiHooks<HealthScoreListParams, HealthScoreCreateInput>(
  'health-scores',
  '/api/v2/analytics/health-scores'
)

export const useHealthScores = healthHooks.useList
export const useHealthScore = healthHooks.useDetail
export const useCreateHealthScore = healthHooks.useCreate
export const useUpdateHealthScore = healthHooks.useUpdate
export const useDeleteHealthScore = healthHooks.useDelete

// ── Feature Usage Events ─────────────────────────────────────────────────────

type EventListParams = {
  page?: number
  limit?: number
  feature_key?: string
  event_type?: string
  user_id?: string
}

export function useFeatureUsageEvents(params?: EventListParams) {
  return useQuery<{ data: FeatureUsageEvent[]; total: number }>({
    queryKey: ['feature-usage-events', params],
    queryFn: () =>
      fetchJson(`/api/v2/analytics/events${buildQs(params)}`),
  })
}

export function useCreateFeatureUsageEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson('/api/v2/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feature-usage-events'] })
    },
  })
}

// ── A/B Experiments ──────────────────────────────────────────────────────────

type ExperimentListParams = {
  page?: number
  limit?: number
  status?: string
  feature_key?: string
  q?: string
}

type ExperimentCreateInput = {
  name: string
  feature_key?: string | null
  description?: string | null
  status?: string
  variants?: unknown[]
  start_date?: string | null
  end_date?: string | null
  sample_percentage?: number
}

const experimentHooks = createApiHooks<ExperimentListParams, ExperimentCreateInput>(
  'experiments',
  '/api/v2/analytics/experiments'
)

export const useExperiments = experimentHooks.useList
export const useExperiment = experimentHooks.useDetail
export const useCreateExperiment = experimentHooks.useCreate
export const useUpdateExperiment = experimentHooks.useUpdate
export const useDeleteExperiment = experimentHooks.useDelete

// ── Deployment Releases ──────────────────────────────────────────────────────

type ReleaseListParams = {
  page?: number
  limit?: number
  release_type?: string
  status?: string
  q?: string
}

type ReleaseCreateInput = {
  version: string
  release_type: string
  description?: string | null
  changelog?: string | null
  status?: string
  affected_services?: unknown[]
}

const releaseHooks = createApiHooks<ReleaseListParams, ReleaseCreateInput>(
  'releases',
  '/api/v2/analytics/releases'
)

export const useReleases = releaseHooks.useList
export const useRelease = releaseHooks.useDetail
export const useCreateRelease = releaseHooks.useCreate
export const useUpdateRelease = releaseHooks.useUpdate
export const useDeleteRelease = releaseHooks.useDelete

// ── Re-export types ──────────────────────────────────────────────────────────

export type { PlatformMetricsSnapshot, TenantHealthScore, FeatureUsageEvent, AbExperiment, DeploymentRelease }
