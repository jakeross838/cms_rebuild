import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { ClipboardList, Building2, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'

interface DailyLogRow {
  id: string
  job_id: string
  log_date: string
  status: string | null
  weather_summary: string | null
  notes: string | null
  created_at: string | null
  jobs: { name: string; job_number: string | null } | null
}

export const metadata: Metadata = { title: 'Daily Logs' }

export default async function DailyLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const sp = await searchParams
  const page = Number(sp.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  let query = supabase
    .from('daily_logs')
    .select('id, job_id, log_date, status, weather_summary, notes, created_at, jobs(name, job_number)', { count: 'exact' })
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('log_date', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (sp.search) {
    query = query.or(`weather_summary.ilike.%${sp.search}%,notes.ilike.%${sp.search}%`)
  }

  const { data: logsData, error, count } = await query
  if (error) throw error

  const logs = (logsData || []) as DailyLogRow[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Daily Logs</h1>
        <p className="text-muted-foreground">Field reports across all jobs</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search daily logs..." aria-label="Search daily logs" defaultValue={sp.search} className="pl-10" /></form>
      </div>

      {/* Logs list */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {logs.length > 0 ? (
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <Link
                key={log.id}
                href={`/jobs/${log.job_id}/daily-logs`}
                className="block p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <ClipboardList className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {formatDate(log.log_date)}
                          </span>
                          {log.status && (
                            <Badge className={getStatusColor(log.status)}>
                              {log.status.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          {log.jobs?.job_number ? `${log.jobs.job_number} - ` : ''}
                          {log.jobs?.name || 'Unknown job'}
                          {log.weather_summary ? ` | ${log.weather_summary}` : ''}
                        </div>
                        {log.notes && (
                          <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {log.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium text-foreground mb-1">No daily logs yet</p>
            <p className="text-muted-foreground mb-4">
              Create daily logs from within a job
            </p>
            <Link
              href="/jobs"
              className="text-sm font-medium text-primary hover:underline"
            >
              Go to Jobs
            </Link>
          </div>
        )}
      </div>

      <ListPagination currentPage={page} totalPages={totalPages} basePath="/daily-logs" searchParams={sp as Record<string, string | undefined>} />
    </div>
  )
}
