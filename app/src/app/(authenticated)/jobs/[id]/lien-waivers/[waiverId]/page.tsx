import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArrowLeft, Shield } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { formatCurrency, formatDate, formatStatus, getStatusColor } from '@/lib/utils'

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Lien Waiver Detail' }

export default async function LienWaiverDetailPage({
  params,
}: {
  params: Promise<{ id: string; waiverId: string }>
}) {
  const { id, waiverId } = await params
  const { companyId, supabase } = await getServerAuth()

  // Verify job belongs to company
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, name')
    .eq('id', id)
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .single()

  if (jobError || !job) {
    notFound()
  }

  // Fetch lien waiver and verify it belongs to this job
  const { data: waiver, error: waiverError } = await supabase
    .from('lien_waivers')
    .select('*')
    .eq('id', waiverId)
    .eq('job_id', id)
    .is('deleted_at', null)
    .single()

  if (waiverError || !waiver) {
    notFound()
  }

  // Fetch vendor name if vendor_id exists
  let vendorName: string | null = null
  if (waiver.vendor_id) {
    const { data: vendor } = await supabase
      .from('vendors')
      .select('name')
      .eq('id', waiver.vendor_id)
      .single()
    vendorName = vendor?.name ?? null
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/jobs/${id}/lien-waivers`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Lien Waivers
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {waiver.claimant_name || 'Unknown Claimant'}
              </h1>
              <Badge className={getStatusColor(waiver.status)}>
                {formatStatus(waiver.status)}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {job.name}
              {waiver.through_date
                ? ` \u2014 Through ${formatDate(waiver.through_date)}`
                : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Waiver Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Waiver Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Claimant</dt>
              <dd className="font-medium text-foreground mt-0.5">
                {waiver.claimant_name || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Waiver Type</dt>
              <dd className="font-medium text-foreground mt-0.5">
                {waiver.waiver_type ? formatStatus(waiver.waiver_type) : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="mt-0.5">
                <Badge className={getStatusColor(waiver.status)}>
                  {formatStatus(waiver.status)}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="font-medium text-foreground mt-0.5">
                {waiver.amount != null ? formatCurrency(waiver.amount) : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Through Date</dt>
              <dd className="font-medium text-foreground mt-0.5">
                {waiver.through_date ? formatDate(waiver.through_date) : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Check #</dt>
              <dd className="font-medium text-foreground mt-0.5">
                {waiver.check_number || '-'}
              </dd>
            </div>
            {vendorName && (
              <div>
                <dt className="text-muted-foreground">Vendor</dt>
                <dd className="font-medium text-foreground mt-0.5">
                  {vendorName}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd className="font-medium text-foreground mt-0.5">
                {formatDate(waiver.created_at)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Requested</dt>
              <dd className="font-medium text-foreground mt-0.5">
                {waiver.requested_at ? formatDate(waiver.requested_at) : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Received</dt>
              <dd className="font-medium text-foreground mt-0.5">
                {waiver.received_at ? formatDate(waiver.received_at) : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Approved</dt>
              <dd className="font-medium text-foreground mt-0.5">
                {waiver.approved_at ? formatDate(waiver.approved_at) : '-'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Notes */}
      {waiver.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {waiver.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
