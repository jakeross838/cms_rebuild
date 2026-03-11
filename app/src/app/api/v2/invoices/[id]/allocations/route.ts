/**
 * Invoice Allocations API — List & Idempotent Save
 *
 * GET  /api/v2/invoices/:id/allocations — List allocations for an invoice
 * POST /api/v2/invoices/:id/allocations — Idempotent save (delete all, insert new)
 *
 * POST is idempotent: deletes all existing allocations for the invoice,
 * then inserts the new set. Validates that allocation amounts sum to
 * the invoice amount (within $0.01 tolerance).
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
// typedInsertMany removed — new tables not yet in generated Supabase types
import { saveAllocationsSchema } from '@/lib/validation/schemas/invoices'

// ============================================================================
// GET /api/v2/invoices/:id/allocations
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const invoiceId = segments[4]
    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing invoice ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify invoice belongs to this company
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id')
      .eq('id', invoiceId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Invoice not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await (supabase as any).from('invoice_allocations')
      .select('id, invoice_id, job_id, cost_code_id, phase, amount, percent, po_id, change_order_id, description, sort_order, created_at, updated_at')
      .eq('invoice_id', invoiceId)
      .order('sort_order', { ascending: true })

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: data ?? [], requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/invoices/:id/allocations — Idempotent save
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const invoiceId = segments[4]
    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing invoice ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = saveAllocationsSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid allocations data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const { allocations } = parseResult.data
    const supabase = await createClient()

    // Verify invoice belongs to this company and get the amount
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, amount')
      .eq('id', invoiceId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Invoice not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Validate that allocations sum equals invoice amount (within $0.01 tolerance)
    const allocationSum = allocations.reduce((sum, a) => sum + a.amount, 0)
    const invoiceAmount = Number(invoice.amount)
    if (Math.abs(allocationSum - invoiceAmount) > 0.01) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: `Allocation amounts sum ($${allocationSum.toFixed(2)}) must equal invoice amount ($${invoiceAmount.toFixed(2)}) within $0.01 tolerance`,
          requestId: ctx.requestId,
        },
        { status: 400 }
      )
    }

    // Delete all existing allocations for this invoice
    const { error: deleteError } = await (supabase as any).from('invoice_allocations')
      .delete()
      .eq('invoice_id', invoiceId)

    if (deleteError) {
      const mapped = mapDbError(deleteError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Insert new allocations
    const rows = allocations.map((a, idx) => ({
      invoice_id: invoiceId,
      job_id: a.job_id ?? null,
      cost_code_id: a.cost_code_id ?? null,
      phase: a.phase ?? null,
      amount: a.amount,
      percent: a.percent ?? null,
      po_id: a.po_id ?? null,
      change_order_id: a.change_order_id ?? null,
      description: a.description ?? null,
      sort_order: a.sort_order ?? idx,
    }))

    const { data, error } = await (supabase as any).from('invoice_allocations')
      .insert(rows as any)
      .select('id, invoice_id, job_id, cost_code_id, phase, amount, percent, po_id, change_order_id, description, sort_order, created_at, updated_at')

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: data ?? [], requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
