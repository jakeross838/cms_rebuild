/**
 * Bid Package by ID — Get, Update, Delete
 *
 * GET    /api/v2/bid-packages/:id — Get bid package details
 * PUT    /api/v2/bid-packages/:id — Update bid package
 * DELETE /api/v2/bid-packages/:id — Soft delete (archive) bid package
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateBidPackageSchema } from '@/lib/validation/schemas/bid-management'

// ============================================================================
// GET /api/v2/bid-packages/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing bid package ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('bid_packages')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Bid package not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch counts
    const { data: invitations } = await (supabase as any)
      .from('bid_invitations')
      .select('id')
      .eq('bid_package_id', id)

    const { data: responses } = await (supabase as any)
      .from('bid_responses')
      .select('id')
      .eq('bid_package_id', id)

    const { data: awards } = await (supabase as any)
      .from('bid_awards')
      .select('id')
      .eq('bid_package_id', id)

    return NextResponse.json({
      data: {
        ...data,
        invitations_count: (invitations ?? []).length,
        responses_count: (responses ?? []).length,
        awards_count: (awards ?? []).length,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/bid-packages/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing bid package ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateBidPackageSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify the bid package exists and is editable
    const { data: existing, error: existError } = await (supabase as any)
      .from('bid_packages')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Bid package not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status === 'awarded' || existing.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Awarded or cancelled bid packages cannot be updated', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = {}
    if (input.title !== undefined) updates.title = input.title
    if (input.description !== undefined) updates.description = input.description
    if (input.trade !== undefined) updates.trade = input.trade
    if (input.scope_of_work !== undefined) updates.scope_of_work = input.scope_of_work
    if (input.bid_due_date !== undefined) updates.bid_due_date = input.bid_due_date
    if (input.status !== undefined) updates.status = input.status
    if (input.documents !== undefined) updates.documents = input.documents

    const { data, error } = await (supabase as any)
      .from('bid_packages')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/bid-packages/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing bid package ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Only draft bid packages can be deleted
    const { data: existing, error: existError } = await (supabase as any)
      .from('bid_packages')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Bid package not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only draft bid packages can be deleted', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const { error } = await (supabase as any)
      .from('bid_packages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
