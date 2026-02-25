'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'

interface InventoryItemData {
  id: string
  name: string
  sku: string | null
  category: string | null
  unit_of_measure: string
  unit_cost: number | null
  reorder_point: number | null
  reorder_quantity: number | null
  is_active: boolean
  description: string | null
  created_at: string | null
}

export default function InventoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [item, setItem] = useState<InventoryItemData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unit_of_measure: '',
    unit_cost: '',
    reorder_point: '',
    reorder_quantity: '',
    description: '',
  })

  useEffect(() => {
    async function loadItem() {
      const { data, error: fetchError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', params.id as string)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Inventory item not found')
        setLoading(false)
        return
      }

      const i = data as InventoryItemData
      setItem(i)
      setFormData({
        name: i.name,
        sku: i.sku || '',
        category: i.category || '',
        unit_of_measure: i.unit_of_measure || '',
        unit_cost: i.unit_cost?.toString() || '',
        reorder_point: i.reorder_point?.toString() || '',
        reorder_quantity: i.reorder_quantity?.toString() || '',
        description: i.description || '',
      })
      setLoading(false)
    }
    loadItem()
  }, [params.id, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({
          name: formData.name,
          sku: formData.sku || null,
          category: formData.category || null,
          unit_of_measure: formData.unit_of_measure,
          unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null,
          reorder_point: formData.reorder_point ? parseInt(formData.reorder_point) : null,
          reorder_quantity: formData.reorder_quantity ? parseInt(formData.reorder_quantity) : null,
          description: formData.description || null,
        })
        .eq('id', params.id as string)

      if (updateError) throw updateError

      setItem((prev) => prev ? {
        ...prev,
        name: formData.name,
        sku: formData.sku || null,
        category: formData.category || null,
        unit_of_measure: formData.unit_of_measure,
        unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null,
        reorder_point: formData.reorder_point ? parseInt(formData.reorder_point) : null,
        reorder_quantity: formData.reorder_quantity ? parseInt(formData.reorder_quantity) : null,
        description: formData.description || null,
      } : prev)
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Archive this inventory item? It can be restored later.')) return

    const { error: deleteError } = await supabase
      .from('inventory_items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id as string)

    if (deleteError) {
      setError('Failed to archive inventory item')
      return
    }

    router.push('/inventory')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/inventory" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Inventory
        </Link>
        <p className="text-destructive">{error || 'Inventory item not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/inventory" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Inventory
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{item.name}</h1>
              <Badge className={item.is_active ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}>
                {item.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {item.sku ? `SKU: ${item.sku} — ` : ''}{item.category || 'Uncategorized'} — {item.unit_of_measure}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
            ) : (
              <>
                <Button onClick={() => setEditing(false)} variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Inventory item updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">SKU</p>
                    <p className="text-sm font-medium">{item.sku || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="text-sm font-medium">{item.category || 'Uncategorized'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unit of Measure</p>
                    <p className="text-sm font-medium">{item.unit_of_measure}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unit Cost</p>
                    <p className="text-sm font-medium">{item.unit_cost != null ? formatCurrency(item.unit_cost) : 'Not set'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reorder Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Reorder Point</p>
                    <p className="text-sm font-medium">{item.reorder_point != null ? item.reorder_point : 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reorder Quantity</p>
                    <p className="text-sm font-medium">{item.reorder_quantity != null ? item.reorder_quantity : 'Not set'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {item.description && (
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.description}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={handleDelete}>
                Archive Item
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Item Information</CardTitle>
                <CardDescription>Update inventory item details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="sku" className="text-sm font-medium">SKU</label>
                    <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} placeholder="e.g., MAT-001" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <Input id="category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Lumber, Hardware" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="unit_of_measure" className="text-sm font-medium">Unit of Measure</label>
                    <Input id="unit_of_measure" name="unit_of_measure" value={formData.unit_of_measure} onChange={handleChange} placeholder="e.g., each, sqft, lf" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="unit_cost" className="text-sm font-medium">Unit Cost ($)</label>
                    <Input id="unit_cost" name="unit_cost" type="number" step="0.01" value={formData.unit_cost} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="reorder_point" className="text-sm font-medium">Reorder Point</label>
                    <Input id="reorder_point" name="reorder_point" type="number" value={formData.reorder_point} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="reorder_quantity" className="text-sm font-medium">Reorder Quantity</label>
                    <Input id="reorder_quantity" name="reorder_quantity" type="number" value={formData.reorder_quantity} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
