'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useArInvoice, useUpdateArInvoice, useDeleteArInvoice } from '@/hooks/use-accounting'
import { formatCurrency, formatDate, getStatusColor, formatStatus } from '@/lib/utils'
import { toast } from 'sonner'

interface ARInvoiceData {
  id: string
  company_id: string
  client_id: string
  job_id: string | null
  invoice_number: string
  invoice_date: string
  due_date: string
  amount: number
  balance_due: number
  status: string
  terms: string | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
}

interface ClientLookup {
  id: string
  name: string
}

interface JobLookup {
  id: string
  name: string
}

export default function ARInvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const entityId = params.id as string

  const { data: response, isLoading: loading, error: fetchError } = useArInvoice(entityId)
  const updateInvoice = useUpdateArInvoice(entityId)
  const deleteInvoice = useDeleteArInvoice()
  const invoice = (response as { data: ARInvoiceData } | undefined)?.data ?? null

  const [clients] = useState<ClientLookup[]>([])
  const [jobs] = useState<JobLookup[]>([])
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [archiving, setArchiving] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    invoice_number: '',
    client_id: '',
    job_id: '',
    amount: '',
    balance_due: '',
    status: '',
    invoice_date: '',
    due_date: '',
    terms: '',
    notes: '',
  })

  useEffect(() => {
    if (invoice) {
      setFormData({
        invoice_number: invoice.invoice_number,
        client_id: invoice.client_id,
        job_id: invoice.job_id || '',
        amount: String(invoice.amount),
        balance_due: String(invoice.balance_due),
        status: invoice.status,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        terms: invoice.terms || '',
        notes: invoice.notes || '',
      })
    }
  }, [invoice])

  const clientName = clients.find((c) => c.id === invoice?.client_id)?.name || 'Unknown Client'
  const jobName = jobs.find((j) => j.id === invoice?.job_id)?.name

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.invoice_number.trim()) { toast.error('Invoice Number is required'); return }
    if (!formData.client_id) { toast.error('Client is required'); return }
    if (!formData.status) { toast.error('Status is required'); return }
    if (!formData.amount.trim()) { toast.error('Amount is required'); return }
    if (!formData.balance_due.trim()) { toast.error('Balance Due is required'); return }
    if (!formData.invoice_date) { toast.error('Invoice Date is required'); return }
    if (!formData.due_date) { toast.error('Due Date is required'); return }

    try {
      await updateInvoice.mutateAsync({
        invoice_number: formData.invoice_number,
        client_id: formData.client_id,
        job_id: formData.job_id || null,
        amount: parseFloat(formData.amount) || 0,
        balance_due: parseFloat(formData.balance_due) || 0,
        status: formData.status,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date,
        terms: formData.terms || null,
        notes: formData.notes || null,
      } as Record<string, unknown>)
      toast.success('Saved')
      setEditing(false)
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to save')
    }
  }

  const handleDelete = async () => {
    try {
      setArchiving(true)
      await deleteInvoice.mutateAsync(entityId)
      toast.success('Archived')
      router.push('/financial/receivables')
      router.refresh()
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to archive')
      setArchiving(false)
    }
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
        <Link href="/financial/receivables" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Receivables
        </Link>
        <p className="text-destructive">{fetchError?.message || 'Invoice not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/financial/receivables" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Receivables
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Invoice #{invoice.invoice_number}</h1>
              <Badge className={`rounded ${getStatusColor(invoice.status)}`}>{formatStatus(invoice.status)}</Badge>
            </div>
            <p className="text-muted-foreground">{clientName}{jobName ? ` -- ${jobName}` : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
            ) : (
              <>
                <Button onClick={() => { setEditing(false); setError(null) }} variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={updateInvoice.isPending}>
                  {updateInvoice.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {fetchError && <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{fetchError.message}</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Invoice Number</dt>
                    <dd className="font-medium">{invoice.invoice_number}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Client</dt>
                    <dd className="font-medium">{clientName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Job</dt>
                    <dd className="font-medium">{jobName || 'None'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd><Badge className={`rounded ${getStatusColor(invoice.status)}`}>{formatStatus(invoice.status)}</Badge></dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Amount</dt>
                    <dd className="font-medium">{formatCurrency(invoice.amount)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Balance Due</dt>
                    <dd className="font-medium">{formatCurrency(invoice.balance_due)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Invoice Date</dt>
                    <dd className="font-medium">{formatDate(invoice.invoice_date)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Due Date</dt>
                    <dd className="font-medium">{formatDate(invoice.due_date)}</dd>
                  </div>
                  {invoice.terms && (
                    <div>
                      <dt className="text-muted-foreground">Terms</dt>
                      <dd className="font-medium">{invoice.terms}</dd>
                    </div>
                  )}
                </dl>
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
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)} disabled={archiving}>
                {archiving ? 'Archiving...' : 'Archive Invoice'}
              </Button>
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
                    <label htmlFor="invoice_number" className="text-sm font-medium">Invoice Number <span className="text-red-500">*</span></label>
                    <Input id="invoice_number" name="invoice_number" value={formData.invoice_number} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="client_id" className="text-sm font-medium">Client <span className="text-red-500">*</span></label>
                    <select id="client_id" name="client_id" value={formData.client_id} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="">Select client...</option>
                      {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="job_id" className="text-sm font-medium">Job</label>
                    <select id="job_id" name="job_id" value={formData.job_id} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="">No job</option>
                      {jobs.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="viewed">Viewed</option>
                      <option value="partial">Partial</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="void">Void</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="amount" className="text-sm font-medium">Amount <span className="text-red-500">*</span></label>
                    <Input id="amount" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="balance_due" className="text-sm font-medium">Balance Due <span className="text-red-500">*</span></label>
                    <Input id="balance_due" name="balance_due" type="number" step="0.01" value={formData.balance_due} onChange={handleChange} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="invoice_date" className="text-sm font-medium">Invoice Date <span className="text-red-500">*</span></label>
                    <Input id="invoice_date" name="invoice_date" type="date" value={formData.invoice_date} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="due_date" className="text-sm font-medium">Due Date <span className="text-red-500">*</span></label>
                    <Input id="due_date" name="due_date" type="date" value={formData.due_date} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="terms" className="text-sm font-medium">Terms</label>
                    <Input id="terms" name="terms" value={formData.terms} onChange={handleChange} placeholder="e.g., Net 30" />
                  </div>
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
        title="Archive invoice?"
        description="This invoice will be archived. It can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
