/**
 * Weather Records API — Get, Update & Delete
 *
 * GET    /api/v1/weather-records/[id] — Get a single weather record
 * PATCH  /api/v1/weather-records/[id] — Update a weather record
 * DELETE /api/v1/weather-records/[id] — Soft-delete a weather record
 */

import { NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validation/schemas/common'
import { updateWeatherRecordSchema } from '@/lib/validation/schemas/scheduling'
import type { WeatherRecord } from '@/types/scheduling'

function extractEntityId(req: Request, segment: string): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const idx = segments.indexOf(segment)
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ── GET /api/v1/weather-records/[id] ────────────────────────────────────

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'weather-records')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid weather record ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: record, error } = await supabase
      .from('weather_records')
      .select('*')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: WeatherRecord | null; error: { message: string } | null }

    if (error || !record) {
      logger.warn('Weather record not found', { targetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'Weather record not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: record, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ── PATCH /api/v1/weather-records/[id] ──────────────────────────────────

export const PATCH = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'weather-records')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid weather record ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = ctx.validatedBody as Record<string, unknown>
    const supabase = await createClient()

    // Verify exists
    const { data: existing, error: fetchError } = await supabase
      .from('weather_records')
      .select('id')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: { id: string } | null; error: { message: string } | null }

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Weather record not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
    }

    const { data: updated, error: updateError } = await (supabase
      .from('weather_records')
      .update(updateData as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .select()
      .single() as unknown as Promise<{ data: WeatherRecord | null; error: { message: string } | null }>)

    if (updateError || !updated) {
      logger.error('Failed to update weather record', { error: updateError?.message, targetId })
      const mapped = mapDbError(updateError ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('Weather record updated', { targetId, companyId: ctx.companyId! })

    return NextResponse.json({ data: updated, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'superintendent'],
    schema: updateWeatherRecordSchema,
    permission: 'jobs:update:all',
    auditAction: 'weather_record.update',
  }
)

// ── DELETE /api/v1/weather-records/[id] ─────────────────────────────────

export const DELETE = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'weather-records')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid weather record ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const now = new Date().toISOString()

    const { data: deleted, error } = await (supabase
      .from('weather_records')
      .update({ deleted_at: now, updated_at: now } as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .select('id, deleted_at')
      .single() as unknown as Promise<{ data: { id: string; deleted_at: string } | null; error: { message: string } | null }>)

    if (error || !deleted) {
      logger.warn('Weather record not found for soft delete', { targetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'Weather record not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    logger.info('Weather record soft-deleted', { targetId, companyId: ctx.companyId! })

    return NextResponse.json({ data: deleted, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm'],
    permission: 'jobs:delete:all',
    auditAction: 'weather_record.delete',
  }
)
