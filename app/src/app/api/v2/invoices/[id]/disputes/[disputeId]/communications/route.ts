/**
 * Dispute Communications API — List & Add Message
 *
 * GET  /api/v2/invoices/:id/disputes/:disputeId/communications — List messages
 * POST /api/v2/invoices/:id/disputes/:disputeId/communications — Add a message
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
// typedInsert removed — new tables not yet in generated Supabase types
import { addDisputeCommSchema } from '@/lib/validation/schemas/invoices'

// ============================================================================
// GET /api/v2/invoices/:id/disputes/:disputeId/communications
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

    // Verify dispute belongs to this invoice and company
    const { data: dispute, error: disputeError } = await (supabase as any).from('invoice_disputes')
      .select('id')
      .eq('id', disputeId)
      .eq('invoice_id', invoiceId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (disputeError || !dispute) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Dispute not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await (supabase as any).from('dispute_communications')
      .select('id, dispute_id, message, is_internal, sender_type, sender_id, attachments, created_at')
      .eq('dispute_id', disputeId)
      .order('created_at', { ascending: true })

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
// POST /api/v2/invoices/:id/disputes/:disputeId/communications
// ============================================================================

export const POST = createApiHandler(
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
    const parseResult = addDisputeCommSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid communication data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
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

    // Verify dispute belongs to this invoice and company
    const { data: dispute, error: disputeError } = await (supabase as any).from('invoice_disputes')
      .select('id')
      .eq('id', disputeId)
      .eq('invoice_id', invoiceId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (disputeError || !dispute) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Dispute not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await (supabase as any).from('dispute_communications')
      .insert({
        dispute_id: disputeId,
        message: input.message,
        is_internal: input.is_internal,
        sender_type: input.sender_type,
        sender_id: ctx.user!.id,
        attachments: input.attachments,
      } as any)
      .select('id, dispute_id, message, is_internal, sender_type, sender_id, attachments, created_at')
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
  { requireAuth: true, rateLimit: 'api' }
)
