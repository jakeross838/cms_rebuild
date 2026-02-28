import Link from 'next/link'
import { redirect } from 'next/navigation'

import {
  Briefcase,
  Users,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor, formatStatus} from '@/lib/utils'
import type { Metadata } from 'next'

// ── Page ─────────────────────────────────────────────────────────────

export const metadata: Metadata = { title: 'Overview' }

export default async function DashboardOverviewPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id, name').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  const displayName = profile.name?.split(' ')[0] || 'there'

  // ── Parallel data fetching ──
  const [
    jobsRes,
    activeJobsRes,
    clientsRes,
    vendorsRes,
    invoicesRes,
    pendingInvoicesRes,
    changeOrdersRes,
    rfisRes,
    punchItemsRes,
    recentJobsRes,
    recentInvoicesRes,
    overdueRfisRes,
  ] = await Promise.all([
    // Total jobs
    supabase.from('jobs').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null),
    // Active jobs
    supabase.from('jobs').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null)
      .in('status', ['pre_construction', 'active']),
    // Total clients
    supabase.from('clients').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null),
    // Total vendors
    supabase.from('vendors').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null),
    // All invoices (for total revenue)
    supabase.from('invoices').select('amount')
      .eq('company_id', companyId).is('deleted_at', null)
      .in('status', ['paid', 'approved']),
    // Pending invoices
    supabase.from('invoices').select('amount')
      .eq('company_id', companyId).is('deleted_at', null)
      .in('status', ['draft', 'pm_pending', 'accountant_pending', 'owner_pending']),
    // Open change orders
    supabase.from('change_orders').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null)
      .in('status', ['Draft', 'Pending']),
    // Open RFIs
    supabase.from('rfis').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null)
      .eq('status', 'Open'),
    // Open punch items
    supabase.from('punch_items').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null)
      .in('status', ['open', 'in_progress']),
    // Recent jobs (last 5)
    supabase.from('jobs').select('id, name, job_number, status, updated_at')
      .eq('company_id', companyId).is('deleted_at', null)
      .order('updated_at', { ascending: false }).limit(5),
    // Recent invoices (last 5)
    supabase.from('invoices').select('id, invoice_number, amount, status, vendor_id, created_at')
      .eq('company_id', companyId).is('deleted_at', null)
      .order('created_at', { ascending: false }).limit(5),
    // Overdue RFIs (due_date in past, still open)
    supabase.from('rfis').select('id, rfi_number, subject, due_date, status')
      .eq('company_id', companyId).is('deleted_at', null)
      .eq('status', 'Open')
      .lt('due_date', new Date().toISOString().split('T')[0])
      .order('due_date', { ascending: true }).limit(5),
  ])

  const totalJobs = jobsRes.count || 0
  const activeJobs = activeJobsRes.count || 0
  const totalClients = clientsRes.count || 0
  const totalVendors = vendorsRes.count || 0

  const totalRevenue = (invoicesRes.data || []).reduce(
    (sum: number, inv: { amount: number | null }) => sum + (inv.amount || 0), 0
  )
  const pendingAmount = (pendingInvoicesRes.data || []).reduce(
    (sum: number, inv: { amount: number | null }) => sum + (inv.amount || 0), 0
  )
  const pendingInvoiceCount = (pendingInvoicesRes.data || []).length

  const openChangeOrders = changeOrdersRes.count || 0
  const openRfis = rfisRes.count || 0
  const openPunchItems = punchItemsRes.count || 0

  const recentJobs = (recentJobsRes.data || []) as {
    id: string; name: string; job_number: string | null; status: string | null; updated_at: string | null
  }[]
  const recentInvoices = (recentInvoicesRes.data || []) as {
    id: string; invoice_number: string | null; amount: number | null; status: string | null; created_at: string | null
  }[]
  const overdueRfis = (overdueRfisRes.data || []) as {
    id: string; rfi_number: string | null; subject: string | null; due_date: string | null; status: string
  }[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Good {getTimeOfDay()}, {displayName}</h1>
        <p className="text-muted-foreground">Here&apos;s your company overview</p>
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
                  <p className="text-xs text-muted-foreground">{totalJobs} total</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-500/70" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/invoices">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground">paid & approved</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500/70" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/invoices?status=pending">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Pending Invoices</p>
                  <p className="text-2xl font-bold">{formatCurrency(pendingAmount)}</p>
                  <p className="text-xs text-muted-foreground">{pendingInvoiceCount} invoices</p>
                </div>
                <DollarSign className="h-8 w-8 text-amber-500/70" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/clients">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Clients</p>
                  <p className="text-2xl font-bold">{totalClients}</p>
                  <p className="text-xs text-muted-foreground">{totalVendors} vendors</p>
                </div>
                <Users className="h-8 w-8 text-purple-500/70" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Action Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/change-orders">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="rounded-full bg-amber-100 p-2">
                <AlertTriangle className="h-4 w-4 text-amber-700" />
              </div>
              <div>
                <p className="font-medium">{openChangeOrders} Open Change Orders</p>
                <p className="text-xs text-muted-foreground">Pending review or approval</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/rfis">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <Clock className="h-4 w-4 text-blue-700" />
              </div>
              <div>
                <p className="font-medium">{openRfis} Open RFIs</p>
                <p className="text-xs text-muted-foreground">Awaiting response</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/punch-lists">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-2">
                <CheckCircle2 className="h-4 w-4 text-red-700" />
              </div>
              <div>
                <p className="font-medium">{openPunchItems} Open Punch Items</p>
                <p className="text-xs text-muted-foreground">Needs attention</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Recent Jobs
              </CardTitle>
              <Link href="/jobs" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentJobs.length > 0 ? (
              <div className="divide-y divide-border">
                {recentJobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`} className="block py-2 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {job.job_number && <span className="text-xs font-mono text-muted-foreground">{job.job_number}</span>}
                          <span className="text-sm font-medium">{job.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(job.updated_at)}</p>
                      </div>
                      <Badge className={getStatusColor(job.status ?? 'pre_construction')}>
                        {formatStatus((job.status ?? 'pre_construction'))}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No jobs yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Recent Invoices
              </CardTitle>
              <Link href="/invoices" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentInvoices.length > 0 ? (
              <div className="divide-y divide-border">
                {recentInvoices.map((inv) => (
                  <Link key={inv.id} href={`/invoices/${inv.id}`} className="block py-2 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{inv.invoice_number || 'No number'}</span>
                        <p className="text-xs text-muted-foreground">{formatDate(inv.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{formatCurrency(inv.amount || 0)}</span>
                        <Badge className={getStatusColor(inv.status ?? 'draft')}>
                          {formatStatus(inv.status ?? 'draft')}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No invoices yet</p>
            )}
          </CardContent>
        </Card>

        {/* Overdue RFIs */}
        {overdueRfis.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  Overdue RFIs
                </CardTitle>
                <Link href="/rfis" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {overdueRfis.map((rfi) => (
                  <Link key={rfi.id} href={`/rfis/${rfi.id}`} className="block py-2 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {rfi.rfi_number && <span className="text-xs font-mono text-muted-foreground">{rfi.rfi_number}</span>}
                        <span className="text-sm font-medium">{rfi.subject || 'Untitled'}</span>
                      </div>
                      <span className="text-xs text-red-600 font-medium">Due: {formatDate(rfi.due_date)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function getTimeOfDay(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}
