/**
 * Dashboard Widgets API — List & Create
 *
 * GET  /api/v2/advanced-reports/dashboards/:id/widgets — List widgets for a dashboard
 * POST /api/v2/advanced-reports/dashboards/:id/widgets — Add widget to a dashboard
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listDashboardWidgetsSchema, createDashboardWidgetSchema } from '@/lib/validation/schemas/advanced-reporting'

// ============================================================================
// GET /api/v2/advanced-reports/dashboards/:id/widgets
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const dashboardId = segments[segments.indexOf('dashboards') + 1]

    const url = req.nextUrl
    const parseResult = listDashboardWidgetsSchema.safeParse({
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

    // Verify dashboard exists
    const { data: dashboard, error: dashError } = await supabase
      .from('report_dashboards')
      .select('id')
      .eq('id', dashboardId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (dashError || !dashboard) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Dashboard not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, count, error } = await supabase
      .from('dashboard_widgets')
      .select('*', { count: 'exact' })
      .eq('dashboard_id', dashboardId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .order('position_y', { ascending: true })
      .order('position_x', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'] }
)

// ============================================================================
// POST /api/v2/advanced-reports/dashboards/:id/widgets
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const dashboardId = segments[segments.indexOf('dashboards') + 1]

    const body = await req.json()
    const parseResult = createDashboardWidgetSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid widget data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify dashboard exists and belongs to company
    const { data: dashboard, error: dashError } = await supabase
      .from('report_dashboards')
      .select('id')
      .eq('id', dashboardId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (dashError || !dashboard) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Dashboard not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('dashboard_widgets')
      .insert({
        dashboard_id: dashboardId,
        company_id: ctx.companyId!,
        title: input.title ?? null,
        widget_type: input.widget_type,
        data_source: input.data_source,
        report_id: input.report_id ?? null,
        position_x: input.position_x,
        position_y: input.position_y,
        width: input.width,
        height: input.height,
        configuration: input.configuration,
        refresh_interval_seconds: input.refresh_interval_seconds,
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'] }
)
