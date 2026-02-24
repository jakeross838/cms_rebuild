/**
 * Resolve Warranty Claim — Mark claim as resolved
 *
 * POST /api/v2/warranties/:id/claims/:claimId/resolve
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { resolveWarrantyClaimSchema } from '@/lib/validation/schemas/warranty'

/**
 * Extract warranty ID and claim ID
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
// POST /api/v2/warranties/:id/claims/:claimId/resolve
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { warrantyId, claimId } = extractIds(req.nextUrl.pathname)
    if (!warrantyId || !claimId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing warranty or claim ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const parseResult = resolveWarrantyClaimSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid resolve data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify claim exists and is not already resolved
    const { data: existing, error: existError } = await (supabase as any)
      .from('warranty_claims')
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

    if (existing.status === 'resolved' || existing.status === 'denied') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Claim is already resolved or denied', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const now = new Date().toISOString()
    const input = parseResult.data

    const { data, error } = await (supabase as any)
      .from('warranty_claims')
      .update({
        status: 'resolved',
        resolution_notes: input.resolution_notes ?? null,
        resolution_cost: input.resolution_cost,
        resolved_at: now,
        resolved_by: ctx.user!.id,
        updated_at: now,
      })
      .eq('id', claimId)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    // Record history
    await (supabase as any)
      .from('warranty_claim_history')
      .insert({
        claim_id: claimId,
        company_id: ctx.companyId!,
        action: 'resolved',
        previous_status: existing.status,
        new_status: 'resolved',
        details: {
          resolution_notes: input.resolution_notes ?? null,
          resolution_cost: input.resolution_cost,
        },
        performed_by: ctx.user!.id,
      })

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
