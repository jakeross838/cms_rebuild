/**
 * Portal Shared Documents API — List & Share
 *
 * GET  /api/v2/portal/documents?job_id=... — List shared documents for a job
 * POST /api/v2/portal/documents             — Share a document to the portal
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import {
  listSharedDocumentsSchema,
  shareDocumentSchema,
} from '@/lib/validation/schemas/client-portal'

// ============================================================================
// GET /api/v2/portal/documents
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listSharedDocumentsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
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

    const query = supabase
      .from('portal_shared_documents')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .eq('job_id', filters.job_id)
      .order('shared_at', { ascending: false })

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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// POST /api/v2/portal/documents — Share a document
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = shareDocumentSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid share data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('portal_shared_documents')
      .insert({
        company_id: ctx.companyId!,
        job_id: input.job_id,
        document_id: input.document_id,
        shared_by: ctx.user!.id,
        notes: input.notes ?? null,
      })
      .select('*')
      .single()

    if (error) {
      // Unique constraint violation means already shared
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Conflict', message: 'Document is already shared to this job portal', requestId: ctx.requestId },
          { status: 409 }
        )
      }
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'portal_document.create' }
)
