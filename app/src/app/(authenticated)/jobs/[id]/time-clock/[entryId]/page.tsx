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
import { createClient } from '@/lib/supabase/client'
import { formatDate, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────

interface TimeEntryData {
  id: string
  entry_date: string
  clock_in: string | null
  clock_out: string | null
  regular_hours: number
  overtime_hours: number
  break_minutes: number
  status: string
  entry_method: string
  notes: string | null
  user_id: string | null
  created_at: string
}

interface TimeEntryFormData {
  entry_date: string
  clock_in: string
  clock_out: string
  regular_hours: string
  overtime_hours: string
  break_minutes: string
  status: string
  notes: string
}

const STATUS_OPTIONS = ['pending', 'approved', 'rejected'] as const

// ── Component ──────────────────────────────────────────────────

export default function TimeEntryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const jobId = params.id as string
  const entryId = params.entryId as string

  const [entry, setEntry] = useState<TimeEntryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')

  const [formData, setFormData] = useState<TimeEntryFormData>({
    entry_date: '',
    clock_in: '',
    clock_out: '',
    regular_hours: '',
    overtime_hours: '',
    break_minutes: '',
    status: '',
    notes: '',
  })

  useEffect(() => {
    async function loadEntry() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not authenticated'); setLoading(false); return }
      const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
      const cid = profile?.company_id
      if (!cid) { setError('No company found'); setLoading(false); return }
      setCompanyId(cid)

      // Verify job belongs to company
      const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', cid).single()
      if (!jobCheck) { setError('Job not found'); setLoading(false); return }

      const { data, error: fetchError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('id', entryId)
        .eq('job_id', jobId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Time entry not found')
        setLoading(false)
        return
      }

      const e = data as TimeEntryData
      setEntry(e)
      setFormData({
        entry_date: e.entry_date || '',
        clock_in: e.clock_in || '',
        clock_out: e.clock_out || '',
        regular_hours: String(e.regular_hours),
        overtime_hours: String(e.overtime_hours),
        break_minutes: String(e.break_minutes ?? 0),
        status: e.status,
        notes: e.notes || '',
      })
      setLoading(false)
    }
    loadEntry()
  }, [entryId, jobId, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const regular = Number(formData.regular_hours) || 0
      const overtime = Number(formData.overtime_hours) || 0
      const breakMins = parseInt(formData.break_minutes, 10) || 0

      const { error: updateError } = await supabase
        .from('time_entries')
        .update({
          entry_date: formData.entry_date,
          clock_in: formData.clock_in || null,
          clock_out: formData.clock_out || null,
          regular_hours: regular,
          overtime_hours: overtime,
          break_minutes: breakMins,
          status: formData.status,
          notes: formData.notes || null,
        })
        .eq('id', entryId)
        .eq('job_id', jobId)

      if (updateError) throw updateError

      setEntry((prev) =>
        prev
          ? {
              ...prev,
              entry_date: formData.entry_date,
              clock_in: formData.clock_in || null,
              clock_out: formData.clock_out || null,
              regular_hours: regular,
              overtime_hours: overtime,
              break_minutes: breakMins,
              status: formData.status,
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

  const handleArchive = async () => {
    const { error: deleteError } = await supabase
      .from('time_entries')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', entryId)
      .eq('job_id', jobId)

    if (deleteError) {
      setError('Failed to archive time entry')
      toast.error('Failed to archive time entry')
      return
    }

    toast.success('Archived')
    router.push(`/jobs/${jobId}/time-clock`)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href={`/jobs/${jobId}/time-clock`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Time Clock
        </Link>
        <p className="text-destructive">{error || 'Time entry not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/time-clock`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Time Clock
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Time Entry</h1>
              <Badge className={`${getStatusColor(entry.status)} rounded`}>{entry.status}</Badge>
            </div>
            <p className="text-muted-foreground">
              {formatDate(entry.entry_date)} &bull; {entry.entry_method}
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Time entry updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Entry Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Date</span>
                    <p className="font-medium">{formatDate(entry.entry_date)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <p className="font-medium">
                      <Badge className={`${getStatusColor(entry.status)} rounded`}>{entry.status}</Badge>
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Clock In</span>
                    <p className="font-medium">{entry.clock_in ? new Date(entry.clock_in).toLocaleTimeString() : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Clock Out</span>
                    <p className="font-medium">{entry.clock_out ? new Date(entry.clock_out).toLocaleTimeString() : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Regular Hours</span>
                    <p className="font-medium">{entry.regular_hours.toFixed(1)}h</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Overtime Hours</span>
                    <p className="font-medium">
                      {entry.overtime_hours > 0 ? (
                        <span className="text-amber-600">{entry.overtime_hours.toFixed(1)}h</span>
                      ) : (
                        '0.0h'
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Break</span>
                    <p className="font-medium">{entry.break_minutes > 0 ? `${entry.break_minutes} min` : 'None'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Hours</span>
                    <p className="font-medium">{(entry.regular_hours + entry.overtime_hours).toFixed(1)}h</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Entry Method</span>
                    <p className="font-medium">{entry.entry_method}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {entry.notes && (
              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{entry.notes}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Entry
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Time Entry Details</CardTitle>
                <CardDescription>Update time entry information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="entry_date" className="text-sm font-medium">Date <span className="text-red-500">*</span></label>
                    <Input id="entry_date" name="entry_date" type="date" value={formData.entry_date} onChange={handleChange} required />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="clock_in" className="text-sm font-medium">Clock In</label>
                    <Input id="clock_in" name="clock_in" type="datetime-local" value={formData.clock_in} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="clock_out" className="text-sm font-medium">Clock Out</label>
                    <Input id="clock_out" name="clock_out" type="datetime-local" value={formData.clock_out} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Hours</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="regular_hours" className="text-sm font-medium">Regular Hours</label>
                    <Input id="regular_hours" name="regular_hours" type="number" step="0.1" min="0" value={formData.regular_hours} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="overtime_hours" className="text-sm font-medium">Overtime Hours</label>
                    <Input id="overtime_hours" name="overtime_hours" type="number" step="0.1" min="0" value={formData.overtime_hours} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="break_minutes" className="text-sm font-medium">Break (minutes)</label>
                    <Input id="break_minutes" name="break_minutes" type="number" step="1" min="0" max="480" value={formData.break_minutes} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Additional Info</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Entry Method</label>
                  <p className="text-sm text-muted-foreground">{entry.entry_method}</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                  <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Work performed, tasks completed, any issues..." />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive time entry?"
        description="This time entry will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleArchive}
      />
    </div>
  )
}
