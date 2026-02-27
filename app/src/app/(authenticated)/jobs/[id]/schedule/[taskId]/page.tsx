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

interface ScheduleTaskData {
  id: string
  name: string
  description: string | null
  phase: string | null
  trade: string | null
  status: string | null
  planned_start: string | null
  planned_end: string | null
  duration_days: number | null
  progress_pct: number | null
  is_critical_path: boolean | null
  notes: string | null
  created_at: string | null
}

interface ScheduleFormData {
  name: string
  description: string
  phase: string
  trade: string
  status: string
  planned_start: string
  planned_end: string
  duration_days: string
  progress_pct: string
  notes: string
}

const STATUS_OPTIONS = ['not_started', 'in_progress', 'completed', 'on_hold', 'cancelled']

// ── Component ──────────────────────────────────────────────────

export default function ScheduleTaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const jobId = params.id as string
  const taskId = params.taskId as string

  const [task, setTask] = useState<ScheduleTaskData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState<ScheduleFormData>({
    name: '',
    description: '',
    phase: '',
    trade: '',
    status: '',
    planned_start: '',
    planned_end: '',
    duration_days: '',
    progress_pct: '',
    notes: '',
  })

  useEffect(() => {
    async function loadTask() {
      if (!companyId) { setError('No company found'); setLoading(false); return }

      // Verify job belongs to company
      const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
      if (!jobCheck) { setError('Job not found'); setLoading(false); return }

      const { data, error: fetchError } = await supabase
        .from('schedule_tasks')
        .select('*')
        .eq('id', taskId)
        .eq('job_id', jobId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Schedule task not found')
        setLoading(false)
        return
      }

      const t = data as ScheduleTaskData
      setTask(t)
      setFormData({
        name: t.name,
        description: t.description || '',
        phase: t.phase || '',
        trade: t.trade || '',
        status: t.status || 'not_started',
        planned_start: t.planned_start || '',
        planned_end: t.planned_end || '',
        duration_days: t.duration_days != null ? String(t.duration_days) : '',
        progress_pct: t.progress_pct != null ? String(t.progress_pct) : '',
        notes: t.notes || '',
      })
      setLoading(false)
    }
    loadTask()
  }, [taskId, jobId, supabase, companyId])

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
        .from('schedule_tasks')
        .update({
          name: formData.name,
          description: formData.description || null,
          phase: formData.phase || null,
          trade: formData.trade || null,
          status: formData.status || null,
          planned_start: formData.planned_start || null,
          planned_end: formData.planned_end || null,
          duration_days: formData.duration_days ? Number(formData.duration_days) : null,
          progress_pct: formData.progress_pct ? Number(formData.progress_pct) : null,
          notes: formData.notes || null,
        })
        .eq('id', taskId)
        .eq('job_id', jobId)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      setTask((prev) =>
        prev
          ? {
              ...prev,
              name: formData.name,
              description: formData.description || null,
              phase: formData.phase || null,
              trade: formData.trade || null,
              status: formData.status || null,
              planned_start: formData.planned_start || null,
              planned_end: formData.planned_end || null,
              duration_days: formData.duration_days ? Number(formData.duration_days) : null,
              progress_pct: formData.progress_pct ? Number(formData.progress_pct) : null,
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
      .from('schedule_tasks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', taskId)
      .eq('job_id', jobId)
      .eq('company_id', companyId)

    if (deleteError) {
      setError('Failed to archive task')
      toast.error('Failed to archive task')
      return
    }

    toast.success('Archived')
    router.push(`/jobs/${jobId}/schedule`)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href={`/jobs/${jobId}/schedule`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Schedule
        </Link>
        <p className="text-destructive">{error || 'Task not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/schedule`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Schedule
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{task.name}</h1>
              <Badge className={getStatusColor(task.status ?? 'not_started')}>
                {(task.status ?? 'not started').replace(/_/g, ' ')}
              </Badge>
              {task.is_critical_path && (
                <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200 text-xs">Critical</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {task.trade || 'No trade'} {task.phase ? `- ${task.phase}` : ''}
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Task updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Task Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Phase</span>
                    <p className="font-medium">{task.phase || 'None'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trade</span>
                    <p className="font-medium">{task.trade || 'None'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration</span>
                    <p className="font-medium">{task.duration_days != null ? `${task.duration_days} days` : 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Progress</span>
                    <p className="font-medium">{task.progress_pct != null ? `${task.progress_pct}%` : '0%'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Start Date</span>
                    <p className="font-medium">{task.planned_start ? formatDate(task.planned_start) : 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">End Date</span>
                    <p className="font-medium">{task.planned_end ? formatDate(task.planned_end) : 'Not set'}</p>
                  </div>
                </div>
                {task.progress_pct != null && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${task.progress_pct}%` }} />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">{task.progress_pct}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {task.description && (
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
                </CardContent>
              </Card>
            )}

            {task.notes && (
              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.notes}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Task
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Task Details</CardTitle>
                <CardDescription>Update task information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="phase" className="text-sm font-medium">Phase</label>
                    <Input id="phase" name="phase" value={formData.phase} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="trade" className="text-sm font-medium">Trade</label>
                    <Input id="trade" name="trade" value={formData.trade} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Schedule</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="planned_start" className="text-sm font-medium">Start Date</label>
                    <Input id="planned_start" name="planned_start" type="date" value={formData.planned_start} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="planned_end" className="text-sm font-medium">End Date</label>
                    <Input id="planned_end" name="planned_end" type="date" value={formData.planned_end} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="duration_days" className="text-sm font-medium">Duration (days)</label>
                    <Input id="duration_days" name="duration_days" type="number" min="0" value={formData.duration_days} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="progress_pct" className="text-sm font-medium">Progress (%)</label>
                    <Input id="progress_pct" name="progress_pct" type="number" min="0" max="100" value={formData.progress_pct} onChange={handleChange} />
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
        title="Archive task?"
        description="This task will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
