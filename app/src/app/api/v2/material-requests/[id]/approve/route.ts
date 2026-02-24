/**
 * Approve Material Request — submitted -> approved
 *
 * POST /api/v2/material-requests/:id/approve
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

// ============================================================================
// POST /api/v2/material-requests/:id/approve
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2] // /material-requests/:id/approve
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing request ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify request exists and is in submitted status
    const { data: existing, error: existError } = await (supabase
      .from('material_requests') as any)
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Material request not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'submitted') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only submitted requests can be approved', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const now = new Date().toISOString()
    const { data, error } = await (supabase
      .from('material_requests') as any)
      .update({
        status: 'approved',
        approved_by: ctx.user!.id,
        approved_at: now,
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

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
