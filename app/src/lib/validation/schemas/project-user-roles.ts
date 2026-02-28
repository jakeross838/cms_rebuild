/**
 * Project User Roles Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const userRoleEnum = z.enum([
  'owner', 'admin', 'pm', 'superintendent', 'office', 'field', 'read_only',
])

// ── Project User Roles ──────────────────────────────────────────────────────

export const listProjectUserRolesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createProjectUserRoleSchema = z.object({
  job_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role_id: z.string().uuid().nullable().optional(),
  role_override: userRoleEnum.nullable().optional(),
})

export const updateProjectUserRoleSchema = z.object({
  role_id: z.string().uuid().nullable().optional(),
  role_override: userRoleEnum.nullable().optional(),
})
