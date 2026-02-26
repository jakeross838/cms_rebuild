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

interface SelectOption {
  id: string
  label: string
}

export default function NewSubmittalPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jobs, setJobs] = useState<SelectOption[]>([])

  const [formData, setFormData] = useState({
    submittal_number: '',
    title: '',
    description: '',
    spec_section: '',
    submitted_to: '',
    submission_date: '',
    required_date: '',
    priority: 'Medium',
    job_id: '',
    notes: '',
  })

  useEffect(() => {
    async function loadOptions() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      const companyId = (profile as { company_id: string } | null)?.company_id
      if (!companyId) return

      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id, name, job_number')
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .order('name')

      setJobs((jobsData || []).map((j: { id: string; name: string; job_number: string | null }) => ({
        id: j.id,
        label: j.job_number ? `${j.job_number} — ${j.name}` : j.name,
      })))
    }
    loadOptions()
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
      if (!formData.job_id) throw new Error('Please select a job')
      if (!formData.submittal_number) throw new Error('Submittal number is required')

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
        .from('submittals')
        .insert({
          company_id: companyId,
          job_id: formData.job_id,
          submittal_number: formData.submittal_number,
          title: formData.title,
          description: formData.description || null,
          spec_section: formData.spec_section || null,
          submitted_to: formData.submitted_to || null,
          submitted_by: user.id,
          submission_date: formData.submission_date || null,
          required_date: formData.required_date || null,
          priority: formData.priority,
          status: 'draft',
          notes: formData.notes || null,
          created_by: user.id,
        })
        .select()
        .single()

      if (insertError) throw insertError

      toast.success('Submittal created')
      router.push('/submittals')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create submittal'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/submittals" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Submittals
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Submittal</h1>
        <p className="text-muted-foreground">Create a new submittal for review</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Submittal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="submittal_number" className="text-sm font-medium">Submittal Number <span className="text-red-500">*</span></label>
                <Input id="submittal_number" name="submittal_number" value={formData.submittal_number} onChange={handleChange} placeholder="e.g., SUB-001" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                <select id="priority" name="priority" value={formData.priority} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Exterior Stone Samples" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="job_id" className="text-sm font-medium">Job <span className="text-red-500">*</span></label>
              <select id="job_id" name="job_id" value={formData.job_id} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">Select a job...</option>
                {jobs.map((j) => <option key={j.id} value={j.id}>{j.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Describe the submittal..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submission Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="spec_section" className="text-sm font-medium">Spec Section</label>
                <Input id="spec_section" name="spec_section" value={formData.spec_section} onChange={handleChange} placeholder="e.g., 04 43 00" />
              </div>
              <div className="space-y-2">
                <label htmlFor="submitted_to" className="text-sm font-medium">Submitted To</label>
                <Input id="submitted_to" name="submitted_to" value={formData.submitted_to} onChange={handleChange} placeholder="e.g., Architect Name" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="submission_date" className="text-sm font-medium">Submission Date</label>
                <Input id="submission_date" name="submission_date" type="date" value={formData.submission_date} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="required_date" className="text-sm font-medium">Required Date</label>
                <Input id="required_date" name="required_date" type="date" value={formData.required_date} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Any additional notes..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/submittals"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Submittal'}
          </Button>
        </div>
      </form>
    </div>
  )
}
