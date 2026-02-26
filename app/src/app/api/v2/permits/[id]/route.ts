/**
 * Permit by ID — Get, Update, Delete
 *
 * GET    /api/v2/permits/:id — Get permit details
 * PUT    /api/v2/permits/:id — Update permit
 * DELETE /api/v2/permits/:id — Soft delete (archive) permit
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updatePermitSchema } from '@/lib/validation/schemas/permitting'

// ============================================================================
// GET /api/v2/permits/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing permit ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('permits')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Permit not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch inspections count
    const { data: inspections } = await supabase
      .from('permit_inspections')
      .select('id')
      .eq('permit_id', id)

    // Fetch documents count
    const { data: documents } = await supabase
      .from('permit_documents')
      .select('id')
      .eq('permit_id', id)

    // Fetch fees
    const { data: fees } = await supabase
      .from('permit_fees')
      .select('*')
      .eq('permit_id', id)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      data: {
        ...data,
        inspections_count: (inspections ?? []).length,
        documents_count: (documents ?? []).length,
        fees: fees ?? [],
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/permits/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing permit ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updatePermitSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify the permit exists
    const { data: existing, error: existError } = await supabase
      .from('permits')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Permit not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Build update object (only include fields that were provided)
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.permit_number !== undefined) updates.permit_number = input.permit_number
    if (input.permit_type !== undefined) updates.permit_type = input.permit_type
    if (input.status !== undefined) updates.status = input.status
    if (input.jurisdiction !== undefined) updates.jurisdiction = input.jurisdiction
    if (input.applied_date !== undefined) updates.applied_date = input.applied_date
    if (input.issued_date !== undefined) updates.issued_date = input.issued_date
    if (input.expiration_date !== undefined) updates.expiration_date = input.expiration_date
    if (input.conditions !== undefined) updates.conditions = input.conditions
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await supabase
      .from('permits')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/permits/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing permit ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify permit exists
    const { data: existing, error: existError } = await supabase
      .from('permits')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Permit not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Only draft permits can be deleted
    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only draft permits can be deleted', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('permits')
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
  { requireAuth: true, rateLimit: 'api' }
)
