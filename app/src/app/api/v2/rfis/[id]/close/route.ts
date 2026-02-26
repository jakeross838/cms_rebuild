/**
 * Close RFI — answered -> closed
 *
 * POST /api/v2/rfis/:id/close
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { closeRfiSchema } from '@/lib/validation/schemas/rfi-management'

// ============================================================================
// POST /api/v2/rfis/:id/close
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2] // /rfis/:id/close
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing RFI ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = closeRfiSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify RFI exists and is in answered status
    const { data: existing, error: existError } = await (supabase as any)
      .from('rfis')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'RFI not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'answered') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only answered RFIs can be closed', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const now = new Date().toISOString()
    const { data, error } = await (supabase as any)
      .from('rfis')
      .update({
        status: 'closed',
        closed_at: now,
        closed_by: ctx.user!.id,
        updated_at: now,
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
