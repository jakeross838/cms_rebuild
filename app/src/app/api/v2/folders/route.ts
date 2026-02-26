/**
 * Folders API — List & Create
 *
 * GET  /api/v2/folders?job_id= — List folder tree for a job
 * POST /api/v2/folders — Create a new folder
 */

import { NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { createFolderSchema } from '@/lib/validation/schemas/documents'

// ============================================================================
// GET /api/v2/folders?job_id=
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const jobId = req.nextUrl.searchParams.get('job_id')
    const supabase = await createClient()

    let query = supabase
      .from('document_folders')
      .select('*')
      .eq('company_id', ctx.companyId!)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (jobId) {
      query = query.eq('job_id', jobId)
    } else {
      query = query.is('job_id', null)
    }

    const { data, error } = await query

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: data ?? [], requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/folders
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createFolderSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid folder data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const jobId = body.job_id ?? null
    const supabase = await createClient()

    // Determine path
    let parentPath = ''
    if (input.parent_folder_id) {
      const { data: parent } = await supabase
        .from('document_folders')
        .select('path')
        .eq('id', input.parent_folder_id)
        .eq('company_id', ctx.companyId!)
        .single()

      if (parent) {
        parentPath = parent.path
      }
    }

    const folderPath = `${parentPath}/${input.name}`

    const { data, error } = await supabase
      .from('document_folders')
      .insert({
        company_id: ctx.companyId!,
        job_id: jobId,
        parent_folder_id: input.parent_folder_id ?? null,
        name: input.name,
        path: folderPath,
        created_by: ctx.user!.id,
      })
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Conflict', message: 'A folder with this name already exists in this location', requestId: ctx.requestId },
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
  { requireAuth: true, rateLimit: 'api' }
)
