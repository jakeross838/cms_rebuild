/**
 * Module 49: Platform Analytics Types
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type MetricType =
  | 'active_users'
  | 'revenue'
  | 'churn'
  | 'nps'
  | 'feature_adoption'
  | 'storage_usage'
  | 'api_calls'
  | 'support_tickets'
  | 'onboarding_completion'

export type MetricPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly'

export type RiskLevel = 'healthy' | 'at_risk' | 'churning' | 'critical'

export type EventType = 'page_view' | 'action' | 'api_call'

export type ExperimentStatus = 'draft' | 'active' | 'paused' | 'completed'

export type ReleaseType = 'major' | 'minor' | 'patch' | 'hotfix'

export type ReleaseStatus = 'planned' | 'in_progress' | 'deployed' | 'rolled_back'

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface PlatformMetricsSnapshot {
  id: string
  company_id: string | null
  snapshot_date: string
  metric_type: MetricType
  metric_value: number
  breakdown: Record<string, unknown>
  period: MetricPeriod
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface TenantHealthScore {
  id: string
  company_id: string
  score_date: string
  overall_score: number
  adoption_score: number
  engagement_score: number
  satisfaction_score: number
  growth_score: number
  risk_level: RiskLevel
  churn_probability: number
  last_login_at: string | null
  active_users_count: number
  feature_utilization: Record<string, unknown>
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface FeatureUsageEvent {
  id: string
  company_id: string
  user_id: string | null
  feature_key: string
  event_type: EventType
  metadata: Record<string, unknown>
  session_id: string | null
  created_at: string
}

export interface AbExperiment {
  id: string
  company_id: string | null
  name: string
  description: string | null
  status: ExperimentStatus
  feature_key: string | null
  variants: unknown[]
  start_date: string | null
  end_date: string | null
  sample_percentage: number
  results: Record<string, unknown>
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface DeploymentRelease {
  id: string
  version: string
  release_type: ReleaseType
  status: ReleaseStatus
  description: string | null
  changelog: string | null
  deployed_at: string | null
  deployed_by: string | null
  rollback_reason: string | null
  affected_services: unknown[]
  created_at: string
  updated_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const METRIC_TYPES: { value: MetricType; label: string }[] = [
  { value: 'active_users', label: 'Active Users' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'churn', label: 'Churn' },
  { value: 'nps', label: 'NPS' },
  { value: 'feature_adoption', label: 'Feature Adoption' },
  { value: 'storage_usage', label: 'Storage Usage' },
  { value: 'api_calls', label: 'API Calls' },
  { value: 'support_tickets', label: 'Support Tickets' },
  { value: 'onboarding_completion', label: 'Onboarding Completion' },
]

export const METRIC_PERIODS: { value: MetricPeriod; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
]

export const RISK_LEVELS: { value: RiskLevel; label: string }[] = [
  { value: 'healthy', label: 'Healthy' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'churning', label: 'Churning' },
  { value: 'critical', label: 'Critical' },
]

export const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'page_view', label: 'Page View' },
  { value: 'action', label: 'Action' },
  { value: 'api_call', label: 'API Call' },
]

export const EXPERIMENT_STATUSES: { value: ExperimentStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
]

export const RELEASE_TYPES: { value: ReleaseType; label: string }[] = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
  { value: 'patch', label: 'Patch' },
  { value: 'hotfix', label: 'Hotfix' },
]

export const RELEASE_STATUSES: { value: ReleaseStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'deployed', label: 'Deployed' },
  { value: 'rolled_back', label: 'Rolled Back' },
]
