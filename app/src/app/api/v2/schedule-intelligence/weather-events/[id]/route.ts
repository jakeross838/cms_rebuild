/**
 * Schedule Weather Event by ID — Get, Update, Delete
 *
 * GET    /api/v2/schedule-intelligence/weather-events/:id — Get weather event
 * PUT    /api/v2/schedule-intelligence/weather-events/:id — Update weather event
 * DELETE /api/v2/schedule-intelligence/weather-events/:id — Soft delete weather event
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateWeatherEventSchema } from '@/lib/validation/schemas/schedule-intelligence'

// ============================================================================
// GET /api/v2/schedule-intelligence/weather-events/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing weather event ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase
      .from('schedule_weather_events') as any)
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Weather event not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/schedule-intelligence/weather-events/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing weather event ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateWeatherEventSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.event_date !== undefined) updates.event_date = input.event_date
    if (input.weather_type !== undefined) updates.weather_type = input.weather_type
    if (input.severity !== undefined) updates.severity = input.severity
    if (input.impact_description !== undefined) updates.impact_description = input.impact_description
    if (input.affected_tasks !== undefined) updates.affected_tasks = input.affected_tasks
    if (input.schedule_impact_days !== undefined) updates.schedule_impact_days = input.schedule_impact_days
    if (input.temperature_high !== undefined) updates.temperature_high = input.temperature_high
    if (input.temperature_low !== undefined) updates.temperature_low = input.temperature_low
    if (input.precipitation_inches !== undefined) updates.precipitation_inches = input.precipitation_inches
    if (input.wind_speed_mph !== undefined) updates.wind_speed_mph = input.wind_speed_mph
    if (input.auto_logged !== undefined) updates.auto_logged = input.auto_logged
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await (supabase
      .from('schedule_weather_events') as any)
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Weather event not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/schedule-intelligence/weather-events/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing weather event ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: existing, error: existError } = await (supabase
      .from('schedule_weather_events') as any)
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Weather event not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await (supabase
      .from('schedule_weather_events') as any)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

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
