/**
 * Notification by ID
 *
 * PUT    /api/v2/notifications/:id — Mark as read/unread
 * DELETE /api/v2/notifications/:id — Archive (soft delete) a notification
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { markNotificationReadSchema } from '@/lib/validation/schemas/notifications'

// ============================================================================
// PUT /api/v2/notifications/:id — Mark read/unread
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing notification ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = markNotificationReadSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid request body', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }
    const { read } = parseResult.data

    const supabase = await createClient()

    const { data, error } = await supabase
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
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
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

    const { error } = await supabase
      .from('notifications')
      .update({ archived: true })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .eq('user_id', ctx.user!.id)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
