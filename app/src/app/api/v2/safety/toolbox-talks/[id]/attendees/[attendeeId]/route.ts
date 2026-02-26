/**
 * Toolbox Talk Attendee by ID — Update & Delete
 *
 * PUT    /api/v2/safety/toolbox-talks/:id/attendees/:attendeeId — Update attendee
 * DELETE /api/v2/safety/toolbox-talks/:id/attendees/:attendeeId — Remove attendee
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateAttendeeSchema } from '@/lib/validation/schemas/safety'

/**
 * Extract talk ID and attendee ID from path like
 * /api/v2/safety/toolbox-talks/:id/attendees/:attendeeId
 */
function extractIds(pathname: string): { talkId: string | null; attendeeId: string | null } {
  const segments = pathname.split('/')
  const talkIdx = segments.indexOf('toolbox-talks')
  const attIdx = segments.indexOf('attendees')
  return {
    talkId: talkIdx !== -1 && talkIdx + 1 < segments.length ? segments[talkIdx + 1] : null,
    attendeeId: attIdx !== -1 && attIdx + 1 < segments.length ? segments[attIdx + 1] : null,
  }
}

// ============================================================================
// PUT /api/v2/safety/toolbox-talks/:id/attendees/:attendeeId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { talkId, attendeeId } = extractIds(req.nextUrl.pathname)
    if (!talkId || !attendeeId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing talk ID or attendee ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateAttendeeSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify talk belongs to company
    const { data: talk, error: talkError } = await supabase
      .from('toolbox_talks')
      .select('id')
      .eq('id', talkId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (talkError || !talk) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Toolbox talk not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = {}
    if (input.attendee_name !== undefined) updates.attendee_name = input.attendee_name
    if (input.attendee_id !== undefined) updates.attendee_id = input.attendee_id
    if (input.trade !== undefined) updates.trade = input.trade
    if (input.company_name !== undefined) updates.company_name = input.company_name
    if (input.signed !== undefined) {
      updates.signed = input.signed
      if (input.signed) {
        updates.signed_at = new Date().toISOString()
      }
    }
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await supabase
      .from('toolbox_talk_attendees')
      .update(updates)
      .eq('id', attendeeId)
      .eq('talk_id', talkId)
      .select('*')
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'], auditAction: 'safety_toolbox_talks_attendee.update' }
)

// ============================================================================
// DELETE /api/v2/safety/toolbox-talks/:id/attendees/:attendeeId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { talkId, attendeeId } = extractIds(req.nextUrl.pathname)
    if (!talkId || !attendeeId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing talk ID or attendee ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify talk belongs to company
    const { data: talk, error: talkError } = await supabase
      .from('toolbox_talks')
      .select('id')
      .eq('id', talkId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (talkError || !talk) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Toolbox talk not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('toolbox_talk_attendees')
      .delete()
      .eq('id', attendeeId)
      .eq('talk_id', talkId)
      .eq('company_id', ctx.companyId!)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'], auditAction: 'safety_toolbox_talks_attendee.archive' }
)
