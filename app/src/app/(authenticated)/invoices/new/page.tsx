'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCreateInvoice } from '@/hooks/use-invoices'
import { useJobs } from '@/hooks/use-jobs'
import { useVendors } from '@/hooks/use-vendors'
import { toast } from 'sonner'

type JobRow = { id: string; name: string; job_number: string | null }
type VendorRow = { id: string; name: string }

export default function NewInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const createMutation = useCreateInvoice()

  // ── Dropdown data ──────────────────────────────────────────────
  const { data: jobsResponse } = useJobs({ limit: 500 } as Record<string, string | number | boolean | undefined>)
  const jobs: { id: string; label: string }[] = ((jobsResponse as { data: JobRow[] } | undefined)?.data ?? []).map((j) => ({
    id: j.id,
    label: j.job_number ? `${j.job_number} — ${j.name}` : j.name,
  }))

  const { data: vendorsResponse } = useVendors({ limit: 500 } as Record<string, string | number | boolean | undefined>)
  const vendors: { id: string; label: string }[] = ((vendorsResponse as { data: VendorRow[] } | undefined)?.data ?? []).map((v) => ({
    id: v.id,
    label: v.name,
  }))

  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    invoice_number: '',
    amount: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    job_id: searchParams.get('job_id') || '',
    vendor_id: '',
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (createMutation.isPending) return
    setError(null)

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be greater than zero')
      return
    }

    try {
      await createMutation.mutateAsync({
        invoice_number: formData.invoice_number || null,
        amount,
        invoice_date: formData.invoice_date || null,
        due_date: formData.due_date || null,
        job_id: formData.job_id || null,
        vendor_id: formData.vendor_id || null,
        status: 'draft',
        notes: formData.notes || null,
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

        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>Number, amount, and dates</CardDescription>
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
                  <Input id="amount" name="amount" type="number" step="0.01" min="0" value={formData.amount} onChange={handleChange} placeholder="0.00" className="pl-7" required />
                </div>
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
          <CardHeader>
            <CardTitle>Assignment</CardTitle>
            <CardDescription>Link to a job and vendor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="job_id" className="text-sm font-medium">Job</label>
                <select id="job_id" name="job_id" value={formData.job_id} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">No job</option>
                  {jobs.map((j) => <option key={j.id} value={j.id}>{j.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="vendor_id" className="text-sm font-medium">Vendor</label>
                <select id="vendor_id" name="vendor_id" value={formData.vendor_id} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">No vendor</option>
                  {vendors.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Description of work, PO reference, etc..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

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
