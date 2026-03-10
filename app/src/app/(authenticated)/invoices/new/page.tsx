'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCreateInvoice } from '@/hooks/use-invoices'
import { useJobs } from '@/hooks/use-jobs'
import { useVendors } from '@/hooks/use-vendors'
import { usePurchaseOrders } from '@/hooks/use-purchase-orders'
import { useCostCodes } from '@/hooks/use-cost-codes'
import { INVOICE_TYPE_CONFIG, CONTRACT_TYPE_CONFIG } from '@/types/invoice-full'
import type { InvoiceType, ContractType, LienWaiverStatus } from '@/types/invoice-full'
import { toast } from 'sonner'

type JobRow = { id: string; name: string; job_number: string | null }
type VendorRow = { id: string; name: string }
type PoRow = { id: string; po_number: string; title?: string }
type CostCodeRow = { id: string; code: string; name: string }

interface LineItem {
  description: string
  quantity: string
  unit_price: string
}

function calcLineAmount(item: LineItem): number {
  const qty = parseFloat(item.quantity)
  const price = parseFloat(item.unit_price)
  if (isNaN(qty) || isNaN(price)) return 0
  return qty * price
}

const selectClass = 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
const textareaClass = 'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

const ALL_INVOICE_TYPES: InvoiceType[] = ['standard', 'progress', 'final', 'credit_memo', 'retainage_release']
const ALL_CONTRACT_TYPES: ContractType[] = ['lump_sum', 'time_materials', 'unit_price', 'cost_plus']
const ALL_LIEN_WAIVER_STATUSES: LienWaiverStatus[] = ['not_required', 'required', 'pending', 'received']

const PAYMENT_TERMS_OPTIONS = [
  { value: '', label: 'Select terms' },
  { value: 'Net 15', label: 'Net 15' },
  { value: 'Net 30', label: 'Net 30' },
  { value: 'Net 45', label: 'Net 45' },
  { value: 'Net 60', label: 'Net 60' },
  { value: '2/10 Net 30', label: '2/10 Net 30' },
  { value: 'Due on Receipt', label: 'Due on Receipt' },
]

const LIEN_WAIVER_LABELS: Record<LienWaiverStatus, string> = {
  not_required: 'Not Required',
  required: 'Required',
  pending: 'Pending',
  received: 'Received',
}

export default function NewInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const createMutation = useCreateInvoice()

  // ── Dropdown data ──────────────────────────────────────────────
  const { data: jobsResponse, isLoading: jobsLoading, isError: jobsError } = useJobs({ limit: 500 } as Record<string, string | number | boolean | undefined>)
  const jobs: { id: string; label: string }[] = ((jobsResponse as { data: JobRow[] } | undefined)?.data ?? []).map((j) => ({
    id: j.id,
    label: j.job_number ? `${j.job_number} — ${j.name}` : j.name,
  }))

  const { data: vendorsResponse, isLoading: vendorsLoading, isError: vendorsError } = useVendors({ limit: 500 } as Record<string, string | number | boolean | undefined>)
  const vendors: { id: string; label: string }[] = ((vendorsResponse as { data: VendorRow[] } | undefined)?.data ?? []).map((v) => ({
    id: v.id,
    label: v.name,
  }))

  const { data: posResponse } = usePurchaseOrders()
  const purchaseOrders = ((posResponse as { data: PoRow[] } | undefined)?.data ?? []) as PoRow[]

  const { data: costCodesResponse } = useCostCodes()
  const costCodes = ((costCodesResponse as { data: CostCodeRow[] } | undefined)?.data ?? []) as CostCodeRow[]

  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    invoice_number: '',
    amount: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    job_id: searchParams.get('job_id') || '',
    vendor_id: '',
    notes: '',
    description: '',
    invoice_type: 'standard' as InvoiceType,
    contract_type: 'lump_sum' as ContractType,
    tax_amount: '',
    retainage_percent: '',
    payment_terms: '',
    lien_waiver_status: 'not_required' as LienWaiverStatus,
    cost_code_id: '',
    po_id: '',
    // Progress billing fields
    billing_period_start: '',
    billing_period_end: '',
    percent_complete: '',
    contract_value: '',
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: '1', unit_price: '' },
  ])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // ── Derived calculations ─────────────────────────────────────────
  const retainagePercent = parseFloat(formData.retainage_percent) || 0
  const effectiveAmount = parseFloat(formData.amount) || 0
  const retainageAmount = effectiveAmount > 0 ? (effectiveAmount * retainagePercent / 100) : 0
  const showBillingPeriod = formData.invoice_type === 'progress' || formData.invoice_type === 'final'

  // ── Line item handlers ──────────────────────────────────────────
  const handleLineItemChange = (index: number, field: keyof LineItem, value: string) => {
    setLineItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { description: '', quantity: '1', unit_price: '' }])
  }

  const removeLineItem = (index: number) => {
    setLineItems((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((_, i) => i !== index)
    })
  }

  const lineItemsTotal = lineItems.reduce((sum, item) => sum + calcLineAmount(item), 0)

  // Determine the effective amount: use manual amount if entered, otherwise use line items total
  const getEffectiveAmount = (): number => {
    const manualAmount = parseFloat(formData.amount)
    if (!isNaN(manualAmount) && manualAmount > 0) return manualAmount
    if (lineItemsTotal > 0) return lineItemsTotal
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (createMutation.isPending) return
    setError(null)

    const amount = getEffectiveAmount()
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be greater than zero. Enter an amount or add line items.')
      return
    }

    const retPercent = parseFloat(formData.retainage_percent) || 0
    const retAmount = amount * retPercent / 100
    const taxAmt = parseFloat(formData.tax_amount) || 0

    try {
      await createMutation.mutateAsync({
        invoice_number: formData.invoice_number || null,
        amount,
        tax_amount: taxAmt || undefined,
        retainage_percent: retPercent || undefined,
        retainage_amount: retAmount || undefined,
        invoice_date: formData.invoice_date || null,
        due_date: formData.due_date || null,
        job_id: formData.job_id || null,
        vendor_id: formData.vendor_id || null,
        status: 'draft',
        invoice_type: formData.invoice_type || undefined,
        contract_type: formData.contract_type || undefined,
        description: formData.description || null,
        notes: formData.notes || null,
        payment_terms: formData.payment_terms || null,
        lien_waiver_status: formData.lien_waiver_status || undefined,
        cost_code_id: formData.cost_code_id || null,
        po_id: formData.po_id || null,
        billing_period_start: formData.billing_period_start || null,
        billing_period_end: formData.billing_period_end || null,
        percent_complete: formData.percent_complete ? parseFloat(formData.percent_complete) : null,
      })

      toast.success('Invoice created')
      router.push('/invoices')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create invoice'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/invoices" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Invoices
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Invoice</h1>
        <p className="text-muted-foreground">Create a vendor invoice</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        {/* ── Invoice Details ──────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>Number, amount, dates, and classification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="invoice_number" className="text-sm font-medium">Invoice Number</label>
                <Input id="invoice_number" name="invoice_number" value={formData.invoice_number} onChange={handleChange} placeholder="INV-001" />
              </div>
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">Amount <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder={lineItemsTotal > 0 ? lineItemsTotal.toFixed(2) : '0.00'}
                    className="pl-7"
                  />
                </div>
                {lineItemsTotal > 0 && !formData.amount && (
                  <p className="text-xs text-muted-foreground">Using line items total: ${lineItemsTotal.toFixed(2)}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="invoice_type" className="text-sm font-medium">Invoice Type</label>
                <select id="invoice_type" name="invoice_type" value={formData.invoice_type} onChange={handleChange} className={selectClass}>
                  {ALL_INVOICE_TYPES.map((t) => (
                    <option key={t} value={t}>{INVOICE_TYPE_CONFIG[t].label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="contract_type" className="text-sm font-medium">Contract Type</label>
                <select id="contract_type" name="contract_type" value={formData.contract_type} onChange={handleChange} className={selectClass}>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="tax_amount" className="text-sm font-medium">Tax Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="tax_amount" name="tax_amount" type="number" step="0.01" min="0" value={formData.tax_amount} onChange={handleChange} placeholder="0.00" className="pl-7" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="retainage_percent" className="text-sm font-medium">Retainage %</label>
                <Input id="retainage_percent" name="retainage_percent" type="number" step="0.01" min="0" max="100" value={formData.retainage_percent} onChange={handleChange} placeholder="0" />
                {retainageAmount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Retainage: ${retainageAmount.toFixed(2)} (Net: ${(effectiveAmount - retainageAmount).toFixed(2)})
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Assignment ──────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment</CardTitle>
            <CardDescription>Link to a job, vendor, PO, and cost code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="job_id" className="text-sm font-medium">Job</label>
                <select id="job_id" name="job_id" value={formData.job_id} onChange={handleChange} className={selectClass}>
                  <option value="">{jobsLoading ? 'Loading jobs...' : jobsError ? 'Failed to load jobs' : 'No job'}</option>
                  {jobs.map((j) => <option key={j.id} value={j.id}>{j.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="vendor_id" className="text-sm font-medium">Vendor</label>
                <select id="vendor_id" name="vendor_id" value={formData.vendor_id} onChange={handleChange} className={selectClass}>
                  <option value="">{vendorsLoading ? 'Loading vendors...' : vendorsError ? 'Failed to load vendors' : 'No vendor'}</option>
                  {vendors.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="po_id" className="text-sm font-medium">Purchase Order</label>
                <select id="po_id" name="po_id" value={formData.po_id} onChange={handleChange} className={selectClass}>
                  <option value="">No PO assigned</option>
                  {purchaseOrders.map((p) => <option key={p.id} value={p.id}>{p.po_number}{p.title ? ` — ${p.title}` : ''}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="cost_code_id" className="text-sm font-medium">Cost Code</label>
                <select id="cost_code_id" name="cost_code_id" value={formData.cost_code_id} onChange={handleChange} className={selectClass}>
                  <option value="">No cost code</option>
                  {costCodes.map((c) => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="payment_terms" className="text-sm font-medium">Payment Terms</label>
                <select id="payment_terms" name="payment_terms" value={formData.payment_terms} onChange={handleChange} className={selectClass}>
                  {PAYMENT_TERMS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="lien_waiver_status" className="text-sm font-medium">Lien Waiver Status</label>
                <select id="lien_waiver_status" name="lien_waiver_status" value={formData.lien_waiver_status} onChange={handleChange} className={selectClass}>
                  {ALL_LIEN_WAIVER_STATUSES.map((s) => (
                    <option key={s} value={s}>{LIEN_WAIVER_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Progress Billing (conditional) ──────────────────────── */}
        {showBillingPeriod && (
          <Card>
            <CardHeader>
              <CardTitle>Progress Billing</CardTitle>
              <CardDescription>Billing period and progress details for {formData.invoice_type === 'progress' ? 'progress' : 'final'} invoices</CardDescription>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="percent_complete" className="text-sm font-medium">Percent Complete</label>
                  <Input id="percent_complete" name="percent_complete" type="number" step="0.1" min="0" max="100" value={formData.percent_complete} onChange={handleChange} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contract_value" className="text-sm font-medium">Contract Value</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input id="contract_value" name="contract_value" type="number" step="0.01" min="0" value={formData.contract_value} onChange={handleChange} placeholder="0.00" className="pl-7" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Line Items ──────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
            <CardDescription>Itemize costs for this invoice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Table header */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_80px_100px_100px_40px] gap-2 text-xs font-medium text-muted-foreground px-1">
              <span>Description</span>
              <span>Qty</span>
              <span>Unit Price</span>
              <span>Amount</span>
              <span />
            </div>

            {/* Line item rows */}
            {lineItems.map((item, index) => {
              const lineAmount = calcLineAmount(item)
              return (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_80px_100px_100px_40px] gap-2 items-start">
                  <div className="space-y-1">
                    <label className="text-xs font-medium sm:hidden">Description</label>
                    <Input
                      value={item.description}
                      onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                      placeholder="Description of work or materials"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium sm:hidden">Qty</label>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium sm:hidden">Unit Price</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => handleLineItemChange(index, 'unit_price', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex items-center h-9 px-3 text-sm text-muted-foreground bg-muted/50 rounded-md">
                    ${lineAmount.toFixed(2)}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => removeLineItem(index)}
                    disabled={lineItems.length <= 1}
                    aria-label="Remove line item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}

            {/* Add line button + total */}
            <div className="flex items-center justify-between pt-2 border-t">
              <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add Line
              </Button>
              <div className="text-sm font-medium">
                Total: <span className="text-base font-semibold">${lineItemsTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Description & Notes ──────────────────────────────────── */}
        <Card>
          <CardHeader><CardTitle>Description & Notes</CardTitle></CardHeader>
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
                className={textareaClass}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">Notes</label>
              <textarea
                id="notes"
                aria-label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Internal notes, PO reference, etc..."
                className={textareaClass}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Actions ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/invoices"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  )
}
