'use client'

import { useEffect, useState } from 'react'

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

export const metadata: Metadata = { title: 'New Safety Record' }


export default function NewSafetyIncidentPage() {
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile, user: authUser } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Dropdown data ──────────────────────────────────────────────
  const [jobs, setJobs] = useState<{ id: string; name: string }[]>([])

  const [formData, setFormData] = useState({
    job_id: '',
    incident_number: '',
    title: '',
    incident_date: '',
    incident_time: '',
    incident_type: 'other',
    severity: 'near_miss',
    status: 'reported',
    location: '',
    description: '',
    injured_party: '',
    injury_description: '',
    corrective_actions: '',
    osha_recordable: false,
    medical_treatment: false,
  })

  useEffect(() => {
    async function loadDropdowns() {
      if (!companyId) return

      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id, name')
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .order('name')

      if (jobsData) setJobs(jobsData)
    }
    loadDropdowns()
  }, [companyId])

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
        .from('safety_incidents')
        .insert({
          company_id: companyId,
          job_id: formData.job_id,
          incident_number: formData.incident_number,
          title: formData.title,
          incident_date: formData.incident_date,
          incident_time: formData.incident_time || null,
          incident_type: formData.incident_type,
          severity: formData.severity,
          status: formData.status,
          location: formData.location || null,
          description: formData.description || null,
          injured_party: formData.injured_party || null,
          injury_description: formData.injury_description || null,
          corrective_actions: formData.corrective_actions || null,
          osha_recordable: formData.osha_recordable,
          medical_treatment: formData.medical_treatment,
          reported_by: authUser.id,
          created_by: authUser.id,
        })

      if (insertError) throw insertError

      toast.success('Safety incident reported')
      router.push('/compliance/safety')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create safety incident'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/compliance/safety" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Safety
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Report Safety Incident</h1>
        <p className="text-muted-foreground">Document a new safety incident or near miss</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        {/* Incident Info */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Information</CardTitle>
            <CardDescription>Basic details about the incident</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="job_id" className="text-sm font-medium">Job <span className="text-red-500">*</span></label>
                <select id="job_id" name="job_id" value={formData.job_id} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select a job...</option>
                  {jobs.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="incident_number" className="text-sm font-medium">Incident Number <span className="text-red-500">*</span></label>
                <Input id="incident_number" name="incident_number" value={formData.incident_number} onChange={handleChange} placeholder="e.g., INC-2026-001" required />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Worker slip on wet surface" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="incident_date" className="text-sm font-medium">Incident Date <span className="text-red-500">*</span></label>
                <Input id="incident_date" name="incident_date" type="date" value={formData.incident_date} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="incident_time" className="text-sm font-medium">Incident Time</label>
                <Input id="incident_time" name="incident_time" type="time" value={formData.incident_time} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">Location</label>
                <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Roof, 2nd Floor" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classification */}
        <Card>
          <CardHeader>
            <CardTitle>Classification</CardTitle>
            <CardDescription>Type, severity, and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="incident_type" className="text-sm font-medium">Incident Type <span className="text-red-500">*</span></label>
                <select id="incident_type" name="incident_type" value={formData.incident_type} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {[
                    { value: 'fall', label: 'Fall' },
                    { value: 'struck_by', label: 'Struck By' },
                    { value: 'caught_in', label: 'Caught In' },
                    { value: 'electrical', label: 'Electrical' },
                    { value: 'chemical', label: 'Chemical' },
                    { value: 'heat', label: 'Heat' },
                    { value: 'vehicle', label: 'Vehicle' },
                    { value: 'other', label: 'Other' },
                  ].map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="severity" className="text-sm font-medium">Severity <span className="text-red-500">*</span></label>
                <select id="severity" name="severity" value={formData.severity} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {[
                    { value: 'near_miss', label: 'Near Miss' },
                    { value: 'minor', label: 'Minor' },
                    { value: 'moderate', label: 'Moderate' },
                    { value: 'serious', label: 'Serious' },
                    { value: 'fatal', label: 'Fatal' },
                  ].map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {[
                    { value: 'reported', label: 'Reported' },
                    { value: 'investigating', label: 'Investigating' },
                    { value: 'resolved', label: 'Resolved' },
                    { value: 'closed', label: 'Closed' },
                  ].map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input id="osha_recordable" name="osha_recordable" type="checkbox" checked={formData.osha_recordable} onChange={handleChange} className="h-4 w-4 rounded border-input" />
                <label htmlFor="osha_recordable" className="text-sm font-medium">OSHA Recordable</label>
              </div>
              <div className="flex items-center gap-2">
                <input id="medical_treatment" name="medical_treatment" type="checkbox" checked={formData.medical_treatment} onChange={handleChange} className="h-4 w-4 rounded border-input" />
                <label htmlFor="medical_treatment" className="text-sm font-medium">Medical Treatment Required</label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Injury Details */}
        <Card>
          <CardHeader>
            <CardTitle>Injury Details</CardTitle>
            <CardDescription>If someone was injured</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="injured_party" className="text-sm font-medium">Injured Party</label>
              <Input id="injured_party" name="injured_party" value={formData.injured_party} onChange={handleChange} placeholder="Name of injured person" />
            </div>
            <div className="space-y-2">
              <label htmlFor="injury_description" className="text-sm font-medium">Injury Description</label>
              <textarea id="injury_description" aria-label="Injury description" name="injury_description" value={formData.injury_description} onChange={handleChange} rows={2} placeholder="Describe the injury..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
          </CardContent>
        </Card>

        {/* Description & Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Description & Corrective Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Incident Description</label>
              <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe what happened in detail..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <label htmlFor="corrective_actions" className="text-sm font-medium">Corrective Actions</label>
              <textarea id="corrective_actions" aria-label="Corrective actions" name="corrective_actions" value={formData.corrective_actions} onChange={handleChange} rows={3} placeholder="What corrective actions were or will be taken..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/compliance/safety"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Report Incident'}
          </Button>
        </div>
      </form>
    </div>
  )
}
