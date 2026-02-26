import { Plus, Search, FileText } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Financial Reports' }

interface ReportDefinition {
  id: string
  name: string
  description: string | null
  report_type: string
  is_active: boolean | null
  is_system: boolean | null
  created_at: string | null
}

export default async function FinancialReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('report_definitions')
    .select('*')
    .order('name', { ascending: true })

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }

  const { data: reportsData } = await query
  const reports = (reportsData || []) as ReportDefinition[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financial Reports</h1>
          <p className="text-muted-foreground">{reports.length} report definitions</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Report</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search reports..." defaultValue={params.search} className="pl-10" /></form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Reports
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
                        <Badge variant="outline" className="text-xs">{report.report_type}</Badge>
                        {report.is_system && <Badge variant="outline" className="text-xs">System</Badge>}
                        <Badge className={report.is_active !== false ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}>
                          {report.is_active !== false ? 'Active' : 'Inactive'}
                        </Badge>
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
              <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                {params.search ? 'No reports match your search' : 'No report definitions yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
