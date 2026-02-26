/**
 * RFI Routing API — List & Create
 *
 * GET  /api/v2/rfis/:id/routing — List routing assignments for an RFI
 * POST /api/v2/rfis/:id/routing — Create a routing assignment
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
import { listRfiRoutingSchema, createRfiRoutingSchema } from '@/lib/validation/schemas/rfi-management'

/**
 * Extract RFI ID from a path like /api/v2/rfis/:id/routing
 */
function extractRfiId(pathname: string): string | null {
  const segments = pathname.split('/')
  const rfisIdx = segments.indexOf('rfis')
  if (rfisIdx === -1 || rfisIdx + 1 >= segments.length) return null
  return segments[rfisIdx + 1]
}

// ============================================================================
// GET /api/v2/rfis/:id/routing
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const rfiId = extractRfiId(req.nextUrl.pathname)
    if (!rfiId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing RFI ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listRfiRoutingSchema.safeParse({
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

    // Verify the RFI belongs to this company
    const { data: rfi, error: rfiError } = await supabase
      .from('rfis')
      .select('id')
      .eq('id', rfiId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (rfiError || !rfi) {
      return NextResponse.json(
        { error: 'Not Found', message: 'RFI not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, count, error } = await supabase
      .from('rfi_routing')
      .select('*', { count: 'exact' })
      .eq('rfi_id', rfiId)
      .order('routed_at', { ascending: false })
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
// POST /api/v2/rfis/:id/routing — Create routing assignment
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const rfiId = extractRfiId(req.nextUrl.pathname)
    if (!rfiId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing RFI ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createRfiRoutingSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid routing data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify RFI exists and belongs to company
    const { data: rfi, error: rfiError } = await supabase
      .from('rfis')
      .select('id, status')
      .eq('id', rfiId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (rfiError || !rfi) {
      return NextResponse.json(
        { error: 'Not Found', message: 'RFI not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (rfi.status === 'closed' || rfi.status === 'voided') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Cannot route closed or voided RFIs', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const { data, error } = await supabase
      .from('rfi_routing')
      .insert({
        rfi_id: rfiId,
        company_id: ctx.companyId!,
        routed_to: input.routed_to,
        routed_by: ctx.user!.id,
        status: 'pending',
        notes: input.notes ?? null,
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
