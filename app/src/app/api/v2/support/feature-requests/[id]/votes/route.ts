/**
 * Feature Request Votes API — List & Toggle Vote
 *
 * GET  /api/v2/support/feature-requests/:id/votes — List votes
 * POST /api/v2/support/feature-requests/:id/votes — Add vote
 * DELETE /api/v2/support/feature-requests/:id/votes — Remove vote (by user)
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listFeatureRequestVotesSchema, createFeatureRequestVoteSchema } from '@/lib/validation/schemas/customer-support'

// ============================================================================
// GET /api/v2/support/feature-requests/:id/votes
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const requestId = segments[segments.indexOf('feature-requests') + 1]
    if (!requestId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing feature request ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listFeatureRequestVotesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    // Verify feature request ownership
    const { data: featureRequest, error: featureRequestError } = await supabase
      .from('feature_requests')
      .select('id')
      .eq('id', requestId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (featureRequestError && featureRequestError.code !== 'PGRST116') {
      const mapped = mapDbError(featureRequestError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    if (!featureRequest) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Feature request not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, count, error } = await supabase
      .from('feature_request_votes')
      .select('*', { count: 'exact' })
      .eq('feature_request_id', requestId)
      .eq('company_id', ctx.companyId!)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'] }
)

// ============================================================================
// POST /api/v2/support/feature-requests/:id/votes — Add vote
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const featureRequestId = segments[segments.indexOf('feature-requests') + 1]
    if (!featureRequestId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing feature request ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createFeatureRequestVoteSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid vote data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify feature request ownership
    const { data: featureRequest, error: featureReqError } = await supabase
      .from('feature_requests')
      .select('id, vote_count')
      .eq('id', featureRequestId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (featureReqError && featureReqError.code !== 'PGRST116') {
      const mapped = mapDbError(featureReqError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    if (!featureRequest) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Feature request not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Check for existing vote (unique constraint)
    const { data: existingVote, error: existingVoteError } = await supabase
      .from('feature_request_votes')
      .select('id')
      .eq('feature_request_id', featureRequestId)
      .eq('company_id', ctx.companyId!)
      .eq('user_id', input.user_id)
      .single()

    if (existingVoteError && existingVoteError.code !== 'PGRST116') {
      const mapped = mapDbError(existingVoteError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    if (existingVote) {
      return NextResponse.json(
        { error: 'Conflict', message: 'User has already voted on this feature request', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from('feature_request_votes')
      .insert({
        company_id: ctx.companyId!,
        feature_request_id: featureRequestId,
        user_id: input.user_id,
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

    // Increment vote_count on feature request
    const { error: voteCountError } = await supabase
      .from('feature_requests')
      .update({ vote_count: (featureRequest.vote_count ?? 0) + 1 })
      .eq('id', featureRequestId)
      .eq('company_id', ctx.companyId!)

    if (voteCountError) {
      const mapped = mapDbError(voteCountError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'], auditAction: 'support_feature_requests_vote.create' }
)

// ============================================================================
// DELETE /api/v2/support/feature-requests/:id/votes — Remove vote
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const featureRequestId = segments[segments.indexOf('feature-requests') + 1]
    if (!featureRequestId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing feature request ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const userId = url.searchParams.get('user_id')
    if (!userId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing user_id query parameter', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify feature request ownership
    const { data: featureRequest, error: featureCheckError } = await supabase
      .from('feature_requests')
      .select('id, vote_count')
      .eq('id', featureRequestId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (featureCheckError && featureCheckError.code !== 'PGRST116') {
      const mapped = mapDbError(featureCheckError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    if (!featureRequest) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Feature request not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data: existingVote, error: voteCheckError } = await supabase
      .from('feature_request_votes')
      .select('id')
      .eq('feature_request_id', featureRequestId)
      .eq('company_id', ctx.companyId!)
      .eq('user_id', userId)
      .single()

    if (voteCheckError && voteCheckError.code !== 'PGRST116') {
      const mapped = mapDbError(voteCheckError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    if (!existingVote) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Vote not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('feature_request_votes')
      .delete()
      .eq('id', existingVote.id)
      .eq('company_id', ctx.companyId!)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Decrement vote_count on feature request
    const { error: voteCountError } = await supabase
      .from('feature_requests')
      .update({ vote_count: Math.max(0, (featureRequest.vote_count ?? 0) - 1) })
      .eq('id', featureRequestId)
      .eq('company_id', ctx.companyId!)

    if (voteCountError) {
      const mapped = mapDbError(voteCountError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'], auditAction: 'support_feature_requests_vote.archive' }
)
