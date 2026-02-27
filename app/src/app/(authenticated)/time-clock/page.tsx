import type { Metadata } from 'next'
import Link from 'next/link'

import { Plus, Clock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { formatDate, getStatusColor, formatStatus } from '@/lib/utils'

interface TimeEntry {
  id: string
  clock_in: string | null
  clock_out: string | null
  regular_hours: number | null
  overtime_hours: number | null
  status: string
  entry_method: string | null
  entry_date: string
  notes: string | null
  created_at: string
}

export const metadata: Metadata = { title: 'Time Clock' }

export default async function TimeClockPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const { companyId, supabase } = await getServerAuth()

  let query = supabase
    .from('time_entries')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .eq('company_id', companyId)
    .order('clock_in', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (params.status) {
    query = query.eq('status', params.status)
  }

  const { data: entriesData, count, error } = await query
  if (error) throw error
  const entries = (entriesData || []) as TimeEntry[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  const totalHours = entries.reduce((sum, e) => sum + (e.regular_hours ?? 0) + (e.overtime_hours ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Time Clock</h1>
          <p className="text-muted-foreground">{count || 0} entries • {totalHours.toFixed(1)} hours total</p>
        </div>
        <Link href="/time-clock/new"><Button><Plus className="h-4 w-4 mr-2" />Clock In</Button></Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Time Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length > 0 ? (
            <div className="divide-y divide-border">
              {entries.map((entry) => (
                <Link key={entry.id} href={`/time-clock/${entry.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatDate(entry.entry_date)}</span>
                        <Badge className={getStatusColor(entry.status)}>{formatStatus(entry.status)}</Badge>
                        {entry.entry_method && <Badge variant="outline" className="text-xs">{formatStatus(entry.entry_method)}</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {entry.clock_in && <span>In: {formatDate(entry.clock_in)}</span>}
                        {entry.clock_out && <span>Out: {formatDate(entry.clock_out)}</span>}
                        {entry.notes && <span className="truncate max-w-[200px]">{entry.notes}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold font-mono">{(entry.regular_hours ?? 0) + (entry.overtime_hours ?? 0) > 0 ? `${((entry.regular_hours ?? 0) + (entry.overtime_hours ?? 0)).toFixed(1)}h` : '—'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No time entries yet</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Clock in to start tracking time</p>
              <Link href="/time-clock/new"><Button><Plus className="h-4 w-4 mr-2" />New Entry</Button></Link>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={page} totalPages={totalPages} basePath="/time-clock" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
