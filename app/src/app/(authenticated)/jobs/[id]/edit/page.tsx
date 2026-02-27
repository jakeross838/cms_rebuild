'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { formatStatus } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────

interface JobData {
  id: string
  name: string
  job_number: string | null
  notes: string | null
  status: string | null
  contract_type: string | null
  contract_amount: number | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  start_date: string | null
  target_completion: string | null
}

interface JobFormData {
  name: string
  job_number: string
  notes: string
  status: string
  contract_type: string
  contract_amount: string
  address: string
  city: string
  state: string
  zip: string
  start_date: string
  target_completion: string
}

const STATUS_OPTIONS = ['pre_construction', 'active', 'on_hold', 'completed', 'warranty', 'cancelled'] as const
const CONTRACT_TYPE_OPTIONS = ['fixed_price', 'cost_plus', 'time_materials'] as const

// ── Component ──────────────────────────────────────────────────

export default function EditJobPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const jobId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<JobFormData>({
    name: '',
    job_number: '',
    notes: '',
    status: 'pre_construction',
    contract_type: 'fixed_price',
    contract_amount: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    start_date: '',
    target_completion: '',
  })

  useEffect(() => {
    async function loadJob() {
      if (!companyId) { setError('No company found'); setLoading(false); return }

      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .eq('company_id', companyId)
        .single()

      if (fetchError || !data) {
        setError('Job not found')
        setLoading(false)
        return
      }

      const j = data as JobData
      setFormData({
        name: j.name,
        job_number: j.job_number || '',
        notes: j.notes || '',
        status: j.status || 'pre_construction',
        contract_type: j.contract_type || 'fixed_price',
        contract_amount: j.contract_amount != null ? String(j.contract_amount) : '',
        address: j.address || '',
        city: j.city || '',
        state: j.state || '',
        zip: j.zip || '',
        start_date: j.start_date || '',
        target_completion: j.target_completion || '',
      })
      setLoading(false)
    }
    loadJob()
  }, [jobId, supabase, companyId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Job name is required')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          name: formData.name,
          job_number: formData.job_number || null,
          notes: formData.notes || null,
          status: formData.status as 'pre_construction' | 'active' | 'on_hold' | 'completed' | 'warranty' | 'cancelled',
          contract_type: (formData.contract_type || null) as 'fixed_price' | 'cost_plus' | 'time_materials' | null,
          contract_amount: formData.contract_amount ? Number(formData.contract_amount) : null,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          zip: formData.zip || null,
          start_date: formData.start_date || null,
          target_completion: formData.target_completion || null,
        })
        .eq('id', jobId)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      toast.success('Job updated')
      setSuccess(true)
      setTimeout(() => {
        router.push(`/jobs/${jobId}`)
        router.refresh()
      }, 1000)
    } catch (err) {
      setError((err as Error)?.message || 'Failed to save')
      toast.error('Failed to save job')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Job
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Edit Job</h1>
          <div className="flex items-center gap-2">
            <Link href={`/jobs/${jobId}`}>
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Job updated successfully. Redirecting...</div>}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Information</CardTitle>
            <CardDescription>Update project details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Job Name <span className="text-red-500">*</span></label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="job_number" className="text-sm font-medium">Job Number</label>
                <Input id="job_number" name="job_number" value={formData.job_number} onChange={handleChange} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{formatStatus(s)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="contract_type" className="text-sm font-medium">Contract Type</label>
                <select id="contract_type" name="contract_type" value={formData.contract_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {CONTRACT_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{formatStatus(t)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="contract_amount" className="text-sm font-medium">Contract Amount</label>
              <Input id="contract_amount" name="contract_amount" type="number" step="0.01" value={formData.contract_amount} onChange={handleChange} placeholder="0.00" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium">Street Address</label>
              <Input id="address" name="address" value={formData.address} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-medium">City</label>
                <Input id="city" name="city" value={formData.city} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="state" className="text-sm font-medium">State</label>
                <Input id="state" name="state" value={formData.state} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="zip" className="text-sm font-medium">ZIP</label>
                <Input id="zip" name="zip" value={formData.zip} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="start_date" className="text-sm font-medium">Start Date</label>
                <Input id="start_date" name="start_date" type="date" value={formData.start_date} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="target_completion" className="text-sm font-medium">Target Completion</label>
                <Input id="target_completion" name="target_completion" type="date" value={formData.target_completion} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={4} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Additional notes about this job..." />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
