/**
 * Maintenance Schedule by ID — Get, Update, Delete
 *
 * GET    /api/v2/maintenance-schedules/:id — Get schedule details
 * PUT    /api/v2/maintenance-schedules/:id — Update schedule
 * DELETE /api/v2/maintenance-schedules/:id — Soft delete schedule
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateMaintenanceScheduleSchema } from '@/lib/validation/schemas/warranty'

// ============================================================================
// GET /api/v2/maintenance-schedules/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing schedule ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('maintenance_schedules')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Maintenance schedule not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch tasks count
    const { data: tasks } = await (supabase as any)
      .from('maintenance_tasks')
      .select('id')
      .eq('schedule_id', id)
      .eq('company_id', ctx.companyId!)

    return NextResponse.json({
      data: {
        ...data,
        tasks_count: (tasks ?? []).length,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/maintenance-schedules/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing schedule ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateMaintenanceScheduleSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify schedule exists
    const { data: existing, error: existError } = await (supabase as any)
      .from('maintenance_schedules')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Maintenance schedule not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.title !== undefined) updates.title = input.title
    if (input.description !== undefined) updates.description = input.description
    if (input.frequency !== undefined) updates.frequency = input.frequency
    if (input.category !== undefined) updates.category = input.category
    if (input.assigned_to !== undefined) updates.assigned_to = input.assigned_to
    if (input.assigned_vendor_id !== undefined) updates.assigned_vendor_id = input.assigned_vendor_id
    if (input.start_date !== undefined) updates.start_date = input.start_date
    if (input.end_date !== undefined) updates.end_date = input.end_date
    if (input.next_due_date !== undefined) updates.next_due_date = input.next_due_date
    if (input.estimated_cost !== undefined) updates.estimated_cost = input.estimated_cost
    if (input.is_active !== undefined) updates.is_active = input.is_active
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await (supabase as any)
      .from('maintenance_schedules')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/maintenance-schedules/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing schedule ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: existing, error: existError } = await (supabase as any)
      .from('maintenance_schedules')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Maintenance schedule not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await (supabase as any)
      .from('maintenance_schedules')
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
