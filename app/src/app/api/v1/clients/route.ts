/**
 * Clients API — List & Create
 *
 * GET  /api/v1/clients — List clients for company (paginated, filterable)
 * POST /api/v1/clients — Create a new client
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { escapeLike } from '@/lib/utils'
import { createClientSchema, listClientsSchema, type CreateClientInput } from '@/lib/validation/schemas/clients'
import type { Client } from '@/types/database'

// ============================================================================
// GET /api/v1/clients — List clients for company
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const url = req.nextUrl
    const parseResult = listClientsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      sortBy: url.searchParams.get('sortBy') ?? undefined,
      sortOrder: url.searchParams.get('sortOrder') ?? undefined,
      search: url.searchParams.get('search') ?? undefined,
      lead_source: url.searchParams.get('lead_source') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid query parameters',
          errors: parseResult.error.flatten().fieldErrors,
          requestId: ctx.requestId,
        },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)

    const supabase = await createClient()

    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null) as unknown as {
        eq: (col: string, val: unknown) => typeof query
        is: (col: string, val: unknown) => typeof query
        or: (filter: string) => typeof query
        order: (col: string, opts: { ascending: boolean }) => typeof query
        range: (from: number, to: number) => Promise<{ data: Client[] | null; count: number | null; error: { message: string } | null }>
      }

    // Filters
    if (filters.lead_source) {
      query = query.eq('lead_source', filters.lead_source) as typeof query
    }
    if (filters.search) {
      const term = `%${escapeLike(filters.search)}%`
      query = query.or(`name.ilike.${term},email.ilike.${term}`) as typeof query
    }

    // Sort and paginate
    const ascending = (filters.sortOrder ?? 'asc') === 'asc'
    query = query.order(filters.sortBy ?? 'name', { ascending }) as typeof query

    const { data: clients, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      logger.error('Failed to list clients', { error: error.message })
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to fetch clients', requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { ...paginatedResponse(clients ?? [], count ?? 0, page, limit), requestId: ctx.requestId }
    )
  },
  {
    requireAuth: true,
    permission: 'clients:read:all',
  }
)

// ============================================================================
// POST /api/v1/clients — Create a new client
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })
    const body = ctx.validatedBody as CreateClientInput

    const supabase = await createClient()

    const { data: client, error } = await (supabase
      .from('clients')
      .insert({
        ...body,
        company_id: ctx.companyId!,
      } as never)
      .select()
      .single() as unknown as Promise<{ data: Client | null; error: { message: string } | null }>)

    if (error || !client) {
      logger.error('Failed to create client', { error: error?.message })
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to create client', requestId: ctx.requestId },
        { status: 500 }
      )
    }

    logger.info('Client created', { clientId: client.id, companyId: ctx.companyId! })

    return NextResponse.json({ data: client }, { status: 201 })
  },
  {
    requireAuth: true,
    schema: createClientSchema,
    permission: 'clients:create:all',
    auditAction: 'client.create',
  }
)
