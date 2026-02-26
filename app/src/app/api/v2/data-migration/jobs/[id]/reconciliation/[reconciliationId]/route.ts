/**
 * Migration Reconciliation by ID — Get, Update
 *
 * GET /api/v2/data-migration/jobs/:id/reconciliation/:reconciliationId — Get reconciliation
 * PUT /api/v2/data-migration/jobs/:id/reconciliation/:reconciliationId — Update reconciliation
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateReconciliationSchema } from '@/lib/validation/schemas/data-migration'

/**
 * Extract job ID and reconciliation ID from pathname
 */
function extractIds(pathname: string): { jobId: string | null; reconciliationId: string | null } {
  const segments = pathname.split('/')
  const jIdx = segments.indexOf('jobs')
  const rIdx = segments.indexOf('reconciliation')
  return {
    jobId: jIdx !== -1 && jIdx + 1 < segments.length ? segments[jIdx + 1] : null,
    reconciliationId: rIdx !== -1 && rIdx + 1 < segments.length ? segments[rIdx + 1] : null,
  }
}

// ============================================================================
// GET /api/v2/data-migration/jobs/:id/reconciliation/:reconciliationId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { jobId, reconciliationId } = extractIds(req.nextUrl.pathname)
    if (!jobId || !reconciliationId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing job or reconciliation ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('migration_reconciliation')
      .select('*')
      .eq('id', reconciliationId)
      .eq('job_id', jobId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Reconciliation record not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)

// ============================================================================
// PUT /api/v2/data-migration/jobs/:id/reconciliation/:reconciliationId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { jobId, reconciliationId } = extractIds(req.nextUrl.pathname)
    if (!jobId || !reconciliationId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing job or reconciliation ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateReconciliationSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.source_count !== undefined) updates.source_count = input.source_count
    if (input.imported_count !== undefined) updates.imported_count = input.imported_count
    if (input.matched_count !== undefined) updates.matched_count = input.matched_count
    if (input.unmatched_count !== undefined) updates.unmatched_count = input.unmatched_count
    if (input.discrepancies !== undefined) updates.discrepancies = input.discrepancies
    if (input.status !== undefined) updates.status = input.status
    if (input.notes !== undefined) updates.notes = input.notes

    // Auto-set reconciled_at when status transitions to reconciled
    if (input.status === 'reconciled') {
      updates.reconciled_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('migration_reconciliation')
      .update(updates)
      .eq('id', reconciliationId)
      .eq('job_id', jobId)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Reconciliation record not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)
