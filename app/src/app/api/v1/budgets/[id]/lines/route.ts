/**
 * Budget Lines API — List & Create
 *
 * GET  /api/v1/budgets/[id]/lines — List budget lines
 * POST /api/v1/budgets/[id]/lines — Create a new budget line
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
import { uuidSchema } from '@/lib/validation/schemas/common'
import { listBudgetLinesSchema, createBudgetLineSchema } from '@/lib/validation/schemas/budget'
import type { BudgetLine } from '@/types/budget'

function extractEntityId(req: Request, segment: string): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const idx = segments.indexOf(segment)
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ── GET /api/v1/budgets/[id]/lines ──────────────────────────────────────

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const budgetId = extractEntityId(req, 'budgets')
    if (!budgetId || !uuidSchema.safeParse(budgetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid budget ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listBudgetLinesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      cost_code_id: url.searchParams.get('cost_code_id') ?? undefined,
      phase: url.searchParams.get('phase') ?? undefined,
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

    // Verify budget belongs to company
    const { data: budgetCheck } = await supabase
      .from('budgets')
      .select('id, job_id')
      .eq('id', budgetId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: { id: string; job_id: string } | null; error: unknown }

    if (!budgetCheck) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Budget not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    let query = supabase
      .from('budget_lines')
      .select('*', { count: 'exact' })
      .eq('budget_id', budgetId)
      .eq('company_id', ctx.companyId!) as unknown as {
        eq: (col: string, val: unknown) => typeof query
        order: (col: string, opts: { ascending: boolean }) => typeof query
        range: (from: number, to: number) => Promise<{ data: BudgetLine[] | null; count: number | null; error: { message: string } | null }>
      }

    if (filters.cost_code_id) {
      query = query.eq('cost_code_id', filters.cost_code_id) as typeof query
    }
    if (filters.phase) {
      query = query.eq('phase', filters.phase) as typeof query
    }

    query = query.order('sort_order', { ascending: true }) as typeof query

    const { data: lines, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      logger.error('Failed to list budget lines', { error: error.message })
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(
      { ...paginatedResponse(lines ?? [], count ?? 0, page, limit), requestId: ctx.requestId }
    )
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ── POST /api/v1/budgets/[id]/lines ─────────────────────────────────────

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })
    const body = ctx.validatedBody as Record<string, unknown>

    const budgetId = extractEntityId(req, 'budgets')
    if (!budgetId || !uuidSchema.safeParse(budgetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid budget ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify budget belongs to company and get job_id
    const { data: budgetCheck } = await supabase
      .from('budgets')
      .select('id, job_id, status')
      .eq('id', budgetId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: { id: string; job_id: string; status: string } | null; error: unknown }

    if (!budgetCheck) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Budget not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (budgetCheck.status === 'locked') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Cannot add lines to a locked budget', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { data: line, error } = await (supabase
      .from('budget_lines')
      .insert({
        ...body,
        budget_id: budgetId,
        job_id: budgetCheck.job_id,
        company_id: ctx.companyId!,
      } as never)
      .select()
      .single() as unknown as Promise<{ data: BudgetLine | null; error: { message: string } | null }>)

    if (error || !line) {
      logger.error('Failed to create budget line', { error: error?.message })
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('Budget line created', { lineId: line.id, budgetId })

    return NextResponse.json({ data: line, requestId: ctx.requestId }, { status: 201 })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm'],
    schema: createBudgetLineSchema,
    permission: 'jobs:update:all',
    auditAction: 'budget_line.create',
  }
)
