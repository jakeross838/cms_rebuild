/**
 * Invoice Approval Action — PATCH to take action
 *
 * PATCH /api/v2/invoices/:id/approvals/:approvalId — Approve, reject, delegate, or escalate
 *
 * When the final step is approved, the invoice status is updated to 'approved'.
 * When any step is rejected, the invoice status is updated to 'denied'.
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
// typedUpdate removed — new tables not yet in generated Supabase types
import { approvalActionSchema } from '@/lib/validation/schemas/invoices'

// ============================================================================
// PATCH /api/v2/invoices/:id/approvals/:approvalId
// ============================================================================

export const PATCH = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const invoiceId = segments[4]
    const approvalId = segments[6]
    if (!invoiceId || !approvalId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing invoice ID or approval ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = approvalActionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid approval action', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify invoice belongs to this company
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id')
      .eq('id', invoiceId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Invoice not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch the approval step to verify it exists and check role
    const { data: approvalStep } = await (supabase as any).from('invoice_approvals')
      .select('id, status, required_role, assigned_to')
      .eq('id', approvalId)
      .eq('invoice_id', invoiceId)
      .single()

    if (!approvalStep) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Approval step not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Check that the step is actionable
    if (!['pending', 'delegated', 'escalated'].includes(approvalStep.status)) {
      return NextResponse.json(
        { error: 'Conflict', message: `This step is already ${approvalStep.status}`, requestId: ctx.requestId },
        { status: 409 }
      )
    }

    // Role-based enforcement: check if user's role meets the required_role
    const ROLE_HIERARCHY: Record<string, number> = {
      owner: 7, admin: 6, pm: 5, superintendent: 4, office: 3, field: 2, read_only: 1,
    }
    const userRoleLevel = ROLE_HIERARCHY[ctx.user!.role] ?? 0
    const requiredRoleLevel = ROLE_HIERARCHY[approvalStep.required_role] ?? 0

    // User must have the required role level OR be assigned to this step
    if (userRoleLevel < requiredRoleLevel && approvalStep.assigned_to !== ctx.user!.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: `This step requires ${approvalStep.required_role} role or higher`, requestId: ctx.requestId },
        { status: 403 }
      )
    }

    // Build the update payload
    const now = new Date().toISOString()
    const updates: Record<string, unknown> = {
      status: input.action === 'approved' ? 'approved' : input.action,
      action_by: ctx.user!.id,
      action_at: now,
      action_notes: input.notes ?? null,
    }

    if (input.action === 'delegated') {
      updates.delegated_to = input.delegated_to
      updates.assigned_to = input.delegated_to
      updates.status = 'delegated'
    }

    if (input.action === 'escalated') {
      updates.escalated_at = now
      updates.escalation_reason = input.escalation_reason
      updates.status = 'escalated'
    }

    if (input.action === 'rejected') {
      updates.status = 'rejected'
    }

    const { data, error } = await (supabase as any).from('invoice_approvals')
      .update(updates as any)
      .eq('id', approvalId)
      .eq('invoice_id', invoiceId)
      .select('id, invoice_id, step_name, step_order, required_role, threshold_min, threshold_max, assigned_to, status, action_by, action_at, action_notes, delegated_to, escalated_at, escalation_reason, created_at')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // If rejected, update invoice status to 'denied'
    if (input.action === 'rejected') {
      const { error: rejectError } = await supabase.from('invoices')
        .update({ status: 'denied', updated_at: now } as any)
        .eq('id', invoiceId)
        .eq('company_id', ctx.companyId!)
      if (rejectError) {
        const mapped = mapDbError(rejectError)
        return NextResponse.json(
          { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
          { status: mapped.status }
        )
      }
    }

    // If approved, check if this was the final step
    if (input.action === 'approved') {
      const { data: pendingSteps } = await (supabase as any).from('invoice_approvals')
        .select('id')
        .eq('invoice_id', invoiceId)
        .in('status', ['pending', 'delegated', 'escalated'])

      const allApproved = !pendingSteps || pendingSteps.length === 0
      if (allApproved) {
        const { error: approveError } = await supabase.from('invoices')
          .update({ status: 'approved', updated_at: now } as any)
          .eq('id', invoiceId)
          .eq('company_id', ctx.companyId!)
        if (approveError) {
          const mapped = mapDbError(approveError)
          return NextResponse.json(
            { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
            { status: mapped.status }
          )
        }
      }
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
