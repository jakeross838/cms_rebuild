/**
 * AR Receipts — List & Create
 *
 * GET  /api/v2/ar/receipts — List AR receipts
 * POST /api/v2/ar/receipts — Create AR receipt with invoice applications
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
import { listReceiptsSchema, createReceiptSchema } from '@/lib/validation/schemas/accounting'

// ============================================================================
// GET /api/v2/ar/receipts
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
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
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    let query = supabase
      .from('ar_receipts')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.client_id) {
      query = query.eq('client_id', filters.client_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.start_date) {
      query = query.gte('receipt_date', filters.start_date)
    }
    if (filters.end_date) {
      query = query.lte('receipt_date', filters.end_date)
    }

    query = query.order('receipt_date', { ascending: false })

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
// POST /api/v2/ar/receipts
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createReceiptSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid receipt data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data

    // Validate total applications match receipt amount
    const totalApplications = input.applications.reduce((sum, app) => sum + app.amount, 0)
    if (Math.abs(totalApplications - input.amount) > 0.01) {
      return NextResponse.json(
        { error: 'Validation Error', message: `Receipt applications total (${totalApplications.toFixed(2)}) must equal receipt amount (${input.amount.toFixed(2)})`, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create the receipt
    const { data: receipt, error: receiptError } = await supabase
      .from('ar_receipts')
      .insert({
        company_id: ctx.companyId!,
        client_id: input.client_id,
        receipt_date: input.receipt_date,
        amount: input.amount,
        payment_method: input.payment_method,
        reference_number: input.reference_number ?? null,
        memo: input.memo ?? null,
        status: 'pending',
        created_by: ctx.user!.id,
      })
      .select('*')
      .single()

    if (receiptError) {
      return NextResponse.json(
        { error: 'Database Error', message: receiptError.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    // Create receipt applications
    const appRecords = input.applications.map((app) => ({
      receipt_id: receipt.id,
      invoice_id: app.invoice_id,
      amount: app.amount,
    }))

    const { data: applications, error: appError } = await supabase
      .from('ar_receipt_applications')
      .insert(appRecords)
      .select('*')

    if (appError) {
      return NextResponse.json(
        { error: 'Database Error', message: appError.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    // Update invoice balance_due and status for each applied invoice
    for (const app of input.applications) {
      // Get current invoice
      const { data: invoice } = await supabase
        .from('ar_invoices')
        .select('balance_due, amount')
        .eq('id', app.invoice_id)
        .eq('company_id', ctx.companyId!)
        .single()

      if (invoice) {
        const newBalance = Number(invoice.balance_due) - app.amount
        const newStatus = newBalance <= 0.01 ? 'paid' : 'partially_paid'

        await supabase
          .from('ar_invoices')
          .update({
            balance_due: Math.max(0, newBalance),
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', app.invoice_id)
          .eq('company_id', ctx.companyId!)
      }
    }

    return NextResponse.json({
      data: { ...receipt, applications: applications ?? [] },
      requestId: ctx.requestId,
    }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'financial', auditAction: 'receipt.create' }
)
