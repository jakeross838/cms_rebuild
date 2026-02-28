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
import { usePunchItem, useUpdatePunchItem, useDeletePunchItem } from '@/hooks/use-punch-lists'
import { formatDate, getStatusColor, formatStatus } from '@/lib/utils'
import { toast } from 'sonner'

// -- Types ------------------------------------------------------------------

interface PunchItemData {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  category: string | null
  location: string | null
  room: string | null
  assigned_to: string | null
  due_date: string | null
  completed_at: string | null
  created_at: string
}

interface PunchItemFormData {
  title: string
  description: string
  status: string
  priority: string
  category: string
  location: string
  room: string
  assigned_to: string
  due_date: string
}

const STATUS_OPTIONS = ['open', 'in_progress', 'completed', 'verified', 'rejected'] as const
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical'] as const

// -- Component --------------------------------------------------------------

export default function JobPunchItemDetailPage() {
  const params = useParams()
  const router = useRouter()

  const jobId = params.id as string
  const itemId = params.itemId as string

  const { data: response, isLoading: loading, error: fetchError } = usePunchItem(itemId)
  const updatePunchItem = useUpdatePunchItem(itemId)
  const deletePunchItem = useDeletePunchItem()
  const item = (response as { data: PunchItemData } | undefined)?.data ?? null

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState<PunchItemFormData>({
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
    category: '',
    location: '',
    room: '',
    assigned_to: '',
    due_date: '',
  })

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        description: item.description || '',
        status: item.status || 'open',
        priority: item.priority || 'medium',
        category: item.category || '',
        location: item.location || '',
        room: item.room || '',
        assigned_to: item.assigned_to || '',
        due_date: item.due_date || '',
      })
    }
  }, [item])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.title.trim()) { toast.error('Title is required'); return }
    if (!formData.status) { toast.error('Status is required'); return }
    if (!formData.priority) { toast.error('Priority is required'); return }
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await updatePunchItem.mutateAsync({
        title: formData.title,
        description: formData.description || null,
        status: formData.status,
        priority: formData.priority,
        category: formData.category || null,
        location: formData.location || null,
        room: formData.room || null,
        assigned_to: formData.assigned_to || null,
        due_date: formData.due_date || null,
      } as never)
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
    try {
      await deletePunchItem.mutateAsync(itemId)
      toast.success('Archived')
      router.push(`/jobs/${jobId}/punch-list`)
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

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href={`/jobs/${jobId}/punch-list`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Punch List
        </Link>
        <p className="text-destructive">{error || 'Punch item not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/punch-list`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Punch List
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{item.title}</h1>
              <Badge className={`rounded ${getStatusColor(item.status)}`}>{formatStatus(item.status)}</Badge>
              <Badge className={`rounded ${getStatusColor(item.priority)}`}>{formatStatus(item.priority)}</Badge>
            </div>
            <p className="text-muted-foreground">
              {item.location ? `${item.location}` : ''}
              {item.location && item.room ? ' -- ' : ''}
              {item.room ? `${item.room}` : ''}
              {!item.location && !item.room ? `Created ${formatDate(item.created_at)}` : ''}
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Punch item updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Title</dt>
                    <dd className="font-medium">{item.title}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd><Badge className={`rounded ${getStatusColor(item.status)}`}>{formatStatus(item.status)}</Badge></dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Priority</dt>
                    <dd><Badge className={`rounded ${getStatusColor(item.priority)}`}>{formatStatus(item.priority)}</Badge></dd>
                  </div>
                  {item.category && (
                    <div>
                      <dt className="text-muted-foreground">Category</dt>
                      <dd className="font-medium">{formatStatus(item.category)}</dd>
                    </div>
                  )}
                  {item.location && (
                    <div>
                      <dt className="text-muted-foreground">Location</dt>
                      <dd className="font-medium">{item.location}</dd>
                    </div>
                  )}
                  {item.room && (
                    <div>
                      <dt className="text-muted-foreground">Room</dt>
                      <dd className="font-medium">{item.room}</dd>
                    </div>
                  )}
                  {item.assigned_to && (
                    <div>
                      <dt className="text-muted-foreground">Assigned To</dt>
                      <dd className="font-medium">{item.assigned_to}</dd>
                    </div>
                  )}
                  {item.due_date && (
                    <div>
                      <dt className="text-muted-foreground">Due Date</dt>
                      <dd className="font-medium">{formatDate(item.due_date)}</dd>
                    </div>
                  )}
                  {item.completed_at && (
                    <div>
                      <dt className="text-muted-foreground">Completed</dt>
                      <dd className="font-medium">{formatDate(item.completed_at)}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="font-medium">{formatDate(item.created_at)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {item.description && (
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.description}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Item
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Item Information</CardTitle>
                <CardDescription>Update punch item details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                  <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{formatStatus(s)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="priority" className="text-sm font-medium">Priority <span className="text-red-500">*</span></label>
                    <select id="priority" name="priority" value={formData.priority} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p} value={p}>{formatStatus(p)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">Location</label>
                    <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Building A, Floor 2" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="room" className="text-sm font-medium">Room</label>
                    <Input id="room" name="room" value={formData.room} onChange={handleChange} placeholder="e.g., Master Bath, Kitchen" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <Input id="category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Electrical, Plumbing" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="assigned_to" className="text-sm font-medium">Assigned To</label>
                    <Input id="assigned_to" name="assigned_to" value={formData.assigned_to} onChange={handleChange} placeholder="Name or ID" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="due_date" className="text-sm font-medium">Due Date</label>
                  <Input id="due_date" name="due_date" type="date" value={formData.due_date} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive punch item?"
        description="This punch item will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleArchive}
      />
    </div>
  )
}
