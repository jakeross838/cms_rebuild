import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Users, Search, Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { escapeLike, formatCurrency } from '@/lib/utils'

interface Employee {
  id: string
  first_name: string
  last_name: string
  employee_number: string
  employment_status: string
  employment_type: string
  email: string | null
  phone: string | null
  pay_type: string | null
  base_wage: number | null
  hire_date: string
}

export const metadata: Metadata = { title: 'Crew Schedule' }

export default async function CrewSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  let query = supabase
    .from('employees')
    .select('*')
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('last_name', { ascending: true })

  if (params.search) {
    query = query.or(`first_name.ilike.%${escapeLike(params.search)}%,last_name.ilike.%${escapeLike(params.search)}%,employee_number.ilike.%${escapeLike(params.search)}%`)
  }

  const { data: employeesData, error } = await query
  if (error) throw error
  const employees = (employeesData || []) as Employee[]

  const active = employees.filter((e) => e.employment_status === 'active').length
  const field = employees.filter((e) => e.employment_type === 'field' || e.employment_type === 'hourly').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Crew Schedule</h1>
          <p className="text-muted-foreground">{employees.length} employees &bull; {active} active &bull; {field} field crew</p>
        </div>
        <Link href="/hr/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search crew..." aria-label="Search crew" defaultValue={params.search} className="pl-10" /></form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Crew Members
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
                        {emp.pay_type && <span> &bull; {emp.pay_type}</span>}
                      </div>
                    </div>
                    {emp.base_wage != null && (
                      <span className="font-medium text-sm">{formatCurrency(emp.base_wage)}/hr</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                {params.search ? 'No crew members match your search' : 'No employees added yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
