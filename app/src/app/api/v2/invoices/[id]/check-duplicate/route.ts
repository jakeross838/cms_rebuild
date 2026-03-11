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
import { checkForDuplicates } from '@/lib/invoice/duplicate-detector'
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
      .select('id, company_id, vendor_id, invoice_number, amount, invoice_date')
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

    // Use the new duplicate detector for comprehensive checks
    const result = await checkForDuplicates(
      supabase,
      ctx.companyId!,
      {
        vendor_id: invoice.vendor_id,
        invoice_number: invoice.invoice_number,
        amount: invoice.amount,
        invoice_date: invoice.invoice_date,
      },
      id // exclude this invoice from matches
    )

    if (result.has_duplicate && result.match) {
      return NextResponse.json({
        data: {
          isDuplicate: true,
          confidence: result.match.confidence,
          reason: result.match.reason,
          duplicateOfId: result.match.invoice_id,
          matchType: result.match.match_type,
          allMatches: result.all_matches.map((m) => ({
            invoiceId: m.invoice_id,
            invoiceNumber: m.invoice_number,
            amount: m.amount,
            confidence: m.confidence,
            reason: m.reason,
            matchType: m.match_type,
          })),
        },
        requestId: ctx.requestId,
      })
    }

    // No duplicate found
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
