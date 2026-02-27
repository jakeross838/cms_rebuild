import type { Metadata } from 'next'

import { Database, Upload } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { formatDate, getStatusColor, formatStatus } from '@/lib/utils'

interface MigrationJobRow {
  id: string
  source_platform: string
  status: string
  total_records: number | null
  processed_records: number | null
  failed_records: number
  created_at: string
}

export const metadata: Metadata = { title: 'Data Migration' }

export default async function DataMigrationPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { companyId, supabase } = await getServerAuth()

  const params = await searchParams
  const pageSize = 20
  const currentPage = Math.max(1, parseInt(params.page || '1', 10) || 1)
  const offset = (currentPage - 1) * pageSize

  const { data: jobsData, count, error } = await supabase
    .from('migration_jobs')
    .select('*', { count: 'exact' })
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)
  if (error) throw error

  const jobs = (jobsData || []) as MigrationJobRow[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Database className="h-6 w-6" />
          Data Migration
        </h1>
        <p className="text-muted-foreground">Import data from other systems</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Migration Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length > 0 ? (
            <div className="divide-y divide-border">
              {jobs.map((job) => (
                <div key={job.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{job.source_platform}</span>
                        <Badge className={getStatusColor(job.status)}>{formatStatus(job.status)}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {job.total_records != null && (
                          <span>{job.processed_records || 0} / {job.total_records} records</span>
                        )}
                        {job.failed_records != null && job.failed_records > 0 && (
                          <span className="text-destructive">{job.failed_records} errors</span>
                        )}
                        <span>{formatDate(job.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No migrations yet</p>
              <p className="text-sm text-muted-foreground mt-1">Import from Buildertrend, CoConstruct, QuickBooks, or Excel</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={currentPage} totalPages={totalPages} basePath="/data-migration" />
    </div>
  )
}
