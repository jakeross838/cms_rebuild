/**
 * AP Bills API — List & Create
 *
 * GET  /api/v1/ap-bills — List AP bills for company (paginated, filterable)
 * POST /api/v1/ap-bills — Create a new AP bill (with optional line items)
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
import {
  listBillsSchema,
  createBillSchema,
} from '@/lib/validation/schemas/accounting'
import type { ApBill, ApBillLine } from '@/types/accounting'

// ============================================================================
// GET /api/v1/ap-bills — List AP bills for company
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const url = req.nextUrl
    const parseResult = listBillsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      vendor_id: url.searchParams.get('vendor_id') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      start_date: url.searchParams.get('start_date') ?? undefined,
      end_date: url.searchParams.get('end_date') ?? undefined,
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
      .from('ap_bills')
      .select('*, vendors!left(id, name)', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null) as unknown as {
        eq: (col: string, val: unknown) => typeof query
        is: (col: string, val: unknown) => typeof query
        gte: (col: string, val: string) => typeof query
        lte: (col: string, val: string) => typeof query
        or: (filter: string) => typeof query
        order: (col: string, opts: { ascending: boolean }) => typeof query
        range: (from: number, to: number) => Promise<{ data: ApBill[] | null; count: number | null; error: { message: string } | null }>
      }

    // Filters
    if (filters.vendor_id) {
      query = query.eq('vendor_id', filters.vendor_id) as typeof query
    }
    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id) as typeof query
    }
    if (filters.status) {
      query = query.eq('status', filters.status) as typeof query
    }
    if (filters.start_date) {
      query = query.gte('bill_date', filters.start_date) as typeof query
    }
    if (filters.end_date) {
      query = query.lte('bill_date', filters.end_date) as typeof query
    }
    if (filters.q) {
      query = query.or(`bill_number.ilike.${safeOrIlike(filters.q)},description.ilike.${safeOrIlike(filters.q)}`) as typeof query
    }

    query = query.order('bill_date', { ascending: false }) as typeof query

    const { data: bills, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      logger.error('Failed to list AP bills', { error: error.message })
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(
      { ...paginatedResponse(bills ?? [], count ?? 0, page, limit), requestId: ctx.requestId }
    )
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ============================================================================
// POST /api/v1/ap-bills — Create a new AP bill (with optional lines)
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })
    const body = ctx.validatedBody as Record<string, unknown>

    // Extract lines array — inserted separately after the bill header
    const { lines, ...billData } = body as { lines?: Record<string, unknown>[]; [key: string]: unknown }

    const supabase = await createClient()

    // Step 1 — Insert the bill header
    const { data: bill, error: billError } = await (supabase
      .from('ap_bills')
      .insert({
        ...billData,
        company_id: ctx.companyId!,
        created_by: ctx.user!.id,
        status: 'draft',
        balance_due: billData.amount,
      } as never)
      .select()
      .single() as unknown as Promise<{ data: ApBill | null; error: { message: string } | null }>)

    if (billError || !bill) {
      logger.error('Failed to create AP bill', { error: billError?.message })
      const mapped = mapDbError(billError ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Step 2 — Insert bill lines if provided
    let insertedLines: ApBillLine[] | null = null
    if (lines && lines.length > 0) {
      const lineInserts = lines.map((line) => ({
        ...line,
        bill_id: bill.id,
      }))

      const { data: newLines, error: linesError } = await (supabase
        .from('ap_bill_lines')
        .insert(lineInserts as never)
        .select() as unknown as Promise<{ data: ApBillLine[] | null; error: { message: string } | null }>)

      if (linesError) {
        logger.error('Failed to create AP bill lines', { error: linesError.message, billId: bill.id })
        const mapped = mapDbError(linesError)
        return NextResponse.json(
          { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
          { status: mapped.status }
        )
      }
      insertedLines = newLines
    }

    logger.info('AP bill created', { billId: bill.id, vendorId: bill.vendor_id, companyId: ctx.companyId! })

    return NextResponse.json(
      { data: insertedLines ? { ...bill, lines: insertedLines } : bill, requestId: ctx.requestId },
      { status: 201 }
    )
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'office'],
    schema: createBillSchema,
    permission: 'jobs:update:all',
    auditAction: 'ap_bill.create',
  }
)
