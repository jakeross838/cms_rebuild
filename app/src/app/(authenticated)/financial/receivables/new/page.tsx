'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { formatStatus } from '@/lib/utils'

export default function NewReceivablePage() {
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile, user: authUser } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Dropdown data ──────────────────────────────────────────────
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [jobs, setJobs] = useState<{ id: string; name: string }[]>([])

  const [formData, setFormData] = useState({
    client_id: '',
    job_id: '',
    invoice_number: '',
    invoice_date: '',
    due_date: '',
    amount: '',
    terms: '',
    notes: '',
    status: 'draft',
  })

  useEffect(() => {
    async function loadDropdowns() {
      if (!companyId) return

      const [clientsRes, jobsRes] = await Promise.all([
        supabase.from('clients').select('id, name').eq('company_id', companyId).is('deleted_at', null).order('name'),
        supabase.from('jobs').select('id, name').eq('company_id', companyId).is('deleted_at', null).order('name'),
      ])

      if (clientsRes.data) setClients(clientsRes.data)
      if (jobsRes.data) setJobs(jobsRes.data)
    }
    loadDropdowns()
  }, [companyId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!authUser || !companyId) throw new Error('Not authenticated')

      if (!formData.client_id) { setError('Client is required'); setLoading(false); return }
      if (!formData.invoice_number.trim()) { setError('Invoice number is required'); setLoading(false); return }
      if (!formData.invoice_date) { setError('Invoice date is required'); setLoading(false); return }
      if (!formData.due_date) { setError('Due date is required'); setLoading(false); return }

      const amount = parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) { setError('Amount must be greater than zero'); setLoading(false); return }

      const { error: insertError } = await supabase
        .from('ar_invoices')
        .insert({
          company_id: companyId,
          client_id: formData.client_id,
          job_id: formData.job_id || null,
          invoice_number: formData.invoice_number,
          invoice_date: formData.invoice_date,
          due_date: formData.due_date,
          amount: amount,
          balance_due: amount,
          terms: formData.terms || null,
          notes: formData.notes || null,
          status: formData.status,
          created_by: authUser.id,
        })

      if (insertError) throw insertError

      toast.success('Receivable created')
      router.push('/financial/receivables')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create invoice'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/financial/receivables" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Receivables
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Invoice</h1>
        <p className="text-muted-foreground">Create a new accounts receivable invoice</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        {/* Invoice Info */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
            <CardDescription>Client and invoice details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="client_id" className="text-sm font-medium">Client <span className="text-red-500">*</span></label>
                <select id="client_id" name="client_id" value={formData.client_id} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select a client...</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="job_id" className="text-sm font-medium">Job</label>
                <select id="job_id" name="job_id" value={formData.job_id} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">No job</option>
                  {jobs.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="invoice_number" className="text-sm font-medium">Invoice Number <span className="text-red-500">*</span></label>
                <Input id="invoice_number" name="invoice_number" value={formData.invoice_number} onChange={handleChange} placeholder="e.g., INV-2026-001" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {['draft', 'sent', 'partially_paid', 'paid', 'overdue', 'voided'].map((s) => (
                    <option key={s} value={s}>{formatStatus(s)}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates & Amount */}
        <Card>
          <CardHeader>
            <CardTitle>Dates & Amount</CardTitle>
            <CardDescription>Financial details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                <label htmlFor="amount" className="text-sm font-medium">Amount <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="amount" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} placeholder="0.00" className="pl-7" required />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="terms" className="text-sm font-medium">Payment Terms</label>
              <Input id="terms" name="terms" value={formData.terms} onChange={handleChange} placeholder="e.g., Net 30, Due on Receipt" />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Additional notes for this invoice..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/financial/receivables"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  )
}
