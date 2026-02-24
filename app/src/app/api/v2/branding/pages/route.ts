/**
 * Builder Content Pages API — List & Create
 *
 * GET  /api/v2/branding/pages — List content pages
 * POST /api/v2/branding/pages — Create a new content page
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listContentPagesSchema, createContentPageSchema } from '@/lib/validation/schemas/white-label'

// ============================================================================
// GET /api/v2/branding/pages
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listContentPagesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      page_type: url.searchParams.get('page_type') ?? undefined,
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
      .from('builder_content_pages')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.page_type) {
      query = query.eq('page_type', filters.page_type)
    }
    if (filters.is_published !== undefined) {
      query = query.eq('is_published', filters.is_published)
    }
    if (filters.q) {
      query = query.or(`title.ilike.%${filters.q}%,slug.ilike.%${filters.q}%`)
    }

    query = query.order('sort_order', { ascending: true }).order('created_at', { ascending: false })

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
// POST /api/v2/branding/pages — Create content page
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createContentPageSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid page data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const insertData: Record<string, unknown> = {
      company_id: ctx.companyId!,
      page_type: input.page_type,
      title: input.title,
      slug: input.slug,
      content_html: input.content_html ?? null,
      is_published: input.is_published,
      sort_order: input.sort_order,
      created_by: ctx.user!.id,
    }

    if (input.is_published) {
      insertData.published_at = new Date().toISOString()
    }

    const { data, error } = await (supabase as any)
      .from('builder_content_pages')
      .insert(insertData)
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Conflict', message: 'A page with this slug already exists', requestId: ctx.requestId },
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
