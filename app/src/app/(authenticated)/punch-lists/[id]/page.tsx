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

interface PunchItemData {
  id: string
  company_id: string
  job_id: string
  title: string
  description: string | null
  location: string | null
  room: string | null
  status: string
  priority: string
  category: string | null
  assigned_to: string | null
  assigned_vendor_id: string | null
  due_date: string | null
  completed_at: string | null
  verified_by: string | null
  verified_at: string | null
  cost_estimate: number | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface JobLookup {
  id: string
  name: string
}

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-green-100 text-green-700',
  }
  return colors[priority] || 'bg-warm-100 text-warm-700'
}

export default function PunchItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [item, setItem] = useState<PunchItemData | null>(null)
  const [jobs, setJobs] = useState<JobLookup[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    job_id: '',
    location: '',
    room: '',
    category: '',
    priority: '',
    status: '',
    due_date: '',
    cost_estimate: '',
  })

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not authenticated'); setLoading(false); return }
      const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
      const companyId = profile?.company_id
      if (!companyId) { setError('No company found'); setLoading(false); return }
      setCompanyId(companyId)

      const [itemRes, jobsRes] = await Promise.all([
        supabase
          .from('punch_items')
          .select('*')
          .eq('id', params.id as string)
          .eq('company_id', companyId)
          .is('deleted_at', null)
          .single(),
        supabase.from('jobs').select('id, name').eq('company_id', companyId).is('deleted_at', null).order('name'),
      ])

      if (itemRes.error || !itemRes.data) {
        setError('Punch item not found')
        setLoading(false)
        return
      }

      const p = itemRes.data as PunchItemData
      setItem(p)
      setJobs((jobsRes.data as JobLookup[]) || [])
      setFormData({
        title: p.title,
        description: p.description || '',
        job_id: p.job_id,
        location: p.location || '',
        room: p.room || '',
        category: p.category || '',
        priority: p.priority,
        status: p.status,
        due_date: p.due_date || '',
        cost_estimate: p.cost_estimate != null ? String(p.cost_estimate) : '',
      })
      setLoading(false)
    }
    loadData()
  }, [params.id, supabase])

  const jobName = jobs.find((j) => j.id === item?.job_id)?.name || 'Unknown Job'

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
        .from('punch_items')
        .update({
          title: formData.title,
          description: formData.description || null,
          job_id: formData.job_id,
          location: formData.location || null,
          room: formData.room || null,
          category: formData.category || null,
          priority: formData.priority,
          status: formData.status,
          due_date: formData.due_date || null,
          cost_estimate: formData.cost_estimate ? parseFloat(formData.cost_estimate) : null,
        })
        .eq('id', params.id as string)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      setItem((prev) =>
        prev
          ? {
              ...prev,
              title: formData.title,
              description: formData.description || null,
              job_id: formData.job_id,
              location: formData.location || null,
              room: formData.room || null,
              category: formData.category || null,
              priority: formData.priority,
              status: formData.status,
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

  const handleDelete = async () => {
    if (!confirm('Archive this punch item? It can be restored later.')) return

    const { error: deleteError } = await supabase
      .from('punch_items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id as string)
      .eq('company_id', companyId)

    if (deleteError) {
      setError('Failed to archive punch item')
      return
    }

    router.push('/punch-lists')
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
        <Link href="/punch-lists" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Punch Lists
        </Link>
        <p className="text-destructive">{error || 'Punch item not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/punch-lists" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Punch Lists
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{item.title}</h1>
              <Badge className={`rounded ${getStatusColor(item.status)}`}>{item.status.replace(/_/g, ' ')}</Badge>
              <Badge className={`rounded ${getPriorityColor(item.priority)}`}>{item.priority}</Badge>
            </div>
            <p className="text-muted-foreground">{jobName}{item.location ? ` -- ${item.location}` : ''}{item.room ? ` -- ${item.room}` : ''}</p>
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
              <CardHeader><CardTitle>Item Details</CardTitle></CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Title</dt>
                    <dd className="font-medium">{item.title}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Job</dt>
                    <dd className="font-medium">{jobName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd><Badge className={`rounded ${getStatusColor(item.status)}`}>{item.status.replace(/_/g, ' ')}</Badge></dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Priority</dt>
                    <dd><Badge className={`rounded ${getPriorityColor(item.priority)}`}>{item.priority}</Badge></dd>
                  </div>
                  {item.category && (
                    <div>
                      <dt className="text-muted-foreground">Category</dt>
                      <dd className="font-medium capitalize">{item.category.replace(/_/g, ' ')}</dd>
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
                  {item.due_date && (
                    <div>
                      <dt className="text-muted-foreground">Due Date</dt>
                      <dd className="font-medium">{formatDate(item.due_date)}</dd>
                    </div>
                  )}
                  {item.cost_estimate != null && (
                    <div>
                      <dt className="text-muted-foreground">Cost Estimate</dt>
                      <dd className="font-medium">{formatCurrency(item.cost_estimate)}</dd>
                    </div>
                  )}
                  {item.completed_at && (
                    <div>
                      <dt className="text-muted-foreground">Completed</dt>
                      <dd className="font-medium">{formatDate(item.completed_at)}</dd>
                    </div>
                  )}
                  {item.verified_at && (
                    <div>
                      <dt className="text-muted-foreground">Verified</dt>
                      <dd className="font-medium">{formatDate(item.verified_at)}</dd>
                    </div>
                  )}
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
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={handleDelete}>
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
                    <label htmlFor="job_id" className="text-sm font-medium">Job <span className="text-red-500">*</span></label>
                    <select id="job_id" name="job_id" value={formData.job_id} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="">Select job...</option>
                      {jobs.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <Input id="category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Electrical, Plumbing" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="priority" className="text-sm font-medium">Priority <span className="text-red-500">*</span></label>
                    <select id="priority" name="priority" value={formData.priority} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
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
                    <label htmlFor="due_date" className="text-sm font-medium">Due Date</label>
                    <Input id="due_date" name="due_date" type="date" value={formData.due_date} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="cost_estimate" className="text-sm font-medium">Cost Estimate</label>
                    <Input id="cost_estimate" name="cost_estimate" type="number" step="0.01" value={formData.cost_estimate} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
