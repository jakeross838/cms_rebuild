/**
 * Contract Signers API — List & Create
 *
 * GET  /api/v2/contracts/:id/signers — List signers for a contract
 * POST /api/v2/contracts/:id/signers — Add a signer to a contract
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listContractSignersSchema, createContractSignerSchema } from '@/lib/validation/schemas/contracts'

/**
 * Extract contract ID from a path like /api/v2/contracts/:id/signers
 */
function extractContractId(pathname: string): string | null {
  const segments = pathname.split('/')
  const idx = segments.indexOf('contracts')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v2/contracts/:id/signers
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const contractId = extractContractId(req.nextUrl.pathname)
    if (!contractId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing contract ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listContractSignersSchema.safeParse({
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

    // Verify contract belongs to company
    const { data: contract, error: contractError } = await (supabase
      .from('contracts') as any)
      .select('id')
      .eq('id', contractId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (contractError || !contract) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Contract not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, count, error } = await (supabase
      .from('contract_signers') as any)
      .select('*', { count: 'exact' })
      .eq('contract_id', contractId)
      .order('sign_order', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/contracts/:id/signers — Add signer
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const contractId = extractContractId(req.nextUrl.pathname)
    if (!contractId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing contract ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createContractSignerSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid signer data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify contract belongs to company
    const { data: contract, error: contractError } = await (supabase
      .from('contracts') as any)
      .select('id')
      .eq('id', contractId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (contractError || !contract) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Contract not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await (supabase
      .from('contract_signers') as any)
      .insert({
        contract_id: contractId,
        company_id: ctx.companyId!,
        name: input.name,
        email: input.email,
        role: input.role,
        sign_order: input.sign_order,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
