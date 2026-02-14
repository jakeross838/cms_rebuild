/**
 * User Reactivation API
 *
 * POST /api/v1/users/[id]/reactivate — Reactivate a previously deactivated user
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
 * For /api/v1/users/[id]/reactivate, the ID is the segment after "users".
 */
function extractUserId(req: Request): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const usersIndex = segments.indexOf('users')
  if (usersIndex === -1 || usersIndex + 1 >= segments.length) return null
  return segments[usersIndex + 1]
}

// ============================================================================
// POST /api/v1/users/[id]/reactivate
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

    // Already active
    if (targetUser.is_active && !targetUser.deleted_at) {
      return NextResponse.json(
        { error: 'Conflict', message: 'User is already active', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    // Reactivate: set is_active = true and clear deleted_at
    const now = new Date().toISOString()
    const { data: reactivatedUser, error: updateError } = await (supabase
      .from('users')
      .update({
        is_active: true,
        deleted_at: null,
        updated_at: now,
      } as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .select()
      .single() as unknown as Promise<{ data: User | null; error: { message: string } | null }>)

    if (updateError || !reactivatedUser) {
      logger.error('Failed to reactivate user', { error: updateError?.message ?? 'Unknown', targetId })
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to reactivate user', requestId: ctx.requestId },
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
        event_type: 'user_reactivated',
        ip_address: req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent'),
        metadata: {
          reactivated_user_id: targetId,
          reactivated_user_role: targetUser.role,
        },
      } as never)
      .then(({ error }: { error: { message: string } | null }) => {
        if (error) logger.warn('Failed to write auth audit log', { error: error.message })
      })

    logger.info('User reactivated', {
      targetId,
      targetRole: targetUser.role,
      companyId: ctx.companyId!,
    })

    return NextResponse.json({ data: reactivatedUser })
  },
  {
    requireAuth: true,
    requiredRoles: ['owner', 'admin'],
    permission: 'users:update:all',
    auditAction: 'user.reactivate',
  }
)
