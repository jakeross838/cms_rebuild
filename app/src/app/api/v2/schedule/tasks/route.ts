/**
 * Schedule Tasks API — List & Create
 *
 * GET  /api/v2/schedule/tasks — List schedule tasks (filterable by job, status, etc.)
 * POST /api/v2/schedule/tasks — Create a new schedule task
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { escapeLike } from '@/lib/utils'
import { listScheduleTasksSchema, createScheduleTaskSchema } from '@/lib/validation/schemas/scheduling'

// ============================================================================
// GET /api/v2/schedule/tasks
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listScheduleTasksSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      parent_task_id: url.searchParams.get('parent_task_id') ?? undefined,
      phase: url.searchParams.get('phase') ?? undefined,
      trade: url.searchParams.get('trade') ?? undefined,
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

    let query = supabase
      .from('schedule_tasks')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.parent_task_id) {
      query = query.eq('parent_task_id', filters.parent_task_id)
    }
    if (filters.phase) {
      query = query.eq('phase', filters.phase)
    }
    if (filters.trade) {
      query = query.eq('trade', filters.trade)
    }
    if (filters.q) {
      query = query.ilike('name', `%${escapeLike(filters.q)}%`)
    }

    query = query
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/schedule/tasks
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createScheduleTaskSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid task data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('schedule_tasks')
      .insert({
        company_id: ctx.companyId!,
        job_id: input.job_id,
        parent_task_id: input.parent_task_id ?? null,
        name: input.name,
        description: input.description ?? null,
        phase: input.phase ?? null,
        trade: input.trade ?? null,
        task_type: input.task_type,
        planned_start: input.planned_start ?? null,
        planned_end: input.planned_end ?? null,
        actual_start: input.actual_start ?? null,
        actual_end: input.actual_end ?? null,
        duration_days: input.duration_days ?? null,
        progress_pct: input.progress_pct,
        status: input.status,
        assigned_to: input.assigned_to ?? null,
        assigned_vendor_id: input.assigned_vendor_id ?? null,
        is_critical_path: input.is_critical_path,
        total_float: input.total_float ?? null,
        sort_order: input.sort_order,
        notes: input.notes ?? null,
      })
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
