/**
 * Case Studies API — List & Create
 *
 * GET  /api/v2/marketing-site/case-studies — List case studies (platform-level)
 * POST /api/v2/marketing-site/case-studies — Create a new case study
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listCaseStudiesSchema, createCaseStudySchema } from '@/lib/validation/schemas/marketing-website'

// ============================================================================
// GET /api/v2/marketing-site/case-studies
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listCaseStudiesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      is_published: url.searchParams.get('is_published') ?? undefined,
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
      .from('case_studies')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)

    if (filters.is_published !== undefined) {
      query = query.eq('is_published', filters.is_published)
    }
    if (filters.q) {
      query = query.or(`title.ilike.%${filters.q}%,company_name.ilike.%${filters.q}%,challenge.ilike.%${filters.q}%`)
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
// POST /api/v2/marketing-site/case-studies
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createCaseStudySchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid case study data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('case_studies')
      .insert({
        title: input.title,
        slug: input.slug,
        company_name: input.company_name ?? null,
        company_size: input.company_size ?? null,
        challenge: input.challenge ?? null,
        solution: input.solution ?? null,
        results: input.results ?? null,
        metrics: input.metrics,
        quote_text: input.quote_text ?? null,
        quote_author: input.quote_author ?? null,
        photos: input.photos,
        industry_tags: input.industry_tags,
        region_tags: input.region_tags,
        is_published: input.is_published,
        published_at: input.is_published ? new Date().toISOString() : null,
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
