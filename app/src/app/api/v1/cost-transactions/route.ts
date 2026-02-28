/**
 * Cost Transactions API — List & Create
 *
 * GET  /api/v1/cost-transactions — List cost transactions (paginated, filterable)
 * POST /api/v1/cost-transactions — Create a new cost transaction
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
  listCostTransactionsSchema,
  createCostTransactionSchema,
} from '@/lib/validation/schemas/budget'
import type { CostTransaction } from '@/types/budget'

// ── GET /api/v1/cost-transactions ───────────────────────────────────────

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

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
      .from('cost_transactions')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!) as unknown as {
        eq: (col: string, val: unknown) => typeof query
        gte: (col: string, val: string) => typeof query
        lte: (col: string, val: string) => typeof query
        order: (col: string, opts: { ascending: boolean }) => typeof query
        range: (from: number, to: number) => Promise<{ data: CostTransaction[] | null; count: number | null; error: { message: string } | null }>
      }

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id) as typeof query
    }
    if (filters.budget_line_id) {
      query = query.eq('budget_line_id', filters.budget_line_id) as typeof query
    }
    if (filters.cost_code_id) {
      query = query.eq('cost_code_id', filters.cost_code_id) as typeof query
    }
    if (filters.transaction_type) {
      query = query.eq('transaction_type', filters.transaction_type) as typeof query
    }
    if (filters.vendor_id) {
      query = query.eq('vendor_id', filters.vendor_id) as typeof query
    }
    if (filters.date_from) {
      query = query.gte('transaction_date', filters.date_from) as typeof query
    }
    if (filters.date_to) {
      query = query.lte('transaction_date', filters.date_to) as typeof query
    }

    query = query.order('transaction_date', { ascending: false }) as typeof query

    const { data: transactions, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      logger.error('Failed to list cost transactions', { error: error.message })
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(
      { ...paginatedResponse(transactions ?? [], count ?? 0, page, limit), requestId: ctx.requestId }
    )
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ── POST /api/v1/cost-transactions ──────────────────────────────────────

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

    const { data: txn, error } = await (supabase
      .from('cost_transactions')
      .insert({
        ...body,
        company_id: ctx.companyId!,
        created_by: ctx.user!.id,
        transaction_date: (body.transaction_date as string) || new Date().toISOString().split('T')[0],
      } as never)
      .select()
      .single() as unknown as Promise<{ data: CostTransaction | null; error: { message: string } | null }>)

    if (error || !txn) {
      logger.error('Failed to create cost transaction', { error: error?.message })
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('Cost transaction created', { txnId: txn.id, jobId: txn.job_id })

    return NextResponse.json({ data: txn, requestId: ctx.requestId }, { status: 201 })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'office'],
    schema: createCostTransactionSchema,
    permission: 'jobs:update:all',
    auditAction: 'cost_transaction.create',
  }
)
