/**
 * AP Payments API — List & Create
 *
 * GET  /api/v1/ap-payments — List AP payments for company (paginated, filterable)
 * POST /api/v1/ap-payments — Create a new AP payment with bill applications
 *
 * Note: AP payments have no deleted_at — they are voided via status change.
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
  listPaymentsSchema,
  createPaymentSchema,
} from '@/lib/validation/schemas/accounting'
import type { ApPayment, ApPaymentApplication } from '@/types/accounting'

// ============================================================================
// GET /api/v1/ap-payments — List AP payments for company
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const url = req.nextUrl
    const parseResult = listPaymentsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      vendor_id: url.searchParams.get('vendor_id') ?? undefined,
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
      .from('ap_payments')
      .select('*, vendors!left(id, name)', { count: 'exact' })
      .eq('company_id', ctx.companyId!) as unknown as {
        eq: (col: string, val: unknown) => typeof query
        gte: (col: string, val: string) => typeof query
        lte: (col: string, val: string) => typeof query
        order: (col: string, opts: { ascending: boolean }) => typeof query
        range: (from: number, to: number) => Promise<{ data: ApPayment[] | null; count: number | null; error: { message: string } | null }>
      }

    // Filters
    if (filters.vendor_id) {
      query = query.eq('vendor_id', filters.vendor_id) as typeof query
    }
    if (filters.status) {
      query = query.eq('status', filters.status) as typeof query
    }
    if (filters.start_date) {
      query = query.gte('payment_date', filters.start_date) as typeof query
    }
    if (filters.end_date) {
      query = query.lte('payment_date', filters.end_date) as typeof query
    }

    query = query.order('payment_date', { ascending: false }) as typeof query

    const { data: payments, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      logger.error('Failed to list AP payments', { error: error.message })
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(
      { ...paginatedResponse(payments ?? [], count ?? 0, page, limit), requestId: ctx.requestId }
    )
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ============================================================================
// POST /api/v1/ap-payments — Create AP payment + bill applications
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })
    const body = ctx.validatedBody as Record<string, unknown>

    // Extract applications array — inserted separately after the payment
    const { applications, ...paymentData } = body as {
      applications: { bill_id: string; amount: number }[]
      [key: string]: unknown
    }

    const supabase = await createClient()

    // Step 1 — Insert the payment record
    const { data: payment, error: paymentError } = await (supabase
      .from('ap_payments')
      .insert({
        ...paymentData,
        company_id: ctx.companyId!,
        created_by: ctx.user!.id,
        status: 'pending',
      } as never)
      .select()
      .single() as unknown as Promise<{ data: ApPayment | null; error: { message: string } | null }>)

    if (paymentError || !payment) {
      logger.error('Failed to create AP payment', { error: paymentError?.message })
      const mapped = mapDbError(paymentError ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Step 2 — Insert payment applications (link payment to bills)
    const applicationInserts = applications.map((app) => ({
      payment_id: payment.id,
      bill_id: app.bill_id,
      amount: app.amount,
    }))

    const { data: insertedApplications, error: appError } = await (supabase
      .from('ap_payment_applications')
      .insert(applicationInserts as never)
      .select() as unknown as Promise<{ data: ApPaymentApplication[] | null; error: { message: string } | null }>)

    if (appError) {
      logger.error('Failed to create AP payment applications', { error: appError.message, paymentId: payment.id })
      const mapped = mapDbError(appError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('AP payment created', {
      paymentId: payment.id,
      vendorId: payment.vendor_id,
      companyId: ctx.companyId!,
      applicationCount: insertedApplications?.length ?? 0,
    })

    return NextResponse.json(
      { data: { ...payment, applications: insertedApplications ?? [] }, requestId: ctx.requestId },
      { status: 201 }
    )
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'office'],
    schema: createPaymentSchema,
    permission: 'jobs:update:all',
    auditAction: 'ap_payment.create',
  }
)
