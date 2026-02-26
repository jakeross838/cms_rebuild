/**
 * Report Schedules — List & Create
 *
 * GET  /api/v2/reports/schedules — List report schedules
 * POST /api/v2/reports/schedules — Create a report schedule
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import {
  listReportSchedulesSchema,
  createReportScheduleSchema,
} from '@/lib/validation/schemas/financial-reporting'

// ============================================================================
// GET /api/v2/reports/schedules
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listReportSchedulesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      report_definition_id: url.searchParams.get('report_definition_id') ?? undefined,
      is_active: url.searchParams.get('is_active') ?? undefined,
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
      .from('report_schedules')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.report_definition_id) {
      query = query.eq('report_definition_id', filters.report_definition_id)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
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
// POST /api/v2/reports/schedules
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createReportScheduleSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid schedule data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify the report definition exists
    const { data: definition, error: defError } = await (supabase as any)
      .from('report_definitions')
      .select('id')
      .eq('id', input.report_definition_id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (defError || !definition) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Report definition not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await (supabase as any)
      .from('report_schedules')
      .insert({
        company_id: ctx.companyId!,
        report_definition_id: input.report_definition_id,
        frequency: input.frequency,
        day_of_week: input.day_of_week ?? null,
        day_of_month: input.day_of_month ?? null,
        recipients: input.recipients,
        is_active: input.is_active ?? true,
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
