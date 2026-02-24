/**
 * Integration Installs — List & Create
 *
 * GET  /api/v2/integrations/installs — List installed integrations
 * POST /api/v2/integrations/installs — Install an integration
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import {
  listIntegrationInstallsSchema,
  createIntegrationInstallSchema,
} from '@/lib/validation/schemas/api-marketplace'

// ============================================================================
// GET /api/v2/integrations/installs
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listIntegrationInstallsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      listing_id: url.searchParams.get('listing_id') ?? undefined,
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

    let query = (supabase
      .from('integration_installs') as any)
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.listing_id) {
      query = query.eq('listing_id', filters.listing_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    query = query.order('installed_at', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

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
// POST /api/v2/integrations/installs — Install integration
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createIntegrationInstallSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid install data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify listing exists
    const { data: listing } = await (supabase
      .from('integration_listings') as any)
      .select('id')
      .eq('id', input.listing_id)
      .single()

    if (!listing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Integration listing not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Check for existing install
    const { data: existing } = await (supabase
      .from('integration_installs') as any)
      .select('id, status')
      .eq('company_id', ctx.companyId!)
      .eq('listing_id', input.listing_id)
      .single()

    if (existing && existing.status !== 'uninstalled') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Integration already installed', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { data, error } = await (supabase
      .from('integration_installs') as any)
      .insert({
        company_id: ctx.companyId!,
        listing_id: input.listing_id,
        status: 'installed',
        configuration: input.configuration,
        installed_by: ctx.user!.id,
      })
      .select('*')
      .single()

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Conflict', message: 'Integration already installed', requestId: ctx.requestId },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
