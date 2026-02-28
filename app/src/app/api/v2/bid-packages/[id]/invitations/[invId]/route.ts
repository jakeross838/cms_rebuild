/**
 * Bid Invitation by ID — Get, Update
 *
 * GET /api/v2/bid-packages/:id/invitations/:invId
 * PUT /api/v2/bid-packages/:id/invitations/:invId
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateBidInvitationSchema } from '@/lib/validation/schemas/bid-management'

/**
 * Extract bid package ID and invitation ID from pathname
 */
function extractIds(pathname: string): { bidPackageId: string | null; invId: string | null } {
  const segments = pathname.split('/')
  const bpIdx = segments.indexOf('bid-packages')
  const invIdx = segments.indexOf('invitations')
  return {
    bidPackageId: bpIdx !== -1 && bpIdx + 1 < segments.length ? segments[bpIdx + 1] : null,
    invId: invIdx !== -1 && invIdx + 1 < segments.length ? segments[invIdx + 1] : null,
  }
}

// ============================================================================
// GET /api/v2/bid-packages/:id/invitations/:invId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { bidPackageId, invId } = extractIds(req.nextUrl.pathname)
    if (!bidPackageId || !invId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing bid package or invitation ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify bid package belongs to this company
    const { data: bp, error: bpError } = await supabase
      .from('bid_packages')
      .select('id')
      .eq('id', bidPackageId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (bpError || !bp) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Bid package not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('bid_invitations')
      .select('*')
      .eq('id', invId)
      .eq('bid_package_id', bidPackageId)
      .eq('company_id', ctx.companyId!)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// PUT /api/v2/bid-packages/:id/invitations/:invId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { bidPackageId, invId } = extractIds(req.nextUrl.pathname)
    if (!bidPackageId || !invId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing bid package or invitation ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateBidInvitationSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify bid package belongs to this company
    const { data: bp, error: bpError } = await supabase
      .from('bid_packages')
      .select('id')
      .eq('id', bidPackageId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (bpError || !bp) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Bid package not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = {}
    if (input.status !== undefined) updates.status = input.status
    if (input.viewed_at !== undefined) updates.viewed_at = input.viewed_at
    if (input.responded_at !== undefined) updates.responded_at = input.responded_at
    if (input.decline_reason !== undefined) updates.decline_reason = input.decline_reason

    const { data, error } = await supabase
      .from('bid_invitations')
      .update(updates)
      .eq('id', invId)
      .eq('bid_package_id', bidPackageId)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'bid_package_invitation.update' }
)
