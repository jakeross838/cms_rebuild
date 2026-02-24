/**
 * Notification by ID
 *
 * PUT    /api/v2/notifications/:id — Mark as read/unread
 * DELETE /api/v2/notifications/:id — Archive (soft delete) a notification
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

// ============================================================================
// PUT /api/v2/notifications/:id — Mark read/unread
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing notification ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const read = body.read !== false // default to marking as read

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('notifications')
      .update({
        read,
        read_at: read ? new Date().toISOString() : null,
      })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .eq('user_id', ctx.user!.id)
      .select('id, read, read_at')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Notification not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/notifications/:id — Archive notification
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing notification ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await (supabase as any)
      .from('notifications')
      .update({ archived: true })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .eq('user_id', ctx.user!.id)

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Notification not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
