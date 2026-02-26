/**
 * Migration Field Mapping by ID — Get, Update, Delete
 *
 * GET    /api/v2/data-migration/jobs/:id/mappings/:mappingId — Get mapping
 * PUT    /api/v2/data-migration/jobs/:id/mappings/:mappingId — Update mapping
 * DELETE /api/v2/data-migration/jobs/:id/mappings/:mappingId — Delete mapping
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateFieldMappingSchema } from '@/lib/validation/schemas/data-migration'

/**
 * Extract job ID and mapping ID from URL path
 */
function extractIds(pathname: string): { jobId: string | null; mappingId: string | null } {
  const segments = pathname.split('/')
  const jobsIdx = segments.indexOf('jobs')
  const mappingsIdx = segments.indexOf('mappings')
  return {
    jobId: jobsIdx >= 0 && segments.length > jobsIdx + 1 ? segments[jobsIdx + 1] : null,
    mappingId: mappingsIdx >= 0 && segments.length > mappingsIdx + 1 ? segments[mappingsIdx + 1] : null,
  }
}

// ============================================================================
// GET /api/v2/data-migration/jobs/:id/mappings/:mappingId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { jobId, mappingId } = extractIds(req.nextUrl.pathname)
    if (!jobId || !mappingId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing job or mapping ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('migration_field_mappings')
      .select('*')
      .eq('id', mappingId)
      .eq('job_id', jobId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Field mapping not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)

// ============================================================================
// PUT /api/v2/data-migration/jobs/:id/mappings/:mappingId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { jobId, mappingId } = extractIds(req.nextUrl.pathname)
    if (!jobId || !mappingId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing job or mapping ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateFieldMappingSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.source_field !== undefined) updates.source_field = input.source_field
    if (input.target_table !== undefined) updates.target_table = input.target_table
    if (input.target_field !== undefined) updates.target_field = input.target_field
    if (input.transform_type !== undefined) updates.transform_type = input.transform_type
    if (input.transform_config !== undefined) updates.transform_config = input.transform_config
    if (input.is_required !== undefined) updates.is_required = input.is_required
    if (input.default_value !== undefined) updates.default_value = input.default_value
    if (input.sample_source_value !== undefined) updates.sample_source_value = input.sample_source_value
    if (input.sample_target_value !== undefined) updates.sample_target_value = input.sample_target_value
    if (input.sort_order !== undefined) updates.sort_order = input.sort_order

    const { data, error } = await supabase
      .from('migration_field_mappings')
      .update(updates)
      .eq('id', mappingId)
      .eq('job_id', jobId)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }
    if (!data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Field mapping not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'], auditAction: 'data_migration_jobs_mapping.update' }
)

// ============================================================================
// DELETE /api/v2/data-migration/jobs/:id/mappings/:mappingId — Hard delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { jobId, mappingId } = extractIds(req.nextUrl.pathname)
    if (!jobId || !mappingId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing job or mapping ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: existing, error: existingError } = await supabase
      .from('migration_field_mappings')
      .select('id')
      .eq('id', mappingId)
      .eq('job_id', jobId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      const mapped = mapDbError(existingError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    if (!existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Field mapping not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('migration_field_mappings')
      .delete()
      .eq('id', mappingId)
      .eq('job_id', jobId)
      .eq('company_id', ctx.companyId!)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'], auditAction: 'data_migration_jobs_mapping.archive' }
)
