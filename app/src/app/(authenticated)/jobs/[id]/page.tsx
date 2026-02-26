import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  Users,
  FileText,
  MapPin,
  Phone,
  Mail,
  Clock,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { ArchiveJobButton } from './archive-job-button'
import type { Metadata } from 'next'

interface JobDetail {
  id: string
  name: string
  job_number: string | null
  notes: string | null
  status: string | null
  contract_type: string | null
  contract_amount: number | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  start_date: string | null
  target_completion: string | null
  actual_completion: string | null
  created_at: string | null
  updated_at: string | null
  clients: { id: string; name: string; email: string | null; phone: string | null } | null
}

export const metadata: Metadata = { title: 'Job Details' }

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  const { data: jobData, error } = await supabase
    .from('jobs')
    .select('*, clients(id, name, email, phone)')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (error || !jobData) {
    notFound()
  }

  const job = jobData as JobDetail

  // Fetch related counts in parallel
  const [
    { count: changeOrderCount },
    { count: purchaseOrderCount },
    { count: dailyLogCount },
  ] = await Promise.all([
    supabase.from('change_orders').select('*', { count: 'exact', head: true }).eq('job_id', id).is('deleted_at', null),
    supabase.from('purchase_orders').select('*', { count: 'exact', head: true }).eq('job_id', id).is('deleted_at', null),
    supabase.from('daily_logs').select('*', { count: 'exact', head: true }).eq('job_id', id).is('deleted_at', null),
  ])

  const status = job.status ?? 'pre_construction'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/jobs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              {job.job_number && (
                <span className="text-sm text-muted-foreground font-mono">{job.job_number}</span>
              )}
              <h1 className="text-2xl font-bold text-foreground">{job.name}</h1>
              <Badge className={getStatusColor(status)}>
                {status.replace('_', ' ')}
              </Badge>
            </div>
            {job.notes && (
              <p className="text-muted-foreground mt-1">{job.notes}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/jobs/${id}/edit`}>
              <Button variant="outline">Edit Job</Button>
            </Link>
            <ArchiveJobButton jobId={id} />
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contract</p>
                <p className="text-lg font-bold">{formatCurrency(job.contract_amount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Change Orders</p>
                <p className="text-lg font-bold">{changeOrderCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Purchase Orders</p>
                <p className="text-lg font-bold">{purchaseOrderCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daily Logs</p>
                <p className="text-lg font-bold">{dailyLogCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Contract Type</dt>
                <dd className="font-medium">{(job.contract_type ?? 'N/A').replace('_', ' ')}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="font-medium">{(status).replace('_', ' ')}</dd>
              </div>
              {job.address && (
                <div className="col-span-2">
                  <dt className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Address
                  </dt>
                  <dd className="font-medium">
                    {job.address}{job.city ? `, ${job.city}` : ''}{job.state ? `, ${job.state}` : ''} {job.zip || ''}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Start Date
                </dt>
                <dd className="font-medium">{job.start_date ? formatDate(job.start_date) : 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Target Completion</dt>
                <dd className="font-medium">{job.target_completion ? formatDate(job.target_completion) : 'Not set'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            {job.clients ? (
              <div className="space-y-3">
                <Link
                  href={`/clients/${job.clients.id}`}
                  className="text-lg font-medium text-primary hover:underline"
                >
                  {job.clients.name}
                </Link>
                {job.clients.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {job.clients.email}
                  </div>
                )}
                {job.clients.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {job.clients.phone}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No client assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: 'Budget', href: `/jobs/${id}/budget`, icon: DollarSign },
              { name: 'Schedule', href: `/jobs/${id}/schedule`, icon: Calendar },
              { name: 'Daily Logs', href: `/jobs/${id}/daily-logs`, icon: FileText },
              { name: 'Change Orders', href: `/jobs/${id}/change-orders`, icon: FileText },
              { name: 'Purchase Orders', href: `/jobs/${id}/purchase-orders`, icon: FileText },
              { name: 'Documents', href: `/jobs/${id}/files`, icon: FileText },
            ].map((link) => (
              <Link key={link.name} href={link.href}>
                <Button variant="outline" className="w-full h-auto py-3 flex flex-col items-center gap-1.5">
                  <link.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs">{link.name}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
