/**
 * Budget Lines API — List & Create
 *
 * GET  /api/v2/budgets/:id/lines — List lines for a budget
 * POST /api/v2/budgets/:id/lines — Add a line to a budget
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listBudgetLinesSchema, createBudgetLineSchema } from '@/lib/validation/schemas/budget'

/**
 * Extract budget ID from a path like /api/v2/budgets/:id/lines
 */
function extractBudgetId(pathname: string): string | null {
  const segments = pathname.split('/')
  // Find "budgets" segment and take the next one
  const budgetsIdx = segments.indexOf('budgets')
  if (budgetsIdx === -1 || budgetsIdx + 1 >= segments.length) return null
  return segments[budgetsIdx + 1]
}

// ============================================================================
// GET /api/v2/budgets/:id/lines
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const budgetId = extractBudgetId(req.nextUrl.pathname)
    if (!budgetId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing budget ID', requestId: ctx.requestId },
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
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    let query = supabase
      .from('budget_lines')
      .select('*', { count: 'exact' })
      .eq('budget_id', budgetId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.cost_code_id) {
      query = query.eq('cost_code_id', filters.cost_code_id)
    }
    if (filters.phase) {
      query = query.eq('phase', filters.phase)
    }

    query = query.order('sort_order', { ascending: true })

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
  { requireAuth: true, rateLimit: 'financial', requiredRoles: ['owner', 'admin', 'pm', 'office'] }
)

// ============================================================================
// POST /api/v2/budgets/:id/lines — Add budget line
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const budgetId = extractBudgetId(req.nextUrl.pathname)
    if (!budgetId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing budget ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createBudgetLineSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid budget line data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify budget exists and belongs to company
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .select('id, job_id')
      .eq('id', budgetId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (budgetError || !budget) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Budget not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('budget_lines')
      .insert({
        budget_id: budgetId,
        company_id: ctx.companyId!,
        job_id: budget.job_id,
        cost_code_id: input.cost_code_id ?? null,
        phase: input.phase ?? null,
        description: input.description,
        estimated_amount: input.estimated_amount,
        committed_amount: input.committed_amount,
        actual_amount: input.actual_amount,
        projected_amount: input.projected_amount,
        variance_amount: input.variance_amount,
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
  { requireAuth: true, requiredRoles: ['owner', 'admin', 'pm', 'office'], rateLimit: 'financial', auditAction: 'budget_line.create' }
)
