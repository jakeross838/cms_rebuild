/**
 * Invoice Disputes API — List & Create
 *
 * GET  /api/v2/invoices/:id/disputes — List disputes for an invoice
 * POST /api/v2/invoices/:id/disputes — Create a dispute (updates invoice status)
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
// typedInsert/typedUpdate removed — new tables not yet in generated Supabase types
import { createDisputeSchema } from '@/lib/validation/schemas/invoices'

// ============================================================================
// GET /api/v2/invoices/:id/disputes
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
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Invoice not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await (supabase as any).from('invoice_disputes')
      .select('id, invoice_id, company_id, dispute_type, disputed_amount, reason_category, reason_description, status, resolution_notes, resolved_by, resolved_at, adjusted_amount, credit_memo_id, created_by, created_at, updated_at, deleted_at')
      .eq('invoice_id', invoiceId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

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
// POST /api/v2/invoices/:id/disputes — Create a dispute
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
    const parseResult = createDisputeSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid dispute data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify invoice belongs to this company
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, status')
      .eq('id', invoiceId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Invoice not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await (supabase as any).from('invoice_disputes')
      .insert({
        invoice_id: invoiceId,
        company_id: ctx.companyId!,
        dispute_type: input.dispute_type,
        disputed_amount: input.disputed_amount,
        reason_category: input.reason_category,
        reason_description: input.reason_description,
        status: 'open',
        created_by: ctx.user!.id,
      } as any)
      .select('id, invoice_id, company_id, dispute_type, disputed_amount, reason_category, reason_description, status, resolution_notes, resolved_by, resolved_at, adjusted_amount, credit_memo_id, created_by, created_at, updated_at, deleted_at')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Update invoice notes to reflect dispute info
    const now = new Date().toISOString()
    const disputeNote = `[Dispute opened: ${input.reason_category} — $${input.disputed_amount.toFixed(2)}]`
    await supabase.from('invoices')
      .update({
        notes: disputeNote,
        updated_at: now,
      } as any)
      .eq('id', invoiceId)
      .eq('company_id', ctx.companyId!)

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
