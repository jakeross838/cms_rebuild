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

export default function NewContactPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vendors, setVendors] = useState<SelectOption[]>([])

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    vendor_id: '',
    is_primary: false,
  })

  useEffect(() => {
    async function loadVendors() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      const companyId = (profile as { company_id: string } | null)?.company_id
      if (!companyId) return

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
    loadVendors()
  }, [supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
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
        .from('vendor_contacts')
        .insert({
          company_id: companyId,
          vendor_id: formData.vendor_id,
          name: formData.name,
          title: formData.title || null,
          email: formData.email || null,
          phone: formData.phone || null,
          is_primary: formData.is_primary,
        })

      if (insertError) throw insertError

      toast.success('Contact created')
      router.push('/contacts')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to add contact'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/contacts" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Contacts
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Add Contact</h1>
        <p className="text-muted-foreground">Add a vendor contact person</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Name and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="John Smith" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Job Title</label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Project Manager" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@vendor.com" />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="(512) 555-0100" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Assignment</CardTitle>
            <CardDescription>Which vendor does this contact belong to?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="vendor_id" className="text-sm font-medium">Vendor <span className="text-red-500">*</span></label>
              <select id="vendor_id" name="vendor_id" value={formData.vendor_id} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">Select a vendor...</option>
                {vendors.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input id="is_primary" name="is_primary" type="checkbox" checked={formData.is_primary} onChange={handleChange} className="h-4 w-4 rounded border-input" />
              <label htmlFor="is_primary" className="text-sm font-medium">Primary contact for this vendor</label>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/contacts"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Add Contact'}
          </Button>
        </div>
      </form>
    </div>
  )
}
