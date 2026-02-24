/**
 * Module 41: Onboarding Wizard Types
 */

// ── Union Types ──────────────────────────────────────────────────────────────

export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped'

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'

export type ReminderType = 'email' | 'in_app' | 'push'

export type ReminderStatus = 'scheduled' | 'sent' | 'cancelled' | 'failed'

export type SampleDataType =
  | 'full_demo'
  | 'minimal'
  | 'custom_home'
  | 'production'
  | 'remodel'
  | 'commercial'

export type SampleDataStatus = 'pending' | 'generating' | 'ready' | 'applied' | 'failed'

export type CompanyType =
  | 'custom_home'
  | 'production'
  | 'remodel'
  | 'commercial'
  | 'specialty'

export type CompanySize = '1-5' | '6-20' | '21-50' | '51-100' | '100+'

export type ChecklistCategory = 'setup' | 'data' | 'team' | 'workflow' | 'integration'

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface OnboardingSession {
  id: string
  company_id: string
  user_id: string
  status: OnboardingStatus
  current_step: number
  total_steps: number
  company_type: CompanyType | null
  company_size: CompanySize | null
  started_at: string | null
  completed_at: string | null
  skipped_at: string | null
  metadata: Record<string, unknown>
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface OnboardingMilestone {
  id: string
  company_id: string
  session_id: string
  milestone_key: string
  title: string
  description: string | null
  status: MilestoneStatus
  sort_order: number
  started_at: string | null
  completed_at: string | null
  skipped_at: string | null
  data: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface OnboardingReminder {
  id: string
  company_id: string
  session_id: string
  reminder_type: ReminderType
  subject: string | null
  message: string | null
  scheduled_at: string
  sent_at: string | null
  status: ReminderStatus
  created_at: string
  updated_at: string
}

export interface SampleDataSet {
  id: string
  company_id: string
  name: string
  description: string | null
  data_type: SampleDataType
  status: SampleDataStatus
  content: Record<string, unknown>
  applied_at: string | null
  applied_by: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface OnboardingChecklist {
  id: string
  company_id: string
  session_id: string
  category: ChecklistCategory
  title: string
  description: string | null
  is_completed: boolean
  is_required: boolean
  completed_at: string | null
  completed_by: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

// ── Constants ────────────────────────────────────────────────────────────────

export const ONBOARDING_STATUSES: { value: OnboardingStatus; label: string }[] = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'skipped', label: 'Skipped' },
]

export const MILESTONE_STATUSES: { value: MilestoneStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'skipped', label: 'Skipped' },
]

export const REMINDER_TYPES: { value: ReminderType; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'in_app', label: 'In-App' },
  { value: 'push', label: 'Push Notification' },
]

export const REMINDER_STATUSES: { value: ReminderStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'sent', label: 'Sent' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'failed', label: 'Failed' },
]

export const SAMPLE_DATA_TYPES: { value: SampleDataType; label: string }[] = [
  { value: 'full_demo', label: 'Full Demo' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'custom_home', label: 'Custom Home' },
  { value: 'production', label: 'Production' },
  { value: 'remodel', label: 'Remodel' },
  { value: 'commercial', label: 'Commercial' },
]

export const SAMPLE_DATA_STATUSES: { value: SampleDataStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'generating', label: 'Generating' },
  { value: 'ready', label: 'Ready' },
  { value: 'applied', label: 'Applied' },
  { value: 'failed', label: 'Failed' },
]

export const COMPANY_TYPES: { value: CompanyType; label: string }[] = [
  { value: 'custom_home', label: 'Custom Home' },
  { value: 'production', label: 'Production' },
  { value: 'remodel', label: 'Remodel' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'specialty', label: 'Specialty' },
]

export const COMPANY_SIZES: { value: CompanySize; label: string }[] = [
  { value: '1-5', label: '1-5 Employees' },
  { value: '6-20', label: '6-20 Employees' },
  { value: '21-50', label: '21-50 Employees' },
  { value: '51-100', label: '51-100 Employees' },
  { value: '100+', label: '100+ Employees' },
]

export const CHECKLIST_CATEGORIES: { value: ChecklistCategory; label: string }[] = [
  { value: 'setup', label: 'Setup' },
  { value: 'data', label: 'Data' },
  { value: 'team', label: 'Team' },
  { value: 'workflow', label: 'Workflow' },
  { value: 'integration', label: 'Integration' },
]
