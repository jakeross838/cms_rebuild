/**
 * Permit Fee by ID — Get, Update, Delete
 *
 * GET    /api/v2/permits/:id/fees/:feeId — Get fee details
 * PUT    /api/v2/permits/:id/fees/:feeId — Update fee
 * DELETE /api/v2/permits/:id/fees/:feeId — Delete fee
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updatePermitFeeSchema } from '@/lib/validation/schemas/permitting'

// ============================================================================
// GET /api/v2/permits/:id/fees/:feeId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const feeId = segments[segments.length - 1]

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('permit_fees')
      .select('*')
      .eq('id', feeId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Fee not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// PUT /api/v2/permits/:id/fees/:feeId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const feeId = segments[segments.length - 1]

    const body = await req.json()
    const parseResult = updatePermitFeeSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify fee exists
    const { data: existing, error: existError } = await supabase
      .from('permit_fees')
      .select('id')
      .eq('id', feeId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Fee not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.description !== undefined) updates.description = input.description
    if (input.amount !== undefined) updates.amount = input.amount
    if (input.status !== undefined) updates.status = input.status
    if (input.due_date !== undefined) updates.due_date = input.due_date
    if (input.paid_date !== undefined) updates.paid_date = input.paid_date
    if (input.paid_by !== undefined) updates.paid_by = input.paid_by
    if (input.receipt_url !== undefined) updates.receipt_url = input.receipt_url
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await supabase
      .from('permit_fees')
      .update(updates)
      .eq('id', feeId)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// DELETE /api/v2/permits/:id/fees/:feeId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const feeId = segments[segments.length - 1]

    const supabase = await createClient()

    // Verify ownership
    const { data: existing, error: existError } = await supabase
      .from('permit_fees')
      .select('id')
      .eq('id', feeId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Fee not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('permit_fees')
      .delete()
      .eq('id', feeId)
      .eq('company_id', ctx.companyId!)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)
