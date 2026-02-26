/**
 * Contract Signer by ID — Get, Update, Delete
 *
 * GET    /api/v2/contracts/:id/signers/:signerId — Get signer details
 * PUT    /api/v2/contracts/:id/signers/:signerId — Update signer
 * DELETE /api/v2/contracts/:id/signers/:signerId — Remove signer
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateContractSignerSchema } from '@/lib/validation/schemas/contracts'

/**
 * Extract contract ID and signer ID from path
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
// GET /api/v2/contracts/:id/signers/:signerId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { contractId, signerId } = extractIds(req.nextUrl.pathname)
    if (!contractId || !signerId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing contract or signer ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('contract_signers')
      .select('*')
      .eq('id', signerId)
      .eq('contract_id', contractId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Signer not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/contracts/:id/signers/:signerId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { contractId, signerId } = extractIds(req.nextUrl.pathname)
    if (!contractId || !signerId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing contract or signer ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateContractSignerSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = {}
    if (input.name !== undefined) updates.name = input.name
    if (input.email !== undefined) updates.email = input.email
    if (input.role !== undefined) updates.role = input.role
    if (input.sign_order !== undefined) updates.sign_order = input.sign_order

    const { data, error } = await supabase
      .from('contract_signers')
      .update(updates)
      .eq('id', signerId)
      .eq('contract_id', contractId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Signer not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/contracts/:id/signers/:signerId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { contractId, signerId } = extractIds(req.nextUrl.pathname)
    if (!contractId || !signerId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing contract or signer ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('contract_signers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', signerId)
      .eq('contract_id', contractId)
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
  { requireAuth: true, rateLimit: 'api' }
)
