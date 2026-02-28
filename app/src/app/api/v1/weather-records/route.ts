/**
 * Weather Records API — List & Create
 *
 * GET  /api/v1/weather-records?job_id=... — List weather records for a job
 * POST /api/v1/weather-records — Create a new weather record
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
import {
  listWeatherRecordsSchema,
  createWeatherRecordSchema,
} from '@/lib/validation/schemas/scheduling'
import type { WeatherRecord } from '@/types/scheduling'

// ── GET /api/v1/weather-records ─────────────────────────────────────────

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const url = req.nextUrl
    const parseResult = listWeatherRecordsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      start_date: url.searchParams.get('start_date') ?? undefined,
      end_date: url.searchParams.get('end_date') ?? undefined,
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
      .from('weather_records')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .eq('job_id', filters.job_id)
      .is('deleted_at', null) as unknown as {
        gte: (col: string, val: string) => typeof query
        lte: (col: string, val: string) => typeof query
        order: (col: string, opts: { ascending: boolean }) => typeof query
        range: (from: number, to: number) => Promise<{ data: WeatherRecord[] | null; count: number | null; error: { message: string } | null }>
      }

    if (filters.start_date) {
      query = query.gte('record_date', filters.start_date) as typeof query
    }
    if (filters.end_date) {
      query = query.lte('record_date', filters.end_date) as typeof query
    }

    query = query.order('record_date', { ascending: false }) as typeof query

    const { data: records, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      logger.error('Failed to list weather records', { error: error.message })
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(
      { ...paginatedResponse(records ?? [], count ?? 0, page, limit), requestId: ctx.requestId }
    )
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ── POST /api/v1/weather-records ────────────────────────────────────────

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })
    const body = ctx.validatedBody as Record<string, unknown>

    const supabase = await createClient()

    // Verify job belongs to this company
    const { data: jobCheck } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', body.job_id as string)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: { id: string } | null; error: unknown }

    if (!jobCheck) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Job not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data: record, error } = await (supabase
      .from('weather_records')
      .insert({
        ...body,
        company_id: ctx.companyId!,
      } as never)
      .select()
      .single() as unknown as Promise<{ data: WeatherRecord | null; error: { message: string } | null }>)

    if (error || !record) {
      logger.error('Failed to create weather record', { error: error?.message })
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('Weather record created', { recordId: record.id, jobId: record.job_id })

    return NextResponse.json({ data: record, requestId: ctx.requestId }, { status: 201 })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'superintendent'],
    schema: createWeatherRecordSchema,
    permission: 'jobs:update:all',
    auditAction: 'weather_record.create',
  }
)
