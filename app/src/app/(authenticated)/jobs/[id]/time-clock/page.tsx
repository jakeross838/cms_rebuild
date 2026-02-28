import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Clock, Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { formatDate, getStatusColor, formatStatus } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Time Clock' }

interface TimeEntry {
  id: string
  user_id: string
  entry_date: string
  clock_in: string | null
  clock_out: string | null
  regular_hours: number
  overtime_hours: number
  status: string
  entry_method: string
  notes: string | null
}

export default async function JobTimeClockPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { id: jobId } = await params
  const sp = await searchParams
  const page = Number(sp.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const { companyId, supabase } = await getServerAuth()

  const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
  if (!jobCheck) { notFound() }

  const { data: entriesData, count, error } = await supabase
    .from('time_entries')
    .select('*', { count: 'exact' })
    .eq('job_id', jobId)
    .is('deleted_at', null)
    .order('entry_date', { ascending: false })
    .range(offset, offset + pageSize - 1)
  if (error) throw error

  const entries = (entriesData || []) as TimeEntry[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  const totalRegular = entries.reduce((s, e) => s + e.regular_hours, 0)
  const totalOvertime = entries.reduce((s, e) => s + e.overtime_hours, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Time Clock</h1>
          <p className="text-muted-foreground">
            {entries.length} entries &bull; {totalRegular.toFixed(1)}h regular &bull; {totalOvertime.toFixed(1)}h overtime
          </p>
        </div>
        <Link href={`/jobs/${jobId}/time-clock/new`}>
          <Button><Plus className="h-4 w-4 mr-2" />New Entry</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length > 0 ? (
            <div className="divide-y divide-border">
              {entries.map((entry) => (
                <Link key={entry.id} href={`/jobs/${jobId}/time-clock/${entry.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatDate(entry.entry_date)}</span>
                        <Badge variant="outline" className="text-xs">{entry.entry_method}</Badge>
                        <Badge className={getStatusColor(entry.status)}>{formatStatus(entry.status)}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {entry.clock_in && `In: ${new Date(entry.clock_in).toLocaleTimeString()}`}
                        {entry.clock_out && ` — Out: ${new Date(entry.clock_out).toLocaleTimeString()}`}
                        {entry.notes && ` • ${entry.notes}`}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">{entry.regular_hours.toFixed(1)}h</p>
                      {entry.overtime_hours > 0 && <p className="text-amber-600">+{entry.overtime_hours.toFixed(1)}h OT</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No time entries for this job</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={page} totalPages={totalPages} basePath={`/jobs/${jobId}/time-clock`} searchParams={sp as Record<string, string | undefined>} />
    </div>
  )
}
