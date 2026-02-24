/**
 * Bid Award API — Get & Create
 *
 * GET  /api/v2/bid-packages/:id/award — Get award for a bid package
 * POST /api/v2/bid-packages/:id/award — Create award decision
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { createBidAwardSchema } from '@/lib/validation/schemas/bid-management'

/**
 * Extract bid package ID from /api/v2/bid-packages/:id/award
 */
function extractBidPackageId(pathname: string): string | null {
  const segments = pathname.split('/')
  const idx = segments.indexOf('bid-packages')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v2/bid-packages/:id/award
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
      .from('bid_awards') as any)
      .select('*')
      .eq('bid_package_id', bidPackageId)
      .order('awarded_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data ?? [], requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/bid-packages/:id/award — Create award decision
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
    const parseResult = createBidAwardSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid award data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify bid package exists and is closed
    const { data: bp, error: bpError } = await (supabase
      .from('bid_packages') as any)
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

    if (bp.status !== 'closed') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Awards can only be made on closed bid packages', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { data, error } = await (supabase
      .from('bid_awards') as any)
      .insert({
        company_id: ctx.companyId!,
        bid_package_id: bidPackageId,
        vendor_id: input.vendor_id,
        bid_response_id: input.bid_response_id ?? null,
        award_amount: input.award_amount,
        notes: input.notes ?? null,
        awarded_by: ctx.user!.id,
        awarded_at: new Date().toISOString(),
        status: input.status,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    // Update bid package status to awarded
    await (supabase
      .from('bid_packages') as any)
      .update({ status: 'awarded' })
      .eq('id', bidPackageId)
      .eq('company_id', ctx.companyId!)

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
