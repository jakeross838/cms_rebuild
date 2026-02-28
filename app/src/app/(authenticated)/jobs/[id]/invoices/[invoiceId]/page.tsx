'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getStatusColor, formatStatus} from '@/lib/utils'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────

interface InvoiceData {
  id: string
  invoice_number: string | null
  amount: number
  status: string | null
  invoice_date: string | null
  due_date: string | null
  vendor_id: string | null
  notes: string | null
  created_at: string | null
}

interface InvoiceFormData {
  invoice_number: string
  amount: string
  status: string
  invoice_date: string
  due_date: string
  vendor_id: string
  notes: string
}

const STATUS_OPTIONS = [
  'draft',
  'pm_pending',
  'accountant_pending',
  'owner_pending',
  'approved',
  'in_draw',
  'paid',
  'denied',
] as const

// ── Component ──────────────────────────────────────────────────

export default function JobInvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const jobId = params.id as string
  const invoiceId = params.invoiceId as string

  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState<InvoiceFormData>({
    invoice_number: '',
    amount: '',
    status: '',
    invoice_date: '',
    due_date: '',
    vendor_id: '',
    notes: '',
  })

  useEffect(() => {
    async function loadInvoice() {
      if (!companyId) { setError('No company found'); setLoading(false); return }

      // Verify job belongs to company
      const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
      if (!jobCheck) { setError('Job not found'); setLoading(false); return }

      const { data, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .eq('job_id', jobId)
        .single()

      if (fetchError || !data) {
        setError('Invoice not found')
        setLoading(false)
        return
      }

      const inv = data as InvoiceData
      setInvoice(inv)
      setFormData({
        invoice_number: inv.invoice_number || '',
        amount: String(inv.amount),
        status: inv.status || 'draft',
        invoice_date: inv.invoice_date || '',
        due_date: inv.due_date || '',
        vendor_id: inv.vendor_id || '',
        notes: inv.notes || '',
      })
      setLoading(false)
    }
    loadInvoice()
  }, [invoiceId, jobId, companyId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const amount = Number(formData.amount) || 0

      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          invoice_number: formData.invoice_number || null,
          amount,
          status: formData.status as 'draft' | 'pm_pending' | 'accountant_pending' | 'owner_pending' | 'approved' | 'in_draw' | 'paid' | 'denied',
          invoice_date: formData.invoice_date || null,
          due_date: formData.due_date || null,
          vendor_id: formData.vendor_id || null,
          notes: formData.notes || null,
        })
        .eq('id', invoiceId)
        .eq('job_id', jobId)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      setInvoice((prev) =>
        prev
          ? {
              ...prev,
              invoice_number: formData.invoice_number || null,
              amount,
              status: formData.status,
              invoice_date: formData.invoice_date || null,
              due_date: formData.due_date || null,
              vendor_id: formData.vendor_id || null,
              notes: formData.notes || null,
            }
          : prev
      )
      setSuccess(true)
      setEditing(false)
      toast.success('Updated')
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to save'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmArchive = async () => {
    setArchiving(true)
    const { error: archiveError } = await supabase
      .from('invoices')
      .update({ status: 'denied' })
      .eq('id', invoiceId)
      .eq('job_id', jobId)
      .eq('company_id', companyId)
    if (archiveError) {
      setError('Failed to archive invoice')
      toast.error('Failed to archive invoice')
      setArchiving(false)
      return
    }
    toast.success('Archived')
    router.push(`/jobs/${jobId}/invoices`)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href={`/jobs/${jobId}/invoices`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Invoices
        </Link>
        <p className="text-destructive">{error || 'Invoice not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/invoices`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Invoices
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                Invoice {invoice.invoice_number ? `#${invoice.invoice_number}` : ''}
              </h1>
              <Badge className={`${getStatusColor(invoice.status || 'draft')} rounded`}>
                {formatStatus((invoice.status || 'draft'))}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {formatCurrency(invoice.amount)}
              {invoice.invoice_date && ` | ${formatDate(invoice.invoice_date)}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
            ) : (
              <>
                <Button onClick={() => setEditing(false)} variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Invoice updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Invoice Number</span>
                    <p className="font-medium">{invoice.invoice_number ? `#${invoice.invoice_number}` : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <p className="font-medium">
                      <Badge className={`${getStatusColor(invoice.status || 'draft')} rounded`}>
                        {formatStatus((invoice.status || 'draft'))}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount</span>
                    <p className="font-medium text-lg">{formatCurrency(invoice.amount)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vendor ID</span>
                    <p className="font-medium font-mono text-xs">{invoice.vendor_id || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Invoice Date</span>
                    <p className="font-medium">{invoice.invoice_date ? formatDate(invoice.invoice_date) : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Due Date</span>
                    <p className="font-medium">{invoice.due_date ? formatDate(invoice.due_date) : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {invoice.notes && (
              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setShowArchiveDialog(true)} disabled={archiving} variant="outline" className="text-destructive hover:text-destructive">{archiving ? 'Archiving...' : 'Archive'}</Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Invoice Information</CardTitle>
                <CardDescription>Update invoice details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="invoice_number" className="text-sm font-medium">Invoice Number</label>
                    <Input id="invoice_number" name="invoice_number" value={formData.invoice_number} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{formatStatus(s)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="amount" className="text-sm font-medium">Amount <span className="text-red-500">*</span></label>
                  <Input id="amount" name="amount" type="number" step="0.01" min="0" value={formData.amount} onChange={handleChange} required />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Dates</CardTitle></CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Additional Info</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="vendor_id" className="text-sm font-medium">Vendor ID</label>
                  <Input id="vendor_id" name="vendor_id" value={formData.vendor_id} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                  <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive this invoice?"
        description="This invoice will be archived. It can be restored later."
        confirmLabel="Archive"
        onConfirm={handleConfirmArchive}
      />
    </div>
  )
}
