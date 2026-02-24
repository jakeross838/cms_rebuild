/**
 * Migration Field Mappings API — List & Create
 *
 * GET  /api/v2/data-migration/jobs/:id/mappings — List mappings for a job
 * POST /api/v2/data-migration/jobs/:id/mappings — Create a new mapping
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listFieldMappingsSchema, createFieldMappingSchema } from '@/lib/validation/schemas/data-migration'

/**
 * Extract job ID from /api/v2/data-migration/jobs/:id/mappings
 */
function extractJobId(pathname: string): string | null {
  const segments = pathname.split('/')
  const idx = segments.indexOf('jobs')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v2/data-migration/jobs/:id/mappings
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
    const parseResult = listFieldMappingsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      target_table: url.searchParams.get('target_table') ?? undefined,
      transform_type: url.searchParams.get('transform_type') ?? undefined,
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
    const { data: job, error: jError } = await (supabase as any)
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

    let query = (supabase as any)
      .from('migration_field_mappings')
      .select('*', { count: 'exact' })
      .eq('job_id', jobId)
      .eq('company_id', ctx.companyId!)

    if (filters.target_table) {
      query = query.eq('target_table', filters.target_table)
    }
    if (filters.transform_type) {
      query = query.eq('transform_type', filters.transform_type)
    }

    query = query.order('sort_order', { ascending: true })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/data-migration/jobs/:id/mappings — Create mapping
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
    const parseResult = createFieldMappingSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid mapping data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify job belongs to company
    const { data: job, error: jError } = await (supabase as any)
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

    const { data, error } = await (supabase as any)
      .from('migration_field_mappings')
      .insert({
        company_id: ctx.companyId!,
        job_id: jobId,
        source_field: input.source_field,
        target_table: input.target_table,
        target_field: input.target_field,
        transform_type: input.transform_type,
        transform_config: input.transform_config,
        is_required: input.is_required,
        default_value: input.default_value ?? null,
        sample_source_value: input.sample_source_value ?? null,
        sample_target_value: input.sample_target_value ?? null,
        sort_order: input.sort_order,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
