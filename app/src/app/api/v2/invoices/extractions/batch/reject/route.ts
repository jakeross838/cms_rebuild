/**
 * Batch Reject Extractions — Reject multiple AI extractions
 *
 * POST /api/v2/invoices/extractions/batch/reject
 *
 * Accepts up to 50 extraction IDs. For each actionable extraction, sets status
 * to 'failed' with the rejection reason.
 */

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createServiceClient } from '@/lib/supabase/service'

const BatchRejectSchema = z.object({
  extraction_ids: z.array(z.string().uuid()).min(1).max(50),
  reason: z.string().optional(),
})

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const body = ctx.validatedBody as z.infer<typeof BatchRejectSchema>
    const { extraction_ids, reason } = body

    const supabase = createServiceClient()
    const companyId = ctx.companyId!
    const userId = ctx.user!.id

    const results: Array<{
      extraction_id: string
      status: 'rejected' | 'error'
      error?: string
    }> = []

    let rejected = 0
    let errors = 0

    for (const extractionId of extraction_ids) {
      try {
        // Fetch extraction — verify it belongs to company
        const { data: extraction, error: fetchError } = await (supabase as any)
          .from('invoice_extractions')
          .select('id, status, reviewed_by')
          .eq('id', extractionId)
          .eq('company_id', companyId)
          .single()

        if (fetchError || !extraction) {
          results.push({ extraction_id: extractionId, status: 'error', error: 'Extraction not found' })
          errors++
          continue
        }

        // Only actionable statuses: completed (not yet reviewed) or needs_review
        const isActionable =
          (extraction.status === 'completed' && !extraction.reviewed_by) ||
          extraction.status === 'needs_review'

        if (!isActionable) {
          results.push({ extraction_id: extractionId, status: 'error', error: `Not actionable (status: ${extraction.status})` })
          errors++
          continue
        }

        // Update extraction to rejected
        const { error: updateError } = await (supabase as any)
          .from('invoice_extractions')
          .update({
            status: 'failed',
            error_message: reason || 'Rejected by user (batch)',
            reviewed_by: userId,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', extractionId)

        if (updateError) {
          results.push({ extraction_id: extractionId, status: 'error', error: 'Failed to update extraction' })
          errors++
          continue
        }

        results.push({ extraction_id: extractionId, status: 'rejected' })
        rejected++
      } catch (err) {
        results.push({
          extraction_id: extractionId,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        })
        errors++
      }
    }

    return NextResponse.json({
      data: { rejected, errors, results },
      requestId: ctx.requestId,
    })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'office'],
    schema: BatchRejectSchema,
    auditAction: 'invoice_extraction.batch_reject',
  }
)
