/**
 * Testimonials API — List & Create
 *
 * GET  /api/v2/marketing-site/testimonials — List testimonials
 * POST /api/v2/marketing-site/testimonials — Create a new testimonial
 */

import { NextResponse } from 'next/server'
import { escapeLike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listTestimonialsSchema, createTestimonialSchema } from '@/lib/validation/schemas/marketing-website'

// ============================================================================
// GET /api/v2/marketing-site/testimonials
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listTestimonialsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      is_approved: url.searchParams.get('is_approved') ?? undefined,
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

    let query = supabase
      .from('testimonials')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.is_approved !== undefined) {
      query = query.eq('is_approved', filters.is_approved)
    }
    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured)
    }
    if (filters.rating) {
      query = query.eq('rating', filters.rating)
    }
    if (filters.q) {
      query = query.or(`contact_name.ilike.%${escapeLike(filters.q)}%,quote_text.ilike.%${escapeLike(filters.q)}%,company_display_name.ilike.%${escapeLike(filters.q)}%`)
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
// POST /api/v2/marketing-site/testimonials
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createTestimonialSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid testimonial data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('testimonials')
      .insert({
        company_id: ctx.companyId!,
        contact_name: input.contact_name,
        contact_title: input.contact_title ?? null,
        company_display_name: input.company_display_name ?? null,
        quote_text: input.quote_text,
        rating: input.rating ?? null,
        video_url: input.video_url ?? null,
        photo_url: input.photo_url ?? null,
        is_approved: input.is_approved,
        is_featured: input.is_featured,
        display_on: input.display_on,
        collected_at: input.collected_at ?? new Date().toISOString(),
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
