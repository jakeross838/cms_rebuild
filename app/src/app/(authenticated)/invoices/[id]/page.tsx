'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import {
  ArrowLeft,
  Edit3,
  Loader2,
  Save,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  useInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
} from '@/hooks/use-invoices'
import { useJobs } from '@/hooks/use-jobs'
import { useVendors } from '@/hooks/use-vendors'
import { usePurchaseOrders } from '@/hooks/use-purchase-orders'
import { useCostCodes } from '@/hooks/use-cost-codes'
import { formatDate, getStatusColor, formatStatus, cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  INVOICE_STATUS_CONFIG,
  INVOICE_TYPE_CONFIG,
  CONTRACT_TYPE_CONFIG,
} from '@/types/invoice-full'
import type {
  InvoiceStatus,
  Invoice as InvoiceFullType,
} from '@/types/invoice-full'

// Extracted components
import type { ListItem, CostCodeItem, PoItem, TabId, InvoiceFormData } from '@/components/invoices/invoice-detail-types'
import { TABS } from '@/components/invoices/invoice-detail-types'
import { InvoiceEditForm } from '@/components/invoices/invoice-edit-form'
import { AmountHeroCard, ApprovalPipelineCard, StatusTransitionButtons } from '@/components/invoices/invoice-header-cards'
import { OverviewTab } from '@/components/invoices/invoice-overview-tab'
import { LineItemsTab } from '@/components/invoices/invoice-line-items-tab'
import { AllocationsTab } from '@/components/invoices/invoice-allocations-tab'
import { ApprovalsTab } from '@/components/invoices/invoice-approvals-tab'
import { DisputesTab } from '@/components/invoices/invoice-disputes-tab'
import { PrerequisitesTab } from '@/components/invoices/invoice-prerequisites-tab'

// -- Component ----------------------------------------------------------------

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string

  // -- Data fetching ----------------------------------------------------------
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

  // -- Local state ------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [archiving, setArchiving] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState<InvoiceFormData>({
    invoice_number: '',
    amount: '',
    tax_amount: '',
    retainage_percent: '',
    status: 'draft',
    invoice_type: 'standard',
    contract_type: 'lump_sum',
    invoice_date: '',
    due_date: '',
    job_id: '',
    vendor_id: '',
    po_id: '',
    cost_code_id: '',
    payment_terms: '',
    lien_waiver_status: 'not_required',
    description: '',
    notes: '',
    billing_period_start: '',
    billing_period_end: '',
    percent_complete: '',
  })

  // -- Derived data -----------------------------------------------------------
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

  const currentStatus = (invoice?.status ?? 'draft') as InvoiceStatus
  const statusConfig = INVOICE_STATUS_CONFIG[currentStatus]
  const typeConfig = invoice ? INVOICE_TYPE_CONFIG[invoice.invoice_type] : null
  const contractConfig = invoice ? CONTRACT_TYPE_CONFIG[invoice.contract_type] : null

  const netAmount = useMemo(() => {
    if (!invoice) return 0
    if (invoice.net_amount != null) return invoice.net_amount
    const retainageAmt = invoice.retainage_amount ?? (invoice.amount * (invoice.retainage_percent ?? 0) / 100)
    return invoice.amount - retainageAmt
  }, [invoice])

  // -- Sync form data from hook response --------------------------------------
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

  // -- Handlers ---------------------------------------------------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: InvoiceFormData) => ({ ...prev, [name]: value }))
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

  // -- Loading state ----------------------------------------------------------
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // -- Error / not found ------------------------------------------------------
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

  // -- Render -----------------------------------------------------------------
  return (
    <div className="max-w-5xl mx-auto">
      {/* -- HEADER ---------------------------------------------------------- */}
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

      {/* -- EDIT MODE -------------------------------------------------------- */}
      {editing ? (
        <InvoiceEditForm
          formData={formData}
          handleChange={handleChange}
          jobs={jobs}
          vendors={vendors}
          purchaseOrders={purchaseOrders}
          costCodes={costCodes}
        />
      ) : (
        <div className="space-y-6">
          <AmountHeroCard invoice={invoice} netAmount={netAmount} />
          <ApprovalPipelineCard currentStatus={currentStatus} />
          <StatusTransitionButtons
            currentStatus={currentStatus}
            onStatusChange={handleStatusChange}
            isPending={updateMutation.isPending}
          />

          {/* -- TABS ---------------------------------------------------------- */}
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

          {/* -- TAB CONTENT --------------------------------------------------- */}
          {activeTab === 'overview' && (
            <OverviewTab
              invoice={invoice}
              invoiceId={invoiceId}
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
