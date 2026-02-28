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

interface TimeEntryData {
  id: string
  entry_date: string
  clock_in: string | null
  clock_out: string | null
  regular_hours: number | null
  overtime_hours: number | null
  status: string
  entry_method: string | null
  notes: string | null
  break_minutes: number | null
  created_at: string
}

interface TimeEntryFormData {
  entry_date: string
  clock_in: string
  clock_out: string
  regular_hours: string
  overtime_hours: string
  status: string
  break_minutes: string
  notes: string
}

const STATUS_OPTIONS = ['pending', 'approved', 'rejected'] as const

export default function TimeClockDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const entryId = params.id as string

  const [entry, setEntry] = useState<TimeEntryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState<TimeEntryFormData>({
    entry_date: '',
    clock_in: '',
    clock_out: '',
    regular_hours: '',
    overtime_hours: '',
    status: 'pending',
    break_minutes: '',
    notes: '',
  })

  useEffect(() => {
    async function loadEntry() {
      if (!companyId) { setError('No company found'); setLoading(false); return }

      const { data, error: fetchError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('company_id', companyId)
        .eq('id', entryId)
        .single()

      if (fetchError || !data) {
        setError('Time entry not found')
        setLoading(false)
        return
      }

      const d = data as TimeEntryData
      setEntry(d)
      setFormData({
        entry_date: d.entry_date || '',
        clock_in: d.clock_in ? d.clock_in.slice(0, 16) : '',
        clock_out: d.clock_out ? d.clock_out.slice(0, 16) : '',
        regular_hours: d.regular_hours != null ? String(d.regular_hours) : '',
        overtime_hours: d.overtime_hours != null ? String(d.overtime_hours) : '',
        status: d.status || 'pending',
        break_minutes: d.break_minutes != null ? String(d.break_minutes) : '',
        notes: d.notes || '',
      })
      setLoading(false)
    }
    loadEntry()
  }, [entryId, companyId])

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
        .from('time_entries')
        .update({
          entry_date: formData.entry_date || undefined,
          clock_in: formData.clock_in || undefined,
          clock_out: formData.clock_out || undefined,
          regular_hours: formData.regular_hours ? Number(formData.regular_hours) : undefined,
          overtime_hours: formData.overtime_hours ? Number(formData.overtime_hours) : undefined,
          status: formData.status,
          break_minutes: formData.break_minutes ? Number(formData.break_minutes) : undefined,
          notes: formData.notes || undefined,
        })
        .eq('id', entryId)
        .eq('company_id', companyId)

      if (updateError) throw updateError
      toast.success('Saved')

      setEntry((prev) =>
        prev
          ? {
              ...prev,
              entry_date: formData.entry_date,
              clock_in: formData.clock_in || null,
              clock_out: formData.clock_out || null,
              regular_hours: formData.regular_hours ? Number(formData.regular_hours) : null,
              overtime_hours: formData.overtime_hours ? Number(formData.overtime_hours) : null,
              status: formData.status,
              break_minutes: formData.break_minutes ? Number(formData.break_minutes) : null,
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
    const { error: archiveError } = await supabase
      .from('time_entries')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', entryId)
      .eq('company_id', companyId)

    if (archiveError) {
      setError('Failed to archive entry')
      toast.error('Failed to archive entry')
      return
    }
    toast.success('Archived')

    router.push('/time-clock')
    router.refresh()
  }

  const totalHours = (entry?.regular_hours ?? 0) + (entry?.overtime_hours ?? 0)

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
        <Link href="/time-clock" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Time Clock
        </Link>
        <p className="text-destructive">{error || 'Time entry not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/time-clock" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Time Clock
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                Time Entry {entry.entry_date ? `- ${formatDate(entry.entry_date)}` : ''}
              </h1>
              <Badge className={`${getStatusColor(entry.status)} rounded`}>{formatStatus(entry.status)}</Badge>
            </div>
            <p className="text-muted-foreground">
              {totalHours > 0 ? `${totalHours.toFixed(1)} hours total` : 'No hours recorded'}
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
              <CardHeader><CardTitle>Entry Details</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{formatDate(entry.entry_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={`${getStatusColor(entry.status)} rounded`}>{formatStatus(entry.status)}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Clock In</p>
                    <p className="font-medium">{entry.clock_in ? formatDate(entry.clock_in) : 'Not clocked in'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Clock Out</p>
                    <p className="font-medium">{entry.clock_out ? formatDate(entry.clock_out) : 'Not clocked out'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Regular Hours</p>
                    <p className="font-medium">{entry.regular_hours != null ? `${entry.regular_hours}h` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Overtime Hours</p>
                    <p className="font-medium">{entry.overtime_hours != null ? `${entry.overtime_hours}h` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Break Time</p>
                    <p className="font-medium">{entry.break_minutes != null ? `${entry.break_minutes} min` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Entry Method</p>
                    <p className="font-medium">{entry.entry_method ? formatStatus(entry.entry_method) : 'Manual'}</p>
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
                <CardTitle>Entry Details</CardTitle>
                <CardDescription>Update time entry information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="entry_date" className="text-sm font-medium">Date</label>
                    <Input id="entry_date" name="entry_date" type="date" value={formData.entry_date} onChange={handleChange} />
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
                    <label htmlFor="clock_in" className="text-sm font-medium">Clock In</label>
                    <Input id="clock_in" name="clock_in" type="datetime-local" value={formData.clock_in} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="clock_out" className="text-sm font-medium">Clock Out</label>
                    <Input id="clock_out" name="clock_out" type="datetime-local" value={formData.clock_out} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="regular_hours" className="text-sm font-medium">Regular Hours</label>
                    <Input id="regular_hours" name="regular_hours" type="number" step="0.1" value={formData.regular_hours} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="overtime_hours" className="text-sm font-medium">Overtime Hours</label>
                    <Input id="overtime_hours" name="overtime_hours" type="number" step="0.1" value={formData.overtime_hours} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="break_minutes" className="text-sm font-medium">Break (minutes)</label>
                    <Input id="break_minutes" name="break_minutes" type="number" value={formData.break_minutes} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardContent>
                <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={4} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Time entry notes..." />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive time entry?"
        description="This time entry will be archived. It can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
