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

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Daily Log Details' }


// -- Types ------------------------------------------------------------------

interface DailyLogData {
  id: string
  log_date: string | null
  status: string | null
  weather_summary: string | null
  high_temp: number | null
  low_temp: number | null
  notes: string | null
  conditions: string | null
  created_at: string | null
}

interface DailyLogFormData {
  log_date: string
  status: string
  weather_summary: string
  high_temp: string
  low_temp: string
  notes: string
  conditions: string
}

const STATUS_OPTIONS = ['draft', 'submitted', 'approved', 'rejected'] as const

// -- Component --------------------------------------------------------------

export default function DailyLogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const jobId = params.id as string
  const logId = params.logId as string

  const [log, setLog] = useState<DailyLogData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState<DailyLogFormData>({
    log_date: '',
    status: 'draft',
    weather_summary: '',
    high_temp: '',
    low_temp: '',
    notes: '',
    conditions: '',
  })

  useEffect(() => {
    async function loadLog() {
      if (!companyId) { setError('No company found'); setLoading(false); return }

      // Verify job belongs to company
      const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
      if (!jobCheck) { setError('Job not found'); setLoading(false); return }

      const { data, error: fetchError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('id', logId)
        .eq('job_id', jobId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Daily log not found')
        setLoading(false)
        return
      }

      const d = data as DailyLogData
      setLog(d)
      setFormData({
        log_date: d.log_date || '',
        status: d.status || 'draft',
        weather_summary: d.weather_summary || '',
        high_temp: d.high_temp != null ? String(d.high_temp) : '',
        low_temp: d.low_temp != null ? String(d.low_temp) : '',
        notes: d.notes || '',
        conditions: d.conditions || '',
      })
      setLoading(false)
    }
    loadLog()
  }, [jobId, logId, supabase, companyId])

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
        .from('daily_logs')
        .update({
          log_date: formData.log_date || undefined,
          status: formData.status || 'draft',
          weather_summary: formData.weather_summary || undefined,
          high_temp: formData.high_temp ? Number(formData.high_temp) : undefined,
          low_temp: formData.low_temp ? Number(formData.low_temp) : undefined,
          notes: formData.notes || undefined,
          conditions: formData.conditions || undefined,
        })
        .eq('id', logId)
        .eq('job_id', jobId)
        .eq('company_id', companyId)

      if (updateError) throw updateError
      toast.success('Saved')

      setLog((prev) =>
        prev
          ? {
              ...prev,
              log_date: formData.log_date || null,
              status: formData.status,
              weather_summary: formData.weather_summary || null,
              high_temp: formData.high_temp ? Number(formData.high_temp) : null,
              low_temp: formData.low_temp ? Number(formData.low_temp) : null,
              notes: formData.notes || null,
              conditions: formData.conditions || null,
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

  const handleArchive = async () => {
    const { error: deleteError } = await supabase
      .from('daily_logs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', logId)
      .eq('job_id', jobId)
      .eq('company_id', companyId)

    if (deleteError) {
      setError('Failed to archive daily log')
      toast.error('Failed to archive daily log')
      return
    }
    toast.success('Archived')

    router.push(`/jobs/${jobId}/daily-logs`)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!log) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href={`/jobs/${jobId}/daily-logs`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Daily Logs
        </Link>
        <p className="text-destructive">{error || 'Daily log not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/daily-logs`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Daily Logs
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                Daily Log {log.log_date ? `- ${formatDate(log.log_date)}` : ''}
              </h1>
              <Badge className={`${getStatusColor(log.status ?? 'draft')} rounded`}>
                {(log.status ?? 'draft').replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Created {log.created_at ? formatDate(log.created_at) : 'Unknown'}
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Daily log updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Log Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{log.log_date ? formatDate(log.log_date) : 'No date'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={`${getStatusColor(log.status ?? 'draft')} rounded`}>
                      {(log.status ?? 'draft').replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weather</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Summary</p>
                    <p className="font-medium">{log.weather_summary || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">High Temp</p>
                    <p className="font-medium">{log.high_temp != null ? `${log.high_temp}\u00B0F` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Low Temp</p>
                    <p className="font-medium">{log.low_temp != null ? `${log.low_temp}\u00B0F` : 'N/A'}</p>
                  </div>
                </div>
                {log.conditions && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">Conditions</p>
                    <p className="font-medium">{log.conditions}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {log.notes && (
              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{log.notes}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Log
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Log Details</CardTitle>
                <CardDescription>Update daily log information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="log_date" className="text-sm font-medium">Date</label>
                    <Input id="log_date" name="log_date" type="date" value={formData.log_date} onChange={handleChange} />
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weather</CardTitle>
                <CardDescription>Record weather conditions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="weather_summary" className="text-sm font-medium">Weather Summary</label>
                  <Input id="weather_summary" name="weather_summary" value={formData.weather_summary} onChange={handleChange} placeholder="e.g., Sunny, Partly Cloudy, Rain" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="high_temp" className="text-sm font-medium">High Temp (\u00B0F)</label>
                    <Input id="high_temp" name="high_temp" type="number" value={formData.high_temp} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="low_temp" className="text-sm font-medium">Low Temp (\u00B0F)</label>
                    <Input id="low_temp" name="low_temp" type="number" value={formData.low_temp} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="conditions" className="text-sm font-medium">Conditions</label>
                  <Input id="conditions" name="conditions" value={formData.conditions} onChange={handleChange} placeholder="e.g., Clear skies, light wind" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardContent>
                <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={4} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Daily activity notes..." />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive daily log?"
        description="This daily log will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleArchive}
      />
    </div>
  )
}
