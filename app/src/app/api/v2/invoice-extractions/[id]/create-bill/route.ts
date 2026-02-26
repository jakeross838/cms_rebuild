/**
 * Create AP Bill from Extraction API
 *
 * POST /api/v2/invoice-extractions/:id/create-bill — Create an AP bill from extraction data
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { createBillFromExtractionSchema } from '@/lib/validation/schemas/invoice-processing'

// ============================================================================
// POST /api/v2/invoice-extractions/:id/create-bill
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    // Extract the extraction ID from the URL path
    const segments = req.nextUrl.pathname.split('/')
    const createBillIdx = segments.indexOf('create-bill')
    const id = createBillIdx > 0 ? segments[createBillIdx - 1] : null

    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing extraction ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createBillFromExtractionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid bill data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify extraction exists, belongs to company, and is in completed status
    const { data: extraction, error: fetchError } = await supabase
      .from('invoice_extractions')
      .select('id, status, matched_bill_id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (fetchError || !extraction) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Extraction not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (extraction.status !== 'completed') {
      return NextResponse.json(
        { error: 'Conflict', message: `Cannot create bill from extraction in '${extraction.status}' status. Must be 'completed'.`, requestId: ctx.requestId },
        { status: 409 }
      )
    }

    // Check if a bill has already been created from this extraction
    if (extraction.matched_bill_id) {
      return NextResponse.json(
        { error: 'Conflict', message: 'A bill has already been created from this extraction', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    // Create the AP bill
    const { data: bill, error: billError } = await supabase
      .from('ap_bills')
      .insert({
        company_id: ctx.companyId!,
        vendor_id: input.vendor_id,
        bill_number: input.bill_number,
        bill_date: input.bill_date ?? new Date().toISOString().split('T')[0],
        due_date: input.due_date ?? null,
        amount: input.amount,
        balance_due: input.amount,
        status: 'draft' as const,
        job_id: input.job_id ?? null,
        description: input.description ?? null,
        created_by: ctx.user!.id,
      } as never)
      .select('*')
      .single()

    if (billError) {
      return NextResponse.json(
        { error: 'Database Error', message: billError.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    // Create bill lines if provided
    if (input.lines && input.lines.length > 0) {
      const lineRecords = input.lines.map((line) => ({
        bill_id: bill.id,
        gl_account_id: line.gl_account_id ?? null,
        amount: line.amount,
        description: line.description ?? null,
        job_id: line.job_id ?? null,
        cost_code_id: line.cost_code_id ?? null,
      }))
      await supabase.from('ap_bill_lines').insert(lineRecords as never)
    }

    // Link extraction to the bill
    const now = new Date().toISOString()
    await supabase
      .from('invoice_extractions')
      .update({
        matched_bill_id: bill.id,
        updated_at: now,
      })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    // Log audit entry
    await supabase
      .from('extraction_audit_log')
      .insert({
        extraction_id: id,
        action: 'matched',
        details: {
          bill_id: bill.id,
          bill_number: input.bill_number,
          amount: input.amount,
          vendor_id: input.vendor_id,
        },
        performed_by: ctx.user!.id,
      })

    return NextResponse.json({ data: bill, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
