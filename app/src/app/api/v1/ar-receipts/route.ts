/**
 * AR Receipts API — List & Create
 *
 * GET  /api/v1/ar-receipts — List AR receipts for company (paginated, filterable)
 * POST /api/v1/ar-receipts — Create a new AR receipt with invoice applications
 *
 * Note: AR receipts have no deleted_at — they are voided via status change.
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
  listReceiptsSchema,
  createReceiptSchema,
} from '@/lib/validation/schemas/accounting'
import type { ArReceipt, ArReceiptApplication } from '@/types/accounting'

// ============================================================================
// GET /api/v1/ar-receipts — List AR receipts for company
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const url = req.nextUrl
    const parseResult = listReceiptsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      client_id: url.searchParams.get('client_id') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      start_date: url.searchParams.get('start_date') ?? undefined,
      end_date: url.searchParams.get('end_date') ?? undefined,
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
      .from('ar_receipts')
      .select('*, clients!left(id, name)', { count: 'exact' })
      .eq('company_id', ctx.companyId!) as unknown as {
        eq: (col: string, val: unknown) => typeof query
        gte: (col: string, val: string) => typeof query
        lte: (col: string, val: string) => typeof query
        order: (col: string, opts: { ascending: boolean }) => typeof query
        range: (from: number, to: number) => Promise<{ data: ArReceipt[] | null; count: number | null; error: { message: string } | null }>
      }

    // Filters
    if (filters.client_id) {
      query = query.eq('client_id', filters.client_id) as typeof query
    }
    if (filters.status) {
      query = query.eq('status', filters.status) as typeof query
    }
    if (filters.start_date) {
      query = query.gte('receipt_date', filters.start_date) as typeof query
    }
    if (filters.end_date) {
      query = query.lte('receipt_date', filters.end_date) as typeof query
    }

    query = query.order('receipt_date', { ascending: false }) as typeof query

    const { data: receipts, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      logger.error('Failed to list AR receipts', { error: error.message })
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(
      { ...paginatedResponse(receipts ?? [], count ?? 0, page, limit), requestId: ctx.requestId }
    )
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ============================================================================
// POST /api/v1/ar-receipts — Create AR receipt + invoice applications
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })
    const body = ctx.validatedBody as Record<string, unknown>

    // Extract applications array — inserted separately after the receipt
    const { applications, ...receiptData } = body as {
      applications: { invoice_id: string; amount: number }[]
      [key: string]: unknown
    }

    const supabase = await createClient()

    // Step 1 — Insert the receipt record
    const { data: receipt, error: receiptError } = await (supabase
      .from('ar_receipts')
      .insert({
        ...receiptData,
        company_id: ctx.companyId!,
        created_by: ctx.user!.id,
        status: 'pending',
      } as never)
      .select()
      .single() as unknown as Promise<{ data: ArReceipt | null; error: { message: string } | null }>)

    if (receiptError || !receipt) {
      logger.error('Failed to create AR receipt', { error: receiptError?.message })
      const mapped = mapDbError(receiptError ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Step 2 — Insert receipt applications (link receipt to invoices)
    const applicationInserts = applications.map((app) => ({
      receipt_id: receipt.id,
      invoice_id: app.invoice_id,
      amount: app.amount,
    }))

    const { data: insertedApplications, error: appError } = await (supabase
      .from('ar_receipt_applications')
      .insert(applicationInserts as never)
      .select() as unknown as Promise<{ data: ArReceiptApplication[] | null; error: { message: string } | null }>)

    if (appError) {
      logger.error('Failed to create AR receipt applications', { error: appError.message, receiptId: receipt.id })
      const mapped = mapDbError(appError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('AR receipt created', {
      receiptId: receipt.id,
      clientId: receipt.client_id,
      companyId: ctx.companyId!,
      applicationCount: insertedApplications?.length ?? 0,
    })

    return NextResponse.json(
      { data: { ...receipt, applications: insertedApplications ?? [] }, requestId: ctx.requestId },
      { status: 201 }
    )
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'office'],
    schema: createReceiptSchema,
    permission: 'jobs:update:all',
    auditAction: 'ar_receipt.create',
  }
)
