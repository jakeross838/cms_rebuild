'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCreateApBill } from '@/hooks/use-accounting'
import { useVendors } from '@/hooks/use-vendors'
import { useJobs } from '@/hooks/use-jobs'
import { toast } from 'sonner'
import { formatStatus } from '@/lib/utils'

export default function NewPayablePage() {
  const router = useRouter()

  const createApBill = useCreateApBill()
  const [error, setError] = useState<string | null>(null)

  const { data: vendorsResponse } = useVendors({ limit: 500 } as any)
  const vendors = ((vendorsResponse as { data: { id: string; name: string }[] } | undefined)?.data ?? [])

  const { data: jobsResponse } = useJobs({ limit: 500 } as any)
  const jobs = ((jobsResponse as { data: { id: string; name: string }[] } | undefined)?.data ?? [])

  const [formData, setFormData] = useState({
    vendor_id: '',
    job_id: '',
    bill_number: '',
    bill_date: '',
    due_date: '',
    amount: '',
    description: '',
    terms: '',
    status: 'draft',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (createApBill.isPending) return
    setError(null)

    if (!formData.vendor_id) { setError('Vendor is required'); return }
    if (!formData.bill_number.trim()) { setError('Bill number is required'); return }
    if (!formData.bill_date) { setError('Bill date is required'); return }
    if (!formData.due_date) { setError('Due date is required'); return }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) { setError('Amount must be greater than zero'); return }

    try {
      await createApBill.mutateAsync({
        vendor_id: formData.vendor_id,
        job_id: formData.job_id || null,
        bill_number: formData.bill_number,
        bill_date: formData.bill_date,
        due_date: formData.due_date,
        amount: amount,
        balance_due: amount,
        description: formData.description || null,
        terms: formData.terms || null,
        status: formData.status,
      })

      toast.success('Payable created')
      router.push('/financial/payables')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create bill'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/financial/payables" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Payables
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Bill</h1>
        <p className="text-muted-foreground">Create a new accounts payable bill</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        {/* Bill Info */}
        <Card>
          <CardHeader>
            <CardTitle>Bill Information</CardTitle>
            <CardDescription>Vendor and bill details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="vendor_id" className="text-sm font-medium">Vendor <span className="text-red-500">*</span></label>
                <select id="vendor_id" name="vendor_id" value={formData.vendor_id} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select a vendor...</option>
                  {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="job_id" className="text-sm font-medium">Job</label>
                <select id="job_id" name="job_id" value={formData.job_id} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">No job (overhead)</option>
                  {jobs.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="bill_number" className="text-sm font-medium">Bill Number <span className="text-red-500">*</span></label>
                <Input id="bill_number" name="bill_number" value={formData.bill_number} onChange={handleChange} placeholder="e.g., INV-2026-001" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {['draft', 'pending_approval', 'approved', 'partially_paid', 'paid', 'voided'].map((s) => (
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
                <label htmlFor="bill_date" className="text-sm font-medium">Bill Date <span className="text-red-500">*</span></label>
                <Input id="bill_date" name="bill_date" type="date" value={formData.bill_date} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="due_date" className="text-sm font-medium">Due Date <span className="text-red-500">*</span></label>
                <Input id="due_date" name="due_date" type="date" value={formData.due_date} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">Amount <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="amount" name="amount" type="number" step="0.01" min="0" value={formData.amount} onChange={handleChange} placeholder="0.00" className="pl-7" required />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="terms" className="text-sm font-medium">Payment Terms</label>
              <Input id="terms" name="terms" value={formData.terms} onChange={handleChange} placeholder="e.g., Net 30, Due on Receipt" />
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Description of goods or services billed..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/financial/payables"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={createApBill.isPending}>
            {createApBill.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Bill'}
          </Button>
        </div>
      </form>
    </div>
  )
}
