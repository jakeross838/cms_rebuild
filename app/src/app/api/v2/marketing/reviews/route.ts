/**
 * Client Reviews API — List & Create
 *
 * GET  /api/v2/marketing/reviews — List client reviews
 * POST /api/v2/marketing/reviews — Create a new client review
 */

import { NextResponse } from 'next/server'
import { escapeLike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listClientReviewsSchema, createClientReviewSchema } from '@/lib/validation/schemas/marketing'

// ============================================================================
// GET /api/v2/marketing/reviews
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listClientReviewsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      source: url.searchParams.get('source') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      is_featured: url.searchParams.get('is_featured') ?? undefined,
      rating: url.searchParams.get('rating') ?? undefined,
      q: url.searchParams.get('q') ?? undefined,
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

    let query = (supabase as any)
      .from('client_reviews')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.source) {
      query = query.eq('source', filters.source)
    }
    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured)
    }
    if (filters.rating) {
      query = query.eq('rating', filters.rating)
    }
    if (filters.q) {
      query = query.or(`client_name.ilike.%${escapeLike(filters.q)}%,review_text.ilike.%${escapeLike(filters.q)}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

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

// ============================================================================
// POST /api/v2/marketing/reviews
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createClientReviewSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid review data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('client_reviews')
      .insert({
        company_id: ctx.companyId!,
        job_id: input.job_id ?? null,
        client_name: input.client_name,
        client_email: input.client_email ?? null,
        rating: input.rating,
        review_text: input.review_text ?? null,
        source: input.source,
        status: input.status,
        display_name: input.display_name ?? null,
        is_featured: input.is_featured,
        response_text: input.response_text ?? null,
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
