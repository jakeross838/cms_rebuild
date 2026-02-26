/**
 * Client Approval API — GET & PUT single
 *
 * GET /api/v2/client-portal/approvals/:id — Get approval
 * PUT /api/v2/client-portal/approvals/:id — Update (approve/reject)
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  mapDbError,
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

    const { data, error } = await supabase
      .from('client_approvals')
      .select('id, company_id, job_id, client_user_id, approval_type, reference_id, title, description, status, requested_at, responded_at, expires_at, signature_data, signature_ip, comments, requested_by, created_at, updated_at, deleted_at')
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
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
    const { data: existing, error: fetchError } = await supabase
      .from('client_approvals')
      .select('id, company_id, job_id, client_user_id, approval_type, reference_id, title, description, status, requested_at, responded_at, expires_at, signature_data, signature_ip, comments, requested_by, created_at, updated_at, deleted_at')
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

    const { data, error } = await supabase
      .from('client_approvals')
      .update(updateFields)
      .eq('id', approvalId)
      .eq('company_id', ctx.companyId!)
      .select('id, company_id, job_id, client_user_id, approval_type, reference_id, title, description, status, requested_at, responded_at, expires_at, signature_data, signature_ip, comments, requested_by, created_at, updated_at, deleted_at')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'client_portal_approval.update' }
)
