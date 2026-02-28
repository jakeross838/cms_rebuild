/**
 * Schedule Tasks API — List & Create
 *
 * GET  /api/v1/schedule-tasks — List schedule tasks (paginated, filterable)
 * POST /api/v1/schedule-tasks — Create a new schedule task
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  mapDbError,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { safeOrIlike } from '@/lib/utils'
import {
  listScheduleTasksSchema,
  createScheduleTaskSchema,
} from '@/lib/validation/schemas/scheduling'
import type { ScheduleTask } from '@/types/scheduling'

// ── GET /api/v1/schedule-tasks ──────────────────────────────────────────

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

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
        {
          error: 'Validation Error',
          message: 'Invalid query parameters',
          errors: parseResult.error.flatten().fieldErrors,
          requestId: ctx.requestId,
        },
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
      .is('deleted_at', null) as unknown as {
        eq: (col: string, val: unknown) => typeof query
        is: (col: string, val: unknown) => typeof query
        or: (filter: string) => typeof query
        order: (col: string, opts: { ascending: boolean }) => typeof query
        range: (from: number, to: number) => Promise<{ data: ScheduleTask[] | null; count: number | null; error: { message: string } | null }>
      }

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id) as typeof query
    }
    if (filters.status) {
      query = query.eq('status', filters.status) as typeof query
    }
    if (filters.parent_task_id) {
      query = query.eq('parent_task_id', filters.parent_task_id) as typeof query
    }
    if (filters.phase) {
      query = query.eq('phase', filters.phase) as typeof query
    }
    if (filters.trade) {
      query = query.eq('trade', filters.trade) as typeof query
    }
    if (filters.q) {
      query = query.or(`name.ilike.${safeOrIlike(filters.q)},description.ilike.${safeOrIlike(filters.q)}`) as typeof query
    }

    query = query.order('sort_order', { ascending: true }) as typeof query

    const { data: tasks, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      logger.error('Failed to list schedule tasks', { error: error.message })
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(
      { ...paginatedResponse(tasks ?? [], count ?? 0, page, limit), requestId: ctx.requestId }
    )
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ── POST /api/v1/schedule-tasks ─────────────────────────────────────────

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })
    const body = ctx.validatedBody as Record<string, unknown>

    const supabase = await createClient()

    const { data: task, error } = await (supabase
      .from('schedule_tasks')
      .insert({
        ...body,
        company_id: ctx.companyId!,
      } as never)
      .select()
      .single() as unknown as Promise<{ data: ScheduleTask | null; error: { message: string } | null }>)

    if (error || !task) {
      logger.error('Failed to create schedule task', { error: error?.message })
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('Schedule task created', { taskId: task.id, jobId: task.job_id })

    return NextResponse.json({ data: task, requestId: ctx.requestId }, { status: 201 })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'superintendent'],
    schema: createScheduleTaskSchema,
    permission: 'jobs:update:all',
    auditAction: 'schedule_task.create',
  }
)
