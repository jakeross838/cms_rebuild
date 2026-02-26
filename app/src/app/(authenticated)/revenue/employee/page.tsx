import Link from 'next/link'
import { Users, Clock, Briefcase, ArrowRight } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Employee Productivity' }

export default async function EmployeeRevenuePage() {
  const supabase = await createClient()

  // ── Resolve tenant ──────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user!.id)
    .single()
  const companyId = profile?.company_id

  // ── Query employee and time data in parallel ────────────────────
  const [
    { count: employeeCount },
    { data: timeEntries },
  ] = await Promise.all([
    supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .eq('company_id', companyId!),
    supabase
      .from('time_entries')
      .select('regular_hours, overtime_hours')
      .is('deleted_at', null)
      .eq('company_id', companyId!),
  ])

  // ── Compute totals ─────────────────────────────────────────────
  const totalEmployees = employeeCount ?? 0
  const totalRegularHours = (timeEntries || []).reduce(
    (sum, te) => sum + Number(te.regular_hours || 0),
    0
  )
  const totalOvertimeHours = (timeEntries || []).reduce(
    (sum, te) => sum + Number(te.overtime_hours || 0),
    0
  )
  const totalHours = totalRegularHours + totalOvertimeHours

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6" />
          Employee Revenue
        </h1>
        <p className="text-muted-foreground">Team overview and labor hours</p>
      </div>

      {/* ── Stats Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-muted-foreground">Total Employees</p>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{totalEmployees}</p>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <p className="text-sm text-muted-foreground">Regular Hours</p>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {totalRegularHours.toLocaleString('en-US', { maximumFractionDigits: 1 })}
            </p>
            <p className="text-xs text-muted-foreground">Hours logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-muted-foreground">Overtime Hours</p>
            </div>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {totalOvertimeHours.toLocaleString('en-US', { maximumFractionDigits: 1 })}
            </p>
            <p className="text-xs text-muted-foreground">Overtime logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-foreground" />
              <p className="text-sm text-muted-foreground">Total Hours</p>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">
              {totalHours.toLocaleString('en-US', { maximumFractionDigits: 1 })}
            </p>
            <p className="text-xs text-muted-foreground">All hours combined</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Labor Breakdown ────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Labor Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {totalHours > 0 ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Regular Hours</span>
                  <span className="font-medium">
                    {totalRegularHours.toLocaleString('en-US', { maximumFractionDigits: 1 })} hrs
                    ({totalHours > 0 ? ((totalRegularHours / totalHours) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="h-3 rounded bg-muted overflow-hidden">
                  <div
                    className="h-full rounded bg-green-500"
                    style={{ width: `${totalHours > 0 ? (totalRegularHours / totalHours) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overtime Hours</span>
                  <span className="font-medium">
                    {totalOvertimeHours.toLocaleString('en-US', { maximumFractionDigits: 1 })} hrs
                    ({totalHours > 0 ? ((totalOvertimeHours / totalHours) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="h-3 rounded bg-muted overflow-hidden">
                  <div
                    className="h-full rounded bg-amber-500"
                    style={{ width: `${totalHours > 0 ? (totalOvertimeHours / totalHours) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No time entries yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Labor hours will appear once time entries are logged
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Quick Links ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/hr">
          <Card className="hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">HR Management</p>
                <p className="text-xs text-muted-foreground">Employee records and management</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/time-clock">
          <Card className="hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Time Clock</p>
                <p className="text-xs text-muted-foreground">Clock in/out and time entries</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
