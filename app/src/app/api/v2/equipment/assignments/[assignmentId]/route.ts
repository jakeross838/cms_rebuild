/**
 * Equipment Assignment by ID — Get, Update, Delete
 *
 * GET    /api/v2/equipment/assignments/:assignmentId — Get assignment
 * PUT    /api/v2/equipment/assignments/:assignmentId — Update assignment
 * DELETE /api/v2/equipment/assignments/:assignmentId — Delete assignment
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateAssignmentSchema } from '@/lib/validation/schemas/equipment'

// ============================================================================
// GET /api/v2/equipment/assignments/:assignmentId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const assignmentId = req.nextUrl.pathname.split('/').pop()
    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing assignment ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('equipment_assignments')
      .select('*')
      .eq('id', assignmentId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Assignment not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/equipment/assignments/:assignmentId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const assignmentId = req.nextUrl.pathname.split('/').pop()
    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing assignment ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateAssignmentSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.job_id !== undefined) updates.job_id = input.job_id
    if (input.assigned_to !== undefined) updates.assigned_to = input.assigned_to
    if (input.start_date !== undefined) updates.start_date = input.start_date
    if (input.end_date !== undefined) updates.end_date = input.end_date
    if (input.status !== undefined) updates.status = input.status
    if (input.hours_used !== undefined) updates.hours_used = input.hours_used
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await supabase
      .from('equipment_assignments')
      .update(updates)
      .eq('id', assignmentId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Assignment not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/equipment/assignments/:assignmentId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const assignmentId = req.nextUrl.pathname.split('/').pop()
    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing assignment ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('equipment_assignments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', assignmentId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
