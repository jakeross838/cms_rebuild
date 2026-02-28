/**
 * GL Accounts API — Get & Update Single Account
 *
 * GET   /api/v1/gl-accounts/[id] — Get a single GL account by ID
 * PATCH /api/v1/gl-accounts/[id] — Update a GL account
 *
 * Note: GL accounts are deactivated (is_active: false), not soft-deleted.
 */

import { NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validation/schemas/common'
import { updateGlAccountSchema } from '@/lib/validation/schemas/accounting'
import type { GlAccount } from '@/types/accounting'

function extractEntityId(req: Request, segment: string): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const idx = segments.indexOf(segment)
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v1/gl-accounts/[id]
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'gl-accounts')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid GL account ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: account, error } = await supabase
      .from('gl_accounts')
      .select('*')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .single() as { data: GlAccount | null; error: { message: string } | null }

    if (error || !account) {
      logger.warn('GL account not found', { targetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'GL account not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: account, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ============================================================================
// PATCH /api/v1/gl-accounts/[id]
// ============================================================================

export const PATCH = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'gl-accounts')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid GL account ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = ctx.validatedBody as Record<string, unknown>
    const supabase = await createClient()

    // Verify exists and belongs to company
    const { data: existing, error: fetchError } = await supabase
      .from('gl_accounts')
      .select('id')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .single() as { data: { id: string } | null; error: { message: string } | null }

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'GL account not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data: updated, error: updateError } = await (supabase
      .from('gl_accounts')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .select()
      .single() as unknown as Promise<{ data: GlAccount | null; error: { message: string } | null }>)

    if (updateError || !updated) {
      logger.error('Failed to update GL account', { error: updateError?.message, targetId })
      const mapped = mapDbError(updateError ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('GL account updated', { targetId, companyId: ctx.companyId! })

    return NextResponse.json({ data: updated, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'office'],
    schema: updateGlAccountSchema,
    permission: 'jobs:update:all',
    auditAction: 'gl_account.update',
  }
)
