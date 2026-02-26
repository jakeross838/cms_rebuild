/**
 * Toolbox Talk Attendees API — List & Create
 *
 * GET  /api/v2/safety/toolbox-talks/:id/attendees — List attendees
 * POST /api/v2/safety/toolbox-talks/:id/attendees — Add an attendee
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listAttendeesSchema, createAttendeeSchema } from '@/lib/validation/schemas/safety'

/**
 * Extract talk ID from path like /api/v2/safety/toolbox-talks/:id/attendees
 */
function extractTalkId(pathname: string): string | null {
  const segments = pathname.split('/')
  const idx = segments.indexOf('toolbox-talks')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v2/safety/toolbox-talks/:id/attendees
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const talkId = extractTalkId(req.nextUrl.pathname)
    if (!talkId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing toolbox talk ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listAttendeesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    // Verify the talk belongs to this company
    const { data: talk, error: talkError } = await (supabase as any)
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

    const { data, count, error } = await (supabase as any)
      .from('toolbox_talk_attendees')
      .select('*', { count: 'exact' })
      .eq('talk_id', talkId)
      .eq('company_id', ctx.companyId!)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/safety/toolbox-talks/:id/attendees — Add attendee
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const talkId = extractTalkId(req.nextUrl.pathname)
    if (!talkId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing toolbox talk ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createAttendeeSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid attendee data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify talk exists and belongs to company
    const { data: talk, error: talkError } = await (supabase as any)
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

    const { data, error } = await (supabase as any)
      .from('toolbox_talk_attendees')
      .insert({
        talk_id: talkId,
        company_id: ctx.companyId!,
        attendee_name: input.attendee_name,
        attendee_id: input.attendee_id ?? null,
        trade: input.trade ?? null,
        company_name: input.company_name ?? null,
        signed: input.signed,
        signed_at: input.signed ? new Date().toISOString() : null,
        notes: input.notes ?? null,
      })
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
