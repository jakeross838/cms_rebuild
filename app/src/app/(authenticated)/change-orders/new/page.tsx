'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface JobOption {
  id: string
  name: string
}

export default function NewChangeOrderPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jobs, setJobs] = useState<JobOption[]>([])

  const [formData, setFormData] = useState({
    co_number: '',
    title: '',
    description: '',
    change_type: 'Addition',
    amount: '',
    cost_impact: '',
    schedule_impact_days: '',
    job_id: '',
  })

  useEffect(() => {
    async function loadJobs() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      const companyId = (profile as { company_id: string } | null)?.company_id
      if (!companyId) return

      const { data } = await supabase
        .from('jobs')
        .select('id, name')
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .order('name')
        .limit(100)
      if (data) setJobs(data as JobOption[])
    }
    loadJobs()
  }, [supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!formData.title) throw new Error('Title is required')
      if (!formData.job_id) throw new Error('Job is required')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      const companyId = (profile as { company_id: string } | null)?.company_id
      if (!companyId) throw new Error('No company found')

      const { error: insertError } = await supabase
        .from('change_orders')
        .insert({
          company_id: companyId,
          job_id: formData.job_id,
          co_number: formData.co_number || `CO-${Date.now()}`,
          title: formData.title,
          description: formData.description || null,
          change_type: formData.change_type,
          amount: formData.amount ? parseFloat(formData.amount) : null,
          cost_impact: formData.cost_impact ? parseFloat(formData.cost_impact) : null,
          schedule_impact_days: formData.schedule_impact_days ? parseInt(formData.schedule_impact_days, 10) : null,
          status: 'Draft',
          created_by: user.id,
        })
        .select()
        .single()

      if (insertError) throw insertError

      toast.success('Change order created')
      router.push('/change-orders')
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
        <Link href="/change-orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Change Orders
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Create New Change Order</h1>
        <p className="text-muted-foreground">Submit a scope change or budget adjustment</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Change Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="co_number" className="text-sm font-medium">CO Number</label>
                <Input id="co_number" name="co_number" value={formData.co_number} onChange={handleChange} placeholder="e.g., CO-001" />
              </div>
              <div className="space-y-2">
                <label htmlFor="job_id" className="text-sm font-medium">Job <span className="text-red-500">*</span></label>
                <select id="job_id" name="job_id" value={formData.job_id} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select a job...</option>
                  {jobs.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Additional electrical outlets in kitchen" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe the scope change, reason, and any relevant details..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <label htmlFor="change_type" className="text-sm font-medium">Change Type</label>
              <select id="change_type" name="change_type" value={formData.change_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="Addition">Addition</option>
                <option value="Deduction">Deduction</option>
                <option value="Credit">Credit</option>
                <option value="Allowance">Allowance</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial &amp; Schedule Impact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">Amount ($)</label>
                <Input id="amount" name="amount" type="number" step="0.01" min="0" value={formData.amount} onChange={handleChange} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label htmlFor="cost_impact" className="text-sm font-medium">Cost Impact ($)</label>
                <Input id="cost_impact" name="cost_impact" type="number" step="0.01" min="0" value={formData.cost_impact} onChange={handleChange} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label htmlFor="schedule_impact_days" className="text-sm font-medium">Schedule Impact (days)</label>
                <Input id="schedule_impact_days" name="schedule_impact_days" type="number" min="0" value={formData.schedule_impact_days} onChange={handleChange} placeholder="0" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/change-orders"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Change Order'}
          </Button>
        </div>
      </form>
    </div>
  )
}
