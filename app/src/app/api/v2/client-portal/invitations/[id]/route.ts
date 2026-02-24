/**
 * Client Portal Invitation API — GET, PUT, DELETE single
 *
 * GET    /api/v2/client-portal/invitations/:id — Get invitation
 * PUT    /api/v2/client-portal/invitations/:id — Update invitation
 * DELETE /api/v2/client-portal/invitations/:id — Soft delete (revoke)
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateClientInvitationSchema } from '@/lib/validation/schemas/client-portal'

// ============================================================================
// GET /api/v2/client-portal/invitations/:id
// ============================================================================

export const GET = createApiHandler(
  async (_req, ctx: ApiContext) => {
    const id = ctx.requestId // will be overridden below
    const urlParts = _req.nextUrl.pathname.split('/')
    const invitationId = urlParts[urlParts.length - 1]

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('client_portal_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Invitation not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/client-portal/invitations/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req, ctx: ApiContext) => {
    const urlParts = req.nextUrl.pathname.split('/')
    const invitationId = urlParts[urlParts.length - 1]

    const body = await req.json()
    const parseResult = updateClientInvitationSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid invitation data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updateFields: Record<string, unknown> = {}
    if (input.status !== undefined) updateFields.status = input.status
    if (input.client_name !== undefined) updateFields.client_name = input.client_name
    if (input.message !== undefined) updateFields.message = input.message

    // If accepting, set accepted_at and accepted_by
    if (input.status === 'accepted') {
      updateFields.accepted_at = new Date().toISOString()
      updateFields.accepted_by = ctx.user!.id
    }

    const { data, error } = await (supabase as any)
      .from('client_portal_invitations')
      .update(updateFields)
      .eq('id', invitationId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Invitation not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/client-portal/invitations/:id — Soft delete (revoke)
// ============================================================================

export const DELETE = createApiHandler(
  async (req, ctx: ApiContext) => {
    const urlParts = req.nextUrl.pathname.split('/')
    const invitationId = urlParts[urlParts.length - 1]

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('client_portal_invitations')
      .update({
        deleted_at: new Date().toISOString(),
        status: 'revoked',
      })
      .eq('id', invitationId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Invitation not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
