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
import { formatDate, formatStatus } from '@/lib/utils'
import { toast } from 'sonner'

interface ReportData {
  id: string
  name: string
  description: string | null
  report_type: string
  visualization_type: string
  status: string
  audience: string
  refresh_frequency: string
  is_template: boolean
  created_at: string
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'published': return 'default'
    case 'draft': return 'secondary'
    case 'archived': return 'outline'
    default: return 'default'
  }
}

export default function DashboardDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

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

  useEffect(() => {
    async function load() {
      if (!companyId) { setError('No company found'); setLoading(false); return }
      const { data, error: fetchError } = await supabase
        .from('custom_reports')
        .select('*')
        .eq('id', params.id as string)
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Dashboard not found')
        setLoading(false)
        return
      }

      const r = data as ReportData
      setReport(r)
      setFormData({
        name: r.name,
        description: r.description || '',
        report_type: r.report_type,
        visualization_type: r.visualization_type,
        status: r.status,
        audience: r.audience,
        refresh_frequency: r.refresh_frequency,
        is_template: r.is_template,
      })
      setLoading(false)
    }
    load()
  }, [params.id, supabase, companyId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('custom_reports')
        .update({
          name: formData.name,
          description: formData.description || null,
          report_type: formData.report_type,
          visualization_type: formData.visualization_type,
          status: formData.status,
          audience: formData.audience,
          refresh_frequency: formData.refresh_frequency,
          is_template: formData.is_template,
        })
        .eq('id', params.id as string)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      toast.success('Saved')
      setReport((prev) => prev ? {
        ...prev,
        name: formData.name,
        description: formData.description || null,
        report_type: formData.report_type,
        visualization_type: formData.visualization_type,
        status: formData.status,
        audience: formData.audience,
        refresh_frequency: formData.refresh_frequency,
        is_template: formData.is_template,
      } : prev)
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

  const handleDelete = async () => {
    const { error: deleteError } = await supabase
      .from('custom_reports')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id as string)
      .eq('company_id', companyId)

    if (deleteError) {
      setError('Failed to archive dashboard')
      toast.error('Failed to archive dashboard')
      return
    }

    toast.success('Archived')
    router.push('/dashboards')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboards" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Dashboards
        </Link>
        <p className="text-destructive">{error || 'Dashboard not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboards" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Dashboards
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{report.name}</h1>
              <Badge variant={statusVariant(report.status)}>{formatStatus(report.status)}</Badge>
            </div>
            <p className="text-muted-foreground">
              {report.visualization_type} &middot; {report.audience}
              {report.is_template && ' \u00b7 Template'}
              {' \u00b7 Created '}
              {formatDate(report.created_at)}
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Dashboard updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
                {report.description ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No description</p>
                )}
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4">
                  <div>
                    <dt className="text-muted-foreground">Report Type</dt>
                    <dd className="font-medium capitalize">{report.report_type}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Visualization</dt>
                    <dd className="font-medium capitalize">{report.visualization_type.replace('_', ' ')}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Audience</dt>
                    <dd className="font-medium capitalize">{report.audience}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Refresh</dt>
                    <dd className="font-medium capitalize">{report.refresh_frequency}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Dashboard
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Report Details</CardTitle>
                <CardDescription>Update dashboard information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="report_type" className="text-sm font-medium">Report Type</label>
                    <select id="report_type" name="report_type" value={formData.report_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="standard">Standard</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="visualization_type" className="text-sm font-medium">Visualization</label>
                    <select id="visualization_type" name="visualization_type" value={formData.visualization_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="table">Table</option>
                      <option value="bar_chart">Bar Chart</option>
                      <option value="line_chart">Line Chart</option>
                      <option value="pie_chart">Pie Chart</option>
                      <option value="kpi_card">KPI Card</option>
                      <option value="gauge">Gauge</option>
                      <option value="map">Map</option>
                      <option value="timeline">Timeline</option>
                      <option value="heatmap">Heatmap</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="audience" className="text-sm font-medium">Audience</label>
                    <select id="audience" name="audience" value={formData.audience} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="internal">Internal</option>
                      <option value="client">Client</option>
                      <option value="bank">Bank</option>
                      <option value="investor">Investor</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="refresh_frequency" className="text-sm font-medium">Refresh</label>
                    <select id="refresh_frequency" name="refresh_frequency" value={formData.refresh_frequency} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="manual">Manual</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input id="is_template" name="is_template" type="checkbox" checked={formData.is_template} onChange={handleChange} className="h-4 w-4 rounded border-input" />
                  <label htmlFor="is_template" className="text-sm font-medium">Template</label>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive dashboard?"
        description="This dashboard will be archived. It can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
