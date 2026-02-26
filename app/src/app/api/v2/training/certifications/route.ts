/**
 * User Certifications API — List & Create
 *
 * GET  /api/v2/training/certifications — List certifications
 * POST /api/v2/training/certifications — Create certification
 */

import { NextResponse } from 'next/server'
import { escapeLike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listCertificationsSchema, createCertificationSchema } from '@/lib/validation/schemas/training'

// ============================================================================
// GET /api/v2/training/certifications
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listCertificationsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      user_id: url.searchParams.get('user_id') ?? undefined,
      passed: url.searchParams.get('passed') ?? undefined,
      certification_level: url.searchParams.get('certification_level') ?? undefined,
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
      .from('user_certifications')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id)
    }
    if (filters.passed !== undefined) {
      query = query.eq('passed', filters.passed)
    }
    if (filters.certification_level) {
      query = query.eq('certification_level', filters.certification_level)
    }
    if (filters.q) {
      query = query.or(`certification_name.ilike.%${escapeLike(filters.q)}%,description.ilike.%${escapeLike(filters.q)}%`)
    }

    query = query.order('created_at', { ascending: false })

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
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/training/certifications — Create certification
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createCertificationSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid certification data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('user_certifications')
      .insert({
        company_id: ctx.companyId!,
        user_id: input.user_id,
        certification_name: input.certification_name,
        certification_level: input.certification_level,
        description: input.description ?? null,
        passing_score: input.passing_score,
        assessment_score: input.assessment_score ?? null,
        passed: input.passed,
        attempt_count: input.attempt_count,
        certified_at: input.certified_at ?? null,
        expires_at: input.expires_at ?? null,
        time_limit_minutes: input.time_limit_minutes ?? null,
        notes: input.notes ?? null,
        issued_by: ctx.user!.id,
      })
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
