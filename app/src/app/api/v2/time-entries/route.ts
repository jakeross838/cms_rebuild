/**
 * Time Entries API — List & Create
 *
 * GET  /api/v2/time-entries — List/filter time entries
 * POST /api/v2/time-entries — Create a manual time entry
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listTimeEntriesSchema, createTimeEntrySchema } from '@/lib/validation/schemas/time-tracking'

// ============================================================================
// GET /api/v2/time-entries
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listTimeEntriesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      user_id: url.searchParams.get('user_id') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      cost_code_id: url.searchParams.get('cost_code_id') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      entry_date_from: url.searchParams.get('entry_date_from') ?? undefined,
      entry_date_to: url.searchParams.get('entry_date_to') ?? undefined,
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

    let query = (supabase
      .from('time_entries') as any)
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id)
    }
    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.cost_code_id) {
      query = query.eq('cost_code_id', filters.cost_code_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.entry_date_from) {
      query = query.gte('entry_date', filters.entry_date_from)
    }
    if (filters.entry_date_to) {
      query = query.lte('entry_date', filters.entry_date_to)
    }

    query = query.order('entry_date', { ascending: false }).order('clock_in', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/time-entries — Create manual time entry
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createTimeEntrySchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid time entry data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase
      .from('time_entries') as any)
      .insert({
        company_id: ctx.companyId!,
        user_id: input.user_id,
        job_id: input.job_id,
        cost_code_id: input.cost_code_id ?? null,
        entry_date: input.entry_date,
        clock_in: input.clock_in ?? null,
        clock_out: input.clock_out ?? null,
        regular_hours: input.regular_hours,
        overtime_hours: input.overtime_hours,
        double_time_hours: input.double_time_hours,
        break_minutes: input.break_minutes,
        notes: input.notes ?? null,
        gps_clock_in: input.gps_clock_in ?? null,
        entry_method: input.entry_method,
        status: 'pending',
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
