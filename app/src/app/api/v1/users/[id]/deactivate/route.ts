/**
 * User Deactivation API
 *
 * POST /api/v1/users/[id]/deactivate — Deactivate a user (soft delete)
 */

import { NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validation/schemas/common'
import type { User } from '@/types/database'

/**
 * Extract the user ID from the request URL.
 * For /api/v1/users/[id]/deactivate, the ID is the segment after "users".
 */
function extractUserId(req: Request): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const usersIndex = segments.indexOf('users')
  if (usersIndex === -1 || usersIndex + 1 >= segments.length) return null
  return segments[usersIndex + 1]
}

// ============================================================================
// POST /api/v1/users/[id]/deactivate
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractUserId(req)
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid user ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    // Cannot deactivate yourself
    if (targetId === ctx.user!.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You cannot deactivate yourself', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    // Verify the target user exists in the same company
    const { data: targetUser, error: fetchError } = await supabase
      .from('users')
      .select('id, role, is_active, deleted_at')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .single() as { data: Pick<User, 'id' | 'role' | 'is_active' | 'deleted_at'> | null; error: { message: string } | null }

    if (fetchError || !targetUser) {
      return NextResponse.json(
        { error: 'Not Found', message: 'User not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Already deactivated
    if (!targetUser.is_active || targetUser.deleted_at) {
      return NextResponse.json(
        { error: 'Conflict', message: 'User is already deactivated', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    // Cannot deactivate the last owner
    if (targetUser.role === 'owner') {
      const { count } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', ctx.companyId!)
        .eq('role', 'owner')
        .eq('is_active', true)
        .is('deleted_at', null) as unknown as { count: number | null }

      if ((count ?? 0) <= 1) {
        return NextResponse.json(
          {
            error: 'Forbidden',
            message: 'Cannot deactivate the last owner. Transfer ownership first.',
            requestId: ctx.requestId,
          },
          { status: 403 }
        )
      }
    }

    // Deactivate: set is_active = false and deleted_at = NOW()
    const now = new Date().toISOString()
    const { data: deactivatedUser, error: updateError } = await (supabase
      .from('users')
      .update({
        is_active: false,
        deleted_at: now,
        updated_at: now,
      } as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .select()
      .single() as unknown as Promise<{ data: User | null; error: { message: string } | null }>)

    if (updateError || !deactivatedUser) {
      logger.error('Failed to deactivate user', { error: updateError?.message ?? 'Unknown', targetId })
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to deactivate user', requestId: ctx.requestId },
        { status: 500 }
      )
    }

    // Log to auth_audit_log via admin client (untyped, bypasses RLS)
    const adminClient = createAdminClient()
    await adminClient
      .from('auth_audit_log')
      .insert({
        company_id: ctx.companyId!,
        user_id: ctx.user!.id,
        event_type: 'user_deactivated',
        ip_address: req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent'),
        metadata: {
          deactivated_user_id: targetId,
          deactivated_user_role: targetUser.role,
        },
      } as never)
      .then(({ error }: { error: { message: string } | null }) => {
        if (error) logger.warn('Failed to write auth audit log', { error: error.message })
      })

    logger.info('User deactivated', {
      targetId,
      targetRole: targetUser.role,
      companyId: ctx.companyId!,
    })

    return NextResponse.json({ data: deactivatedUser })
  },
  {
    requireAuth: true,
    requiredRoles: ['owner', 'admin'],
    permission: 'users:update:all',
    auditAction: 'user.deactivate',
  }
)
