/**
 * Portal Update Post Publish
 *
 * POST /api/v2/portal/updates/:id/publish — Publish a draft update post
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

// ============================================================================
// POST /api/v2/portal/updates/:id/publish
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    // URL: /api/v2/portal/updates/[id]/publish → id is at index length-2
    const id = segments[segments.length - 2]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing update post ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // First verify the post exists and is not deleted
    const { data: existing, error: fetchError } = await (supabase as any)
      .from('portal_update_posts')
      .select('id, is_published')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Update post not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.is_published) {
      return NextResponse.json(
        { error: 'Conflict', message: 'Update post is already published', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { data, error } = await (supabase as any)
      .from('portal_update_posts')
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
