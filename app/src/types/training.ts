/**
 * Module 47: Training & Certification Platform Types
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type CourseType =
  | 'video'
  | 'article'
  | 'walkthrough'
  | 'assessment'

export type Difficulty =
  | 'beginner'
  | 'intermediate'
  | 'advanced'

export type TrainingStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'

export type PathItemType =
  | 'course'
  | 'assessment'
  | 'checkpoint'

export type CertificationLevel = 1 | 2 | 3

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface TrainingCourse {
  id: string
  company_id: string | null
  title: string
  description: string | null
  content_url: string | null
  thumbnail_url: string | null
  duration_minutes: number | null
  course_type: CourseType
  category: string | null
  module_tag: string | null
  role_tags: string[]
  difficulty: Difficulty
  language: string
  transcript: string | null
  sort_order: number
  is_published: boolean
  view_count: number
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface TrainingPath {
  id: string
  company_id: string | null
  name: string
  description: string | null
  role_key: string | null
  estimated_hours: number
  sort_order: number
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface TrainingPathItem {
  id: string
  company_id: string | null
  path_id: string
  item_type: PathItemType
  item_id: string
  sort_order: number
  is_required: boolean
  created_at: string
  updated_at: string
}

export interface UserTrainingProgress {
  id: string
  company_id: string
  user_id: string
  item_type: PathItemType
  item_id: string
  status: TrainingStatus
  progress_pct: number
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface UserCertification {
  id: string
  company_id: string
  user_id: string
  certification_name: string
  certification_level: CertificationLevel
  description: string | null
  passing_score: number
  assessment_score: number | null
  passed: boolean
  attempt_count: number
  certified_at: string | null
  expires_at: string | null
  time_limit_minutes: number | null
  issued_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const COURSE_TYPES: { value: CourseType; label: string }[] = [
  { value: 'video', label: 'Video' },
  { value: 'article', label: 'Article' },
  { value: 'walkthrough', label: 'Walkthrough' },
  { value: 'assessment', label: 'Assessment' },
]

export const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export const TRAINING_STATUSES: { value: TrainingStatus; label: string }[] = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

export const PATH_ITEM_TYPES: { value: PathItemType; label: string }[] = [
  { value: 'course', label: 'Course' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'checkpoint', label: 'Checkpoint' },
]

export const CERTIFICATION_LEVELS: { value: CertificationLevel; label: string }[] = [
  { value: 1, label: 'Level 1 — Foundation' },
  { value: 2, label: 'Level 2 — Practitioner' },
  { value: 3, label: 'Level 3 — Expert' },
]
