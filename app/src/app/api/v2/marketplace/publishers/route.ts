/**
 * Marketplace Publishers API — List & Create
 *
 * GET  /api/v2/marketplace/publishers — List publishers
 * POST /api/v2/marketplace/publishers — Create/register publisher profile
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listPublishersSchema, createPublisherSchema } from '@/lib/validation/schemas/template-marketplace'

// ============================================================================
// GET /api/v2/marketplace/publishers
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listPublishersSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      publisher_type: url.searchParams.get('publisher_type') ?? undefined,
      is_verified: url.searchParams.get('is_verified') ?? undefined,
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
      .from('marketplace_publishers') as any)
      .select('*', { count: 'exact' })

    if (filters.publisher_type) {
      query = query.eq('publisher_type', filters.publisher_type)
    }
    if (filters.is_verified !== undefined) {
      query = query.eq('is_verified', filters.is_verified)
    }
    if (filters.q) {
      query = query.or(`display_name.ilike.%${filters.q}%,bio.ilike.%${filters.q}%`)
    }

    query = query.order('total_installs', { ascending: false })

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
// POST /api/v2/marketplace/publishers — Register publisher profile
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createPublisherSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid publisher data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase
      .from('marketplace_publishers') as any)
      .insert({
        user_id: input.user_id,
        publisher_type: input.publisher_type,
        display_name: input.display_name,
        bio: input.bio ?? null,
        credentials: input.credentials ?? null,
        website_url: input.website_url ?? null,
        profile_image: input.profile_image ?? null,
      })
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Conflict', message: 'A publisher profile already exists for this user', requestId: ctx.requestId },
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
