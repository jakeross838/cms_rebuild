/**
 * Bid Response by ID — Get, Update
 *
 * GET /api/v2/bid-packages/:id/responses/:respId
 * PUT /api/v2/bid-packages/:id/responses/:respId
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateBidResponseSchema } from '@/lib/validation/schemas/bid-management'

/**
 * Extract bid package ID and response ID from pathname
 */
function extractIds(pathname: string): { bidPackageId: string | null; respId: string | null } {
  const segments = pathname.split('/')
  const bpIdx = segments.indexOf('bid-packages')
  const respIdx = segments.indexOf('responses')
  return {
    bidPackageId: bpIdx !== -1 && bpIdx + 1 < segments.length ? segments[bpIdx + 1] : null,
    respId: respIdx !== -1 && respIdx + 1 < segments.length ? segments[respIdx + 1] : null,
  }
}

// ============================================================================
// GET /api/v2/bid-packages/:id/responses/:respId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { bidPackageId, respId } = extractIds(req.nextUrl.pathname)
    if (!bidPackageId || !respId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing bid package or response ID', requestId: ctx.requestId },
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
      .from('bid_responses')
      .select('*')
      .eq('id', respId)
      .eq('bid_package_id', bidPackageId)
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
// PUT /api/v2/bid-packages/:id/responses/:respId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { bidPackageId, respId } = extractIds(req.nextUrl.pathname)
    if (!bidPackageId || !respId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing bid package or response ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateBidResponseSchema.safeParse(body)

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
    if (input.total_amount !== undefined) updates.total_amount = input.total_amount
    if (input.breakdown !== undefined) updates.breakdown = input.breakdown
    if (input.notes !== undefined) updates.notes = input.notes
    if (input.attachments !== undefined) updates.attachments = input.attachments
    if (input.is_qualified !== undefined) updates.is_qualified = input.is_qualified

    const { data, error } = await supabase
      .from('bid_responses')
      .update(updates)
      .eq('id', respId)
      .eq('bid_package_id', bidPackageId)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'bid_package_response.update' }
)
