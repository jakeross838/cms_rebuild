/**
 * Invoice Dispute by ID — Get Detail, Update/Resolve
 *
 * GET   /api/v2/invoices/:id/disputes/:disputeId — Get dispute detail
 * PATCH /api/v2/invoices/:id/disputes/:disputeId — Update or resolve a dispute
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
// typedUpdate removed — new tables not yet in generated Supabase types
import { updateDisputeSchema } from '@/lib/validation/schemas/invoices'

// ============================================================================
// GET /api/v2/invoices/:id/disputes/:disputeId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const invoiceId = segments[4]
    const disputeId = segments[6]
    if (!invoiceId || !disputeId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing invoice ID or dispute ID', requestId: ctx.requestId },
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
      .eq('id', disputeId)
      .eq('invoice_id', invoiceId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Dispute not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PATCH /api/v2/invoices/:id/disputes/:disputeId
// ============================================================================

export const PATCH = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const invoiceId = segments[4]
    const disputeId = segments[6]
    if (!invoiceId || !disputeId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing invoice ID or dispute ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateDisputeSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid dispute update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
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

    const now = new Date().toISOString()
    const updates: Record<string, unknown> = { updated_at: now }

    for (const [key, val] of Object.entries(input)) {
      if (val !== undefined) updates[key] = val
    }

    // If status is a resolution status, record resolved_by and resolved_at
    const resolutionStatuses = ['resolved_adjusted', 'resolved_voided', 'resolved_credit_memo', 'resolved_as_is', 'closed']
    if (input.status && resolutionStatuses.includes(input.status)) {
      updates.resolved_by = ctx.user!.id
      updates.resolved_at = now
    }

    const { data, error } = await (supabase as any).from('invoice_disputes')
      .update(updates as any)
      .eq('id', disputeId)
      .eq('invoice_id', invoiceId)
      .eq('company_id', ctx.companyId!)
      .select('id, invoice_id, company_id, dispute_type, disputed_amount, reason_category, reason_description, status, resolution_notes, resolved_by, resolved_at, adjusted_amount, credit_memo_id, created_by, created_at, updated_at, deleted_at')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
