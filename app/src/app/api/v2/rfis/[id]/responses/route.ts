/**
 * RFI Responses API — List & Create
 *
 * GET  /api/v2/rfis/:id/responses — List responses for an RFI
 * POST /api/v2/rfis/:id/responses — Add a response to an RFI
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
import { listRfiResponsesSchema, createRfiResponseSchema } from '@/lib/validation/schemas/rfi-management'

/**
 * Extract RFI ID from a path like /api/v2/rfis/:id/responses
 */
function extractRfiId(pathname: string): string | null {
  const segments = pathname.split('/')
  const rfisIdx = segments.indexOf('rfis')
  if (rfisIdx === -1 || rfisIdx + 1 >= segments.length) return null
  return segments[rfisIdx + 1]
}

// ============================================================================
// GET /api/v2/rfis/:id/responses
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
    const parseResult = listRfiResponsesSchema.safeParse({
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

    const { data, count, error } = await (supabase as any)
      .from('rfi_responses')
      .select('*', { count: 'exact' })
      .eq('rfi_id', rfiId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
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
// POST /api/v2/rfis/:id/responses — Add response
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
    const parseResult = createRfiResponseSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid response data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify RFI exists and belongs to company
    const { data: rfi, error: rfiError } = await (supabase as any)
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
        { error: 'Forbidden', message: 'Cannot add responses to closed or voided RFIs', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const { data, error } = await (supabase as any)
      .from('rfi_responses')
      .insert({
        rfi_id: rfiId,
        company_id: ctx.companyId!,
        response_text: input.response_text,
        responded_by: ctx.user!.id,
        attachments: input.attachments,
        is_official: input.is_official,
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

    // If this is an official response, update RFI status to answered
    if (input.is_official) {
      const now = new Date().toISOString()
      await (supabase as any)
        .from('rfis')
        .update({
          status: 'answered',
          answered_at: now,
          updated_at: now,
        })
        .eq('id', rfiId)
        .eq('company_id', ctx.companyId!)
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
