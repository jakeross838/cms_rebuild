/**
 * User Certification by ID — Get, Update
 *
 * GET /api/v2/training/certifications/:id — Get certification
 * PUT /api/v2/training/certifications/:id — Update certification
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateCertificationSchema } from '@/lib/validation/schemas/training'

// ============================================================================
// GET /api/v2/training/certifications/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing certification ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('user_certifications')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Certification not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/training/certifications/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing certification ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateCertificationSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.certification_name !== undefined) updates.certification_name = input.certification_name
    if (input.certification_level !== undefined) updates.certification_level = input.certification_level
    if (input.description !== undefined) updates.description = input.description
    if (input.passing_score !== undefined) updates.passing_score = input.passing_score
    if (input.assessment_score !== undefined) updates.assessment_score = input.assessment_score
    if (input.passed !== undefined) updates.passed = input.passed
    if (input.attempt_count !== undefined) updates.attempt_count = input.attempt_count
    if (input.certified_at !== undefined) updates.certified_at = input.certified_at
    if (input.expires_at !== undefined) updates.expires_at = input.expires_at
    if (input.time_limit_minutes !== undefined) updates.time_limit_minutes = input.time_limit_minutes
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await (supabase as any)
      .from('user_certifications')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Certification not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
