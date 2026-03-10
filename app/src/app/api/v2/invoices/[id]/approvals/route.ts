/**
 * Invoice Approvals API — List & Create from Template
 *
 * GET  /api/v2/invoices/:id/approvals — List approval steps for an invoice
 * POST /api/v2/invoices/:id/approvals — Create approval steps from a template
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
// typedInsertMany removed — new tables not yet in generated Supabase types

// ============================================================================
// GET /api/v2/invoices/:id/approvals
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const invoiceId = segments[4]
    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing invoice ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

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

    const { data, error } = await (supabase as any).from('invoice_approvals')
      .select('id, invoice_id, step_name, step_order, required_role, threshold_min, threshold_max, assigned_to, status, action_by, action_at, action_notes, delegated_to, escalated_at, escalation_reason, created_at')
      .eq('invoice_id', invoiceId)
      .order('step_order', { ascending: true })

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: data ?? [], requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/invoices/:id/approvals — Create steps from template
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const invoiceId = segments[4]
    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing invoice ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const templateId = body.template_id as string | undefined

    const supabase = await createClient()

    // Verify invoice belongs to this company
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, amount')
      .eq('id', invoiceId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Invoice not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Find the template: use provided template_id, or fall back to the default invoice template
    let chainId = templateId
    if (!chainId) {
      const { data: defaultTemplate } = await (supabase as any).from('approval_chain_templates')
        .select('id')
        .eq('company_id', ctx.companyId!)
        .eq('chain_type', 'invoice')
        .eq('is_default', true)
        .eq('is_active', true)
        .is('deleted_at', null)
        .single()

      if (!defaultTemplate) {
        return NextResponse.json(
          { error: 'Not Found', message: 'No approval template found. Provide a template_id or set a default invoice approval template.', requestId: ctx.requestId },
          { status: 404 }
        )
      }
      chainId = defaultTemplate.id
    }

    // Get template steps
    const { data: steps, error: stepsError } = await (supabase as any).from('approval_chain_steps')
      .select('step_name, step_order, required_role, threshold_min, threshold_max')
      .eq('chain_id', chainId)
      .order('step_order', { ascending: true })

    if (stepsError || !steps || steps.length === 0) {
      return NextResponse.json(
        { error: 'Not Found', message: 'No steps found for the approval template', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Filter steps by threshold (only include steps whose threshold range covers the invoice amount)
    const invoiceAmount = Number(invoice.amount)
    const applicableSteps = steps.filter((step: any) => {
      const min = step.threshold_min !== null ? Number(step.threshold_min) : 0
      const max = step.threshold_max !== null ? Number(step.threshold_max) : Infinity
      return invoiceAmount >= min && invoiceAmount <= max
    })

    if (applicableSteps.length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'No approval steps apply for this invoice amount', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    // Create approval rows from the template steps
    const rows = applicableSteps.map((step: any) => ({
      invoice_id: invoiceId,
      step_name: step.step_name,
      step_order: step.step_order,
      required_role: step.required_role,
      threshold_min: step.threshold_min,
      threshold_max: step.threshold_max,
      status: 'pending',
    }))

    const { data, error } = await (supabase as any).from('invoice_approvals')
      .insert(rows as any)
      .select('id, invoice_id, step_name, step_order, required_role, threshold_min, threshold_max, assigned_to, status, action_by, action_at, action_notes, delegated_to, escalated_at, escalation_reason, created_at')

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: data ?? [], requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
