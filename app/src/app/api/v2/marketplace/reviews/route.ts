/**
 * Marketplace Reviews API — List & Create
 *
 * GET  /api/v2/marketplace/reviews — List reviews
 * POST /api/v2/marketplace/reviews — Create a review
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
import { listReviewsSchema, createReviewSchema } from '@/lib/validation/schemas/template-marketplace'

// ============================================================================
// GET /api/v2/marketplace/reviews
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listReviewsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      template_id: url.searchParams.get('template_id') ?? undefined,
      rating: url.searchParams.get('rating') ?? undefined,
      is_verified_purchase: url.searchParams.get('is_verified_purchase') ?? undefined,
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
      .from('marketplace_reviews')
      .select('*', { count: 'exact' })

    if (filters.template_id) {
      query = query.eq('template_id', filters.template_id)
    }
    if (filters.rating) {
      query = query.eq('rating', filters.rating)
    }
    if (filters.is_verified_purchase !== undefined) {
      query = query.eq('is_verified_purchase', filters.is_verified_purchase)
    }

    query = query.order('created_at', { ascending: false })

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
// POST /api/v2/marketplace/reviews — Create review
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createReviewSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid review data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify template exists
    const { data: template } = await supabase
      .from('marketplace_templates')
      .select('id')
      .eq('id', input.template_id)
      .is('deleted_at', null)
      .single()

    if (!template) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Template not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('marketplace_reviews')
      .insert({
        company_id: ctx.companyId!,
        template_id: input.template_id,
        user_id: ctx.user!.id,
        rating: input.rating,
        title: input.title ?? null,
        review_text: input.review_text ?? null,
        is_verified_purchase: input.is_verified_purchase,
      })
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Conflict', message: 'You have already reviewed this template', requestId: ctx.requestId },
          { status: 409 }
        )
      }
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
