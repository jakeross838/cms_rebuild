/**
 * Schedule Weather Events API — List & Create
 *
 * GET  /api/v2/schedule-intelligence/weather-events — List weather events
 * POST /api/v2/schedule-intelligence/weather-events — Create a new weather event
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
import { listWeatherEventsSchema, createWeatherEventSchema } from '@/lib/validation/schemas/schedule-intelligence'

// ============================================================================
// GET /api/v2/schedule-intelligence/weather-events
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listWeatherEventsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      weather_type: url.searchParams.get('weather_type') ?? undefined,
      severity: url.searchParams.get('severity') ?? undefined,
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

    let query = supabase
      .from('schedule_weather_events')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.weather_type) {
      query = query.eq('weather_type', filters.weather_type)
    }
    if (filters.severity) {
      query = query.eq('severity', filters.severity)
    }
    if (filters.date_from) {
      query = query.gte('event_date', filters.date_from)
    }
    if (filters.date_to) {
      query = query.lte('event_date', filters.date_to)
    }

    query = query.order('event_date', { ascending: false })

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
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/schedule-intelligence/weather-events
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createWeatherEventSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid weather event data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('schedule_weather_events')
      .insert({
        company_id: ctx.companyId!,
        job_id: input.job_id,
        event_date: input.event_date,
        weather_type: input.weather_type,
        severity: input.severity,
        impact_description: input.impact_description ?? null,
        affected_tasks: input.affected_tasks,
        schedule_impact_days: input.schedule_impact_days,
        temperature_high: input.temperature_high ?? null,
        temperature_low: input.temperature_low ?? null,
        precipitation_inches: input.precipitation_inches ?? null,
        wind_speed_mph: input.wind_speed_mph ?? null,
        auto_logged: input.auto_logged,
        notes: input.notes ?? null,
        created_by: ctx.user!.id,
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
