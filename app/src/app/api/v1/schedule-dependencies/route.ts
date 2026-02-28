/**
 * Schedule Dependencies API — List & Create
 *
 * GET  /api/v1/schedule-dependencies?job_id=... — List dependencies for tasks in a job
 * POST /api/v1/schedule-dependencies — Create a new dependency
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { createDependencySchema } from '@/lib/validation/schemas/scheduling'
import type { ScheduleDependency } from '@/types/scheduling'

// ── GET /api/v1/schedule-dependencies ───────────────────────────────────

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const url = req.nextUrl
    const jobId = url.searchParams.get('job_id')

    if (!jobId) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'job_id is required', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get task IDs for this job to scope the dependency query
    const { data: taskIds, error: taskError } = await supabase
      .from('schedule_tasks')
      .select('id')
      .eq('job_id', jobId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (taskError) {
      logger.error('Failed to fetch task IDs for dependencies', { error: taskError.message })
      const mapped = mapDbError(taskError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    const ids = (taskIds ?? []).map((t: { id: string }) => t.id)
    if (ids.length === 0) {
      return NextResponse.json({ data: [], requestId: ctx.requestId })
    }

    const { data: deps, error } = await supabase
      .from('schedule_dependencies')
      .select('*')
      .in('predecessor_id', ids)
      .order('created_at', { ascending: true }) as { data: ScheduleDependency[] | null; error: { message: string } | null }

    if (error) {
      logger.error('Failed to list dependencies', { error: error.message })
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: deps ?? [], requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ── POST /api/v1/schedule-dependencies ──────────────────────────────────

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })
    const body = ctx.validatedBody as Record<string, unknown>

    const supabase = await createClient()

    // Verify predecessor task belongs to this company
    const { data: predTask, error: predError } = await supabase
      .from('schedule_tasks')
      .select('id, job_id')
      .eq('id', body.predecessor_id as string)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: { id: string; job_id: string } | null; error: { message: string } | null }

    if (predError || !predTask) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Predecessor task not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Verify successor task belongs to this company and same job
    const { data: succTask, error: succError } = await supabase
      .from('schedule_tasks')
      .select('id, job_id')
      .eq('id', body.successor_id as string)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: { id: string; job_id: string } | null; error: { message: string } | null }

    if (succError || !succTask) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Successor task not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Prevent self-dependency
    if (body.predecessor_id === body.successor_id) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'A task cannot depend on itself', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const { data: dep, error } = await (supabase
      .from('schedule_dependencies')
      .insert(body as never)
      .select()
      .single() as unknown as Promise<{ data: ScheduleDependency | null; error: { message: string } | null }>)

    if (error || !dep) {
      logger.error('Failed to create dependency', { error: error?.message })
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('Schedule dependency created', { depId: dep.id })

    return NextResponse.json({ data: dep, requestId: ctx.requestId }, { status: 201 })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'superintendent'],
    schema: createDependencySchema,
    permission: 'jobs:update:all',
    auditAction: 'schedule_dependency.create',
  }
)
