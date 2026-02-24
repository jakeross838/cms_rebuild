/**
 * Complete Maintenance Task — Mark task as completed
 *
 * POST /api/v2/maintenance-schedules/:id/tasks/:taskId/complete
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { completeMaintenanceTaskSchema } from '@/lib/validation/schemas/warranty'

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
// POST /api/v2/maintenance-schedules/:id/tasks/:taskId/complete
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { scheduleId, taskId } = extractIds(req.nextUrl.pathname)
    if (!scheduleId || !taskId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing schedule or task ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const parseResult = completeMaintenanceTaskSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid completion data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify task exists and is completable
    const { data: existing, error: existError } = await (supabase
      .from('maintenance_tasks') as any)
      .select('id, status')
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

    if (existing.status === 'completed' || existing.status === 'skipped') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Task is already completed or skipped', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const now = new Date().toISOString()
    const input = parseResult.data

    const { data, error } = await (supabase
      .from('maintenance_tasks') as any)
      .update({
        status: 'completed',
        completed_at: now,
        completed_by: ctx.user!.id,
        actual_cost: input.actual_cost,
        notes: input.notes ?? null,
        updated_at: now,
      })
      .eq('id', taskId)
      .eq('company_id', ctx.companyId!)
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
