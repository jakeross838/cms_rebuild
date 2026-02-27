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

export default function NewWarrantyPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const supabase = createClient()

  const { profile: authProfile, user: authUser } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    warranty_type: 'general',
    status: 'active',
    start_date: '',
    end_date: '',
    coverage_details: '',
    exclusions: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
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
        .from('warranties')
        .insert({
          company_id: companyId,
          job_id: jobId,
          title: formData.title,
          description: formData.description || null,
          warranty_type: formData.warranty_type,
          status: formData.status,
          start_date: formData.start_date,
          end_date: formData.end_date,
          coverage_details: formData.coverage_details || null,
          exclusions: formData.exclusions || null,
          contact_name: formData.contact_name || null,
          contact_phone: formData.contact_phone || null,
          contact_email: formData.contact_email || null,
          created_by: authUser.id,
        })

      if (insertError) throw insertError

      toast.success('Warranty created')
      router.push(`/jobs/${jobId}/warranties`)
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create warranty'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/warranties`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Warranties
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Warranty</h1>
        <p className="text-muted-foreground">Add a new warranty for this job</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Warranty Details</CardTitle>
            <CardDescription>Title, type, and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Roof Warranty - 25 Year" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="warranty_type" className="text-sm font-medium">Warranty Type <span className="text-red-500">*</span></label>
                <select id="warranty_type" name="warranty_type" value={formData.warranty_type} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="general">General</option>
                  <option value="structural">Structural</option>
                  <option value="mechanical">Mechanical</option>
                  <option value="electrical">Electrical</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="hvac">HVAC</option>
                  <option value="roofing">Roofing</option>
                  <option value="appliance">Appliance</option>
                  <option value="workmanship">Workmanship</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="voided">Voided</option>
                  <option value="transferred">Transferred</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coverage Period</CardTitle>
            <CardDescription>Start and end dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="start_date" className="text-sm font-medium">Start Date <span className="text-red-500">*</span></label>
                <Input id="start_date" name="start_date" type="date" value={formData.start_date} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="end_date" className="text-sm font-medium">End Date <span className="text-red-500">*</span></label>
                <Input id="end_date" name="end_date" type="date" value={formData.end_date} onChange={handleChange} required />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coverage Details</CardTitle>
            <CardDescription>What is and is not covered</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={2} placeholder="General description of the warranty..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <label htmlFor="coverage_details" className="text-sm font-medium">Coverage Details</label>
              <textarea id="coverage_details" aria-label="Coverage details" name="coverage_details" value={formData.coverage_details} onChange={handleChange} rows={3} placeholder="What is covered under this warranty..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <label htmlFor="exclusions" className="text-sm font-medium">Exclusions</label>
              <textarea id="exclusions" aria-label="Exclusions" name="exclusions" value={formData.exclusions} onChange={handleChange} rows={2} placeholder="What is NOT covered..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Warranty provider contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="contact_name" className="text-sm font-medium">Contact Name</label>
                <Input id="contact_name" name="contact_name" value={formData.contact_name} onChange={handleChange} placeholder="e.g., John Smith" />
              </div>
              <div className="space-y-2">
                <label htmlFor="contact_phone" className="text-sm font-medium">Contact Phone</label>
                <Input id="contact_phone" name="contact_phone" value={formData.contact_phone} onChange={handleChange} placeholder="e.g., (512) 555-0123" />
              </div>
              <div className="space-y-2">
                <label htmlFor="contact_email" className="text-sm font-medium">Contact Email</label>
                <Input id="contact_email" name="contact_email" type="email" value={formData.contact_email} onChange={handleChange} placeholder="e.g., john@example.com" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href={`/jobs/${jobId}/warranties`}><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Warranty'}
          </Button>
        </div>
      </form>
    </div>
  )
}
