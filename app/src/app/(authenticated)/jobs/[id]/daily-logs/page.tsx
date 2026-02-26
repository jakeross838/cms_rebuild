import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { Plus, CloudSun, Calendar, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'

interface DailyLog {
  id: string
  log_date: string | null
  status: string | null
  weather_summary: string | null
  high_temp: number | null
  low_temp: number | null
  notes: string | null
  conditions: string | null
  created_by: string | null
  submitted_at: string | null
}

export default async function DailyLogsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ search?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, name')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (jobError || !job) {
    notFound()
  }

  let logsQuery = supabase
    .from('daily_logs')
    .select('*')
    .eq('job_id', id)
    .is('deleted_at', null)

  if (sp.search) {
    logsQuery = logsQuery.or(`weather_summary.ilike.%${sp.search}%,notes.ilike.%${sp.search}%`)
  }

  const { data: logsData } = await logsQuery.order('log_date', { ascending: false })

  const logs = (logsData || []) as DailyLog[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Daily Logs</h2>
          <p className="text-sm text-muted-foreground">{logs.length} logs recorded</p>
        </div>
        <Link href={`/jobs/${id}/daily-logs/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Log
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search logs..." defaultValue={sp.search} className="pl-10" /></form>
      </div>

      {/* Logs list */}
      {logs.length > 0 ? (
        <div className="space-y-3">
          {logs.map((log) => (
            <Link key={log.id} href={`/jobs/${id}/daily-logs/${log.id}`} className="block hover:bg-accent/50 rounded-md transition-colors">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{log.log_date ? formatDate(log.log_date) : 'No date'}</span>
                        </div>
                        <Badge className={getStatusColor(log.status ?? 'draft')}>
                          {(log.status ?? 'draft').replace('_', ' ')}
                        </Badge>
                      </div>
                      {(log.weather_summary || log.conditions) && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-sm text-muted-foreground">
                          <CloudSun className="h-3.5 w-3.5" />
                          {log.weather_summary || log.conditions}
                          {log.high_temp != null && (
                            <span className="ml-1">
                              {log.high_temp}°F
                              {log.low_temp != null && ` / ${log.low_temp}°F`}
                            </span>
                          )}
                        </div>
                      )}
                      {log.notes && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{log.notes}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">No daily logs yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start recording daily activity for this job</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
