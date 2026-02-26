import Link from 'next/link'
import { PieChart, Briefcase, FileText, ArrowRight } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'

export default async function RevenueAttributionPage() {
  const supabase = await createClient()

  // ── Resolve tenant ──────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user!.id)
    .single()
  const companyId = profile?.company_id

  // ── Query paid invoices with job info ───────────────────────────
  const { data: paidInvoices } = await supabase
    .from('ar_invoices')
    .select('amount, job_id, jobs(name, job_number)')
    .is('deleted_at', null)
    .eq('company_id', companyId!)
    .eq('status', 'paid')

  // ── Aggregate revenue by job ────────────────────────────────────
  const jobRevenueMap = new Map<string, { name: string; jobNumber: string; total: number }>()

  for (const inv of paidInvoices || []) {
    if (!inv.job_id) continue
    const existing = jobRevenueMap.get(inv.job_id)
    const jobData = inv.jobs as { name: string; job_number: string } | null
    if (existing) {
      existing.total += Number(inv.amount || 0)
    } else {
      jobRevenueMap.set(inv.job_id, {
        name: jobData?.name || 'Unknown Job',
        jobNumber: jobData?.job_number || '',
        total: Number(inv.amount || 0),
      })
    }
  }

  // Sort by revenue descending and take top 5
  const topJobs = Array.from(jobRevenueMap.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)

  const totalRevenue = topJobs.reduce((sum, [, job]) => sum + job.total, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <PieChart className="h-6 w-6" />
          Revenue Attribution
        </h1>
        <p className="text-muted-foreground">Revenue breakdown by job</p>
      </div>

      {/* ── Top Jobs by Revenue ─────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Top Jobs by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {topJobs.length > 0 ? (
            <div className="space-y-4">
              {topJobs.map(([jobId, job], index) => {
                const pct = totalRevenue > 0 ? (job.total / totalRevenue) * 100 : 0
                return (
                  <div key={jobId} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground w-5">
                          #{index + 1}
                        </span>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{job.name}</p>
                          {job.jobNumber && (
                            <p className="text-xs text-muted-foreground">{job.jobNumber}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(job.total)}
                      </p>
                    </div>
                    <div className="ml-7 h-2 rounded bg-muted overflow-hidden">
                      <div
                        className="h-full rounded bg-green-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <PieChart className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No revenue data yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Revenue by job will appear once invoices are marked as paid
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Quick Links ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/invoices">
          <Card className="hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">View All Invoices</p>
                <p className="text-xs text-muted-foreground">Manage AR invoices</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/jobs">
          <Card className="hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">View All Jobs</p>
                <p className="text-xs text-muted-foreground">Manage job details</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
