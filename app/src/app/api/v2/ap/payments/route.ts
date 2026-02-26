/**
 * AP Payments — List & Create
 *
 * GET  /api/v2/ap/payments — List AP payments
 * POST /api/v2/ap/payments — Create AP payment with bill applications
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listPaymentsSchema, createPaymentSchema } from '@/lib/validation/schemas/accounting'

// ============================================================================
// GET /api/v2/ap/payments
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
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
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    let query = (supabase as any)
      .from('ap_payments')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.vendor_id) {
      query = query.eq('vendor_id', filters.vendor_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.start_date) {
      query = query.gte('payment_date', filters.start_date)
    }
    if (filters.end_date) {
      query = query.lte('payment_date', filters.end_date)
    }

    query = query.order('payment_date', { ascending: false })

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
  { requireAuth: true, rateLimit: 'financial' }
)

// ============================================================================
// POST /api/v2/ap/payments
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createPaymentSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid payment data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data

    // Validate total applications match payment amount
    const totalApplications = input.applications.reduce((sum, app) => sum + app.amount, 0)
    if (Math.abs(totalApplications - input.amount) > 0.01) {
      return NextResponse.json(
        { error: 'Validation Error', message: `Payment applications total (${totalApplications.toFixed(2)}) must equal payment amount (${input.amount.toFixed(2)})`, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create the payment
    const { data: payment, error: paymentError } = await (supabase as any)
      .from('ap_payments')
      .insert({
        company_id: ctx.companyId!,
        vendor_id: input.vendor_id,
        payment_date: input.payment_date,
        amount: input.amount,
        payment_method: input.payment_method,
        reference_number: input.reference_number ?? null,
        memo: input.memo ?? null,
        status: 'pending',
        created_by: ctx.user!.id,
      })
      .select('*')
      .single()

    if (paymentError) {
      return NextResponse.json(
        { error: 'Database Error', message: paymentError.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    // Create payment applications
    const appRecords = input.applications.map((app) => ({
      payment_id: payment.id,
      bill_id: app.bill_id,
      amount: app.amount,
    }))

    const { data: applications, error: appError } = await (supabase as any)
      .from('ap_payment_applications')
      .insert(appRecords)
      .select('*')

    if (appError) {
      return NextResponse.json(
        { error: 'Database Error', message: appError.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    // Update bill balance_due and status for each applied bill
    for (const app of input.applications) {
      // Get current bill
      const { data: bill } = await (supabase as any)
        .from('ap_bills')
        .select('balance_due, amount')
        .eq('id', app.bill_id)
        .single()

      if (bill) {
        const newBalance = Number(bill.balance_due) - app.amount
        const newStatus = newBalance <= 0.01 ? 'paid' : 'partially_paid'

        await (supabase as any)
          .from('ap_bills')
          .update({
            balance_due: Math.max(0, newBalance),
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', app.bill_id)
      }
    }

    return NextResponse.json({
      data: { ...payment, applications: applications ?? [] },
      requestId: ctx.requestId,
    }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'financial', auditAction: 'payment.create' }
)
