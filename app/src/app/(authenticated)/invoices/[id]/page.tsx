'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

interface InvoiceData {
  id: string
  invoice_number: string | null
  amount: number | null
  status: string | null
  invoice_date: string | null
  due_date: string | null
  notes: string | null
  created_at: string | null
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')
  const [archiving, setArchiving] = useState(false)

  const [formData, setFormData] = useState({
    invoice_number: '',
    amount: '',
    invoice_date: '',
    due_date: '',
    notes: '',
  })

  useEffect(() => {
    async function loadInvoice() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not authenticated'); setLoading(false); return }
      const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
      const companyId = profile?.company_id
      if (!companyId) { setError('No company found'); setLoading(false); return }
      setCompanyId(companyId)
      const { data, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', params.id as string)
        .eq('company_id', companyId)
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
        amount: inv.amount?.toString() || '',
        invoice_date: inv.invoice_date || '',
        due_date: inv.due_date || '',
        notes: inv.notes || '',
      })
      setLoading(false)
    }
    loadInvoice()
  }, [params.id, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleArchive = async () => {
    if (!window.confirm('Archive this invoice? It can be restored later.')) return
    setArchiving(true)
    try {
      const { error: archiveError } = await supabase
        .from('invoices')
        .update({ deleted_at: new Date().toISOString() } as never)
        .eq('id', params.id as string)
        .eq('company_id', companyId)
      if (archiveError) throw archiveError
      router.push('/invoices')
    } catch (err) {
      setError((err as Error)?.message || 'Failed to archive')
      setArchiving(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          invoice_number: formData.invoice_number || null,
          amount: formData.amount ? parseFloat(formData.amount) : undefined,
          invoice_date: formData.invoice_date || null,
          due_date: formData.due_date || null,
          notes: formData.notes || null,
        })
        .eq('id', params.id as string)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      setInvoice((prev) => prev ? {
        ...prev,
        invoice_number: formData.invoice_number || null,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        invoice_date: formData.invoice_date || null,
        due_date: formData.due_date || null,
        notes: formData.notes || null,
      } : prev)
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError((err as Error)?.message || 'Failed to save')
    } finally {
      setSaving(false)
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
        <Link href="/invoices" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Invoices
        </Link>
        <p className="text-destructive">{error || 'Invoice not found'}</p>
      </div>
    )
  }

  const formatCurrency = (val: number | null) => {
    if (val == null) return '--'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/invoices" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Invoices
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {invoice.invoice_number || 'Invoice'}
              </h1>
              {invoice.status && (
                <Badge variant="outline" className="text-xs">{invoice.status.replace('_', ' ')}</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {invoice.invoice_date ? `Issued ${new Date(invoice.invoice_date).toLocaleDateString()}` : `Created ${invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : 'Unknown'}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <>
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
              <button onClick={handleArchive} disabled={archiving} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">{archiving ? 'Archiving...' : 'Archive'}</button>
              </>
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
                    <p className="font-medium font-mono">{invoice.invoice_number || '--'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount</span>
                    <p className="font-medium text-lg">{formatCurrency(invoice.amount)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Invoice Date</span>
                    <p className="font-medium">{invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : '--'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Due Date</span>
                    <p className="font-medium">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '--'}</p>
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
                    <label htmlFor="amount" className="text-sm font-medium">Amount</label>
                    <Input id="amount" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} placeholder="0.00" />
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardContent>
                <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
