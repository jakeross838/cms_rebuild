/**
 * Client Approval API — GET & PUT single
 *
 * GET /api/v2/client-portal/approvals/:id — Get approval
 * PUT /api/v2/client-portal/approvals/:id — Update (approve/reject)
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateClientApprovalSchema } from '@/lib/validation/schemas/client-portal'

// ============================================================================
// GET /api/v2/client-portal/approvals/:id
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const urlParts = req.nextUrl.pathname.split('/')
    const approvalId = urlParts[urlParts.length - 1]

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('client_approvals')
      .select('*')
      .eq('id', approvalId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Approval not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/client-portal/approvals/:id — Approve/Reject
// ============================================================================

export const PUT = createApiHandler(
  async (req, ctx: ApiContext) => {
    const urlParts = req.nextUrl.pathname.split('/')
    const approvalId = urlParts[urlParts.length - 1]

    const body = await req.json()
    const parseResult = updateClientApprovalSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid approval data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Check existing approval
    const { data: existing, error: fetchError } = await (supabase as any)
      .from('client_approvals')
      .select('*')
      .eq('id', approvalId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Approval not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Only pending approvals can be approved/rejected
    if (existing.status !== 'pending' && input.status && input.status !== existing.status) {
      return NextResponse.json(
        { error: 'Conflict', message: `Cannot change status from ${existing.status}`, requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const updateFields: Record<string, unknown> = {}
    if (input.status !== undefined) {
      updateFields.status = input.status
      if (input.status === 'approved' || input.status === 'rejected') {
        updateFields.responded_at = new Date().toISOString()
      }
    }
    if (input.comments !== undefined) updateFields.comments = input.comments
    if (input.signature_data !== undefined) updateFields.signature_data = input.signature_data
    if (input.signature_ip !== undefined) updateFields.signature_ip = input.signature_ip
    if (input.signature_hash !== undefined) updateFields.signature_hash = input.signature_hash

    const { data, error } = await (supabase as any)
      .from('client_approvals')
      .update(updateFields)
      .eq('id', approvalId)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
