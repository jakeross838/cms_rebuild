/**
 * Dashboard Widget by ID — Update, Delete
 *
 * PUT    /api/v2/advanced-reports/dashboards/:id/widgets/:widgetId — Update widget
 * DELETE /api/v2/advanced-reports/dashboards/:id/widgets/:widgetId — Delete widget
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateDashboardWidgetSchema } from '@/lib/validation/schemas/advanced-reporting'

// ============================================================================
// PUT /api/v2/advanced-reports/dashboards/:id/widgets/:widgetId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const widgetId = segments.pop()
    const dashboardId = segments[segments.indexOf('dashboards') + 1]

    if (!widgetId || !dashboardId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing dashboard or widget ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateDashboardWidgetSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.title !== undefined) updates.title = input.title
    if (input.widget_type !== undefined) updates.widget_type = input.widget_type
    if (input.data_source !== undefined) updates.data_source = input.data_source
    if (input.report_id !== undefined) updates.report_id = input.report_id
    if (input.position_x !== undefined) updates.position_x = input.position_x
    if (input.position_y !== undefined) updates.position_y = input.position_y
    if (input.width !== undefined) updates.width = input.width
    if (input.height !== undefined) updates.height = input.height
    if (input.configuration !== undefined) updates.configuration = input.configuration
    if (input.refresh_interval_seconds !== undefined) updates.refresh_interval_seconds = input.refresh_interval_seconds

    const { data, error } = await (supabase
      .from('dashboard_widgets') as any)
      .update(updates)
      .eq('id', widgetId)
      .eq('dashboard_id', dashboardId)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Widget not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/advanced-reports/dashboards/:id/widgets/:widgetId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const widgetId = segments.pop()
    const dashboardId = segments[segments.indexOf('dashboards') + 1]

    if (!widgetId || !dashboardId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing dashboard or widget ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await (supabase
      .from('dashboard_widgets') as any)
      .delete()
      .eq('id', widgetId)
      .eq('dashboard_id', dashboardId)
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
