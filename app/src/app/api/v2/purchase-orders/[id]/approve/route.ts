/**
 * Approve Purchase Order
 *
 * POST /api/v2/purchase-orders/:id/approve — Approve a pending PO
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { approvePurchaseOrderSchema } from '@/lib/validation/schemas/purchase-orders'

/**
 * Extract PO ID from a path like /api/v2/purchase-orders/:id/approve
 */
function extractPoId(pathname: string): string | null {
  const segments = pathname.split('/')
  const poIdx = segments.indexOf('purchase-orders')
  if (poIdx === -1 || poIdx + 1 >= segments.length) return null
  return segments[poIdx + 1]
}

// ============================================================================
// POST /api/v2/purchase-orders/:id/approve
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
    const parseResult = approvePurchaseOrderSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid approval data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify PO exists and is in pending_approval or draft status
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

    if (po.status !== 'draft' && po.status !== 'pending_approval') {
      return NextResponse.json(
        { error: 'Conflict', message: `Cannot approve a purchase order with status "${po.status}"`, requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { data, error } = await (supabase as any)
      .from('purchase_orders')
      .update({
        status: 'approved',
        approved_by: ctx.user!.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
