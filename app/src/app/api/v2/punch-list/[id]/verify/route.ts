/**
 * Verify Punch Item — Mark as verified
 *
 * POST /api/v2/punch-list/:id/verify
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { verifyPunchItemSchema } from '@/lib/validation/schemas/punch-list'

// ============================================================================
// POST /api/v2/punch-list/:id/verify
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2] // /punch-list/:id/verify
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing punch item ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = verifyPunchItemSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify punch item exists and is completed
    const { data: existing, error: existError } = await supabase
      .from('punch_items')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Punch item not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'completed') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Only completed punch items can be verified', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('punch_items')
      .update({
        status: 'verified',
        verified_by: ctx.user!.id,
        verified_at: now,
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'] }
)
