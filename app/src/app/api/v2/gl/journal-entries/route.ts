/**
 * GL Journal Entries — List & Create
 *
 * GET  /api/v2/gl/journal-entries — List journal entries
 * POST /api/v2/gl/journal-entries — Create journal entry with lines
 */

import { NextResponse } from 'next/server'
import { escapeLike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listJournalEntriesSchema, createJournalEntrySchema } from '@/lib/validation/schemas/accounting'

// ============================================================================
// GET /api/v2/gl/journal-entries
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listJournalEntriesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      source_type: url.searchParams.get('source_type') ?? undefined,
      start_date: url.searchParams.get('start_date') ?? undefined,
      end_date: url.searchParams.get('end_date') ?? undefined,
      q: url.searchParams.get('q') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    let query = supabase
      .from('gl_journal_entries')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.source_type) {
      query = query.eq('source_type', filters.source_type)
    }
    if (filters.start_date) {
      query = query.gte('entry_date', filters.start_date)
    }
    if (filters.end_date) {
      query = query.lte('entry_date', filters.end_date)
    }
    if (filters.q) {
      query = query.or(`memo.ilike.%${escapeLike(filters.q)}%,reference_number.ilike.%${escapeLike(filters.q)}%`)
    }

    query = query.order('entry_date', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'financial' }
)

// ============================================================================
// POST /api/v2/gl/journal-entries
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createJournalEntrySchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid journal entry data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data

    // Validate debits = credits (must balance)
    const totalDebits = input.lines.reduce((sum, line) => sum + (line.debit_amount ?? 0), 0)
    const totalCredits = input.lines.reduce((sum, line) => sum + (line.credit_amount ?? 0), 0)

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return NextResponse.json(
        { error: 'Validation Error', message: `Journal entry must balance. Debits: ${totalDebits.toFixed(2)}, Credits: ${totalCredits.toFixed(2)}`, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create the journal entry
    const { data: entry, error: entryError } = await supabase
      .from('gl_journal_entries')
      .insert({
        company_id: ctx.companyId!,
        entry_date: input.entry_date,
        reference_number: input.reference_number ?? null,
        memo: input.memo ?? null,
        status: 'draft',
        source_type: input.source_type,
        source_id: input.source_id ?? null,
        created_by: ctx.user!.id,
      })
      .select('*')
      .single()

    if (entryError) {
      const mapped = mapDbError(entryError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Create the journal lines
    const lineRecords = input.lines.map((line) => ({
      journal_entry_id: entry.id,
      account_id: line.account_id,
      debit_amount: line.debit_amount ?? 0,
      credit_amount: line.credit_amount ?? 0,
      memo: line.memo ?? null,
      job_id: line.job_id ?? null,
      cost_code_id: line.cost_code_id ?? null,
      vendor_id: line.vendor_id ?? null,
      client_id: line.client_id ?? null,
    }))

    const { data: lines, error: linesError } = await supabase
      .from('gl_journal_lines')
      .insert(lineRecords)
      .select('*')

    if (linesError) {
      const mapped2 = mapDbError(linesError)
      return NextResponse.json(
        { error: mapped2.error, message: mapped2.message, requestId: ctx.requestId },
        { status: mapped2.status }
      )
    }

    return NextResponse.json({ data: { ...entry, lines: lines ?? [] }, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'financial', auditAction: 'journal_entry.create' }
)
