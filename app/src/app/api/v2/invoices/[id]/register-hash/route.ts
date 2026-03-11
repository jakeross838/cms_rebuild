/**
 * Register Hash — POST /api/v2/invoices/:id/register-hash
 *
 * Called after invoice creation to register its duplicate-detection hash.
 * Generates a SHA-256 hash from vendor_id, invoice_number, and amount,
 * inserts it into the invoice_hashes table, and updates the invoice
 * with the duplicate_hash value.
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { generateInvoiceHash } from '@/lib/invoice/duplicate-detector'
import { createClient } from '@/lib/supabase/server'

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    // URL: /api/v2/invoices/:id/register-hash → id is at index length - 2
    const id = segments[segments.length - 2]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing invoice ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 1. Fetch the invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, company_id, vendor_id, invoice_number, amount')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (invoiceError) {
      const mapped = mapDbError(invoiceError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    if (!invoice.vendor_id || !invoice.invoice_number) {
      return NextResponse.json({
        data: {
          success: false,
          reason: 'Cannot generate hash: missing vendor_id or invoice_number',
        },
        requestId: ctx.requestId,
      })
    }

    // 2. Generate hash
    const hash = generateInvoiceHash(invoice.vendor_id, invoice.invoice_number, invoice.amount)

    // 3. Insert into invoice_hashes (table not in generated types)
    const { error: insertError } = await (supabase as any)
      .from('invoice_hashes')
      .upsert(
        {
          company_id: ctx.companyId!,
          invoice_id: id,
          hash,
          vendor_id: invoice.vendor_id,
          invoice_number: invoice.invoice_number,
          amount: invoice.amount,
        },
        { onConflict: 'company_id,hash' }
      )

    if (insertError) {
      const mapped = mapDbError(insertError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // 4. Update the invoice with the duplicate_hash
    const { error: updateError } = await (supabase as any)
      .from('invoices')
      .update({
        duplicate_hash: hash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    if (updateError) {
      const mapped = mapDbError(updateError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({
      data: { success: true, hash },
      requestId: ctx.requestId,
    })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office'],
    auditAction: 'invoice.register_hash',
  }
)
