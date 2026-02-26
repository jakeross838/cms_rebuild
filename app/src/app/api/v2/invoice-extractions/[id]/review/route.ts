/**
 * Invoice Extraction Review API
 *
 * POST /api/v2/invoice-extractions/:id/review — Approve or reject extraction
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { reviewExtractionSchema } from '@/lib/validation/schemas/invoice-processing'

// ============================================================================
// POST /api/v2/invoice-extractions/:id/review
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    // Extract the extraction ID from the URL path
    const segments = req.nextUrl.pathname.split('/')
    const reviewIdx = segments.indexOf('review')
    const id = reviewIdx > 0 ? segments[reviewIdx - 1] : null

    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing extraction ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = reviewExtractionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid review data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const { decision, notes, corrections } = parseResult.data
    const supabase = await createClient()

    // Verify extraction exists and is in a reviewable state
    const { data: existing, error: fetchError } = await supabase
      .from('invoice_extractions')
      .select('id, status, extracted_data')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Extraction not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Only pending, completed, or needs_review extractions can be reviewed
    const reviewableStatuses = ['pending', 'completed', 'needs_review']
    if (!reviewableStatuses.includes(existing.status)) {
      return NextResponse.json(
        { error: 'Conflict', message: `Cannot review extraction in '${existing.status}' status`, requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const now = new Date().toISOString()

    // Apply corrections to extracted_data if provided
    const updatedData = corrections
      ? { ...(existing.extracted_data as Record<string, unknown> ?? {}), ...corrections }
      : existing.extracted_data

    // Determine new status based on decision
    const newStatus = decision === 'approved' ? 'completed' : 'failed'

    // Update extraction
    const { data: updated, error: updateError } = await supabase
      .from('invoice_extractions')
      .update({
        status: newStatus,
        extracted_data: updatedData,
        reviewed_by: ctx.user!.id,
        reviewed_at: now,
        updated_at: now,
      })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (updateError) {
      const mapped = mapDbError(updateError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Log audit entry (non-blocking)
    const { error: auditErr } = await supabase
      .from('extraction_audit_log')
      .insert({
        extraction_id: id,
        action: decision === 'approved' ? 'approved' : 'rejected',
        details: {
          decision,
          notes: notes ?? null,
          had_corrections: !!corrections,
        },
        performed_by: ctx.user!.id,
      })
    if (auditErr) console.error('Failed to record extraction audit log:', auditErr.message)

    return NextResponse.json({ data: updated, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'financial' }
)
