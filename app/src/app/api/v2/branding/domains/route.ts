/**
 * Builder Custom Domains API — List & Create
 *
 * GET  /api/v2/branding/domains — List custom domains
 * POST /api/v2/branding/domains — Add a new custom domain
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
import { listDomainsSchema, createDomainSchema } from '@/lib/validation/schemas/white-label'

// ============================================================================
// GET /api/v2/branding/domains
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listDomainsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
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
      .from('builder_custom_domains')
      .select('id, company_id, domain, subdomain, status, ssl_status, verified_at, ssl_issued_at, ssl_expires_at, is_primary, created_at, updated_at, deleted_at', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.q) {
      query = query.or(`domain.ilike.%${escapeLike(filters.q)}%,subdomain.ilike.%${escapeLike(filters.q)}%`)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)

// ============================================================================
// POST /api/v2/branding/domains — Create domain
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createDomainSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid domain data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Generate verification token
    const verificationToken = crypto.randomUUID().replace(/-/g, '')

    const { data, error } = await supabase
      .from('builder_custom_domains')
      .insert({
        company_id: ctx.companyId!,
        domain: input.domain,
        subdomain: input.subdomain ?? null,
        status: 'pending',
        ssl_status: 'pending',
        verification_token: verificationToken,
        is_primary: input.is_primary,
      })
      .select('id, company_id, domain, subdomain, status, ssl_status, verified_at, ssl_issued_at, ssl_expires_at, is_primary, created_at, updated_at, deleted_at')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Conflict', message: 'Domain already exists', requestId: ctx.requestId },
          { status: 409 }
        )
      }
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'], auditAction: 'branding_domain.create' }
)
