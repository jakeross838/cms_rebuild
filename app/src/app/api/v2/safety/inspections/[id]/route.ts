/**
 * Safety Inspection by ID — Get, Update, Delete
 *
 * GET    /api/v2/safety/inspections/:id — Get inspection details with items
 * PUT    /api/v2/safety/inspections/:id — Update inspection
 * DELETE /api/v2/safety/inspections/:id — Soft delete inspection
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateInspectionSchema } from '@/lib/validation/schemas/safety'

// ============================================================================
// GET /api/v2/safety/inspections/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing inspection ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('safety_inspections')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Inspection not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch items
    const { data: items } = await supabase
      .from('safety_inspection_items')
      .select('*')
      .eq('inspection_id', id)
      .eq('company_id', ctx.companyId!)
      .order('sort_order', { ascending: true })

    return NextResponse.json({
      data: {
        ...data,
        items_count: (items ?? []).length,
        items: items ?? [],
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'] }
)

// ============================================================================
// PUT /api/v2/safety/inspections/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing inspection ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateInspectionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify inspection exists
    const { data: existing, error: existError } = await supabase
      .from('safety_inspections')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Inspection not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.inspection_number !== undefined) updates.inspection_number = input.inspection_number
    if (input.title !== undefined) updates.title = input.title
    if (input.description !== undefined) updates.description = input.description
    if (input.inspection_date !== undefined) updates.inspection_date = input.inspection_date
    if (input.inspection_type !== undefined) updates.inspection_type = input.inspection_type
    if (input.status !== undefined) updates.status = input.status
    if (input.result !== undefined) updates.result = input.result
    if (input.inspector_id !== undefined) updates.inspector_id = input.inspector_id
    if (input.location !== undefined) updates.location = input.location
    if (input.total_items !== undefined) updates.total_items = input.total_items
    if (input.passed_items !== undefined) updates.passed_items = input.passed_items
    if (input.failed_items !== undefined) updates.failed_items = input.failed_items
    if (input.na_items !== undefined) updates.na_items = input.na_items
    if (input.score !== undefined) updates.score = input.score
    if (input.notes !== undefined) updates.notes = input.notes
    if (input.follow_up_required !== undefined) updates.follow_up_required = input.follow_up_required
    if (input.follow_up_date !== undefined) updates.follow_up_date = input.follow_up_date
    if (input.follow_up_notes !== undefined) updates.follow_up_notes = input.follow_up_notes

    const { data, error } = await supabase
      .from('safety_inspections')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'], auditAction: 'safety_inspection.update' }
)

// ============================================================================
// DELETE /api/v2/safety/inspections/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing inspection ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: existing, error: existError } = await supabase
      .from('safety_inspections')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Inspection not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('safety_inspections')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'], auditAction: 'safety_inspection.archive' }
)
