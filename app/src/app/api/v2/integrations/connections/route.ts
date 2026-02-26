/**
 * Accounting Connections API — List & Create
 *
 * GET  /api/v2/integrations/connections — List connections
 * POST /api/v2/integrations/connections — Initiate new connection
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listConnectionsSchema, createConnectionSchema } from '@/lib/validation/schemas/integrations'

// ============================================================================
// GET /api/v2/integrations/connections
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listConnectionsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      provider: url.searchParams.get('provider') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
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
      .from('accounting_connections')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.provider) {
      query = query.eq('provider', filters.provider)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
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
// POST /api/v2/integrations/connections — Create / initiate connection
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createConnectionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid connection data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Check if connection already exists for this provider
    const { data: existing } = await supabase
      .from('accounting_connections')
      .select('id, status')
      .eq('company_id', ctx.companyId!)
      .eq('provider', input.provider)
      .is('deleted_at', null)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Conflict', message: `A connection to ${input.provider} already exists`, requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { data: connection, error: connError } = await supabase
      .from('accounting_connections')
      .insert({
        company_id: ctx.companyId!,
        provider: input.provider,
        status: 'disconnected',
        external_company_id: input.external_company_id ?? null,
        external_company_name: input.external_company_name ?? null,
        sync_direction: input.sync_direction,
        settings: input.settings ?? {},
      })
      .select('*')
      .single()

    if (connError) {
      const mapped = mapDbError(connError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: connection, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
