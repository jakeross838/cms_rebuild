/**
 * Module 25 — Schedule Intelligence Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 25 spec.
 */

import { describe, test, expect } from 'vitest'

// -- Types ------------------------------------------------------------------

import type {
  PredictionType,
  WeatherType,
  WeatherSeverity,
  RiskLevel,
  ScenarioType,
  SchedulePrediction,
  ScheduleWeatherEvent,
  ScheduleRiskScore,
  ScheduleScenario,
} from '@/types/schedule-intelligence'

import {
  PREDICTION_TYPES,
  WEATHER_TYPES,
  WEATHER_SEVERITIES,
  RISK_LEVELS,
  SCENARIO_TYPES,
} from '@/types/schedule-intelligence'

// -- Schemas ----------------------------------------------------------------

import {
  predictionTypeEnum,
  weatherTypeEnum,
  weatherSeverityEnum,
  riskLevelEnum,
  scenarioTypeEnum,
  listPredictionsSchema,
  createPredictionSchema,
  updatePredictionSchema,
  listWeatherEventsSchema,
  createWeatherEventSchema,
  updateWeatherEventSchema,
  listRiskScoresSchema,
  createRiskScoreSchema,
  updateRiskScoreSchema,
  listScenariosSchema,
  createScenarioSchema,
  updateScenarioSchema,
} from '@/lib/validation/schemas/schedule-intelligence'

// ============================================================================
// Type System
// ============================================================================

describe('Module 25 — Schedule Intelligence Types', () => {
  test('PredictionType has 5 values', () => {
    const types: PredictionType[] = [
      'duration', 'delay', 'resource', 'weather', 'completion',
    ]
    expect(types).toHaveLength(5)
  })

  test('WeatherType has 9 values', () => {
    const types: WeatherType[] = [
      'rain', 'snow', 'ice', 'wind', 'extreme_heat', 'extreme_cold', 'hurricane', 'tornado', 'flood',
    ]
    expect(types).toHaveLength(9)
  })

  test('WeatherSeverity has 4 values', () => {
    const severities: WeatherSeverity[] = ['minor', 'moderate', 'severe', 'extreme']
    expect(severities).toHaveLength(4)
  })

  test('RiskLevel has 4 values', () => {
    const levels: RiskLevel[] = ['low', 'medium', 'high', 'critical']
    expect(levels).toHaveLength(4)
  })

  test('ScenarioType has 4 values', () => {
    const types: ScenarioType[] = ['optimistic', 'pessimistic', 'most_likely', 'custom']
    expect(types).toHaveLength(4)
  })

  test('SchedulePrediction interface has all required fields', () => {
    const prediction: SchedulePrediction = {
      id: '1', company_id: '1', job_id: '1', task_id: null,
      prediction_type: 'duration', predicted_value: { days: 14 },
      confidence_score: 0.85, model_version: 'v1.0',
      is_accepted: false, accepted_by: null, accepted_at: null,
      created_by: '1', created_at: '2026-02-23', updated_at: '2026-02-23',
      deleted_at: null,
    }
    expect(prediction.prediction_type).toBe('duration')
    expect(prediction.confidence_score).toBe(0.85)
    expect(prediction.is_accepted).toBe(false)
  })

  test('ScheduleWeatherEvent interface has all required fields', () => {
    const event: ScheduleWeatherEvent = {
      id: '1', company_id: '1', job_id: '1', event_date: '2026-03-15',
      weather_type: 'rain', severity: 'moderate',
      impact_description: 'Heavy rain expected', affected_tasks: ['t1', 't2'],
      schedule_impact_days: 1, temperature_high: 72, temperature_low: 55,
      precipitation_inches: 2.5, wind_speed_mph: 15,
      auto_logged: false, notes: null,
      created_by: '1', created_at: '2026-02-23', updated_at: '2026-02-23',
      deleted_at: null,
    }
    expect(event.weather_type).toBe('rain')
    expect(event.severity).toBe('moderate')
    expect(event.schedule_impact_days).toBe(1)
    expect(event.affected_tasks).toHaveLength(2)
  })

  test('ScheduleRiskScore interface has all required fields', () => {
    const score: ScheduleRiskScore = {
      id: '1', company_id: '1', job_id: '1', task_id: '1',
      risk_level: 'high', risk_score: 78,
      risk_factors: { vendor_reliability: 0.6 },
      mitigation_suggestions: ['Assign backup vendor'],
      weather_component: 20, resource_component: 35,
      dependency_component: 15, history_component: 8,
      assessed_at: '2026-02-23', created_by: '1',
      created_at: '2026-02-23', updated_at: '2026-02-23',
      deleted_at: null,
    }
    expect(score.risk_level).toBe('high')
    expect(score.risk_score).toBe(78)
    expect(score.weather_component).toBe(20)
  })

  test('ScheduleScenario interface has all required fields', () => {
    const scenario: ScheduleScenario = {
      id: '1', company_id: '1', job_id: '1',
      name: 'Optimistic Timeline', description: 'Best case scenario',
      scenario_type: 'optimistic', parameters: { buffer_reduction: 0.5 },
      results: { completion_days: 90 },
      projected_completion: '2026-06-15', projected_cost_impact: -5000.00,
      created_by: '1', created_at: '2026-02-23', updated_at: '2026-02-23',
      deleted_at: null,
    }
    expect(scenario.name).toBe('Optimistic Timeline')
    expect(scenario.scenario_type).toBe('optimistic')
    expect(scenario.projected_cost_impact).toBe(-5000.00)
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 25 — Constants', () => {
  test('PREDICTION_TYPES has 5 entries with value and label', () => {
    expect(PREDICTION_TYPES).toHaveLength(5)
    for (const pt of PREDICTION_TYPES) {
      expect(pt).toHaveProperty('value')
      expect(pt).toHaveProperty('label')
      expect(pt.label.length).toBeGreaterThan(0)
    }
  })

  test('WEATHER_TYPES has 9 entries with value and label', () => {
    expect(WEATHER_TYPES).toHaveLength(9)
    for (const wt of WEATHER_TYPES) {
      expect(wt).toHaveProperty('value')
      expect(wt).toHaveProperty('label')
      expect(wt.label.length).toBeGreaterThan(0)
    }
    const values = WEATHER_TYPES.map((w) => w.value)
    expect(values).toContain('rain')
    expect(values).toContain('hurricane')
    expect(values).toContain('extreme_heat')
  })

  test('WEATHER_SEVERITIES has 4 entries with value and label', () => {
    expect(WEATHER_SEVERITIES).toHaveLength(4)
    for (const ws of WEATHER_SEVERITIES) {
      expect(ws).toHaveProperty('value')
      expect(ws).toHaveProperty('label')
      expect(ws.label.length).toBeGreaterThan(0)
    }
  })

  test('RISK_LEVELS has 4 entries with value and label', () => {
    expect(RISK_LEVELS).toHaveLength(4)
    const values = RISK_LEVELS.map((r) => r.value)
    expect(values).toContain('low')
    expect(values).toContain('medium')
    expect(values).toContain('high')
    expect(values).toContain('critical')
  })

  test('SCENARIO_TYPES has 4 entries with value and label', () => {
    expect(SCENARIO_TYPES).toHaveLength(4)
    const values = SCENARIO_TYPES.map((s) => s.value)
    expect(values).toContain('optimistic')
    expect(values).toContain('pessimistic')
    expect(values).toContain('most_likely')
    expect(values).toContain('custom')
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 25 — Enum Schemas', () => {
  test('predictionTypeEnum accepts all 5 prediction types', () => {
    for (const t of ['duration', 'delay', 'resource', 'weather', 'completion']) {
      expect(predictionTypeEnum.parse(t)).toBe(t)
    }
  })

  test('predictionTypeEnum rejects invalid type', () => {
    expect(() => predictionTypeEnum.parse('unknown')).toThrow()
  })

  test('weatherTypeEnum accepts all 9 weather types', () => {
    for (const t of ['rain', 'snow', 'ice', 'wind', 'extreme_heat', 'extreme_cold', 'hurricane', 'tornado', 'flood']) {
      expect(weatherTypeEnum.parse(t)).toBe(t)
    }
  })

  test('weatherTypeEnum rejects invalid type', () => {
    expect(() => weatherTypeEnum.parse('hail')).toThrow()
  })

  test('weatherSeverityEnum accepts all 4 severities', () => {
    for (const s of ['minor', 'moderate', 'severe', 'extreme']) {
      expect(weatherSeverityEnum.parse(s)).toBe(s)
    }
  })

  test('weatherSeverityEnum rejects invalid severity', () => {
    expect(() => weatherSeverityEnum.parse('low')).toThrow()
  })

  test('riskLevelEnum accepts all 4 levels', () => {
    for (const l of ['low', 'medium', 'high', 'critical']) {
      expect(riskLevelEnum.parse(l)).toBe(l)
    }
  })

  test('riskLevelEnum rejects invalid level', () => {
    expect(() => riskLevelEnum.parse('extreme')).toThrow()
  })

  test('scenarioTypeEnum accepts all 4 types', () => {
    for (const t of ['optimistic', 'pessimistic', 'most_likely', 'custom']) {
      expect(scenarioTypeEnum.parse(t)).toBe(t)
    }
  })

  test('scenarioTypeEnum rejects invalid type', () => {
    expect(() => scenarioTypeEnum.parse('baseline')).toThrow()
  })
})

// ============================================================================
// Prediction Schemas
// ============================================================================

describe('Module 25 — Prediction Schemas', () => {
  test('listPredictionsSchema accepts valid params', () => {
    const result = listPredictionsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listPredictionsSchema rejects limit > 100', () => {
    expect(() => listPredictionsSchema.parse({ limit: 200 })).toThrow()
  })

  test('listPredictionsSchema accepts filters', () => {
    const result = listPredictionsSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      prediction_type: 'duration',
    })
    expect(result.job_id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(result.prediction_type).toBe('duration')
  })

  test('createPredictionSchema accepts valid prediction', () => {
    const result = createPredictionSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      prediction_type: 'duration',
      predicted_value: { estimated_days: 14 },
      confidence_score: 0.85,
    })
    expect(result.prediction_type).toBe('duration')
    expect(result.confidence_score).toBe(0.85)
  })

  test('createPredictionSchema requires job_id and prediction_type', () => {
    expect(() => createPredictionSchema.parse({})).toThrow()
    expect(() => createPredictionSchema.parse({ job_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
  })

  test('createPredictionSchema has correct defaults', () => {
    const result = createPredictionSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      prediction_type: 'delay',
    })
    expect(result.confidence_score).toBe(0)
    expect(result.predicted_value).toEqual({})
  })

  test('createPredictionSchema rejects confidence_score > 1', () => {
    expect(() => createPredictionSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      prediction_type: 'duration',
      confidence_score: 1.5,
    })).toThrow()
  })

  test('updatePredictionSchema accepts partial updates', () => {
    const result = updatePredictionSchema.parse({ is_accepted: true })
    expect(result.is_accepted).toBe(true)
    expect(result.predicted_value).toBeUndefined()
  })
})

// ============================================================================
// Weather Event Schemas
// ============================================================================

describe('Module 25 — Weather Event Schemas', () => {
  test('listWeatherEventsSchema accepts valid params with date filters', () => {
    const result = listWeatherEventsSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      weather_type: 'rain',
      date_from: '2026-03-01',
      date_to: '2026-03-31',
    })
    expect(result.weather_type).toBe('rain')
    expect(result.date_from).toBe('2026-03-01')
    expect(result.date_to).toBe('2026-03-31')
  })

  test('listWeatherEventsSchema rejects invalid date format', () => {
    expect(() => listWeatherEventsSchema.parse({ date_from: '03/01/2026' })).toThrow()
  })

  test('createWeatherEventSchema accepts valid weather event', () => {
    const result = createWeatherEventSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      event_date: '2026-03-15',
      weather_type: 'rain',
      severity: 'moderate',
      schedule_impact_days: 1,
      temperature_high: 72,
      precipitation_inches: 2.5,
    })
    expect(result.weather_type).toBe('rain')
    expect(result.severity).toBe('moderate')
    expect(result.schedule_impact_days).toBe(1)
    expect(result.temperature_high).toBe(72)
  })

  test('createWeatherEventSchema requires job_id, event_date, weather_type, severity', () => {
    expect(() => createWeatherEventSchema.parse({})).toThrow()
    expect(() => createWeatherEventSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
    expect(() => createWeatherEventSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      event_date: '2026-03-15',
    })).toThrow()
  })

  test('createWeatherEventSchema has correct defaults', () => {
    const result = createWeatherEventSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      event_date: '2026-03-15',
      weather_type: 'snow',
      severity: 'severe',
    })
    expect(result.schedule_impact_days).toBe(0)
    expect(result.affected_tasks).toEqual([])
    expect(result.auto_logged).toBe(false)
  })

  test('updateWeatherEventSchema accepts partial updates', () => {
    const result = updateWeatherEventSchema.parse({ severity: 'extreme', notes: 'Updated assessment' })
    expect(result.severity).toBe('extreme')
    expect(result.notes).toBe('Updated assessment')
    expect(result.weather_type).toBeUndefined()
  })
})

// ============================================================================
// Risk Score Schemas
// ============================================================================

describe('Module 25 — Risk Score Schemas', () => {
  test('listRiskScoresSchema accepts valid params with filters', () => {
    const result = listRiskScoresSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      risk_level: 'high',
      min_score: '70',
    })
    expect(result.risk_level).toBe('high')
    expect(result.min_score).toBe(70)
  })

  test('createRiskScoreSchema accepts valid risk score', () => {
    const result = createRiskScoreSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      task_id: '550e8400-e29b-41d4-a716-446655440001',
      risk_level: 'high',
      risk_score: 78,
      weather_component: 20,
      resource_component: 35,
    })
    expect(result.risk_level).toBe('high')
    expect(result.risk_score).toBe(78)
    expect(result.weather_component).toBe(20)
    expect(result.resource_component).toBe(35)
  })

  test('createRiskScoreSchema requires job_id, risk_level, risk_score', () => {
    expect(() => createRiskScoreSchema.parse({})).toThrow()
    expect(() => createRiskScoreSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
    })).toThrow()
    expect(() => createRiskScoreSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      risk_level: 'high',
    })).toThrow()
  })

  test('createRiskScoreSchema rejects risk_score > 100', () => {
    expect(() => createRiskScoreSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      risk_level: 'critical',
      risk_score: 150,
    })).toThrow()
  })

  test('createRiskScoreSchema rejects negative risk_score', () => {
    expect(() => createRiskScoreSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      risk_level: 'low',
      risk_score: -5,
    })).toThrow()
  })

  test('createRiskScoreSchema has correct defaults', () => {
    const result = createRiskScoreSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      risk_level: 'medium',
      risk_score: 45,
    })
    expect(result.weather_component).toBe(0)
    expect(result.resource_component).toBe(0)
    expect(result.dependency_component).toBe(0)
    expect(result.history_component).toBe(0)
    expect(result.risk_factors).toEqual({})
    expect(result.mitigation_suggestions).toEqual([])
  })

  test('updateRiskScoreSchema accepts partial updates', () => {
    const result = updateRiskScoreSchema.parse({ risk_score: 92, risk_level: 'critical' })
    expect(result.risk_score).toBe(92)
    expect(result.risk_level).toBe('critical')
    expect(result.weather_component).toBeUndefined()
  })
})

// ============================================================================
// Scenario Schemas
// ============================================================================

describe('Module 25 — Scenario Schemas', () => {
  test('listScenariosSchema accepts valid params', () => {
    const result = listScenariosSchema.parse({
      page: '1', limit: '20',
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      scenario_type: 'optimistic',
    })
    expect(result.page).toBe(1)
    expect(result.scenario_type).toBe('optimistic')
  })

  test('listScenariosSchema rejects limit > 100', () => {
    expect(() => listScenariosSchema.parse({ limit: 200 })).toThrow()
  })

  test('createScenarioSchema accepts valid scenario', () => {
    const result = createScenarioSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Optimistic Timeline',
      description: 'Best case with good weather',
      scenario_type: 'optimistic',
      projected_completion: '2026-06-15',
      projected_cost_impact: -5000.00,
    })
    expect(result.name).toBe('Optimistic Timeline')
    expect(result.scenario_type).toBe('optimistic')
    expect(result.projected_completion).toBe('2026-06-15')
    expect(result.projected_cost_impact).toBe(-5000.00)
  })

  test('createScenarioSchema requires job_id and name', () => {
    expect(() => createScenarioSchema.parse({})).toThrow()
    expect(() => createScenarioSchema.parse({ job_id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow()
  })

  test('createScenarioSchema rejects name > 200 chars', () => {
    expect(() => createScenarioSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'A'.repeat(201),
    })).toThrow()
  })

  test('createScenarioSchema has correct defaults', () => {
    const result = createScenarioSchema.parse({
      job_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Test Scenario',
    })
    expect(result.scenario_type).toBe('custom')
    expect(result.parameters).toEqual({})
    expect(result.results).toEqual({})
  })

  test('updateScenarioSchema accepts partial updates', () => {
    const result = updateScenarioSchema.parse({ name: 'Updated Scenario', projected_completion: '2026-07-01' })
    expect(result.name).toBe('Updated Scenario')
    expect(result.projected_completion).toBe('2026-07-01')
    expect(result.scenario_type).toBeUndefined()
  })

  test('updateScenarioSchema rejects invalid date format', () => {
    expect(() => updateScenarioSchema.parse({ projected_completion: '06/15/2026' })).toThrow()
  })
})
