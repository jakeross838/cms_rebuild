/**
 * Estimate Versions API — List & Create
 *
 * GET  /api/v2/estimates/:id/versions — List version snapshots
 * POST /api/v2/estimates/:id/versions — Create a version snapshot
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
import { listEstimateVersionsSchema, createEstimateVersionSchema } from '@/lib/validation/schemas/estimating'

/**
 * Extract estimate ID from a path like /api/v2/estimates/:id/versions
 */
function extractEstimateId(pathname: string): string | null {
  const segments = pathname.split('/')
  const idx = segments.indexOf('estimates')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v2/estimates/:id/versions
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
    const parseResult = listEstimateVersionsSchema.safeParse({
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
      .from('estimate_versions')
      .select('*', { count: 'exact' })
      .eq('estimate_id', estimateId)
      .order('version_number', { ascending: false })
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'] }
)

// ============================================================================
// POST /api/v2/estimates/:id/versions — Create version snapshot
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
    const parseResult = createEstimateVersionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid version data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify estimate exists and belongs to company
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

    const { data, error } = await supabase
      .from('estimate_versions')
      .insert({
        estimate_id: estimateId,
        company_id: ctx.companyId!,
        version_number: input.version_number,
        snapshot_json: input.snapshot_json,
        change_summary: input.change_summary ?? null,
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'], auditAction: 'estimates_version.create' }
)
