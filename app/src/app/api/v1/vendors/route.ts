/**
 * Vendors API — List & Create
 *
 * GET  /api/v1/vendors — List vendors for company (paginated, filterable)
 * POST /api/v1/vendors — Create a new vendor
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
import { createVendorSchema, listVendorsSchema, type CreateVendorInput } from '@/lib/validation/schemas/vendors'
import type { Vendor } from '@/types/database'

// ============================================================================
// GET /api/v1/vendors — List vendors for company
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const url = req.nextUrl
    const parseResult = listVendorsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      sortBy: url.searchParams.get('sortBy') ?? undefined,
      sortOrder: url.searchParams.get('sortOrder') ?? undefined,
      search: url.searchParams.get('search') ?? undefined,
      trade: url.searchParams.get('trade') ?? undefined,
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
      .from('vendors')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null) as unknown as {
        eq: (col: string, val: unknown) => typeof query
        is: (col: string, val: unknown) => typeof query
        or: (filter: string) => typeof query
        order: (col: string, opts: { ascending: boolean }) => typeof query
        range: (from: number, to: number) => Promise<{ data: Vendor[] | null; count: number | null; error: { message: string } | null }>
      }

    // Filters
    if (filters.trade) {
      query = query.eq('trade', filters.trade) as typeof query
    }
    if (filters.search) {
      const term = `%${escapeLike(filters.search)}%`
      query = query.or(`name.ilike.${term},dba_name.ilike.${term}`) as typeof query
    }

    // Sort and paginate
    const ascending = (filters.sortOrder ?? 'asc') === 'asc'
    query = query.order(filters.sortBy ?? 'name', { ascending }) as typeof query

    const { data: vendors, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      logger.error('Failed to list vendors', { error: error.message })
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to fetch vendors', requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { ...paginatedResponse(vendors ?? [], count ?? 0, page, limit), requestId: ctx.requestId }
    )
  },
  {
    requireAuth: true,
    permission: 'vendors:read:all',
  }
)

// ============================================================================
// POST /api/v1/vendors — Create a new vendor
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })
    const body = ctx.validatedBody as CreateVendorInput

    const supabase = await createClient()

    const { data: vendor, error } = await (supabase
      .from('vendors')
      .insert({
        ...body,
        company_id: ctx.companyId!,
      } as never)
      .select()
      .single() as unknown as Promise<{ data: Vendor | null; error: { message: string } | null }>)

    if (error || !vendor) {
      logger.error('Failed to create vendor', { error: error?.message })
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to create vendor', requestId: ctx.requestId },
        { status: 500 }
      )
    }

    logger.info('Vendor created', { vendorId: vendor.id, companyId: ctx.companyId! })

    return NextResponse.json({ data: vendor }, { status: 201 })
  },
  {
    requireAuth: true,
    schema: createVendorSchema,
    permission: 'vendors:create:all',
    auditAction: 'vendor.create',
  }
)
