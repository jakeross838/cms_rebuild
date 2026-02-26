/**
 * Schedule Task by ID — Get, Update, Delete
 *
 * GET    /api/v2/schedule/tasks/:id — Get task details
 * PUT    /api/v2/schedule/tasks/:id — Update task
 * DELETE /api/v2/schedule/tasks/:id — Soft delete task
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateScheduleTaskSchema } from '@/lib/validation/schemas/scheduling'

// ============================================================================
// GET /api/v2/schedule/tasks/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing task ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('schedule_tasks')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Schedule task not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch dependencies where this task is predecessor or successor
    const { data: predecessors, error: predError } = await supabase
      .from('schedule_dependencies')
      .select('*')
      .eq('successor_id', id)

    const { data: successors, error: succError } = await supabase
      .from('schedule_dependencies')
      .select('*')
      .eq('predecessor_id', id)

    return NextResponse.json({
      data: {
        ...data,
        predecessors: predecessors ?? [],
        successors: successors ?? [],
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'] }
)

// ============================================================================
// PUT /api/v2/schedule/tasks/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing task ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = updateScheduleTaskSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Build update object — only include fields that were provided
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.name !== undefined) updates.name = input.name
    if (input.parent_task_id !== undefined) updates.parent_task_id = input.parent_task_id
    if (input.description !== undefined) updates.description = input.description
    if (input.phase !== undefined) updates.phase = input.phase
    if (input.trade !== undefined) updates.trade = input.trade
    if (input.task_type !== undefined) updates.task_type = input.task_type
    if (input.planned_start !== undefined) updates.planned_start = input.planned_start
    if (input.planned_end !== undefined) updates.planned_end = input.planned_end
    if (input.actual_start !== undefined) updates.actual_start = input.actual_start
    if (input.actual_end !== undefined) updates.actual_end = input.actual_end
    if (input.duration_days !== undefined) updates.duration_days = input.duration_days
    if (input.progress_pct !== undefined) updates.progress_pct = input.progress_pct
    if (input.status !== undefined) updates.status = input.status
    if (input.assigned_to !== undefined) updates.assigned_to = input.assigned_to
    if (input.assigned_vendor_id !== undefined) updates.assigned_vendor_id = input.assigned_vendor_id
    if (input.is_critical_path !== undefined) updates.is_critical_path = input.is_critical_path
    if (input.total_float !== undefined) updates.total_float = input.total_float
    if (input.sort_order !== undefined) updates.sort_order = input.sort_order
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await supabase
      .from('schedule_tasks')
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'] }
)

// ============================================================================
// DELETE /api/v2/schedule/tasks/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing task ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('schedule_tasks')
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'] }
)
