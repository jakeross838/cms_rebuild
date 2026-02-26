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
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listClaimHistorySchema } from '@/lib/validation/schemas/warranty'

/**
 * Extract claim ID from /api/v2/warranties/:id/claims/:claimId/history
 */
function extractClaimId(pathname: string): string | null {
  const segments = pathname.split('/')
  const cIdx = segments.indexOf('claims')
  if (cIdx === -1 || cIdx + 1 >= segments.length) return null
  return segments[cIdx + 1]
}

// ============================================================================
// GET /api/v2/warranties/:id/claims/:claimId/history
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const claimId = extractClaimId(req.nextUrl.pathname)
    if (!claimId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing claim ID', requestId: ctx.requestId },
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

    // Verify claim belongs to company
    const { data: claim, error: claimError } = await (supabase as any)
      .from('warranty_claims')
      .select('id')
      .eq('id', claimId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (claimError || !claim) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Warranty claim not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, count, error } = await (supabase as any)
      .from('warranty_claim_history')
      .select('*', { count: 'exact' })
      .eq('claim_id', claimId)
      .eq('company_id', ctx.companyId!)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api' }
)
