/**
 * Migration Validation Result by ID — Get, Update
 *
 * GET /api/v2/data-migration/jobs/:id/validations/:validationId — Get validation result
 * PUT /api/v2/data-migration/jobs/:id/validations/:validationId — Update validation result
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateValidationResultSchema } from '@/lib/validation/schemas/data-migration'

/**
 * Extract job ID and validation ID from pathname
 */
function extractIds(pathname: string): { jobId: string | null; validationId: string | null } {
  const segments = pathname.split('/')
  const jIdx = segments.indexOf('jobs')
  const vIdx = segments.indexOf('validations')
  return {
    jobId: jIdx !== -1 && jIdx + 1 < segments.length ? segments[jIdx + 1] : null,
    validationId: vIdx !== -1 && vIdx + 1 < segments.length ? segments[vIdx + 1] : null,
  }
}

// ============================================================================
// GET /api/v2/data-migration/jobs/:id/validations/:validationId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { jobId, validationId } = extractIds(req.nextUrl.pathname)
    if (!jobId || !validationId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing job or validation ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('migration_validation_results')
      .select('*')
      .eq('id', validationId)
      .eq('job_id', jobId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Validation result not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/data-migration/jobs/:id/validations/:validationId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { jobId, validationId } = extractIds(req.nextUrl.pathname)
    if (!jobId || !validationId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing job or validation ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateValidationResultSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = {}
    if (input.is_resolved !== undefined) {
      updates.is_resolved = input.is_resolved
      if (input.is_resolved) {
        updates.resolved_at = new Date().toISOString()
        updates.resolved_by = ctx.user!.id
      } else {
        updates.resolved_at = null
        updates.resolved_by = null
      }
    }
    if (input.severity !== undefined) updates.severity = input.severity
    if (input.message !== undefined) updates.message = input.message

    const { data, error } = await supabase
      .from('migration_validation_results')
      .update(updates)
      .eq('id', validationId)
      .eq('job_id', jobId)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Validation result not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
