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

// -- Types ------------------------------------------------------------------

interface RFIData {
  id: string
  rfi_number: string | null
  subject: string | null
  question: string | null
  status: string | null
  priority: string | null
  category: string | null
  due_date: string | null
  created_at: string | null
  answered_at: string | null
}

interface RFIFormData {
  rfi_number: string
  subject: string
  question: string
  status: string
  priority: string
  category: string
  due_date: string
}

const STATUS_OPTIONS = ['draft', 'open', 'answered', 'closed'] as const
const PRIORITY_OPTIONS = ['low', 'normal', 'high', 'urgent'] as const

// -- Component --------------------------------------------------------------

export default function RFIDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const jobId = params.id as string
  const rfiId = params.rfiId as string

  const [rfi, setRfi] = useState<RFIData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState<RFIFormData>({
    rfi_number: '',
    subject: '',
    question: '',
    status: 'draft',
    priority: 'normal',
    category: '',
    due_date: '',
  })

  useEffect(() => {
    async function loadRfi() {
      if (!companyId) { setError('No company found'); setLoading(false); return }

      // Verify job belongs to company
      const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
      if (!jobCheck) { setError('Job not found'); setLoading(false); return }

      const { data, error: fetchError } = await supabase
        .from('rfis')
        .select('*')
        .eq('id', rfiId)
        .eq('job_id', jobId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('RFI not found')
        setLoading(false)
        return
      }

      const r = data as RFIData
      setRfi(r)
      setFormData({
        rfi_number: r.rfi_number || '',
        subject: r.subject || '',
        question: r.question || '',
        status: r.status || 'draft',
        priority: r.priority || 'normal',
        category: r.category || '',
        due_date: r.due_date || '',
      })
      setLoading(false)
    }
    loadRfi()
  }, [jobId, rfiId, supabase, companyId])

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
        .from('rfis')
        .update({
          rfi_number: formData.rfi_number || undefined,
          subject: formData.subject || undefined,
          question: formData.question || undefined,
          status: formData.status || 'draft',
          priority: formData.priority || 'normal',
          category: formData.category || undefined,
          due_date: formData.due_date || undefined,
        })
        .eq('id', rfiId)
        .eq('job_id', jobId)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      setRfi((prev) =>
        prev
          ? {
              ...prev,
              rfi_number: formData.rfi_number || null,
              subject: formData.subject || null,
              question: formData.question || null,
              status: formData.status,
              priority: formData.priority,
              category: formData.category || null,
              due_date: formData.due_date || null,
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

  const handleArchive = async () => {
    const { error: deleteError } = await supabase
      .from('rfis')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', rfiId)
      .eq('job_id', jobId)
      .eq('company_id', companyId)

    if (deleteError) {
      setError('Failed to archive RFI')
      toast.error('Failed to archive RFI')
      return
    }

    toast.success('Archived')
    router.push(`/jobs/${jobId}/rfis`)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!rfi) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href={`/jobs/${jobId}/rfis`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to RFIs
        </Link>
        <p className="text-destructive">{error || 'RFI not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/rfis`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to RFIs
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              {rfi.rfi_number && <span className="text-lg font-mono text-muted-foreground">{rfi.rfi_number}</span>}
              <h1 className="text-2xl font-bold text-foreground">{rfi.subject ?? 'Untitled RFI'}</h1>
              <Badge className={`${getStatusColor(rfi.status ?? 'draft')} rounded`}>
                {(rfi.status ?? 'draft').replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Created {rfi.created_at ? formatDate(rfi.created_at) : 'Unknown'}
            </p>
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">RFI updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>RFI Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">RFI Number</p>
                    <p className="font-medium font-mono">{rfi.rfi_number || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={`${getStatusColor(rfi.status ?? 'draft')} rounded`}>
                      {(rfi.status ?? 'draft').replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <Badge variant="outline">{rfi.priority || 'normal'}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{rfi.category || 'Uncategorized'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium">{rfi.due_date ? formatDate(rfi.due_date) : 'No due date'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Answered At</p>
                    <p className="font-medium">{rfi.answered_at ? formatDate(rfi.answered_at) : 'Not answered'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Question</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rfi.question || 'No question provided'}</p>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive RFI
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>RFI Details</CardTitle>
                <CardDescription>Update RFI information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="rfi_number" className="text-sm font-medium">RFI Number</label>
                    <Input id="rfi_number" name="rfi_number" value={formData.rfi_number} onChange={handleChange} placeholder="e.g., RFI-001" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">Subject <span className="text-red-500">*</span></label>
                  <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required placeholder="RFI subject" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                    <select id="priority" name="priority" value={formData.priority} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <Input id="category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Structural, MEP" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="due_date" className="text-sm font-medium">Due Date</label>
                    <Input id="due_date" name="due_date" type="date" value={formData.due_date} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Question</CardTitle>
                <CardDescription>The question being asked</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea id="question" aria-label="Question" name="question" value={formData.question} onChange={handleChange} rows={4} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="What is the question?" />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive RFI?"
        description="This RFI will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleArchive}
      />
    </div>
  )
}
