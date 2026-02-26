/**
 * Bid Invitations API — List & Create
 *
 * GET  /api/v2/bid-packages/:id/invitations — List invitations for a bid package
 * POST /api/v2/bid-packages/:id/invitations — Invite a vendor to bid
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listBidInvitationsSchema, createBidInvitationSchema } from '@/lib/validation/schemas/bid-management'

/**
 * Extract bid package ID from /api/v2/bid-packages/:id/invitations
 */
function extractBidPackageId(pathname: string): string | null {
  const segments = pathname.split('/')
  const idx = segments.indexOf('bid-packages')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v2/bid-packages/:id/invitations
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const bidPackageId = extractBidPackageId(req.nextUrl.pathname)
    if (!bidPackageId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing bid package ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listBidInvitationsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)
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

    let query = supabase
      .from('bid_invitations')
      .select('*', { count: 'exact' })
      .eq('bid_package_id', bidPackageId)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    query = query.order('invited_at', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/bid-packages/:id/invitations — Invite vendor
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const bidPackageId = extractBidPackageId(req.nextUrl.pathname)
    if (!bidPackageId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing bid package ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createBidInvitationSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid invitation data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify bid package exists and is draft or published
    const { data: bp, error: bpError } = await supabase
      .from('bid_packages')
      .select('id, status')
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

    if (bp.status !== 'draft' && bp.status !== 'published') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Invitations can only be added to draft or published bid packages', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const { data, error } = await supabase
      .from('bid_invitations')
      .insert({
        company_id: ctx.companyId!,
        bid_package_id: bidPackageId,
        vendor_id: input.vendor_id,
        status: 'invited',
        invited_at: new Date().toISOString(),
      })
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
