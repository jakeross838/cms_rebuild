/**
 * Maintenance Tasks API — List & Create
 *
 * GET  /api/v2/maintenance-schedules/:id/tasks — List tasks for a schedule
 * POST /api/v2/maintenance-schedules/:id/tasks — Create a new task
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listMaintenanceTasksSchema, createMaintenanceTaskSchema } from '@/lib/validation/schemas/warranty'

/**
 * Extract schedule ID from /api/v2/maintenance-schedules/:id/tasks
 */
function extractScheduleId(pathname: string): string | null {
  const segments = pathname.split('/')
  const idx = segments.indexOf('maintenance-schedules')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v2/maintenance-schedules/:id/tasks
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const scheduleId = extractScheduleId(req.nextUrl.pathname)
    if (!scheduleId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing schedule ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listMaintenanceTasksSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      schedule_id: scheduleId,
      status: url.searchParams.get('status') ?? undefined,
      q: url.searchParams.get('q') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    // Verify schedule belongs to company
    const { data: schedule, error: sError } = await (supabase
      .from('maintenance_schedules') as any)
      .select('id')
      .eq('id', scheduleId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (sError || !schedule) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Maintenance schedule not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    let query = (supabase
      .from('maintenance_tasks') as any)
      .select('*', { count: 'exact' })
      .eq('schedule_id', scheduleId)
      .eq('company_id', ctx.companyId!)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.q) {
      query = query.or(`title.ilike.%${filters.q}%`)
    }

    query = query.order('due_date', { ascending: true })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/maintenance-schedules/:id/tasks — Create task
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const scheduleId = extractScheduleId(req.nextUrl.pathname)
    if (!scheduleId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing schedule ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createMaintenanceTaskSchema.safeParse({
      ...body,
      schedule_id: scheduleId,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid task data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify schedule belongs to company
    const { data: schedule, error: sError } = await (supabase
      .from('maintenance_schedules') as any)
      .select('id')
      .eq('id', scheduleId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (sError || !schedule) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Maintenance schedule not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await (supabase
      .from('maintenance_tasks') as any)
      .insert({
        company_id: ctx.companyId!,
        schedule_id: scheduleId,
        title: input.title,
        description: input.description ?? null,
        status: input.status,
        due_date: input.due_date,
        actual_cost: input.actual_cost,
        notes: input.notes ?? null,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
