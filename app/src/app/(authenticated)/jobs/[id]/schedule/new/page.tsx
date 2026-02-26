'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function NewScheduleTaskPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phase: '',
    trade: '',
    task_type: 'task',
    planned_start: '',
    planned_end: '',
    duration_days: '',
    status: 'not_started',
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      const companyId = (profile as { company_id: string } | null)?.company_id
      if (!companyId) throw new Error('No company found')

      const { error: insertError } = await supabase
        .from('schedule_tasks')
        .insert({
          company_id: companyId,
          job_id: jobId,
          name: formData.name,
          description: formData.description || null,
          phase: formData.phase || null,
          trade: formData.trade || null,
          task_type: formData.task_type,
          planned_start: formData.planned_start || null,
          planned_end: formData.planned_end || null,
          duration_days: formData.duration_days ? parseInt(formData.duration_days) : null,
          status: formData.status,
          notes: formData.notes || null,
          created_by: user.id,
        })

      if (insertError) throw insertError

      router.push(`/jobs/${jobId}/schedule`)
      router.refresh()
    } catch (err) {
      setError((err as Error)?.message || 'Failed to create schedule task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/schedule`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Schedule
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Schedule Task</h1>
        <p className="text-muted-foreground">Add a new task to the project schedule</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
            <CardDescription>Name, phase, and trade information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Task Name <span className="text-red-500">*</span></label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Pour foundation footings" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="phase" className="text-sm font-medium">Phase</label>
                <Input id="phase" name="phase" value={formData.phase} onChange={handleChange} placeholder="e.g., Foundation" />
              </div>
              <div className="space-y-2">
                <label htmlFor="trade" className="text-sm font-medium">Trade</label>
                <Input id="trade" name="trade" value={formData.trade} onChange={handleChange} placeholder="e.g., Concrete" />
              </div>
              <div className="space-y-2">
                <label htmlFor="task_type" className="text-sm font-medium">Type</label>
                <select id="task_type" name="task_type" value={formData.task_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="task">Task</option>
                  <option value="milestone">Milestone</option>
                  <option value="summary">Summary</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>Dates, duration, and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="planned_start" className="text-sm font-medium">Planned Start</label>
                <Input id="planned_start" name="planned_start" type="date" value={formData.planned_start} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="planned_end" className="text-sm font-medium">Planned End</label>
                <Input id="planned_end" name="planned_end" type="date" value={formData.planned_end} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="duration_days" className="text-sm font-medium">Duration (days)</label>
                <Input id="duration_days" name="duration_days" type="number" min="1" value={formData.duration_days} onChange={handleChange} placeholder="e.g., 5" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Description &amp; Notes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Describe the scope of this task..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">Notes</label>
              <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={2} placeholder="Additional notes..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href={`/jobs/${jobId}/schedule`}><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Task'}
          </Button>
        </div>
      </form>
    </div>
  )
}
