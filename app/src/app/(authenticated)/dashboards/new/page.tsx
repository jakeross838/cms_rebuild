'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New Dashboard' }


export default function NewDashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile, user: authUser } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    report_type: 'custom',
    visualization_type: 'table',
    status: 'draft',
    audience: 'internal',
    refresh_frequency: 'manual',
    is_template: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!authUser || !companyId) throw new Error('Not authenticated')

      const { error: insertError } = await supabase
        .from('custom_reports')
        .insert({
          company_id: companyId,
          name: formData.name,
          description: formData.description || null,
          report_type: formData.report_type,
          visualization_type: formData.visualization_type,
          status: formData.status,
          audience: formData.audience,
          refresh_frequency: formData.refresh_frequency,
          is_template: formData.is_template,
          created_by: authUser.id,
        })

      if (insertError) throw insertError

      toast.success('Report created')
      router.push('/dashboards')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create dashboard'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboards" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Dashboards
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Custom Report</h1>
        <p className="text-muted-foreground">Create a new dashboard or custom report</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        {/* Report Info */}
        <Card>
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
            <CardDescription>Name and purpose of the report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Report Name <span className="text-red-500">*</span></label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Monthly P&L Summary" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="What this report shows and who it's for..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Report type, visualization, and audience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="report_type" className="text-sm font-medium">Report Type <span className="text-red-500">*</span></label>
                <select id="report_type" name="report_type" value={formData.report_type} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {[
                    { value: 'standard', label: 'Standard' },
                    { value: 'custom', label: 'Custom' },
                  ].map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="visualization_type" className="text-sm font-medium">Visualization <span className="text-red-500">*</span></label>
                <select id="visualization_type" name="visualization_type" value={formData.visualization_type} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {[
                    { value: 'table', label: 'Table' },
                    { value: 'bar_chart', label: 'Bar Chart' },
                    { value: 'line_chart', label: 'Line Chart' },
                    { value: 'pie_chart', label: 'Pie Chart' },
                    { value: 'kpi_card', label: 'KPI Card' },
                    { value: 'gauge', label: 'Gauge' },
                    { value: 'map', label: 'Map' },
                    { value: 'timeline', label: 'Timeline' },
                    { value: 'heatmap', label: 'Heatmap' },
                  ].map((v) => (
                    <option key={v.value} value={v.value}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {[
                    { value: 'draft', label: 'Draft' },
                    { value: 'published', label: 'Published' },
                    { value: 'archived', label: 'Archived' },
                  ].map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="audience" className="text-sm font-medium">Audience <span className="text-red-500">*</span></label>
                <select id="audience" name="audience" value={formData.audience} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {[
                    { value: 'internal', label: 'Internal' },
                    { value: 'client', label: 'Client' },
                    { value: 'bank', label: 'Bank' },
                    { value: 'investor', label: 'Investor' },
                  ].map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="refresh_frequency" className="text-sm font-medium">Refresh Frequency <span className="text-red-500">*</span></label>
                <select id="refresh_frequency" name="refresh_frequency" value={formData.refresh_frequency} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {[
                    { value: 'manual', label: 'Manual' },
                    { value: 'hourly', label: 'Hourly' },
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                  ].map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input id="is_template" name="is_template" type="checkbox" checked={formData.is_template} onChange={handleChange} className="h-4 w-4 rounded border-input" />
              <label htmlFor="is_template" className="text-sm font-medium">Save as Template</label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/dashboards"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Report'}
          </Button>
        </div>
      </form>
    </div>
  )
}
