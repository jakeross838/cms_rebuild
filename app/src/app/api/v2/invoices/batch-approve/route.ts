/**
 * Batch Approve/Deny Invoices
 *
 * POST /api/v2/invoices/batch-approve — Approve or deny multiple invoices at once
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { invoice_ids, action, notes } = await req.json()

    if (!Array.isArray(invoice_ids) || invoice_ids.length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'invoice_ids array required', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    if (!['approved', 'denied'].includes(action)) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'action must be approved or denied', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const results: { id: string; success: boolean; error?: string }[] = []

    for (const invoiceId of invoice_ids) {
      try {
        const { data: invoice, error: fetchError } = await (supabase as any)
          .from('invoices')
          .select('id, status, amount, company_id')
          .eq('id', invoiceId)
          .eq('company_id', ctx.companyId!)
          .is('deleted_at', null)
          .single()

        if (fetchError || !invoice) {
          results.push({ id: invoiceId, success: false, error: 'Invoice not found' })
          continue
        }

        const approvableStatuses = ['pm_pending', 'accountant_pending', 'owner_pending']
        if (!approvableStatuses.includes(invoice.status)) {
          results.push({ id: invoiceId, success: false, error: `Cannot ${action} invoice in ${invoice.status} status` })
          continue
        }

        const newStatus = action === 'approved' ? 'approved' : 'denied'

        const { error: updateError } = await (supabase as any)
          .from('invoices')
          .update({
            status: newStatus,
            approved_by: action === 'approved' ? ctx.user!.id : null,
            approved_at: action === 'approved' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', invoiceId)

        if (updateError) {
          results.push({ id: invoiceId, success: false, error: updateError.message })
          continue
        }

        await (supabase as any)
          .from('invoice_approvals')
          .update({
            status: action,
            action_by: ctx.user!.id,
            action_at: new Date().toISOString(),
            action_notes: notes || `Batch ${action}`,
          })
          .eq('invoice_id', invoiceId)
          .eq('status', 'pending')

        results.push({ id: invoiceId, success: true })
      } catch {
        results.push({ id: invoiceId, success: false, error: 'Processing error' })
      }
    }

    const successCount = results.filter(r => r.success).length

    return NextResponse.json({
      data: {
        total: invoice_ids.length,
        successful: successCount,
        failed: invoice_ids.length - successCount,
        results,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'invoice.batch_approve' }
)
