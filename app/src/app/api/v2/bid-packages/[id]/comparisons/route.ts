/**
 * Bid Comparisons API — List & Create
 *
 * GET  /api/v2/bid-packages/:id/comparisons — List comparisons for a bid package
 * POST /api/v2/bid-packages/:id/comparisons — Create a bid comparison
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listBidComparisonsSchema, createBidComparisonSchema } from '@/lib/validation/schemas/bid-management'

/**
 * Extract bid package ID from /api/v2/bid-packages/:id/comparisons
 */
function extractBidPackageId(pathname: string): string | null {
  const segments = pathname.split('/')
  const idx = segments.indexOf('bid-packages')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v2/bid-packages/:id/comparisons
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
    const parseResult = listBidComparisonsSchema.safeParse({
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
      .from('bid_comparisons')
      .select('*', { count: 'exact' })
      .eq('bid_package_id', bidPackageId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/bid-packages/:id/comparisons — Create comparison
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
    const parseResult = createBidComparisonSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid comparison data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify bid package exists and belongs to this company
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

    const { data, error } = await (supabase as any)
      .from('bid_comparisons')
      .insert({
        company_id: ctx.companyId!,
        bid_package_id: bidPackageId,
        name: input.name,
        comparison_data: input.comparison_data,
        notes: input.notes ?? null,
        created_by: ctx.user!.id,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
