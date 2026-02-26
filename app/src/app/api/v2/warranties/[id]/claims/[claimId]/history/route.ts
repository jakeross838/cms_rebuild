/**
 * Warranty Claim History — List history for a claim
 *
 * GET /api/v2/warranties/:id/claims/:claimId/history
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listClaimHistorySchema } from '@/lib/validation/schemas/warranty'

/**
 * Extract warranty ID and claim ID from URL path
 */
function extractIds(pathname: string): { warrantyId: string | null; claimId: string | null } {
  const segments = pathname.split('/')
  const wIdx = segments.indexOf('warranties')
  const cIdx = segments.indexOf('claims')
  return {
    warrantyId: wIdx >= 0 && segments.length > wIdx + 1 ? segments[wIdx + 1] : null,
    claimId: cIdx >= 0 && segments.length > cIdx + 1 ? segments[cIdx + 1] : null,
  }
}

// ============================================================================
// GET /api/v2/warranties/:id/claims/:claimId/history
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { warrantyId, claimId } = extractIds(req.nextUrl.pathname)
    if (!warrantyId || !claimId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing warranty or claim ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listClaimHistorySchema.safeParse({
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

    // Verify claim belongs to specified warranty and company
    const { data: claim, error: claimError } = await supabase
      .from('warranty_claims')
      .select('id')
      .eq('id', claimId)
      .eq('warranty_id', warrantyId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (claimError || !claim) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Warranty claim not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, count, error } = await supabase
      .from('warranty_claim_history')
      .select('*', { count: 'exact' })
      .eq('claim_id', claimId)
      .eq('company_id', ctx.companyId!)
      .order('created_at', { ascending: false })
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)
