/**
 * Vendor Score by Vendor ID — Get & Update
 *
 * GET /api/v2/vendor-performance/scores/:vendorId — Get vendor score
 * PUT /api/v2/vendor-performance/scores/:vendorId — Update vendor score
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateVendorScoreSchema } from '@/lib/validation/schemas/vendor-performance'

/**
 * Extract vendorId from /api/v2/vendor-performance/scores/:vendorId
 */
function extractVendorId(pathname: string): string | null {
  const segments = pathname.split('/')
  const scoresIdx = segments.indexOf('scores')
  if (scoresIdx === -1 || scoresIdx + 1 >= segments.length) return null
  const candidate = segments[scoresIdx + 1]
  // Make sure it's not a sub-route like "history"
  if (candidate === 'history') return null
  return candidate
}

// ============================================================================
// GET /api/v2/vendor-performance/scores/:vendorId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const vendorId = extractVendorId(req.nextUrl.pathname)
    if (!vendorId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing vendor ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('vendor_scores')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Vendor score not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/vendor-performance/scores/:vendorId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const vendorId = extractVendorId(req.nextUrl.pathname)
    if (!vendorId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing vendor ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateVendorScoreSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify score exists
    const { data: existing, error: existError } = await supabase
      .from('vendor_scores')
      .select('id')
      .eq('vendor_id', vendorId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Vendor score not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Build partial update
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.quality_score !== undefined) updates.quality_score = input.quality_score
    if (input.timeliness_score !== undefined) updates.timeliness_score = input.timeliness_score
    if (input.communication_score !== undefined) updates.communication_score = input.communication_score
    if (input.budget_adherence_score !== undefined) updates.budget_adherence_score = input.budget_adherence_score
    if (input.safety_score !== undefined) updates.safety_score = input.safety_score
    if (input.overall_score !== undefined) updates.overall_score = input.overall_score
    if (input.data_point_count !== undefined) updates.data_point_count = input.data_point_count
    if (input.calculation_window_months !== undefined) updates.calculation_window_months = input.calculation_window_months
    if (input.manual_adjustment !== undefined) updates.manual_adjustment = input.manual_adjustment
    if (input.manual_adjustment_reason !== undefined) updates.manual_adjustment_reason = input.manual_adjustment_reason

    const { data, error } = await supabase
      .from('vendor_scores')
      .update(updates)
      .eq('vendor_id', vendorId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
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
  { requireAuth: true, rateLimit: 'api' }
)
