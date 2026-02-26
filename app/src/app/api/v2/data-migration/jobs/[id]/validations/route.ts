/**
 * Migration Validation Results API — List & Create
 *
 * GET  /api/v2/data-migration/jobs/:id/validations — List validation results for a job
 * POST /api/v2/data-migration/jobs/:id/validations — Create a new validation result
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
import { listValidationResultsSchema, createValidationResultSchema } from '@/lib/validation/schemas/data-migration'

/**
 * Extract job ID from /api/v2/data-migration/jobs/:id/validations
 */
function extractJobId(pathname: string): string | null {
  const segments = pathname.split('/')
  const idx = segments.indexOf('jobs')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v2/data-migration/jobs/:id/validations
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
    const parseResult = listValidationResultsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      validation_type: url.searchParams.get('validation_type') ?? undefined,
      severity: url.searchParams.get('severity') ?? undefined,
      is_resolved: url.searchParams.get('is_resolved') ?? undefined,
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
      .from('migration_validation_results')
      .select('*', { count: 'exact' })
      .eq('job_id', jobId)
      .eq('company_id', ctx.companyId!)

    if (filters.validation_type) {
      query = query.eq('validation_type', filters.validation_type)
    }
    if (filters.severity) {
      query = query.eq('severity', filters.severity)
    }
    if (filters.is_resolved !== undefined) {
      query = query.eq('is_resolved', filters.is_resolved)
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
// POST /api/v2/data-migration/jobs/:id/validations — Create validation result
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
    const parseResult = createValidationResultSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid validation result data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
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
      .from('migration_validation_results')
      .insert({
        company_id: ctx.companyId!,
        job_id: jobId,
        validation_type: input.validation_type,
        severity: input.severity,
        field_name: input.field_name ?? null,
        record_index: input.record_index ?? null,
        source_value: input.source_value ?? null,
        message: input.message,
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
