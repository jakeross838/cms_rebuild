/**
 * Document Extractions API — List & Create
 *
 * GET  /api/v2/ai-documents/extractions — List extractions
 * POST /api/v2/ai-documents/extractions — Create an extraction
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listExtractionsSchema, createExtractionSchema } from '@/lib/validation/schemas/ai-document-processing'

// ============================================================================
// GET /api/v2/ai-documents/extractions
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listExtractionsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      document_id: url.searchParams.get('document_id') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      classification_id: url.searchParams.get('classification_id') ?? undefined,
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

    let query = (supabase
      .from('document_extractions') as any)
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.document_id) {
      query = query.eq('document_id', filters.document_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.classification_id) {
      query = query.eq('classification_id', filters.classification_id)
    }

    query = query.order('created_at', { ascending: false })

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
// POST /api/v2/ai-documents/extractions
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createExtractionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid extraction data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase
      .from('document_extractions') as any)
      .insert({
        company_id: ctx.companyId!,
        document_id: input.document_id,
        classification_id: input.classification_id ?? null,
        extraction_template_id: input.extraction_template_id ?? null,
        extracted_data: input.extracted_data,
        status: input.status,
        created_by: ctx.user!.id,
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
