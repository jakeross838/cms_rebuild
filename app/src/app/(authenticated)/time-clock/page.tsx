import Link from 'next/link'

import { Plus, Search, Clock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'

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

export default async function TimeClockPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('time_entries')
    .select('*')
    .order('clock_in', { ascending: false })
    .limit(50)

  if (params.status) {
    query = query.eq('status', params.status)
  }

  const { data: entriesData } = await query
  const entries = (entriesData || []) as TimeEntry[]

  const totalHours = entries.reduce((sum, e) => sum + (e.regular_hours ?? 0) + (e.overtime_hours ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Time Clock</h1>
          <p className="text-muted-foreground">{entries.length} entries • {totalHours.toFixed(1)} hours total</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Clock In</Button>
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
                <div key={entry.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatDate(entry.entry_date)}</span>
                        <Badge className={getStatusColor(entry.status)}>{entry.status.replace('_', ' ')}</Badge>
                        {entry.entry_method && <Badge variant="outline" className="text-xs">{entry.entry_method.replace('_', ' ')}</Badge>}
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No time entries yet</p>
              <p className="text-sm text-muted-foreground mt-1">Clock in to start tracking time</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
