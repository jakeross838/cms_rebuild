/**
 * Task Dependencies API — List & Create
 *
 * GET  /api/v2/schedule/tasks/:id/dependencies — List dependencies for a task
 * POST /api/v2/schedule/tasks/:id/dependencies — Add a dependency to a task
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { createDependencySchema } from '@/lib/validation/schemas/scheduling'

// ============================================================================
// GET /api/v2/schedule/tasks/:id/dependencies
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    // Extract task ID from URL path: /api/v2/schedule/tasks/:id/dependencies
    const segments = req.nextUrl.pathname.split('/')
    const depIndex = segments.indexOf('dependencies')
    const taskId = depIndex > 0 ? segments[depIndex - 1] : null

    if (!taskId) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing task ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify task exists and belongs to company
    const { error: taskError } = await supabase
      .from('schedule_tasks')
      .select('id')
      .eq('id', taskId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (taskError) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Schedule task not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Get dependencies where this task is predecessor or successor
    const { data: asPredecessor } = await supabase
      .from('schedule_dependencies')
      .select('*')
      .eq('predecessor_id', taskId)

    const { data: asSuccessor } = await supabase
      .from('schedule_dependencies')
      .select('*')
      .eq('successor_id', taskId)

    return NextResponse.json({
      data: {
        as_predecessor: asPredecessor ?? [],
        as_successor: asSuccessor ?? [],
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'] }
)

// ============================================================================
// POST /api/v2/schedule/tasks/:id/dependencies
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    // Extract task ID from URL path
    const segments = req.nextUrl.pathname.split('/')
    const depIndex = segments.indexOf('dependencies')
    const taskId = depIndex > 0 ? segments[depIndex - 1] : null

    if (!taskId) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing task ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = createDependencySchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid dependency data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify both tasks exist and belong to same company
    const { data: tasks, error: tasksError } = await supabase
      .from('schedule_tasks')
      .select('id')
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .in('id', [input.predecessor_id, input.successor_id])

    if (tasksError || !tasks || tasks.length < 2) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Both predecessor and successor tasks must exist', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    // Prevent self-dependency
    if (input.predecessor_id === input.successor_id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'A task cannot depend on itself', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('schedule_dependencies')
      .insert({
        predecessor_id: input.predecessor_id,
        successor_id: input.successor_id,
        dependency_type: input.dependency_type,
        lag_days: input.lag_days,
      })
      .select('*')
      .single()

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Conflict', message: 'This dependency already exists', requestId: ctx.requestId },
          { status: 409 }
        )
      }
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'] }
)
