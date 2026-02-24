/**
 * Custom Report Widget by ID — Update, Delete
 *
 * PUT    /api/v2/advanced-reports/:id/widgets/:widgetId — Update widget
 * DELETE /api/v2/advanced-reports/:id/widgets/:widgetId — Delete widget
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateReportWidgetSchema } from '@/lib/validation/schemas/advanced-reporting'

// ============================================================================
// PUT /api/v2/advanced-reports/:id/widgets/:widgetId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const widgetId = segments.pop()
    // segments: [..., 'advanced-reports', ':id', 'widgets', ':widgetId']
    const reportId = segments[segments.indexOf('advanced-reports') + 1]

    if (!widgetId || !reportId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing report or widget ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateReportWidgetSchema.safeParse(body)

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
    if (input.configuration !== undefined) updates.configuration = input.configuration
    if (input.filters !== undefined) updates.filters = input.filters
    if (input.sort_order !== undefined) updates.sort_order = input.sort_order

    const { data, error } = await (supabase
      .from('custom_report_widgets') as any)
      .update(updates)
      .eq('id', widgetId)
      .eq('report_id', reportId)
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
// DELETE /api/v2/advanced-reports/:id/widgets/:widgetId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const widgetId = segments.pop()
    const reportId = segments[segments.indexOf('advanced-reports') + 1]

    if (!widgetId || !reportId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing report or widget ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await (supabase
      .from('custom_report_widgets') as any)
      .delete()
      .eq('id', widgetId)
      .eq('report_id', reportId)
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
