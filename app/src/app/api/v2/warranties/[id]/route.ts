/**
 * Warranty by ID — Get, Update, Delete
 *
 * GET    /api/v2/warranties/:id — Get warranty details
 * PUT    /api/v2/warranties/:id — Update warranty
 * DELETE /api/v2/warranties/:id — Soft delete warranty
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateWarrantySchema } from '@/lib/validation/schemas/warranty'

// ============================================================================
// GET /api/v2/warranties/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing warranty ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase
      .from('warranties') as any)
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Warranty not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch claims count
    const { data: claims } = await (supabase
      .from('warranty_claims') as any)
      .select('id')
      .eq('warranty_id', id)
      .is('deleted_at', null)

    return NextResponse.json({
      data: {
        ...data,
        claims_count: (claims ?? []).length,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/warranties/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing warranty ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateWarrantySchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify warranty exists
    const { data: existing, error: existError } = await (supabase
      .from('warranties') as any)
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Warranty not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.title !== undefined) updates.title = input.title
    if (input.description !== undefined) updates.description = input.description
    if (input.warranty_type !== undefined) updates.warranty_type = input.warranty_type
    if (input.status !== undefined) updates.status = input.status
    if (input.vendor_id !== undefined) updates.vendor_id = input.vendor_id
    if (input.start_date !== undefined) updates.start_date = input.start_date
    if (input.end_date !== undefined) updates.end_date = input.end_date
    if (input.coverage_details !== undefined) updates.coverage_details = input.coverage_details
    if (input.exclusions !== undefined) updates.exclusions = input.exclusions
    if (input.document_id !== undefined) updates.document_id = input.document_id
    if (input.contact_name !== undefined) updates.contact_name = input.contact_name
    if (input.contact_phone !== undefined) updates.contact_phone = input.contact_phone
    if (input.contact_email !== undefined) updates.contact_email = input.contact_email
    if (input.transferred_to !== undefined) updates.transferred_to = input.transferred_to

    // If transferring, set transferred_at
    if (input.status === 'transferred' && existing.status !== 'transferred') {
      updates.transferred_at = new Date().toISOString()
    }

    const { data, error } = await (supabase
      .from('warranties') as any)
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/warranties/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing warranty ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: existing, error: existError } = await (supabase
      .from('warranties') as any)
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Warranty not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await (supabase
      .from('warranties') as any)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
