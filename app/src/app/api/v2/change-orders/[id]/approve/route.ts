/**
 * Approve Change Order — pending_approval -> approved
 *
 * POST /api/v2/change-orders/:id/approve
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { approveChangeOrderSchema } from '@/lib/validation/schemas/change-orders'

// ============================================================================
// POST /api/v2/change-orders/:id/approve
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2] // /change-orders/:id/approve
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing change order ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const parseResult = approveChangeOrderSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid approval data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify CO exists and is in pending_approval status
    const { data: existing, error: existError } = await (supabase as any)
      .from('change_orders')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Change order not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'pending_approval') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only pending change orders can be approved', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const now = new Date().toISOString()
    const updateData: Record<string, unknown> = {
      status: 'approved',
      approved_by: ctx.user!.id,
      approved_at: now,
      updated_at: now,
    }

    // Optionally record client approval at the same time
    if (parseResult.data.client_approved) {
      updateData.client_approved = true
      updateData.client_approved_at = now
    }

    const { data, error } = await (supabase as any)
      .from('change_orders')
      .update(updateData)
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

    // Record history
    await (supabase as any)
      .from('change_order_history')
      .insert({
        change_order_id: id,
        action: 'approved',
        previous_status: 'pending_approval',
        new_status: 'approved',
        details: parseResult.data.notes ? { notes: parseResult.data.notes } : {},
        performed_by: ctx.user!.id,
      })

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
