/**
 * Submit Change Order — draft -> pending_approval
 *
 * POST /api/v2/change-orders/:id/submit
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { submitChangeOrderSchema } from '@/lib/validation/schemas/change-orders'

// ============================================================================
// POST /api/v2/change-orders/:id/submit
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2] // /change-orders/:id/submit
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing change order ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const parseResult = submitChangeOrderSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid submission data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify CO exists and is in draft status
    const { data: existing, error: existError } = await (supabase
      .from('change_orders') as any)
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

    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only draft change orders can be submitted', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const now = new Date().toISOString()
    const { data, error } = await (supabase
      .from('change_orders') as any)
      .update({
        status: 'pending_approval',
        updated_at: now,
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

    // Record history
    await (supabase
      .from('change_order_history') as any)
      .insert({
        change_order_id: id,
        action: 'submitted',
        previous_status: 'draft',
        new_status: 'pending_approval',
        details: parseResult.data.notes ? { notes: parseResult.data.notes } : {},
        performed_by: ctx.user!.id,
      })

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
