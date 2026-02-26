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

// ── Types ──────────────────────────────────────────────────────

interface SelectionData {
  id: string
  status: string
  room: string | null
  selected_at: string | null
  confirmed_at: string | null
  category_id: string
  option_id: string
  created_at: string
}

interface SelectionFormData {
  status: string
  room: string
  selected_at: string
  confirmed_at: string
  category_id: string
  option_id: string
}

const STATUS_OPTIONS = ['pending', 'selected', 'confirmed', 'rejected']

// ── Component ──────────────────────────────────────────────────

export default function SelectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const jobId = params.id as string
  const selectionId = params.selectionId as string

  const [selection, setSelection] = useState<SelectionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')

  const [formData, setFormData] = useState<SelectionFormData>({
    status: 'pending',
    room: '',
    selected_at: '',
    confirmed_at: '',
    category_id: '',
    option_id: '',
  })

  useEffect(() => {
    async function loadSelection() {
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
        .from('selections')
        .select('*')
        .eq('id', selectionId)
        .eq('job_id', jobId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Selection not found')
        setLoading(false)
        return
      }

      const s = data as SelectionData
      setSelection(s)
      setFormData({
        status: s.status,
        room: s.room || '',
        selected_at: s.selected_at || '',
        confirmed_at: s.confirmed_at || '',
        category_id: s.category_id,
        option_id: s.option_id,
      })
      setLoading(false)
    }
    loadSelection()
  }, [selectionId, jobId, supabase])

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
        .from('selections')
        .update({
          status: formData.status,
          room: formData.room || null,
          selected_at: formData.selected_at || null,
          confirmed_at: formData.confirmed_at || null,
          category_id: formData.category_id,
          option_id: formData.option_id,
        })
        .eq('id', selectionId)
        .eq('job_id', jobId)

      if (updateError) throw updateError

      setSelection((prev) =>
        prev
          ? {
              ...prev,
              status: formData.status,
              room: formData.room || null,
              selected_at: formData.selected_at || null,
              confirmed_at: formData.confirmed_at || null,
              category_id: formData.category_id,
              option_id: formData.option_id,
            }
          : prev
      )
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError((err as Error)?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const { error: deleteError } = await supabase
      .from('selections')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', selectionId)
      .eq('job_id', jobId)

    if (deleteError) {
      setError('Failed to archive selection')
      return
    }

    router.push(`/jobs/${jobId}/selections`)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!selection) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href={`/jobs/${jobId}/selections`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Selections
        </Link>
        <p className="text-destructive">{error || 'Selection not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/selections`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Selections
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                Selection
              </h1>
              <Badge className={getStatusColor(selection.status)}>
                {selection.status}
              </Badge>
              {selection.room && (
                <Badge variant="outline" className="text-xs">{selection.room}</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {selection.selected_at ? `Selected ${formatDate(selection.selected_at)}` : 'Not yet selected'}
              {selection.confirmed_at ? ` - Confirmed ${formatDate(selection.confirmed_at)}` : ''}
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Selection updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Selection Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <p className="font-medium capitalize">{selection.status}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Room</span>
                    <p className="font-medium">{selection.room || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category ID</span>
                    <p className="font-medium font-mono text-xs">{selection.category_id}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Option ID</span>
                    <p className="font-medium font-mono text-xs">{selection.option_id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Selected At</span>
                    <p className="font-medium">{selection.selected_at ? formatDate(selection.selected_at) : 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confirmed At</span>
                    <p className="font-medium">{selection.confirmed_at ? formatDate(selection.confirmed_at) : 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created</span>
                    <p className="font-medium">{formatDate(selection.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Selection
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Selection Information</CardTitle>
                <CardDescription>Update selection details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="room" className="text-sm font-medium">Room</label>
                    <Input id="room" name="room" value={formData.room} onChange={handleChange} placeholder="e.g., Master Bathroom, Kitchen" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="category_id" className="text-sm font-medium">Category ID <span className="text-red-500">*</span></label>
                    <Input id="category_id" name="category_id" value={formData.category_id} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="option_id" className="text-sm font-medium">Option ID <span className="text-red-500">*</span></label>
                    <Input id="option_id" name="option_id" value={formData.option_id} onChange={handleChange} required />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="selected_at" className="text-sm font-medium">Selected At</label>
                    <Input id="selected_at" name="selected_at" type="date" value={formData.selected_at} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirmed_at" className="text-sm font-medium">Confirmed At</label>
                    <Input id="confirmed_at" name="confirmed_at" type="date" value={formData.confirmed_at} onChange={handleChange} />
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
        title="Archive selection?"
        description="This selection will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
