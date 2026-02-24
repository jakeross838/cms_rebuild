/**
 * Bid Comparison by ID — Get, Update, Delete
 *
 * GET    /api/v2/bid-packages/:id/comparisons/:compId
 * PUT    /api/v2/bid-packages/:id/comparisons/:compId
 * DELETE /api/v2/bid-packages/:id/comparisons/:compId
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateBidComparisonSchema } from '@/lib/validation/schemas/bid-management'

/**
 * Extract bid package ID and comparison ID from pathname
 */
function extractIds(pathname: string): { bidPackageId: string | null; compId: string | null } {
  const segments = pathname.split('/')
  const bpIdx = segments.indexOf('bid-packages')
  const compIdx = segments.indexOf('comparisons')
  return {
    bidPackageId: bpIdx !== -1 && bpIdx + 1 < segments.length ? segments[bpIdx + 1] : null,
    compId: compIdx !== -1 && compIdx + 1 < segments.length ? segments[compIdx + 1] : null,
  }
}

// ============================================================================
// GET /api/v2/bid-packages/:id/comparisons/:compId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { bidPackageId, compId } = extractIds(req.nextUrl.pathname)
    if (!bidPackageId || !compId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing bid package or comparison ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify bid package belongs to this company
    const { data: bp, error: bpError } = await (supabase
      .from('bid_packages') as any)
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

    const { data, error } = await (supabase
      .from('bid_comparisons') as any)
      .select('*')
      .eq('id', compId)
      .eq('bid_package_id', bidPackageId)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Bid comparison not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/bid-packages/:id/comparisons/:compId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { bidPackageId, compId } = extractIds(req.nextUrl.pathname)
    if (!bidPackageId || !compId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing bid package or comparison ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateBidComparisonSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify bid package belongs to this company
    const { data: bp, error: bpError } = await (supabase
      .from('bid_packages') as any)
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
    if (input.name !== undefined) updates.name = input.name
    if (input.comparison_data !== undefined) updates.comparison_data = input.comparison_data
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await (supabase
      .from('bid_comparisons') as any)
      .update(updates)
      .eq('id', compId)
      .eq('bid_package_id', bidPackageId)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Bid comparison not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/bid-packages/:id/comparisons/:compId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { bidPackageId, compId } = extractIds(req.nextUrl.pathname)
    if (!bidPackageId || !compId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing bid package or comparison ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify bid package belongs to this company
    const { data: bp, error: bpError } = await (supabase
      .from('bid_packages') as any)
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

    const { error } = await (supabase
      .from('bid_comparisons') as any)
      .delete()
      .eq('id', compId)
      .eq('bid_package_id', bidPackageId)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
