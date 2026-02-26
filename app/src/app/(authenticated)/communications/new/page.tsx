'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface JobOption {
  id: string
  name: string
  job_number: string | null
}

export default function NewCommunicationPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jobs, setJobs] = useState<JobOption[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)

  const [formData, setFormData] = useState({
    job_id: '',
    subject: '',
    message_body: '',
    communication_type: 'note',
    priority: 'normal',
    recipient: '',
    status: 'draft',
    notes: '',
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
        .select('id, name, job_number')
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .order('name', { ascending: true })

      setJobs((data || []) as JobOption[])
      setJobsLoading(false)
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      const companyId = (profile as { company_id: string } | null)?.company_id
      if (!companyId) throw new Error('No company found')

      if (!formData.job_id) throw new Error('Please select a job')

      const { error: insertError } = await supabase
        .from('communications')
        .insert({
          company_id: companyId,
          job_id: formData.job_id,
          subject: formData.subject,
          message_body: formData.message_body,
          communication_type: formData.communication_type,
          priority: formData.priority,
          recipient: formData.recipient || null,
          status: formData.status,
          notes: formData.notes || null,
          created_by: user.id,
        })

      if (insertError) throw insertError

      toast.success('Communication created')
      router.push('/communications')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create communication'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/communications" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Communications
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Communication</h1>
        <p className="text-muted-foreground">Record a new message or note</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Communication Details</CardTitle>
            <CardDescription>Type, subject, and recipient</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="job_id" className="text-sm font-medium">Job <span className="text-red-500">*</span></label>
              <select id="job_id" name="job_id" value={formData.job_id} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" required>
                <option value="">{jobsLoading ? 'Loading jobs...' : 'Select a job'}</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.job_number ? `${job.job_number} - ` : ''}{job.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="communication_type" className="text-sm font-medium">Type <span className="text-red-500">*</span></label>
                <select id="communication_type" name="communication_type" value={formData.communication_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" required>
                  <option value="note">Note</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone Call</option>
                  <option value="meeting">Meeting</option>
                  <option value="letter">Letter</option>
                  <option value="text">Text Message</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                <select id="priority" name="priority" value={formData.priority} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">Subject <span className="text-red-500">*</span></label>
              <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="e.g., Plumbing rough-in schedule discussion" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="recipient" className="text-sm font-medium">Recipient</label>
                <Input id="recipient" name="recipient" value={formData.recipient} onChange={handleChange} placeholder="e.g., John Smith, ABC Plumbing" />
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="received">Received</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Message</CardTitle>
            <CardDescription>Communication content</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea id="message_body" name="message_body" value={formData.message_body} onChange={handleChange} rows={6} placeholder="Enter the message or communication details..." required className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Additional Notes</CardTitle></CardHeader>
          <CardContent>
            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Any follow-up items or internal notes..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/communications"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Communication'}
          </Button>
        </div>
      </form>
    </div>
  )
}
