/**
 * Journal Entries API — Get & Update Single Entry
 *
 * GET   /api/v1/journal-entries/[id] — Get a single journal entry with lines
 * PATCH /api/v1/journal-entries/[id] — Update a journal entry (status change / void)
 *
 * Note: Journal entries are voided via status change, not soft-deleted.
 * If lines are included in PATCH, existing lines are replaced.
 */

import { NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validation/schemas/common'
import { updateJournalEntrySchema } from '@/lib/validation/schemas/accounting'
import type { GlJournalEntry, GlJournalLine } from '@/types/accounting'

function extractEntityId(req: Request, segment: string): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const idx = segments.indexOf(segment)
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v1/journal-entries/[id]
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'journal-entries')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid journal entry ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: entry, error } = await supabase
      .from('gl_journal_entries')
      .select('*, gl_journal_lines(*)')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .single() as { data: (GlJournalEntry & { gl_journal_lines: GlJournalLine[] }) | null; error: { message: string } | null }

    if (error || !entry) {
      logger.warn('Journal entry not found', { targetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'Journal entry not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: entry, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ============================================================================
// PATCH /api/v1/journal-entries/[id]
// ============================================================================

export const PATCH = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'journal-entries')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid journal entry ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = ctx.validatedBody as Record<string, unknown>
    const { lines, ...entryData } = body as { lines?: Record<string, unknown>[]; [key: string]: unknown }

    const supabase = await createClient()

    // Verify exists and belongs to company
    const { data: existing, error: fetchError } = await supabase
      .from('gl_journal_entries')
      .select('id, status')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .single() as { data: { id: string; status: string } | null; error: { message: string } | null }

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Journal entry not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Build update payload — add posted_at/posted_by when status transitions to 'posted'
    const updatePayload: Record<string, unknown> = {
      ...entryData,
      updated_at: new Date().toISOString(),
    }
    if (entryData.status === 'posted' && existing.status !== 'posted') {
      updatePayload.posted_at = new Date().toISOString()
      updatePayload.posted_by = ctx.user!.id
    }

    const { data: updated, error: updateError } = await (supabase
      .from('gl_journal_entries')
      .update(updatePayload as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .select()
      .single() as unknown as Promise<{ data: GlJournalEntry | null; error: { message: string } | null }>)

    if (updateError || !updated) {
      logger.error('Failed to update journal entry', { error: updateError?.message, targetId })
      const mapped = mapDbError(updateError ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // If lines are provided, replace existing lines
    let updatedLines: GlJournalLine[] | null = null
    if (lines && lines.length >= 2) {
      // Delete existing lines
      await supabase.from('gl_journal_lines').delete().eq('journal_entry_id', targetId)

      // Insert new lines
      const lineInserts = lines.map((line) => ({
        ...line,
        journal_entry_id: targetId,
      }))

      const { data: newLines, error: linesError } = await (supabase
        .from('gl_journal_lines')
        .insert(lineInserts as never)
        .select() as unknown as Promise<{ data: GlJournalLine[] | null; error: { message: string } | null }>)

      if (linesError) {
        logger.error('Failed to replace journal lines', { error: linesError.message, targetId })
        const mapped = mapDbError(linesError)
        return NextResponse.json(
          { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
          { status: mapped.status }
        )
      }
      updatedLines = newLines
    }

    logger.info('Journal entry updated', { targetId, companyId: ctx.companyId! })

    return NextResponse.json({
      data: updatedLines ? { ...updated, lines: updatedLines } : updated,
      requestId: ctx.requestId,
    })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'office'],
    schema: updateJournalEntrySchema,
    permission: 'jobs:update:all',
    auditAction: 'journal_entry.update',
  }
)
