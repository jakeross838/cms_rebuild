'use client'

import Link from 'next/link'

import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Sparkles,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useInvoiceActivity, useStampInvoice } from '@/hooks/use-invoices'
import { AIConfidenceBadge, AIConfidenceBar } from '@/components/invoices/ai-confidence-badge'
import { ReviewFlagsList, ReviewStatusSummary } from '@/components/invoices/review-flags'
import { PaymentStatusBadge } from '@/components/invoices/payment-status-badge'
import { ActivityTimeline, type InvoiceActivity as ActivityEntry } from '@/components/invoices/activity-timeline'
import { formatCurrency, formatDate, getStatusColor, formatStatus, cn } from '@/lib/utils'
import {
  INVOICE_STATUS_CONFIG,
  INVOICE_TYPE_CONFIG,
} from '@/types/invoice-full'
import type { Invoice as InvoiceFullType } from '@/types/invoice-full'

function DetailField({
  label,
  value,
  mono,
  icon,
  children,
}: {
  label: string
  value?: string | null
  mono?: boolean
  icon?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      {children ?? (
        <p className={cn('font-medium', mono && 'font-mono')}>{value || '--'}</p>
      )}
    </div>
  )
}

export function OverviewTab({
  invoice,
  invoiceId,
  jobName,
  vendorName,
  poNumber,
  costCodeLabel,
  contractConfig,
}: {
  invoice: InvoiceFullType
  invoiceId: string
  jobName: string | null
  vendorName: string | null
  poNumber: string | null
  costCodeLabel: string | null
  contractConfig: { label: string; abbrev: string } | null
}) {
  const typeConfig = INVOICE_TYPE_CONFIG[invoice.invoice_type]
  const isProgressType = invoice.invoice_type === 'progress' || invoice.invoice_type === 'final'
  const isPaid = invoice.status === 'paid'
  const stampMutation = useStampInvoice(invoiceId)

  // Fetch activity
  const { data: activityResponse } = useInvoiceActivity(invoiceId)
  const activities = ((activityResponse as { data: ActivityEntry[] } | undefined)?.data ?? []) as ActivityEntry[]

  // AI confidence data (per-field)
  const aiConfidence = invoice.ai_confidence as Record<string, number> | null
  const reviewFlags = (invoice.review_flags ?? []) as string[]

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-6">
      {/* Left column — invoice details */}
      <div className="space-y-6">
        {/* Review Flags Alert */}
        {reviewFlags.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium">Review Required</span>
                </div>
                <ReviewStatusSummary needsReview={true} flags={reviewFlags} />
              </div>
              <ReviewFlagsList flags={reviewFlags} />
            </CardContent>
          </Card>
        )}

        {/* Invoice Details Card */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Invoice Details</CardTitle>
            <div className="flex items-center gap-2">
              <PaymentStatusBadge
                paymentStatus={invoice.payment_status as 'unpaid' | 'partial' | 'paid' | undefined}
                paidAmount={invoice.paid_amount}
                totalAmount={invoice.amount}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <DetailField label="Invoice Number" value={invoice.invoice_number} mono />
              <DetailField label="Status">
                <Badge className={getStatusColor(invoice.status)}>
                  {INVOICE_STATUS_CONFIG[invoice.status]?.label ?? formatStatus(invoice.status)}
                </Badge>
              </DetailField>
              <DetailField label="Invoice Type">
                <Badge className={typeConfig?.color ?? ''}>
                  {typeConfig?.label ?? formatStatus(invoice.invoice_type)}
                </Badge>
              </DetailField>
              <DetailField label="Contract Type" value={contractConfig?.label ?? formatStatus(invoice.contract_type)} />
              <DetailField label="Invoice Date" value={formatDate(invoice.invoice_date)} icon={<Calendar className="h-3.5 w-3.5" />} />
              <DetailField label="Due Date" value={formatDate(invoice.due_date)} icon={<Clock className="h-3.5 w-3.5" />} />
              <DetailField label="Vendor">
                {invoice.vendor_id ? (
                  <Link href={`/vendors/${invoice.vendor_id}`} className="text-foreground hover:underline font-medium">
                    {vendorName || invoice.vendor_id}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">--</span>
                )}
              </DetailField>
              <DetailField label="Job">
                {invoice.job_id ? (
                  <Link href={`/jobs/${invoice.job_id}`} className="text-foreground hover:underline font-medium">
                    {jobName || invoice.job_id}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">--</span>
                )}
              </DetailField>
              <DetailField label="Purchase Order">
                {invoice.po_id ? (
                  <Link href={`/purchase-orders/${invoice.po_id}`} className="text-foreground hover:underline font-medium">
                    {poNumber || invoice.po_id}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">--</span>
                )}
              </DetailField>
              <DetailField label="Cost Code" value={costCodeLabel} />
              <DetailField label="Payment Terms" value={invoice.payment_terms} />
              <DetailField label="Lien Waiver">
                <Badge className={getStatusColor(invoice.lien_waiver_status)}>
                  {formatStatus(invoice.lien_waiver_status)}
                </Badge>
              </DetailField>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info Card */}
        {isPaid && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <DetailField label="Payment Method" value={invoice.payment_method ? formatStatus(invoice.payment_method) : null} />
                <DetailField label="Paid Date" value={formatDate(invoice.paid_date)} />
                <DetailField label="Paid Amount" value={formatCurrency(invoice.paid_amount)} />
                <DetailField label="Reference" value={invoice.payment_reference} mono />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Billing Card */}
        {isProgressType && (
          <Card>
            <CardHeader>
              <CardTitle>Progress Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <DetailField label="Billing Period">
                  {invoice.billing_period_start && invoice.billing_period_end
                    ? `${formatDate(invoice.billing_period_start)} — ${formatDate(invoice.billing_period_end)}`
                    : '--'}
                </DetailField>
                <DetailField label="Percent Complete">
                  {invoice.percent_complete != null ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full max-w-[120px]">
                        <div
                          className="h-2 bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(invoice.percent_complete, 100)}%` }}
                        />
                      </div>
                      <span className="font-medium">{invoice.percent_complete}%</span>
                    </div>
                  ) : '--'}
                </DetailField>
                <DetailField label="Cumulative Billed" value={formatCurrency(invoice.cumulative_billed)} />
                <DetailField label="Contract Value" value={formatCurrency(invoice.contract_value)} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes Card */}
        {(invoice.description || invoice.notes) && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoice.description && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm whitespace-pre-wrap">{invoice.description}</p>
                </div>
              )}
              {invoice.notes && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Internal Notes</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right column — PDF preview, AI info, activity */}
      <div className="space-y-6">
        {/* PDF Preview */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">PDF Preview</CardTitle>
              <div className="flex items-center gap-1">
                {invoice.stamped_pdf_url && (
                  <Button variant="ghost" size="sm" onClick={() => window.open(invoice.stamped_pdf_url!, '_blank')}>
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Stamped
                  </Button>
                )}
                {invoice.pdf_url && (
                  <Button variant="ghost" size="sm" onClick={() => window.open(invoice.pdf_url!, '_blank')}>
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Original
                  </Button>
                )}
                {invoice.pdf_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => stampMutation.mutate()}
                    disabled={stampMutation.isPending}
                  >
                    {stampMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Stamp
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2">
            {(invoice.stamped_pdf_url || invoice.pdf_url) ? (
              <iframe
                src={invoice.stamped_pdf_url || invoice.pdf_url!}
                className="w-full h-[50vh] rounded border"
                title="Invoice PDF"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground bg-accent/30 rounded">
                <FileText className="h-10 w-10 mb-2 opacity-40" />
                <p className="text-sm">No PDF uploaded</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Processing Info */}
        {(invoice.ai_notes || aiConfidence) && (
          <Card className="border-amber-200/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                AI Processing
                {invoice.ai_confidence != null && typeof invoice.ai_confidence === 'number' && (
                  <AIConfidenceBadge confidence={invoice.ai_confidence} />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoice.ai_notes && (
                <p className="text-sm text-muted-foreground">{invoice.ai_notes}</p>
              )}
              {aiConfidence && typeof aiConfidence === 'object' && (
                <div className="space-y-2">
                  {Object.entries(aiConfidence).map(([key, value]) => (
                    <AIConfidenceBar
                      key={key}
                      confidence={typeof value === 'number' ? value : 0}
                      label={key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Activity Timeline */}
        <Card>
          <CardContent className="p-4">
            <ActivityTimeline activities={activities} maxHeight="20rem" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
