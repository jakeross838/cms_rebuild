/**
 * Lien Waiver by ID — Get, Update, Delete
 *
 * GET    /api/v2/lien-waivers/:id — Get waiver detail
 * PUT    /api/v2/lien-waivers/:id — Update waiver
 * DELETE /api/v2/lien-waivers/:id — Soft delete waiver
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateLienWaiverSchema } from '@/lib/validation/schemas/lien-waivers'

// ============================================================================
// GET /api/v2/lien-waivers/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing lien waiver ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('lien_waivers')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Lien waiver not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'financial' }
)

// ============================================================================
// PUT /api/v2/lien-waivers/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing lien waiver ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = updateLienWaiverSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify waiver exists and is not deleted
    const { data: existing, error: existError } = await supabase
      .from('lien_waivers')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Lien waiver not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Cannot update approved or rejected waivers
    if (existing.status === 'approved' || existing.status === 'rejected') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Cannot update an approved or rejected waiver', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.vendor_id !== undefined) updates.vendor_id = input.vendor_id
    if (input.waiver_type !== undefined) updates.waiver_type = input.waiver_type
    if (input.status !== undefined) updates.status = input.status
    if (input.amount !== undefined) updates.amount = input.amount
    if (input.through_date !== undefined) updates.through_date = input.through_date
    if (input.document_id !== undefined) updates.document_id = input.document_id
    if (input.payment_id !== undefined) updates.payment_id = input.payment_id
    if (input.check_number !== undefined) updates.check_number = input.check_number
    if (input.claimant_name !== undefined) updates.claimant_name = input.claimant_name
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await supabase
      .from('lien_waivers')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
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
  { requireAuth: true, rateLimit: 'financial', auditAction: 'lien_waiver.update' }
)

// ============================================================================
// DELETE /api/v2/lien-waivers/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing lien waiver ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('lien_waivers')
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'financial', auditAction: 'lien_waiver.archive' }
)
