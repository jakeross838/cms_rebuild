/**
 * Employees API — List & Create
 *
 * GET  /api/v2/hr/employees — List employees (filtered by company)
 * POST /api/v2/hr/employees — Create a new employee
 */

import { NextResponse } from 'next/server'
import { escapeLike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listEmployeesSchema, createEmployeeSchema } from '@/lib/validation/schemas/hr-workforce'

// ============================================================================
// GET /api/v2/hr/employees
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listEmployeesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      employment_status: url.searchParams.get('employment_status') ?? undefined,
      employment_type: url.searchParams.get('employment_type') ?? undefined,
      department_id: url.searchParams.get('department_id') ?? undefined,
      position_id: url.searchParams.get('position_id') ?? undefined,
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

    let query = (supabase as any)
      .from('employees')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.employment_status) {
      query = query.eq('employment_status', filters.employment_status)
    }
    if (filters.employment_type) {
      query = query.eq('employment_type', filters.employment_type)
    }
    if (filters.department_id) {
      query = query.eq('department_id', filters.department_id)
    }
    if (filters.position_id) {
      query = query.eq('position_id', filters.position_id)
    }
    if (filters.q) {
      query = query.or(`first_name.ilike.%${escapeLike(filters.q)}%,last_name.ilike.%${escapeLike(filters.q)}%,employee_number.ilike.%${escapeLike(filters.q)}%,email.ilike.%${escapeLike(filters.q)}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/hr/employees — Create employee
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createEmployeeSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid employee data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('employees')
      .insert({
        company_id: ctx.companyId!,
        user_id: input.user_id ?? null,
        employee_number: input.employee_number,
        first_name: input.first_name,
        last_name: input.last_name,
        email: input.email ?? null,
        phone: input.phone ?? null,
        hire_date: input.hire_date,
        termination_date: input.termination_date ?? null,
        department_id: input.department_id ?? null,
        position_id: input.position_id ?? null,
        employment_status: input.employment_status,
        employment_type: input.employment_type,
        base_wage: input.base_wage,
        pay_type: input.pay_type,
        workers_comp_class: input.workers_comp_class ?? null,
        emergency_contact_name: input.emergency_contact_name ?? null,
        emergency_contact_phone: input.emergency_contact_phone ?? null,
        address: input.address ?? null,
        notes: input.notes ?? null,
        created_by: ctx.user!.id,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
