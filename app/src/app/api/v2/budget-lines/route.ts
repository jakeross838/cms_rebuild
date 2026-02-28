/**
 * Budget Lines API (flat route) — List & Create
 *
 * GET  /api/v2/budget-lines — List budget lines (filtered by company)
 * POST /api/v2/budget-lines — Create a budget line (auto-creates budget if needed)
 */

import { NextResponse } from 'next/server'
import { safeOrIlike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listBudgetLinesSchema, createBudgetLineSchema } from '@/lib/validation/schemas/budget-lines'

// ============================================================================
// GET /api/v2/budget-lines
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listBudgetLinesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      budget_id: url.searchParams.get('budget_id') ?? undefined,
      phase: url.searchParams.get('phase') ?? undefined,
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
      .from('budget_lines')
      .select('*, cost_codes(code, name)', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.job_id) query = query.eq('job_id', filters.job_id)
    if (filters.budget_id) query = query.eq('budget_id', filters.budget_id)
    if (filters.phase) query = query.eq('phase', filters.phase)
    if (filters.q) {
      query = query.or(`description.ilike.${safeOrIlike(filters.q)},phase.ilike.${safeOrIlike(filters.q)}`)
    }

    query = query.order('created_at', { ascending: false })

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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// POST /api/v2/budget-lines — Create budget line (auto-creates budget if needed)
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
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

    // Find or create a budget for this job
    const { data: existingBudget, error: budgetLookupError } = await supabase
      .from('budgets')
      .select('id')
      .eq('job_id', input.job_id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let budgetId: string

    if (budgetLookupError && budgetLookupError.code !== 'PGRST116') {
      const mapped = mapDbError(budgetLookupError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    if (existingBudget) {
      budgetId = (existingBudget as { id: string }).id
    } else {
      const { data: newBudget, error: budgetError } = await supabase
        .from('budgets')
        .insert({
          company_id: ctx.companyId!,
          job_id: input.job_id,
          name: 'Primary Budget',
          status: 'draft',
          total_amount: 0,
          version: 1,
          created_by: ctx.user!.id,
        } as never)
        .select('id')
        .single()

      if (budgetError) {
        const mapped = mapDbError(budgetError)
        return NextResponse.json(
          { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
          { status: mapped.status }
        )
      }
      budgetId = (newBudget as { id: string }).id
    }

    const { data, error } = await supabase
      .from('budget_lines')
      .insert({
        company_id: ctx.companyId!,
        job_id: input.job_id,
        budget_id: budgetId,
        description: input.description,
        phase: input.phase ?? null,
        cost_code_id: input.cost_code_id ?? null,
        estimated_amount: input.estimated_amount ?? 0,
        notes: input.notes ?? null,
      } as never)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'budget_line.create' }
)
