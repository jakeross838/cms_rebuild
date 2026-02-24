/**
 * Folder by ID — Update & Delete
 *
 * PUT    /api/v2/folders/:id — Rename or move folder
 * DELETE /api/v2/folders/:id — Delete folder
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateFolderSchema } from '@/lib/validation/schemas/documents'

// ============================================================================
// PUT /api/v2/folders/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing folder ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = updateFolderSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid folder data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Get current folder
    const { data: current, error: fetchError } = await (supabase
      .from('document_folders') as any)
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (fetchError || !current) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Folder not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (input.name !== undefined) {
      updates.name = input.name
      // Update path — replace last segment
      const pathParts = current.path.split('/')
      pathParts[pathParts.length - 1] = input.name
      updates.path = pathParts.join('/')
    }

    if (input.parent_folder_id !== undefined) {
      updates.parent_folder_id = input.parent_folder_id
    }

    const { data, error } = await (supabase
      .from('document_folders') as any)
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

// ============================================================================
// DELETE /api/v2/folders/:id
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing folder ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    // Check for child folders
    const { data: children } = await (supabase
      .from('document_folders') as any)
      .select('id')
      .eq('parent_folder_id', id)
      .eq('company_id', ctx.companyId!)
      .limit(1)

    if (children && children.length > 0) {
      return NextResponse.json(
        { error: 'Conflict', message: 'Cannot delete folder with sub-folders. Remove sub-folders first.', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    // Check for documents in this folder
    const { data: docs } = await (supabase
      .from('documents') as any)
      .select('id')
      .eq('folder_id', id)
      .eq('company_id', ctx.companyId!)
      .neq('status', 'deleted')
      .limit(1)

    if (docs && docs.length > 0) {
      return NextResponse.json(
        { error: 'Conflict', message: 'Cannot delete folder with documents. Move or delete documents first.', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { error } = await (supabase
      .from('document_folders') as any)
      .delete()
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
