'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function NewChangeOrderPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    co_number: '',
    title: '',
    description: '',
    amount: '',
    change_type: 'owner_requested',
    status: 'draft',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      const companyId = (profile as { company_id: string } | null)?.company_id
      if (!companyId) throw new Error('No company found')

      // Verify job belongs to company
      const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
      if (!jobCheck) throw new Error('Job not found or access denied')

      const { error: insertError } = await supabase
        .from('change_orders')
        .insert({
          company_id: companyId,
          job_id: jobId,
          co_number: formData.co_number,
          title: formData.title,
          description: formData.description || null,
          amount: formData.amount ? parseFloat(formData.amount) : 0,
          change_type: formData.change_type,
          status: formData.status,
          created_by: user.id,
        })

      if (insertError) throw insertError

      toast.success('Change order created')
      router.push(`/jobs/${jobId}/change-orders`)
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create change order'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/change-orders`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Change Orders
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Change Order</h1>
        <p className="text-muted-foreground">Create a new change order for this job</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Change Order Details</CardTitle>
            <CardDescription>Number, title, and amount</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="co_number" className="text-sm font-medium">CO Number <span className="text-red-500">*</span></label>
                <Input id="co_number" name="co_number" value={formData.co_number} onChange={handleChange} placeholder="e.g., CO-001" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Additional outlet in master bedroom" required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">Amount ($)</label>
                <Input id="amount" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label htmlFor="change_type" className="text-sm font-medium">Type</label>
                <select id="change_type" name="change_type" value={formData.change_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="owner_requested">Owner Requested</option>
                  <option value="field_condition">Field Condition</option>
                  <option value="design_change">Design Change</option>
                  <option value="regulatory">Regulatory</option>
                  <option value="allowance">Allowance</option>
                  <option value="credit">Credit</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="draft">Draft</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Description</CardTitle></CardHeader>
          <CardContent>
            <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Describe the scope of this change order..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href={`/jobs/${jobId}/change-orders`}><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Change Order'}
          </Button>
        </div>
      </form>
    </div>
  )
}
