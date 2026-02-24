/**
 * PUT /api/v2/notifications/read-all
 * Mark all notifications as read for the current user.
 */

import { NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

export const PUT = createApiHandler(
  async (_req, ctx: ApiContext) => {
    const supabase = await createClient()

    const { error } = await (supabase as any)
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('company_id', ctx.companyId!)
      .eq('user_id', ctx.user!.id)
      .eq('read', false)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
