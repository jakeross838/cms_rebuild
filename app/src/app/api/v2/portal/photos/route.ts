/**
 * Portal Shared Photos API — List & Share
 *
 * GET  /api/v2/portal/photos?job_id=... — List shared photos for a job
 * POST /api/v2/portal/photos             — Share a photo to the portal
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import {
  listSharedPhotosSchema,
  sharePhotoSchema,
} from '@/lib/validation/schemas/client-portal'

// ============================================================================
// GET /api/v2/portal/photos
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listSharedPhotosSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      album_name: url.searchParams.get('album_name') ?? undefined,
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
      .from('portal_shared_photos')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .eq('job_id', filters.job_id)

    if (filters.album_name) {
      query = query.eq('album_name', filters.album_name)
    }

    query = query.order('sort_order', { ascending: true }).order('created_at', { ascending: false })

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
// POST /api/v2/portal/photos — Share a photo
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = sharePhotoSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid photo data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('portal_shared_photos')
      .insert({
        company_id: ctx.companyId!,
        job_id: input.job_id,
        storage_path: input.storage_path,
        caption: input.caption ?? null,
        album_name: input.album_name ?? null,
        sort_order: input.sort_order,
        shared_by: ctx.user!.id,
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
