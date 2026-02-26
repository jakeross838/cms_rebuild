/**
 * Maintenance Task by ID — Get, Update, Delete
 *
 * GET    /api/v2/maintenance-schedules/:id/tasks/:taskId — Get task
 * PUT    /api/v2/maintenance-schedules/:id/tasks/:taskId — Update task
 * DELETE /api/v2/maintenance-schedules/:id/tasks/:taskId — Delete task
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateMaintenanceTaskSchema } from '@/lib/validation/schemas/warranty'

/**
 * Extract schedule ID and task ID
 */
function extractIds(pathname: string): { scheduleId: string | null; taskId: string | null } {
  const segments = pathname.split('/')
  const sIdx = segments.indexOf('maintenance-schedules')
  const tIdx = segments.indexOf('tasks')
  return {
    scheduleId: sIdx !== -1 && sIdx + 1 < segments.length ? segments[sIdx + 1] : null,
    taskId: tIdx !== -1 && tIdx + 1 < segments.length ? segments[tIdx + 1] : null,
  }
}

// ============================================================================
// GET /api/v2/maintenance-schedules/:id/tasks/:taskId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { scheduleId, taskId } = extractIds(req.nextUrl.pathname)
    if (!scheduleId || !taskId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing schedule or task ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('maintenance_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('schedule_id', scheduleId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Maintenance task not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/maintenance-schedules/:id/tasks/:taskId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { scheduleId, taskId } = extractIds(req.nextUrl.pathname)
    if (!scheduleId || !taskId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing schedule or task ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateMaintenanceTaskSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify task exists
    const { data: existing, error: existError } = await (supabase as any)
      .from('maintenance_tasks')
      .select('id')
      .eq('id', taskId)
      .eq('schedule_id', scheduleId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Maintenance task not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.title !== undefined) updates.title = input.title
    if (input.description !== undefined) updates.description = input.description
    if (input.status !== undefined) updates.status = input.status
    if (input.due_date !== undefined) updates.due_date = input.due_date
    if (input.actual_cost !== undefined) updates.actual_cost = input.actual_cost
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await (supabase as any)
      .from('maintenance_tasks')
      .update(updates)
      .eq('id', taskId)
      .eq('schedule_id', scheduleId)
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
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/maintenance-schedules/:id/tasks/:taskId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { scheduleId, taskId } = extractIds(req.nextUrl.pathname)
    if (!scheduleId || !taskId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing schedule or task ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: existing, error: existError } = await (supabase as any)
      .from('maintenance_tasks')
      .select('id')
      .eq('id', taskId)
      .eq('schedule_id', scheduleId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Maintenance task not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await (supabase as any)
      .from('maintenance_tasks')
      .delete()
      .eq('id', taskId)
      .eq('schedule_id', scheduleId)
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
  { requireAuth: true, rateLimit: 'api' }
)
