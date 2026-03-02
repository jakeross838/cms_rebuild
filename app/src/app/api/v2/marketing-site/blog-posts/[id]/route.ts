/**
 * Blog Post by ID — Get, Update, Delete
 *
 * GET    /api/v2/marketing-site/blog-posts/:id — Get blog post details
 * PUT    /api/v2/marketing-site/blog-posts/:id — Update blog post
 * DELETE /api/v2/marketing-site/blog-posts/:id — Soft delete blog post
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateBlogPostSchema } from '@/lib/validation/schemas/marketing-website'

function extractId(req: NextRequest): string | null {
  const segments = req.nextUrl.pathname.split('/')
  const postsIdx = segments.indexOf('blog-posts')
  return postsIdx >= 0 && segments.length > postsIdx + 1 ? segments[postsIdx + 1] : null
}

// ============================================================================
// GET /api/v2/marketing-site/blog-posts/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = extractId(req)
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing blog post ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, body_html, author_name, category, tags, featured_image, meta_title, meta_description, is_published, published_at, created_by, created_at, updated_at')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Blog post not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)

// ============================================================================
// PUT /api/v2/marketing-site/blog-posts/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = extractId(req)
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing blog post ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateBlogPostSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        updates[key] = value
      }
    }

    // Auto-set published_at when publishing
    if (input.is_published === true) {
      updates.published_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .is('deleted_at', null)
      .select('id, title, slug, excerpt, body_html, author_name, category, tags, featured_image, meta_title, meta_description, is_published, published_at, created_by, created_at, updated_at')
      .single()

    if (error || !data) {
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'], auditAction: 'marketing_site_blog_post.update' }
)

// ============================================================================
// DELETE /api/v2/marketing-site/blog-posts/:id
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = extractId(req)
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing blog post ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('blog_posts')
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select('id')
      .single()

    if (error || !data) {
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { id: data.id }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'], auditAction: 'marketing_site_blog_post.archive' }
)
