/**
 * RFI by ID — Get, Update, Delete
 *
 * GET    /api/v2/rfis/:id — Get RFI details
 * PUT    /api/v2/rfis/:id — Update RFI
 * DELETE /api/v2/rfis/:id — Soft delete (archive) RFI
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateRfiSchema } from '@/lib/validation/schemas/rfi-management'

// ============================================================================
// GET /api/v2/rfis/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing RFI ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('rfis')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'RFI not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch responses count
    const { data: responses } = await supabase
      .from('rfi_responses')
      .select('id')
      .eq('rfi_id', id)
      .eq('company_id', ctx.companyId!)

    // Fetch routing entries
    const { data: routing } = await supabase
      .from('rfi_routing')
      .select('*')
      .eq('rfi_id', id)
      .eq('company_id', ctx.companyId!)
      .order('routed_at', { ascending: false })

    return NextResponse.json({
      data: {
        ...data,
        responses_count: (responses ?? []).length,
        routing: routing ?? [],
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// PUT /api/v2/rfis/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing RFI ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateRfiSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify the RFI exists and is editable (draft or open)
    const { data: existing, error: existError } = await supabase
      .from('rfis')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'RFI not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status === 'closed' || existing.status === 'voided') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Closed or voided RFIs cannot be updated', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    // Build update object (only include fields that were provided)
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.rfi_number !== undefined) updates.rfi_number = input.rfi_number
    if (input.subject !== undefined) updates.subject = input.subject
    if (input.question !== undefined) updates.question = input.question
    if (input.status !== undefined) updates.status = input.status
    if (input.priority !== undefined) updates.priority = input.priority
    if (input.category !== undefined) updates.category = input.category
    if (input.assigned_to !== undefined) updates.assigned_to = input.assigned_to
    if (input.due_date !== undefined) updates.due_date = input.due_date
    if (input.cost_impact !== undefined) updates.cost_impact = input.cost_impact
    if (input.schedule_impact_days !== undefined) updates.schedule_impact_days = input.schedule_impact_days
    if (input.related_document_id !== undefined) updates.related_document_id = input.related_document_id

    const { data, error } = await supabase
      .from('rfis')
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// DELETE /api/v2/rfis/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing RFI ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Only draft RFIs can be deleted
    const { data: existing, error: existError } = await supabase
      .from('rfis')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'RFI not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only draft RFIs can be deleted', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('rfis')
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)
