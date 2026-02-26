'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function NewTimeEntryPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    entry_date: today,
    regular_hours: '',
    overtime_hours: '',
    break_minutes: '',
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

      // Verify job belongs to company
      const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
      if (!jobCheck) throw new Error('Job not found or access denied')

      const { error: insertError } = await supabase
        .from('time_entries')
        .insert({
          company_id: companyId,
          user_id: user.id,
          job_id: jobId,
          entry_date: formData.entry_date,
          regular_hours: formData.regular_hours ? parseFloat(formData.regular_hours) : 0,
          overtime_hours: formData.overtime_hours ? parseFloat(formData.overtime_hours) : 0,
          break_minutes: formData.break_minutes ? parseInt(formData.break_minutes, 10) : 0,
          notes: formData.notes || null,
          status: 'pending',
          entry_method: 'manual',
        })

      if (insertError) throw insertError

      router.push(`/jobs/${jobId}/time-clock`)
      router.refresh()
    } catch (err) {
      setError((err as Error)?.message || 'Failed to create time entry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/time-clock`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Time Clock
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Time Entry</h1>
        <p className="text-muted-foreground">Record hours worked for this job</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Entry Details</CardTitle>
            <CardDescription>Date and hours information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="entry_date" className="text-sm font-medium">Date <span className="text-red-500">*</span></label>
              <Input id="entry_date" name="entry_date" type="date" value={formData.entry_date} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="regular_hours" className="text-sm font-medium">Regular Hours</label>
                <Input id="regular_hours" name="regular_hours" type="number" step="0.1" min="0" max="24" value={formData.regular_hours} onChange={handleChange} placeholder="e.g., 8.0" />
              </div>
              <div className="space-y-2">
                <label htmlFor="overtime_hours" className="text-sm font-medium">Overtime Hours</label>
                <Input id="overtime_hours" name="overtime_hours" type="number" step="0.1" min="0" max="24" value={formData.overtime_hours} onChange={handleChange} placeholder="e.g., 1.5" />
              </div>
              <div className="space-y-2">
                <label htmlFor="break_minutes" className="text-sm font-medium">Break (minutes)</label>
                <Input id="break_minutes" name="break_minutes" type="number" step="1" min="0" max="480" value={formData.break_minutes} onChange={handleChange} placeholder="e.g., 30" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={4} placeholder="Work performed, tasks completed, any issues..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href={`/jobs/${jobId}/time-clock`}><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Time Entry'}
          </Button>
        </div>
      </form>
    </div>
  )
}
