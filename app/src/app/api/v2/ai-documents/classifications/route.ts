/**
 * Document Classifications API — List & Create
 *
 * GET  /api/v2/ai-documents/classifications — List classifications
 * POST /api/v2/ai-documents/classifications — Create a classification
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
import { listClassificationsSchema, createClassificationSchema } from '@/lib/validation/schemas/ai-document-processing'

// ============================================================================
// GET /api/v2/ai-documents/classifications
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listClassificationsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      document_id: url.searchParams.get('document_id') ?? undefined,
      classified_type: url.searchParams.get('classified_type') ?? undefined,
      min_confidence: url.searchParams.get('min_confidence') ?? undefined,
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

    let query = supabase
      .from('document_classifications')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.document_id) {
      query = query.eq('document_id', filters.document_id)
    }
    if (filters.classified_type) {
      query = query.eq('classified_type', filters.classified_type)
    }
    if (filters.min_confidence !== undefined) {
      query = query.gte('confidence_score', filters.min_confidence)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// POST /api/v2/ai-documents/classifications
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createClassificationSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid classification data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('document_classifications')
      .insert({
        company_id: ctx.companyId!,
        document_id: input.document_id,
        classified_type: input.classified_type,
        confidence_score: input.confidence_score,
        model_version: input.model_version ?? null,
        metadata: input.metadata,
        created_by: ctx.user!.id,
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
  { requireAuth: true, rateLimit: 'heavy', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'ai_classification.create' }
)
