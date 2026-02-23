/**
 * Configuration Engine Types
 *
 * Type definitions for the 4-level configuration hierarchy:
 * Platform Defaults → Company → Project → User
 */

import type { Json } from '@/types/database'

// ============================================================================
// CONFIG LEVELS & RESOLUTION
// ============================================================================

export type ConfigLevel = 'platform' | 'company' | 'project' | 'user'

export interface ConfigContext {
  companyId: string
  projectId?: string
  userId?: string
}

export interface ResolvedConfig<T = unknown> {
  value: T
  level: ConfigLevel
  key: string
  section: string
}

// ============================================================================
// TENANT CONFIG
// ============================================================================

export type ConfigSection =
  | 'financial'
  | 'regional'
  | 'ai'
  | 'portal'
  | 'notifications'
  | 'security'
  | 'branding'

export type ConfigDataType = 'string' | 'number' | 'boolean' | 'json' | 'array'

export interface TenantConfig {
  id: string
  companyId: string
  section: ConfigSection
  key: string
  value: Json
  description?: string
  dataType: ConfigDataType
  isSensitive: boolean
  createdAt: string
  updatedAt: string
}

export interface TenantConfigInput {
  section: ConfigSection
  key: string
  value: Json
  description?: string
  dataType?: ConfigDataType
  isSensitive?: boolean
}

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'enterprise'

export interface FeatureFlag {
  id: string
  companyId: string
  flagKey: string
  enabled: boolean
  planRequired?: SubscriptionPlan
  metadata: Record<string, unknown>
  enabledAt?: string
  enabledBy?: string
  createdAt: string
  updatedAt: string
}

export interface FeatureFlagInput {
  flagKey: string
  enabled: boolean
  planRequired?: SubscriptionPlan
  metadata?: Record<string, unknown>
}

// Known feature flags
export type FeatureFlagKey =
  | 'ai_invoice_processing'
  | 'ai_document_classification'
  | 'ai_cost_code_suggestion'
  | 'ai_risk_detection'
  | 'quickbooks_sync'
  | 'xero_sync'
  | 'sage_sync'
  | 'docusign_integration'
  | 'stripe_payments'
  | 'client_portal'
  | 'vendor_portal'
  | 'time_tracking'
  | 'equipment_tracking'
  | 'inventory_management'
  | 'advanced_reporting'
  | 'custom_fields'
  | 'multi_currency'
  | 'api_access'
  | 'white_label'

// ============================================================================
// WORKFLOW DEFINITIONS
// ============================================================================

export type WorkflowEntityType =
  | 'invoice'
  | 'purchase_order'
  | 'change_order'
  | 'draw'
  | 'selection'
  | 'estimate'
  | 'contract'

export interface WorkflowState {
  name: string
  label: string
  color: string
  isInitial?: boolean
  isFinal?: boolean
  description?: string
}

export interface WorkflowTransition {
  from: string
  to: string
  label: string
  conditions?: WorkflowCondition[]
  requiredRole?: string[]
  notifyRoles?: string[]
}

export interface WorkflowCondition {
  field: string
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains'
  value: unknown
}

export interface AmountThreshold {
  min: number
  max: number | null
  autoApprove: boolean
  requiredApprovers: string[]
}

export interface WorkflowDefinition {
  id: string
  companyId: string
  entityType: WorkflowEntityType
  name: string
  description?: string
  isActive: boolean
  isDefault: boolean
  states: WorkflowState[]
  transitions: WorkflowTransition[]
  thresholds: {
    amountThresholds?: AmountThreshold[]
  }
  notifications: {
    onEnterState?: Record<string, string[]>
    onTransition?: Record<string, string[]>
  }
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface WorkflowDefinitionInput {
  entityType: WorkflowEntityType
  name: string
  description?: string
  isActive?: boolean
  isDefault?: boolean
  states: WorkflowState[]
  transitions: WorkflowTransition[]
  thresholds?: WorkflowDefinition['thresholds']
  notifications?: WorkflowDefinition['notifications']
}

// ============================================================================
// PROJECT PHASES
// ============================================================================

export type MilestoneType = 'start' | 'completion' | 'payment' | null

export interface ProjectPhase {
  id: string
  companyId: string
  name: string
  description?: string
  color: string
  defaultDurationDays?: number
  sortOrder: number
  isActive: boolean
  isSystem: boolean
  milestoneType: MilestoneType
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface ProjectPhaseInput {
  name: string
  description?: string
  color?: string
  defaultDurationDays?: number
  sortOrder?: number
  milestoneType?: MilestoneType
}

// ============================================================================
// TERMINOLOGY
// ============================================================================

export interface TerminologyOverride {
  id: string
  companyId: string
  termKey: string
  displayValue: string
  pluralValue?: string
  context?: 'portal' | 'internal' | 'documents'
  createdAt: string
  updatedAt: string
}

export interface TerminologyInput {
  termKey: string
  displayValue: string
  pluralValue?: string
  context?: 'portal' | 'internal' | 'documents'
}

// Known terminology keys
export type TerminologyKey =
  | 'job'
  | 'project'
  | 'vendor'
  | 'subcontractor'
  | 'trade_partner'
  | 'client'
  | 'homeowner'
  | 'customer'
  | 'invoice'
  | 'bill'
  | 'draw'
  | 'draw_request'
  | 'change_order'
  | 'co'
  | 'purchase_order'
  | 'po'
  | 'estimate'
  | 'quote'
  | 'proposal'
  | 'bid'
  | 'rfi'
  | 'submittal'
  | 'daily_log'
  | 'field_report'
  | 'punch_list'
  | 'selection'
  | 'allowance'
  | 'cost_code'
  | 'phase'
  | 'milestone'
  | 'task'
  | 'budget'
  | 'contract'
  | 'lien_waiver'
  | 'warranty'
  | 'inspection'
  | 'permit'
  | 'document'
  | 'photo'
  | 'note'
  | 'team_member'
  | 'employee'
  | 'superintendent'
  | 'project_manager'

// ============================================================================
// NUMBERING PATTERNS
// ============================================================================

export type NumberingScope = 'global' | 'per_job' | 'per_year'

export type NumberingEntityType =
  | 'job'
  | 'invoice'
  | 'purchase_order'
  | 'change_order'
  | 'draw'
  | 'estimate'
  | 'contract'
  | 'rfi'

export interface NumberingPattern {
  id: string
  companyId: string
  entityType: NumberingEntityType
  pattern: string // e.g., 'JOB-{YYYY}-{###}'
  scope: NumberingScope
  currentSequence: number
  prefix?: string
  suffix?: string
  padding: number
  resetYearly: boolean
  lastResetYear?: number
  sampleOutput?: string
  createdAt: string
  updatedAt: string
}

export interface NumberingPatternInput {
  entityType: NumberingEntityType
  pattern: string
  scope?: NumberingScope
  prefix?: string
  suffix?: string
  padding?: number
  resetYearly?: boolean
}

// ============================================================================
// CUSTOM FIELDS (EAV)
// ============================================================================

export type CustomFieldType =
  | 'text'
  | 'number'
  | 'currency'
  | 'percent'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'textarea'
  | 'url'
  | 'email'
  | 'phone'

export type CustomFieldEntityType =
  | 'job'
  | 'vendor'
  | 'client'
  | 'invoice'
  | 'purchase_order'
  | 'change_order'
  | 'draw'
  | 'estimate'

export interface CustomFieldOption {
  value: string
  label: string
  color?: string
}

export interface CustomFieldCondition {
  field: string
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'empty' | 'not_empty'
  value: unknown
}

export interface CustomFieldValidation {
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  patternMessage?: string
}

export interface CustomFieldDefinition {
  id: string
  companyId: string
  entityType: CustomFieldEntityType
  fieldKey: string
  fieldLabel: string
  fieldType: CustomFieldType
  description?: string
  placeholder?: string
  defaultValue?: Json
  options?: CustomFieldOption[]
  validation: CustomFieldValidation
  showConditions?: CustomFieldCondition[]
  section?: string
  sortOrder: number
  visibleToRoles?: string[]
  editableByRoles?: string[]
  showInPortal: boolean
  showInListView: boolean
  isRequired: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface CustomFieldDefinitionInput {
  entityType: CustomFieldEntityType
  fieldKey: string
  fieldLabel: string
  fieldType: CustomFieldType
  description?: string
  placeholder?: string
  defaultValue?: Json
  options?: CustomFieldOption[]
  validation?: CustomFieldValidation
  showConditions?: CustomFieldCondition[]
  section?: string
  sortOrder?: number
  visibleToRoles?: string[]
  editableByRoles?: string[]
  showInPortal?: boolean
  showInListView?: boolean
  isRequired?: boolean
}

export interface CustomFieldValue {
  id: string
  companyId: string
  fieldDefinitionId: string
  entityType: CustomFieldEntityType
  entityId: string
  value: Json
  createdAt: string
  updatedAt: string
}

// ============================================================================
// CONFIG VERSIONS
// ============================================================================

export interface ConfigVersion {
  id: string
  companyId: string
  section: string
  versionNumber: number
  snapshotData: Json
  changeSummary?: string
  changedBy?: string
  changedAt: string
}

// ============================================================================
// COMPANY SETTINGS (Extended)
// ============================================================================

export interface CompanySettings {
  // Financial
  invoiceApprovalThreshold: number
  poApprovalThreshold: number
  defaultMarkupPercent: number
  defaultRetainagePercent: number
  defaultPaymentTerms: string
  fiscalYearStartMonth: number

  // Regional
  timezone: string
  dateFormat: string
  currency: string
  measurementSystem: 'imperial' | 'metric'

  // AI
  autoMatchConfidence: number
  costCodeSuggestionEnabled: boolean
  riskDetectionEnabled: boolean
  invoiceAutoRouteThreshold: number

  // Portal
  clientPortalEnabled: boolean
  vendorPortalEnabled: boolean
  allowClientPhotoUpload: boolean
  showBudgetToClients: boolean

  // Notifications
  emailNotificationsEnabled: boolean
  pushNotificationsEnabled: boolean
  digestFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
}

export type CompanySettingsKey = keyof CompanySettings
