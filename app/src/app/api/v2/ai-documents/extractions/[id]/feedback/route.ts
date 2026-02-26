/**
 * AI Feedback for Extraction — List & Create
 *
 * GET  /api/v2/ai-documents/extractions/:id/feedback — List feedback for extraction
 * POST /api/v2/ai-documents/extractions/:id/feedback — Create feedback
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listFeedbackSchema, createFeedbackSchema } from '@/lib/validation/schemas/ai-document-processing'

// ============================================================================
// GET /api/v2/ai-documents/extractions/:id/feedback
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    // URL: /api/v2/ai-documents/extractions/[id]/feedback
    const extractionId = segments[segments.length - 2]
    if (!extractionId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing extraction ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listFeedbackSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      feedback_type: url.searchParams.get('feedback_type') ?? undefined,
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
      .from('ai_feedback')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .eq('extraction_id', extractionId)

    if (filters.feedback_type) {
      query = query.eq('feedback_type', filters.feedback_type)
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
// POST /api/v2/ai-documents/extractions/:id/feedback
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const extractionId = segments[segments.length - 2]
    if (!extractionId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing extraction ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createFeedbackSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid feedback data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify extraction exists and belongs to company
    const { data: extraction, error: extractionError } = await supabase
      .from('document_extractions')
      .select('id')
      .eq('id', extractionId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (extractionError || !extraction) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Extraction not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('ai_feedback')
      .insert({
        company_id: ctx.companyId!,
        extraction_id: extractionId,
        field_name: input.field_name,
        original_value: input.original_value ?? null,
        corrected_value: input.corrected_value ?? null,
        feedback_type: input.feedback_type,
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
  { requireAuth: true, rateLimit: 'heavy', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'ai_extraction_feedback.create' }
)
