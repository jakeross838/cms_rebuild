'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function NewInventoryItemPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    category: '',
    unit_of_measure: 'each',
    unit_cost: '',
    quantity: '',
    notes: '',
    needed_by: '',
    priority: 'normal',
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

      // First, create or find the inventory item in the catalog
      const { data: existingItem } = await supabase
        .from('inventory_items')
        .select('id')
        .eq('company_id', companyId)
        .eq('name', formData.name)
        .maybeSingle()

      let itemId: string

      if (existingItem) {
        itemId = existingItem.id
      } else {
        const { data: newItem, error: itemError } = await supabase
          .from('inventory_items')
          .insert({
            company_id: companyId,
            name: formData.name,
            description: formData.description || null,
            sku: formData.sku || null,
            category: formData.category || null,
            unit_of_measure: formData.unit_of_measure,
            unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : 0,
          })
          .select('id')
          .single()

        if (itemError) throw itemError
        itemId = newItem.id
      }

      // Then create a material request for this job
      const { data: materialRequest, error: mrError } = await supabase
        .from('material_requests')
        .insert({
          company_id: companyId,
          job_id: jobId,
          requested_by: user.id,
          status: 'draft',
          priority: formData.priority as 'low' | 'normal' | 'high' | 'urgent',
          needed_by: formData.needed_by || null,
          notes: formData.notes || null,
        })
        .select('id')
        .single()

      if (mrError) throw mrError

      // Add the item to the material request
      const { error: itemLineError } = await supabase
        .from('material_request_items')
        .insert({
          request_id: materialRequest.id,
          item_id: itemId,
          quantity_requested: formData.quantity ? parseFloat(formData.quantity) : 1,
          unit: formData.unit_of_measure || null,
          description: formData.description || null,
        })

      if (itemLineError) throw itemLineError

      router.push(`/jobs/${jobId}/inventory`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add inventory item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/inventory`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Inventory
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Material Request</h1>
        <p className="text-muted-foreground">Request materials for this job</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Material Details</CardTitle>
            <CardDescription>Item name, SKU, and specifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Material Name <span className="text-red-500">*</span></label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., 2x4 Lumber" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="sku" className="text-sm font-medium">SKU</label>
                <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} placeholder="e.g., LBR-2X4-08" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Input id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Material description or specifications" />
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <Input id="category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Lumber, Concrete, Electrical" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quantity &amp; Cost</CardTitle>
            <CardDescription>How much is needed and estimated cost</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="quantity" className="text-sm font-medium">Quantity <span className="text-red-500">*</span></label>
                <Input id="quantity" name="quantity" type="number" step="0.01" value={formData.quantity} onChange={handleChange} placeholder="e.g., 100" required min="0.01" />
              </div>
              <div className="space-y-2">
                <label htmlFor="unit_of_measure" className="text-sm font-medium">Unit of Measure</label>
                <select id="unit_of_measure" name="unit_of_measure" value={formData.unit_of_measure} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="each">Each</option>
                  <option value="lf">Linear Foot</option>
                  <option value="sf">Square Foot</option>
                  <option value="cy">Cubic Yard</option>
                  <option value="ton">Ton</option>
                  <option value="lb">Pound</option>
                  <option value="gal">Gallon</option>
                  <option value="bag">Bag</option>
                  <option value="box">Box</option>
                  <option value="roll">Roll</option>
                  <option value="sheet">Sheet</option>
                  <option value="bundle">Bundle</option>
                  <option value="pallet">Pallet</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="unit_cost" className="text-sm font-medium">Unit Cost ($)</label>
                <Input id="unit_cost" name="unit_cost" type="number" step="0.01" value={formData.unit_cost} onChange={handleChange} placeholder="e.g., 4.50" min="0" />
              </div>
            </div>
            {formData.quantity && formData.unit_cost && (
              <div className="p-3 bg-muted rounded-md text-sm">
                <span className="font-medium">Estimated Total:</span> ${(parseFloat(formData.quantity) * parseFloat(formData.unit_cost)).toFixed(2)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Info</CardTitle>
            <CardDescription>Priority and delivery timeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                <select id="priority" name="priority" value={formData.priority} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="needed_by" className="text-sm font-medium">Needed By</label>
                <Input id="needed_by" name="needed_by" type="date" value={formData.needed_by} onChange={handleChange} min={today} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={4} placeholder="Any additional notes about this material request..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href={`/jobs/${jobId}/inventory`}><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Material Request'}
          </Button>
        </div>
      </form>
    </div>
  )
}
