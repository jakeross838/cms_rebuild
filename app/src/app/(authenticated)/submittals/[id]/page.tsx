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
import { useSubmittal, useUpdateSubmittal, useDeleteSubmittal } from '@/hooks/use-submittals'
import { formatDate, formatStatus, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

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

  const submittalId = params.id as string

  const { data: response, isLoading: loading, error: fetchError } = useSubmittal(submittalId)
  const updateSubmittal = useUpdateSubmittal(submittalId)
  const deleteSubmittal = useDeleteSubmittal()
  const submittal = (response as { data: SubmittalData } | undefined)?.data ?? null

  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    submittal_number: '',
    title: '',
    description: '',
    spec_section: '',
    submitted_to: '',
    submission_date: '',
    required_date: '',
    priority: 'normal',
    notes: '',
  })

  useEffect(() => {
    if (submittal) {
      setFormData({
        submittal_number: submittal.submittal_number || '',
        title: submittal.title || '',
        description: submittal.description || '',
        spec_section: submittal.spec_section || '',
        submitted_to: submittal.submitted_to || '',
        submission_date: submittal.submission_date || '',
        required_date: submittal.required_date || '',
        priority: submittal.priority || 'normal',
        notes: submittal.notes || '',
      })
    }
  }, [submittal])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.submittal_number.trim()) { toast.error('Submittal Number is required'); return }
    if (!formData.title.trim()) { toast.error('Title is required'); return }

    try {
      await updateSubmittal.mutateAsync({
        submittal_number: formData.submittal_number || undefined,
        title: formData.title,
        description: formData.description || null,
        spec_section: formData.spec_section || null,
        submitted_to: formData.submitted_to || null,
        submission_date: formData.submission_date || null,
        required_date: formData.required_date || null,
        priority: formData.priority,
        notes: formData.notes || null,
      } as Record<string, unknown>)
      toast.success('Saved')
      setEditing(false)
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to save'
      toast.error(errorMessage)
    }
  }

  const handleArchive = async () => {
    try {
      await deleteSubmittal.mutateAsync(submittalId)
      toast.success('Archived')
      router.push('/submittals')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to archive'
      toast.error(errorMessage)
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
        <p className="text-destructive">{fetchError?.message || 'Submittal not found'}</p>
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
              <Badge className={getStatusColor(submittal.status)}>
                {formatStatus(submittal.status)}
              </Badge>
              <Badge className={getStatusColor(submittal.priority)}>
                {formatStatus(submittal.priority)}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {submittal.submittal_number}
              {submittal.submission_date ? ` — Submitted ${formatDate(submittal.submission_date)}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <>
                <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
                <Button onClick={() => setShowArchiveDialog(true)} variant="outline" className="text-destructive hover:text-destructive">Archive</Button>
              </>
            ) : (
              <>
                <Button onClick={() => setEditing(false)} variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={updateSubmittal.isPending}>
                  {updateSubmittal.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {fetchError && <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{fetchError.message}</div>}

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
                    <p className="font-medium">{formatDate(submittal.submission_date) || '--'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Required Date</span>
                    <p className="font-medium">{formatDate(submittal.required_date) || '--'}</p>
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
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                  <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
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
        description="This submittal will be archived. It can be restored later."
        confirmLabel="Archive"
        onConfirm={handleArchive}
      />
    </div>
  )
}
