'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCreateLead } from '@/hooks/use-crm'
import { toast } from 'sonner'

export default function NewLeadPage() {
  const router = useRouter()
  const createLead = useCreateLead()

  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    source: 'other',
    source_detail: '',
    project_type: '',
    expected_contract_value: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (createLead.isPending) return
    setError(null)

    if (!formData.first_name.trim()) { setError('First name is required'); return }
    if (!formData.last_name.trim()) { setError('Last name is required'); return }

    try {
      await createLead.mutateAsync({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || null,
        phone: formData.phone || null,
        source: formData.source,
        source_detail: formData.source_detail || null,
        project_type: formData.project_type || null,
        expected_contract_value: formData.expected_contract_value ? parseFloat(formData.expected_contract_value) : null,
        status: 'new',
      })

      toast.success('Lead created')
      router.push('/leads')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create lead'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/leads" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Leads
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Add New Lead</h1>
        <p className="text-muted-foreground">Add a potential client to your pipeline</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Who is this lead?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="first_name" className="text-sm font-medium">First Name <span className="text-red-500">*</span></label>
                <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="John" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="last_name" className="text-sm font-medium">Last Name <span className="text-red-500">*</span></label>
                <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Smith" required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="(512) 555-0100" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="source" className="text-sm font-medium">Lead Source</label>
                <select id="source" name="source" value={formData.source} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="other">Other</option>
                  <option value="referral">Referral</option>
                  <option value="website">Website</option>
                  <option value="social_media">Social Media</option>
                  <option value="walk_in">Walk-In</option>
                  <option value="phone">Phone</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="source_detail" className="text-sm font-medium">Source Detail</label>
                <Input id="source_detail" name="source_detail" value={formData.source_detail} onChange={handleChange} placeholder="Referred by Jane Doe" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>What are they looking for?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="project_type" className="text-sm font-medium">Project Type</label>
                <Input id="project_type" name="project_type" value={formData.project_type} onChange={handleChange} placeholder="e.g., Custom Home, Remodel" />
              </div>
              <div className="space-y-2">
                <label htmlFor="expected_contract_value" className="text-sm font-medium">Expected Contract Value</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="expected_contract_value" name="expected_contract_value" type="number" step="0.01" min="0" value={formData.expected_contract_value} onChange={handleChange} placeholder="0.00" className="pl-7" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/leads"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={createLead.isPending}>
            {createLead.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Add Lead'}
          </Button>
        </div>
      </form>
    </div>
  )
}
