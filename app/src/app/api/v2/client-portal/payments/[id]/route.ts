/**
 * Client Payment API — GET single
 *
 * GET /api/v2/client-portal/payments/:id — Get single payment
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

// ============================================================================
// GET /api/v2/client-portal/payments/:id
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const urlParts = req.nextUrl.pathname.split('/')
    const paymentId = urlParts[urlParts.length - 1]

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('client_payments')
      .select('*')
      .eq('id', paymentId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Payment not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
