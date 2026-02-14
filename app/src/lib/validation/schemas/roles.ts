import { z } from 'zod'

import { nameSchema, descriptionSchema } from './common'

const baseRoleEnum = z.enum(['owner', 'admin', 'pm', 'superintendent', 'office', 'field', 'read_only'])
const permissionPattern = /^[a-z_]+:[a-z]+:(all|own|assigned|none)$/

export const createRoleSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  base_role: baseRoleEnum,
  permissions: z.array(z.string().regex(permissionPattern, 'Invalid permission format')).default([]),
  field_overrides: z.record(z.string(), z.unknown()).default({}),
})

export const updateRoleSchema = z.object({
  name: nameSchema.optional(),
  description: descriptionSchema,
  permissions: z.array(z.string().regex(permissionPattern, 'Invalid permission format')).optional(),
  field_overrides: z.record(z.string(), z.unknown()).optional(),
})

export type CreateRoleInput = z.infer<typeof createRoleSchema>
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
