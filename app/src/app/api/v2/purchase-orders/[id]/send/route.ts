/**
 * Send Purchase Order
 *
 * POST /api/v2/purchase-orders/:id/send — Mark PO as sent to vendor
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { sendPurchaseOrderSchema } from '@/lib/validation/schemas/purchase-orders'

/**
 * Extract PO ID from a path like /api/v2/purchase-orders/:id/send
 */
function extractPoId(pathname: string): string | null {
  const segments = pathname.split('/')
  const poIdx = segments.indexOf('purchase-orders')
  if (poIdx === -1 || poIdx + 1 >= segments.length) return null
  return segments[poIdx + 1]
}

// ============================================================================
// POST /api/v2/purchase-orders/:id/send
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = extractPoId(req.nextUrl.pathname)
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing purchase order ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = sendPurchaseOrderSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid send data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify PO exists and is in approved status
    const { data: po, error: poError } = await (supabase as any)
      .from('purchase_orders')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (poError || !po) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Purchase order not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (po.status !== 'approved') {
      return NextResponse.json(
        { error: 'Conflict', message: `Cannot send a purchase order with status "${po.status}". PO must be approved first.`, requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { data, error } = await (supabase as any)
      .from('purchase_orders')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
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
