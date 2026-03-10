/**
 * Payment Prerequisite by ID — Toggle met/unmet
 *
 * PATCH /api/v2/invoices/:id/prerequisites/:prereqId — Toggle is_met status
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
// typedUpdate removed — new tables not yet in generated Supabase types
import { togglePaymentPrereqSchema } from '@/lib/validation/schemas/invoices'

// ============================================================================
// PATCH /api/v2/invoices/:id/prerequisites/:prereqId
// ============================================================================

export const PATCH = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const invoiceId = segments[4]
    const prereqId = segments[6]
    if (!invoiceId || !prereqId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing invoice ID or prerequisite ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = togglePaymentPrereqSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid prerequisite data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const { is_met } = parseResult.data
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
    const updates: Record<string, unknown> = {
      is_met,
      met_at: is_met ? now : null,
      met_by: is_met ? ctx.user!.id : null,
    }

    const { data, error } = await (supabase as any).from('payment_prerequisites')
      .update(updates as any)
      .eq('id', prereqId)
      .eq('invoice_id', invoiceId)
      .eq('company_id', ctx.companyId!)
      .select('id, company_id, invoice_id, prerequisite_type, label, is_met, met_at, met_by, notes, created_at')
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
