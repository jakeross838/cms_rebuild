/**
 * Module 25: Schedule Intelligence Types
 */

// -- Enums ------------------------------------------------------------------

export type PredictionType =
  | 'duration'
  | 'delay'
  | 'resource'
  | 'weather'
  | 'completion'

export type WeatherType =
  | 'rain'
  | 'snow'
  | 'ice'
  | 'wind'
  | 'extreme_heat'
  | 'extreme_cold'
  | 'hurricane'
  | 'tornado'
  | 'flood'

export type WeatherSeverity =
  | 'minor'
  | 'moderate'
  | 'severe'
  | 'extreme'

export type RiskLevel =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'

export type ScenarioType =
  | 'optimistic'
  | 'pessimistic'
  | 'most_likely'
  | 'custom'

// -- Interfaces -------------------------------------------------------------

export interface SchedulePrediction {
  id: string
  company_id: string
  job_id: string
  task_id: string | null
  prediction_type: PredictionType
  predicted_value: Record<string, unknown>
  confidence_score: number
  model_version: string | null
  is_accepted: boolean
  accepted_by: string | null
  accepted_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ScheduleWeatherEvent {
  id: string
  company_id: string
  job_id: string
  event_date: string
  weather_type: WeatherType
  severity: WeatherSeverity
  impact_description: string | null
  affected_tasks: string[]
  schedule_impact_days: number
  temperature_high: number | null
  temperature_low: number | null
  precipitation_inches: number | null
  wind_speed_mph: number | null
  auto_logged: boolean
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ScheduleRiskScore {
  id: string
  company_id: string
  job_id: string
  task_id: string | null
  risk_level: RiskLevel
  risk_score: number
  risk_factors: Record<string, unknown>
  mitigation_suggestions: unknown[]
  weather_component: number
  resource_component: number
  dependency_component: number
  history_component: number
  assessed_at: string
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ScheduleScenario {
  id: string
  company_id: string
  job_id: string
  name: string
  description: string | null
  scenario_type: ScenarioType
  parameters: Record<string, unknown>
  results: Record<string, unknown>
  projected_completion: string | null
  projected_cost_impact: number | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// -- Constants --------------------------------------------------------------

export const PREDICTION_TYPES: { value: PredictionType; label: string }[] = [
  { value: 'duration', label: 'Duration' },
  { value: 'delay', label: 'Delay' },
  { value: 'resource', label: 'Resource' },
  { value: 'weather', label: 'Weather' },
  { value: 'completion', label: 'Completion' },
]

export const WEATHER_TYPES: { value: WeatherType; label: string }[] = [
  { value: 'rain', label: 'Rain' },
  { value: 'snow', label: 'Snow' },
  { value: 'ice', label: 'Ice' },
  { value: 'wind', label: 'Wind' },
  { value: 'extreme_heat', label: 'Extreme Heat' },
  { value: 'extreme_cold', label: 'Extreme Cold' },
  { value: 'hurricane', label: 'Hurricane' },
  { value: 'tornado', label: 'Tornado' },
  { value: 'flood', label: 'Flood' },
]

export const WEATHER_SEVERITIES: { value: WeatherSeverity; label: string }[] = [
  { value: 'minor', label: 'Minor' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
  { value: 'extreme', label: 'Extreme' },
]

export const RISK_LEVELS: { value: RiskLevel; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export const SCENARIO_TYPES: { value: ScenarioType; label: string }[] = [
  { value: 'optimistic', label: 'Optimistic' },
  { value: 'pessimistic', label: 'Pessimistic' },
  { value: 'most_likely', label: 'Most Likely' },
  { value: 'custom', label: 'Custom' },
]
