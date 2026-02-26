/**
 * Feature Usage Events API — List & Record
 *
 * GET  /api/v2/analytics/events — List feature usage events
 * POST /api/v2/analytics/events — Record a new feature usage event
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listFeatureEventsSchema, createFeatureEventSchema } from '@/lib/validation/schemas/platform-analytics'

// ============================================================================
// GET /api/v2/analytics/events
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listFeatureEventsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      feature_key: url.searchParams.get('feature_key') ?? undefined,
      event_type: url.searchParams.get('event_type') ?? undefined,
      user_id: url.searchParams.get('user_id') ?? undefined,
      session_id: url.searchParams.get('session_id') ?? undefined,
      date_from: url.searchParams.get('date_from') ?? undefined,
      date_to: url.searchParams.get('date_to') ?? undefined,
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

    let query = (supabase as any)
      .from('feature_usage_events')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.feature_key) {
      query = query.eq('feature_key', filters.feature_key)
    }
    if (filters.event_type) {
      query = query.eq('event_type', filters.event_type)
    }
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id)
    }
    if (filters.session_id) {
      query = query.eq('session_id', filters.session_id)
    }
    if (filters.date_from) {
      query = query.gte('created_at', `${filters.date_from}T00:00:00Z`)
    }
    if (filters.date_to) {
      query = query.lte('created_at', `${filters.date_to}T23:59:59Z`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/analytics/events — Record event
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createFeatureEventSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid event data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('feature_usage_events')
      .insert({
        company_id: ctx.companyId!,
        user_id: input.user_id ?? ctx.user!.id,
        feature_key: input.feature_key,
        event_type: input.event_type,
        metadata: input.metadata,
        session_id: input.session_id ?? null,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
