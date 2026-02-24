/**
 * Permit Documents API — List & Create
 *
 * GET  /api/v2/permits/:id/documents — List documents for a permit
 * POST /api/v2/permits/:id/documents — Attach a document to a permit
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listPermitDocumentsSchema, createPermitDocumentSchema } from '@/lib/validation/schemas/permitting'

// ============================================================================
// GET /api/v2/permits/:id/documents
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const permitId = segments[segments.indexOf('permits') + 1]

    const url = req.nextUrl
    const parseResult = listPermitDocumentsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    // Verify permit ownership
    const { error: permitError } = await (supabase
      .from('permits') as any)
      .select('id')
      .eq('id', permitId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (permitError) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Permit not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, count, error } = await (supabase
      .from('permit_documents') as any)
      .select('*', { count: 'exact' })
      .eq('permit_id', permitId)
      .eq('company_id', ctx.companyId!)
      .order('uploaded_at', { ascending: false })
      .range(offset, offset + limit - 1)

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
// POST /api/v2/permits/:id/documents — Attach document
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const permitId = segments[segments.indexOf('permits') + 1]

    const body = await req.json()
    const parseResult = createPermitDocumentSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid document data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify permit ownership
    const { error: permitError } = await (supabase
      .from('permits') as any)
      .select('id')
      .eq('id', permitId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (permitError) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Permit not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await (supabase
      .from('permit_documents') as any)
      .insert({
        company_id: ctx.companyId!,
        permit_id: permitId,
        document_type: input.document_type,
        file_url: input.file_url,
        file_name: input.file_name ?? null,
        description: input.description ?? null,
        uploaded_by: ctx.user!.id,
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
