/**
 * Invoice Line Item by ID — Get, Update, Delete
 *
 * GET    /api/v2/invoices/:id/line-items/:lineId — Get a line item
 * PATCH  /api/v2/invoices/:id/line-items/:lineId — Update a line item
 * DELETE /api/v2/invoices/:id/line-items/:lineId — Delete a line item
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
// typedUpdate removed — new tables not yet in generated Supabase types
import { updateLineItemSchema } from '@/lib/validation/schemas/invoices'

// ============================================================================
// GET /api/v2/invoices/:id/line-items/:lineId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const invoiceId = segments[4]
    const lineId = segments[6]
    if (!invoiceId || !lineId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing invoice ID or line item ID', requestId: ctx.requestId },
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

    const { data, error } = await (supabase as any).from('invoice_line_items')
      .select('id, invoice_id, description, quantity, unit, unit_price, amount, cost_code_id, cost_code_label, phase, job_id, po_line_id, sort_order, created_at, updated_at, cost_codes(code, name)')
      .eq('id', lineId)
      .eq('invoice_id', invoiceId)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Line item not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PATCH /api/v2/invoices/:id/line-items/:lineId
// ============================================================================

export const PATCH = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const invoiceId = segments[4]
    const lineId = segments[6]
    if (!invoiceId || !lineId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing invoice ID or line item ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateLineItemSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
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
      .is('deleted_at', null)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Invoice not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const [key, val] of Object.entries(input)) {
      if (val !== undefined) updates[key] = val
    }

    const { data, error } = await (supabase as any).from('invoice_line_items')
      .update(updates as any)
      .eq('id', lineId)
      .eq('invoice_id', invoiceId)
      .select('id, invoice_id, description, quantity, unit, unit_price, amount, cost_code_id, cost_code_label, phase, job_id, po_line_id, sort_order, created_at, updated_at')
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

// ============================================================================
// DELETE /api/v2/invoices/:id/line-items/:lineId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const invoiceId = segments[4]
    const lineId = segments[6]
    if (!invoiceId || !lineId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing invoice ID or line item ID', requestId: ctx.requestId },
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

    const { error } = await (supabase as any).from('invoice_line_items')
      .delete()
      .eq('id', lineId)
      .eq('invoice_id', invoiceId)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
