/**
 * Estimate Sections API — List & Create
 *
 * GET  /api/v2/estimates/:id/sections — List sections for an estimate
 * POST /api/v2/estimates/:id/sections — Add a section to an estimate
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listEstimateSectionsSchema, createEstimateSectionSchema } from '@/lib/validation/schemas/estimating'

/**
 * Extract estimate ID from a path like /api/v2/estimates/:id/sections
 */
function extractEstimateId(pathname: string): string | null {
  const segments = pathname.split('/')
  const idx = segments.indexOf('estimates')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v2/estimates/:id/sections
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const estimateId = extractEstimateId(req.nextUrl.pathname)
    if (!estimateId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing estimate ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listEstimateSectionsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    // Verify the estimate belongs to this company
    const { data: estimate, error: estError } = await supabase
      .from('estimates')
      .select('id')
      .eq('id', estimateId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (estError || !estimate) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Estimate not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, count, error } = await supabase
      .from('estimate_sections')
      .select('*', { count: 'exact' })
      .eq('estimate_id', estimateId)
      .order('sort_order', { ascending: true })
      .range(offset, offset + limit - 1)

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
// POST /api/v2/estimates/:id/sections — Add section
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const estimateId = extractEstimateId(req.nextUrl.pathname)
    if (!estimateId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing estimate ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createEstimateSectionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid section data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify estimate exists, belongs to company, and is editable
    const { data: estimate, error: estError } = await supabase
      .from('estimates')
      .select('id, status')
      .eq('id', estimateId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (estError || !estimate) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Estimate not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (estimate.status !== 'draft' && estimate.status !== 'revised') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Sections can only be added to draft or revised estimates', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const { data, error } = await supabase
      .from('estimate_sections')
      .insert({
        estimate_id: estimateId,
        company_id: ctx.companyId!,
        parent_id: input.parent_id ?? null,
        name: input.name,
        sort_order: input.sort_order,
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
