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

interface SubmittalData {
  id: string
  submittal_number: string
  title: string
  description: string | null
  spec_section: string | null
  submitted_to: string | null
  submission_date: string | null
  required_date: string | null
  status: string
  priority: string
  notes: string | null
  created_at: string
}

export default function SubmittalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [submittal, setSubmittal] = useState<SubmittalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)

  const [formData, setFormData] = useState({
    submittal_number: '',
    title: '',
    description: '',
    spec_section: '',
    submitted_to: '',
    submission_date: '',
    required_date: '',
    priority: 'Medium',
    notes: '',
  })

  useEffect(() => {
    async function loadSubmittal() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not authenticated'); setLoading(false); return }
      const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
      const companyId = profile?.company_id
      if (!companyId) { setError('No company found'); setLoading(false); return }

      const { data, error: fetchError } = await supabase
        .from('submittals')
        .select('*')
        .eq('company_id', companyId)
        .eq('id', params.id as string)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Submittal not found')
        setLoading(false)
        return
      }

      const sub = data as SubmittalData
      setSubmittal(sub)
      setFormData({
        submittal_number: sub.submittal_number || '',
        title: sub.title || '',
        description: sub.description || '',
        spec_section: sub.spec_section || '',
        submitted_to: sub.submitted_to || '',
        submission_date: sub.submission_date || '',
        required_date: sub.required_date || '',
        priority: sub.priority || 'Medium',
        notes: sub.notes || '',
      })
      setLoading(false)
    }
    loadSubmittal()
  }, [params.id, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('submittals')
        .update({
          submittal_number: formData.submittal_number || undefined,
          title: formData.title,
          description: formData.description || null,
          spec_section: formData.spec_section || null,
          submitted_to: formData.submitted_to || null,
          submission_date: formData.submission_date || null,
          required_date: formData.required_date || null,
          priority: formData.priority,
          notes: formData.notes || null,
        })
        .eq('id', params.id as string)

      if (updateError) throw updateError

      setSubmittal((prev) => prev ? {
        ...prev,
        submittal_number: formData.submittal_number || prev.submittal_number,
        title: formData.title,
        description: formData.description || null,
        spec_section: formData.spec_section || null,
        submitted_to: formData.submitted_to || null,
        submission_date: formData.submission_date || null,
        required_date: formData.required_date || null,
        priority: formData.priority,
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

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive this submittal?')) return

    try {
      const { error: archiveError } = await supabase
        .from('submittals')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', params.id as string)

      if (archiveError) throw archiveError

      router.push('/submittals')
      router.refresh()
    } catch (err) {
      setError((err as Error)?.message || 'Failed to archive')
    }
  }

  const getStatusBadgeClasses = (status: string): string => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      case 'submitted': return 'bg-blue-100 text-blue-700'
      case 'in_review': return 'bg-purple-100 text-purple-700'
      case 'draft': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityBadgeClasses = (priority: string): string => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-700'
      case 'High': return 'bg-amber-100 text-amber-700'
      case 'Medium': return 'bg-blue-100 text-blue-700'
      case 'Low': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!submittal) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/submittals" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Submittals
        </Link>
        <p className="text-destructive">{error || 'Submittal not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/submittals" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Submittals
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {submittal.title}
              </h1>
              <Badge variant="outline" className={`text-xs rounded ${getStatusBadgeClasses(submittal.status)}`}>
                {submittal.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className={`text-xs rounded ${getPriorityBadgeClasses(submittal.priority)}`}>
                {submittal.priority}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {submittal.submittal_number}
              {submittal.submission_date ? ` — Submitted ${new Date(submittal.submission_date).toLocaleDateString()}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <>
                <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
                <Button onClick={handleArchive} variant="outline" className="text-destructive hover:text-destructive">Archive</Button>
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Submittal updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Submittal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Submittal Number</span>
                    <p className="font-medium font-mono">{submittal.submittal_number}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Spec Section</span>
                    <p className="font-medium">{submittal.spec_section || '--'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Submitted To</span>
                    <p className="font-medium">{submittal.submitted_to || '--'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Priority</span>
                    <p className="font-medium">{submittal.priority}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Submission Date</span>
                    <p className="font-medium">{submittal.submission_date ? new Date(submittal.submission_date).toLocaleDateString() : '--'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Required Date</span>
                    <p className="font-medium">{submittal.required_date ? new Date(submittal.required_date).toLocaleDateString() : '--'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {submittal.description && (
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{submittal.description}</p>
                </CardContent>
              </Card>
            )}

            {submittal.notes && (
              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{submittal.notes}</p>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Submittal Information</CardTitle>
                <CardDescription>Update submittal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="submittal_number" className="text-sm font-medium">Submittal Number <span className="text-red-500">*</span></label>
                    <Input id="submittal_number" name="submittal_number" value={formData.submittal_number} onChange={handleChange} required />
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
                  <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
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
                    <Input id="spec_section" name="spec_section" value={formData.spec_section} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="submitted_to" className="text-sm font-medium">Submitted To</label>
                    <Input id="submitted_to" name="submitted_to" value={formData.submitted_to} onChange={handleChange} />
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
                <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
