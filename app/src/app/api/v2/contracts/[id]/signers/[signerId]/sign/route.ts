/**
 * Sign Contract — Mark signer as signed
 *
 * POST /api/v2/contracts/:id/signers/:signerId/sign
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { signContractSchema } from '@/lib/validation/schemas/contracts'

/**
 * Extract IDs from path like /contracts/:id/signers/:signerId/sign
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
// POST /api/v2/contracts/:id/signers/:signerId/sign
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
    const parseResult = signContractSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify signer exists and is in pending or viewed status
    const { data: existing, error: existError } = await (supabase as any)
      .from('contract_signers')
      .select('id, status, contract_id')
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
        { error: 'Conflict', message: 'Only pending or viewed signers can sign', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const now = new Date().toISOString()
    const { data, error } = await (supabase as any)
      .from('contract_signers')
      .update({
        status: 'signed',
        signed_at: now,
        ip_address: input.ip_address ?? null,
        user_agent: input.user_agent ?? null,
      })
      .eq('id', signerId)
      .eq('contract_id', contractId)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    // Check if all signers have signed to auto-update contract status
    const { data: allSigners } = await (supabase as any)
      .from('contract_signers')
      .select('id, status')
      .eq('contract_id', contractId)

    const allSigned = (allSigners ?? []).every((s: { status: string }) => s.status === 'signed')
    const someSigned = (allSigners ?? []).some((s: { status: string }) => s.status === 'signed')

    if (allSigned) {
      await (supabase as any)
        .from('contracts')
        .update({ status: 'fully_signed', executed_at: now, updated_at: now })
        .eq('id', contractId)
        .eq('company_id', ctx.companyId!)
    } else if (someSigned) {
      await (supabase as any)
        .from('contracts')
        .update({ status: 'partially_signed', updated_at: now })
        .eq('id', contractId)
        .eq('company_id', ctx.companyId!)
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
