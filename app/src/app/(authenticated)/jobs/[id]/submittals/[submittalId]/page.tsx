'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { formatDate, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────

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

interface SubmittalFormData {
  title: string
  description: string
  spec_section: string
  submitted_to: string
  submission_date: string
  required_date: string
  status: string
  priority: string
  notes: string
}

const STATUS_OPTIONS = ['draft', 'submitted', 'under_review', 'approved', 'approved_as_noted', 'rejected', 'resubmit', 'closed']
const PRIORITY_OPTIONS = ['low', 'normal', 'high', 'urgent']

// ── Component ──────────────────────────────────────────────────

export default function SubmittalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const jobId = params.id as string
  const submittalId = params.submittalId as string

  const [submittal, setSubmittal] = useState<SubmittalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState<SubmittalFormData>({
    title: '',
    description: '',
    spec_section: '',
    submitted_to: '',
    submission_date: '',
    required_date: '',
    status: 'draft',
    priority: 'normal',
    notes: '',
  })

  useEffect(() => {
    async function loadSubmittal() {
      if (!companyId) { setError('No company found'); setLoading(false); return }

      // Verify job belongs to company
      const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
      if (!jobCheck) { setError('Job not found'); setLoading(false); return }

      const { data, error: fetchError } = await supabase
        .from('submittals')
        .select('*')
        .eq('id', submittalId)
        .eq('job_id', jobId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Submittal not found')
        setLoading(false)
        return
      }

      const s = data as SubmittalData
      setSubmittal(s)
      setFormData({
        title: s.title,
        description: s.description || '',
        spec_section: s.spec_section || '',
        submitted_to: s.submitted_to || '',
        submission_date: s.submission_date || '',
        required_date: s.required_date || '',
        status: s.status,
        priority: s.priority,
        notes: s.notes || '',
      })
      setLoading(false)
    }
    loadSubmittal()
  }, [submittalId, jobId, supabase, companyId])

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
          title: formData.title,
          description: formData.description || null,
          spec_section: formData.spec_section || null,
          submitted_to: formData.submitted_to || null,
          submission_date: formData.submission_date || null,
          required_date: formData.required_date || null,
          status: formData.status,
          priority: formData.priority,
          notes: formData.notes || null,
        })
        .eq('id', submittalId)
        .eq('job_id', jobId)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      setSubmittal((prev) =>
        prev
          ? {
              ...prev,
              title: formData.title,
              description: formData.description || null,
              spec_section: formData.spec_section || null,
              submitted_to: formData.submitted_to || null,
              submission_date: formData.submission_date || null,
              required_date: formData.required_date || null,
              status: formData.status,
              priority: formData.priority,
              notes: formData.notes || null,
            }
          : prev
      )
      setSuccess(true)
      setEditing(false)
      toast.success('Updated')
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to save'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const { error: deleteError } = await supabase
      .from('submittals')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', submittalId)
      .eq('job_id', jobId)
      .eq('company_id', companyId)

    if (deleteError) {
      setError('Failed to archive submittal')
      toast.error('Failed to archive submittal')
      return
    }

    toast.success('Archived')
    router.push(`/jobs/${jobId}/submittals`)
    router.refresh()
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
        <Link href={`/jobs/${jobId}/submittals`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Submittals
        </Link>
        <p className="text-destructive">{error || 'Submittal not found'}</p>
      </div>
    )
  }

  const priorityColor: Record<string, string> = {
    low: 'bg-warm-100 text-warm-700',
    normal: 'bg-info-bg text-info-dark',
    high: 'bg-warning-bg text-warning-dark',
    urgent: 'bg-danger-bg text-danger-dark',
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/submittals`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Submittals
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{submittal.submittal_number}</h1>
              <Badge className={getStatusColor(submittal.status)}>
                {submittal.status.replace(/_/g, ' ')}
              </Badge>
              <Badge className={priorityColor[submittal.priority] || 'bg-warm-100 text-warm-700'}>
                {submittal.priority}
              </Badge>
            </div>
            <p className="text-muted-foreground">{submittal.title}</p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
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
                    <span className="text-muted-foreground">Number</span>
                    <p className="font-medium">{submittal.submittal_number}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Spec Section</span>
                    <p className="font-medium">{submittal.spec_section || 'None'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Submitted To</span>
                    <p className="font-medium">{submittal.submitted_to || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created</span>
                    <p className="font-medium">{formatDate(submittal.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Submission Date</span>
                    <p className="font-medium">{submittal.submission_date ? formatDate(submittal.submission_date) : 'Not submitted'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Required Date</span>
                    <p className="font-medium">{submittal.required_date ? formatDate(submittal.required_date) : 'Not set'}</p>
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

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Submittal
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Submittal Information</CardTitle>
                <CardDescription>Update submittal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                  <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="spec_section" className="text-sm font-medium">Spec Section</label>
                    <Input id="spec_section" name="spec_section" value={formData.spec_section} onChange={handleChange} placeholder="e.g., 03 30 00" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="submitted_to" className="text-sm font-medium">Submitted To</label>
                    <Input id="submitted_to" name="submitted_to" value={formData.submitted_to} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                    <select id="priority" name="priority" value={formData.priority} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Dates</CardTitle></CardHeader>
              <CardContent className="space-y-4">
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
                <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive submittal?"
        description="This submittal will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
