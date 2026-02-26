/**
 * Vendor Ratings — List & Create
 *
 * GET  /api/v2/vendors/:id/ratings — List ratings for a vendor
 * POST /api/v2/vendors/:id/ratings — Create a new rating
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import {
  listVendorRatingsSchema,
  createVendorRatingSchema,
} from '@/lib/validation/schemas/vendor-management'

/**
 * Extract vendor ID from pathname like /api/v2/vendors/:id/ratings
 */
function getVendorId(pathname: string): string | null {
  const segments = pathname.split('/')
  const vendorsIdx = segments.indexOf('vendors')
  if (vendorsIdx === -1 || vendorsIdx + 1 >= segments.length) return null
  return segments[vendorsIdx + 1]
}

// ============================================================================
// GET /api/v2/vendors/:id/ratings
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const vendorId = getVendorId(req.nextUrl.pathname)
    if (!vendorId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing vendor ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listVendorRatingsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      category: url.searchParams.get('category') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
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

    let query = supabase
      .from('vendor_ratings')
      .select('*', { count: 'exact' })
      .eq('vendor_id', vendorId)
      .eq('company_id', ctx.companyId!)

    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, count, error } = await query

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
// POST /api/v2/vendors/:id/ratings
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const vendorId = getVendorId(req.nextUrl.pathname)
    if (!vendorId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing vendor ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createVendorRatingSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid rating data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('vendor_ratings')
      .insert({
        vendor_id: vendorId,
        company_id: ctx.companyId!,
        job_id: input.job_id ?? null,
        category: input.category,
        rating: input.rating,
        review_text: input.review_text ?? null,
        rated_by: ctx.user!.id,
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
