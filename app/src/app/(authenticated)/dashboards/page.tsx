import Link from 'next/link'

import { Plus, Search, BarChart3 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'

interface CustomReport {
  id: string
  name: string
  description: string | null
  report_type: string
  visualization_type: string
  status: string
  audience: string
  is_template: boolean
  created_at: string
}

export default async function DashboardsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('custom_reports')
    .select('*')
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }

  const { data: reportsData } = await query
  const reports = (reportsData || []) as CustomReport[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Custom Dashboards</h1>
          <p className="text-muted-foreground">{reports.length} custom reports & dashboards</p>
        </div>
        <Link href="/dashboards/new"><Button><Plus className="h-4 w-4 mr-2" />New Dashboard</Button></Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search dashboards..." defaultValue={params.search} className="pl-10" /></form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            All Dashboards
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length > 0 ? (
            <div className="divide-y divide-border">
              {reports.map((report) => (
                <div key={report.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{report.name}</span>
                        <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                        <Badge variant="outline" className="text-xs">{report.visualization_type}</Badge>
                        <Badge variant="outline" className="text-xs">{report.audience}</Badge>
                        {report.is_template && <Badge variant="outline" className="text-xs">Template</Badge>}
                      </div>
                      {report.description && (
                        <p className="text-sm text-muted-foreground mt-1 truncate max-w-lg">{report.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">{params.search ? 'No dashboards match your search' : 'No custom dashboards yet'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
