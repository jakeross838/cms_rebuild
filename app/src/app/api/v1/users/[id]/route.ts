/**
 * User Management API — Get & Update Single User
 *
 * GET   /api/v1/users/[id] — Get a single user by ID
 * PATCH /api/v1/users/[id] — Update a user's profile
 */

import { NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validation/schemas/common'
import { updateUserSchema, type UpdateUserInput } from '@/lib/validation/schemas/users'
import type { User } from '@/types/database'

/**
 * Extract the user ID from the request URL.
 * For /api/v1/users/[id], the ID is the segment after "users".
 */
function extractUserId(req: Request): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const usersIndex = segments.indexOf('users')
  if (usersIndex === -1 || usersIndex + 1 >= segments.length) return null
  return segments[usersIndex + 1]
}

// ============================================================================
// GET /api/v1/users/[id] — Get single user
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractUserId(req)
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid user ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .single() as { data: User | null; error: { message: string } | null }

    if (error || !user) {
      logger.warn('User not found', { targetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'User not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: user, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    permission: 'users:read:all',
  }
)

// ============================================================================
// PATCH /api/v1/users/[id] — Update user
// ============================================================================

export const PATCH = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractUserId(req)
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid user ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = ctx.validatedBody as UpdateUserInput
    const isUpdatingSelf = targetId === ctx.user!.id
    const callerRole = ctx.user!.role

    // Self-update: strip role changes (only admins+ can change roles)
    if (isUpdatingSelf && body.role !== undefined) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'You cannot change your own role',
          requestId: ctx.requestId,
        },
        { status: 403 }
      )
    }

    // Non-admin users can only update themselves
    if (!isUpdatingSelf && !['owner', 'admin'].includes(callerRole)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only admins can update other users',
          requestId: ctx.requestId,
        },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    // Verify the target user exists in the same company
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .single() as { data: User | null; error: { message: string } | null }

    if (fetchError || !existingUser) {
      return NextResponse.json(
        { error: 'Not Found', message: 'User not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Build update payload — only include fields that were provided
    const updateData: Record<string, unknown> = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.avatar_url !== undefined) updateData.avatar_url = body.avatar_url

    // Role changes require admin+ and can't target self
    if (body.role !== undefined && ['owner', 'admin'].includes(callerRole)) {
      updateData.role = body.role
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'No fields to update', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    updateData.updated_at = new Date().toISOString()

    const { data: updatedUser, error: updateError } = await (supabase
      .from('users')
      .update(updateData as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .select()
      .single() as unknown as Promise<{ data: User | null; error: { message: string } | null }>)

    if (updateError || !updatedUser) {
      logger.error('Failed to update user', { error: updateError?.message ?? 'Unknown', targetId })
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to update user', requestId: ctx.requestId },
        { status: 500 }
      )
    }

    logger.info('User updated', {
      targetId,
      updatedFields: Object.keys(updateData).filter((k) => k !== 'updated_at'),
      companyId: ctx.companyId!,
    })

    return NextResponse.json({ data: updatedUser, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    schema: updateUserSchema,
    auditAction: 'user.update',
  }
)
