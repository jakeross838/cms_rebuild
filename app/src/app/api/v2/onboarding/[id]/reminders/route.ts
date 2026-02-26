/**
 * Onboarding Reminders API — List & Create
 *
 * GET  /api/v2/onboarding/:id/reminders — List reminders for session
 * POST /api/v2/onboarding/:id/reminders — Create reminder
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import {
  listRemindersSchema,
  createReminderSchema,
} from '@/lib/validation/schemas/onboarding'

// ============================================================================
// GET /api/v2/onboarding/:id/reminders
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const urlParts = req.nextUrl.pathname.split('/')
    const sessionId = urlParts[urlParts.length - 2]

    const url = req.nextUrl
    const parseResult = listRemindersSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      session_id: sessionId,
      status: url.searchParams.get('status') ?? undefined,
      reminder_type: url.searchParams.get('reminder_type') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    let query = supabase
      .from('onboarding_reminders')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .eq('session_id', sessionId)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.reminder_type) {
      query = query.eq('reminder_type', filters.reminder_type)
    }

    query = query.order('scheduled_at', { ascending: true })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)

// ============================================================================
// POST /api/v2/onboarding/:id/reminders
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const urlParts = req.nextUrl.pathname.split('/')
    const sessionId = urlParts[urlParts.length - 2]

    const body = await req.json()
    const parseResult = createReminderSchema.safeParse({
      ...body,
      session_id: sessionId,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid reminder data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify session exists and belongs to company
    const { data: session, error: sessionError } = await supabase
      .from('onboarding_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Onboarding session not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('onboarding_reminders')
      .insert({
        company_id: ctx.companyId!,
        session_id: sessionId,
        reminder_type: input.reminder_type,
        subject: input.subject ?? null,
        message: input.message ?? null,
        scheduled_at: input.scheduled_at,
        status: input.status,
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)
