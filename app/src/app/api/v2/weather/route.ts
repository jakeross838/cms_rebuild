/**
 * Weather Records API — List & Create
 *
 * GET  /api/v2/weather — List weather records for a job
 * POST /api/v2/weather — Create a weather record
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listWeatherRecordsSchema, createWeatherRecordSchema } from '@/lib/validation/schemas/scheduling'

// ============================================================================
// GET /api/v2/weather
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listWeatherRecordsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      start_date: url.searchParams.get('start_date') ?? undefined,
      end_date: url.searchParams.get('end_date') ?? undefined,
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
      .from('weather_records')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .eq('job_id', filters.job_id)
      .is('deleted_at', null)

    if (filters.start_date) {
      query = query.gte('record_date', filters.start_date)
    }
    if (filters.end_date) {
      query = query.lte('record_date', filters.end_date)
    }

    query = query.order('record_date', { ascending: false })

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
// POST /api/v2/weather
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createWeatherRecordSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid weather data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('weather_records')
      .insert({
        company_id: ctx.companyId!,
        job_id: input.job_id,
        record_date: input.record_date,
        high_temp: input.high_temp ?? null,
        low_temp: input.low_temp ?? null,
        conditions: input.conditions ?? null,
        precipitation_inches: input.precipitation_inches ?? null,
        wind_mph: input.wind_mph ?? null,
        is_work_day: input.is_work_day,
        notes: input.notes ?? null,
      })
      .select('*')
      .single()

    if (error) {
      // Handle unique constraint violation (duplicate record_date for same job)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Conflict', message: 'A weather record already exists for this date and job', requestId: ctx.requestId },
          { status: 409 }
        )
      }
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
