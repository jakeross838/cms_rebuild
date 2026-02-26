/**
 * Builder Custom Domain by ID — Get, Update, Delete
 *
 * GET    /api/v2/branding/domains/:id — Get domain
 * PUT    /api/v2/branding/domains/:id — Update domain
 * DELETE /api/v2/branding/domains/:id — Soft delete domain
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateDomainSchema } from '@/lib/validation/schemas/white-label'

// ============================================================================
// GET /api/v2/branding/domains/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing domain ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('builder_custom_domains')
      .select('id, company_id, domain, subdomain, status, ssl_status, verified_at, ssl_issued_at, ssl_expires_at, is_primary, created_at, updated_at, deleted_at')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Domain not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)

// ============================================================================
// PUT /api/v2/branding/domains/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing domain ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateDomainSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.domain !== undefined) updates.domain = input.domain
    if (input.subdomain !== undefined) updates.subdomain = input.subdomain
    if (input.status !== undefined) {
      updates.status = input.status
      if (input.status === 'active') {
        updates.verified_at = new Date().toISOString()
      }
    }
    if (input.ssl_status !== undefined) {
      updates.ssl_status = input.ssl_status
      if (input.ssl_status === 'issued') {
        updates.ssl_issued_at = new Date().toISOString()
      }
    }
    if (input.is_primary !== undefined) updates.is_primary = input.is_primary
    if (input.verification_token !== undefined) updates.verification_token = input.verification_token

    const { data, error } = await supabase
      .from('builder_custom_domains')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('id, company_id, domain, subdomain, status, ssl_status, verified_at, ssl_issued_at, ssl_expires_at, is_primary, created_at, updated_at, deleted_at')
      .single()

    if (error || !data) {
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'], auditAction: 'branding_domain.update' }
)

// ============================================================================
// DELETE /api/v2/branding/domains/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing domain ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: existing, error: existingError } = await supabase
      .from('builder_custom_domains')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      const mapped = mapDbError(existingError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    if (!existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Domain not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('builder_custom_domains')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'], auditAction: 'branding_domain.archive' }
)
