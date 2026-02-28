/**
 * Budgets API — List & Create
 *
 * GET  /api/v1/budgets — List budgets (paginated, filterable)
 * POST /api/v1/budgets — Create a new budget
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
import { listBudgetsSchema, createBudgetSchema } from '@/lib/validation/schemas/budget'
import type { Budget } from '@/types/budget'

// ── GET /api/v1/budgets ─────────────────────────────────────────────────

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const url = req.nextUrl
    const parseResult = listBudgetsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
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
      .from('budgets')
      .select('*, jobs!left(id, name)', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null) as unknown as {
        eq: (col: string, val: unknown) => typeof query
        is: (col: string, val: unknown) => typeof query
        or: (filter: string) => typeof query
        order: (col: string, opts: { ascending: boolean }) => typeof query
        range: (from: number, to: number) => Promise<{ data: Budget[] | null; count: number | null; error: { message: string } | null }>
      }

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id) as typeof query
    }
    if (filters.status) {
      query = query.eq('status', filters.status) as typeof query
    }
    if (filters.q) {
      query = query.or(`name.ilike.${safeOrIlike(filters.q)}`) as typeof query
    }

    query = query.order('updated_at', { ascending: false }) as typeof query

    const { data: budgets, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      logger.error('Failed to list budgets', { error: error.message })
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(
      { ...paginatedResponse(budgets ?? [], count ?? 0, page, limit), requestId: ctx.requestId }
    )
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ── POST /api/v1/budgets ────────────────────────────────────────────────

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })
    const body = ctx.validatedBody as Record<string, unknown>

    const supabase = await createClient()

    const { data: budget, error } = await (supabase
      .from('budgets')
      .insert({
        ...body,
        company_id: ctx.companyId!,
        created_by: ctx.user!.id,
        version: 1,
      } as never)
      .select()
      .single() as unknown as Promise<{ data: Budget | null; error: { message: string } | null }>)

    if (error || !budget) {
      logger.error('Failed to create budget', { error: error?.message })
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('Budget created', { budgetId: budget.id, jobId: budget.job_id })

    return NextResponse.json({ data: budget, requestId: ctx.requestId }, { status: 201 })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm'],
    schema: createBudgetSchema,
    permission: 'jobs:update:all',
    auditAction: 'budget.create',
  }
)
