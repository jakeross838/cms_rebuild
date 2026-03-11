'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatStatus } from '@/lib/utils'
import {
  INVOICE_STATUS_CONFIG,
  INVOICE_TYPE_CONFIG,
  CONTRACT_TYPE_CONFIG,
} from '@/types/invoice-full'
import type {
  InvoiceStatus,
  InvoiceType,
  ContractType,
  LienWaiverStatus,
} from '@/types/invoice-full'
import type { ListItem, CostCodeItem, PoItem, InvoiceFormData } from '@/components/invoices/invoice-detail-types'

const ALL_STATUSES: InvoiceStatus[] = [
  'draft', 'pm_pending', 'accountant_pending', 'owner_pending',
  'approved', 'denied', 'in_draw', 'paid',
]
const ALL_INVOICE_TYPES: InvoiceType[] = ['standard', 'progress', 'final', 'credit_memo', 'retainage_release']
const ALL_CONTRACT_TYPES: ContractType[] = ['lump_sum', 'time_materials', 'unit_price', 'cost_plus']
const ALL_LIEN_WAIVER_STATUSES: LienWaiverStatus[] = ['not_required', 'required', 'pending', 'received']

export function InvoiceEditForm({
  formData,
  handleChange,
  jobs,
  vendors,
  purchaseOrders,
  costCodes,
}: {
  formData: InvoiceFormData
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
