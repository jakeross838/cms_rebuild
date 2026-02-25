import { Plus, Search, Users, Building2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

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

export default async function HRWorkforcePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let empQuery = supabase
    .from('employees')
    .select('id, first_name, last_name, employee_number, employment_status, employment_type, email, phone, hire_date')
    .is('deleted_at', null)
    .order('last_name', { ascending: true })

  if (params.search) {
    empQuery = empQuery.or(`first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,employee_number.ilike.%${params.search}%`)
  }

  const [
    { data: employeesData },
    { data: deptsData },
    { count: posCount },
  ] = await Promise.all([
    empQuery,
    supabase.from('departments').select('*').eq('is_active', true).order('name', { ascending: true }),
    supabase.from('positions').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])

  const employees = (employeesData || []) as Employee[]
  const departments = (deptsData || []) as Department[]
  const active = employees.filter((e) => e.employment_status === 'active').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">HR & Workforce</h1>
          <p className="text-muted-foreground">
            {employees.length} employees &bull; {active} active &bull; {departments.length} departments &bull; {posCount ?? 0} positions
          </p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Employee</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search employees..." defaultValue={params.search} className="pl-10" /></form>
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
                    <div key={emp.id} className="py-3 first:pt-0 last:pb-0">
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
                    </div>
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
    </div>
  )
}
