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

export default function NewInventoryItemPage() {
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile, user: authUser } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unit_of_measure: 'each',
    unit_cost: '',
    reorder_point: '',
    reorder_quantity: '',
    description: '',
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

      if (!formData.name.trim()) { setError('Item name is required'); setLoading(false); return }

      const { error: insertError } = await supabase
        .from('inventory_items')
        .insert({
          company_id: companyId,
          name: formData.name,
          sku: formData.sku || null,
          category: formData.category || null,
          unit_of_measure: formData.unit_of_measure,
          unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null,
          reorder_point: formData.reorder_point ? parseInt(formData.reorder_point) : null,
          reorder_quantity: formData.reorder_quantity ? parseInt(formData.reorder_quantity) : null,
          description: formData.description || null,
          is_active: true,
        })

      if (insertError) throw insertError

      toast.success('Inventory item created')
      router.push('/inventory')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to add inventory item'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/inventory" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Inventory
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Add Inventory Item</h1>
        <p className="text-muted-foreground">Add a material or supply to track</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>Name, SKU, and unit of measure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Item Name <span className="text-red-500">*</span></label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder='e.g., 2x4x8 Lumber' required />
              </div>
              <div className="space-y-2">
                <label htmlFor="sku" className="text-sm font-medium">SKU</label>
                <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} placeholder="LBR-2x4x8" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">Category</label>
                <Input id="category" name="category" value={formData.category} onChange={handleChange} placeholder="Lumber, Fasteners, Pipe..." />
              </div>
              <div className="space-y-2">
                <label htmlFor="unit_of_measure" className="text-sm font-medium">Unit of Measure <span className="text-red-500">*</span></label>
                <select id="unit_of_measure" name="unit_of_measure" value={formData.unit_of_measure} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="each">Each</option>
                  <option value="linear_ft">Linear Ft</option>
                  <option value="sq_ft">Sq Ft</option>
                  <option value="cu_yd">Cu Yd</option>
                  <option value="ton">Ton</option>
                  <option value="gallon">Gallon</option>
                  <option value="box">Box</option>
                  <option value="bag">Bag</option>
                  <option value="roll">Roll</option>
                  <option value="sheet">Sheet</option>
                  <option value="bundle">Bundle</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & Reorder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="unit_cost" className="text-sm font-medium">Unit Cost</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="unit_cost" name="unit_cost" type="number" step="0.01" value={formData.unit_cost} onChange={handleChange} placeholder="0.00" className="pl-7" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="reorder_point" className="text-sm font-medium">Reorder Point</label>
                <Input id="reorder_point" name="reorder_point" type="number" value={formData.reorder_point} onChange={handleChange} placeholder="10" />
              </div>
              <div className="space-y-2">
                <label htmlFor="reorder_quantity" className="text-sm font-medium">Reorder Qty</label>
                <Input id="reorder_quantity" name="reorder_quantity" type="number" value={formData.reorder_quantity} onChange={handleChange} placeholder="50" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Description</CardTitle></CardHeader>
          <CardContent>
            <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Specifications, preferred suppliers, etc..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/inventory"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Add Item'}
          </Button>
        </div>
      </form>
    </div>
  )
}
