/**
 * Contract by ID — Get, Update, Delete
 *
 * GET    /api/v2/contracts/:id — Get contract details
 * PUT    /api/v2/contracts/:id — Update contract
 * DELETE /api/v2/contracts/:id — Soft delete (archive) contract
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateContractSchema } from '@/lib/validation/schemas/contracts'

// ============================================================================
// GET /api/v2/contracts/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing contract ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Contract not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch signers count
    const { data: signers } = await supabase
      .from('contract_signers')
      .select('id')
      .eq('contract_id', id)

    // Fetch versions
    const { data: versions } = await supabase
      .from('contract_versions')
      .select('*')
      .eq('contract_id', id)
      .order('version_number', { ascending: false })

    return NextResponse.json({
      data: {
        ...data,
        signers_count: (signers ?? []).length,
        versions: versions ?? [],
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/contracts/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing contract ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateContractSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify contract exists and is editable (draft or pending_review)
    const { data: existing, error: existError } = await supabase
      .from('contracts')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Contract not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'draft' && existing.status !== 'pending_review') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Only draft or pending review contracts can be updated', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.contract_number !== undefined) updates.contract_number = input.contract_number
    if (input.title !== undefined) updates.title = input.title
    if (input.description !== undefined) updates.description = input.description
    if (input.job_id !== undefined) updates.job_id = input.job_id
    if (input.contract_type !== undefined) updates.contract_type = input.contract_type
    if (input.status !== undefined) updates.status = input.status
    if (input.template_id !== undefined) updates.template_id = input.template_id
    if (input.vendor_id !== undefined) updates.vendor_id = input.vendor_id
    if (input.client_id !== undefined) updates.client_id = input.client_id
    if (input.contract_value !== undefined) updates.contract_value = input.contract_value
    if (input.retention_pct !== undefined) updates.retention_pct = input.retention_pct
    if (input.start_date !== undefined) updates.start_date = input.start_date
    if (input.end_date !== undefined) updates.end_date = input.end_date
    if (input.content !== undefined) updates.content = input.content
    if (input.metadata !== undefined) updates.metadata = input.metadata

    const { data, error } = await supabase
      .from('contracts')
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
// DELETE /api/v2/contracts/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing contract ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Only draft contracts can be deleted
    const { data: existing, error: existError } = await supabase
      .from('contracts')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Contract not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Only draft contracts can be deleted', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { error } = await supabase
      .from('contracts')
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
