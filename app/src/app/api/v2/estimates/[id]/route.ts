/**
 * Estimate by ID — Get, Update, Delete
 *
 * GET    /api/v2/estimates/:id — Get estimate details
 * PUT    /api/v2/estimates/:id — Update estimate
 * DELETE /api/v2/estimates/:id — Soft delete (archive) estimate
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateEstimateSchema } from '@/lib/validation/schemas/estimating'

// ============================================================================
// GET /api/v2/estimates/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing estimate ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Estimate not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch line items count
    const { data: lines } = await supabase
      .from('estimate_line_items')
      .select('id')
      .eq('estimate_id', id)
      .eq('company_id', ctx.companyId!)

    // Fetch sections count
    const { data: sections } = await supabase
      .from('estimate_sections')
      .select('id')
      .eq('estimate_id', id)
      .eq('company_id', ctx.companyId!)

    // Fetch versions
    const { data: versions } = await supabase
      .from('estimate_versions')
      .select('*')
      .eq('estimate_id', id)
      .eq('company_id', ctx.companyId!)
      .order('version_number', { ascending: false })

    return NextResponse.json({
      data: {
        ...data,
        lines_count: (lines ?? []).length,
        sections_count: (sections ?? []).length,
        versions: versions ?? [],
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/estimates/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing estimate ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateEstimateSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify the estimate exists and is editable
    const { data: existing, error: existError } = await supabase
      .from('estimates')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Estimate not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'draft' && existing.status !== 'revised') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only draft or revised estimates can be updated', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    // Build update object (only include fields that were provided)
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.job_id !== undefined) updates.job_id = input.job_id
    if (input.name !== undefined) updates.name = input.name
    if (input.description !== undefined) updates.description = input.description
    if (input.status !== undefined) updates.status = input.status
    if (input.estimate_type !== undefined) updates.estimate_type = input.estimate_type
    if (input.contract_type !== undefined) updates.contract_type = input.contract_type
    if (input.markup_type !== undefined) updates.markup_type = input.markup_type
    if (input.markup_pct !== undefined) updates.markup_pct = input.markup_pct
    if (input.overhead_pct !== undefined) updates.overhead_pct = input.overhead_pct
    if (input.profit_pct !== undefined) updates.profit_pct = input.profit_pct
    if (input.subtotal !== undefined) updates.subtotal = input.subtotal
    if (input.total !== undefined) updates.total = input.total
    if (input.valid_until !== undefined) updates.valid_until = input.valid_until
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await supabase
      .from('estimates')
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
// DELETE /api/v2/estimates/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing estimate ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Only draft estimates can be deleted
    const { data: existing, error: existError } = await supabase
      .from('estimates')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Estimate not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only draft estimates can be deleted', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('estimates')
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
