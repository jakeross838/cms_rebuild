/**
 * Integration Listing by Slug — Get single listing
 *
 * GET /api/v2/integrations/listings/:slug — Get listing details
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

// ============================================================================
// GET /api/v2/integrations/listings/:slug
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const slug = segments[segments.length - 1]
    if (!slug) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing listing slug', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Integration listings are global — no company_id filter
    const { data, error } = await (supabase as any)
      .from('integration_listings')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Integration listing not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
