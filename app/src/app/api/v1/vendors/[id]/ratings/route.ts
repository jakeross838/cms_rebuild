/**
 * Vendor Ratings API — List & Create
 *
 * GET  /api/v1/vendors/[id]/ratings — List ratings for a vendor
 * POST /api/v1/vendors/[id]/ratings — Create a new vendor rating
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  mapDbError,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validation/schemas/common'
import { z } from 'zod'

import {
  createVendorRatingSchema,
  listVendorRatingsSchema,
} from '@/lib/validation/schemas/vendor-management'

type CreateVendorRatingInput = z.infer<typeof createVendorRatingSchema>
import type { VendorRating } from '@/types/vendor-management'

function extractEntityId(req: Request, segment: string): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const idx = segments.indexOf(segment)
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v1/vendors/[id]/ratings — List ratings for a vendor
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const vendorId = extractEntityId(req, 'vendors')
    if (!vendorId || !uuidSchema.safeParse(vendorId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid vendor ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = new URL(req.url)
    const parseResult = listVendorRatingsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      category: url.searchParams.get('category') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid query parameters',
          errors: parseResult.error.flatten().fieldErrors,
          requestId: ctx.requestId,
        },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    // Verify vendor belongs to this company
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id')
      .eq('id', vendorId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: { id: string } | null; error: { message: string } | null }

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Vendor not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    let query = supabase
      .from('vendor_ratings')
      .select('*', { count: 'exact' })
      .eq('vendor_id', vendorId)
      .eq('company_id', ctx.companyId!) as unknown as {
        eq: (col: string, val: unknown) => typeof query
        order: (col: string, opts: { ascending: boolean }) => typeof query
        range: (from: number, to: number) => Promise<{ data: VendorRating[] | null; count: number | null; error: { message: string } | null }>
      }

    if (filters.category) {
      query = query.eq('category', filters.category) as typeof query
    }
    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id) as typeof query
    }

    query = query.order('created_at', { ascending: false }) as typeof query

    const { data: ratings, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      logger.error('Failed to list vendor ratings', { error: error.message, vendorId })
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(
      { ...paginatedResponse(ratings ?? [], count ?? 0, page, limit), requestId: ctx.requestId }
    )
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ============================================================================
// POST /api/v1/vendors/[id]/ratings — Create a new vendor rating
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const vendorId = extractEntityId(req, 'vendors')
    if (!vendorId || !uuidSchema.safeParse(vendorId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid vendor ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = ctx.validatedBody as CreateVendorRatingInput

    const supabase = await createClient()

    // Verify vendor belongs to this company
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id')
      .eq('id', vendorId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: { id: string } | null; error: { message: string } | null }

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Vendor not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data: rating, error } = await (supabase
      .from('vendor_ratings')
      .insert({
        ...body,
        vendor_id: vendorId,
        company_id: ctx.companyId!,
        rated_by: ctx.user!.id,
      } as never)
      .select()
      .single() as unknown as Promise<{ data: VendorRating | null; error: { message: string } | null }>)

    if (error || !rating) {
      logger.error('Failed to create vendor rating', { error: error?.message, vendorId })
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('Vendor rating created', { ratingId: rating.id, vendorId, companyId: ctx.companyId! })

    return NextResponse.json({ data: rating, requestId: ctx.requestId }, { status: 201 })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm'],
    schema: createVendorRatingSchema,
    permission: 'jobs:update:all',
    auditAction: 'vendor_rating.create',
  }
)
