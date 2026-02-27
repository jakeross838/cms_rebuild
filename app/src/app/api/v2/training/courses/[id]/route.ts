/**
 * Training Course by ID — Get, Update, Delete
 *
 * GET    /api/v2/training/courses/:id — Get course details
 * PUT    /api/v2/training/courses/:id — Update course
 * DELETE /api/v2/training/courses/:id — Soft delete course
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateCourseSchema } from '@/lib/validation/schemas/training'

// ============================================================================
// GET /api/v2/training/courses/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing course ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('training_courses')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Course not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Verify access: platform course or belongs to company
    if (data.company_id !== null && data.company_id !== ctx.companyId) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Course not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'] }
)

// ============================================================================
// PUT /api/v2/training/courses/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing course ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateCourseSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Build update object (only include fields that were provided)
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.title !== undefined) updates.title = input.title
    if (input.description !== undefined) updates.description = input.description
    if (input.content_url !== undefined) updates.content_url = input.content_url
    if (input.thumbnail_url !== undefined) updates.thumbnail_url = input.thumbnail_url
    if (input.duration_minutes !== undefined) updates.duration_minutes = input.duration_minutes
    if (input.course_type !== undefined) updates.course_type = input.course_type
    if (input.category !== undefined) updates.category = input.category
    if (input.module_tag !== undefined) updates.module_tag = input.module_tag
    if (input.role_tags !== undefined) updates.role_tags = input.role_tags
    if (input.difficulty !== undefined) updates.difficulty = input.difficulty
    if (input.language !== undefined) updates.language = input.language
    if (input.transcript !== undefined) updates.transcript = input.transcript
    if (input.sort_order !== undefined) updates.sort_order = input.sort_order
    if (input.is_published !== undefined) updates.is_published = input.is_published
    if (input.view_count !== undefined) updates.view_count = input.view_count

    const { data, error } = await supabase
      .from('training_courses')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'], auditAction: 'training_course.update' }
)

// ============================================================================
// DELETE /api/v2/training/courses/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing course ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify exists and belongs to company
    const { data: existing, error: existError } = await supabase
      .from('training_courses')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Course not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('training_courses')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'], auditAction: 'training_course.archive' }
)
