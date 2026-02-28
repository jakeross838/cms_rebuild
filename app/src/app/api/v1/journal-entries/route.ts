/**
 * Journal Entries API — List & Create
 *
 * GET  /api/v1/journal-entries — List journal entries for company (paginated, filterable)
 * POST /api/v1/journal-entries — Create a new journal entry with lines (transactional)
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  mapDbError,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { safeOrIlike } from '@/lib/utils'
import {
  listJournalEntriesSchema,
  createJournalEntrySchema,
} from '@/lib/validation/schemas/accounting'
import type { GlJournalEntry, GlJournalLine } from '@/types/accounting'

// ============================================================================
// GET /api/v1/journal-entries — List journal entries for company
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

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
        {
          error: 'Validation Error',
          message: 'Invalid query parameters',
          errors: parseResult.error.flatten().fieldErrors,
          requestId: ctx.requestId,
        },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)

    const supabase = await createClient()

    let query = supabase
      .from('gl_journal_entries')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!) as unknown as {
        eq: (col: string, val: unknown) => typeof query
        gte: (col: string, val: string) => typeof query
        lte: (col: string, val: string) => typeof query
        or: (filter: string) => typeof query
        order: (col: string, opts: { ascending: boolean }) => typeof query
        range: (from: number, to: number) => Promise<{ data: GlJournalEntry[] | null; count: number | null; error: { message: string } | null }>
      }

    // Filters
    if (filters.status) {
      query = query.eq('status', filters.status) as typeof query
    }
    if (filters.source_type) {
      query = query.eq('source_type', filters.source_type) as typeof query
    }
    if (filters.start_date) {
      query = query.gte('entry_date', filters.start_date) as typeof query
    }
    if (filters.end_date) {
      query = query.lte('entry_date', filters.end_date) as typeof query
    }
    if (filters.q) {
      query = query.or(`memo.ilike.${safeOrIlike(filters.q)},reference_number.ilike.${safeOrIlike(filters.q)}`) as typeof query
    }

    query = query.order('entry_date', { ascending: false }) as typeof query

    const { data: entries, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      logger.error('Failed to list journal entries', { error: error.message })
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(
      { ...paginatedResponse(entries ?? [], count ?? 0, page, limit), requestId: ctx.requestId }
    )
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ============================================================================
// POST /api/v1/journal-entries — Create journal entry + lines (transactional)
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })
    const body = ctx.validatedBody as Record<string, unknown>

    // Extract lines from body — they are inserted separately after the entry
    const { lines, ...entryData } = body as { lines: Record<string, unknown>[]; [key: string]: unknown }

    const supabase = await createClient()

    // Step 1 — Insert the journal entry header
    const { data: entry, error: entryError } = await (supabase
      .from('gl_journal_entries')
      .insert({
        ...entryData,
        company_id: ctx.companyId!,
        created_by: ctx.user!.id,
        status: 'draft',
      } as never)
      .select()
      .single() as unknown as Promise<{ data: GlJournalEntry | null; error: { message: string } | null }>)

    if (entryError || !entry) {
      logger.error('Failed to create journal entry', { error: entryError?.message })
      const mapped = mapDbError(entryError ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Step 2 — Insert journal lines with the new entry ID
    const lineInserts = lines.map((line) => ({
      ...line,
      journal_entry_id: entry.id,
    }))

    const { data: insertedLines, error: linesError } = await (supabase
      .from('gl_journal_lines')
      .insert(lineInserts as never)
      .select() as unknown as Promise<{ data: GlJournalLine[] | null; error: { message: string } | null }>)

    if (linesError) {
      logger.error('Failed to create journal lines', { error: linesError.message, entryId: entry.id })
      const mapped = mapDbError(linesError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('Journal entry created', { entryId: entry.id, companyId: ctx.companyId!, lineCount: insertedLines?.length ?? 0 })

    return NextResponse.json(
      { data: { ...entry, lines: insertedLines ?? [] }, requestId: ctx.requestId },
      { status: 201 }
    )
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'office'],
    schema: createJournalEntrySchema,
    permission: 'jobs:update:all',
    auditAction: 'journal_entry.create',
  }
)
