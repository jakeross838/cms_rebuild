'use client'

/**
 * Module 47: Training & Certification Platform React Query Hooks
 *
 * Covers training courses, training paths, path items, user progress, and user certifications.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  TrainingCourse,
  TrainingPath,
  TrainingPathItem,
  UserTrainingProgress,
  UserCertification,
} from '@/types/training'

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── Training Courses ─────────────────────────────────────────────────────────

type CourseListParams = {
  page?: number
  limit?: number
  course_type?: string
  category?: string
  difficulty?: string
  is_published?: boolean
  q?: string
}

type CourseCreateInput = {
  title: string
  course_type: string
  difficulty: string
  description?: string | null
  content_url?: string | null
  thumbnail_url?: string | null
  duration_minutes?: number | null
  category?: string | null
  module_tag?: string | null
  role_tags?: string[]
  language?: string
  is_published?: boolean
  sort_order?: number
}

const courseHooks = createApiHooks<CourseListParams, CourseCreateInput>(
  'training-courses',
  '/api/v2/training/courses'
)

export const useTrainingCourses = courseHooks.useList
export const useTrainingCourse = courseHooks.useDetail
export const useCreateTrainingCourse = courseHooks.useCreate
export const useUpdateTrainingCourse = courseHooks.useUpdate
export const useDeleteTrainingCourse = courseHooks.useDelete

// ── Training Paths ───────────────────────────────────────────────────────────

type PathListParams = {
  page?: number
  limit?: number
  role_key?: string
  is_active?: boolean
  q?: string
}

type PathCreateInput = {
  name: string
  description?: string | null
  role_key?: string | null
  estimated_hours?: number
  is_active?: boolean
  sort_order?: number
}

const pathHooks = createApiHooks<PathListParams, PathCreateInput>(
  'training-paths',
  '/api/v2/training/paths'
)

export const useTrainingPaths = pathHooks.useList
export const useTrainingPath = pathHooks.useDetail
export const useCreateTrainingPath = pathHooks.useCreate
export const useUpdateTrainingPath = pathHooks.useUpdate
export const useDeleteTrainingPath = pathHooks.useDelete

// ── Training Path Items ──────────────────────────────────────────────────────

export function useTrainingPathItems(pathId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery<{ data: TrainingPathItem[]; total: number }>({
    queryKey: ['training-path-items', pathId, params],
    queryFn: () =>
      fetchJson(`/api/v2/training/paths/${pathId}/items${buildQs(params)}`),
    enabled: !!pathId,
  })
}

export function useCreateTrainingPathItem(pathId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/training/paths/${pathId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['training-path-items', pathId] })
      qc.invalidateQueries({ queryKey: ['training-paths'] })
    },
  })
}

export function useUpdateTrainingPathItem(pathId: string, itemId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/training/paths/${pathId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['training-path-items', pathId] })
      qc.invalidateQueries({ queryKey: ['training-paths'] })
    },
  })
}

export function useDeleteTrainingPathItem(pathId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) =>
      fetchJson(`/api/v2/training/paths/${pathId}/items/${itemId}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['training-path-items', pathId] })
      qc.invalidateQueries({ queryKey: ['training-paths'] })
    },
  })
}

// ── User Training Progress ───────────────────────────────────────────────────

type ProgressListParams = {
  page?: number
  limit?: number
  status?: string
  item_type?: string
  user_id?: string
}

type ProgressCreateInput = {
  item_type: string
  item_id: string
  status?: string
  progress_pct?: number
}

const progressHooks = createApiHooks<ProgressListParams, ProgressCreateInput>(
  'training-progress',
  '/api/v2/training/progress'
)

export const useTrainingProgress = progressHooks.useList
export const useTrainingProgressItem = progressHooks.useDetail
export const useCreateTrainingProgress = progressHooks.useCreate
export const useUpdateTrainingProgress = progressHooks.useUpdate

// ── User Certifications ──────────────────────────────────────────────────────

type CertListParams = {
  page?: number
  limit?: number
  user_id?: string
  certification_level?: number
  passed?: boolean
  q?: string
}

type CertCreateInput = {
  certification_name: string
  certification_level: number
  user_id?: string
  description?: string | null
  passing_score?: number
  assessment_score?: number | null
  passed?: boolean
  time_limit_minutes?: number | null
  notes?: string | null
}

const certHooks = createApiHooks<CertListParams, CertCreateInput>(
  'training-certifications',
  '/api/v2/training/certifications'
)

export const useTrainingCertifications = certHooks.useList
export const useTrainingCertification = certHooks.useDetail
export const useCreateTrainingCertification = certHooks.useCreate
export const useUpdateTrainingCertification = certHooks.useUpdate
export const useDeleteTrainingCertification = certHooks.useDelete

// ── Re-export types ──────────────────────────────────────────────────────────

export type { TrainingCourse, TrainingPath, TrainingPathItem, UserTrainingProgress, UserCertification }
