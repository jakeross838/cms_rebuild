/**
 * RFI Routing by ID — Get & Update
 *
 * GET /api/v2/rfis/:id/routing/:routeId — Get a routing assignment
 * PUT /api/v2/rfis/:id/routing/:routeId — Update a routing assignment
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateRfiRoutingSchema } from '@/lib/validation/schemas/rfi-management'

/**
 * Extract RFI ID and routing ID from path like
 * /api/v2/rfis/:id/routing/:routeId
 */
function extractIds(pathname: string): { rfiId: string | null; routeId: string | null } {
  const segments = pathname.split('/')
  const rfisIdx = segments.indexOf('rfis')
  const routingIdx = segments.indexOf('routing')
  return {
    rfiId: rfisIdx !== -1 && rfisIdx + 1 < segments.length ? segments[rfisIdx + 1] : null,
    routeId: routingIdx !== -1 && routingIdx + 1 < segments.length ? segments[routingIdx + 1] : null,
  }
}

// ============================================================================
// GET /api/v2/rfis/:id/routing/:routeId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { rfiId, routeId } = extractIds(req.nextUrl.pathname)
    if (!rfiId || !routeId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing RFI ID or routing ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify RFI belongs to company
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

    const { data, error } = await supabase
      .from('rfi_routing')
      .select('*')
      .eq('id', routeId)
      .eq('rfi_id', rfiId)
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

// ============================================================================
// PUT /api/v2/rfis/:id/routing/:routeId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { rfiId, routeId } = extractIds(req.nextUrl.pathname)
    if (!rfiId || !routeId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing RFI ID or routing ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateRfiRoutingSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify RFI belongs to company
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

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.status !== undefined) updates.status = input.status
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await supabase
      .from('rfi_routing')
      .update(updates)
      .eq('id', routeId)
      .eq('rfi_id', rfiId)
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
