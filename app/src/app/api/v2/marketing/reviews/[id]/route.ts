/**
 * Client Review by ID — Get, Update
 *
 * GET /api/v2/marketing/reviews/:id — Get review details
 * PUT /api/v2/marketing/reviews/:id — Update review (approve, publish, respond)
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateClientReviewSchema } from '@/lib/validation/schemas/marketing'

function extractId(req: NextRequest): string | null {
  const segments = req.nextUrl.pathname.split('/')
  const reviewsIdx = segments.indexOf('reviews')
  return reviewsIdx >= 0 && segments.length > reviewsIdx + 1 ? segments[reviewsIdx + 1] : null
}

// ============================================================================
// GET /api/v2/marketing/reviews/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = extractId(req)
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing review ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('client_reviews')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Review not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/marketing/reviews/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = extractId(req)
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing review ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateClientReviewSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Build update object
    const updates: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        updates[key] = value
      }
    }

    // Set approved_by/approved_at when transitioning to approved
    if (input.status === 'approved') {
      updates.approved_by = ctx.user!.id
      updates.approved_at = new Date().toISOString()
    }

    // Set published_at when transitioning to published
    if (input.status === 'published') {
      updates.published_at = new Date().toISOString()
      if (!updates.approved_by) {
        updates.approved_by = ctx.user!.id
        updates.approved_at = new Date().toISOString()
      }
    }

    // Set response_by/response_at when adding a response
    if (input.response_text !== undefined && input.response_text !== null) {
      updates.response_by = ctx.user!.id
      updates.response_at = new Date().toISOString()
    }

    const { data, error } = await (supabase as any)
      .from('client_reviews')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Review not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
