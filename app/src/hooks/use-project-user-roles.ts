'use client'

/**
 * Project User Roles React Query Hooks
 *
 * Covers: project user role assignments CRUD.
 */

import { createApiHooks } from '@/hooks/use-api'

// ── Project User Roles ──────────────────────────────────────────────────────

type ProjectUserRoleListParams = {
  page?: number
  limit?: number
  job_id?: string
  user_id?: string
  q?: string
}

type ProjectUserRoleCreateInput = {
  job_id: string
  user_id: string
  role_id?: string | null
  role_override?: string | null
}

const projectUserRoleHooks = createApiHooks<ProjectUserRoleListParams, ProjectUserRoleCreateInput>(
  'project-user-roles',
  '/api/v2/project-user-roles'
)

export const useProjectUserRoles = projectUserRoleHooks.useList
export const useProjectUserRole = projectUserRoleHooks.useDetail
export const useCreateProjectUserRole = projectUserRoleHooks.useCreate
export const useUpdateProjectUserRole = projectUserRoleHooks.useUpdate
export const useDeleteProjectUserRole = projectUserRoleHooks.useDelete
