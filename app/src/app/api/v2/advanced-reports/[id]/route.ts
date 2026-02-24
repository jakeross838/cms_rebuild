/**
 * Custom Report by ID — Get, Update, Delete
 *
 * GET    /api/v2/advanced-reports/:id — Get custom report details
 * PUT    /api/v2/advanced-reports/:id — Update custom report
 * DELETE /api/v2/advanced-reports/:id — Soft delete custom report
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateCustomReportSchema } from '@/lib/validation/schemas/advanced-reporting'

// ============================================================================
// GET /api/v2/advanced-reports/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing report ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase
      .from('custom_reports') as any)
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Custom report not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch widgets count
    const { data: widgets } = await (supabase
      .from('custom_report_widgets') as any)
      .select('id')
      .eq('report_id', id)

    return NextResponse.json({
      data: {
        ...data,
        widgets_count: (widgets ?? []).length,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/advanced-reports/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing report ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateCustomReportSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Build update object (only include fields that were provided)
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.name !== undefined) updates.name = input.name
    if (input.description !== undefined) updates.description = input.description
    if (input.report_type !== undefined) updates.report_type = input.report_type
    if (input.data_sources !== undefined) updates.data_sources = input.data_sources
    if (input.fields !== undefined) updates.fields = input.fields
    if (input.filters !== undefined) updates.filters = input.filters
    if (input.grouping !== undefined) updates.grouping = input.grouping
    if (input.sorting !== undefined) updates.sorting = input.sorting
    if (input.calculated_fields !== undefined) updates.calculated_fields = input.calculated_fields
    if (input.visualization_type !== undefined) updates.visualization_type = input.visualization_type
    if (input.audience !== undefined) updates.audience = input.audience
    if (input.status !== undefined) updates.status = input.status
    if (input.refresh_frequency !== undefined) updates.refresh_frequency = input.refresh_frequency
    if (input.is_template !== undefined) updates.is_template = input.is_template
    if (input.shared_with !== undefined) updates.shared_with = input.shared_with

    const { data, error } = await (supabase
      .from('custom_reports') as any)
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Custom report not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/advanced-reports/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing report ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: existing, error: existError } = await (supabase
      .from('custom_reports') as any)
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Custom report not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await (supabase
      .from('custom_reports') as any)
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
