/**
 * Daily Logs API — List & Create
 *
 * GET  /api/v2/daily-logs — List daily logs (paginated, filterable)
 * POST /api/v2/daily-logs — Create a new daily log
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
import { listDailyLogsSchema, createDailyLogSchema } from '@/lib/validation/schemas/daily-logs'

// ============================================================================
// GET /api/v2/daily-logs
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listDailyLogsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
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
      .from('daily_logs')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.date_from) {
      query = query.gte('log_date', filters.date_from)
    }
    if (filters.date_to) {
      query = query.lte('log_date', filters.date_to)
    }

    query = query.order('log_date', { ascending: false })

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
// POST /api/v2/daily-logs — Create daily log
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createDailyLogSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid daily log data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('daily_logs')
      .insert({
        company_id: ctx.companyId!,
        job_id: input.job_id,
        log_date: input.log_date,
        status: 'draft',
        weather_summary: input.weather_summary ?? null,
        high_temp: input.high_temp ?? null,
        low_temp: input.low_temp ?? null,
        conditions: input.conditions ?? null,
        notes: input.notes ?? null,
        created_by: ctx.user!.id,
      })
      .select('*')
      .single()

    if (error) {
      // Check for unique constraint violation (one log per job per day)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Conflict', message: 'A daily log already exists for this job on this date', requestId: ctx.requestId },
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
