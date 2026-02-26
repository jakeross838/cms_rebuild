/**
 * Approve Lien Waiver — received -> approved
 *
 * POST /api/v2/lien-waivers/:id/approve
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

// ============================================================================
// POST /api/v2/lien-waivers/:id/approve
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2] // /lien-waivers/:id/approve
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing lien waiver ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify waiver exists and is in received status
    const { data: existing, error: existError } = await supabase
      .from('lien_waivers')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Lien waiver not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'received') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only received waivers can be approved', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('lien_waivers')
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
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, requiredRoles: ['owner', 'admin', 'pm', 'office'], rateLimit: 'financial', auditAction: 'lien_waiver.approve' }
)
