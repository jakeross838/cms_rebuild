'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function NewDailyLogPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const supabase = createClient()

  const { profile: authProfile, user: authUser } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    log_date: today,
    weather_summary: '',
    high_temp: '',
    low_temp: '',
    conditions: '',
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
      if (!authUser || !companyId) throw new Error('Not authenticated')
      if (!formData.log_date) { setError('Date is required'); setLoading(false); return }

      // Verify job belongs to company
      const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
      if (!jobCheck) throw new Error('Job not found or access denied')

      const { error: insertError } = await supabase
        .from('daily_logs')
        .insert({
          company_id: companyId,
          job_id: jobId,
          log_date: formData.log_date,
          weather_summary: formData.weather_summary || null,
          high_temp: formData.high_temp ? parseFloat(formData.high_temp) : null,
          low_temp: formData.low_temp ? parseFloat(formData.low_temp) : null,
          conditions: formData.conditions || null,
          notes: formData.notes || null,
          created_by: authUser.id,
        })

      if (insertError) throw insertError

      toast.success('Daily log created')
      router.push(`/jobs/${jobId}/daily-logs`)
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create daily log'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/daily-logs`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Daily Logs
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Daily Log</h1>
        <p className="text-muted-foreground">Record the day&apos;s activity for this job</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Log Details</CardTitle>
            <CardDescription>Date and general information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="log_date" className="text-sm font-medium">Date <span className="text-red-500">*</span></label>
              <Input id="log_date" name="log_date" type="date" value={formData.log_date} onChange={handleChange} required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weather</CardTitle>
            <CardDescription>Weather conditions for the day</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="weather_summary" className="text-sm font-medium">Weather Summary</label>
              <Input id="weather_summary" name="weather_summary" value={formData.weather_summary} onChange={handleChange} placeholder="e.g., Sunny and clear" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="high_temp" className="text-sm font-medium">High Temp (&deg;F)</label>
                <Input id="high_temp" name="high_temp" type="number" value={formData.high_temp} onChange={handleChange} placeholder="e.g., 85" />
              </div>
              <div className="space-y-2">
                <label htmlFor="low_temp" className="text-sm font-medium">Low Temp (&deg;F)</label>
                <Input id="low_temp" name="low_temp" type="number" value={formData.low_temp} onChange={handleChange} placeholder="e.g., 65" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="conditions" className="text-sm font-medium">Conditions</label>
              <select id="conditions" name="conditions" value={formData.conditions} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">Select conditions...</option>
                <option value="clear">Clear</option>
                <option value="partly_cloudy">Partly Cloudy</option>
                <option value="cloudy">Cloudy</option>
                <option value="rain">Rain</option>
                <option value="heavy_rain">Heavy Rain</option>
                <option value="snow">Snow</option>
                <option value="wind">Wind</option>
                <option value="fog">Fog</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={5} placeholder="Work performed, crew activity, delays, safety issues..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href={`/jobs/${jobId}/daily-logs`}><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Daily Log'}
          </Button>
        </div>
      </form>
    </div>
  )
}
