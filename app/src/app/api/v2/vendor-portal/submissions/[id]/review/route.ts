/**
 * Review a Vendor Submission
 *
 * POST /api/v2/vendor-portal/submissions/:id/review — Approve or reject a submission
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { reviewSubmissionSchema } from '@/lib/validation/schemas/vendor-portal'

// ============================================================================
// POST /api/v2/vendor-portal/submissions/:id/review
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing submission ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = reviewSubmissionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid review data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify submission exists and is submitted or under_review
    const { data: existing, error: existError } = await (supabase as any)
      .from('vendor_submissions')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Submission not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'submitted' && existing.status !== 'under_review') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Only submitted or under-review submissions can be reviewed', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const updates: Record<string, unknown> = {
      status: input.status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: ctx.user!.id,
      updated_at: new Date().toISOString(),
    }

    if (input.status === 'rejected' && input.rejection_reason) {
      updates.rejection_reason = input.rejection_reason
    }

    const { data, error } = await (supabase as any)
      .from('vendor_submissions')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
