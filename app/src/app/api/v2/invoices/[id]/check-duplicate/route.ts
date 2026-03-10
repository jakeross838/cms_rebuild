/**
 * Check Duplicate — POST /api/v2/invoices/:id/check-duplicate
 *
 * Checks if the given invoice is a duplicate by:
 * 1. Generating a SHA-256 hash from vendor_id, invoice_number, and amount
 * 2. Checking the invoice_hashes table for an exact hash match
 * 3. If no exact match, querying recent invoices from the same vendor
 *    and running near-duplicate detection (edit distance + amount similarity)
 *
 * Returns: { isDuplicate, confidence, reason, duplicateOfId? }
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { generateInvoiceHash, isNearDuplicate } from '@/lib/invoice/duplicate-detection'
import { createClient } from '@/lib/supabase/server'

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    // URL: /api/v2/invoices/:id/check-duplicate → id is at index length - 2
    const id = segments[segments.length - 2]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing invoice ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 1. Fetch the invoice to get vendor_id, invoice_number, amount
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
          isDuplicate: false,
          confidence: 0,
          reason: 'Insufficient data for duplicate detection (missing vendor_id or invoice_number)',
        },
        requestId: ctx.requestId,
      })
    }

    // 2. Generate hash
    const hash = generateInvoiceHash(invoice.vendor_id, invoice.invoice_number, invoice.amount)

    // 3. Check invoice_hashes for exact match (table not in generated types)
    const { data: exactMatch, error: hashError } = await (supabase as any)
      .from('invoice_hashes')
      .select('invoice_id, vendor_id, invoice_number, amount')
      .eq('company_id', ctx.companyId!)
      .eq('hash', hash)
      .neq('invoice_id', id)
      .limit(1)
      .maybeSingle()

    if (hashError) {
      const mapped = mapDbError(hashError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    if (exactMatch) {
      return NextResponse.json({
        data: {
          isDuplicate: true,
          confidence: 0.99,
          reason: 'Exact match on vendor, invoice number, and amount',
          duplicateOfId: exactMatch.invoice_id,
        },
        requestId: ctx.requestId,
      })
    }

    // 4. Near-duplicate check: query recent invoices from the same vendor
    const { data: recentInvoices, error: recentError } = await supabase
      .from('invoices')
      .select('id, vendor_id, invoice_number, amount')
      .eq('company_id', ctx.companyId!)
      .eq('vendor_id', invoice.vendor_id)
      .neq('id', id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (recentError) {
      const mapped = mapDbError(recentError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    const candidate = {
      vendor_id: invoice.vendor_id,
      invoice_number: invoice.invoice_number,
      amount: invoice.amount,
    }

    for (const existing of recentInvoices ?? []) {
      if (!existing.invoice_number) continue

      const result = isNearDuplicate(
        {
          vendor_id: existing.vendor_id ?? '',
          invoice_number: existing.invoice_number,
          amount: existing.amount,
        },
        candidate
      )

      if (result.isDuplicate) {
        return NextResponse.json({
          data: {
            isDuplicate: true,
            confidence: result.confidence,
            reason: result.reason,
            duplicateOfId: existing.id,
          },
          requestId: ctx.requestId,
        })
      }
    }

    // 5. No duplicate found
    return NextResponse.json({
      data: {
        isDuplicate: false,
        confidence: 0,
        reason: '',
      },
      requestId: ctx.requestId,
    })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office'],
    auditAction: 'invoice.check_duplicate',
  }
)
