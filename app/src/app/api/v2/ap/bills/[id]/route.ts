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

    // Validate line totals match header amount (use input.amount if provided, else existing)
    if (input.lines && input.lines.length > 0) {
      const headerAmount = input.amount ?? 0
      if (headerAmount > 0) {
        const lineTotal = input.lines.reduce((sum, line) => sum + line.amount, 0)
        if (Math.abs(lineTotal - headerAmount) > 0.01) {
          return NextResponse.json(
            { error: 'Validation Error', message: `Line items total (${lineTotal.toFixed(2)}) must equal bill amount (${headerAmount.toFixed(2)})`, requestId: ctx.requestId },
            { status: 400 }
          )
        }
      }
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
      .eq('status', existing.status)
      .select('*')
      .single()

    if (billError) {
      const mapped = mapDbError(billError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Replace lines if provided
    if (input.lines) {
      const { error: deleteLineError } = await supabase
        .from('ap_bill_lines')
        .delete()
        .eq('bill_id', id)

      if (deleteLineError) {
        const mapped = mapDbError(deleteLineError)
        return NextResponse.json(
          { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
          { status: mapped.status }
        )
      }

      if (input.lines.length > 0) {
        const lineRecords = input.lines.map((line) => ({
          bill_id: id,
          gl_account_id: line.gl_account_id,
          amount: line.amount,
          description: line.description ?? null,
          job_id: line.job_id ?? null,
          cost_code_id: line.cost_code_id ?? null,
        }))

        const { error: insertLineError } = await supabase
          .from('ap_bill_lines')
          .insert(lineRecords)

        if (insertLineError) {
          const mapped = mapDbError(insertLineError)
          return NextResponse.json(
            { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
            { status: mapped.status }
          )
        }
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
  { requireAuth: true, requiredRoles: ['owner', 'admin', 'pm', 'office'], rateLimit: 'financial', auditAction: 'bill.update' }
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
  { requireAuth: true, requiredRoles: ['owner', 'admin', 'pm', 'office'], rateLimit: 'financial', auditAction: 'bill.archive' }
)
