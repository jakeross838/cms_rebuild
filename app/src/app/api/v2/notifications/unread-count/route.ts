/**
 * GET /api/v2/notifications/unread-count
 * Returns the unread notification count for the bell badge.
 */

import { NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
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
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { count: count ?? 0 }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
