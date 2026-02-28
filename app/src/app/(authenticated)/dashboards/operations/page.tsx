import Link from 'next/link'

import {
  Briefcase,
  Users,
  FileCheck,
  Wrench,
  AlertTriangle,
  ShieldAlert,
  Award,
  ClipboardList,
  Calendar,
  ArrowRight,
  Cloud,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { formatDate, formatStatus, getStatusColor } from '@/lib/utils'
import type { Metadata } from 'next'

// ── Page ─────────────────────────────────────────────────────────────

export const metadata: Metadata = { title: 'Operations' }

export default async function OperationsDashboardPage() {
  const { companyId, supabase } = await getServerAuth()

  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // ── Parallel data fetching ──
  const [
    activeJobsRes,
    employeesRes,
    openPermitsRes,
    equipmentRes,
    overdueInspectionsRes,
    openIncidentsRes,
    expiringCertsRes,
    recentDailyLogsRes,
    upcomingInspectionsRes,
  ] = await Promise.all([
    // KPI 1: Active Jobs
    supabase.from('jobs').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .in('status', ['pre_construction', 'active']),

    // KPI 2: Total Employees
    supabase.from('employees').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .is('deleted_at', null),

    // KPI 3: Open Permits
    supabase.from('permits').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .not('status', 'in', '("approved","closed")'),

    // KPI 4: Equipment Items
    supabase.from('equipment').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .is('deleted_at', null),

    // Action 1: Overdue Inspections
    supabase.from('permit_inspections').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'scheduled')
      .lt('scheduled_date', today),

    // Action 2: Open Safety Incidents
    supabase.from('safety_incidents').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .neq('status', 'closed'),

    // Action 3: Expiring Certifications (within 30 days)
    supabase.from('employee_certifications').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .lt('expiration_date', thirtyDaysFromNow),

    // List 1: Recent Daily Logs (last 5)
    supabase.from('daily_logs').select('id, log_date, weather_summary, job_id, jobs(name)')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('log_date', { ascending: false })
      .limit(5),

    // List 2: Upcoming Inspections (next 5)
    supabase.from('permit_inspections').select('id, inspection_type, scheduled_date, status, job_id')
      .eq('company_id', companyId)
      .eq('status', 'scheduled')
      .gte('scheduled_date', today)
      .order('scheduled_date', { ascending: true })
      .limit(5),
  ])

  // ── Extract counts ──
  const activeJobs = activeJobsRes.count || 0
  const totalEmployees = employeesRes.count || 0
  const openPermits = openPermitsRes.count || 0
  const equipmentItems = equipmentRes.count || 0

  const overdueInspections = overdueInspectionsRes.count || 0
  const openIncidents = openIncidentsRes.count || 0
  const expiringCerts = expiringCertsRes.count || 0

  // ── Type list data ──
  const recentDailyLogs = (recentDailyLogsRes.data || []) as {
    id: string
    log_date: string
    weather_summary: string | null
    job_id: string
    jobs: { name: string } | null
  }[]

  const rawInspections = (upcomingInspectionsRes.data || []) as {
    id: string
    inspection_type: string
    scheduled_date: string | null
    status: string
    job_id: string | null
  }[]

  // Resolve job names for inspections (permit_inspections has no FK to jobs)
  const inspectionJobIds = rawInspections
    .map((i) => i.job_id)
    .filter((id): id is string => id !== null)
  const uniqueJobIds = [...new Set(inspectionJobIds)]

  let inspectionJobMap: Record<string, string> = {}
  if (uniqueJobIds.length > 0) {
    const { data: jobRows } = await supabase
      .from('jobs')
      .select('id, name')
      .eq('company_id', companyId)
      .in('id', uniqueJobIds)
      .is('deleted_at', null)
    if (jobRows) {
      inspectionJobMap = Object.fromEntries(
        jobRows.map((j: { id: string; name: string }) => [j.id, j.name])
      )
    }
  }

  const upcomingInspections = rawInspections.map((insp) => ({
    ...insp,
    jobName: insp.job_id ? (inspectionJobMap[insp.job_id] ?? 'Unknown job') : 'No job',
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Operations Dashboard</h1>
        <p className="text-muted-foreground">Field operations, safety, and workforce overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/jobs">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Active Jobs</p>
                  <p className="text-2xl font-bold">{activeJobs}</p>
                  <p className="text-xs text-muted-foreground">in progress</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-500/70" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{totalEmployees}</p>
                <p className="text-xs text-muted-foreground">workforce</p>
              </div>
              <Users className="h-8 w-8 text-green-500/70" />
            </div>
          </CardContent>
        </Card>

        <Link href="/permits">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Open Permits</p>
                  <p className="text-2xl font-bold">{openPermits}</p>
                  <p className="text-xs text-muted-foreground">pending or in review</p>
                </div>
                <FileCheck className="h-8 w-8 text-amber-500/70" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/equipment">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Equipment Items</p>
                  <p className="text-2xl font-bold">{equipmentItems}</p>
                  <p className="text-xs text-muted-foreground">tracked assets</p>
                </div>
                <Wrench className="h-8 w-8 text-purple-500/70" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Action Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={overdueInspections > 0 ? 'border-red-200' : ''}>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <AlertTriangle className="h-4 w-4 text-red-700" />
            </div>
            <div>
              <p className="font-medium">{overdueInspections} Overdue Inspections</p>
              <p className="text-xs text-muted-foreground">Past scheduled date</p>
            </div>
          </CardContent>
        </Card>

        <Link href="/safety">
          <Card className={`hover:bg-accent/50 transition-colors cursor-pointer ${openIncidents > 0 ? 'border-amber-200' : ''}`}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="rounded-full bg-amber-100 p-2">
                <ShieldAlert className="h-4 w-4 text-amber-700" />
              </div>
              <div>
                <p className="font-medium">{openIncidents} Open Safety Incidents</p>
                <p className="text-xs text-muted-foreground">Needs investigation or resolution</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className={expiringCerts > 0 ? 'border-amber-200' : ''}>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-2">
              <Award className="h-4 w-4 text-amber-700" />
            </div>
            <div>
              <p className="font-medium">{expiringCerts} Expiring Certifications</p>
              <p className="text-xs text-muted-foreground">Within next 30 days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Daily Logs */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Recent Daily Logs
              </CardTitle>
              <Link href="/daily-logs" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentDailyLogs.length > 0 ? (
              <div className="divide-y divide-border">
                {recentDailyLogs.map((log) => (
                  <div key={log.id} className="py-2 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{log.jobs?.name ?? 'Unknown job'}</span>
                        <p className="text-xs text-muted-foreground">{formatDate(log.log_date)}</p>
                      </div>
                      {log.weather_summary ? (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Cloud className="h-3 w-3" />
                          <span>{log.weather_summary}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No daily logs yet</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Inspections */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming Inspections
              </CardTitle>
              <Link href="/permits" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingInspections.length > 0 ? (
              <div className="divide-y divide-border">
                {upcomingInspections.map((insp) => (
                  <div key={insp.id} className="py-2 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{insp.inspection_type}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{insp.jobName}</p>
                      </div>
                      <Badge className={getStatusColor(insp.status)}>
                        {formatStatus(insp.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming inspections</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
