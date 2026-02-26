/**
 * AP Bill by ID — Get, Update, Delete
 *
 * GET    /api/v2/ap/bills/:id — Get bill with line items
 * PUT    /api/v2/ap/bills/:id — Update bill
 * DELETE /api/v2/ap/bills/:id — Soft delete bill
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateBillSchema } from '@/lib/validation/schemas/accounting'

// ============================================================================
// GET /api/v2/ap/bills/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing bill ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: bill, error } = await supabase
      .from('ap_bills')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Bill not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch bill lines
    const { data: lines } = await supabase
      .from('ap_bill_lines')
      .select('*')
      .eq('bill_id', id)
      .order('created_at', { ascending: true })

    // Fetch payment applications
    const { data: payments } = await supabase
      .from('ap_payment_applications')
      .select('id, payment_id, amount, created_at')
      .eq('bill_id', id)
      .order('created_at', { ascending: true })

    return NextResponse.json({
      data: { ...bill, lines: lines ?? [], payment_applications: payments ?? [] },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'financial' }
)

// ============================================================================
// PUT /api/v2/ap/bills/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing bill ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = updateBillSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify bill exists and is editable
    const { data: existing } = await supabase
      .from('ap_bills')
      .select('status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Bill not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status === 'paid' || existing.status === 'voided') {
      return NextResponse.json(
        { error: 'Conflict', message: `Cannot update a bill with status "${existing.status}"`, requestId: ctx.requestId },
        { status: 409 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.vendor_id !== undefined) updates.vendor_id = input.vendor_id
    if (input.bill_number !== undefined) updates.bill_number = input.bill_number
    if (input.bill_date !== undefined) updates.bill_date = input.bill_date
    if (input.due_date !== undefined) updates.due_date = input.due_date
    if (input.amount !== undefined) updates.amount = input.amount
    if (input.description !== undefined) updates.description = input.description
    if (input.job_id !== undefined) updates.job_id = input.job_id
    if (input.received_date !== undefined) updates.received_date = input.received_date
    if (input.terms !== undefined) updates.terms = input.terms
    if (input.status !== undefined) updates.status = input.status

    const { data: bill, error: billError } = await supabase
      .from('ap_bills')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (billError) {
      return NextResponse.json(
        { error: 'Database Error', message: billError.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    // Replace lines if provided
    if (input.lines) {
      await supabase
        .from('ap_bill_lines')
        .delete()
        .eq('bill_id', id)

      if (input.lines.length > 0) {
        const lineRecords = input.lines.map((line) => ({
          bill_id: id,
          gl_account_id: line.gl_account_id,
          amount: line.amount,
          description: line.description ?? null,
          job_id: line.job_id ?? null,
          cost_code_id: line.cost_code_id ?? null,
        }))

        await supabase
          .from('ap_bill_lines')
          .insert(lineRecords)
      }
    }

    // Fetch updated lines
    const { data: lines } = await supabase
      .from('ap_bill_lines')
      .select('*')
      .eq('bill_id', id)
      .order('created_at', { ascending: true })

    return NextResponse.json({
      data: { ...bill, lines: lines ?? [] },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'financial', auditAction: 'bill.update' }
)

// ============================================================================
// DELETE /api/v2/ap/bills/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing bill ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify bill exists and is deletable (only draft bills)
    const { data: existing } = await supabase
      .from('ap_bills')
      .select('status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Bill not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Only draft bills can be deleted', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { error } = await supabase
      .from('ap_bills')
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
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
  { requireAuth: true, rateLimit: 'financial', auditAction: 'bill.archive' }
)
