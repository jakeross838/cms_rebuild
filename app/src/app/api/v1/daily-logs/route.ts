/**
 * Daily Logs API — List & Create
 *
 * GET  /api/v1/daily-logs — List daily logs (paginated, filterable)
 * POST /api/v1/daily-logs — Create a new daily log
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
  listDailyLogsSchema,
  createDailyLogSchema,
} from '@/lib/validation/schemas/daily-logs'
import type { DailyLog } from '@/types/daily-logs'

// ── GET /api/v1/daily-logs ──────────────────────────────────────────────

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const url = req.nextUrl
    const parseResult = listDailyLogsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      date_from: url.searchParams.get('date_from') ?? undefined,
      date_to: url.searchParams.get('date_to') ?? undefined,
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
      .from('daily_logs')
      .select('*, jobs!left(id, name)', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null) as unknown as {
        eq: (col: string, val: unknown) => typeof query
        is: (col: string, val: unknown) => typeof query
        gte: (col: string, val: string) => typeof query
        lte: (col: string, val: string) => typeof query
        order: (col: string, opts: { ascending: boolean }) => typeof query
        range: (from: number, to: number) => Promise<{ data: DailyLog[] | null; count: number | null; error: { message: string } | null }>
      }

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id) as typeof query
    }
    if (filters.status) {
      query = query.eq('status', filters.status) as typeof query
    }
    if (filters.date_from) {
      query = query.gte('log_date', filters.date_from) as typeof query
    }
    if (filters.date_to) {
      query = query.lte('log_date', filters.date_to) as typeof query
    }

    query = query.order('log_date', { ascending: false }) as typeof query

    const { data: logs, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      logger.error('Failed to list daily logs', { error: error.message })
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(
      { ...paginatedResponse(logs ?? [], count ?? 0, page, limit), requestId: ctx.requestId }
    )
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ── POST /api/v1/daily-logs ─────────────────────────────────────────────

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })
    const body = ctx.validatedBody as Record<string, unknown>

    const supabase = await createClient()

    // Verify job belongs to this company
    const { data: jobCheck } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', body.job_id as string)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: { id: string } | null; error: unknown }

    if (!jobCheck) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Job not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data: log, error } = await (supabase
      .from('daily_logs')
      .insert({
        ...body,
        company_id: ctx.companyId!,
        status: 'draft',
        created_by: ctx.user!.id,
      } as never)
      .select()
      .single() as unknown as Promise<{ data: DailyLog | null; error: { message: string; code?: string } | null }>)

    if (error || !log) {
      // Handle unique constraint (one log per job per day)
      if (error?.code === '23505') {
        return NextResponse.json(
          { error: 'Conflict', message: 'A daily log already exists for this job on this date', requestId: ctx.requestId },
          { status: 409 }
        )
      }
      logger.error('Failed to create daily log', { error: error?.message })
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('Daily log created', { logId: log.id, jobId: log.job_id })

    return NextResponse.json({ data: log, requestId: ctx.requestId }, { status: 201 })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'superintendent'],
    schema: createDailyLogSchema,
    permission: 'jobs:update:all',
    auditAction: 'daily_log.create',
  }
)
