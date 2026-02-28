'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCreateRfi } from '@/hooks/use-rfis'
import { useJobs } from '@/hooks/use-jobs'
import { toast } from 'sonner'

export default function NewRfiPage() {
  const router = useRouter()
  const createRfi = useCreateRfi()

  const [error, setError] = useState<string | null>(null)

  const { data: jobsResponse } = useJobs({ limit: 500 } as any)
  const jobs = ((jobsResponse as { data: { id: string; name: string }[] } | undefined)?.data ?? [])

  const [formData, setFormData] = useState({
    rfi_number: '',
    subject: '',
    question: '',
    priority: 'normal',
    category: '',
    due_date: '',
    cost_impact: '',
    schedule_impact_days: '',
    job_id: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (createRfi.isPending) return
    setError(null)

    if (!formData.subject) {
      setError('Subject is required')
      return
    }
    if (!formData.rfi_number) {
      setError('RFI number is required')
      return
    }
    if (!formData.question) {
      setError('Question is required')
      return
    }
    if (!formData.job_id) {
      setError('Job is required')
      return
    }

    try {
      await createRfi.mutateAsync({
        job_id: formData.job_id,
        rfi_number: formData.rfi_number,
        subject: formData.subject,
        question: formData.question,
        priority: formData.priority,
        category: formData.category || null,
        due_date: formData.due_date || null,
        cost_impact: formData.cost_impact ? parseFloat(formData.cost_impact) : null,
        schedule_impact_days: formData.schedule_impact_days ? parseInt(formData.schedule_impact_days, 10) : null,
        status: 'draft',
      } as never)

      toast.success('RFI created')
      router.push('/rfis')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create RFI'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/rfis" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to RFIs
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Create New RFI</h1>
        <p className="text-muted-foreground">Submit a Request for Information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>RFI Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="rfi_number" className="text-sm font-medium">RFI Number <span className="text-red-500">*</span></label>
                <Input id="rfi_number" name="rfi_number" value={formData.rfi_number} onChange={handleChange} placeholder="e.g., RFI-001" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="job_id" className="text-sm font-medium">Job <span className="text-red-500">*</span></label>
                <select id="job_id" name="job_id" value={formData.job_id} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select a job...</option>
                  {jobs.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                <select id="priority" name="priority" value={formData.priority} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">Category</label>
                <Input id="category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Structural, Electrical, Plumbing" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">Subject <span className="text-red-500">*</span></label>
              <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="e.g., Foundation rebar specification clarification" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="question" className="text-sm font-medium">Question <span className="text-red-500">*</span></label>
              <textarea id="question" aria-label="Question" name="question" value={formData.question} onChange={handleChange} rows={4} placeholder="Describe your question or information request in detail..." required className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impact &amp; Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="due_date" className="text-sm font-medium">Due Date</label>
                <Input id="due_date" name="due_date" type="date" value={formData.due_date} onChange={handleChange} />
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
          <Link href="/rfis"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={createRfi.isPending}>
            {createRfi.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create RFI'}
          </Button>
        </div>
      </form>
    </div>
  )
}
