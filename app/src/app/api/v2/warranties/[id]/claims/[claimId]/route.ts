/**
 * Warranty Claim by ID — Get, Update, Delete
 *
 * GET    /api/v2/warranties/:id/claims/:claimId — Get claim details
 * PUT    /api/v2/warranties/:id/claims/:claimId — Update claim
 * DELETE /api/v2/warranties/:id/claims/:claimId — Soft delete claim
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateWarrantyClaimSchema } from '@/lib/validation/schemas/warranty'

/**
 * Extract warranty ID and claim ID from /api/v2/warranties/:id/claims/:claimId
 */
function extractIds(pathname: string): { warrantyId: string | null; claimId: string | null } {
  const segments = pathname.split('/')
  const wIdx = segments.indexOf('warranties')
  const cIdx = segments.indexOf('claims')
  return {
    warrantyId: wIdx !== -1 && wIdx + 1 < segments.length ? segments[wIdx + 1] : null,
    claimId: cIdx !== -1 && cIdx + 1 < segments.length ? segments[cIdx + 1] : null,
  }
}

// ============================================================================
// GET /api/v2/warranties/:id/claims/:claimId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { warrantyId, claimId } = extractIds(req.nextUrl.pathname)
    if (!warrantyId || !claimId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing warranty or claim ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase
      .from('warranty_claims') as any)
      .select('*')
      .eq('id', claimId)
      .eq('warranty_id', warrantyId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Warranty claim not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch history
    const { data: history } = await (supabase
      .from('warranty_claim_history') as any)
      .select('*')
      .eq('claim_id', claimId)
      .eq('company_id', ctx.companyId!)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      data: {
        ...data,
        history: history ?? [],
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/warranties/:id/claims/:claimId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { warrantyId, claimId } = extractIds(req.nextUrl.pathname)
    if (!warrantyId || !claimId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing warranty or claim ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateWarrantyClaimSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify claim exists
    const { data: existing, error: existError } = await (supabase
      .from('warranty_claims') as any)
      .select('id, status')
      .eq('id', claimId)
      .eq('warranty_id', warrantyId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Warranty claim not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.title !== undefined) updates.title = input.title
    if (input.description !== undefined) updates.description = input.description
    if (input.status !== undefined) updates.status = input.status
    if (input.priority !== undefined) updates.priority = input.priority
    if (input.assigned_to !== undefined) updates.assigned_to = input.assigned_to
    if (input.assigned_vendor_id !== undefined) updates.assigned_vendor_id = input.assigned_vendor_id
    if (input.resolution_notes !== undefined) updates.resolution_notes = input.resolution_notes
    if (input.resolution_cost !== undefined) updates.resolution_cost = input.resolution_cost
    if (input.due_date !== undefined) updates.due_date = input.due_date
    if (input.photos !== undefined) updates.photos = input.photos

    const { data, error } = await (supabase
      .from('warranty_claims') as any)
      .update(updates)
      .eq('id', claimId)
      .eq('warranty_id', warrantyId)
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

    // Record history if status changed
    if (input.status && input.status !== existing.status) {
      await (supabase
        .from('warranty_claim_history') as any)
        .insert({
          claim_id: claimId,
          company_id: ctx.companyId!,
          action: input.status,
          previous_status: existing.status,
          new_status: input.status,
          details: { updated_fields: Object.keys(input) },
          performed_by: ctx.user!.id,
        })
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/warranties/:id/claims/:claimId — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { warrantyId, claimId } = extractIds(req.nextUrl.pathname)
    if (!warrantyId || !claimId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing warranty or claim ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: existing, error: existError } = await (supabase
      .from('warranty_claims') as any)
      .select('id')
      .eq('id', claimId)
      .eq('warranty_id', warrantyId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Warranty claim not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await (supabase
      .from('warranty_claims') as any)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', claimId)
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
