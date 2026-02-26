/**
 * Contracts API — List & Create
 *
 * GET  /api/v2/contracts — List contracts (filtered by company)
 * POST /api/v2/contracts — Create a new contract
 */

import { NextResponse } from 'next/server'
import { escapeLike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listContractsSchema, createContractSchema } from '@/lib/validation/schemas/contracts'

// ============================================================================
// GET /api/v2/contracts
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listContractsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      contract_type: url.searchParams.get('contract_type') ?? undefined,
      vendor_id: url.searchParams.get('vendor_id') ?? undefined,
      client_id: url.searchParams.get('client_id') ?? undefined,
      q: url.searchParams.get('q') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    let query = supabase
      .from('contracts')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.contract_type) {
      query = query.eq('contract_type', filters.contract_type)
    }
    if (filters.vendor_id) {
      query = query.eq('vendor_id', filters.vendor_id)
    }
    if (filters.client_id) {
      query = query.eq('client_id', filters.client_id)
    }
    if (filters.q) {
      query = query.or(`title.ilike.%${escapeLike(filters.q)}%,contract_number.ilike.%${escapeLike(filters.q)}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/contracts — Create contract
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createContractSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid contract data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('contracts')
      .insert({
        company_id: ctx.companyId!,
        contract_number: input.contract_number,
        title: input.title,
        description: input.description ?? null,
        job_id: input.job_id ?? null,
        contract_type: input.contract_type,
        status: input.status,
        template_id: input.template_id ?? null,
        vendor_id: input.vendor_id ?? null,
        client_id: input.client_id ?? null,
        contract_value: input.contract_value,
        retention_pct: input.retention_pct,
        start_date: input.start_date ?? null,
        end_date: input.end_date ?? null,
        content: input.content ?? null,
        metadata: input.metadata,
        created_by: ctx.user!.id,
      })
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'financial', auditAction: 'contract.create' }
)
