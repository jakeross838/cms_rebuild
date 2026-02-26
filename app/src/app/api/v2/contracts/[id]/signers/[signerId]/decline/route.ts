/**
 * Decline Contract — Mark signer as declined
 *
 * POST /api/v2/contracts/:id/signers/:signerId/decline
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { declineContractSchema } from '@/lib/validation/schemas/contracts'

/**
 * Extract IDs from path like /contracts/:id/signers/:signerId/decline
 */
function extractIds(pathname: string): { contractId: string | null; signerId: string | null } {
  const segments = pathname.split('/')
  const contractIdx = segments.indexOf('contracts')
  const signerIdx = segments.indexOf('signers')
  return {
    contractId: contractIdx !== -1 && contractIdx + 1 < segments.length ? segments[contractIdx + 1] : null,
    signerId: signerIdx !== -1 && signerIdx + 1 < segments.length ? segments[signerIdx + 1] : null,
  }
}

// ============================================================================
// POST /api/v2/contracts/:id/signers/:signerId/decline
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { contractId, signerId } = extractIds(req.nextUrl.pathname)
    if (!contractId || !signerId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing contract or signer ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = declineContractSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify signer exists and is in pending or viewed status
    const { data: existing, error: existError } = await supabase
      .from('contract_signers')
      .select('id, status')
      .eq('id', signerId)
      .eq('contract_id', contractId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Signer not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'pending' && existing.status !== 'viewed') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Only pending or viewed signers can decline', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('contract_signers')
      .update({
        status: 'declined',
        declined_at: now,
        decline_reason: input.decline_reason ?? null,
      })
      .eq('id', signerId)
      .eq('contract_id', contractId)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'contracts_signer.decline' }
)
