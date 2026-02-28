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

export default function NewTemplatePage() {
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile, user: authUser } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    contract_type: 'prime',
    description: '',
    content: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setError(null)
    setLoading(true)

    try {
      if (!authUser || !companyId) throw new Error('Not authenticated')

      if (!formData.name.trim()) { setError('Template name is required'); setLoading(false); return }

      const { error: insertError } = await supabase
        .from('contract_templates')
        .insert({
          company_id: companyId,
          name: formData.name,
          contract_type: formData.contract_type,
          description: formData.description || null,
          content: formData.content || null,
          is_active: true,
          is_system: false,
          created_by: authUser.id,
        })

      if (insertError) throw insertError

      toast.success('Template created')
      router.push('/library/templates')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create template'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/library/templates" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Templates
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Contract Template</h1>
        <p className="text-muted-foreground">Create a reusable contract template</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>Name and type of contract</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Template Name <span className="text-red-500">*</span></label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Standard Residential Contract" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="contract_type" className="text-sm font-medium">Contract Type <span className="text-red-500">*</span></label>
                <select id="contract_type" name="contract_type" value={formData.contract_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="prime">Prime</option>
                  <option value="subcontract">Subcontract</option>
                  <option value="purchase_order">Purchase Order</option>
                  <option value="service_agreement">Service Agreement</option>
                  <option value="change_order">Change Order</option>
                  <option value="amendment">Amendment</option>
                  <option value="nda">NDA</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Input id="description" name="description" value={formData.description} onChange={handleChange} placeholder="When to use this template..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Template Content</CardTitle>
            <CardDescription>Contract body text — use {'{{variables}}'} for dynamic fields</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea id="content" aria-label="Content" name="content" value={formData.content} onChange={handleChange} rows={12} placeholder="This agreement is entered into between {{company_name}} and {{client_name}}..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm font-mono transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/library/templates"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Template'}
          </Button>
        </div>
      </form>
    </div>
  )
}
