/**
 * Module 49: Platform Analytics Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const metricTypeEnum = z.enum([
  'active_users', 'revenue', 'churn', 'nps', 'feature_adoption',
  'storage_usage', 'api_calls', 'support_tickets', 'onboarding_completion',
])

export const metricPeriodEnum = z.enum(['daily', 'weekly', 'monthly', 'quarterly'])

export const riskLevelEnum = z.enum(['healthy', 'at_risk', 'churning', 'critical'])

export const eventTypeEnum = z.enum(['page_view', 'action', 'api_call'])

export const experimentStatusEnum = z.enum(['draft', 'active', 'paused', 'completed'])

export const releaseTypeEnum = z.enum(['major', 'minor', 'patch', 'hotfix'])

export const releaseStatusEnum = z.enum(['planned', 'in_progress', 'deployed', 'rolled_back'])

// ── Platform Metrics Snapshots ────────────────────────────────────────────

export const listMetricsSnapshotsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  metric_type: metricTypeEnum.optional(),
  period: metricPeriodEnum.optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  company_id: z.string().uuid().nullable().optional(),
})

export const createMetricsSnapshotSchema = z.object({
  snapshot_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  metric_type: metricTypeEnum,
  metric_value: z.number().default(0),
  breakdown: z.record(z.string(), z.unknown()).optional().default({}),
  period: metricPeriodEnum.optional().default('daily'),
})

export const updateMetricsSnapshotSchema = z.object({
  snapshot_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  metric_type: metricTypeEnum.optional(),
  metric_value: z.number().optional(),
  breakdown: z.record(z.string(), z.unknown()).optional(),
  period: metricPeriodEnum.optional(),
})

// ── Tenant Health Scores ──────────────────────────────────────────────────

export const listHealthScoresSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  risk_level: riskLevelEnum.optional(),
  min_score: z.coerce.number().int().min(0).max(100).optional(),
  max_score: z.coerce.number().int().min(0).max(100).optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createHealthScoreSchema = z.object({
  score_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  overall_score: z.number().int().min(0).max(100).default(0),
  adoption_score: z.number().int().min(0).max(100).default(0),
  engagement_score: z.number().int().min(0).max(100).default(0),
  satisfaction_score: z.number().int().min(0).max(100).default(0),
  growth_score: z.number().int().min(0).max(100).default(0),
  risk_level: riskLevelEnum.optional().default('healthy'),
  churn_probability: z.number().min(0).max(100).default(0),
  last_login_at: z.string().optional().nullable(),
  active_users_count: z.number().int().min(0).default(0),
  feature_utilization: z.record(z.string(), z.unknown()).optional().default({}),
  notes: z.string().trim().max(5000).nullable().optional(),
})

export const updateHealthScoreSchema = z.object({
  score_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  overall_score: z.number().int().min(0).max(100).optional(),
  adoption_score: z.number().int().min(0).max(100).optional(),
  engagement_score: z.number().int().min(0).max(100).optional(),
  satisfaction_score: z.number().int().min(0).max(100).optional(),
  growth_score: z.number().int().min(0).max(100).optional(),
  risk_level: riskLevelEnum.optional(),
  churn_probability: z.number().min(0).max(100).optional(),
  last_login_at: z.string().optional().nullable(),
  active_users_count: z.number().int().min(0).optional(),
  feature_utilization: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── Feature Usage Events ──────────────────────────────────────────────────

export const listFeatureEventsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  feature_key: z.string().trim().min(1).max(100).optional(),
  event_type: eventTypeEnum.optional(),
  user_id: z.string().uuid().optional(),
  session_id: z.string().uuid().optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
})

export const createFeatureEventSchema = z.object({
  feature_key: z.string().trim().min(1).max(100),
  event_type: eventTypeEnum.optional().default('action'),
  user_id: z.string().uuid().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
  session_id: z.string().uuid().optional().nullable(),
})

// ── A/B Experiments ───────────────────────────────────────────────────────

export const listExperimentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: experimentStatusEnum.optional(),
  feature_key: z.string().trim().min(1).max(100).optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createExperimentSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).nullable().optional(),
  status: experimentStatusEnum.optional().default('draft'),
  feature_key: z.string().trim().max(100).nullable().optional(),
  variants: z.array(z.unknown()).optional().default([]),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  sample_percentage: z.number().int().min(1).max(100).optional().default(100),
  results: z.record(z.string(), z.unknown()).optional().default({}),
})

export const updateExperimentSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  status: experimentStatusEnum.optional(),
  feature_key: z.string().trim().max(100).nullable().optional(),
  variants: z.array(z.unknown()).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').nullable().optional(),
  sample_percentage: z.number().int().min(1).max(100).optional(),
  results: z.record(z.string(), z.unknown()).optional(),
})

// ── Deployment Releases ───────────────────────────────────────────────────

export const listReleasesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  release_type: releaseTypeEnum.optional(),
  status: releaseStatusEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createReleaseSchema = z.object({
  version: z.string().trim().min(1).max(50),
  release_type: releaseTypeEnum.optional().default('minor'),
  status: releaseStatusEnum.optional().default('planned'),
  description: z.string().trim().max(10000).nullable().optional(),
  changelog: z.string().trim().max(50000).nullable().optional(),
  deployed_at: z.string().nullable().optional(),
  rollback_reason: z.string().trim().max(5000).nullable().optional(),
  affected_services: z.array(z.unknown()).optional().default([]),
})

export const updateReleaseSchema = z.object({
  version: z.string().trim().min(1).max(50).optional(),
  release_type: releaseTypeEnum.optional(),
  status: releaseStatusEnum.optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  changelog: z.string().trim().max(50000).nullable().optional(),
  deployed_at: z.string().nullable().optional(),
  rollback_reason: z.string().trim().max(5000).nullable().optional(),
  affected_services: z.array(z.unknown()).optional(),
})
