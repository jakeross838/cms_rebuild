import Link from 'next/link'
import { redirect } from 'next/navigation'

import {
  Factory,
  ArrowRight,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CalendarDays,
  Timer,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'
import type { Metadata } from 'next'

// ── Page ─────────────────────────────────────────────────────────────

export const metadata: Metadata = { title: 'Production' }

export default async function ProductionPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  // ── Parallel data fetching ──
  const today = new Date().toISOString().split('T')[0]

  const [
    totalLogsRes,
    draftLogsRes,
    approvedLogsRes,
    totalTimeEntriesRes,
    pendingTimeEntriesRes,
    timeHoursRes,
    recentLogsRes,
  ] = await Promise.all([
    supabase.from('daily_logs').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null),
    supabase.from('daily_logs').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null).eq('status', 'draft'),
    supabase.from('daily_logs').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null).eq('status', 'approved'),
    supabase.from('time_entries').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null),
    supabase.from('time_entries').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null).eq('status', 'pending'),
    supabase.from('time_entries').select('regular_hours, overtime_hours')
      .eq('company_id', companyId).is('deleted_at', null),
    supabase.from('daily_logs').select('id, log_date, status, job_id, notes, weather_summary')
      .eq('company_id', companyId).is('deleted_at', null)
      .order('log_date', { ascending: false }).limit(5),
  ])

  const totalLogs = totalLogsRes.count || 0
  const draftLogs = draftLogsRes.count || 0
  const approvedLogs = approvedLogsRes.count || 0
  const totalTimeEntries = totalTimeEntriesRes.count || 0
  const pendingTimeEntries = pendingTimeEntriesRes.count || 0

  const timeData = (timeHoursRes.data || []) as {
    regular_hours: number | null; overtime_hours: number | null
  }[]
  const totalRegularHours = timeData.reduce((sum, t) => sum + (t.regular_hours || 0), 0)
  const totalOvertimeHours = timeData.reduce((sum, t) => sum + (t.overtime_hours || 0), 0)

  const recentLogs = (recentLogsRes.data || []) as {
    id: string; log_date: string; status: string; job_id: string
    notes: string | null; weather_summary: string | null
  }[]

  // ── Fetch job names for recent logs ──
  const jobIds = [...new Set(recentLogs.map((l) => l.job_id))]
  let jobMap: Record<string, string> = {}
  if (jobIds.length > 0) {
    const { data: jobs, error: jobError } = await supabase
      .from('jobs')
      .select('id, name')
      .in('id', jobIds)
    if (jobError) throw jobError
    if (jobs) {
      jobMap = Object.fromEntries(jobs.map((j) => [j.id, j.name]))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Factory className="h-6 w-6" />
          Production Intelligence
        </h1>
        <p className="text-muted-foreground mt-1">AI-driven production tracking and optimization</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Daily Logs</p>
                <p className="text-2xl font-bold">{totalLogs}</p>
                <p className="text-xs text-muted-foreground">{draftLogs} drafts</p>
              </div>
              <ClipboardList className="h-8 w-8 text-blue-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Time Entries</p>
                <p className="text-2xl font-bold">{totalTimeEntries}</p>
                <p className="text-xs text-muted-foreground">{pendingTimeEntries} pending</p>
              </div>
              <Timer className="h-8 w-8 text-purple-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Regular Hours</p>
                <p className="text-2xl font-bold">{totalRegularHours.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">total tracked</p>
              </div>
              <Clock className="h-8 w-8 text-green-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Overtime Hours</p>
                <p className="text-2xl font-bold">{totalOvertimeHours.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {totalRegularHours > 0
                    ? `${((totalOvertimeHours / totalRegularHours) * 100).toFixed(1)}% of regular`
                    : 'no regular hours yet'}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500/70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Labor Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Labor Hours Summary
          </CardTitle>
          <CardDescription>
            All time entries across jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalTimeEntries > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-blue-50">
                <p className="text-xs text-muted-foreground mb-1">Total Hours</p>
                <p className="text-xl font-bold text-blue-700">
                  {(totalRegularHours + totalOvertimeHours).toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50">
                <p className="text-xs text-muted-foreground mb-1">Approved Logs</p>
                <p className="text-xl font-bold text-green-700">{approvedLogs}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-amber-50">
                <p className="text-xs text-muted-foreground mb-1">Pending Approval</p>
                <p className="text-xl font-bold text-amber-700">{pendingTimeEntries}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No time entries recorded yet. Clock in on jobs to start tracking production data.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Daily Logs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Recent Daily Logs
            </CardTitle>
            <Link href="/daily-logs" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentLogs.length > 0 ? (
            <div className="divide-y divide-border">
              {recentLogs.map((log) => (
                <Link key={log.id} href={`/daily-logs/${log.id}`} className="block py-2 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{formatDate(log.log_date)}</span>
                        <span className="text-xs text-muted-foreground">
                          {jobMap[log.job_id] || 'Unknown Job'}
                        </span>
                      </div>
                      {log.weather_summary && (
                        <p className="text-xs text-muted-foreground mt-0.5">{log.weather_summary}</p>
                      )}
                    </div>
                    <Badge className={getStatusColor(log.status)}>
                      {log.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No daily logs yet</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/daily-logs">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg p-2 bg-blue-100">
                <ClipboardList className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Daily Logs</p>
                <p className="text-xs text-muted-foreground">View and manage daily field reports</p>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/time-clock">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg p-2 bg-purple-100">
                <Timer className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Time Clock</p>
                <p className="text-xs text-muted-foreground">Track crew hours and manage time entries</p>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
