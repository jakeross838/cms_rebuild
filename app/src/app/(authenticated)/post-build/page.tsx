import type { Metadata } from 'next'

import { Shield, Wrench } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { formatDate, getStatusColor, formatStatus } from '@/lib/utils'

interface Warranty {
  id: string
  title: string
  status: string
  warranty_type: string | null
  start_date: string | null
  end_date: string | null
  job_id: string
  created_at: string | null
}

interface MaintenanceSchedule {
  id: string
  title: string
  frequency: string
  next_due_date: string | null
  is_active: boolean
  category: string | null
  created_at: string
}

export const metadata: Metadata = { title: 'Post-Build' }

export default async function PostBuildPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { companyId, supabase } = await getServerAuth()

  const params = await searchParams
  const pageSize = 25
  const currentPage = Math.max(1, parseInt(params.page || '1', 10) || 1)
  const offset = (currentPage - 1) * pageSize

  const [
    { data: warrantiesData, count: warrantiesCount, error: wError },
    { data: maintenanceData, count: maintenanceCount, error: mError },
  ] = await Promise.all([
    supabase.from('warranties').select('*', { count: 'exact' })
      .eq('company_id', companyId).is('deleted_at', null).in('status', ['active', 'expiring_soon']).order('end_date', { ascending: true }).range(offset, offset + pageSize - 1),
    supabase.from('maintenance_schedules').select('*', { count: 'exact' })
      .eq('company_id', companyId).is('deleted_at', null).eq('is_active', true).order('next_due_date', { ascending: true }).range(offset, offset + pageSize - 1),
  ])
  if (wError) throw wError
  if (mError) throw mError

  const warranties = (warrantiesData || []) as Warranty[]
  const schedules = (maintenanceData || []) as MaintenanceSchedule[]
  const totalPages = Math.max(
    Math.ceil((warrantiesCount || 0) / pageSize),
    Math.ceil((maintenanceCount || 0) / pageSize)
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Post-Build</h1>
        <p className="text-muted-foreground">Warranty walkthroughs, maintenance, and referrals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Active Warranties</p>
            <p className="text-2xl font-bold">{warrantiesCount || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Maintenance Schedules</p>
            <p className="text-2xl font-bold">{maintenanceCount || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Active Warranties
          </CardTitle>
        </CardHeader>
        <CardContent>
          {warranties.length > 0 ? (
            <div className="divide-y divide-border">
              {warranties.map((w) => (
                <div key={w.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{w.title}</span>
                        <Badge className={getStatusColor(w.status)}>{formatStatus(w.status)}</Badge>
                        {w.warranty_type && <Badge variant="outline" className="text-xs">{w.warranty_type}</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {w.start_date && `${formatDate(w.start_date)}`}
                        {w.end_date && ` — ${formatDate(w.end_date)}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No active warranties</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Upcoming Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length > 0 ? (
            <div className="divide-y divide-border">
              {schedules.map((s) => (
                <div key={s.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{s.title}</span>
                        <Badge variant="outline" className="text-xs">{s.frequency}</Badge>
                      </div>
                      {s.next_due_date && <p className="text-sm text-muted-foreground mt-1">Next due: {formatDate(s.next_due_date)}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wrench className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No maintenance schedules configured</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={currentPage} totalPages={totalPages} basePath="/post-build" />
    </div>
  )
}
