/**
 * Custom Reports API — List & Create
 *
 * GET  /api/v2/advanced-reports — List custom reports (filtered by company)
 * POST /api/v2/advanced-reports — Create a new custom report
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listCustomReportsSchema, createCustomReportSchema } from '@/lib/validation/schemas/advanced-reporting'

// ============================================================================
// GET /api/v2/advanced-reports
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listCustomReportsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      report_type: url.searchParams.get('report_type') ?? undefined,
      audience: url.searchParams.get('audience') ?? undefined,
      visualization_type: url.searchParams.get('visualization_type') ?? undefined,
      q: url.searchParams.get('q') ?? undefined,
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
      .from('custom_reports')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.report_type) {
      query = query.eq('report_type', filters.report_type)
    }
    if (filters.audience) {
      query = query.eq('audience', filters.audience)
    }
    if (filters.visualization_type) {
      query = query.eq('visualization_type', filters.visualization_type)
    }
    if (filters.q) {
      query = query.or(`name.ilike.%${filters.q}%,description.ilike.%${filters.q}%`)
    }

    query = query.order('created_at', { ascending: false })

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
// POST /api/v2/advanced-reports — Create custom report
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createCustomReportSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid report data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('custom_reports')
      .insert({
        company_id: ctx.companyId!,
        name: input.name,
        description: input.description ?? null,
        report_type: input.report_type,
        data_sources: input.data_sources,
        fields: input.fields,
        filters: input.filters,
        grouping: input.grouping,
        sorting: input.sorting,
        calculated_fields: input.calculated_fields,
        visualization_type: input.visualization_type,
        audience: input.audience,
        status: input.status,
        refresh_frequency: input.refresh_frequency,
        is_template: input.is_template,
        shared_with: input.shared_with,
        created_by: ctx.user!.id,
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
