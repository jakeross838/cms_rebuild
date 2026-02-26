/**
 * Blog Posts API — List & Create
 *
 * GET  /api/v2/marketing-site/blog-posts — List blog posts (platform-level)
 * POST /api/v2/marketing-site/blog-posts — Create a new blog post
 */

import { NextResponse } from 'next/server'
import { escapeLike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listBlogPostsSchema, createBlogPostSchema } from '@/lib/validation/schemas/marketing-website'

// ============================================================================
// GET /api/v2/marketing-site/blog-posts
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listBlogPostsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      category: url.searchParams.get('category') ?? undefined,
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

    let query = supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)

    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.is_published !== undefined) {
      query = query.eq('is_published', filters.is_published)
    }
    if (filters.q) {
      query = query.or(`title.ilike.%${escapeLike(filters.q)}%,excerpt.ilike.%${escapeLike(filters.q)}%,author_name.ilike.%${escapeLike(filters.q)}%`)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)

// ============================================================================
// POST /api/v2/marketing-site/blog-posts
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createBlogPostSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid blog post data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt ?? null,
        body_html: input.body_html ?? null,
        author_name: input.author_name ?? null,
        category: input.category,
        tags: input.tags,
        featured_image: input.featured_image ?? null,
        meta_title: input.meta_title ?? null,
        meta_description: input.meta_description ?? null,
        is_published: input.is_published,
        published_at: input.is_published ? new Date().toISOString() : null,
        created_by: ctx.user!.id,
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'], auditAction: 'marketing_site_blog_post.create' }
)
