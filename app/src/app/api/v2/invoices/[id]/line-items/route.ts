/**
 * Invoice Line Items API — List & Create
 *
 * GET  /api/v2/invoices/:id/line-items — List line items for an invoice
 * POST /api/v2/invoices/:id/line-items — Create a new line item
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
// typedInsert removed — new tables not yet in generated Supabase types
import { createLineItemSchema } from '@/lib/validation/schemas/invoices'

// ============================================================================
// GET /api/v2/invoices/:id/line-items
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

    const { data, error } = await (supabase as any).from('invoice_line_items')
      .select('id, invoice_id, description, quantity, unit, unit_price, amount, cost_code_id, cost_code_label, phase, job_id, po_line_id, sort_order, created_at, updated_at, cost_codes(code, name)')
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
// POST /api/v2/invoices/:id/line-items
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
    const parseResult = createLineItemSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid line item data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
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

    const { data, error } = await (supabase as any).from('invoice_line_items')
      .insert({
        invoice_id: invoiceId,
        description: input.description,
        quantity: input.quantity,
        unit: input.unit,
        unit_price: input.unit_price,
        amount: input.amount,
        cost_code_id: input.cost_code_id ?? null,
        cost_code_label: input.cost_code_label ?? null,
        phase: input.phase ?? null,
        job_id: input.job_id ?? null,
        po_line_id: input.po_line_id ?? null,
        sort_order: input.sort_order ?? 0,
      } as any)
      .select('id, invoice_id, description, quantity, unit, unit_price, amount, cost_code_id, cost_code_label, phase, job_id, po_line_id, sort_order, created_at, updated_at')
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
