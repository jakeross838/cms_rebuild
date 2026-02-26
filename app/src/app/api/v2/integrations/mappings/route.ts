/**
 * Sync Mappings API — List & Create
 *
 * GET  /api/v2/integrations/mappings — List entity mappings
 * POST /api/v2/integrations/mappings — Create new mapping
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listMappingsSchema, createMappingSchema } from '@/lib/validation/schemas/integrations'

// ============================================================================
// GET /api/v2/integrations/mappings
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listMappingsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      connection_id: url.searchParams.get('connection_id') ?? undefined,
      entity_type: url.searchParams.get('entity_type') ?? undefined,
      sync_status: url.searchParams.get('sync_status') ?? undefined,
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

    let query = (supabase as any)
      .from('sync_mappings')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.connection_id) {
      query = query.eq('connection_id', filters.connection_id)
    }
    if (filters.entity_type) {
      query = query.eq('entity_type', filters.entity_type)
    }
    if (filters.sync_status) {
      query = query.eq('sync_status', filters.sync_status)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

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
// POST /api/v2/integrations/mappings — Create new mapping
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createMappingSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid mapping data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify connection belongs to this company
    const { data: connection } = await (supabase as any)
      .from('accounting_connections')
      .select('id')
      .eq('id', input.connection_id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (!connection) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Connection not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Check for duplicate mapping
    const { data: existingMapping } = await (supabase as any)
      .from('sync_mappings')
      .select('id')
      .eq('connection_id', input.connection_id)
      .eq('entity_type', input.entity_type)
      .eq('internal_id', input.internal_id)
      .single()

    if (existingMapping) {
      return NextResponse.json(
        { error: 'Conflict', message: 'A mapping already exists for this entity', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { data: mapping, error: mapError } = await (supabase as any)
      .from('sync_mappings')
      .insert({
        company_id: ctx.companyId!,
        connection_id: input.connection_id,
        entity_type: input.entity_type,
        internal_id: input.internal_id,
        external_id: input.external_id,
        external_name: input.external_name ?? null,
        sync_status: 'pending',
      })
      .select('*')
      .single()

    if (mapError) {
      return NextResponse.json(
        { error: 'Database Error', message: mapError.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: mapping, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
