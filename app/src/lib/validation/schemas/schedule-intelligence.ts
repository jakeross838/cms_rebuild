/**
 * Module 25: Schedule Intelligence Validation Schemas
 */

import { z } from 'zod'

// -- Enums ------------------------------------------------------------------

export const predictionTypeEnum = z.enum([
  'duration', 'delay', 'resource', 'weather', 'completion',
])

export const weatherTypeEnum = z.enum([
  'rain', 'snow', 'ice', 'wind', 'extreme_heat', 'extreme_cold', 'hurricane', 'tornado', 'flood',
])

export const weatherSeverityEnum = z.enum([
  'minor', 'moderate', 'severe', 'extreme',
])

export const riskLevelEnum = z.enum([
  'low', 'medium', 'high', 'critical',
])

export const scenarioTypeEnum = z.enum([
  'optimistic', 'pessimistic', 'most_likely', 'custom',
])

// -- Predictions ------------------------------------------------------------

export const listPredictionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  task_id: z.string().uuid().optional(),
  prediction_type: predictionTypeEnum.optional(),
  is_accepted: z.coerce.boolean().optional(),
})

export const createPredictionSchema = z.object({
  job_id: z.string().uuid(),
  task_id: z.string().uuid().nullable().optional(),
  prediction_type: predictionTypeEnum,
  predicted_value: z.record(z.string(), z.unknown()).optional().default({}),
  confidence_score: z.number().min(0).max(1).optional().default(0),
  model_version: z.string().trim().max(50).nullable().optional(),
})

export const updatePredictionSchema = z.object({
  predicted_value: z.record(z.string(), z.unknown()).optional(),
  confidence_score: z.number().min(0).max(1).optional(),
  model_version: z.string().trim().max(50).nullable().optional(),
  is_accepted: z.boolean().optional(),
})

// -- Weather Events ---------------------------------------------------------

export const listWeatherEventsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  weather_type: weatherTypeEnum.optional(),
  severity: weatherSeverityEnum.optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export const createWeatherEventSchema = z.object({
  job_id: z.string().uuid(),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weather_type: weatherTypeEnum,
  severity: weatherSeverityEnum,
  impact_description: z.string().trim().max(5000).nullable().optional(),
  affected_tasks: z.array(z.string().uuid()).optional().default([]),
  schedule_impact_days: z.number().min(0).max(365).optional().default(0),
  temperature_high: z.number().min(-100).max(200).nullable().optional(),
  temperature_low: z.number().min(-100).max(200).nullable().optional(),
  precipitation_inches: z.number().min(0).max(99.99).nullable().optional(),
  wind_speed_mph: z.number().min(0).max(999.9).nullable().optional(),
  auto_logged: z.boolean().optional().default(false),
  notes: z.string().trim().max(5000).nullable().optional(),
})

export const updateWeatherEventSchema = z.object({
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  weather_type: weatherTypeEnum.optional(),
  severity: weatherSeverityEnum.optional(),
  impact_description: z.string().trim().max(5000).nullable().optional(),
  affected_tasks: z.array(z.string().uuid()).optional(),
  schedule_impact_days: z.number().min(0).max(365).optional(),
  temperature_high: z.number().min(-100).max(200).nullable().optional(),
  temperature_low: z.number().min(-100).max(200).nullable().optional(),
  precipitation_inches: z.number().min(0).max(99.99).nullable().optional(),
  wind_speed_mph: z.number().min(0).max(999.9).nullable().optional(),
  auto_logged: z.boolean().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

// -- Risk Scores ------------------------------------------------------------

export const listRiskScoresSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  task_id: z.string().uuid().optional(),
  risk_level: riskLevelEnum.optional(),
  min_score: z.coerce.number().int().min(0).max(100).optional(),
})

export const createRiskScoreSchema = z.object({
  job_id: z.string().uuid(),
  task_id: z.string().uuid().nullable().optional(),
  risk_level: riskLevelEnum,
  risk_score: z.number().int().min(0).max(100),
  risk_factors: z.record(z.string(), z.unknown()).optional().default({}),
  mitigation_suggestions: z.array(z.unknown()).optional().default([]),
  weather_component: z.number().int().min(0).max(100).optional().default(0),
  resource_component: z.number().int().min(0).max(100).optional().default(0),
  dependency_component: z.number().int().min(0).max(100).optional().default(0),
  history_component: z.number().int().min(0).max(100).optional().default(0),
})

export const updateRiskScoreSchema = z.object({
  risk_level: riskLevelEnum.optional(),
  risk_score: z.number().int().min(0).max(100).optional(),
  risk_factors: z.record(z.string(), z.unknown()).optional(),
  mitigation_suggestions: z.array(z.unknown()).optional(),
  weather_component: z.number().int().min(0).max(100).optional(),
  resource_component: z.number().int().min(0).max(100).optional(),
  dependency_component: z.number().int().min(0).max(100).optional(),
  history_component: z.number().int().min(0).max(100).optional(),
})

// -- Scenarios --------------------------------------------------------------

export const listScenariosSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  scenario_type: scenarioTypeEnum.optional(),
})

export const createScenarioSchema = z.object({
  job_id: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).nullable().optional(),
  scenario_type: scenarioTypeEnum.optional().default('custom'),
  parameters: z.record(z.string(), z.unknown()).optional().default({}),
  results: z.record(z.string(), z.unknown()).optional().default({}),
  projected_completion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  projected_cost_impact: z.number().min(-9999999999.99).max(9999999999.99).nullable().optional(),
})

export const updateScenarioSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  scenario_type: scenarioTypeEnum.optional(),
  parameters: z.record(z.string(), z.unknown()).optional(),
  results: z.record(z.string(), z.unknown()).optional(),
  projected_completion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  projected_cost_impact: z.number().min(-9999999999.99).max(9999999999.99).nullable().optional(),
})
