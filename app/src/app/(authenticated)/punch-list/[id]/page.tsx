'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────

interface PunchItemData {
  id: string
  title: string | null
  description: string | null
  location: string | null
  room: string | null
  status: string | null
  priority: string | null
  category: string | null
  due_date: string | null
  cost_estimate: number | null
  created_at: string | null
}

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    Low: 'bg-warm-100 text-warm-700',
    Medium: 'bg-info-bg text-info-dark',
    High: 'bg-warning-bg text-warning-dark',
    Urgent: 'bg-danger-bg text-danger-dark',
  }
  return colors[priority] || 'bg-warm-100 text-warm-700'
}

// ── Component ──────────────────────────────────────────────────

export default function PunchItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const itemId = params.id as string

  const [item, setItem] = useState<PunchItemData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    room: '',
    status: '',
    priority: '',
    category: '',
    due_date: '',
    cost_estimate: '',
  })

  useEffect(() => {
    async function loadItem() {
      const { data, error: fetchError } = await supabase
        .from('punch_items')
        .select('*')
        .eq('id', itemId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Punch item not found')
        setLoading(false)
        return
      }

      const p = data as PunchItemData
      setItem(p)
      setFormData({
        title: p.title || '',
        description: p.description || '',
        location: p.location || '',
        room: p.room || '',
        status: p.status || 'Open',
        priority: p.priority || 'Medium',
        category: p.category || '',
        due_date: p.due_date || '',
        cost_estimate: p.cost_estimate != null ? String(p.cost_estimate) : '',
      })
      setLoading(false)
    }
    loadItem()
  }, [itemId, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('punch_items')
        .update({
          title: formData.title,
          description: formData.description || null,
          location: formData.location || null,
          room: formData.room || null,
          status: formData.status,
          priority: formData.priority,
          category: formData.category || null,
          due_date: formData.due_date || null,
          cost_estimate: formData.cost_estimate ? parseFloat(formData.cost_estimate) : null,
        })
        .eq('id', itemId)

      if (updateError) throw updateError

      setItem((prev) =>
        prev
          ? {
              ...prev,
              title: formData.title,
              description: formData.description || null,
              location: formData.location || null,
              room: formData.room || null,
              status: formData.status,
              priority: formData.priority,
              category: formData.category || null,
              due_date: formData.due_date || null,
              cost_estimate: formData.cost_estimate ? parseFloat(formData.cost_estimate) : null,
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

  const handleArchive = async () => {
    if (!confirm('Archive this punch item? It can be restored later.')) return

    const { error: deleteError } = await supabase
      .from('punch_items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', itemId)

    if (deleteError) {
      setError('Failed to archive punch item')
      return
    }

    router.push('/punch-list')
    router.refresh()
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
        <Link href="/punch-list" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Punch List
        </Link>
        <p className="text-destructive">{error || 'Punch item not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/punch-list" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Punch List
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{item.title || 'Untitled'}</h1>
            <p className="text-muted-foreground">
              Created {formatDate(item.created_at)}
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
                <CardTitle>Punch Item Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Title</span>
                    <p className="font-medium">{item.title || 'Untitled'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <p className="font-medium">
                      <Badge className={`${getStatusColor(item.status ?? 'Open')} rounded`}>{item.status || 'Open'}</Badge>
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Priority</span>
                    <p className="font-medium">
                      {item.priority ? (
                        <Badge className={`${getPriorityColor(item.priority)} rounded`}>{item.priority}</Badge>
                      ) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location</span>
                    <p className="font-medium">{item.location || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Room</span>
                    <p className="font-medium">{item.room || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category</span>
                    <p className="font-medium">{item.category || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Due Date</span>
                    <p className="font-medium">{item.due_date ? formatDate(item.due_date) : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cost Estimate</span>
                    <p className="font-medium">{item.cost_estimate != null ? formatCurrency(item.cost_estimate) : 'N/A'}</p>
                  </div>
                </div>
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
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={handleArchive}>
                Archive Punch Item
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Punch Item Information</CardTitle>
                <CardDescription>Update punch item details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                  <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {['Open', 'In Progress', 'Completed', 'Verified'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                    <select id="priority" name="priority" value={formData.priority} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {['Low', 'Medium', 'High', 'Urgent'].map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">Location</label>
                    <Input id="location" name="location" value={formData.location} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="room" className="text-sm font-medium">Room</label>
                    <Input id="room" name="room" value={formData.room} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <Input id="category" name="category" value={formData.category} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="due_date" className="text-sm font-medium">Due Date</label>
                    <Input id="due_date" name="due_date" type="date" value={formData.due_date} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="cost_estimate" className="text-sm font-medium">Cost Estimate</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input id="cost_estimate" name="cost_estimate" type="number" step="0.01" value={formData.cost_estimate} onChange={handleChange} placeholder="0.00" className="pl-7" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Description</CardTitle></CardHeader>
              <CardContent>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe the issue in detail..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
