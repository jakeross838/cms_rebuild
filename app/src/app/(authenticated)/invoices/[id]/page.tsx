'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  Edit3,
  FileText,
  Loader2,
  MessageSquare,
  Minus,
  Plus,
  Save,
  Sparkles,
  Trash2,
  XCircle,
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
  useDisputeComms,
  useAddDisputeComm,
  usePaymentPrereqs,
  useCreatePaymentPrereq,
  useTogglePrereq,
} from '@/hooks/use-invoices'
import { useJobs } from '@/hooks/use-jobs'
import { useVendors } from '@/hooks/use-vendors'
import { usePurchaseOrders } from '@/hooks/use-purchase-orders'
import { useCostCodes } from '@/hooks/use-cost-codes'
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
  InvoiceType,
  ContractType,
  LienWaiverStatus,
  Invoice as InvoiceFullType,
  InvoiceLineItem,
  InvoiceAllocation,
  InvoiceApproval,
  InvoiceDispute,
  DisputeCommunication,
  PaymentPrerequisite,
  DisputeType,
  DisputeReasonCategory,
  ApprovalStatus,
} from '@/types/invoice-full'

// -- Types --------------------------------------------------------------------

interface ListItem {
  id: string
  name: string
  [key: string]: unknown
}

interface CostCodeItem {
  id: string
  code: string
  name: string
  [key: string]: unknown
}

interface PoItem {
  id: string
  po_number: string
  title?: string
  [key: string]: unknown
}

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

const ALL_STATUSES: InvoiceStatus[] = [
  'draft', 'pm_pending', 'accountant_pending', 'owner_pending',
  'approved', 'in_draw', 'paid', 'denied',
]

const ALL_INVOICE_TYPES: InvoiceType[] = ['standard', 'progress', 'final', 'credit_memo', 'retainage_release']
const ALL_CONTRACT_TYPES: ContractType[] = ['lump_sum', 'time_materials', 'unit_price', 'cost_plus']
const ALL_LIEN_WAIVER_STATUSES: LienWaiverStatus[] = ['not_required', 'required', 'pending', 'received']

const PREREQ_TYPES = [
  { value: 'coi', label: 'Certificate of Insurance' },
  { value: 'lien_waiver', label: 'Lien Waiver' },
  { value: 'w9', label: 'W-9' },
  { value: 'contract', label: 'Contract' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'custom', label: 'Custom' },
] as const

// -- Component ----------------------------------------------------------------

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string

  // ── Data fetching ────────────────────────────────────────────────
  const { data: response, isLoading, error: fetchError } = useInvoice(invoiceId)
  const updateMutation = useUpdateInvoice(invoiceId)
  const deleteMutation = useDeleteInvoice()
  const { data: jobsResponse } = useJobs()
  const { data: vendorsResponse } = useVendors()
  const { data: posResponse } = usePurchaseOrders()
  const { data: costCodesResponse } = useCostCodes()

  const invoice = (response as { data: InvoiceFullType } | undefined)?.data ?? null
  const jobs = ((jobsResponse as { data: ListItem[] } | undefined)?.data ?? []) as ListItem[]
  const vendors = ((vendorsResponse as { data: ListItem[] } | undefined)?.data ?? []) as ListItem[]
  const purchaseOrders = ((posResponse as { data: PoItem[] } | undefined)?.data ?? []) as PoItem[]
  const costCodes = ((costCodesResponse as { data: CostCodeItem[] } | undefined)?.data ?? []) as CostCodeItem[]

  // ── Local state ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [archiving, setArchiving] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    invoice_number: '',
    amount: '',
    tax_amount: '',
    retainage_percent: '',
    status: 'draft' as InvoiceStatus,
    invoice_type: 'standard' as InvoiceType,
    contract_type: 'lump_sum' as ContractType,
    invoice_date: '',
    due_date: '',
    job_id: '',
    vendor_id: '',
    po_id: '',
    cost_code_id: '',
    payment_terms: '',
    lien_waiver_status: 'not_required' as LienWaiverStatus,
    description: '',
    notes: '',
    billing_period_start: '',
    billing_period_end: '',
    percent_complete: '',
  })

  // ── Derived data ─────────────────────────────────────────────────
  const jobName = useMemo(() => {
    if (!invoice?.job_id) return null
    return invoice.jobs?.name ?? jobs.find((j) => j.id === invoice.job_id)?.name ?? null
  }, [invoice?.job_id, invoice?.jobs, jobs])

  const vendorName = useMemo(() => {
    if (!invoice?.vendor_id) return null
    return invoice.vendors?.name ?? vendors.find((v) => v.id === invoice.vendor_id)?.name ?? null
  }, [invoice?.vendor_id, invoice?.vendors, vendors])

  const poNumber = useMemo(() => {
    if (!invoice?.po_id) return null
    return invoice.purchase_orders?.po_number ?? purchaseOrders.find((p) => p.id === invoice.po_id)?.po_number ?? null
  }, [invoice?.po_id, invoice?.purchase_orders, purchaseOrders])

  const costCodeLabel = useMemo(() => {
    if (!invoice?.cost_code_id) return null
    if (invoice.cost_codes) return `${invoice.cost_codes.code} - ${invoice.cost_codes.name}`
    const cc = costCodes.find((c) => c.id === invoice.cost_code_id)
    return cc ? `${cc.code} - ${cc.name}` : null
  }, [invoice?.cost_code_id, invoice?.cost_codes, costCodes])

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

  // ── Sync form data from hook response ────────────────────────────
  useEffect(() => {
    if (invoice) {
      setFormData({
        invoice_number: invoice.invoice_number ?? '',
        amount: invoice.amount?.toString() ?? '',
        tax_amount: invoice.tax_amount?.toString() ?? '',
        retainage_percent: invoice.retainage_percent?.toString() ?? '',
        status: invoice.status ?? 'draft',
        invoice_type: invoice.invoice_type ?? 'standard',
        contract_type: invoice.contract_type ?? 'lump_sum',
        invoice_date: invoice.invoice_date ?? '',
        due_date: invoice.due_date ?? '',
        job_id: invoice.job_id ?? '',
        vendor_id: invoice.vendor_id ?? '',
        po_id: invoice.po_id ?? '',
        cost_code_id: invoice.cost_code_id ?? '',
        payment_terms: invoice.payment_terms ?? '',
        lien_waiver_status: invoice.lien_waiver_status ?? 'not_required',
        description: invoice.description ?? '',
        notes: invoice.notes ?? '',
        billing_period_start: invoice.billing_period_start ?? '',
        billing_period_end: invoice.billing_period_end ?? '',
        percent_complete: invoice.percent_complete?.toString() ?? '',
      })
    }
  }, [invoice])

  // ── Handlers ─────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      await updateMutation.mutateAsync({
        invoice_number: formData.invoice_number || null,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        tax_amount: formData.tax_amount ? parseFloat(formData.tax_amount) : undefined,
        retainage_percent: formData.retainage_percent ? parseFloat(formData.retainage_percent) : undefined,
        status: formData.status || null,
        invoice_type: formData.invoice_type || undefined,
        contract_type: formData.contract_type || undefined,
        invoice_date: formData.invoice_date || null,
        due_date: formData.due_date || null,
        job_id: formData.job_id || null,
        vendor_id: formData.vendor_id || null,
        po_id: formData.po_id || null,
        cost_code_id: formData.cost_code_id || null,
        payment_terms: formData.payment_terms || null,
        lien_waiver_status: formData.lien_waiver_status || undefined,
        description: formData.description || null,
        notes: formData.notes || null,
        billing_period_start: formData.billing_period_start || null,
        billing_period_end: formData.billing_period_end || null,
        percent_complete: formData.percent_complete ? parseFloat(formData.percent_complete) : null,
      } as Record<string, unknown>)

      toast.success('Invoice updated')
      setEditing(false)
    } catch (err) {
      setError((err as Error)?.message || 'Failed to save')
      toast.error('Failed to save invoice')
    } finally {
      setSaving(false)
    }
  }

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
      router.push('/invoices')
      router.refresh()
    } catch (err) {
      setError((err as Error)?.message || 'Failed to archive')
      toast.error('Failed to archive invoice')
      setArchiving(false)
    }
  }

  const resetForm = () => {
    setEditing(false)
    setError(null)
    if (invoice) {
      setFormData({
        invoice_number: invoice.invoice_number ?? '',
        amount: invoice.amount?.toString() ?? '',
        tax_amount: invoice.tax_amount?.toString() ?? '',
        retainage_percent: invoice.retainage_percent?.toString() ?? '',
        status: invoice.status ?? 'draft',
        invoice_type: invoice.invoice_type ?? 'standard',
        contract_type: invoice.contract_type ?? 'lump_sum',
        invoice_date: invoice.invoice_date ?? '',
        due_date: invoice.due_date ?? '',
        job_id: invoice.job_id ?? '',
        vendor_id: invoice.vendor_id ?? '',
        po_id: invoice.po_id ?? '',
        cost_code_id: invoice.cost_code_id ?? '',
        payment_terms: invoice.payment_terms ?? '',
        lien_waiver_status: invoice.lien_waiver_status ?? 'not_required',
        description: invoice.description ?? '',
        notes: invoice.notes ?? '',
        billing_period_start: invoice.billing_period_start ?? '',
        billing_period_end: invoice.billing_period_end ?? '',
        percent_complete: invoice.percent_complete?.toString() ?? '',
      })
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
        <Link href="/invoices" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Invoices
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">{fetchError?.message || error || 'Invoice not found'}</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/invoices">Return to Invoices</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Pipeline visualization ──────────────────────────────────────
  const currentPipelineIndex = STATUS_PIPELINE.indexOf(currentStatus)
  const isDenied = currentStatus === 'denied'
  // If the status is one of the *_pending ones not in the pipeline, map it near pm_pending
  const effectivePipelineIndex = currentPipelineIndex >= 0
    ? currentPipelineIndex
    : (currentStatus === 'accountant_pending' || currentStatus === 'owner_pending')
      ? 1 // treat as review phase
      : -1

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto">
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="mb-6">
        <Link href="/invoices" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Invoices
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
            {!editing ? (
              <>
                <Button onClick={() => setEditing(true)} variant="outline">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={() => setShowArchiveDialog(true)}
                  disabled={archiving}
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                >
                  {archiving ? 'Archiving...' : 'Archive'}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={resetForm} variant="outline">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      {/* ── EDIT MODE ────────────────────────────────────────────── */}
      {editing ? (
        <EditForm
          formData={formData}
          handleChange={handleChange}
          jobs={jobs}
          vendors={vendors}
          purchaseOrders={purchaseOrders}
          costCodes={costCodes}
        />
      ) : (
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
      )}

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
// EDIT FORM
// =============================================================================

function EditForm({
  formData,
  handleChange,
  jobs,
  vendors,
  purchaseOrders,
  costCodes,
}: {
  formData: Record<string, string>
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  jobs: ListItem[]
  vendors: ListItem[]
  purchaseOrders: PoItem[]
  costCodes: CostCodeItem[]
}) {
  const showBillingPeriod = formData.invoice_type === 'progress' || formData.invoice_type === 'final'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invoice Information</CardTitle>
          <CardDescription>Update invoice details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="invoice_number" className="text-sm font-medium">Invoice Number</label>
              <Input id="invoice_number" name="invoice_number" value={formData.invoice_number} onChange={handleChange} placeholder="INV-001" />
            </div>
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">Amount</label>
              <Input id="amount" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} placeholder="0.00" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="tax_amount" className="text-sm font-medium">Tax Amount</label>
              <Input id="tax_amount" name="tax_amount" type="number" step="0.01" value={formData.tax_amount} onChange={handleChange} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <label htmlFor="retainage_percent" className="text-sm font-medium">Retainage %</label>
              <Input id="retainage_percent" name="retainage_percent" type="number" step="0.01" value={formData.retainage_percent} onChange={handleChange} placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="invoice_type" className="text-sm font-medium">Invoice Type</label>
              <select id="invoice_type" name="invoice_type" value={formData.invoice_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                {ALL_INVOICE_TYPES.map((t) => (
                  <option key={t} value={t}>{INVOICE_TYPE_CONFIG[t].label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="contract_type" className="text-sm font-medium">Contract Type</label>
              <select id="contract_type" name="contract_type" value={formData.contract_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                {ALL_CONTRACT_TYPES.map((t) => (
                  <option key={t} value={t}>{CONTRACT_TYPE_CONFIG[t].label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="invoice_date" className="text-sm font-medium">Invoice Date</label>
              <Input id="invoice_date" name="invoice_date" type="date" value={formData.invoice_date} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label htmlFor="due_date" className="text-sm font-medium">Due Date</label>
              <Input id="due_date" name="due_date" type="date" value={formData.due_date} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">Status</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{INVOICE_STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assignment</CardTitle>
          <CardDescription>Link this invoice to a job, vendor, PO, and cost code</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="vendor_id" className="text-sm font-medium">Vendor</label>
              <select id="vendor_id" name="vendor_id" value={formData.vendor_id} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">No vendor assigned</option>
                {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="job_id" className="text-sm font-medium">Job</label>
              <select id="job_id" name="job_id" value={formData.job_id} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">No job assigned</option>
                {jobs.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="po_id" className="text-sm font-medium">Purchase Order</label>
              <select id="po_id" name="po_id" value={formData.po_id} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">No PO assigned</option>
                {purchaseOrders.map((p) => <option key={p.id} value={p.id}>{p.po_number}{p.title ? ` — ${p.title}` : ''}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="cost_code_id" className="text-sm font-medium">Cost Code</label>
              <select id="cost_code_id" name="cost_code_id" value={formData.cost_code_id} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">No cost code</option>
                {costCodes.map((c) => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="payment_terms" className="text-sm font-medium">Payment Terms</label>
              <Input id="payment_terms" name="payment_terms" value={formData.payment_terms} onChange={handleChange} placeholder="Net 30" />
            </div>
            <div className="space-y-2">
              <label htmlFor="lien_waiver_status" className="text-sm font-medium">Lien Waiver Status</label>
              <select id="lien_waiver_status" name="lien_waiver_status" value={formData.lien_waiver_status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                {ALL_LIEN_WAIVER_STATUSES.map((s) => (
                  <option key={s} value={s}>{formatStatus(s)}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {showBillingPeriod && (
        <Card>
          <CardHeader>
            <CardTitle>Progress Billing</CardTitle>
            <CardDescription>Billing period and progress details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="billing_period_start" className="text-sm font-medium">Billing Period Start</label>
                <Input id="billing_period_start" name="billing_period_start" type="date" value={formData.billing_period_start} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="billing_period_end" className="text-sm font-medium">Billing Period End</label>
                <Input id="billing_period_end" name="billing_period_end" type="date" value={formData.billing_period_end} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="percent_complete" className="text-sm font-medium">Percent Complete</label>
              <Input id="percent_complete" name="percent_complete" type="number" step="0.1" min="0" max="100" value={formData.percent_complete} onChange={handleChange} placeholder="0" />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Description & Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              placeholder="Invoice description..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Internal notes..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// OVERVIEW TAB
// =============================================================================

function OverviewTab({
  invoice,
  jobName,
  vendorName,
  poNumber,
  costCodeLabel,
  contractConfig,
}: {
  invoice: InvoiceFullType
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
      {/* Invoice Details Card */}
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

      {/* AI Insights Card */}
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
  const [newItem, setNewItem] = useState({
    description: '',
    quantity: '1',
    unit: 'EA',
    unit_price: '',
    cost_code_label: '',
  })
  const [editItem, setEditItem] = useState({
    description: '',
    quantity: '',
    unit: '',
    unit_price: '',
    cost_code_label: '',
  })

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

      {/* Add line item form */}
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

      {/* Table */}
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

  const [editMode, setEditMode] = useState(false)
  const [editRows, setEditRows] = useState<{
    id?: string
    job_id: string
    cost_code_id: string
    phase: string
    amount: string
    percent: string
    po_id: string
    description: string
  }[]>([])

  const allocatedTotal = useMemo(
    () => (editMode ? editRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0) : allocations.reduce((s, a) => s + a.amount, 0)),
    [editMode, editRows, allocations]
  )
  const difference = invoiceAmount - allocatedTotal

  useEffect(() => {
    if (allocations.length > 0 && editRows.length === 0) {
      setEditRows(
        allocations.map((a) => ({
          id: a.id,
          job_id: a.job_id ?? '',
          cost_code_id: a.cost_code_id ?? '',
          phase: a.phase ?? '',
          amount: a.amount.toString(),
          percent: a.percent?.toString() ?? '',
          po_id: a.po_id ?? '',
          description: a.description ?? '',
        }))
      )
    }
  }, [allocations, editRows.length])

  const startEdit = () => {
    setEditRows(
      allocations.length > 0
        ? allocations.map((a) => ({
            id: a.id,
            job_id: a.job_id ?? '',
            cost_code_id: a.cost_code_id ?? '',
            phase: a.phase ?? '',
            amount: a.amount.toString(),
            percent: a.percent?.toString() ?? '',
            po_id: a.po_id ?? '',
            description: a.description ?? '',
          }))
        : [{ job_id: '', cost_code_id: '', phase: '', amount: invoiceAmount.toString(), percent: '100', po_id: '', description: '' }]
    )
    setEditMode(true)
  }

  const addRow = () => {
    setEditRows((prev) => [...prev, { job_id: '', cost_code_id: '', phase: '', amount: '', percent: '', po_id: '', description: '' }])
  }

  const removeRow = (idx: number) => {
    setEditRows((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateRow = (idx: number, field: string, value: string) => {
    setEditRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)))
  }

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(
        editRows.map((r, i) => ({
          id: r.id,
          job_id: r.job_id || null,
          cost_code_id: r.cost_code_id || null,
          phase: r.phase || null,
          amount: parseFloat(r.amount) || 0,
          percent: r.percent ? parseFloat(r.percent) : null,
          po_id: r.po_id || null,
          description: r.description || null,
          sort_order: i,
        }))
      )
      toast.success('Allocations saved')
      setEditMode(false)
    } catch {
      toast.error('Failed to save allocations')
    }
  }

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
        {!editMode ? (
          <Button size="sm" variant="outline" onClick={startEdit}>
            <Edit3 className="h-4 w-4 mr-1" />Edit Allocations
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Save
            </Button>
          </div>
        )}
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
                  {editMode && <th className="px-4 py-2.5 w-12" />}
                </tr>
              </thead>
              <tbody>
                {editMode ? (
                  editRows.map((row, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-4 py-2"><Input value={row.job_id} onChange={(e) => updateRow(idx, 'job_id', e.target.value)} className="h-8" placeholder="Job ID" /></td>
                      <td className="px-4 py-2"><Input value={row.cost_code_id} onChange={(e) => updateRow(idx, 'cost_code_id', e.target.value)} className="h-8" placeholder="Cost Code ID" /></td>
                      <td className="px-4 py-2"><Input value={row.phase} onChange={(e) => updateRow(idx, 'phase', e.target.value)} className="h-8" /></td>
                      <td className="px-4 py-2"><Input type="number" step="0.01" value={row.amount} onChange={(e) => updateRow(idx, 'amount', e.target.value)} className="h-8 text-right" /></td>
                      <td className="px-4 py-2"><Input type="number" step="0.01" value={row.percent} onChange={(e) => updateRow(idx, 'percent', e.target.value)} className="h-8 text-right" /></td>
                      <td className="px-4 py-2"><Input value={row.po_id} onChange={(e) => updateRow(idx, 'po_id', e.target.value)} className="h-8" placeholder="PO ID" /></td>
                      <td className="px-4 py-2"><Input value={row.description} onChange={(e) => updateRow(idx, 'description', e.target.value)} className="h-8" /></td>
                      <td className="px-4 py-2">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => removeRow(idx)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : allocations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">No allocations yet</td>
                  </tr>
                ) : (
                  allocations.map((a) => (
                    <tr key={a.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-2.5">{a.jobs?.name ?? a.job_id ?? '--'}</td>
                      <td className="px-4 py-2.5">{a.cost_codes ? `${a.cost_codes.code} - ${a.cost_codes.name}` : a.cost_code_id ?? '--'}</td>
                      <td className="px-4 py-2.5">{a.phase ?? '--'}</td>
                      <td className="px-4 py-2.5 text-right font-medium">{formatCurrency(a.amount)}</td>
                      <td className="px-4 py-2.5 text-right">{a.percent != null ? `${a.percent}%` : '--'}</td>
                      <td className="px-4 py-2.5">{a.purchase_orders?.po_number ?? a.po_id ?? '--'}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{a.description ?? '--'}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {((editMode && editRows.length > 0) || (!editMode && allocations.length > 0)) && (
                <tfoot>
                  <tr className="bg-muted/50 font-medium">
                    <td className="px-4 py-2.5" colSpan={3}>Total</td>
                    <td className="px-4 py-2.5 text-right">{formatCurrency(allocatedTotal)}</td>
                    <td colSpan={editMode ? 4 : 3} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      {editMode && (
        <Button size="sm" variant="outline" onClick={addRow}>
          <Plus className="h-4 w-4 mr-1" />Add Row
        </Button>
      )}
    </div>
  )
}

// =============================================================================
// APPROVALS TAB
// =============================================================================

function ApprovalsTab({ invoiceId }: { invoiceId: string }) {
  const { data: response, isLoading } = useInvoiceApprovals(invoiceId)
  const approvals = ((response as { data: InvoiceApproval[] } | undefined)?.data ?? []) as InvoiceApproval[]

  const [activeApprovalId, setActiveApprovalId] = useState<string | null>(null)
  const [actionNotes, setActionNotes] = useState('')

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  const sortedApprovals = [...approvals].sort((a, b) => a.step_order - b.step_order)

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">{approvals.length} approval step{approvals.length !== 1 ? 's' : ''}</h3>

      {sortedApprovals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No approval steps configured for this invoice.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedApprovals.map((approval) => (
            <ApprovalStepCard
              key={approval.id}
              approval={approval}
              invoiceId={invoiceId}
              isExpanded={activeApprovalId === approval.id}
              onToggle={() => setActiveApprovalId(activeApprovalId === approval.id ? null : approval.id)}
              actionNotes={activeApprovalId === approval.id ? actionNotes : ''}
              setActionNotes={setActionNotes}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ApprovalStepCard({
  approval,
  invoiceId,
  isExpanded,
  onToggle,
  actionNotes,
  setActionNotes,
}: {
  approval: InvoiceApproval
  invoiceId: string
  isExpanded: boolean
  onToggle: () => void
  actionNotes: string
  setActionNotes: (v: string) => void
}) {
  const actionMutation = useApprovalAction(invoiceId, approval.id)
  const isPending = approval.status === 'pending'

  const statusIcon = (() => {
    switch (approval.status) {
      case 'approved': return <CheckCircle2 className="h-5 w-5 text-emerald-600" />
      case 'rejected': return <XCircle className="h-5 w-5 text-destructive" />
      case 'pending': return <Clock className="h-5 w-5 text-amber-500" />
      case 'delegated': return <ChevronRight className="h-5 w-5 text-blue-500" />
      case 'skipped': return <Minus className="h-5 w-5 text-muted-foreground" />
      case 'escalated': return <AlertTriangle className="h-5 w-5 text-destructive" />
      default: return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  })()

  const handleAction = async (action: 'approved' | 'rejected') => {
    try {
      await actionMutation.mutateAsync({ action, notes: actionNotes || null })
      toast.success(`Step ${action === 'approved' ? 'approved' : 'rejected'}`)
      setActionNotes('')
    } catch {
      toast.error(`Failed to ${action === 'approved' ? 'approve' : 'reject'}`)
    }
  }

  return (
    <Card className={cn(isPending && 'border-amber-200')}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onToggle}>
          {statusIcon}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{approval.step_name}</p>
              <Badge className={getStatusColor(approval.status)}>
                {formatStatus(approval.status)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {approval.required_role && `Role: ${formatStatus(approval.required_role)}`}
              {approval.assigned_user?.name && ` · Assigned to: ${approval.assigned_user.name}`}
              {approval.action_at && ` · ${formatDate(approval.action_at)}`}
            </p>
          </div>
          <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-180')} />
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t space-y-3">
            {approval.action_notes && (
              <div className="text-sm">
                <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                <p className="text-muted-foreground">{approval.action_notes}</p>
              </div>
            )}
            {approval.action_user?.name && (
              <p className="text-xs text-muted-foreground">
                Action by: {approval.action_user.name}{approval.action_at ? ` on ${formatDate(approval.action_at)}` : ''}
              </p>
            )}

            {isPending && (
              <div className="space-y-2">
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Add notes (optional)..."
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => handleAction('approved')} disabled={actionMutation.isPending}>
                    {actionMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleAction('rejected')} disabled={actionMutation.isPending}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =============================================================================
// DISPUTES TAB
// =============================================================================

function DisputesTab({ invoiceId, invoiceAmount }: { invoiceId: string; invoiceAmount: number }) {
  const { data: response, isLoading } = useInvoiceDisputes(invoiceId)
  const createMutation = useCreateDispute(invoiceId)

  const disputes = ((response as { data: InvoiceDispute[] } | undefined)?.data ?? []) as InvoiceDispute[]

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [expandedDisputeId, setExpandedDisputeId] = useState<string | null>(null)
  const [newDispute, setNewDispute] = useState({
    dispute_type: 'partial' as DisputeType,
    disputed_amount: '',
    reason_category: 'incorrect_amount' as DisputeReasonCategory,
    reason_description: '',
  })

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        dispute_type: newDispute.dispute_type,
        disputed_amount: parseFloat(newDispute.disputed_amount) || 0,
        reason_category: newDispute.reason_category,
        reason_description: newDispute.reason_description,
      })
      toast.success('Dispute opened')
      setNewDispute({ dispute_type: 'partial', disputed_amount: '', reason_category: 'incorrect_amount', reason_description: '' })
      setShowCreateForm(false)
    } catch {
      toast.error('Failed to open dispute')
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{disputes.length} dispute{disputes.length !== 1 ? 's' : ''}</h3>
        <Button size="sm" variant="outline" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? <Minus className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showCreateForm ? 'Cancel' : 'Open Dispute'}
        </Button>
      </div>

      {/* Create dispute form */}
      {showCreateForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">New Dispute</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Type</label>
                <select
                  value={newDispute.dispute_type}
                  onChange={(e) => setNewDispute((p) => ({ ...p, dispute_type: e.target.value as DisputeType }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                  value={newDispute.disputed_amount}
                  onChange={(e) => setNewDispute((p) => ({ ...p, disputed_amount: e.target.value }))}
                  placeholder={newDispute.dispute_type === 'full' ? invoiceAmount.toString() : '0.00'}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Reason</label>
              <select
                value={newDispute.reason_category}
                onChange={(e) => setNewDispute((p) => ({ ...p, reason_category: e.target.value as DisputeReasonCategory }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {DISPUTE_REASON_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <textarea
                value={newDispute.reason_description}
                onChange={(e) => setNewDispute((p) => ({ ...p, reason_description: e.target.value }))}
                rows={3}
                placeholder="Describe the dispute in detail..."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleCreate} disabled={!newDispute.reason_description || createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <AlertTriangle className="h-4 w-4 mr-1" />}
                Open Dispute
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disputes list */}
      {disputes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No disputes have been filed for this invoice.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {disputes.map((dispute) => (
            <DisputeCard
              key={dispute.id}
              dispute={dispute}
              invoiceId={invoiceId}
              isExpanded={expandedDisputeId === dispute.id}
              onToggle={() => setExpandedDisputeId(expandedDisputeId === dispute.id ? null : dispute.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DisputeCard({
  dispute,
  invoiceId,
  isExpanded,
  onToggle,
}: {
  dispute: InvoiceDispute
  invoiceId: string
  isExpanded: boolean
  onToggle: () => void
}) {
  const resolveMutation = useResolveDispute(invoiceId, dispute.id)
  const { data: commsResponse, isLoading: commsLoading } = useDisputeComms(
    isExpanded ? invoiceId : null,
    isExpanded ? dispute.id : null
  )
  const addCommMutation = useAddDisputeComm(invoiceId, dispute.id)

  const comms = ((commsResponse as { data: DisputeCommunication[] } | undefined)?.data ?? []) as DisputeCommunication[]

  const [resolveNotes, setResolveNotes] = useState('')
  const [showResolve, setShowResolve] = useState(false)
  const [newMessage, setNewMessage] = useState('')

  const isOpen = dispute.status === 'open' || dispute.status === 'in_review' || dispute.status === 'escalated'
  const reasonLabel = DISPUTE_REASON_OPTIONS.find((r) => r.value === dispute.reason_category)?.label ?? formatStatus(dispute.reason_category)

  const handleResolve = async (status: 'resolved_adjusted' | 'resolved_as_is' | 'closed') => {
    try {
      await resolveMutation.mutateAsync({
        status,
        resolution_notes: resolveNotes,
      })
      toast.success('Dispute resolved')
      setShowResolve(false)
      setResolveNotes('')
    } catch {
      toast.error('Failed to resolve dispute')
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    try {
      await addCommMutation.mutateAsync({
        message: newMessage,
        sender_type: 'user',
      })
      setNewMessage('')
      toast.success('Message sent')
    } catch {
      toast.error('Failed to send message')
    }
  }

  return (
    <Card className={cn(isOpen && 'border-amber-200')}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onToggle}>
          <AlertTriangle className={cn('h-5 w-5 shrink-0', isOpen ? 'text-amber-500' : 'text-muted-foreground')} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium">{reasonLabel}</p>
              <Badge className={getStatusColor(dispute.status)}>{formatStatus(dispute.status)}</Badge>
              <Badge variant="outline" className="text-xs">{dispute.dispute_type === 'full' ? 'Full' : 'Partial'}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatCurrency(dispute.disputed_amount)} · Opened {formatDate(dispute.created_at)}
            </p>
          </div>
          <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-180')} />
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t space-y-4">
            <p className="text-sm">{dispute.reason_description}</p>

            {dispute.resolution_notes && (
              <div className="text-sm p-3 bg-muted/50 rounded-md">
                <p className="text-xs font-medium text-muted-foreground mb-1">Resolution Notes</p>
                <p>{dispute.resolution_notes}</p>
              </div>
            )}

            {/* Communication thread */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Communication</p>
              {commsLoading ? (
                <div className="flex justify-center py-3"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
              ) : comms.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No messages yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {comms.map((c) => (
                    <div key={c.id} className={cn('p-2 rounded-md text-sm', c.is_internal ? 'bg-amber-50 border border-amber-100' : 'bg-muted/50')}>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <span className="font-medium">{c.sender?.name ?? formatStatus(c.sender_type)}</span>
                        <span>{formatDate(c.created_at)}</span>
                        {c.is_internal && <Badge className="bg-amber-100 text-amber-700 text-[10px] py-0">Internal</Badge>}
                      </div>
                      <p>{c.message}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 mt-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="h-8"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }}
                />
                <Button size="sm" variant="outline" className="h-8 shrink-0" onClick={handleSendMessage} disabled={!newMessage.trim() || addCommMutation.isPending}>
                  <MessageSquare className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Resolve actions */}
            {isOpen && (
              <div className="space-y-2">
                {!showResolve ? (
                  <Button size="sm" variant="outline" onClick={() => setShowResolve(true)}>
                    Resolve Dispute
                  </Button>
                ) : (
                  <div className="space-y-2 p-3 bg-muted/50 rounded-md">
                    <textarea
                      value={resolveNotes}
                      onChange={(e) => setResolveNotes(e.target.value)}
                      placeholder="Resolution notes..."
                      rows={2}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button size="sm" onClick={() => handleResolve('resolved_adjusted')} disabled={resolveMutation.isPending}>
                        Resolve (Adjusted)
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleResolve('resolved_as_is')} disabled={resolveMutation.isPending}>
                        Resolve (As-Is)
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleResolve('closed')} disabled={resolveMutation.isPending}>
                        Close
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowResolve(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =============================================================================
// PREREQUISITES TAB
// =============================================================================

function PrerequisitesTab({ invoiceId }: { invoiceId: string }) {
  const { data: response, isLoading } = usePaymentPrereqs(invoiceId)
  const createMutation = useCreatePaymentPrereq(invoiceId)

  const prereqs = ((response as { data: PaymentPrerequisite[] } | undefined)?.data ?? []) as PaymentPrerequisite[]

  const [showAddForm, setShowAddForm] = useState(false)
  const [newPrereq, setNewPrereq] = useState({
    prerequisite_type: 'coi' as string,
    label: '',
    notes: '',
  })

  const metCount = prereqs.filter((p) => p.is_met).length

  const handleAdd = async () => {
    try {
      await createMutation.mutateAsync({
        prerequisite_type: newPrereq.prerequisite_type,
        label: newPrereq.label,
        notes: newPrereq.notes || null,
      })
      toast.success('Prerequisite added')
      setNewPrereq({ prerequisite_type: 'coi', label: '', notes: '' })
      setShowAddForm(false)
    } catch {
      toast.error('Failed to add prerequisite')
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {prereqs.length} prerequisite{prereqs.length !== 1 ? 's' : ''}
          </h3>
          {prereqs.length > 0 && (
            <Badge className={metCount === prereqs.length ? 'bg-emerald-100 text-emerald-700' : 'bg-warning-bg text-warning-dark'}>
              {metCount}/{prereqs.length} met
            </Badge>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? <Minus className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showAddForm ? 'Cancel' : 'Add Prerequisite'}
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Type</label>
                <select
                  value={newPrereq.prerequisite_type}
                  onChange={(e) => setNewPrereq((p) => ({ ...p, prerequisite_type: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {PREREQ_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Label</label>
                <Input
                  value={newPrereq.label}
                  onChange={(e) => setNewPrereq((p) => ({ ...p, label: e.target.value }))}
                  placeholder="e.g., Current COI on file"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
              <Input
                value={newPrereq.notes}
                onChange={(e) => setNewPrereq((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Additional notes..."
              />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleAdd} disabled={!newPrereq.label || createMutation.isPending}>
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
          {prereqs.map((prereq) => (
            <PrereqRow key={prereq.id} prereq={prereq} invoiceId={invoiceId} />
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
      toast.success(prereq.is_met ? 'Marked as unmet' : 'Marked as met')
    } catch {
      toast.error('Failed to toggle prerequisite')
    }
  }

  const typeLabel = PREREQ_TYPES.find((t) => t.value === prereq.prerequisite_type)?.label ?? formatStatus(prereq.prerequisite_type)

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggle}
            disabled={toggleMutation.isPending}
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition-colors',
              prereq.is_met
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-muted-foreground/30 hover:border-muted-foreground/50'
            )}
          >
            {toggleMutation.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : prereq.is_met ? (
              <Check className="h-3.5 w-3.5" />
            ) : null}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={cn('text-sm font-medium', prereq.is_met && 'line-through text-muted-foreground')}>{prereq.label}</p>
              <Badge variant="outline" className="text-[10px]">{typeLabel}</Badge>
            </div>
            {prereq.met_at && (
              <p className="text-xs text-muted-foreground">Met on {formatDate(prereq.met_at)}</p>
            )}
            {prereq.notes && (
              <p className="text-xs text-muted-foreground mt-0.5">{prereq.notes}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
