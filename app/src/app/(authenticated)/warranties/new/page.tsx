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

interface SelectOption {
  id: string
  label: string
}

export default function NewWarrantyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jobs, setJobs] = useState<SelectOption[]>([])
  const [vendors, setVendors] = useState<SelectOption[]>([])

  const [formData, setFormData] = useState({
    title: '',
    warranty_type: 'general',
    job_id: '',
    vendor_id: '',
    start_date: '',
    end_date: '',
    coverage_details: '',
    exclusions: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    description: '',
  })

  useEffect(() => {
    async function loadOptions() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      const companyId = (profile as { company_id: string } | null)?.company_id
      if (!companyId) return

      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id, name, job_number')
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .order('name')

      setJobs((jobsData || []).map((j: { id: string; name: string; job_number: string | null }) => ({
        id: j.id,
        label: j.job_number ? `${j.job_number} — ${j.name}` : j.name,
      })))

      const { data: vendorsData } = await supabase
        .from('vendors')
        .select('id, name')
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .order('name')

      setVendors((vendorsData || []).map((v: { id: string; name: string }) => ({
        id: v.id,
        label: v.name,
      })))
    }
    loadOptions()
  }, [supabase])

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
        .from('warranties')
        .insert({
          company_id: companyId,
          title: formData.title,
          warranty_type: formData.warranty_type,
          status: 'active',
          job_id: formData.job_id,
          vendor_id: formData.vendor_id || null,
          start_date: formData.start_date,
          end_date: formData.end_date,
          coverage_details: formData.coverage_details || null,
          exclusions: formData.exclusions || null,
          contact_name: formData.contact_name || null,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          description: formData.description || null,
          created_by: user.id,
        })

      if (insertError) throw insertError

      toast.success('Warranty created')
      router.push('/warranties')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to add warranty'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/warranties" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Warranties
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Add Warranty</h1>
        <p className="text-muted-foreground">Track a warranty for a job</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Warranty Details</CardTitle>
            <CardDescription>Type, coverage, and duration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Roof — 25 Year Shingle Warranty" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="warranty_type" className="text-sm font-medium">Type <span className="text-red-500">*</span></label>
                <select id="warranty_type" name="warranty_type" value={formData.warranty_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
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
            </div>
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
            <CardTitle>Assignment</CardTitle>
            <CardDescription>Link to job and vendor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="job_id" className="text-sm font-medium">Job <span className="text-red-500">*</span></label>
                <select id="job_id" name="job_id" value={formData.job_id} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select a job...</option>
                  {jobs.map((j) => <option key={j.id} value={j.id}>{j.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="vendor_id" className="text-sm font-medium">Vendor</label>
                <select id="vendor_id" name="vendor_id" value={formData.vendor_id} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">No vendor</option>
                  {vendors.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coverage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="coverage_details" className="text-sm font-medium">Coverage Details</label>
              <textarea id="coverage_details" aria-label="Coverage details" name="coverage_details" value={formData.coverage_details} onChange={handleChange} rows={2} placeholder="What's covered under this warranty..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <label htmlFor="exclusions" className="text-sm font-medium">Exclusions</label>
              <textarea id="exclusions" aria-label="Exclusions" name="exclusions" value={formData.exclusions} onChange={handleChange} rows={2} placeholder="What's NOT covered..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Warranty Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="contact_name" className="text-sm font-medium">Name</label>
                <Input id="contact_name" name="contact_name" value={formData.contact_name} onChange={handleChange} placeholder="Claims Dept" />
              </div>
              <div className="space-y-2">
                <label htmlFor="contact_email" className="text-sm font-medium">Email</label>
                <Input id="contact_email" name="contact_email" type="email" value={formData.contact_email} onChange={handleChange} placeholder="claims@vendor.com" />
              </div>
              <div className="space-y-2">
                <label htmlFor="contact_phone" className="text-sm font-medium">Phone</label>
                <Input id="contact_phone" name="contact_phone" type="tel" value={formData.contact_phone} onChange={handleChange} placeholder="1-800-555-0100" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/warranties"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Add Warranty'}
          </Button>
        </div>
      </form>
    </div>
  )
}
