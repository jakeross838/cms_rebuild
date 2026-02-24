/**
 * Employee by ID — Get, Update, Delete
 *
 * GET    /api/v2/hr/employees/:id — Get employee details
 * PUT    /api/v2/hr/employees/:id — Update employee
 * DELETE /api/v2/hr/employees/:id — Soft delete employee
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateEmployeeSchema } from '@/lib/validation/schemas/hr-workforce'

// ============================================================================
// GET /api/v2/hr/employees/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing employee ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase
      .from('employees') as any)
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Employee not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch certifications count
    const { data: certs } = await (supabase
      .from('employee_certifications') as any)
      .select('id')
      .eq('employee_id', id)

    // Fetch documents count
    const { data: docs } = await (supabase
      .from('employee_documents') as any)
      .select('id')
      .eq('employee_id', id)

    return NextResponse.json({
      data: {
        ...data,
        certifications_count: (certs ?? []).length,
        documents_count: (docs ?? []).length,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/hr/employees/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing employee ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateEmployeeSchema.safeParse(body)

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
    if (input.user_id !== undefined) updates.user_id = input.user_id
    if (input.employee_number !== undefined) updates.employee_number = input.employee_number
    if (input.first_name !== undefined) updates.first_name = input.first_name
    if (input.last_name !== undefined) updates.last_name = input.last_name
    if (input.email !== undefined) updates.email = input.email
    if (input.phone !== undefined) updates.phone = input.phone
    if (input.hire_date !== undefined) updates.hire_date = input.hire_date
    if (input.termination_date !== undefined) updates.termination_date = input.termination_date
    if (input.department_id !== undefined) updates.department_id = input.department_id
    if (input.position_id !== undefined) updates.position_id = input.position_id
    if (input.employment_status !== undefined) updates.employment_status = input.employment_status
    if (input.employment_type !== undefined) updates.employment_type = input.employment_type
    if (input.base_wage !== undefined) updates.base_wage = input.base_wage
    if (input.pay_type !== undefined) updates.pay_type = input.pay_type
    if (input.workers_comp_class !== undefined) updates.workers_comp_class = input.workers_comp_class
    if (input.emergency_contact_name !== undefined) updates.emergency_contact_name = input.emergency_contact_name
    if (input.emergency_contact_phone !== undefined) updates.emergency_contact_phone = input.emergency_contact_phone
    if (input.address !== undefined) updates.address = input.address
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await (supabase
      .from('employees') as any)
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Employee not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/hr/employees/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing employee ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify exists
    const { data: existing, error: existError } = await (supabase
      .from('employees') as any)
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Employee not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await (supabase
      .from('employees') as any)
      .update({ deleted_at: new Date().toISOString() })
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
