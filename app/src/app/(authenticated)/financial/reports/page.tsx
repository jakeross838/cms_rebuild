import { Plus, Search, FileText } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { safeOrIlike } from '@/lib/utils'
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
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const params = await searchParams
  const { companyId, supabase } = await getServerAuth()

  const pageSize = 25
  const currentPage = Math.max(1, parseInt(params.page || '1', 10) || 1)
  const offset = (currentPage - 1) * pageSize

  let query = supabase
    .from('report_definitions')
    .select('*', { count: 'exact' })
    .eq('company_id', companyId)
    .order('name', { ascending: true })

  if (params.search) {
    query = query.or(`name.ilike.${safeOrIlike(params.search)},description.ilike.${safeOrIlike(params.search)}`)
  }

  const { data: reportsData, count, error } = await query.range(offset, offset + pageSize - 1)
  if (error) throw error
  const reports = (reportsData || []) as ReportDefinition[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financial Reports</h1>
          <p className="text-muted-foreground">{count || 0} report definitions</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Report</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search reports..." aria-label="Search reports" defaultValue={params.search} className="pl-10" /></form>
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

      <ListPagination currentPage={currentPage} totalPages={totalPages} basePath="/financial/reports" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
