/**
 * Contract Versions API — List & Create
 *
 * GET  /api/v2/contracts/:id/versions — List versions for a contract
 * POST /api/v2/contracts/:id/versions — Create a version snapshot
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listContractVersionsSchema, createContractVersionSchema } from '@/lib/validation/schemas/contracts'

/**
 * Extract contract ID from a path like /api/v2/contracts/:id/versions
 */
function extractContractId(pathname: string): string | null {
  const segments = pathname.split('/')
  const idx = segments.indexOf('contracts')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v2/contracts/:id/versions
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
    const parseResult = listContractVersionsSchema.safeParse({
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
    const { data: contract, error: contractError } = await (supabase as any)
      .from('contracts')
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

    const { data, count, error } = await (supabase as any)
      .from('contract_versions')
      .select('*', { count: 'exact' })
      .eq('contract_id', contractId)
      .order('version_number', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/contracts/:id/versions — Create version snapshot
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
    const parseResult = createContractVersionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid version data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify contract belongs to company
    const { data: contract, error: contractError } = await (supabase as any)
      .from('contracts')
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

    const { data, error } = await (supabase as any)
      .from('contract_versions')
      .insert({
        contract_id: contractId,
        company_id: ctx.companyId!,
        version_number: input.version_number,
        change_summary: input.change_summary ?? null,
        content: input.content ?? null,
        snapshot_json: input.snapshot_json,
        created_by: ctx.user!.id,
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
