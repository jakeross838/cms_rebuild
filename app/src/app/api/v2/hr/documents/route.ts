/**
 * Employee Documents API — List & Create
 *
 * GET  /api/v2/hr/documents — List employee documents
 * POST /api/v2/hr/documents — Upload/create employee document record
 */

import { NextResponse } from 'next/server'
import { escapeLike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listEmployeeDocumentsSchema, createEmployeeDocumentSchema } from '@/lib/validation/schemas/hr-workforce'

// ============================================================================
// GET /api/v2/hr/documents
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listEmployeeDocumentsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      employee_id: url.searchParams.get('employee_id') ?? undefined,
      document_type: url.searchParams.get('document_type') ?? undefined,
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
      .from('employee_documents')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.employee_id) {
      query = query.eq('employee_id', filters.employee_id)
    }
    if (filters.document_type) {
      query = query.eq('document_type', filters.document_type)
    }
    if (filters.q) {
      query = query.or(`title.ilike.%${escapeLike(filters.q)}%,description.ilike.%${escapeLike(filters.q)}%,file_name.ilike.%${escapeLike(filters.q)}%`)
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
// POST /api/v2/hr/documents
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createEmployeeDocumentSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid document data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify employee exists and belongs to company
    const { data: emp, error: empError } = await supabase
      .from('employees')
      .select('id')
      .eq('id', input.employee_id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (empError || !emp) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Employee not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('employee_documents')
      .insert({
        company_id: ctx.companyId!,
        employee_id: input.employee_id,
        document_type: input.document_type,
        title: input.title,
        description: input.description ?? null,
        file_url: input.file_url ?? null,
        file_name: input.file_name ?? null,
        file_size_bytes: input.file_size_bytes ?? null,
        uploaded_by: ctx.user!.id,
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)
