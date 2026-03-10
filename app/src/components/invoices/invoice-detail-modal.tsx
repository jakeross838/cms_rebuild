'use client'

import { useMemo } from 'react'

import Link from 'next/link'

import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  DollarSign,
  FileText,
  Loader2,
  Sparkles,
  XCircle,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useInvoice,
  useUpdateInvoice,
  useInvoiceActivity,
  useStampInvoice,
} from '@/hooks/use-invoices'
import { AIConfidenceBadge } from '@/components/invoices/ai-confidence-badge'
import { PaymentStatusBadge } from '@/components/invoices/payment-status-badge'
import { ActivityTimeline, type InvoiceActivity as ActivityEntry } from '@/components/invoices/activity-timeline'
import { formatCurrency, formatDate, getStatusColor, formatStatus, cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  INVOICE_STATUS_TRANSITIONS,
  INVOICE_STATUS_CONFIG,
  INVOICE_TYPE_CONFIG,
  CONTRACT_TYPE_CONFIG,
} from '@/types/invoice-full'
import type {
  InvoiceStatus,
  Invoice as InvoiceFullType,
} from '@/types/invoice-full'

// ── Pipeline ──────────────────────────────────────────────────────────────────

const STATUS_PIPELINE: InvoiceStatus[] = ['draft', 'pm_pending', 'approved', 'in_draw', 'paid']

const PIPELINE_LABELS: Record<string, string> = {
  draft: 'Draft',
  pm_pending: 'PM Review',
  approved: 'Approved',
  in_draw: 'In Draw',
  paid: 'Paid',
}

// ── Component ─────────────────────────────────────────────────────────────────

interface InvoiceDetailModalProps {
  invoiceId: string | null
  open: boolean
  onClose: () => void
}

export function InvoiceDetailModal({ invoiceId, open, onClose }: InvoiceDetailModalProps) {
  const { data: response, isLoading } = useInvoice(invoiceId ?? '')
  const updateMutation = useUpdateInvoice(invoiceId ?? '')
  const stampMutation = useStampInvoice(invoiceId ?? '')
  const { data: activityResponse } = useInvoiceActivity(invoiceId ?? '')

  const invoice = (response as { data: InvoiceFullType } | undefined)?.data ?? null
  const activities = ((activityResponse as { data: ActivityEntry[] } | undefined)?.data ?? []) as ActivityEntry[]

  const currentStatus = (invoice?.status ?? 'draft') as InvoiceStatus
  const transitions = INVOICE_STATUS_TRANSITIONS[currentStatus] ?? []
  const statusConfig = INVOICE_STATUS_CONFIG[currentStatus]
  const typeConfig = invoice ? INVOICE_TYPE_CONFIG[invoice.invoice_type] : null
  const contractConfig = invoice ? CONTRACT_TYPE_CONFIG[invoice.contract_type] : null
  const isDenied = currentStatus === 'denied'

  const netAmount = useMemo(() => {
    if (!invoice) return 0
    if (invoice.net_amount != null) return invoice.net_amount
    const retainageAmt = invoice.retainage_amount ?? (invoice.amount * (invoice.retainage_percent ?? 0) / 100)
    return invoice.amount - retainageAmt
  }, [invoice])

  const currentPipelineIndex = STATUS_PIPELINE.indexOf(currentStatus)
  const effectivePipelineIndex = currentPipelineIndex >= 0
    ? currentPipelineIndex
    : (currentStatus === 'accountant_pending' || currentStatus === 'owner_pending') ? 1 : -1

  const dueInfo = useMemo(() => {
    if (!invoice?.due_date) return null
    const due = new Date(invoice.due_date)
    if (isNaN(due.getTime())) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    due.setHours(0, 0, 0, 0)
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, className: 'text-destructive' }
    if (diff === 0) return { label: 'Due today', className: 'text-amber-600' }
    if (diff <= 7) return { label: `Due in ${diff}d`, className: 'text-amber-600' }
    return null
  }, [invoice?.due_date])

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    try {
      await updateMutation.mutateAsync({ status: newStatus } as Record<string, unknown>)
      toast.success(`Status changed to ${INVOICE_STATUS_CONFIG[newStatus]?.label ?? formatStatus(newStatus)}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-7xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0" showCloseButton>
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-border flex-shrink-0">
          <DialogDescription className="sr-only">Invoice details and PDF preview</DialogDescription>
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-lg font-bold">
                {invoice?.invoice_number || 'Invoice'}
              </DialogTitle>
              {invoice && (
                <>
                  <Badge className={getStatusColor(currentStatus)}>
                    {statusConfig?.label ?? formatStatus(currentStatus)}
                  </Badge>
                  {typeConfig && invoice.invoice_type !== 'standard' && (
                    <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
                  )}
                </>
              )}
            </div>
            {invoice && (
              <Link href={`/invoices/${invoice.id}`} onClick={onClose}>
                <Button variant="ghost" size="sm">
                  Open Full Details <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </DialogHeader>

        {/* Body — split screen (stacks on small screens) */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !invoice ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Invoice not found
            </div>
          ) : (
            <>
              {/* Left — PDF Preview */}
              <div className="flex-1 md:border-r border-b md:border-b-0 border-border bg-muted/30 flex flex-col min-w-0 min-h-[300px]">
                <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-card">
                  <span className="text-sm font-medium text-muted-foreground">PDF Preview</span>
                  <div className="flex items-center gap-1">
                    {invoice.stamped_pdf_url && (
                      <Button variant="ghost" size="sm" onClick={() => window.open(invoice.stamped_pdf_url!, '_blank')}>
                        <FileText className="h-3.5 w-3.5 mr-1" />Stamped
                      </Button>
                    )}
                    {invoice.pdf_url && (
                      <Button variant="ghost" size="sm" onClick={() => window.open(invoice.pdf_url!, '_blank')}>
                        <FileText className="h-3.5 w-3.5 mr-1" />Original
                      </Button>
                    )}
                    {invoice.pdf_url && (
                      <Button variant="ghost" size="sm" onClick={() => stampMutation.mutate()} disabled={stampMutation.isPending}>
                        {stampMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Stamp</>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex-1 p-2">
                  {(invoice.stamped_pdf_url || invoice.pdf_url) ? (
                    <iframe
                      src={invoice.stamped_pdf_url || invoice.pdf_url!}
                      className="w-full h-full rounded border"
                      title="Invoice PDF"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <FileText className="h-16 w-16 mb-3 opacity-30" />
                      <p className="text-sm font-medium">No PDF uploaded</p>
                      <p className="text-xs text-muted-foreground mt-1">Upload a PDF to preview it here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right — Details */}
              <div className="w-full md:w-[420px] flex-shrink-0 overflow-y-auto">
                <div className="p-5 space-y-5">
                  {/* Amount hero */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold tracking-tight">{formatCurrency(invoice.amount)}</p>
                    </div>
                    {invoice.retainage_percent > 0 && (
                      <div className="ml-auto text-right">
                        <p className="text-xs text-muted-foreground">Net ({invoice.retainage_percent}% ret.)</p>
                        <p className="text-lg font-semibold">{formatCurrency(netAmount)}</p>
                      </div>
                    )}
                  </div>

                  {/* Due date */}
                  {invoice.due_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Due {formatDate(invoice.due_date)}</span>
                      {dueInfo && <span className={cn('text-xs font-medium', dueInfo.className)}>{dueInfo.label}</span>}
                    </div>
                  )}

                  {/* Pipeline */}
                  {!isDenied ? (
                    <div className="flex items-center gap-0.5 overflow-x-auto py-1">
                      {STATUS_PIPELINE.map((status, index) => {
                        const isComplete = index < effectivePipelineIndex
                        const isCurrent = index === effectivePipelineIndex
                        return (
                          <div key={status} className="flex items-center">
                            {index > 0 && (
                              <div className={cn('h-0.5 w-5 shrink-0', isComplete ? 'bg-emerald-500' : 'bg-border')} />
                            )}
                            <div className="flex flex-col items-center gap-1 shrink-0">
                              <div className={cn(
                                'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium',
                                isComplete ? 'bg-emerald-100 text-emerald-700'
                                  : isCurrent ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                                  : 'bg-muted text-muted-foreground'
                              )}>
                                {isComplete ? <CheckCircle2 className="h-3 w-3" /> : index + 1}
                              </div>
                              <span className={cn('text-[9px] text-center leading-tight', isCurrent ? 'font-semibold' : 'text-muted-foreground')}>
                                {PIPELINE_LABELS[status]}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-medium text-destructive">Invoice Denied</span>
                    </div>
                  )}

                  {/* Quick actions */}
                  {transitions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {transitions.map((action) => (
                        <Button
                          key={action.next}
                          variant={action.variant === 'destructive' ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => handleStatusChange(action.next)}
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                          ) : action.variant === 'destructive' ? (
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          )}
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Details grid */}
                  <div className="border-t border-border pt-4">
                    <h3 className="text-sm font-semibold mb-3">Details</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <DetailRow label="Vendor" value={invoice.vendors?.name} />
                      <DetailRow label="Job" value={invoice.jobs?.name} />
                      <DetailRow label="Invoice Date" value={formatDate(invoice.invoice_date)} />
                      <DetailRow label="Contract Type" value={contractConfig?.label} />
                      <DetailRow label="Cost Code" value={invoice.cost_codes ? `${invoice.cost_codes.code} - ${invoice.cost_codes.name}` : null} />
                      <DetailRow label="PO" value={invoice.purchase_orders?.po_number} />
                      <DetailRow label="Payment Terms" value={invoice.payment_terms} />
                      <DetailRow label="Lien Waiver">
                        <Badge className={getStatusColor(invoice.lien_waiver_status)}>
                          {formatStatus(invoice.lien_waiver_status)}
                        </Badge>
                      </DetailRow>
                    </div>
                  </div>

                  {/* Payment info */}
                  {invoice.status === 'paid' && (
                    <div className="border-t border-border pt-4">
                      <h3 className="text-sm font-semibold mb-3">Payment</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                        <DetailRow label="Paid Date" value={formatDate(invoice.paid_date)} />
                        <DetailRow label="Paid Amount" value={formatCurrency(invoice.paid_amount)} />
                        <DetailRow label="Method" value={invoice.payment_method ? formatStatus(invoice.payment_method) : null} />
                        <DetailRow label="Reference" value={invoice.payment_reference} />
                      </div>
                    </div>
                  )}

                  {/* Payment status badge */}
                  {invoice.payment_status && (
                    <div className="flex items-center gap-2">
                      <PaymentStatusBadge
                        paymentStatus={invoice.payment_status as 'unpaid' | 'partial' | 'paid' | undefined}
                        paidAmount={invoice.paid_amount}
                        totalAmount={invoice.amount}
                      />
                    </div>
                  )}

                  {/* AI info */}
                  {(invoice.ai_notes || invoice.ai_confidence != null) && (
                    <div className="border-t border-border pt-4">
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        AI Processing
                        {invoice.ai_confidence != null && typeof invoice.ai_confidence === 'number' && (
                          <AIConfidenceBadge confidence={invoice.ai_confidence} />
                        )}
                      </h3>
                      {invoice.ai_notes && (
                        <p className="text-sm text-muted-foreground">{invoice.ai_notes}</p>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {(invoice.description || invoice.notes) && (
                    <div className="border-t border-border pt-4">
                      <h3 className="text-sm font-semibold mb-2">Notes</h3>
                      {invoice.description && (
                        <p className="text-sm text-foreground mb-2">{invoice.description}</p>
                      )}
                      {invoice.notes && (
                        <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                      )}
                    </div>
                  )}

                  {/* Activity timeline */}
                  {activities.length > 0 && (
                    <div className="border-t border-border pt-4">
                      <ActivityTimeline activities={activities} maxHeight="12rem" />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailRow({ label, value, children }: { label: string; value?: string | null; children?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      {children ?? <p className="font-medium text-foreground truncate">{value || '--'}</p>}
    </div>
  )
}
