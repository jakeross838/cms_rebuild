import Link from 'next/link'

import { Clock, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

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
}: {
  params: Promise<{ id: string }>
}) {
  const { id: jobId } = await params
  const supabase = await createClient()

  const { data: entriesData } = await supabase
    .from('time_entries')
    .select('*')
    .eq('job_id', jobId)
    .order('entry_date', { ascending: false })
    .limit(100)

  const entries = (entriesData || []) as TimeEntry[]

  const totalRegular = entries.reduce((s, e) => s + e.regular_hours, 0)
  const totalOvertime = entries.reduce((s, e) => s + e.overtime_hours, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Time Clock</h1>
        <p className="text-muted-foreground">
          {entries.length} entries &bull; {totalRegular.toFixed(1)}h regular &bull; {totalOvertime.toFixed(1)}h overtime
        </p>
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
                        <Badge variant="outline" className="text-xs">{entry.status}</Badge>
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
    </div>
  )
}
