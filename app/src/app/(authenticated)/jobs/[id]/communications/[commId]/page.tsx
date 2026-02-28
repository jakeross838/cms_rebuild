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
import { formatDate, getStatusColor, formatStatus } from '@/lib/utils'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────

interface CommunicationData {
  id: string
  subject: string
  message_body: string
  communication_type: string
  status: string
  priority: string
  recipient: string | null
  notes: string | null
  created_at: string
}

interface CommunicationFormData {
  subject: string
  message_body: string
  communication_type: string
  status: string
  priority: string
  recipient: string
  notes: string
}

const TYPE_OPTIONS = ['email', 'phone', 'meeting', 'text', 'letter', 'other']
const STATUS_OPTIONS = ['draft', 'sent', 'received', 'read', 'replied', 'archived']
const PRIORITY_OPTIONS = ['low', 'normal', 'high', 'urgent']

// ── Component ──────────────────────────────────────────────────

export default function CommunicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const jobId = params.id as string
  const commId = params.commId as string

  const [comm, setComm] = useState<CommunicationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState<CommunicationFormData>({
    subject: '',
    message_body: '',
    communication_type: 'email',
    status: 'draft',
    priority: 'normal',
    recipient: '',
    notes: '',
  })

  useEffect(() => {
    async function loadComm() {
      if (!companyId) { setError('No company found'); setLoading(false); return }

      // Verify job belongs to company
      const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
      if (!jobCheck) { setError('Job not found'); setLoading(false); return }

      const { data, error: fetchError } = await supabase
        .from('communications')
        .select('*')
        .eq('id', commId)
        .eq('job_id', jobId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Communication not found')
        setLoading(false)
        return
      }

      const c = data as CommunicationData
      setComm(c)
      setFormData({
        subject: c.subject,
        message_body: c.message_body,
        communication_type: c.communication_type,
        status: c.status,
        priority: c.priority,
        recipient: c.recipient || '',
        notes: c.notes || '',
      })
      setLoading(false)
    }
    loadComm()
  }, [commId, jobId, companyId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.subject.trim()) { toast.error('Subject is required'); return }
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('communications')
        .update({
          subject: formData.subject,
          message_body: formData.message_body,
          communication_type: formData.communication_type,
          status: formData.status,
          priority: formData.priority,
          recipient: formData.recipient || null,
          notes: formData.notes || null,
        })
        .eq('id', commId)
        .eq('job_id', jobId)
        .eq('company_id', companyId)

      if (updateError) throw updateError
      toast.success('Saved')

      setComm((prev) =>
        prev
          ? {
              ...prev,
              subject: formData.subject,
              message_body: formData.message_body,
              communication_type: formData.communication_type,
              status: formData.status,
              priority: formData.priority,
              recipient: formData.recipient || null,
              notes: formData.notes || null,
            }
          : prev
      )
      setSuccess(true)
      setEditing(false)
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
    try {
      const { error: deleteError } = await supabase
        .from('communications')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', commId)
        .eq('job_id', jobId)
        .eq('company_id', companyId)

      if (deleteError) {
        setError('Failed to archive communication')
        toast.error('Failed to archive communication')
        return
      }
      toast.success('Archived')

      router.push(`/jobs/${jobId}/communications`)
      router.refresh()
  
    } catch (err) {
      const msg = (err as Error)?.message || 'Operation failed'
      setError(msg)
      toast.error(msg)
    }
}

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!comm) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href={`/jobs/${jobId}/communications`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Communications
        </Link>
        <p className="text-destructive">{error || 'Communication not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/communications`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Communications
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{comm.subject}</h1>
              <Badge className={getStatusColor(comm.status)}>
                {formatStatus(comm.status)}
              </Badge>
              <Badge className={getStatusColor(comm.priority || 'normal')}>
                {formatStatus(comm.priority || 'normal')}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {comm.communication_type} {comm.recipient ? `to ${comm.recipient}` : ''} - {formatDate(comm.created_at)}
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Communication updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type</span>
                    <p className="font-medium">{formatStatus(comm.communication_type)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Recipient</span>
                    <p className="font-medium">{comm.recipient || 'None'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Priority</span>
                    <p className="font-medium">{formatStatus(comm.priority)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created</span>
                    <p className="font-medium">{formatDate(comm.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Message</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-foreground whitespace-pre-wrap">{comm.message_body}</p>
              </CardContent>
            </Card>

            {comm.notes && (
              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{comm.notes}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Communication
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Communication Details</CardTitle>
                <CardDescription>Update communication information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">Subject <span className="text-red-500">*</span></label>
                  <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="communication_type" className="text-sm font-medium">Type</label>
                    <select id="communication_type" name="communication_type" value={formData.communication_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>{formatStatus(t)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{formatStatus(s)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                    <select id="priority" name="priority" value={formData.priority} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p} value={p}>{formatStatus(p)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="recipient" className="text-sm font-medium">Recipient</label>
                  <Input id="recipient" name="recipient" value={formData.recipient} onChange={handleChange} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Message</CardTitle></CardHeader>
              <CardContent>
                <textarea id="message_body" aria-label="Message body" name="message_body" value={formData.message_body} onChange={handleChange} rows={6} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
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
        title="Archive communication?"
        description="This communication will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
