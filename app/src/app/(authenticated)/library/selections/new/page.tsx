'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCreateSelectionCategory } from '@/hooks/use-selections'
import { useJobs } from '@/hooks/use-jobs'
import { toast } from 'sonner'
import { formatStatus } from '@/lib/utils'

export default function NewSelectionCategoryPage() {
  const router = useRouter()
  const createCategory = useCreateSelectionCategory()

  const [error, setError] = useState<string | null>(null)

  const { data: jobsResponse } = useJobs({ limit: 500 } as any)
  const jobs = ((jobsResponse as { data: { id: string; name: string }[] } | undefined)?.data ?? [])

  const [formData, setFormData] = useState({
    job_id: '',
    name: '',
    room: '',
    pricing_model: 'allowance',
    allowance_amount: '',
    deadline: '',
    sort_order: '0',
    status: 'pending',
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (createCategory.isPending) return
    setError(null)

    try {
      await createCategory.mutateAsync({
        job_id: formData.job_id,
        name: formData.name,
        room: formData.room || null,
        pricing_model: formData.pricing_model,
        allowance_amount: formData.allowance_amount ? parseFloat(formData.allowance_amount) : 0,
        deadline: formData.deadline || null,
        sort_order: parseInt(formData.sort_order) || 0,
        status: formData.status,
        notes: formData.notes || null,
      })

      toast.success('Selection category created')
      router.push('/library/selections')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create selection category'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/library/selections" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Selections
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Selection Category</h1>
        <p className="text-muted-foreground">Create a new selection category for a job</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        {/* Category Info */}
        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
            <CardDescription>Basic selection category information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="job_id" className="text-sm font-medium">Job <span className="text-red-500">*</span></label>
                <select id="job_id" name="job_id" value={formData.job_id} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select a job...</option>
                  {jobs.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Category Name <span className="text-red-500">*</span></label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Flooring, Light Fixtures, Countertops" required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="room" className="text-sm font-medium">Room</label>
                <Input id="room" name="room" value={formData.room} onChange={handleChange} placeholder="e.g., Kitchen, Master Bath" />
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {['pending', 'presented', 'selected', 'approved', 'ordered', 'received', 'installed', 'on_hold', 'cancelled'].map((s) => (
                    <option key={s} value={s}>{formatStatus(s)}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Schedule</CardTitle>
            <CardDescription>Budget and timeline details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="pricing_model" className="text-sm font-medium">Pricing Model <span className="text-red-500">*</span></label>
                <select id="pricing_model" name="pricing_model" value={formData.pricing_model} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {[
                    { value: 'allowance', label: 'Allowance' },
                    { value: 'fixed', label: 'Fixed Price' },
                    { value: 'cost_plus', label: 'Cost Plus' },
                  ].map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="allowance_amount" className="text-sm font-medium">Allowance Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="allowance_amount" name="allowance_amount" type="number" step="0.01" value={formData.allowance_amount} onChange={handleChange} placeholder="0.00" className="pl-7" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="deadline" className="text-sm font-medium">Selection Deadline</label>
                <Input id="deadline" name="deadline" type="date" value={formData.deadline} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="sort_order" className="text-sm font-medium">Sort Order</label>
              <Input id="sort_order" name="sort_order" type="number" value={formData.sort_order} onChange={handleChange} placeholder="0" />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Additional notes about this selection category..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/library/selections"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={createCategory.isPending}>
            {createCategory.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Selection Category'}
          </Button>
        </div>
      </form>
    </div>
  )
}
