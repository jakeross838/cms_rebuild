/**
 * Cost Transactions API — List & Create
 *
 * GET  /api/v2/cost-transactions — List cost transactions
 * POST /api/v2/cost-transactions — Create a cost transaction
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listCostTransactionsSchema, createCostTransactionSchema } from '@/lib/validation/schemas/budget'

// ============================================================================
// GET /api/v2/cost-transactions
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listCostTransactionsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      budget_line_id: url.searchParams.get('budget_line_id') ?? undefined,
      cost_code_id: url.searchParams.get('cost_code_id') ?? undefined,
      transaction_type: url.searchParams.get('transaction_type') ?? undefined,
      vendor_id: url.searchParams.get('vendor_id') ?? undefined,
      date_from: url.searchParams.get('date_from') ?? undefined,
      date_to: url.searchParams.get('date_to') ?? undefined,
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
      .from('cost_transactions')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.budget_line_id) {
      query = query.eq('budget_line_id', filters.budget_line_id)
    }
    if (filters.cost_code_id) {
      query = query.eq('cost_code_id', filters.cost_code_id)
    }
    if (filters.transaction_type) {
      query = query.eq('transaction_type', filters.transaction_type)
    }
    if (filters.vendor_id) {
      query = query.eq('vendor_id', filters.vendor_id)
    }
    if (filters.date_from) {
      query = query.gte('transaction_date', filters.date_from)
    }
    if (filters.date_to) {
      query = query.lte('transaction_date', filters.date_to)
    }

    query = query.order('transaction_date', { ascending: false })

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
// POST /api/v2/cost-transactions — Create cost transaction
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createCostTransactionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid transaction data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('cost_transactions')
      .insert({
        company_id: ctx.companyId!,
        job_id: input.job_id,
        budget_line_id: input.budget_line_id ?? null,
        cost_code_id: input.cost_code_id ?? null,
        transaction_type: input.transaction_type,
        amount: input.amount,
        description: input.description ?? null,
        reference_type: input.reference_type ?? null,
        reference_id: input.reference_id ?? null,
        transaction_date: input.transaction_date ?? new Date().toISOString().split('T')[0],
        vendor_id: input.vendor_id ?? null,
        created_by: ctx.user!.id,
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
  { requireAuth: true, requiredRoles: ['owner', 'admin', 'pm', 'office'], rateLimit: 'financial', auditAction: 'cost_transaction.create' }
)
