/**
 * Migration Reconciliation API — List & Create
 *
 * GET  /api/v2/data-migration/jobs/:id/reconciliation — List reconciliation records for a job
 * POST /api/v2/data-migration/jobs/:id/reconciliation — Create a new reconciliation record
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listReconciliationSchema, createReconciliationSchema } from '@/lib/validation/schemas/data-migration'

/**
 * Extract job ID from /api/v2/data-migration/jobs/:id/reconciliation
 */
function extractJobId(pathname: string): string | null {
  const segments = pathname.split('/')
  const idx = segments.indexOf('jobs')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v2/data-migration/jobs/:id/reconciliation
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const jobId = extractJobId(req.nextUrl.pathname)
    if (!jobId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing job ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listReconciliationSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      entity_type: url.searchParams.get('entity_type') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    // Verify job belongs to company
    const { data: job, error: jError } = await supabase
      .from('migration_jobs')
      .select('id')
      .eq('id', jobId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (jError || !job) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Migration job not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    let query = supabase
      .from('migration_reconciliation')
      .select('*', { count: 'exact' })
      .eq('job_id', jobId)
      .eq('company_id', ctx.companyId!)

    if (filters.entity_type) {
      query = query.eq('entity_type', filters.entity_type)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/data-migration/jobs/:id/reconciliation — Create reconciliation
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const jobId = extractJobId(req.nextUrl.pathname)
    if (!jobId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing job ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createReconciliationSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid reconciliation data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify job belongs to company
    const { data: job, error: jError } = await supabase
      .from('migration_jobs')
      .select('id')
      .eq('id', jobId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (jError || !job) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Migration job not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('migration_reconciliation')
      .insert({
        company_id: ctx.companyId!,
        job_id: jobId,
        entity_type: input.entity_type,
        source_count: input.source_count,
        imported_count: input.imported_count,
        matched_count: input.matched_count,
        unmatched_count: input.unmatched_count,
        discrepancies: input.discrepancies,
        status: input.status,
        notes: input.notes ?? null,
      })
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
