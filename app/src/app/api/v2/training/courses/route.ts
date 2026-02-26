/**
 * Training Courses API — List & Create
 *
 * GET  /api/v2/training/courses — List courses
 * POST /api/v2/training/courses — Create a new course
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
import { listCoursesSchema, createCourseSchema } from '@/lib/validation/schemas/training'

// ============================================================================
// GET /api/v2/training/courses
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listCoursesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      course_type: url.searchParams.get('course_type') ?? undefined,
      difficulty: url.searchParams.get('difficulty') ?? undefined,
      category: url.searchParams.get('category') ?? undefined,
      is_published: url.searchParams.get('is_published') ?? undefined,
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
      .from('training_courses')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)

    // Show platform courses (company_id IS NULL) + company-specific courses
    query = query.or(`company_id.is.null,company_id.eq.${ctx.companyId!}`)

    if (filters.course_type) {
      query = query.eq('course_type', filters.course_type)
    }
    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty)
    }
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.is_published !== undefined) {
      query = query.eq('is_published', filters.is_published)
    }
    if (filters.q) {
      query = query.or(`title.ilike.%${escapeLike(filters.q)}%,description.ilike.%${escapeLike(filters.q)}%,category.ilike.%${escapeLike(filters.q)}%`)
    }

    query = query.order('sort_order', { ascending: true }).order('created_at', { ascending: false })

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
// POST /api/v2/training/courses — Create course
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createCourseSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid course data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('training_courses')
      .insert({
        company_id: ctx.companyId!,
        title: input.title,
        description: input.description ?? null,
        content_url: input.content_url ?? null,
        thumbnail_url: input.thumbnail_url ?? null,
        duration_minutes: input.duration_minutes ?? null,
        course_type: input.course_type,
        category: input.category ?? null,
        module_tag: input.module_tag ?? null,
        role_tags: input.role_tags,
        difficulty: input.difficulty,
        language: input.language,
        transcript: input.transcript ?? null,
        sort_order: input.sort_order,
        is_published: input.is_published,
        created_by: ctx.user!.id,
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
