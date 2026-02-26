import Link from 'next/link'

import {
  Briefcase,
  Receipt,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatRelativeDate, getStatusColor } from '@/lib/utils'
import type { Job, Client } from '@/types/database'

type JobWithClient = Job & { clients: Pick<Client, 'name'> | null }

export default async function DashboardPage() {
  const supabase = await createClient()

  // Resolve current user's company_id for defense-in-depth tenant filtering
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user!.id).single()
  const companyId = profile?.company_id

  // Fetch dashboard stats
  const [
    { count: activeJobs },
    { count: pendingInvoices },
    { count: pendingDraws },
    { data: recentJobsData },
  ] = await Promise.all([
    supabase.from('jobs').select('*', { count: 'exact', head: true }).is('deleted_at', null).eq('company_id', companyId!).eq('status', 'active'),
    supabase.from('invoices').select('*', { count: 'exact', head: true }).is('deleted_at', null).eq('company_id', companyId!).in('status', ['pm_pending', 'accountant_pending', 'owner_pending']),
    supabase.from('draw_requests').select('*', { count: 'exact', head: true }).is('deleted_at', null).eq('company_id', companyId!).eq('status', 'pending_approval'),
    supabase.from('jobs').select('*, clients(name)').is('deleted_at', null).eq('company_id', companyId!).order('updated_at', { ascending: false }).limit(5),
  ])

  const recentJobs = (recentJobsData || []) as JobWithClient[]

  const stats = [
    {
      name: 'Active Jobs',
      value: activeJobs || 0,
      icon: Briefcase,
      href: '/jobs?status=active',
      color: 'text-stone-600 bg-stone-100',
    },
    {
      name: 'Pending Invoices',
      value: pendingInvoices || 0,
      icon: Receipt,
      href: '/invoices?status=pending',
      color: 'text-sand-600 bg-sand-100',
    },
    {
      name: 'Pending Draws',
      value: pendingDraws || 0,
      icon: FileText,
      href: '/draws?status=pending',
      color: 'text-stone-600 bg-warm-100',
    },
    {
      name: 'This Month Revenue',
      value: formatCurrency(0), // TODO: Calculate from draws
      icon: DollarSign,
      href: '/financial/cash-flow',
      color: 'text-green-600 bg-green-100',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here&apos;s an overview of your projects.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-medium">Recent Jobs</CardTitle>
              <CardDescription className="mt-1">Your most recently updated projects</CardDescription>
            </div>
            <Link
              href="/jobs"
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentJobs.length > 0 ? (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors border border-transparent hover:border-border/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">
                          {job.name}
                        </span>
                        <Badge className={getStatusColor(job.status ?? 'active')}>
                          {(job.status ?? 'active').replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {job.clients?.name || 'No client'} • {job.city}, {job.state}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        {formatCurrency(job.contract_amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelativeDate(job.updated_at)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p>No jobs yet</p>
                <Link href="/jobs/new" className="text-primary hover:underline text-sm">
                  Create your first job
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Action Items</CardTitle>
            <CardDescription className="mt-1">Things that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(pendingInvoices || 0) > 0 && (
                <Link
                  href="/invoices?status=pending"
                  className="flex items-center gap-4 p-4 rounded-xl bg-sand-50/50 hover:bg-sand-50 transition-colors border border-orange-100"
                >
                  <div className="p-2 rounded-lg bg-sand-100">
                    <AlertCircle className="h-5 w-5 text-sand-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-orange-900">
                      {pendingInvoices} invoice{pendingInvoices !== 1 ? 's' : ''} pending approval
                    </div>
                    <div className="text-sm text-sand-700">Review and approve</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-sand-600" />
                </Link>
              )}

              {(pendingDraws || 0) > 0 && (
                <Link
                  href="/draws?status=pending"
                  className="flex items-center gap-4 p-4 rounded-xl bg-warm-50/50 hover:bg-warm-50 transition-colors border border-warm-100"
                >
                  <div className="p-2 rounded-lg bg-warm-100">
                    <Clock className="h-5 w-5 text-stone-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-stone-800">
                      {pendingDraws} draw{pendingDraws !== 1 ? 's' : ''} awaiting client approval
                    </div>
                    <div className="text-sm text-warm-700">Follow up with clients</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-stone-600" />
                </Link>
              )}

              {(pendingInvoices || 0) === 0 && (pendingDraws || 0) === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 text-green-300" />
                  <p className="text-green-600 font-medium">All caught up!</p>
                  <p className="text-sm">No pending action items</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
