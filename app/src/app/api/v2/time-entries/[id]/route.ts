/**
 * Time Entry by ID — Get, Update, Delete
 *
 * GET    /api/v2/time-entries/:id — Get time entry with allocations
 * PUT    /api/v2/time-entries/:id — Update time entry
 * DELETE /api/v2/time-entries/:id — Soft delete time entry
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateTimeEntrySchema } from '@/lib/validation/schemas/time-tracking'

// ============================================================================
// GET /api/v2/time-entries/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing time entry ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Time entry not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch allocations
    const { data: allocations } = await supabase
      .from('time_entry_allocations')
      .select('*')
      .eq('time_entry_id', id)
      .eq('company_id', ctx.companyId!)

    return NextResponse.json({
      data: {
        ...data,
        allocations: allocations ?? [],
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'] }
)

// ============================================================================
// PUT /api/v2/time-entries/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing time entry ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = updateTimeEntrySchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify entry exists and is editable (pending status)
    const { data: existing, error: fetchError } = await supabase
      .from('time_entries')
      .select('status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Time entry not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'pending') {
      return NextResponse.json(
        { error: 'Forbidden', message: `Cannot update a time entry with status "${existing.status}"`, requestId: ctx.requestId },
        { status: 403 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.job_id !== undefined) updates.job_id = input.job_id
    if (input.cost_code_id !== undefined) updates.cost_code_id = input.cost_code_id
    if (input.entry_date !== undefined) updates.entry_date = input.entry_date
    if (input.clock_in !== undefined) updates.clock_in = input.clock_in
    if (input.clock_out !== undefined) updates.clock_out = input.clock_out
    if (input.regular_hours !== undefined) updates.regular_hours = input.regular_hours
    if (input.overtime_hours !== undefined) updates.overtime_hours = input.overtime_hours
    if (input.double_time_hours !== undefined) updates.double_time_hours = input.double_time_hours
    if (input.break_minutes !== undefined) updates.break_minutes = input.break_minutes
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await supabase
      .from('time_entries')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'] }
)

// ============================================================================
// DELETE /api/v2/time-entries/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing time entry ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify entry exists and is deletable (pending status)
    const { data: existing, error: fetchError } = await supabase
      .from('time_entries')
      .select('status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Time entry not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'pending') {
      return NextResponse.json(
        { error: 'Forbidden', message: `Cannot delete a time entry with status "${existing.status}"`, requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('time_entries')
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'] }
)
