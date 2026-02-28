'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, formatStatus, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

// ── Types ────────────────────────────────────────────────────────────────────

interface RfiData {
  id: string
  rfi_number: string | null
  subject: string
  question: string | null
  status: string | null
  priority: string | null
  category: string | null
  due_date: string | null
  cost_impact: number | null
  schedule_impact_days: number | null
  created_at: string | null
  answered_at: string | null
  closed_at: string | null
}

// ── Helpers ──────────────────────────────────────────────────────────────────


// ── Component ────────────────────────────────────────────────────────────────

export default function RfiDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [rfi, setRfi] = useState<RfiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    rfi_number: '',
    subject: '',
    question: '',
    status: 'draft',
    priority: 'normal',
    category: '',
    due_date: '',
    cost_impact: '',
    schedule_impact_days: '',
  })

  useEffect(() => {
    async function loadRfi() {
      if (!companyId) { setError('No company found'); setLoading(false); return }

      const { data, error: fetchError } = await supabase
        .from('rfis')
        .select('*')
        .eq('company_id', companyId)
        .eq('id', params.id as string)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('RFI not found')
        setLoading(false)
        return
      }

      const r = data as RfiData
      setRfi(r)
      setFormData({
        rfi_number: r.rfi_number || '',
        subject: r.subject,
        question: r.question || '',
        status: r.status || 'draft',
        priority: r.priority || 'normal',
        category: r.category || '',
        due_date: r.due_date || '',
        cost_impact: r.cost_impact != null ? String(r.cost_impact) : '',
        schedule_impact_days: r.schedule_impact_days != null ? String(r.schedule_impact_days) : '',
      })
      setLoading(false)
    }
    loadRfi()
  }, [params.id, companyId])

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
          subject: formData.subject,
          question: formData.question || undefined,
          status: formData.status,
          priority: formData.priority,
          category: formData.category || undefined,
          due_date: formData.due_date || undefined,
          cost_impact: formData.cost_impact ? parseFloat(formData.cost_impact) : undefined,
          schedule_impact_days: formData.schedule_impact_days ? parseInt(formData.schedule_impact_days, 10) : undefined,
        })
        .eq('id', params.id as string)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      setRfi((prev) => prev ? {
        ...prev,
        rfi_number: formData.rfi_number || null,
        subject: formData.subject,
        question: formData.question || null,
        status: formData.status,
        priority: formData.priority,
        category: formData.category || null,
        due_date: formData.due_date || null,
        cost_impact: formData.cost_impact ? parseFloat(formData.cost_impact) : null,
        schedule_impact_days: formData.schedule_impact_days ? parseInt(formData.schedule_impact_days, 10) : null,
      } : prev)
      toast.success('RFI updated')
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError((err as Error)?.message || 'Failed to save')
      toast.error('Failed to save RFI')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const { error: deleteError } = await supabase
      .from('rfis')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id as string)
      .eq('company_id', companyId)

    if (deleteError) {
      setError('Failed to archive RFI')
      toast.error('Failed to archive RFI')
      return
    }

    toast.success('RFI archived')
    router.push('/rfis')
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
        <Link href="/rfis" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to RFIs
        </Link>
        <p className="text-destructive">{error || 'RFI not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/rfis" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to RFIs
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{rfi.subject}</h1>
              <Badge className={getStatusColor(rfi.status || 'draft')}>{formatStatus(rfi.status || 'open')}</Badge>
              <Badge className={getStatusColor(rfi.priority || 'normal')}>{formatStatus(rfi.priority || 'normal')}</Badge>
            </div>
            <p className="text-muted-foreground">
              {rfi.rfi_number ? `${rfi.rfi_number} \u00b7 ` : ''}
              Created {formatDate(rfi.created_at) || 'Unknown'}
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
                <CardTitle>Question</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rfi.question || 'No question provided'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Category</dt>
                    <dd className="font-medium">{rfi.category || 'None'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Due Date</dt>
                    <dd className="font-medium">{formatDate(rfi.due_date) || 'Not set'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Cost Impact</dt>
                    <dd className="font-medium">{rfi.cost_impact != null ? formatCurrency(rfi.cost_impact) : 'None'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Schedule Impact</dt>
                    <dd className="font-medium">{rfi.schedule_impact_days != null ? `${rfi.schedule_impact_days} day${rfi.schedule_impact_days !== 1 ? 's' : ''}` : 'None'}</dd>
                  </div>
                  {rfi.answered_at && (
                    <div>
                      <dt className="text-muted-foreground">Answered</dt>
                      <dd className="font-medium">{formatDate(rfi.answered_at)}</dd>
                    </div>
                  )}
                  {rfi.closed_at && (
                    <div>
                      <dt className="text-muted-foreground">Closed</dt>
                      <dd className="font-medium">{formatDate(rfi.closed_at)}</dd>
                    </div>
                  )}
                </dl>
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
                    <Input id="rfi_number" name="rfi_number" value={formData.rfi_number} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="draft">Draft</option>
                      <option value="open">Open</option>
                      <option value="pending_response">Pending Response</option>
                      <option value="answered">Answered</option>
                      <option value="closed">Closed</option>
                      <option value="voided">Voided</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">Subject <span className="text-red-500">*</span></label>
                  <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="question" className="text-sm font-medium">Question</label>
                  <textarea id="question" aria-label="Question" name="question" value={formData.question} onChange={handleChange} rows={4} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
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
                    <Input id="category" name="category" value={formData.category} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impact & Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="due_date" className="text-sm font-medium">Due Date</label>
                    <Input id="due_date" name="due_date" type="date" value={formData.due_date} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="cost_impact" className="text-sm font-medium">Cost Impact ($)</label>
                    <Input id="cost_impact" name="cost_impact" type="number" step="0.01" min="0" value={formData.cost_impact} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="schedule_impact_days" className="text-sm font-medium">Schedule Impact (days)</label>
                    <Input id="schedule_impact_days" name="schedule_impact_days" type="number" min="0" value={formData.schedule_impact_days} onChange={handleChange} />
                  </div>
                </div>
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
        onConfirm={handleDelete}
      />
    </div>
  )
}
