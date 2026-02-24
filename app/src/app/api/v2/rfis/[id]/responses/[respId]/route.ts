/**
 * RFI Response by ID — Get, Update, Delete
 *
 * GET    /api/v2/rfis/:id/responses/:respId — Get a response
 * PUT    /api/v2/rfis/:id/responses/:respId — Update a response
 * DELETE /api/v2/rfis/:id/responses/:respId — Delete a response
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateRfiResponseSchema } from '@/lib/validation/schemas/rfi-management'

/**
 * Extract RFI ID and response ID from path like
 * /api/v2/rfis/:id/responses/:respId
 */
function extractIds(pathname: string): { rfiId: string | null; respId: string | null } {
  const segments = pathname.split('/')
  const rfisIdx = segments.indexOf('rfis')
  const responsesIdx = segments.indexOf('responses')
  return {
    rfiId: rfisIdx !== -1 && rfisIdx + 1 < segments.length ? segments[rfisIdx + 1] : null,
    respId: responsesIdx !== -1 && responsesIdx + 1 < segments.length ? segments[responsesIdx + 1] : null,
  }
}

// ============================================================================
// GET /api/v2/rfis/:id/responses/:respId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { rfiId, respId } = extractIds(req.nextUrl.pathname)
    if (!rfiId || !respId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing RFI ID or response ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify RFI belongs to company
    const { data: rfi, error: rfiError } = await (supabase as any)
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

    const { data, error } = await (supabase as any)
      .from('rfi_responses')
      .select('*')
      .eq('id', respId)
      .eq('rfi_id', rfiId)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'RFI response not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/rfis/:id/responses/:respId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { rfiId, respId } = extractIds(req.nextUrl.pathname)
    if (!rfiId || !respId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing RFI ID or response ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateRfiResponseSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify RFI belongs to company
    const { data: rfi, error: rfiError } = await (supabase as any)
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
    if (input.response_text !== undefined) updates.response_text = input.response_text
    if (input.attachments !== undefined) updates.attachments = input.attachments
    if (input.is_official !== undefined) updates.is_official = input.is_official

    const { data, error } = await (supabase as any)
      .from('rfi_responses')
      .update(updates)
      .eq('id', respId)
      .eq('rfi_id', rfiId)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'RFI response not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/rfis/:id/responses/:respId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { rfiId, respId } = extractIds(req.nextUrl.pathname)
    if (!rfiId || !respId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing RFI ID or response ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify RFI belongs to company
    const { data: rfi, error: rfiError } = await (supabase as any)
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

    const { error } = await (supabase as any)
      .from('rfi_responses')
      .delete()
      .eq('id', respId)
      .eq('rfi_id', rfiId)

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'RFI response not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
