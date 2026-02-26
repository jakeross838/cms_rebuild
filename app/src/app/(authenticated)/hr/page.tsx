import type { Metadata } from 'next'
import Link from 'next/link'

import { Plus, Search, Users, Building2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { createClient } from '@/lib/supabase/server'
import { escapeLike, formatDate } from '@/lib/utils'

interface Employee {
  id: string
  first_name: string
  last_name: string
  employee_number: string
  employment_status: string
  employment_type: string
  email: string | null
  phone: string | null
  hire_date: string
}

interface Department {
  id: string
  name: string
  description: string | null
  is_active: boolean
}

export const metadata: Metadata = { title: 'HR & Workforce' }

export default async function HRWorkforcePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const supabase = await createClient()

  // Resolve current user's company_id for defense-in-depth tenant filtering
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user!.id).single()
  const companyId = profile?.company_id

  let empQuery = supabase
    .from('employees')
    .select('id, first_name, last_name, employee_number, employment_status, employment_type, email, phone, hire_date', { count: 'exact' })
    .is('deleted_at', null)
    .eq('company_id', companyId!)
    .order('last_name', { ascending: true })

  if (params.search) {
    empQuery = empQuery.or(`first_name.ilike.%${escapeLike(params.search)}%,last_name.ilike.%${escapeLike(params.search)}%,employee_number.ilike.%${escapeLike(params.search)}%`)
  }

  empQuery = empQuery.range(offset, offset + pageSize - 1)

  const [
    { data: employeesData, count },
    { data: deptsData },
    { count: posCount },
  ] = await Promise.all([
    empQuery,
    supabase.from('departments').select('*').eq('is_active', true).eq('company_id', companyId!).order('name', { ascending: true }),
    supabase.from('positions').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('company_id', companyId!),
  ])

  const employees = (employeesData || []) as Employee[]
  const departments = (deptsData || []) as Department[]
  const totalPages = Math.ceil((count || 0) / pageSize)
  const active = employees.filter((e) => e.employment_status === 'active').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">HR & Workforce</h1>
          <p className="text-muted-foreground">
            {count || 0} total employees &bull; {active} active &bull; {departments.length} departments &bull; {posCount ?? 0} positions
          </p>
        </div>
        <Link href="/hr/new"><Button><Plus className="h-4 w-4 mr-2" />Add Employee</Button></Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search employees..." aria-label="Search employees" defaultValue={params.search} className="pl-10" /></form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              {employees.length > 0 ? (
                <div className="divide-y divide-border">
                  {employees.map((emp) => (
                    <Link key={emp.id} href={`/hr/${emp.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent transition-colors rounded-md -mx-2 px-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{emp.first_name} {emp.last_name}</span>
                            <span className="text-xs font-mono text-muted-foreground">{emp.employee_number}</span>
                            <Badge variant="outline" className="text-xs">{emp.employment_type}</Badge>
                            <Badge className={emp.employment_status === 'active' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}>
                              {emp.employment_status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {emp.email && <span>{emp.email}</span>}
                            {emp.phone && <span> &bull; {emp.phone}</span>}
                            <span> &bull; Hired {formatDate(emp.hire_date)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">{params.search ? 'No employees match your search' : 'No employees added yet'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Departments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {departments.length > 0 ? (
                <div className="space-y-2">
                  {departments.map((dept) => (
                    <div key={dept.id} className="p-2 rounded-lg bg-muted/50">
                      <span className="font-medium text-sm">{dept.name}</span>
                      {dept.description && <p className="text-xs text-muted-foreground mt-0.5">{dept.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No departments configured</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <ListPagination currentPage={page} totalPages={totalPages} basePath="/hr" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
