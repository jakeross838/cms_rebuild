/**
 * Schedule Baselines API — List & Create
 *
 * GET  /api/v1/schedule-baselines?job_id=... — List baselines for a job
 * POST /api/v1/schedule-baselines — Create a new baseline snapshot
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
import {
  listBaselinesSchema,
  createBaselineSchema,
} from '@/lib/validation/schemas/scheduling'
import type { ScheduleBaseline } from '@/types/scheduling'

// ── GET /api/v1/schedule-baselines ──────────────────────────────────────

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const url = req.nextUrl
    const parseResult = listBaselinesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
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

    const { data: baselines, count, error } = await supabase
      .from('schedule_baselines')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .eq('job_id', filters.job_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1) as { data: ScheduleBaseline[] | null; count: number | null; error: { message: string } | null }

    if (error) {
      logger.error('Failed to list baselines', { error: error.message })
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(
      { ...paginatedResponse(baselines ?? [], count ?? 0, page, limit), requestId: ctx.requestId }
    )
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ── POST /api/v1/schedule-baselines ─────────────────────────────────────

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })
    const body = ctx.validatedBody as Record<string, unknown>

    const supabase = await createClient()
    const jobId = body.job_id as string

    // Verify job belongs to this company
    const { data: jobCheck } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: { id: string } | null; error: unknown }

    if (!jobCheck) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Job not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Snapshot all current tasks for this job as baseline_data
    const { data: tasks } = await supabase
      .from('schedule_tasks')
      .select('id, name, planned_start, planned_end, duration_days, progress_pct, status, sort_order')
      .eq('job_id', jobId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })

    const snapshotData = {
      tasks: tasks ?? [],
      snapshot_at: new Date().toISOString(),
    }

    const insertData = {
      ...body,
      company_id: ctx.companyId!,
      created_by: ctx.user!.id,
      snapshot_date: (body.snapshot_date as string) || new Date().toISOString().split('T')[0],
      baseline_data: snapshotData,
    }

    const { data: baseline, error } = await (supabase
      .from('schedule_baselines')
      .insert(insertData as never)
      .select()
      .single() as unknown as Promise<{ data: ScheduleBaseline | null; error: { message: string } | null }>)

    if (error || !baseline) {
      logger.error('Failed to create baseline', { error: error?.message })
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('Schedule baseline created', { baselineId: baseline.id, jobId })

    return NextResponse.json({ data: baseline, requestId: ctx.requestId }, { status: 201 })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm'],
    schema: createBaselineSchema,
    permission: 'jobs:update:all',
    auditAction: 'schedule_baseline.create',
  }
)
