'use client'

/**
 * Module 25: Schedule Intelligence React Query Hooks
 *
 * Covers: schedule predictions, weather events, risk scores,
 * schedule scenarios.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  SchedulePrediction,
  ScheduleWeatherEvent,
  ScheduleRiskScore,
  ScheduleScenario,
} from '@/types/schedule-intelligence'

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

// ── Schedule Predictions ────────────────────────────────────────────────────

type PredictionListParams = {
  page?: number
  limit?: number
  job_id?: string
  prediction_type?: string
  is_accepted?: boolean
  q?: string
}

type PredictionCreateInput = {
  job_id: string
  task_id?: string | null
  prediction_type: string
  predicted_value: Record<string, unknown>
  confidence_score?: number
  model_version?: string | null
}

const predictionHooks = createApiHooks<PredictionListParams, PredictionCreateInput>(
  'schedule-predictions',
  '/api/v2/schedule-intelligence/predictions'
)

export const useSchedulePredictions = predictionHooks.useList
export const useSchedulePrediction = predictionHooks.useDetail
export const useCreateSchedulePrediction = predictionHooks.useCreate
export const useUpdateSchedulePrediction = predictionHooks.useUpdate
export const useDeleteSchedulePrediction = predictionHooks.useDelete

// ── Weather Events ──────────────────────────────────────────────────────────

type WeatherEventListParams = {
  page?: number
  limit?: number
  job_id?: string
  weather_type?: string
  severity?: string
  date_from?: string
  date_to?: string
}

type WeatherEventCreateInput = {
  job_id: string
  event_date: string
  weather_type: string
  severity: string
  impact_description?: string | null
  affected_tasks?: string[]
  schedule_impact_days?: number
  temperature_high?: number | null
  temperature_low?: number | null
  precipitation_inches?: number | null
  wind_speed_mph?: number | null
  auto_logged?: boolean
  notes?: string | null
}

const weatherHooks = createApiHooks<WeatherEventListParams, WeatherEventCreateInput>(
  'schedule-weather-events',
  '/api/v2/schedule-intelligence/weather-events'
)

export const useScheduleWeatherEvents = weatherHooks.useList
export const useScheduleWeatherEvent = weatherHooks.useDetail
export const useCreateScheduleWeatherEvent = weatherHooks.useCreate
export const useUpdateScheduleWeatherEvent = weatherHooks.useUpdate
export const useDeleteScheduleWeatherEvent = weatherHooks.useDelete

// ── Risk Scores ─────────────────────────────────────────────────────────────

type RiskScoreListParams = {
  page?: number
  limit?: number
  job_id?: string
  risk_level?: string
  task_id?: string
}

type RiskScoreCreateInput = {
  job_id: string
  task_id?: string | null
  risk_level: string
  risk_score: number
  risk_factors?: Record<string, unknown>
  mitigation_suggestions?: unknown[]
  weather_component?: number
  resource_component?: number
  dependency_component?: number
  history_component?: number
}

const riskScoreHooks = createApiHooks<RiskScoreListParams, RiskScoreCreateInput>(
  'schedule-risk-scores',
  '/api/v2/schedule-intelligence/risk-scores'
)

export const useScheduleRiskScores = riskScoreHooks.useList
export const useScheduleRiskScore = riskScoreHooks.useDetail
export const useCreateScheduleRiskScore = riskScoreHooks.useCreate
export const useUpdateScheduleRiskScore = riskScoreHooks.useUpdate
export const useDeleteScheduleRiskScore = riskScoreHooks.useDelete

// ── Schedule Scenarios ──────────────────────────────────────────────────────

type ScenarioListParams = {
  page?: number
  limit?: number
  job_id?: string
  scenario_type?: string
  q?: string
}

type ScenarioCreateInput = {
  job_id: string
  name: string
  description?: string | null
  scenario_type: string
  parameters?: Record<string, unknown>
  projected_completion?: string | null
  projected_cost_impact?: number | null
}

const scenarioHooks = createApiHooks<ScenarioListParams, ScenarioCreateInput>(
  'schedule-scenarios',
  '/api/v2/schedule-intelligence/scenarios'
)

export const useScheduleScenarios = scenarioHooks.useList
export const useScheduleScenario = scenarioHooks.useDetail
export const useCreateScheduleScenario = scenarioHooks.useCreate
export const useUpdateScheduleScenario = scenarioHooks.useUpdate
export const useDeleteScheduleScenario = scenarioHooks.useDelete

// ── Weather (standalone endpoint) ───────────────────────────────────────────

export function useWeatherForecasts(params?: { page?: number; limit?: number; job_id?: string }) {
  return useQuery({
    queryKey: ['weather-forecasts', params],
    queryFn: () => fetchJson(`/api/v2/weather${buildQs(params)}`),
  })
}

export function useWeatherForecast(id: string | null) {
  return useQuery({
    queryKey: ['weather-forecasts', id],
    queryFn: () => fetchJson(`/api/v2/weather/${id}`),
    enabled: !!id,
  })
}

// ── Re-export types ─────────────────────────────────────────────────────────

export type {
  SchedulePrediction,
  ScheduleWeatherEvent,
  ScheduleRiskScore,
  ScheduleScenario,
}
