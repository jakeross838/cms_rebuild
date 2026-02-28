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
import { formatDate, getStatusColor, formatStatus } from '@/lib/utils'
import { toast } from 'sonner'

interface SafetyIncidentData {
  id: string
  company_id: string
  job_id: string
  incident_number: string
  title: string
  description: string | null
  incident_date: string
  incident_time: string | null
  location: string | null
  severity: string
  status: string
  incident_type: string
  reported_by: string | null
  assigned_to: string | null
  injured_party: string | null
  injury_description: string | null
  root_cause: string | null
  corrective_actions: string | null
  preventive_actions: string | null
  osha_recordable: boolean
  osha_report_number: string | null
  lost_work_days: number
  restricted_days: number
  medical_treatment: boolean
  resolved_at: string | null
  closed_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface JobLookup {
  id: string
  name: string
}

export default function SafetyIncidentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [incident, setIncident] = useState<SafetyIncidentData | null>(null)
  const [jobs, setJobs] = useState<JobLookup[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    incident_number: '',
    title: '',
    description: '',
    incident_type: '',
    severity: '',
    status: '',
    incident_date: '',
    incident_time: '',
    job_id: '',
    location: '',
    injured_party: '',
    injury_description: '',
    root_cause: '',
    corrective_actions: '',
    preventive_actions: '',
    osha_recordable: false,
    osha_report_number: '',
    lost_work_days: '0',
    restricted_days: '0',
    medical_treatment: false,
  })

  useEffect(() => {
    async function loadData() {
      // Get current user's company_id for tenant-scoped dropdown queries
      if (!companyId) { setError('No company found'); setLoading(false); return }

      const [incidentRes, jobsRes] = await Promise.all([
        supabase
          .from('safety_incidents')
          .select('*')
          .eq('id', params.id as string)
          .is('deleted_at', null)
          .single(),
        supabase.from('jobs').select('id, name').eq('company_id', companyId).is('deleted_at', null).order('name'),
      ])

      if (incidentRes.error || !incidentRes.data) {
        setError('Safety incident not found')
        setLoading(false)
        return
      }

      const inc = incidentRes.data as SafetyIncidentData
      setIncident(inc)
      setJobs((jobsRes.data as JobLookup[]) || [])
      setFormData({
        incident_number: inc.incident_number,
        title: inc.title,
        description: inc.description || '',
        incident_type: inc.incident_type,
        severity: inc.severity,
        status: inc.status,
        incident_date: inc.incident_date,
        incident_time: inc.incident_time || '',
        job_id: inc.job_id,
        location: inc.location || '',
        injured_party: inc.injured_party || '',
        injury_description: inc.injury_description || '',
        root_cause: inc.root_cause || '',
        corrective_actions: inc.corrective_actions || '',
        preventive_actions: inc.preventive_actions || '',
        osha_recordable: inc.osha_recordable,
        osha_report_number: inc.osha_report_number || '',
        lost_work_days: String(inc.lost_work_days),
        restricted_days: String(inc.restricted_days),
        medical_treatment: inc.medical_treatment,
      })
      setLoading(false)
    }
    loadData()
  }, [params.id, supabase, companyId])

  const jobName = jobs.find((j) => j.id === incident?.job_id)?.name || 'Unknown Job'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('safety_incidents')
        .update({
          incident_number: formData.incident_number,
          title: formData.title,
          description: formData.description || null,
          incident_type: formData.incident_type,
          severity: formData.severity,
          status: formData.status,
          incident_date: formData.incident_date,
          incident_time: formData.incident_time || null,
          job_id: formData.job_id,
          location: formData.location || null,
          injured_party: formData.injured_party || null,
          injury_description: formData.injury_description || null,
          root_cause: formData.root_cause || null,
          corrective_actions: formData.corrective_actions || null,
          preventive_actions: formData.preventive_actions || null,
          osha_recordable: formData.osha_recordable,
          osha_report_number: formData.osha_report_number || null,
          lost_work_days: parseInt(formData.lost_work_days) || 0,
          restricted_days: parseInt(formData.restricted_days) || 0,
          medical_treatment: formData.medical_treatment,
        })
        .eq('id', params.id as string)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      toast.success('Saved')
      setIncident((prev) =>
        prev
          ? {
              ...prev,
              incident_number: formData.incident_number,
              title: formData.title,
              description: formData.description || null,
              incident_type: formData.incident_type,
              severity: formData.severity,
              status: formData.status,
              incident_date: formData.incident_date,
              incident_time: formData.incident_time || null,
              job_id: formData.job_id,
              location: formData.location || null,
              injured_party: formData.injured_party || null,
              injury_description: formData.injury_description || null,
              root_cause: formData.root_cause || null,
              corrective_actions: formData.corrective_actions || null,
              preventive_actions: formData.preventive_actions || null,
              osha_recordable: formData.osha_recordable,
              osha_report_number: formData.osha_report_number || null,
              lost_work_days: parseInt(formData.lost_work_days) || 0,
              restricted_days: parseInt(formData.restricted_days) || 0,
              medical_treatment: formData.medical_treatment,
            }
          : prev
      )
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
      .from('safety_incidents')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id as string)
      .eq('company_id', companyId)

    if (deleteError) {
      setError('Failed to archive incident')
      toast.error('Failed to archive incident')
      return
    }

    toast.success('Archived')
    router.push('/compliance/safety')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/compliance/safety" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Safety
        </Link>
        <p className="text-destructive">{error || 'Incident not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/compliance/safety" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Safety
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{incident.title}</h1>
              <Badge className={`rounded ${getStatusColor(incident.status)}`}>{formatStatus(incident.status)}</Badge>
              <Badge className={`rounded ${getStatusColor(incident.severity)}`}>{formatStatus(incident.severity)}</Badge>
            </div>
            <p className="text-muted-foreground">#{incident.incident_number} -- {jobName} -- {formatDate(incident.incident_date)}</p>
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Incident updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader><CardTitle>Incident Details</CardTitle></CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Incident Number</dt>
                    <dd className="font-medium">{incident.incident_number}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Type</dt>
                    <dd className="font-medium">{formatStatus(incident.incident_type)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Severity</dt>
                    <dd><Badge className={`rounded ${getStatusColor(incident.severity)}`}>{formatStatus(incident.severity)}</Badge></dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd><Badge className={`rounded ${getStatusColor(incident.status)}`}>{formatStatus(incident.status)}</Badge></dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Date</dt>
                    <dd className="font-medium">{formatDate(incident.incident_date)}{incident.incident_time ? ` at ${incident.incident_time}` : ''}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Job</dt>
                    <dd className="font-medium">{jobName}</dd>
                  </div>
                  {incident.location && (
                    <div>
                      <dt className="text-muted-foreground">Location</dt>
                      <dd className="font-medium">{incident.location}</dd>
                    </div>
                  )}
                  {incident.injured_party && (
                    <div>
                      <dt className="text-muted-foreground">Injured Party</dt>
                      <dd className="font-medium">{incident.injured_party}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {incident.description && (
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{incident.description}</p>
                </CardContent>
              </Card>
            )}

            {incident.injury_description && (
              <Card>
                <CardHeader><CardTitle>Injury Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{incident.injury_description}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader><CardTitle>OSHA Information</CardTitle></CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">OSHA Recordable</dt>
                    <dd className="font-medium">{incident.osha_recordable ? 'Yes' : 'No'}</dd>
                  </div>
                  {incident.osha_report_number && (
                    <div>
                      <dt className="text-muted-foreground">OSHA Report Number</dt>
                      <dd className="font-medium">{incident.osha_report_number}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-muted-foreground">Lost Work Days</dt>
                    <dd className="font-medium">{incident.lost_work_days}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Restricted Days</dt>
                    <dd className="font-medium">{incident.restricted_days}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Medical Treatment</dt>
                    <dd className="font-medium">{incident.medical_treatment ? 'Yes' : 'No'}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {(incident.root_cause || incident.corrective_actions || incident.preventive_actions) && (
              <Card>
                <CardHeader><CardTitle>Investigation & Actions</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {incident.root_cause && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Root Cause</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{incident.root_cause}</p>
                    </div>
                  )}
                  {incident.corrective_actions && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Corrective Actions</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{incident.corrective_actions}</p>
                    </div>
                  )}
                  {incident.preventive_actions && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Preventive Actions</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{incident.preventive_actions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Incident
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Incident Information</CardTitle>
                <CardDescription>Update incident details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="incident_number" className="text-sm font-medium">Incident Number <span className="text-red-500">*</span></label>
                    <Input id="incident_number" name="incident_number" value={formData.incident_number} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                    <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="incident_type" className="text-sm font-medium">Type <span className="text-red-500">*</span></label>
                    <select id="incident_type" name="incident_type" value={formData.incident_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="injury">Injury</option>
                      <option value="near_miss">Near Miss</option>
                      <option value="property_damage">Property Damage</option>
                      <option value="environmental">Environmental</option>
                      <option value="equipment_failure">Equipment Failure</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="severity" className="text-sm font-medium">Severity <span className="text-red-500">*</span></label>
                    <select id="severity" name="severity" value={formData.severity} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="open">Open</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="incident_date" className="text-sm font-medium">Date <span className="text-red-500">*</span></label>
                    <Input id="incident_date" name="incident_date" type="date" value={formData.incident_date} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="incident_time" className="text-sm font-medium">Time</label>
                    <Input id="incident_time" name="incident_time" type="time" value={formData.incident_time} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="job_id" className="text-sm font-medium">Job <span className="text-red-500">*</span></label>
                    <select id="job_id" name="job_id" value={formData.job_id} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="">Select job...</option>
                      {jobs.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">Location</label>
                    <Input id="location" name="location" value={formData.location} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="injured_party" className="text-sm font-medium">Injured Party</label>
                    <Input id="injured_party" name="injured_party" value={formData.injured_party} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="injury_description" className="text-sm font-medium">Injury Description</label>
                  <textarea id="injury_description" aria-label="Injury description" name="injury_description" value={formData.injury_description} onChange={handleChange} rows={2} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>OSHA Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input id="osha_recordable" name="osha_recordable" type="checkbox" checked={formData.osha_recordable} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-input" />
                    <label htmlFor="osha_recordable" className="text-sm font-medium">OSHA Recordable</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input id="medical_treatment" name="medical_treatment" type="checkbox" checked={formData.medical_treatment} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-input" />
                    <label htmlFor="medical_treatment" className="text-sm font-medium">Medical Treatment</label>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="osha_report_number" className="text-sm font-medium">OSHA Report Number</label>
                    <Input id="osha_report_number" name="osha_report_number" value={formData.osha_report_number} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lost_work_days" className="text-sm font-medium">Lost Work Days</label>
                    <Input id="lost_work_days" name="lost_work_days" type="number" value={formData.lost_work_days} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="restricted_days" className="text-sm font-medium">Restricted Days</label>
                    <Input id="restricted_days" name="restricted_days" type="number" value={formData.restricted_days} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Investigation & Actions</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="root_cause" className="text-sm font-medium">Root Cause</label>
                  <textarea id="root_cause" aria-label="Root cause" name="root_cause" value={formData.root_cause} onChange={handleChange} rows={2} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="corrective_actions" className="text-sm font-medium">Corrective Actions</label>
                  <textarea id="corrective_actions" aria-label="Corrective actions" name="corrective_actions" value={formData.corrective_actions} onChange={handleChange} rows={2} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="preventive_actions" className="text-sm font-medium">Preventive Actions</label>
                  <textarea id="preventive_actions" aria-label="Preventive actions" name="preventive_actions" value={formData.preventive_actions} onChange={handleChange} rows={2} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive incident?"
        description="This incident will be archived. It can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
