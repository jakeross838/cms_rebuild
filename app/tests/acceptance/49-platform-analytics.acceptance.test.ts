/**
 * Module 49 — Platform Analytics Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 49 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  MetricType,
  MetricPeriod,
  RiskLevel,
  EventType,
  ExperimentStatus,
  ReleaseType,
  ReleaseStatus,
  PlatformMetricsSnapshot,
  TenantHealthScore,
  FeatureUsageEvent,
  AbExperiment,
  DeploymentRelease,
} from '@/types/platform-analytics'

import {
  METRIC_TYPES,
  METRIC_PERIODS,
  RISK_LEVELS,
  EVENT_TYPES,
  EXPERIMENT_STATUSES,
  RELEASE_TYPES,
  RELEASE_STATUSES,
} from '@/types/platform-analytics'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  metricTypeEnum,
  metricPeriodEnum,
  riskLevelEnum,
  eventTypeEnum,
  experimentStatusEnum,
  releaseTypeEnum,
  releaseStatusEnum,
  listMetricsSnapshotsSchema,
  createMetricsSnapshotSchema,
  updateMetricsSnapshotSchema,
  listHealthScoresSchema,
  createHealthScoreSchema,
  updateHealthScoreSchema,
  listFeatureEventsSchema,
  createFeatureEventSchema,
  listExperimentsSchema,
  createExperimentSchema,
  updateExperimentSchema,
  listReleasesSchema,
  createReleaseSchema,
  updateReleaseSchema,
} from '@/lib/validation/schemas/platform-analytics'

// ============================================================================
// Type System
// ============================================================================

describe('Module 49 — Platform Analytics Types', () => {
  test('MetricType has 9 values', () => {
    const types: MetricType[] = [
      'active_users', 'revenue', 'churn', 'nps', 'feature_adoption',
      'storage_usage', 'api_calls', 'support_tickets', 'onboarding_completion',
    ]
    expect(types).toHaveLength(9)
  })

  test('MetricPeriod has 4 values', () => {
    const periods: MetricPeriod[] = ['daily', 'weekly', 'monthly', 'quarterly']
    expect(periods).toHaveLength(4)
  })

  test('RiskLevel has 4 values', () => {
    const levels: RiskLevel[] = ['healthy', 'at_risk', 'churning', 'critical']
    expect(levels).toHaveLength(4)
  })

  test('EventType has 3 values', () => {
    const types: EventType[] = ['page_view', 'action', 'api_call']
    expect(types).toHaveLength(3)
  })

  test('ExperimentStatus has 4 values', () => {
    const statuses: ExperimentStatus[] = ['draft', 'active', 'paused', 'completed']
    expect(statuses).toHaveLength(4)
  })

  test('ReleaseType has 4 values', () => {
    const types: ReleaseType[] = ['major', 'minor', 'patch', 'hotfix']
    expect(types).toHaveLength(4)
  })

  test('ReleaseStatus has 4 values', () => {
    const statuses: ReleaseStatus[] = ['planned', 'in_progress', 'deployed', 'rolled_back']
    expect(statuses).toHaveLength(4)
  })

  test('PlatformMetricsSnapshot interface has all required fields', () => {
    const snapshot: PlatformMetricsSnapshot = {
      id: '123',
      company_id: null,
      snapshot_date: '2026-01-15',
      metric_type: 'active_users',
      metric_value: 1500,
      breakdown: { web: 1200, mobile: 300 },
      period: 'daily',
      created_by: null,
      created_at: '2026-01-15T00:00:00Z',
      updated_at: '2026-01-15T00:00:00Z',
    }
    expect(snapshot).toBeDefined()
    expect(snapshot.company_id).toBeNull()
    expect(snapshot.metric_type).toBe('active_users')
  })

  test('TenantHealthScore interface has all required fields', () => {
    const score: TenantHealthScore = {
      id: '123',
      company_id: 'abc',
      score_date: '2026-01-15',
      overall_score: 85,
      adoption_score: 90,
      engagement_score: 80,
      satisfaction_score: 88,
      growth_score: 75,
      risk_level: 'healthy',
      churn_probability: 5.5,
      last_login_at: '2026-01-15T10:00:00Z',
      active_users_count: 42,
      feature_utilization: { scheduling: 0.9 },
      notes: 'Great engagement',
      created_by: 'user1',
      created_at: '2026-01-15T00:00:00Z',
      updated_at: '2026-01-15T00:00:00Z',
    }
    expect(score).toBeDefined()
    expect(score.overall_score).toBe(85)
  })

  test('FeatureUsageEvent interface has all required fields', () => {
    const event: FeatureUsageEvent = {
      id: '123',
      company_id: 'abc',
      user_id: 'user1',
      feature_key: 'scheduling.gantt',
      event_type: 'page_view',
      metadata: {},
      session_id: null,
      created_at: '2026-01-15T00:00:00Z',
    }
    expect(event).toBeDefined()
    expect(event.feature_key).toBe('scheduling.gantt')
  })

  test('AbExperiment interface has all required fields', () => {
    const experiment: AbExperiment = {
      id: '123',
      company_id: null,
      name: 'Test New Onboarding',
      description: null,
      status: 'draft',
      feature_key: 'onboarding.v2',
      variants: [{ name: 'control' }, { name: 'variant_a' }],
      start_date: '2026-01-15',
      end_date: null,
      sample_percentage: 50,
      results: {},
      created_by: 'user1',
      created_at: '2026-01-15T00:00:00Z',
      updated_at: '2026-01-15T00:00:00Z',
    }
    expect(experiment).toBeDefined()
    expect(experiment.company_id).toBeNull()
  })

  test('DeploymentRelease interface has all required fields', () => {
    const release: DeploymentRelease = {
      id: '123',
      version: '2.5.0',
      release_type: 'minor',
      status: 'deployed',
      description: 'New features',
      changelog: '- Added X\n- Fixed Y',
      deployed_at: '2026-01-15T10:00:00Z',
      deployed_by: 'user1',
      rollback_reason: null,
      affected_services: ['api', 'web'],
      created_at: '2026-01-15T00:00:00Z',
      updated_at: '2026-01-15T00:00:00Z',
    }
    expect(release).toBeDefined()
    expect(release.version).toBe('2.5.0')
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 49 — Platform Analytics Constants', () => {
  test('METRIC_TYPES has 9 entries with value and label', () => {
    expect(METRIC_TYPES).toHaveLength(9)
    for (const entry of METRIC_TYPES) {
      expect(entry).toHaveProperty('value')
      expect(entry).toHaveProperty('label')
      expect(typeof entry.label).toBe('string')
    }
  })

  test('METRIC_TYPES includes all expected values', () => {
    const values = METRIC_TYPES.map((t) => t.value)
    expect(values).toContain('active_users')
    expect(values).toContain('revenue')
    expect(values).toContain('churn')
    expect(values).toContain('nps')
    expect(values).toContain('feature_adoption')
    expect(values).toContain('storage_usage')
    expect(values).toContain('api_calls')
    expect(values).toContain('support_tickets')
    expect(values).toContain('onboarding_completion')
  })

  test('METRIC_PERIODS has 4 entries with value and label', () => {
    expect(METRIC_PERIODS).toHaveLength(4)
    for (const entry of METRIC_PERIODS) {
      expect(entry).toHaveProperty('value')
      expect(entry).toHaveProperty('label')
    }
  })

  test('METRIC_PERIODS includes all expected values', () => {
    const values = METRIC_PERIODS.map((p) => p.value)
    expect(values).toContain('daily')
    expect(values).toContain('weekly')
    expect(values).toContain('monthly')
    expect(values).toContain('quarterly')
  })

  test('RISK_LEVELS has 4 entries with value and label', () => {
    expect(RISK_LEVELS).toHaveLength(4)
    for (const entry of RISK_LEVELS) {
      expect(entry).toHaveProperty('value')
      expect(entry).toHaveProperty('label')
    }
  })

  test('RISK_LEVELS includes all expected values', () => {
    const values = RISK_LEVELS.map((r) => r.value)
    expect(values).toContain('healthy')
    expect(values).toContain('at_risk')
    expect(values).toContain('churning')
    expect(values).toContain('critical')
  })

  test('EVENT_TYPES has 3 entries with value and label', () => {
    expect(EVENT_TYPES).toHaveLength(3)
    for (const entry of EVENT_TYPES) {
      expect(entry).toHaveProperty('value')
      expect(entry).toHaveProperty('label')
    }
  })

  test('EVENT_TYPES includes all expected values', () => {
    const values = EVENT_TYPES.map((e) => e.value)
    expect(values).toContain('page_view')
    expect(values).toContain('action')
    expect(values).toContain('api_call')
  })

  test('EXPERIMENT_STATUSES has 4 entries with value and label', () => {
    expect(EXPERIMENT_STATUSES).toHaveLength(4)
    for (const entry of EXPERIMENT_STATUSES) {
      expect(entry).toHaveProperty('value')
      expect(entry).toHaveProperty('label')
    }
  })

  test('EXPERIMENT_STATUSES includes all expected values', () => {
    const values = EXPERIMENT_STATUSES.map((s) => s.value)
    expect(values).toContain('draft')
    expect(values).toContain('active')
    expect(values).toContain('paused')
    expect(values).toContain('completed')
  })

  test('RELEASE_TYPES has 4 entries with value and label', () => {
    expect(RELEASE_TYPES).toHaveLength(4)
    for (const entry of RELEASE_TYPES) {
      expect(entry).toHaveProperty('value')
      expect(entry).toHaveProperty('label')
    }
  })

  test('RELEASE_TYPES includes all expected values', () => {
    const values = RELEASE_TYPES.map((r) => r.value)
    expect(values).toContain('major')
    expect(values).toContain('minor')
    expect(values).toContain('patch')
    expect(values).toContain('hotfix')
  })

  test('RELEASE_STATUSES has 4 entries with value and label', () => {
    expect(RELEASE_STATUSES).toHaveLength(4)
    for (const entry of RELEASE_STATUSES) {
      expect(entry).toHaveProperty('value')
      expect(entry).toHaveProperty('label')
    }
  })

  test('RELEASE_STATUSES includes all expected values', () => {
    const values = RELEASE_STATUSES.map((s) => s.value)
    expect(values).toContain('planned')
    expect(values).toContain('in_progress')
    expect(values).toContain('deployed')
    expect(values).toContain('rolled_back')
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 49 — Enum Schemas', () => {
  test('metricTypeEnum accepts all 9 metric types', () => {
    const types = ['active_users', 'revenue', 'churn', 'nps', 'feature_adoption', 'storage_usage', 'api_calls', 'support_tickets', 'onboarding_completion']
    for (const t of types) {
      expect(metricTypeEnum.safeParse(t).success).toBe(true)
    }
  })

  test('metricTypeEnum rejects invalid type', () => {
    expect(metricTypeEnum.safeParse('invalid').success).toBe(false)
  })

  test('metricPeriodEnum accepts all 4 periods', () => {
    const periods = ['daily', 'weekly', 'monthly', 'quarterly']
    for (const p of periods) {
      expect(metricPeriodEnum.safeParse(p).success).toBe(true)
    }
  })

  test('metricPeriodEnum rejects invalid period', () => {
    expect(metricPeriodEnum.safeParse('yearly').success).toBe(false)
  })

  test('riskLevelEnum accepts all 4 levels', () => {
    const levels = ['healthy', 'at_risk', 'churning', 'critical']
    for (const l of levels) {
      expect(riskLevelEnum.safeParse(l).success).toBe(true)
    }
  })

  test('riskLevelEnum rejects invalid level', () => {
    expect(riskLevelEnum.safeParse('low').success).toBe(false)
  })

  test('eventTypeEnum accepts all 3 event types', () => {
    const types = ['page_view', 'action', 'api_call']
    for (const t of types) {
      expect(eventTypeEnum.safeParse(t).success).toBe(true)
    }
  })

  test('eventTypeEnum rejects invalid type', () => {
    expect(eventTypeEnum.safeParse('click').success).toBe(false)
  })

  test('experimentStatusEnum accepts all 4 statuses', () => {
    const statuses = ['draft', 'active', 'paused', 'completed']
    for (const s of statuses) {
      expect(experimentStatusEnum.safeParse(s).success).toBe(true)
    }
  })

  test('experimentStatusEnum rejects invalid status', () => {
    expect(experimentStatusEnum.safeParse('running').success).toBe(false)
  })

  test('releaseTypeEnum accepts all 4 types', () => {
    const types = ['major', 'minor', 'patch', 'hotfix']
    for (const t of types) {
      expect(releaseTypeEnum.safeParse(t).success).toBe(true)
    }
  })

  test('releaseTypeEnum rejects invalid type', () => {
    expect(releaseTypeEnum.safeParse('emergency').success).toBe(false)
  })

  test('releaseStatusEnum accepts all 4 statuses', () => {
    const statuses = ['planned', 'in_progress', 'deployed', 'rolled_back']
    for (const s of statuses) {
      expect(releaseStatusEnum.safeParse(s).success).toBe(true)
    }
  })

  test('releaseStatusEnum rejects invalid status', () => {
    expect(releaseStatusEnum.safeParse('cancelled').success).toBe(false)
  })
})

// ============================================================================
// Metrics Snapshot Schemas
// ============================================================================

describe('Module 49 — Metrics Snapshot Schemas', () => {
  test('listMetricsSnapshotsSchema defaults page=1 and limit=20', () => {
    const result = listMetricsSnapshotsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listMetricsSnapshotsSchema rejects limit > 100', () => {
    const result = listMetricsSnapshotsSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  test('listMetricsSnapshotsSchema accepts optional filters', () => {
    const result = listMetricsSnapshotsSchema.parse({
      metric_type: 'revenue',
      period: 'monthly',
      date_from: '2026-01-01',
      date_to: '2026-12-31',
    })
    expect(result.metric_type).toBe('revenue')
    expect(result.period).toBe('monthly')
    expect(result.date_from).toBe('2026-01-01')
    expect(result.date_to).toBe('2026-12-31')
  })

  test('listMetricsSnapshotsSchema rejects invalid date format', () => {
    const result = listMetricsSnapshotsSchema.safeParse({ date_from: '01/01/2026' })
    expect(result.success).toBe(false)
  })

  test('listMetricsSnapshotsSchema accepts company_id filter', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000'
    const result = listMetricsSnapshotsSchema.parse({ company_id: uuid })
    expect(result.company_id).toBe(uuid)
  })

  test('createMetricsSnapshotSchema requires metric_type', () => {
    const result = createMetricsSnapshotSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  test('createMetricsSnapshotSchema accepts valid snapshot', () => {
    const result = createMetricsSnapshotSchema.parse({
      metric_type: 'active_users',
      metric_value: 1500,
    })
    expect(result.metric_type).toBe('active_users')
    expect(result.metric_value).toBe(1500)
    expect(result.period).toBe('daily')
    expect(result.breakdown).toEqual({})
  })

  test('createMetricsSnapshotSchema applies defaults', () => {
    const result = createMetricsSnapshotSchema.parse({
      metric_type: 'revenue',
    })
    expect(result.metric_value).toBe(0)
    expect(result.period).toBe('daily')
    expect(result.breakdown).toEqual({})
  })

  test('createMetricsSnapshotSchema accepts full input', () => {
    const result = createMetricsSnapshotSchema.parse({
      snapshot_date: '2026-03-15',
      metric_type: 'nps',
      metric_value: 72.5,
      breakdown: { promoters: 60, detractors: 10 },
      period: 'quarterly',
    })
    expect(result.snapshot_date).toBe('2026-03-15')
    expect(result.metric_type).toBe('nps')
    expect(result.period).toBe('quarterly')
  })

  test('createMetricsSnapshotSchema rejects invalid date format', () => {
    const result = createMetricsSnapshotSchema.safeParse({
      metric_type: 'revenue',
      snapshot_date: '2026/01/01',
    })
    expect(result.success).toBe(false)
  })

  test('updateMetricsSnapshotSchema allows partial updates', () => {
    const result = updateMetricsSnapshotSchema.parse({ metric_value: 2000 })
    expect(result.metric_value).toBe(2000)
    expect(result.metric_type).toBeUndefined()
  })

  test('updateMetricsSnapshotSchema accepts all fields', () => {
    const result = updateMetricsSnapshotSchema.parse({
      snapshot_date: '2026-02-01',
      metric_type: 'churn',
      metric_value: 3.2,
      breakdown: { voluntary: 2.0, involuntary: 1.2 },
      period: 'monthly',
    })
    expect(result.metric_type).toBe('churn')
    expect(result.period).toBe('monthly')
  })
})

// ============================================================================
// Health Score Schemas
// ============================================================================

describe('Module 49 — Health Score Schemas', () => {
  test('listHealthScoresSchema defaults page=1 and limit=20', () => {
    const result = listHealthScoresSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listHealthScoresSchema rejects limit > 100', () => {
    const result = listHealthScoresSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  test('listHealthScoresSchema accepts risk_level filter', () => {
    const result = listHealthScoresSchema.parse({ risk_level: 'at_risk' })
    expect(result.risk_level).toBe('at_risk')
  })

  test('listHealthScoresSchema accepts score range filters', () => {
    const result = listHealthScoresSchema.parse({ min_score: 20, max_score: 80 })
    expect(result.min_score).toBe(20)
    expect(result.max_score).toBe(80)
  })

  test('listHealthScoresSchema accepts date range filters', () => {
    const result = listHealthScoresSchema.parse({
      date_from: '2026-01-01',
      date_to: '2026-06-30',
    })
    expect(result.date_from).toBe('2026-01-01')
    expect(result.date_to).toBe('2026-06-30')
  })

  test('listHealthScoresSchema rejects invalid date format', () => {
    const result = listHealthScoresSchema.safeParse({ date_from: 'Jan 2026' })
    expect(result.success).toBe(false)
  })

  test('listHealthScoresSchema accepts q filter', () => {
    const result = listHealthScoresSchema.parse({ q: 'engagement' })
    expect(result.q).toBe('engagement')
  })

  test('createHealthScoreSchema applies defaults', () => {
    const result = createHealthScoreSchema.parse({})
    expect(result.overall_score).toBe(0)
    expect(result.adoption_score).toBe(0)
    expect(result.engagement_score).toBe(0)
    expect(result.satisfaction_score).toBe(0)
    expect(result.growth_score).toBe(0)
    expect(result.risk_level).toBe('healthy')
    expect(result.churn_probability).toBe(0)
    expect(result.active_users_count).toBe(0)
    expect(result.feature_utilization).toEqual({})
  })

  test('createHealthScoreSchema accepts valid health score', () => {
    const result = createHealthScoreSchema.parse({
      overall_score: 85,
      adoption_score: 90,
      engagement_score: 80,
      satisfaction_score: 88,
      growth_score: 75,
      risk_level: 'healthy',
      churn_probability: 5.5,
    })
    expect(result.overall_score).toBe(85)
    expect(result.risk_level).toBe('healthy')
  })

  test('createHealthScoreSchema rejects score > 100', () => {
    const result = createHealthScoreSchema.safeParse({ overall_score: 101 })
    expect(result.success).toBe(false)
  })

  test('createHealthScoreSchema rejects score < 0', () => {
    const result = createHealthScoreSchema.safeParse({ overall_score: -1 })
    expect(result.success).toBe(false)
  })

  test('createHealthScoreSchema rejects churn_probability > 100', () => {
    const result = createHealthScoreSchema.safeParse({ churn_probability: 101 })
    expect(result.success).toBe(false)
  })

  test('createHealthScoreSchema rejects churn_probability < 0', () => {
    const result = createHealthScoreSchema.safeParse({ churn_probability: -1 })
    expect(result.success).toBe(false)
  })

  test('createHealthScoreSchema accepts full input with all fields', () => {
    const result = createHealthScoreSchema.parse({
      score_date: '2026-03-15',
      overall_score: 72,
      adoption_score: 65,
      engagement_score: 78,
      satisfaction_score: 80,
      growth_score: 55,
      risk_level: 'at_risk',
      churn_probability: 25.5,
      last_login_at: '2026-03-14T10:00:00Z',
      active_users_count: 15,
      feature_utilization: { scheduling: 0.8, budgets: 0.3 },
      notes: 'Needs attention',
    })
    expect(result.score_date).toBe('2026-03-15')
    expect(result.risk_level).toBe('at_risk')
  })

  test('createHealthScoreSchema validates score_date format', () => {
    const result = createHealthScoreSchema.safeParse({ score_date: '2026/03/15' })
    expect(result.success).toBe(false)
  })

  test('updateHealthScoreSchema allows partial updates', () => {
    const result = updateHealthScoreSchema.parse({ overall_score: 90 })
    expect(result.overall_score).toBe(90)
    expect(result.risk_level).toBeUndefined()
  })

  test('updateHealthScoreSchema accepts notes update', () => {
    const result = updateHealthScoreSchema.parse({ notes: 'Improved this month' })
    expect(result.notes).toBe('Improved this month')
  })

  test('updateHealthScoreSchema accepts null notes', () => {
    const result = updateHealthScoreSchema.parse({ notes: null })
    expect(result.notes).toBeNull()
  })
})

// ============================================================================
// Feature Event Schemas
// ============================================================================

describe('Module 49 — Feature Event Schemas', () => {
  test('listFeatureEventsSchema defaults page=1 and limit=50', () => {
    const result = listFeatureEventsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('listFeatureEventsSchema rejects limit > 100', () => {
    const result = listFeatureEventsSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  test('listFeatureEventsSchema accepts feature_key filter', () => {
    const result = listFeatureEventsSchema.parse({ feature_key: 'scheduling.gantt' })
    expect(result.feature_key).toBe('scheduling.gantt')
  })

  test('listFeatureEventsSchema accepts event_type filter', () => {
    const result = listFeatureEventsSchema.parse({ event_type: 'page_view' })
    expect(result.event_type).toBe('page_view')
  })

  test('listFeatureEventsSchema accepts user_id filter', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000'
    const result = listFeatureEventsSchema.parse({ user_id: uuid })
    expect(result.user_id).toBe(uuid)
  })

  test('listFeatureEventsSchema accepts session_id filter', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000'
    const result = listFeatureEventsSchema.parse({ session_id: uuid })
    expect(result.session_id).toBe(uuid)
  })

  test('listFeatureEventsSchema accepts date range filters', () => {
    const result = listFeatureEventsSchema.parse({
      date_from: '2026-01-01',
      date_to: '2026-06-30',
    })
    expect(result.date_from).toBe('2026-01-01')
    expect(result.date_to).toBe('2026-06-30')
  })

  test('listFeatureEventsSchema rejects invalid date format', () => {
    const result = listFeatureEventsSchema.safeParse({ date_from: '2026-1-1' })
    expect(result.success).toBe(false)
  })

  test('createFeatureEventSchema requires feature_key', () => {
    const result = createFeatureEventSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  test('createFeatureEventSchema accepts valid event', () => {
    const result = createFeatureEventSchema.parse({
      feature_key: 'budgets.variance',
    })
    expect(result.feature_key).toBe('budgets.variance')
    expect(result.event_type).toBe('action')
    expect(result.metadata).toEqual({})
  })

  test('createFeatureEventSchema rejects feature_key > 100 chars', () => {
    const result = createFeatureEventSchema.safeParse({
      feature_key: 'a'.repeat(101),
    })
    expect(result.success).toBe(false)
  })

  test('createFeatureEventSchema accepts all optional fields', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000'
    const result = createFeatureEventSchema.parse({
      feature_key: 'reports.custom',
      event_type: 'page_view',
      user_id: uuid,
      metadata: { source: 'nav' },
      session_id: uuid,
    })
    expect(result.event_type).toBe('page_view')
    expect(result.user_id).toBe(uuid)
    expect(result.session_id).toBe(uuid)
  })

  test('createFeatureEventSchema applies default event_type', () => {
    const result = createFeatureEventSchema.parse({ feature_key: 'test' })
    expect(result.event_type).toBe('action')
  })

  test('createFeatureEventSchema rejects invalid event_type', () => {
    const result = createFeatureEventSchema.safeParse({
      feature_key: 'test',
      event_type: 'click',
    })
    expect(result.success).toBe(false)
  })
})

// ============================================================================
// Experiment Schemas
// ============================================================================

describe('Module 49 — Experiment Schemas', () => {
  test('listExperimentsSchema defaults page=1 and limit=20', () => {
    const result = listExperimentsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listExperimentsSchema rejects limit > 100', () => {
    const result = listExperimentsSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  test('listExperimentsSchema accepts status filter', () => {
    const result = listExperimentsSchema.parse({ status: 'active' })
    expect(result.status).toBe('active')
  })

  test('listExperimentsSchema accepts feature_key filter', () => {
    const result = listExperimentsSchema.parse({ feature_key: 'onboarding.v2' })
    expect(result.feature_key).toBe('onboarding.v2')
  })

  test('listExperimentsSchema accepts q filter', () => {
    const result = listExperimentsSchema.parse({ q: 'onboarding' })
    expect(result.q).toBe('onboarding')
  })

  test('createExperimentSchema requires name', () => {
    const result = createExperimentSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  test('createExperimentSchema accepts valid experiment', () => {
    const result = createExperimentSchema.parse({
      name: 'Test New Dashboard',
    })
    expect(result.name).toBe('Test New Dashboard')
    expect(result.status).toBe('draft')
    expect(result.sample_percentage).toBe(100)
    expect(result.variants).toEqual([])
    expect(result.results).toEqual({})
  })

  test('createExperimentSchema rejects name > 200 chars', () => {
    const result = createExperimentSchema.safeParse({
      name: 'a'.repeat(201),
    })
    expect(result.success).toBe(false)
  })

  test('createExperimentSchema rejects empty name', () => {
    const result = createExperimentSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  test('createExperimentSchema applies defaults', () => {
    const result = createExperimentSchema.parse({ name: 'Test' })
    expect(result.status).toBe('draft')
    expect(result.sample_percentage).toBe(100)
    expect(result.variants).toEqual([])
    expect(result.results).toEqual({})
  })

  test('createExperimentSchema accepts full input', () => {
    const result = createExperimentSchema.parse({
      name: 'Onboarding Flow V2',
      description: 'Testing new onboarding wizard',
      status: 'active',
      feature_key: 'onboarding.wizard',
      variants: [{ name: 'control', weight: 50 }, { name: 'variant_a', weight: 50 }],
      start_date: '2026-03-01',
      end_date: '2026-04-01',
      sample_percentage: 50,
      results: { conversion_rate: { control: 0.12, variant_a: 0.18 } },
    })
    expect(result.status).toBe('active')
    expect(result.sample_percentage).toBe(50)
    expect(result.start_date).toBe('2026-03-01')
  })

  test('createExperimentSchema rejects sample_percentage < 1', () => {
    const result = createExperimentSchema.safeParse({
      name: 'Test',
      sample_percentage: 0,
    })
    expect(result.success).toBe(false)
  })

  test('createExperimentSchema rejects sample_percentage > 100', () => {
    const result = createExperimentSchema.safeParse({
      name: 'Test',
      sample_percentage: 101,
    })
    expect(result.success).toBe(false)
  })

  test('createExperimentSchema validates date format', () => {
    const result = createExperimentSchema.safeParse({
      name: 'Test',
      start_date: '03/01/2026',
    })
    expect(result.success).toBe(false)
  })

  test('createExperimentSchema accepts null dates', () => {
    const result = createExperimentSchema.parse({
      name: 'Test',
      start_date: null,
      end_date: null,
    })
    expect(result.start_date).toBeNull()
    expect(result.end_date).toBeNull()
  })

  test('updateExperimentSchema allows partial updates', () => {
    const result = updateExperimentSchema.parse({ status: 'paused' })
    expect(result.status).toBe('paused')
    expect(result.name).toBeUndefined()
  })

  test('updateExperimentSchema accepts results update', () => {
    const result = updateExperimentSchema.parse({
      results: { conversion_rate: { control: 0.12, variant_a: 0.18 } },
    })
    expect(result.results).toBeDefined()
  })

  test('updateExperimentSchema rejects invalid status', () => {
    const result = updateExperimentSchema.safeParse({ status: 'running' })
    expect(result.success).toBe(false)
  })

  test('updateExperimentSchema accepts sample_percentage update', () => {
    const result = updateExperimentSchema.parse({ sample_percentage: 75 })
    expect(result.sample_percentage).toBe(75)
  })
})

// ============================================================================
// Release Schemas
// ============================================================================

describe('Module 49 — Release Schemas', () => {
  test('listReleasesSchema defaults page=1 and limit=20', () => {
    const result = listReleasesSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listReleasesSchema rejects limit > 100', () => {
    const result = listReleasesSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  test('listReleasesSchema accepts release_type filter', () => {
    const result = listReleasesSchema.parse({ release_type: 'hotfix' })
    expect(result.release_type).toBe('hotfix')
  })

  test('listReleasesSchema accepts status filter', () => {
    const result = listReleasesSchema.parse({ status: 'deployed' })
    expect(result.status).toBe('deployed')
  })

  test('listReleasesSchema accepts q filter', () => {
    const result = listReleasesSchema.parse({ q: '2.5' })
    expect(result.q).toBe('2.5')
  })

  test('createReleaseSchema requires version', () => {
    const result = createReleaseSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  test('createReleaseSchema accepts valid release', () => {
    const result = createReleaseSchema.parse({
      version: '2.5.0',
    })
    expect(result.version).toBe('2.5.0')
    expect(result.release_type).toBe('minor')
    expect(result.status).toBe('planned')
    expect(result.affected_services).toEqual([])
  })

  test('createReleaseSchema rejects version > 50 chars', () => {
    const result = createReleaseSchema.safeParse({
      version: 'v'.repeat(51),
    })
    expect(result.success).toBe(false)
  })

  test('createReleaseSchema rejects empty version', () => {
    const result = createReleaseSchema.safeParse({ version: '' })
    expect(result.success).toBe(false)
  })

  test('createReleaseSchema applies defaults', () => {
    const result = createReleaseSchema.parse({ version: '1.0.0' })
    expect(result.release_type).toBe('minor')
    expect(result.status).toBe('planned')
    expect(result.affected_services).toEqual([])
  })

  test('createReleaseSchema accepts full input', () => {
    const result = createReleaseSchema.parse({
      version: '3.0.0',
      release_type: 'major',
      status: 'deployed',
      description: 'Major platform update',
      changelog: '- New dashboard\n- Performance improvements',
      deployed_at: '2026-03-15T10:00:00Z',
      rollback_reason: null,
      affected_services: ['api', 'web', 'worker'],
    })
    expect(result.release_type).toBe('major')
    expect(result.status).toBe('deployed')
    expect(result.deployed_at).toBe('2026-03-15T10:00:00Z')
  })

  test('createReleaseSchema accepts rollback_reason', () => {
    const result = createReleaseSchema.parse({
      version: '2.5.1',
      release_type: 'hotfix',
      status: 'rolled_back',
      rollback_reason: 'Critical bug in payment processing',
    })
    expect(result.rollback_reason).toBe('Critical bug in payment processing')
  })

  test('updateReleaseSchema allows partial updates', () => {
    const result = updateReleaseSchema.parse({ status: 'deployed' })
    expect(result.status).toBe('deployed')
    expect(result.version).toBeUndefined()
  })

  test('updateReleaseSchema accepts changelog update', () => {
    const result = updateReleaseSchema.parse({
      changelog: '- Bug fix 1\n- Bug fix 2',
    })
    expect(result.changelog).toBe('- Bug fix 1\n- Bug fix 2')
  })

  test('updateReleaseSchema accepts null description', () => {
    const result = updateReleaseSchema.parse({ description: null })
    expect(result.description).toBeNull()
  })

  test('updateReleaseSchema rejects invalid release_type', () => {
    const result = updateReleaseSchema.safeParse({ release_type: 'critical' })
    expect(result.success).toBe(false)
  })

  test('updateReleaseSchema rejects invalid status', () => {
    const result = updateReleaseSchema.safeParse({ status: 'cancelled' })
    expect(result.success).toBe(false)
  })

  test('updateReleaseSchema accepts affected_services update', () => {
    const result = updateReleaseSchema.parse({
      affected_services: ['api', 'web'],
    })
    expect(result.affected_services).toEqual(['api', 'web'])
  })
})
