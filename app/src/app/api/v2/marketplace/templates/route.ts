/**
 * Marketplace Templates API — List & Create
 *
 * GET  /api/v2/marketplace/templates — List templates
 * POST /api/v2/marketplace/templates — Create a new template
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listTemplatesSchema, createTemplateSchema } from '@/lib/validation/schemas/template-marketplace'

// ============================================================================
// GET /api/v2/marketplace/templates
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listTemplatesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      template_type: url.searchParams.get('template_type') ?? undefined,
      publisher_id: url.searchParams.get('publisher_id') ?? undefined,
      review_status: url.searchParams.get('review_status') ?? undefined,
      is_featured: url.searchParams.get('is_featured') ?? undefined,
      is_free: url.searchParams.get('is_free') ?? undefined,
      min_rating: url.searchParams.get('min_rating') ?? undefined,
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

    let query = (supabase
      .from('marketplace_templates') as any)
      .select('*', { count: 'exact' })
      .is('deleted_at', null)

    if (filters.template_type) {
      query = query.eq('template_type', filters.template_type)
    }
    if (filters.publisher_id) {
      query = query.eq('publisher_id', filters.publisher_id)
    }
    if (filters.review_status) {
      query = query.eq('review_status', filters.review_status)
    }
    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured)
    }
    if (filters.is_free !== undefined) {
      if (filters.is_free) {
        query = query.eq('price', 0)
      } else {
        query = query.gt('price', 0)
      }
    }
    if (filters.min_rating !== undefined) {
      query = query.gte('avg_rating', filters.min_rating)
    }
    if (filters.q) {
      query = query.or(`name.ilike.%${filters.q}%,description.ilike.%${filters.q}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

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
// POST /api/v2/marketplace/templates — Create template
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createTemplateSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid template data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase
      .from('marketplace_templates') as any)
      .insert({
        publisher_id: input.publisher_id,
        publisher_type: input.publisher_type,
        template_type: input.template_type,
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        long_description: input.long_description ?? null,
        screenshots: input.screenshots,
        tags: input.tags,
        region_tags: input.region_tags,
        construction_tags: input.construction_tags,
        price: input.price,
        currency: input.currency,
        template_data: input.template_data,
        required_modules: input.required_modules,
        version: input.version,
        review_status: input.review_status,
        is_featured: input.is_featured,
        is_active: input.is_active,
        created_by: ctx.user!.id,
      })
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Conflict', message: 'A template with this slug already exists', requestId: ctx.requestId },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
