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

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New Permit' }


export default function NewPermitPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const supabase = createClient()

  const { profile: authProfile, user: authUser } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    permit_type: 'building',
    permit_number: '',
    jurisdiction: '',
    status: 'draft',
    applied_date: '',
    issued_date: '',
    expiration_date: '',
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

      // Verify job belongs to company
      const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
      if (!jobCheck) throw new Error('Job not found or access denied')

      const { error: insertError } = await supabase
        .from('permits')
        .insert({
          company_id: companyId,
          job_id: jobId,
          permit_type: formData.permit_type,
          permit_number: formData.permit_number || null,
          jurisdiction: formData.jurisdiction || null,
          status: formData.status,
          applied_date: formData.applied_date || null,
          issued_date: formData.issued_date || null,
          expiration_date: formData.expiration_date || null,
          conditions: formData.conditions || null,
          notes: formData.notes || null,
          created_by: authUser.id,
        })

      if (insertError) throw insertError

      toast.success('Permit created')
      router.push(`/jobs/${jobId}/permits`)
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create permit'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/permits`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Permits
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Permit</h1>
        <p className="text-muted-foreground">Add a new permit for this job</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Permit Details</CardTitle>
            <CardDescription>Type, number, and jurisdiction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="permit_type" className="text-sm font-medium">Permit Type <span className="text-red-500">*</span></label>
                <select id="permit_type" name="permit_type" value={formData.permit_type} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="building">Building</option>
                  <option value="electrical">Electrical</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="mechanical">Mechanical</option>
                  <option value="demolition">Demolition</option>
                  <option value="grading">Grading</option>
                  <option value="fire">Fire</option>
                  <option value="environmental">Environmental</option>
                  <option value="zoning">Zoning</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="permit_number" className="text-sm font-medium">Permit Number</label>
                <Input id="permit_number" name="permit_number" value={formData.permit_number} onChange={handleChange} placeholder="e.g., BP-2026-001" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="jurisdiction" className="text-sm font-medium">Jurisdiction</label>
                <Input id="jurisdiction" name="jurisdiction" value={formData.jurisdiction} onChange={handleChange} placeholder="e.g., City of Austin" />
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="draft">Draft</option>
                  <option value="applied">Applied</option>
                  <option value="issued">Issued</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="closed">Closed</option>
                  <option value="revoked">Revoked</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dates</CardTitle>
            <CardDescription>Application, issue, and expiration dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="applied_date" className="text-sm font-medium">Applied Date</label>
                <Input id="applied_date" name="applied_date" type="date" value={formData.applied_date} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="issued_date" className="text-sm font-medium">Issued Date</label>
                <Input id="issued_date" name="issued_date" type="date" value={formData.issued_date} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="expiration_date" className="text-sm font-medium">Expiration Date</label>
                <Input id="expiration_date" name="expiration_date" type="date" value={formData.expiration_date} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Conditions &amp; Notes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="conditions" className="text-sm font-medium">Conditions</label>
              <textarea id="conditions" aria-label="Conditions" name="conditions" value={formData.conditions} onChange={handleChange} rows={3} placeholder="Any conditions on the permit..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">Notes</label>
              <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={2} placeholder="Additional notes..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href={`/jobs/${jobId}/permits`}><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Permit'}
          </Button>
        </div>
      </form>
    </div>
  )
}
