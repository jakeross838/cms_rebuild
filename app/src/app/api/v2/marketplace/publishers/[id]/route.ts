/**
 * Marketplace Publisher by ID — Get, Update
 *
 * GET /api/v2/marketplace/publishers/:id — Get publisher profile
 * PUT /api/v2/marketplace/publishers/:id — Update publisher profile
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updatePublisherSchema } from '@/lib/validation/schemas/template-marketplace'

// ============================================================================
// GET /api/v2/marketplace/publishers/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing publisher ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('marketplace_publishers')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Publisher not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Get template count
    const { count: templatesCount } = await (supabase as any)
      .from('marketplace_templates')
      .select('id', { count: 'exact', head: true })
      .eq('publisher_id', id)
      .is('deleted_at', null)

    return NextResponse.json({
      data: {
        ...data,
        templates_count: templatesCount ?? 0,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/marketplace/publishers/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing publisher ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updatePublisherSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify existence
    const { data: existing, error: existError } = await (supabase as any)
      .from('marketplace_publishers')
      .select('id')
      .eq('id', id)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Publisher not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.publisher_type !== undefined) updates.publisher_type = input.publisher_type
    if (input.display_name !== undefined) updates.display_name = input.display_name
    if (input.bio !== undefined) updates.bio = input.bio
    if (input.credentials !== undefined) updates.credentials = input.credentials
    if (input.website_url !== undefined) updates.website_url = input.website_url
    if (input.profile_image !== undefined) updates.profile_image = input.profile_image
    if (input.is_verified !== undefined) updates.is_verified = input.is_verified
    if (input.revenue_share_pct !== undefined) updates.revenue_share_pct = input.revenue_share_pct

    const { data, error } = await (supabase as any)
      .from('marketplace_publishers')
      .update(updates)
      .eq('id', id)
      .select('*')
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
  { requireAuth: true, rateLimit: 'api' }
)
