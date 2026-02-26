/**
 * Migration Job by ID — Get, Update, Delete
 *
 * GET    /api/v2/data-migration/jobs/:id — Get migration job
 * PUT    /api/v2/data-migration/jobs/:id — Update migration job
 * DELETE /api/v2/data-migration/jobs/:id — Soft delete migration job
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateMigrationJobSchema } from '@/lib/validation/schemas/data-migration'

// ============================================================================
// GET /api/v2/data-migration/jobs/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing job ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('migration_jobs')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Migration job not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Get counts for related entities
    const [mappingsResult, validationsResult, reconciliationResult] = await Promise.all([
      supabase.from('migration_field_mappings')
        .select('id', { count: 'exact', head: true })
        .eq('job_id', id)
        .eq('company_id', ctx.companyId!),
      supabase.from('migration_validation_results')
        .select('id', { count: 'exact', head: true })
        .eq('job_id', id)
        .eq('company_id', ctx.companyId!),
      supabase.from('migration_reconciliation')
        .select('id', { count: 'exact', head: true })
        .eq('job_id', id)
        .eq('company_id', ctx.companyId!),
    ])

    return NextResponse.json({
      data: {
        ...data,
        mappings_count: mappingsResult.count ?? 0,
        validations_count: validationsResult.count ?? 0,
        reconciliation_count: reconciliationResult.count ?? 0,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)

// ============================================================================
// PUT /api/v2/data-migration/jobs/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing job ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateMigrationJobSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.name !== undefined) updates.name = input.name
    if (input.description !== undefined) updates.description = input.description
    if (input.source_platform !== undefined) updates.source_platform = input.source_platform
    if (input.status !== undefined) updates.status = input.status
    if (input.source_file_url !== undefined) updates.source_file_url = input.source_file_url
    if (input.source_file_name !== undefined) updates.source_file_name = input.source_file_name
    if (input.total_records !== undefined) updates.total_records = input.total_records
    if (input.processed_records !== undefined) updates.processed_records = input.processed_records
    if (input.failed_records !== undefined) updates.failed_records = input.failed_records
    if (input.skipped_records !== undefined) updates.skipped_records = input.skipped_records
    if (input.error_log !== undefined) updates.error_log = input.error_log

    // Auto-set timestamps on status transitions
    if (input.status === 'running') {
      updates.started_at = new Date().toISOString()
    }
    if (input.status === 'completed' || input.status === 'failed') {
      updates.completed_at = new Date().toISOString()
    }
    if (input.status === 'rolled_back') {
      updates.rolled_back_at = new Date().toISOString()
      updates.rolled_back_by = ctx.user!.id
    }

    const { data, error } = await supabase
      .from('migration_jobs')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error || !data) {
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'], auditAction: 'data_migration_job.update' }
)

// ============================================================================
// DELETE /api/v2/data-migration/jobs/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing job ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: existing, error: existingError } = await supabase
      .from('migration_jobs')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
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
        { error: 'Not Found', message: 'Migration job not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('migration_jobs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'], auditAction: 'data_migration_job.archive' }
)
