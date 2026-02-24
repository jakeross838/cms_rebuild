/**
 * Custom Report Widgets API — List & Create
 *
 * GET  /api/v2/advanced-reports/:id/widgets — List widgets for a report
 * POST /api/v2/advanced-reports/:id/widgets — Add widget to a report
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listReportWidgetsSchema, createReportWidgetSchema } from '@/lib/validation/schemas/advanced-reporting'

// ============================================================================
// GET /api/v2/advanced-reports/:id/widgets
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const reportId = segments[segments.indexOf('advanced-reports') + 1]

    const url = req.nextUrl
    const parseResult = listReportWidgetsSchema.safeParse({
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

    // Verify report exists
    const { data: report, error: reportError } = await (supabase
      .from('custom_reports') as any)
      .select('id')
      .eq('id', reportId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Custom report not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, count, error } = await (supabase
      .from('custom_report_widgets') as any)
      .select('*', { count: 'exact' })
      .eq('report_id', reportId)
      .eq('company_id', ctx.companyId!)
      .order('sort_order', { ascending: true })
      .range(offset, offset + limit - 1)

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
// POST /api/v2/advanced-reports/:id/widgets
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const reportId = segments[segments.indexOf('advanced-reports') + 1]

    const body = await req.json()
    const parseResult = createReportWidgetSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid widget data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify report exists and belongs to company
    const { data: report, error: reportError } = await (supabase
      .from('custom_reports') as any)
      .select('id')
      .eq('id', reportId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Custom report not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await (supabase
      .from('custom_report_widgets') as any)
      .insert({
        report_id: reportId,
        company_id: ctx.companyId!,
        title: input.title ?? null,
        widget_type: input.widget_type,
        data_source: input.data_source,
        configuration: input.configuration,
        filters: input.filters,
        sort_order: input.sort_order,
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
