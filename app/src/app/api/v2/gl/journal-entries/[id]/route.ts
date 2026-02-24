/**
 * GL Journal Entry by ID — Get & Update
 *
 * GET /api/v2/gl/journal-entries/:id — Get journal entry with lines
 * PUT /api/v2/gl/journal-entries/:id — Update draft journal entry
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateJournalEntrySchema } from '@/lib/validation/schemas/accounting'

// ============================================================================
// GET /api/v2/gl/journal-entries/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing journal entry ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: entry, error } = await (supabase as any)
      .from('gl_journal_entries')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Journal entry not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch lines
    const { data: lines } = await (supabase as any)
      .from('gl_journal_lines')
      .select('*')
      .eq('journal_entry_id', id)
      .order('created_at', { ascending: true })

    return NextResponse.json({
      data: { ...entry, lines: lines ?? [] },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/gl/journal-entries/:id — Only draft entries can be updated
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing journal entry ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = updateJournalEntrySchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify entry exists and is in draft status
    const { data: existing } = await (supabase as any)
      .from('gl_journal_entries')
      .select('status')
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
        { error: 'Conflict', message: 'Only draft journal entries can be updated', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    // If lines are being updated, validate balance
    if (input.lines) {
      const totalDebits = input.lines.reduce((sum, line) => sum + (line.debit_amount ?? 0), 0)
      const totalCredits = input.lines.reduce((sum, line) => sum + (line.credit_amount ?? 0), 0)

      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        return NextResponse.json(
          { error: 'Validation Error', message: `Journal entry must balance. Debits: ${totalDebits.toFixed(2)}, Credits: ${totalCredits.toFixed(2)}`, requestId: ctx.requestId },
          { status: 400 }
        )
      }
    }

    // Update entry header
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.entry_date !== undefined) updates.entry_date = input.entry_date
    if (input.reference_number !== undefined) updates.reference_number = input.reference_number
    if (input.memo !== undefined) updates.memo = input.memo

    const { data: entry, error: entryError } = await (supabase as any)
      .from('gl_journal_entries')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (entryError) {
      return NextResponse.json(
        { error: 'Database Error', message: entryError.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    // Replace lines if provided
    if (input.lines) {
      // Delete existing lines
      await (supabase as any)
        .from('gl_journal_lines')
        .delete()
        .eq('journal_entry_id', id)

      // Insert new lines
      const lineRecords = input.lines.map((line) => ({
        journal_entry_id: id,
        account_id: line.account_id,
        debit_amount: line.debit_amount ?? 0,
        credit_amount: line.credit_amount ?? 0,
        memo: line.memo ?? null,
        job_id: line.job_id ?? null,
        cost_code_id: line.cost_code_id ?? null,
        vendor_id: line.vendor_id ?? null,
        client_id: line.client_id ?? null,
      }))

      await (supabase as any)
        .from('gl_journal_lines')
        .insert(lineRecords)
    }

    // Fetch updated lines
    const { data: lines } = await (supabase as any)
      .from('gl_journal_lines')
      .select('*')
      .eq('journal_entry_id', id)
      .order('created_at', { ascending: true })

    return NextResponse.json({
      data: { ...entry, lines: lines ?? [] },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
)
