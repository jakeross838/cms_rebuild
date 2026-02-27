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

export default function NewContractTemplatePage() {
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile, user: authUser } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contract_type: 'prime',
    content: '',
    is_active: true,
    is_system: false,
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
        .from('contract_templates')
        .insert({
          company_id: companyId,
          name: formData.name,
          description: formData.description || null,
          contract_type: formData.contract_type,
          content: formData.content || null,
          is_active: formData.is_active,
          is_system: formData.is_system,
          created_by: authUser.id,
        })

      if (insertError) throw insertError

      toast.success('Contract template created')
      router.push('/legal')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create contract template'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/legal" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Legal
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Contract Template</h1>
        <p className="text-muted-foreground">Create a reusable contract template</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        {/* Template Info */}
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>Name, type, and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Template Name <span className="text-red-500">*</span></label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Standard Prime Contract" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="contract_type" className="text-sm font-medium">Contract Type <span className="text-red-500">*</span></label>
                <select id="contract_type" name="contract_type" value={formData.contract_type} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {[
                    { value: 'prime', label: 'Prime Contract' },
                    { value: 'subcontract', label: 'Subcontract' },
                    { value: 'purchase_order', label: 'Purchase Order' },
                    { value: 'service_agreement', label: 'Service Agreement' },
                    { value: 'change_order', label: 'Change Order' },
                    { value: 'amendment', label: 'Amendment' },
                    { value: 'nda', label: 'NDA' },
                    { value: 'other', label: 'Other' },
                  ].map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={2} placeholder="What this template is used for..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input id="is_active" name="is_active" type="checkbox" checked={formData.is_active} onChange={handleChange} className="h-4 w-4 rounded border-input" />
                <label htmlFor="is_active" className="text-sm font-medium">Active</label>
              </div>
              <div className="flex items-center gap-2">
                <input id="is_system" name="is_system" type="checkbox" checked={formData.is_system} onChange={handleChange} className="h-4 w-4 rounded border-input" />
                <label htmlFor="is_system" className="text-sm font-medium">System Template</label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Content */}
        <Card>
          <CardHeader>
            <CardTitle>Template Content</CardTitle>
            <CardDescription>The body of the contract template. Use {'{{variable_name}}'} for dynamic fields.</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea id="content" aria-label="Content" name="content" value={formData.content} onChange={handleChange} rows={12} placeholder={"CONSTRUCTION CONTRACT\n\nThis agreement is entered into between {{company_name}} (\"Builder\") and {{client_name}} (\"Owner\")...\n\nScope of Work:\n{{scope_of_work}}\n\nContract Amount: ${{contract_amount}}"} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono" />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/legal"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Template'}
          </Button>
        </div>
      </form>
    </div>
  )
}
