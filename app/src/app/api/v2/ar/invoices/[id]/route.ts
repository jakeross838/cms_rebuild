/**
 * AR Invoice by ID — Get, Update, Delete
 *
 * GET    /api/v2/ar/invoices/:id — Get invoice with line items
 * PUT    /api/v2/ar/invoices/:id — Update invoice
 * DELETE /api/v2/ar/invoices/:id — Soft delete invoice
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateArInvoiceSchema } from '@/lib/validation/schemas/accounting'

// ============================================================================
// GET /api/v2/ar/invoices/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing invoice ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: invoice, error } = await supabase
      .from('ar_invoices')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Invoice not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch invoice lines
    const { data: lines } = await supabase
      .from('ar_invoice_lines')
      .select('*')
      .eq('invoice_id', id)
      .order('created_at', { ascending: true })

    // Fetch receipt applications
    const { data: receipts } = await supabase
      .from('ar_receipt_applications')
      .select('id, receipt_id, amount, created_at')
      .eq('invoice_id', id)
      .order('created_at', { ascending: true })

    return NextResponse.json({
      data: { ...invoice, lines: lines ?? [], receipt_applications: receipts ?? [] },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'financial', requiredRoles: ['owner', 'admin', 'pm', 'office'] }
)

// ============================================================================
// PUT /api/v2/ar/invoices/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing invoice ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = updateArInvoiceSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify invoice exists and is editable
    const { data: existing, error: existingError } = await supabase
      .from('ar_invoices')
      .select('status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      const mapped = mapDbError(existingError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    if (!existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Invoice not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status === 'paid' || existing.status === 'voided') {
      return NextResponse.json(
        { error: 'Conflict', message: `Cannot update an invoice with status "${existing.status}"`, requestId: ctx.requestId },
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
            { error: 'Validation Error', message: `Line items total (${lineTotal.toFixed(2)}) must equal invoice amount (${headerAmount.toFixed(2)})`, requestId: ctx.requestId },
            { status: 400 }
          )
        }
      }
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.client_id !== undefined) updates.client_id = input.client_id
    if (input.job_id !== undefined) updates.job_id = input.job_id
    if (input.invoice_number !== undefined) updates.invoice_number = input.invoice_number
    if (input.invoice_date !== undefined) updates.invoice_date = input.invoice_date
    if (input.due_date !== undefined) updates.due_date = input.due_date
    if (input.amount !== undefined) updates.amount = input.amount
    if (input.terms !== undefined) updates.terms = input.terms
    if (input.notes !== undefined) updates.notes = input.notes
    if (input.status !== undefined) updates.status = input.status

    const { data: invoice, error: invoiceError } = await supabase
      .from('ar_invoices')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .eq('status', existing.status)
      .select('*')
      .single()

    if (invoiceError) {
      const mapped = mapDbError(invoiceError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Replace lines if provided
    if (input.lines) {
      const { error: deleteLineError } = await supabase
        .from('ar_invoice_lines')
        .delete()
        .eq('invoice_id', id)

      if (deleteLineError) {
        const mapped = mapDbError(deleteLineError)
        return NextResponse.json(
          { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
          { status: mapped.status }
        )
      }

      if (input.lines.length > 0) {
        const lineRecords = input.lines.map((line) => ({
          invoice_id: id,
          description: line.description,
          quantity: line.quantity,
          unit_price: line.unit_price,
          amount: line.amount,
          gl_account_id: line.gl_account_id ?? null,
          job_id: line.job_id ?? null,
          cost_code_id: line.cost_code_id ?? null,
        }))

        const { error: insertLineError } = await supabase
          .from('ar_invoice_lines')
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
      .from('ar_invoice_lines')
      .select('*')
      .eq('invoice_id', id)
      .order('created_at', { ascending: true })

    return NextResponse.json({
      data: { ...invoice, lines: lines ?? [] },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, requiredRoles: ['owner', 'admin', 'pm', 'office'], rateLimit: 'financial', auditAction: 'invoice.update' }
)

// ============================================================================
// DELETE /api/v2/ar/invoices/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing invoice ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify invoice exists and is deletable (only draft invoices)
    const { data: existing, error: existingError } = await supabase
      .from('ar_invoices')
      .select('status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      const mapped = mapDbError(existingError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    if (!existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Invoice not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Only draft invoices can be deleted', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { error } = await supabase
      .from('ar_invoices')
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
  { requireAuth: true, requiredRoles: ['owner', 'admin', 'pm', 'office'], rateLimit: 'financial', auditAction: 'invoice.archive' }
)
