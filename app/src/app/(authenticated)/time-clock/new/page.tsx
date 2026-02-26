'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function NewTimeEntryPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Dropdown data ──────────────────────────────────────────────
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([])
  const [jobs, setJobs] = useState<{ id: string; name: string }[]>([])
  const [currentUserId, setCurrentUserId] = useState('')

  const [formData, setFormData] = useState({
    user_id: '',
    job_id: '',
    entry_date: new Date().toISOString().split('T')[0],
    clock_in: '',
    clock_out: '',
    regular_hours: '',
    overtime_hours: '',
    break_minutes: '0',
    entry_method: 'manual',
    status: 'pending',
    notes: '',
  })

  useEffect(() => {
    async function loadDropdowns() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setCurrentUserId(user.id)

      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      const companyId = (profile as { company_id: string } | null)?.company_id
      if (!companyId) return

      const [employeesRes, jobsRes] = await Promise.all([
        supabase.from('users').select('id, name').eq('company_id', companyId).order('name'),
        supabase.from('jobs').select('id, name').eq('company_id', companyId).is('deleted_at', null).order('name'),
      ])

      if (employeesRes.data) setEmployees(employeesRes.data)
      if (jobsRes.data) setJobs(jobsRes.data)

      // Default employee to current user
      setFormData((prev) => ({ ...prev, user_id: user.id }))
    }
    loadDropdowns()
  }, [])

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
        .from('time_entries')
        .insert({
          company_id: companyId,
          user_id: formData.user_id || currentUserId,
          job_id: formData.job_id,
          entry_date: formData.entry_date,
          clock_in: formData.clock_in ? new Date(formData.clock_in).toISOString() : null,
          clock_out: formData.clock_out ? new Date(formData.clock_out).toISOString() : null,
          regular_hours: formData.regular_hours ? parseFloat(formData.regular_hours) : 0,
          overtime_hours: formData.overtime_hours ? parseFloat(formData.overtime_hours) : 0,
          break_minutes: parseInt(formData.break_minutes) || 0,
          entry_method: formData.entry_method,
          status: formData.status,
          notes: formData.notes || null,
        })

      if (insertError) throw insertError

      toast.success('Time entry created')
      router.push('/time-clock')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create time entry'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/time-clock" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Time Clock
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Time Entry</h1>
        <p className="text-muted-foreground">Log a manual time entry</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Time Entry Details</CardTitle>
            <CardDescription>Employee, job, and date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="user_id" className="text-sm font-medium">Employee <span className="text-red-500">*</span></label>
                <select id="user_id" name="user_id" value={formData.user_id} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select an employee...</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.name}{e.id === currentUserId ? ' (You)' : ''}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="job_id" className="text-sm font-medium">Job <span className="text-red-500">*</span></label>
                <select id="job_id" name="job_id" value={formData.job_id} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select a job...</option>
                  {jobs.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="entry_date" className="text-sm font-medium">Entry Date <span className="text-red-500">*</span></label>
                <Input id="entry_date" name="entry_date" type="date" value={formData.entry_date} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="entry_method" className="text-sm font-medium">Entry Method</label>
                <select id="entry_method" name="entry_method" value={formData.entry_method} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {[
                    { value: 'manual', label: 'Manual' },
                    { value: 'mobile', label: 'Mobile' },
                    { value: 'kiosk', label: 'Kiosk' },
                    { value: 'superintendent', label: 'Superintendent' },
                  ].map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {[
                    { value: 'pending', label: 'Pending' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'rejected', label: 'Rejected' },
                    { value: 'exported', label: 'Exported' },
                  ].map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clock Times & Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Clock Times & Hours</CardTitle>
            <CardDescription>Enter clock in/out or hours directly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="regular_hours" className="text-sm font-medium">Regular Hours</label>
                <Input id="regular_hours" name="regular_hours" type="number" step="0.25" min="0" value={formData.regular_hours} onChange={handleChange} placeholder="0" />
              </div>
              <div className="space-y-2">
                <label htmlFor="overtime_hours" className="text-sm font-medium">Overtime Hours</label>
                <Input id="overtime_hours" name="overtime_hours" type="number" step="0.25" min="0" value={formData.overtime_hours} onChange={handleChange} placeholder="0" />
              </div>
              <div className="space-y-2">
                <label htmlFor="break_minutes" className="text-sm font-medium">Break (minutes)</label>
                <Input id="break_minutes" name="break_minutes" type="number" min="0" value={formData.break_minutes} onChange={handleChange} placeholder="0" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Work performed, tasks completed, etc..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/time-clock"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Time Entry'}
          </Button>
        </div>
      </form>
    </div>
  )
}
