'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function NewCostCodePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    division: '',
    subdivision: '',
    category: 'subcontractor',
    trade: '',
    description: '',
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
        .from('cost_codes')
        .insert({
          company_id: companyId,
          code: formData.code,
          name: formData.name,
          division: formData.division,
          subdivision: formData.subdivision || null,
          category: formData.category,
          trade: formData.trade || null,
          description: formData.description || null,
        })

      if (insertError) throw insertError

      toast.success('Cost code created')
      router.push('/cost-codes')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create cost code'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/cost-codes" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Cost Codes
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Cost Code</h1>
        <p className="text-muted-foreground">Add a cost code to your library</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Cost Code Details</CardTitle>
            <CardDescription>Code number, name, and classification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium">Code <span className="text-red-500">*</span></label>
                <Input id="code" name="code" value={formData.code} onChange={handleChange} placeholder="e.g., 01-100" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., General Conditions" required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="division" className="text-sm font-medium">Division <span className="text-red-500">*</span></label>
                <Input id="division" name="division" value={formData.division} onChange={handleChange} placeholder="e.g., 01 — General Requirements" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="subdivision" className="text-sm font-medium">Subdivision</label>
                <Input id="subdivision" name="subdivision" value={formData.subdivision} onChange={handleChange} placeholder="e.g., Temporary Facilities" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">Category</label>
                <select id="category" name="category" value={formData.category} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="labor">Labor</option>
                  <option value="material">Material</option>
                  <option value="subcontractor">Subcontractor</option>
                  <option value="equipment">Equipment</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="trade" className="text-sm font-medium">Trade</label>
                <Input id="trade" name="trade" value={formData.trade} onChange={handleChange} placeholder="e.g., Plumbing, Electrical" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Description</CardTitle></CardHeader>
          <CardContent>
            <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="What this cost code covers..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/cost-codes"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Add Cost Code'}
          </Button>
        </div>
      </form>
    </div>
  )
}
