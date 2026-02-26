/**
 * Bid Responses API — List & Create
 *
 * GET  /api/v2/bid-packages/:id/responses — List responses for a bid package
 * POST /api/v2/bid-packages/:id/responses — Submit a bid response
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
import { listBidResponsesSchema, createBidResponseSchema } from '@/lib/validation/schemas/bid-management'

/**
 * Extract bid package ID from /api/v2/bid-packages/:id/responses
 */
function extractBidPackageId(pathname: string): string | null {
  const segments = pathname.split('/')
  const idx = segments.indexOf('bid-packages')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v2/bid-packages/:id/responses
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
    const parseResult = listBidResponsesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    // Verify bid package belongs to this company
    const { data: bp, error: bpError } = await (supabase as any)
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

    const { data, count, error } = await (supabase as any)
      .from('bid_responses')
      .select('*', { count: 'exact' })
      .eq('bid_package_id', bidPackageId)
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1)

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
// POST /api/v2/bid-packages/:id/responses — Submit bid response
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
    const parseResult = createBidResponseSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid bid response data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify bid package exists and is published or closed (accepting late bids)
    const { data: bp, error: bpError } = await (supabase as any)
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

    if (bp.status !== 'published' && bp.status !== 'closed') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Responses can only be submitted to published or closed bid packages', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const { data, error } = await (supabase as any)
      .from('bid_responses')
      .insert({
        company_id: ctx.companyId!,
        bid_package_id: bidPackageId,
        vendor_id: input.vendor_id,
        invitation_id: input.invitation_id ?? null,
        total_amount: input.total_amount,
        breakdown: input.breakdown,
        notes: input.notes ?? null,
        attachments: input.attachments,
        submitted_at: new Date().toISOString(),
        is_qualified: input.is_qualified,
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

    // Update invitation status to 'submitted' if invitation_id was provided
    if (input.invitation_id) {
      await (supabase as any)
        .from('bid_invitations')
        .update({
          status: 'submitted',
          responded_at: new Date().toISOString(),
        })
        .eq('id', input.invitation_id)
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
