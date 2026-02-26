/**
 * GET /api/v2/notifications/unread-count
 * Returns the unread notification count for the bell badge.
 */

import { NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

export const GET = createApiHandler(
  async (_req, ctx: ApiContext) => {
    const supabase = await createClient()

    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', ctx.companyId!)
      .eq('user_id', ctx.user!.id)
      .eq('read', false)
      .eq('archived', false)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { count: count ?? 0 }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'] }
)
