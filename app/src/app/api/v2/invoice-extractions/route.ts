/**
 * Invoice Extractions API — List & Create
 *
 * GET  /api/v2/invoice-extractions — List extractions with filters
 * POST /api/v2/invoice-extractions — Trigger new extraction for a document
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import {
  listExtractionsSchema,
  createExtractionSchema,
} from '@/lib/validation/schemas/invoice-processing'

// ============================================================================
// GET /api/v2/invoice-extractions
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listExtractionsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      document_id: url.searchParams.get('document_id') ?? undefined,
      vendor_match_id: url.searchParams.get('vendor_match_id') ?? undefined,
      job_match_id: url.searchParams.get('job_match_id') ?? undefined,
      q: url.searchParams.get('q') ?? undefined,
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
      .from('invoice_extractions')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.document_id) {
      query = query.eq('document_id', filters.document_id)
    }
    if (filters.vendor_match_id) {
      query = query.eq('vendor_match_id', filters.vendor_match_id)
    }
    if (filters.job_match_id) {
      query = query.eq('job_match_id', filters.job_match_id)
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
// POST /api/v2/invoice-extractions — Trigger extraction
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

    // Create the extraction record with pending status
    const { data: extraction, error: extractionError } = await supabase
      .from('invoice_extractions')
      .insert({
        company_id: ctx.companyId!,
        document_id: input.document_id,
        status: 'pending',
        extracted_data: {},
        extraction_model: input.extraction_model ?? null,
      })
      .select('*')
      .single()

    if (extractionError) {
      const mapped = mapDbError(extractionError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Log audit entry (non-blocking)
    const { error: auditErr } = await supabase
      .from('extraction_audit_log')
      .insert({
        extraction_id: extraction.id,
        action: 'created',
        details: { document_id: input.document_id, extraction_model: input.extraction_model ?? null },
        performed_by: ctx.user!.id,
      })
    if (auditErr) console.error('Failed to record extraction audit log:', auditErr.message)

    return NextResponse.json({ data: extraction, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
