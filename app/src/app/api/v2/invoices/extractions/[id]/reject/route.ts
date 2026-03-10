/**
 * Reject Extraction — Mark an extraction as rejected
 *
 * POST /api/v2/invoices/extractions/:id/reject
 *
 * Sets the extraction status to 'failed' with the rejection reason.
 * The user can optionally provide a reason.
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createServiceClient } from '@/lib/supabase/service'

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    // URL: /api/v2/invoices/extractions/:id/reject
    const id = segments[segments.length - 2]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing extraction ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const reason = (body as Record<string, unknown>).reason as string | undefined

    const supabase = createServiceClient()
    const companyId = ctx.companyId!
    const userId = ctx.user!.id

    // Verify extraction exists and belongs to this company
    const { data: extraction, error: fetchError } = await supabase
      .from('invoice_extractions' as any)
      .select('id, status')
      .eq('id', id)
      .eq('company_id', companyId)
      .single()

    if (fetchError || !extraction) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Extraction not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Don't allow rejecting already-confirmed extractions
    if (extraction.status === 'confirmed') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Cannot reject an already confirmed extraction', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    // Update extraction status to rejected
    const { error: updateError } = await supabase
      .from('invoice_extractions' as any)
      .update({
        status: 'failed',
        error_message: reason || 'Rejected by user',
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Internal Error', message: 'Failed to reject extraction', requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: { id, status: 'rejected', reason: reason || 'Rejected by user' },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'], auditAction: 'invoice_extraction.reject' }
)
