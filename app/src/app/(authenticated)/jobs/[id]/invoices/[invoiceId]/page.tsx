'use client'

import { useMemo, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit3,
  ExternalLink,
  Loader2,
  Sparkles,
  XCircle,
  Plus,
  Minus,
  Save,
  Trash2,
  Check,
  AlertTriangle,
  MessageSquare,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import {
  useInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
  useInvoiceLineItems,
  useCreateLineItem,
  useUpdateLineItem,
  useDeleteLineItem,
  useInvoiceAllocations,
  useSaveAllocations,
  useInvoiceApprovals,
  useApprovalAction,
  useInvoiceDisputes,
  useCreateDispute,
  useResolveDispute,
  usePaymentPrereqs,
  useCreatePaymentPrereq,
  useTogglePrereq,
} from '@/hooks/use-invoices'
import { formatCurrency, formatDate, getStatusColor, formatStatus, cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  INVOICE_STATUS_TRANSITIONS,
  INVOICE_STATUS_CONFIG,
  INVOICE_TYPE_CONFIG,
  CONTRACT_TYPE_CONFIG,
  DISPUTE_REASON_OPTIONS,
} from '@/types/invoice-full'
import type {
  InvoiceStatus,
  Invoice as InvoiceFullType,
  InvoiceLineItem,
  InvoiceAllocation,
  InvoiceApproval,
  InvoiceDispute,
  PaymentPrerequisite,
  DisputeType,
  DisputeReasonCategory,
  ApprovalStatus,
} from '@/types/invoice-full'

// -- Tabs ---------------------------------------------------------------------

type TabId = 'overview' | 'line-items' | 'allocations' | 'approvals' | 'disputes' | 'prerequisites'

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'line-items', label: 'Line Items' },
  { id: 'allocations', label: 'Allocations' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'disputes', label: 'Disputes' },
  { id: 'prerequisites', label: 'Prerequisites' },
]

// -- Pipeline -----------------------------------------------------------------

const STATUS_PIPELINE: InvoiceStatus[] = [
  'draft',
  'pm_pending',
  'approved',
  'in_draw',
  'paid',
]

const PIPELINE_LABELS: Record<string, string> = {
  draft: 'Draft',
  pm_pending: 'PM Review',
  approved: 'Approved',
  in_draw: 'In Draw',
  paid: 'Paid',
}

// -- Helpers ------------------------------------------------------------------

function getDaysUntilDue(dueDate: string | null): { days: number; label: string; className: string } | null {
  if (!dueDate) return null
  const due = new Date(dueDate)
  if (isNaN(due.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < 0) return { days: diff, label: `${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''} overdue`, className: 'text-destructive' }
  if (diff === 0) return { days: 0, label: 'Due today', className: 'text-warning-dark' }
  if (diff <= 7) return { days: diff, label: `Due in ${diff} day${diff !== 1 ? 's' : ''}`, className: 'text-warning-dark' }
  return { days: diff, label: `Due in ${diff} days`, className: 'text-muted-foreground' }
}

const PREREQ_TYPES = [
  { value: 'coi', label: 'Certificate of Insurance' },
  { value: 'lien_waiver', label: 'Lien Waiver' },
  { value: 'w9', label: 'W-9' },
  { value: 'contract', label: 'Contract' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'custom', label: 'Custom' },
] as const

// -- Component ----------------------------------------------------------------

export default function JobInvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string
  const invoiceId = params.invoiceId as string

  // ── Data fetching ────────────────────────────────────────────────
  const { data: response, isLoading, error: fetchError } = useInvoice(invoiceId)
  const updateMutation = useUpdateInvoice(invoiceId)
  const deleteMutation = useDeleteInvoice()

  const invoice = (response as { data: InvoiceFullType } | undefined)?.data ?? null

  // ── Local state ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [error, setError] = useState<string | null>(null)
  const [archiving, setArchiving] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  // ── Derived data ─────────────────────────────────────────────────
  const vendorName = invoice?.vendors?.name ?? null
  const jobName = invoice?.jobs?.name ?? null
  const poNumber = invoice?.purchase_orders?.po_number ?? null
  const costCodeLabel = useMemo(() => {
    if (!invoice?.cost_codes) return null
    return `${invoice.cost_codes.code} - ${invoice.cost_codes.name}`
  }, [invoice?.cost_codes])

  const dueInfo = useMemo(() => getDaysUntilDue(invoice?.due_date ?? null), [invoice?.due_date])

  const currentStatus = (invoice?.status ?? 'draft') as InvoiceStatus
  const transitions = INVOICE_STATUS_TRANSITIONS[currentStatus] ?? []
  const statusConfig = INVOICE_STATUS_CONFIG[currentStatus]
  const typeConfig = invoice ? INVOICE_TYPE_CONFIG[invoice.invoice_type] : null
  const contractConfig = invoice ? CONTRACT_TYPE_CONFIG[invoice.contract_type] : null

  const netAmount = useMemo(() => {
    if (!invoice) return 0
    if (invoice.net_amount != null) return invoice.net_amount
    const retainageAmt = invoice.retainage_amount ?? (invoice.amount * (invoice.retainage_percent ?? 0) / 100)
    return invoice.amount - retainageAmt
  }, [invoice])

  // ── Handlers ─────────────────────────────────────────────────────
  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    setError(null)
    try {
      await updateMutation.mutateAsync({ status: newStatus } as Record<string, unknown>)
      toast.success(`Status changed to ${INVOICE_STATUS_CONFIG[newStatus]?.label ?? formatStatus(newStatus)}`)
    } catch (err) {
      setError((err as Error)?.message || 'Failed to update status')
      toast.error('Failed to update status')
    }
  }

  const handleConfirmArchive = async () => {
    setArchiving(true)
    try {
      await deleteMutation.mutateAsync(invoiceId)
      toast.success('Invoice archived')
      router.push(`/jobs/${jobId}/invoices`)
      router.refresh()
    } catch {
      toast.error('Failed to archive invoice')
      setArchiving(false)
    }
  }

  // ── Loading state ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // ── Error / not found ────────────────────────────────────────────
  if (!invoice) {
    return (
      <div className="max-w-5xl mx-auto">
        <Link href={`/jobs/${jobId}/invoices`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Job Invoices
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">{fetchError?.message || error || 'Invoice not found'}</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href={`/jobs/${jobId}/invoices`}>Return to Invoices</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Pipeline visualization ──────────────────────────────────────
  const currentPipelineIndex = STATUS_PIPELINE.indexOf(currentStatus)
  const isDenied = currentStatus === 'denied'
  const effectivePipelineIndex = currentPipelineIndex >= 0
    ? currentPipelineIndex
    : (currentStatus === 'accountant_pending' || currentStatus === 'owner_pending')
      ? 1
      : -1

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto">
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/invoices`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Job Invoices
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                {invoice.invoice_number || 'Invoice'}
              </h1>
              <Badge className={getStatusColor(currentStatus)}>
                {statusConfig?.label ?? formatStatus(currentStatus)}
              </Badge>
              {typeConfig && (
                <Badge className={typeConfig.color}>
                  {typeConfig.label}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {invoice.invoice_date
                ? `Issued ${formatDate(invoice.invoice_date)}`
                : `Created ${formatDate(invoice.created_at) || 'Unknown'}`}
              {invoice.updated_at && ` · Updated ${formatDate(invoice.updated_at)}`}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button asChild variant="outline">
              <Link href={`/invoices/${invoiceId}`}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
                <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
            </Button>
            <Button
              onClick={() => setShowArchiveDialog(true)}
              disabled={archiving}
              variant="outline"
              className="text-destructive hover:text-destructive"
            >
              {archiving ? 'Archiving...' : 'Archive'}
            </Button>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* ── AMOUNT HERO CARD ──────────────────────────────────── */}
        <Card>
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success-bg">
                  <DollarSign className="h-6 w-6 text-success-dark" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-3xl font-bold tracking-tight">{formatCurrency(invoice.amount)}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                {invoice.retainage_percent > 0 && (
                  <div className="text-center">
                    <p className="text-muted-foreground">Net (after {invoice.retainage_percent}% retainage)</p>
                    <p className="text-xl font-semibold">{formatCurrency(netAmount)}</p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="text-lg font-semibold">{formatDate(invoice.due_date) || '--'}</p>
                  {dueInfo && (
                    <p className={cn('text-xs mt-0.5', dueInfo.className)}>
                      {dueInfo.label}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── APPROVAL PIPELINE ─────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Approval Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            {isDenied ? (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <XCircle className="h-5 w-5 text-destructive shrink-0" />
                <div>
                  <p className="text-sm font-medium text-destructive">Invoice Denied</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    This invoice was denied. You can reopen it as a draft to restart the workflow.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1 overflow-x-auto py-2">
                {STATUS_PIPELINE.map((status, index) => {
                  const isComplete = index < effectivePipelineIndex
                  const isCurrent = index === effectivePipelineIndex
                  return (
                    <div key={status} className="flex items-center">
                      {index > 0 && (
                        <div
                          className={cn(
                            'h-0.5 w-8 sm:w-12 shrink-0',
                            isComplete ? 'bg-emerald-500' : 'bg-border'
                          )}
                        />
                      )}
                      <div className="flex flex-col items-center gap-1.5 shrink-0">
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors',
                            isComplete
                              ? 'bg-emerald-100 text-emerald-700'
                              : isCurrent
                                ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                                : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <span
                          className={cn(
                            'text-[10px] sm:text-xs text-center max-w-[60px] sm:max-w-[80px] leading-tight',
                            isCurrent ? 'font-semibold text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {PIPELINE_LABELS[status] ?? formatStatus(status)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── QUICK ACTION BUTTONS ──────────────────────────────── */}
        {transitions.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {transitions.map((action) => (
              <Button
                key={action.next}
                variant={action.variant === 'destructive' ? 'destructive' : 'default'}
                onClick={() => handleStatusChange(action.next)}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : action.variant === 'destructive' ? (
                  <XCircle className="h-4 w-4 mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {/* ── TABS ──────────────────────────────────────────────── */}
        <div className="border-b">
          <div className="flex gap-0 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── TAB CONTENT ───────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <OverviewTab
            invoice={invoice}
            jobId={jobId}
            jobName={jobName}
            vendorName={vendorName}
            poNumber={poNumber}
            costCodeLabel={costCodeLabel}
            contractConfig={contractConfig}
          />
        )}
        {activeTab === 'line-items' && (
          <LineItemsTab invoiceId={invoiceId} />
        )}
        {activeTab === 'allocations' && (
          <AllocationsTab invoiceId={invoiceId} invoiceAmount={invoice.amount} />
        )}
        {activeTab === 'approvals' && (
          <ApprovalsTab invoiceId={invoiceId} />
        )}
        {activeTab === 'disputes' && (
          <DisputesTab invoiceId={invoiceId} invoiceAmount={invoice.amount} />
        )}
        {activeTab === 'prerequisites' && (
          <PrerequisitesTab invoiceId={invoiceId} />
        )}
      </div>

      {/* Archive confirmation dialog */}
      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive this invoice?"
        description="This invoice will be archived. It can be restored later."
        confirmLabel="Archive"
        onConfirm={handleConfirmArchive}
        loading={archiving}
      />
    </div>
  )
}

// =============================================================================
// OVERVIEW TAB
// =============================================================================

function OverviewTab({
  invoice,
  jobId,
  jobName,
  vendorName,
  poNumber,
  costCodeLabel,
  contractConfig,
}: {
  invoice: InvoiceFullType
  jobId: string
  jobName: string | null
  vendorName: string | null
  poNumber: string | null
  costCodeLabel: string | null
  contractConfig: { label: string; abbrev: string } | null
}) {
  const typeConfig = INVOICE_TYPE_CONFIG[invoice.invoice_type]
  const isProgressType = invoice.invoice_type === 'progress' || invoice.invoice_type === 'final'
  const isPaid = invoice.status === 'paid'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
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
              <Link href={`/jobs/${jobId}`} className="text-foreground hover:underline font-medium">
                {jobName || jobId}
              </Link>
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

      {invoice.ai_notes && (
        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{invoice.ai_notes}</p>
            {invoice.ai_confidence != null && (
              <p className="text-xs text-muted-foreground mt-2">
                Confidence: {Math.round(invoice.ai_confidence * 100)}%
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

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

// =============================================================================
// LINE ITEMS TAB
// =============================================================================

function LineItemsTab({ invoiceId }: { invoiceId: string }) {
  const { data: response, isLoading } = useInvoiceLineItems(invoiceId)
  const createMutation = useCreateLineItem(invoiceId)
  const updateMutation = useUpdateLineItem(invoiceId)
  const deleteMutation = useDeleteLineItem(invoiceId)

  const lineItems = ((response as { data: InvoiceLineItem[] } | undefined)?.data ?? []) as InvoiceLineItem[]

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newItem, setNewItem] = useState({ description: '', quantity: '1', unit: 'EA', unit_price: '', cost_code_label: '' })
  const [editItem, setEditItem] = useState({ description: '', quantity: '', unit: '', unit_price: '', cost_code_label: '' })

  const total = useMemo(() => lineItems.reduce((sum, li) => sum + (li.amount ?? 0), 0), [lineItems])

  const handleAddItem = async () => {
    const qty = parseFloat(newItem.quantity) || 1
    const price = parseFloat(newItem.unit_price) || 0
    try {
      await createMutation.mutateAsync({
        description: newItem.description,
        quantity: qty,
        unit: newItem.unit || 'EA',
        unit_price: price,
        amount: qty * price,
        cost_code_label: newItem.cost_code_label || null,
      })
      toast.success('Line item added')
      setNewItem({ description: '', quantity: '1', unit: 'EA', unit_price: '', cost_code_label: '' })
      setShowAddForm(false)
    } catch {
      toast.error('Failed to add line item')
    }
  }

  const startEdit = (li: InvoiceLineItem) => {
    setEditingId(li.id)
    setEditItem({
      description: li.description,
      quantity: li.quantity.toString(),
      unit: li.unit,
      unit_price: li.unit_price.toString(),
      cost_code_label: li.cost_code_label ?? '',
    })
  }

  const handleUpdateItem = async (id: string) => {
    const qty = parseFloat(editItem.quantity) || 1
    const price = parseFloat(editItem.unit_price) || 0
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          description: editItem.description,
          quantity: qty,
          unit: editItem.unit || 'EA',
          unit_price: price,
          amount: qty * price,
          cost_code_label: editItem.cost_code_label || null,
        },
      })
      toast.success('Line item updated')
      setEditingId(null)
    } catch {
      toast.error('Failed to update line item')
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Line item deleted')
    } catch {
      toast.error('Failed to delete line item')
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{lineItems.length} line item{lineItems.length !== 1 ? 's' : ''}</h3>
        <Button size="sm" variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? <Minus className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showAddForm ? 'Cancel' : 'Add Line Item'}
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <Input value={newItem.description} onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))} placeholder="Description" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Qty</label>
                <Input type="number" value={newItem.quantity} onChange={(e) => setNewItem((p) => ({ ...p, quantity: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Unit</label>
                <Input value={newItem.unit} onChange={(e) => setNewItem((p) => ({ ...p, unit: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Unit Price</label>
                <Input type="number" step="0.01" value={newItem.unit_price} onChange={(e) => setNewItem((p) => ({ ...p, unit_price: e.target.value }))} placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Cost Code</label>
                <Input value={newItem.cost_code_label} onChange={(e) => setNewItem((p) => ({ ...p, cost_code_label: e.target.value }))} placeholder="Optional" />
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <Button size="sm" onClick={handleAddItem} disabled={!newItem.description || createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Description</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-20">Qty</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-20">Unit</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-28">Unit Price</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-28">Amount</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-28">Cost Code</th>
                  <th className="px-4 py-2.5 w-20" />
                </tr>
              </thead>
              <tbody>
                {lineItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">No line items yet</td>
                  </tr>
                ) : (
                  lineItems.map((li) => (
                    editingId === li.id ? (
                      <tr key={li.id} className="border-b bg-muted/20">
                        <td className="px-4 py-2"><Input value={editItem.description} onChange={(e) => setEditItem((p) => ({ ...p, description: e.target.value }))} className="h-8" /></td>
                        <td className="px-4 py-2"><Input type="number" value={editItem.quantity} onChange={(e) => setEditItem((p) => ({ ...p, quantity: e.target.value }))} className="h-8 text-right" /></td>
                        <td className="px-4 py-2"><Input value={editItem.unit} onChange={(e) => setEditItem((p) => ({ ...p, unit: e.target.value }))} className="h-8" /></td>
                        <td className="px-4 py-2"><Input type="number" step="0.01" value={editItem.unit_price} onChange={(e) => setEditItem((p) => ({ ...p, unit_price: e.target.value }))} className="h-8 text-right" /></td>
                        <td className="px-4 py-2 text-right font-medium">{formatCurrency((parseFloat(editItem.quantity) || 0) * (parseFloat(editItem.unit_price) || 0))}</td>
                        <td className="px-4 py-2"><Input value={editItem.cost_code_label} onChange={(e) => setEditItem((p) => ({ ...p, cost_code_label: e.target.value }))} className="h-8" /></td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleUpdateItem(li.id)} disabled={updateMutation.isPending}>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingId(null)}>
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={li.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-2.5">{li.description}</td>
                        <td className="px-4 py-2.5 text-right">{li.quantity}</td>
                        <td className="px-4 py-2.5">{li.unit}</td>
                        <td className="px-4 py-2.5 text-right">{formatCurrency(li.unit_price)}</td>
                        <td className="px-4 py-2.5 text-right font-medium">{formatCurrency(li.amount)}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{li.cost_codes ? `${li.cost_codes.code}` : li.cost_code_label || '--'}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEdit(li)}>
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDeleteItem(li.id)} disabled={deleteMutation.isPending}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  ))
                )}
              </tbody>
              {lineItems.length > 0 && (
                <tfoot>
                  <tr className="bg-muted/50 font-medium">
                    <td className="px-4 py-2.5" colSpan={4}>Total</td>
                    <td className="px-4 py-2.5 text-right">{formatCurrency(total)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// ALLOCATIONS TAB
// =============================================================================

function AllocationsTab({ invoiceId, invoiceAmount }: { invoiceId: string; invoiceAmount: number }) {
  const { data: response, isLoading } = useInvoiceAllocations(invoiceId)
  const saveMutation = useSaveAllocations(invoiceId)

  const allocations = ((response as { data: InvoiceAllocation[] } | undefined)?.data ?? []) as InvoiceAllocation[]

  const allocatedTotal = useMemo(() => allocations.reduce((s, a) => s + a.amount, 0), [allocations])
  const difference = invoiceAmount - allocatedTotal

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">{allocations.length} allocation{allocations.length !== 1 ? 's' : ''}</h3>
          {Math.abs(difference) > 0.01 && (
            <Badge className="bg-warning-bg text-warning-dark">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {difference > 0 ? `${formatCurrency(difference)} unallocated` : `${formatCurrency(Math.abs(difference))} over-allocated`}
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Job</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Cost Code</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-24">Phase</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-28">Amount</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-20">%</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">PO</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody>
                {allocations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">No allocations yet</td>
                  </tr>
                ) : (
                  allocations.map((a) => (
                    <tr key={a.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-2.5">{a.jobs?.name || a.job_id || '--'}</td>
                      <td className="px-4 py-2.5">{a.cost_codes ? `${a.cost_codes.code} - ${a.cost_codes.name}` : a.cost_code_id || '--'}</td>
                      <td className="px-4 py-2.5">{a.phase || '--'}</td>
                      <td className="px-4 py-2.5 text-right font-medium">{formatCurrency(a.amount)}</td>
                      <td className="px-4 py-2.5 text-right">{a.percent != null ? `${a.percent}%` : '--'}</td>
                      <td className="px-4 py-2.5">{a.purchase_orders?.po_number || a.po_id || '--'}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{a.description || '--'}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {allocations.length > 0 && (
                <tfoot>
                  <tr className="bg-muted/50 font-medium">
                    <td className="px-4 py-2.5" colSpan={3}>Total</td>
                    <td className="px-4 py-2.5 text-right">{formatCurrency(allocatedTotal)}</td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// APPROVALS TAB
// =============================================================================

function ApprovalsTab({ invoiceId }: { invoiceId: string }) {
  const { data: response, isLoading } = useInvoiceApprovals(invoiceId)
  const approvals = ((response as { data: InvoiceApproval[] } | undefined)?.data ?? []) as InvoiceApproval[]

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    delegated: 'bg-blue-100 text-blue-700',
    skipped: 'bg-stone-100 text-stone-600',
    escalated: 'bg-amber-100 text-amber-700',
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">{approvals.length} approval step{approvals.length !== 1 ? 's' : ''}</h3>

      {approvals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No approval steps configured for this invoice.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {approvals.map((approval) => (
            <Card key={approval.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{approval.step_name}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded font-medium', statusColors[approval.status] || 'bg-stone-100 text-stone-600')}>
                        {formatStatus(approval.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {approval.required_role && `Role: ${approval.required_role}`}
                      {approval.assigned_user?.name && ` · Assigned: ${approval.assigned_user.name}`}
                    </p>
                    {approval.action_notes && (
                      <p className="text-sm text-muted-foreground mt-1">{approval.action_notes}</p>
                    )}
                  </div>
                  {approval.action_at && (
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{formatDate(approval.action_at)}</p>
                      {approval.action_user?.name && <p>{approval.action_user.name}</p>}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// DISPUTES TAB
// =============================================================================

function DisputesTab({ invoiceId, invoiceAmount }: { invoiceId: string; invoiceAmount: number }) {
  const { data: response, isLoading } = useInvoiceDisputes(invoiceId)
  const createMutation = useCreateDispute(invoiceId)

  const disputes = ((response as { data: InvoiceDispute[] } | undefined)?.data ?? []) as InvoiceDispute[]

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    dispute_type: 'partial' as DisputeType,
    disputed_amount: '',
    reason_category: 'incorrect_amount' as DisputeReasonCategory,
    reason_description: '',
  })

  const handleCreateDispute = async () => {
    try {
      await createMutation.mutateAsync({
        dispute_type: formData.dispute_type,
        disputed_amount: parseFloat(formData.disputed_amount) || 0,
        reason_category: formData.reason_category,
        reason_description: formData.reason_description,
      })
      toast.success('Dispute created')
      setShowForm(false)
      setFormData({ dispute_type: 'partial', disputed_amount: '', reason_category: 'incorrect_amount', reason_description: '' })
    } catch {
      toast.error('Failed to create dispute')
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  const disputeStatusColors: Record<string, string> = {
    open: 'bg-amber-100 text-amber-700',
    in_review: 'bg-blue-100 text-blue-700',
    resolved_adjusted: 'bg-emerald-100 text-emerald-700',
    resolved_voided: 'bg-stone-100 text-stone-600',
    resolved_credit_memo: 'bg-emerald-100 text-emerald-700',
    resolved_as_is: 'bg-stone-100 text-stone-600',
    escalated: 'bg-red-100 text-red-700',
    closed: 'bg-stone-100 text-stone-600',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{disputes.length} dispute{disputes.length !== 1 ? 's' : ''}</h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          {showForm ? <Minus className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showForm ? 'Cancel' : 'New Dispute'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Type</label>
                <select
                  value={formData.dispute_type}
                  onChange={(e) => setFormData((p) => ({ ...p, dispute_type: e.target.value as DisputeType }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="partial">Partial</option>
                  <option value="full">Full</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Disputed Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.disputed_amount}
                  onChange={(e) => setFormData((p) => ({ ...p, disputed_amount: e.target.value }))}
                  placeholder={invoiceAmount.toFixed(2)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Reason</label>
              <select
                value={formData.reason_category}
                onChange={(e) => setFormData((p) => ({ ...p, reason_category: e.target.value as DisputeReasonCategory }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                {DISPUTE_REASON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <textarea
                value={formData.reason_description}
                onChange={(e) => setFormData((p) => ({ ...p, reason_description: e.target.value }))}
                rows={2}
                placeholder="Describe the dispute..."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleCreateDispute} disabled={!formData.reason_description || createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                Create Dispute
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {disputes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No disputes on this invoice.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium capitalize">{d.dispute_type} dispute</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded font-medium', disputeStatusColors[d.status] || 'bg-stone-100 text-stone-600')}>
                        {formatStatus(d.status)}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">{formatStatus(d.reason_category)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{d.reason_description}</p>
                    {d.resolution_notes && (
                      <p className="text-sm text-muted-foreground mt-1 italic">Resolution: {d.resolution_notes}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold font-mono">{formatCurrency(d.disputed_amount)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(d.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// PREREQUISITES TAB
// =============================================================================

function PrerequisitesTab({ invoiceId }: { invoiceId: string }) {
  const { data: response, isLoading } = usePaymentPrereqs(invoiceId)
  const createMutation = useCreatePaymentPrereq(invoiceId)

  const prereqs = ((response as { data: PaymentPrerequisite[] } | undefined)?.data ?? []) as PaymentPrerequisite[]

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ prerequisite_type: 'coi', label: '', notes: '' })

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        prerequisite_type: formData.prerequisite_type,
        label: formData.label || PREREQ_TYPES.find((t) => t.value === formData.prerequisite_type)?.label || formData.prerequisite_type,
        notes: formData.notes || null,
      })
      toast.success('Prerequisite added')
      setShowForm(false)
      setFormData({ prerequisite_type: 'coi', label: '', notes: '' })
    } catch {
      toast.error('Failed to add prerequisite')
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  const metCount = prereqs.filter((p) => p.is_met).length
  const totalCount = prereqs.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {totalCount} prerequisite{totalCount !== 1 ? 's' : ''}
            {totalCount > 0 && ` · ${metCount}/${totalCount} met`}
          </h3>
          {totalCount > 0 && metCount === totalCount && (
            <Badge className="bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              All Met
            </Badge>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          {showForm ? <Minus className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showForm ? 'Cancel' : 'Add Prerequisite'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Type</label>
                <select
                  value={formData.prerequisite_type}
                  onChange={(e) => setFormData((p) => ({ ...p, prerequisite_type: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  {PREREQ_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Label (optional)</label>
                <Input value={formData.label} onChange={(e) => setFormData((p) => ({ ...p, label: e.target.value }))} placeholder="Custom label" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Notes</label>
              <Input value={formData.notes} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} placeholder="Optional notes" />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {prereqs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No payment prerequisites configured.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {prereqs.map((p) => (
            <PrereqRow key={p.id} prereq={p} invoiceId={invoiceId} />
          ))}
        </div>
      )}
    </div>
  )
}

function PrereqRow({ prereq, invoiceId }: { prereq: PaymentPrerequisite; invoiceId: string }) {
  const toggleMutation = useTogglePrereq(invoiceId, prereq.id)

  const handleToggle = async () => {
    try {
      await toggleMutation.mutateAsync(!prereq.is_met)
      toast.success(prereq.is_met ? 'Marked as not met' : 'Marked as met')
    } catch {
      toast.error('Failed to update')
    }
  }

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggle}
            disabled={toggleMutation.isPending}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors shrink-0',
              prereq.is_met
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-border text-transparent hover:border-foreground/30'
            )}
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className={cn('text-sm font-medium', prereq.is_met && 'line-through text-muted-foreground')}>
              {prereq.label}
            </p>
            {prereq.notes && (
              <p className="text-xs text-muted-foreground mt-0.5">{prereq.notes}</p>
            )}
          </div>
          <div className="text-xs text-muted-foreground shrink-0">
            {prereq.is_met && prereq.met_at ? `Met ${formatDate(prereq.met_at)}` : formatStatus(prereq.prerequisite_type)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
