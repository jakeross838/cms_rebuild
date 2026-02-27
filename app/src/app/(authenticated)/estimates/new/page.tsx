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

export default function NewEstimatePage() {
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile, user: authUser } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    estimate_type: 'lump_sum',
    description: '',
    markup_pct: '',
    overhead_pct: '',
    profit_pct: '',
    valid_until: '',
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
      if (!formData.name.trim()) { setError('Estimate name is required'); setLoading(false); return }

      const { error: insertError } = await supabase
        .from('estimates')
        .insert({
          company_id: companyId,
          name: formData.name,
          estimate_type: formData.estimate_type,
          status: 'draft',
          description: formData.description || null,
          markup_pct: formData.markup_pct ? parseFloat(formData.markup_pct) : null,
          overhead_pct: formData.overhead_pct ? parseFloat(formData.overhead_pct) : null,
          profit_pct: formData.profit_pct ? parseFloat(formData.profit_pct) : null,
          valid_until: formData.valid_until || null,
          notes: formData.notes || null,
          created_by: authUser.id,
        })

      if (insertError) throw insertError

      toast.success('Estimate created')
      router.push('/estimates')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create estimate'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/estimates" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Estimates
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Estimate</h1>
        <p className="text-muted-foreground">Create a cost estimate for a project</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Estimate Details</CardTitle>
            <CardDescription>Name and type of estimate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Estimate Name <span className="text-red-500">*</span></label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Smith Kitchen Remodel" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="estimate_type" className="text-sm font-medium">Type <span className="text-red-500">*</span></label>
                <select id="estimate_type" name="estimate_type" value={formData.estimate_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="lump_sum">Lump Sum</option>
                  <option value="cost_plus">Cost Plus</option>
                  <option value="time_and_materials">Time & Materials</option>
                  <option value="unit_price">Unit Price</option>
                  <option value="gmp">GMP</option>
                  <option value="design_build">Design Build</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={2} placeholder="Scope of this estimate..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Markup & Margins</CardTitle>
            <CardDescription>Default percentages for this estimate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="markup_pct" className="text-sm font-medium">Markup %</label>
                <Input id="markup_pct" name="markup_pct" type="number" step="0.1" min="0" max="100" value={formData.markup_pct} onChange={handleChange} placeholder="0" />
              </div>
              <div className="space-y-2">
                <label htmlFor="overhead_pct" className="text-sm font-medium">Overhead %</label>
                <Input id="overhead_pct" name="overhead_pct" type="number" step="0.1" min="0" max="100" value={formData.overhead_pct} onChange={handleChange} placeholder="0" />
              </div>
              <div className="space-y-2">
                <label htmlFor="profit_pct" className="text-sm font-medium">Profit %</label>
                <Input id="profit_pct" name="profit_pct" type="number" step="0.1" min="0" max="100" value={formData.profit_pct} onChange={handleChange} placeholder="0" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="valid_until" className="text-sm font-medium">Valid Until</label>
              <Input id="valid_until" name="valid_until" type="date" value={formData.valid_until} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Assumptions, exclusions, or other notes..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/estimates"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Estimate'}
          </Button>
        </div>
      </form>
    </div>
  )
}
