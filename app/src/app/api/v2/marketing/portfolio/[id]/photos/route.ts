/**
 * Portfolio Photos API — List & Create
 *
 * GET  /api/v2/marketing/portfolio/:id/photos — List photos for a portfolio project
 * POST /api/v2/marketing/portfolio/:id/photos — Add photo to portfolio project
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listPortfolioPhotosSchema, createPortfolioPhotoSchema } from '@/lib/validation/schemas/marketing'

function extractProjectId(req: NextRequest): string | null {
  const segments = req.nextUrl.pathname.split('/')
  const porfolioIdx = segments.indexOf('portfolio')
  return porfolioIdx >= 0 && segments.length > porfolioIdx + 1 ? segments[porfolioIdx + 1] : null
}

// ============================================================================
// GET /api/v2/marketing/portfolio/:id/photos
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const projectId = extractProjectId(req)
    if (!projectId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing portfolio project ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listPortfolioPhotosSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      photo_type: url.searchParams.get('photo_type') ?? undefined,
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

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('portfolio_projects')
      .select('id')
      .eq('id', projectId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Portfolio project not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    let query = supabase
      .from('portfolio_photos')
      .select('*', { count: 'exact' })
      .eq('portfolio_project_id', projectId)
      .eq('company_id', ctx.companyId!)

    if (filters.photo_type) {
      query = query.eq('photo_type', filters.photo_type)
    }

    query = query.order('display_order', { ascending: true })

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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// POST /api/v2/marketing/portfolio/:id/photos
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const projectId = extractProjectId(req)
    if (!projectId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing portfolio project ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createPortfolioPhotoSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid photo data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('portfolio_projects')
      .select('id')
      .eq('id', projectId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Portfolio project not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('portfolio_photos')
      .insert({
        portfolio_project_id: projectId,
        company_id: ctx.companyId!,
        photo_url: input.photo_url,
        caption: input.caption ?? null,
        photo_type: input.photo_type,
        room: input.room ?? null,
        display_order: input.display_order,
        is_cover: input.is_cover,
        uploaded_by: ctx.user!.id,
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)
