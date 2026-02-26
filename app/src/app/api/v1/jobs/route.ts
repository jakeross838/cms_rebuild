/**
 * Jobs API — List & Create
 *
 * GET  /api/v1/jobs — List jobs for company (paginated, filterable)
 * POST /api/v1/jobs — Create a new job
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
import { createJobSchema, listJobsSchema, type CreateJobInput } from '@/lib/validation/schemas/jobs'
import type { Job } from '@/types/database'

// ============================================================================
// GET /api/v1/jobs — List jobs for company
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const url = req.nextUrl
    const parseResult = listJobsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      sortBy: url.searchParams.get('sortBy') ?? undefined,
      sortOrder: url.searchParams.get('sortOrder') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      contract_type: url.searchParams.get('contract_type') ?? undefined,
      project_type: url.searchParams.get('project_type') ?? undefined,
      client_id: url.searchParams.get('client_id') ?? undefined,
      search: url.searchParams.get('search') ?? undefined,
      startDate: url.searchParams.get('startDate') ?? undefined,
      endDate: url.searchParams.get('endDate') ?? undefined,
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
      .from('jobs')
      .select('*, clients!left(id, name)', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null) as unknown as {
        eq: (col: string, val: unknown) => typeof query
        is: (col: string, val: unknown) => typeof query
        ilike: (col: string, val: string) => typeof query
        or: (filter: string) => typeof query
        gte: (col: string, val: string) => typeof query
        lte: (col: string, val: string) => typeof query
        order: (col: string, opts: { ascending: boolean }) => typeof query
        range: (from: number, to: number) => Promise<{ data: Job[] | null; count: number | null; error: { message: string } | null }>
      }

    // Filters
    if (filters.status) {
      query = query.eq('status', filters.status) as typeof query
    }
    if (filters.contract_type) {
      query = query.eq('contract_type', filters.contract_type) as typeof query
    }
    if (filters.project_type) {
      query = query.eq('project_type', filters.project_type) as typeof query
    }
    if (filters.client_id) {
      query = query.eq('client_id', filters.client_id) as typeof query
    }
    if (filters.search) {
      query = query.or(`name.ilike.${safeOrIlike(filters.search)},job_number.ilike.${safeOrIlike(filters.search)}`) as typeof query
    }
    if (filters.startDate) {
      query = query.gte('start_date', filters.startDate) as typeof query
    }
    if (filters.endDate) {
      query = query.lte('start_date', filters.endDate) as typeof query
    }

    // Sort and paginate
    const ascending = filters.sortBy
      ? (filters.sortOrder ?? 'asc') === 'asc'
      : false // default updated_at desc
    query = query.order(filters.sortBy ?? 'updated_at', { ascending }) as typeof query

    const { data: jobs, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      logger.error('Failed to list jobs', { error: error.message })
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(
      { ...paginatedResponse(jobs ?? [], count ?? 0, page, limit), requestId: ctx.requestId }
    )
  },
  {
    requireAuth: true,
    permission: 'jobs:read:all',
  }
)

// ============================================================================
// POST /api/v1/jobs — Create a new job
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })
    const body = ctx.validatedBody as CreateJobInput

    const supabase = await createClient()

    const { data: job, error } = await (supabase
      .from('jobs')
      .insert({
        ...body,
        company_id: ctx.companyId!,
      } as never)
      .select()
      .single() as unknown as Promise<{ data: Job | null; error: { message: string } | null }>)

    if (error || !job) {
      logger.error('Failed to create job', { error: error?.message })
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('Job created', { jobId: job.id, companyId: ctx.companyId! })

    return NextResponse.json({ data: job, requestId: ctx.requestId }, { status: 201 })
  },
  {
    requireAuth: true,
    requiredRoles: ['owner', 'admin', 'pm'],
    schema: createJobSchema,
    permission: 'jobs:create:all',
    auditAction: 'job.create',
  }
)
