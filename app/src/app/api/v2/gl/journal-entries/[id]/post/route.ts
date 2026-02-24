/**
 * Post Journal Entry — Draft → Posted
 *
 * POST /api/v2/gl/journal-entries/:id/post — Post a draft journal entry
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

// ============================================================================
// POST /api/v2/gl/journal-entries/:id/post
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2] // /journal-entries/:id/post
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing journal entry ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify entry exists and is in draft status
    const { data: existing } = await (supabase
      .from('gl_journal_entries') as any)
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Journal entry not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Conflict', message: `Cannot post a journal entry with status "${existing.status}". Only draft entries can be posted.`, requestId: ctx.requestId },
        { status: 409 }
      )
    }

    // Verify lines exist and balance
    const { data: lines } = await (supabase
      .from('gl_journal_lines') as any)
      .select('debit_amount, credit_amount')
      .eq('journal_entry_id', id)

    if (!lines || lines.length < 2) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Journal entry must have at least 2 lines to be posted', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const totalDebits = lines.reduce((sum: number, l: { debit_amount: number }) => sum + Number(l.debit_amount), 0)
    const totalCredits = lines.reduce((sum: number, l: { credit_amount: number }) => sum + Number(l.credit_amount), 0)

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return NextResponse.json(
        { error: 'Validation Error', message: `Journal entry must balance before posting. Debits: ${totalDebits.toFixed(2)}, Credits: ${totalCredits.toFixed(2)}`, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    // Post the entry
    const now = new Date().toISOString()
    const { data: entry, error } = await (supabase
      .from('gl_journal_entries') as any)
      .update({
        status: 'posted',
        posted_by: ctx.user!.id,
        posted_at: now,
        updated_at: now,
      })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: entry, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
