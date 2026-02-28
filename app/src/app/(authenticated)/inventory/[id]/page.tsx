'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Package, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useInventoryItem, useUpdateInventoryItem, useDeleteInventoryItem } from '@/hooks/use-inventory'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface InventoryItemData {
  id: string
  name: string
  sku: string | null
  description: string | null
  category: string | null
  unit_of_measure: string
  unit_cost: number | null
  reorder_point: number | null
  reorder_quantity: number | null
  is_active: boolean
  deleted_at: string | null
  created_at: string | null
}

export default function InventoryItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const entityId = params.id as string

  const { data: response, isLoading: loading, error: fetchError } = useInventoryItem(entityId)
  const updateItem = useUpdateInventoryItem(entityId)
  const deleteItem = useDeleteInventoryItem()
  const item = (response as { data: InventoryItemData } | undefined)?.data ?? null

  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [archiving, setArchiving] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    unit_of_measure: 'each',
    unit_cost: '',
    reorder_point: '',
    reorder_quantity: '',
    is_active: true,
  })

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        sku: item.sku || '',
        description: item.description || '',
        category: item.category || '',
        unit_of_measure: item.unit_of_measure,
        unit_cost: item.unit_cost != null ? String(item.unit_cost) : '',
        reorder_point: item.reorder_point != null ? String(item.reorder_point) : '',
        reorder_quantity: item.reorder_quantity != null ? String(item.reorder_quantity) : '',
        is_active: item.is_active,
      })
    }
  }, [item])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error('Name is required'); return }
    if (!formData.unit_of_measure) { toast.error('Unit of Measure is required'); return }

    try {
      await updateItem.mutateAsync({
        name: formData.name,
        sku: formData.sku || null,
        description: formData.description || null,
        category: formData.category || null,
        unit_of_measure: formData.unit_of_measure,
        unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : 0,
        reorder_point: formData.reorder_point ? parseFloat(formData.reorder_point) : 0,
        reorder_quantity: formData.reorder_quantity ? parseFloat(formData.reorder_quantity) : 0,
        is_active: formData.is_active,
      } as Record<string, unknown>)
      toast.success('Saved')
      setEditing(false)
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to save')
    }
  }

  const handleArchive = async () => {
    try {
      setArchiving(true)
      await deleteItem.mutateAsync(entityId)
      toast.success('Archived')
      router.push('/inventory')
      router.refresh()
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to archive')
      setArchiving(false)
    }
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
        <p className="text-destructive">{fetchError?.message || 'Inventory item not found'}</p>
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
            <h1 className="text-2xl font-bold text-foreground">{item.name}</h1>
            <p className="text-muted-foreground">
              {item.sku ? `SKU: ${item.sku}` : 'No SKU'} &bull; {item.unit_of_measure}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
            ) : (
              <>
                <Button onClick={() => { setEditing(false); setError(null) }} variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={updateItem.isPending}>
                  {updateItem.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {fetchError && <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{fetchError.message}</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Item Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="text-sm font-medium">{item.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">SKU</p>
                    <p className="text-sm font-medium">{item.sku || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="text-sm font-medium">{item.category || 'Uncategorized'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Unit of Measure</p>
                    <p className="text-sm font-medium">{item.unit_of_measure}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Unit Cost</p>
                    <p className="text-sm font-medium">{item.unit_cost != null ? formatCurrency(item.unit_cost) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="text-sm font-medium">{item.is_active ? 'Active' : 'Inactive'}</p>
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

            <Card>
              <CardHeader><CardTitle>Reorder Settings</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Reorder Point</p>
                    <p className="text-sm font-medium">{item.reorder_point != null ? item.reorder_point : 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reorder Quantity</p>
                    <p className="text-sm font-medium">{item.reorder_quantity != null ? item.reorder_quantity : 'Not set'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)} disabled={archiving}>
                {archiving ? 'Archiving...' : 'Archive Item'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
                <CardDescription>Update inventory item information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="sku" className="text-sm font-medium">SKU</label>
                    <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} placeholder="e.g., MAT-001" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <Input id="category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Lumber, Electrical" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="unit_of_measure" className="text-sm font-medium">Unit of Measure <span className="text-red-500">*</span></label>
                    <select id="unit_of_measure" name="unit_of_measure" value={formData.unit_of_measure} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="each">Each</option>
                      <option value="lf">Linear Foot (LF)</option>
                      <option value="sf">Square Foot (SF)</option>
                      <option value="cy">Cubic Yard (CY)</option>
                      <option value="ton">Ton</option>
                      <option value="lb">Pound (LB)</option>
                      <option value="gal">Gallon</option>
                      <option value="box">Box</option>
                      <option value="bundle">Bundle</option>
                      <option value="roll">Roll</option>
                      <option value="bag">Bag</option>
                      <option value="sheet">Sheet</option>
                      <option value="pallet">Pallet</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="unit_cost" className="text-sm font-medium">Unit Cost ($)</label>
                    <Input id="unit_cost" name="unit_cost" type="number" step="0.01" min="0" value={formData.unit_cost} onChange={handleChange} placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="is_active" className="text-sm font-medium">Status</label>
                  <select id="is_active" name="is_active" value={formData.is_active ? 'true' : 'false'} onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.value === 'true' }))} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Description</CardTitle></CardHeader>
              <CardContent>
                <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Item description..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reorder Settings</CardTitle>
                <CardDescription>Set thresholds for automatic reorder alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="reorder_point" className="text-sm font-medium">Reorder Point</label>
                    <Input id="reorder_point" name="reorder_point" type="number" step="1" min="0" value={formData.reorder_point} onChange={handleChange} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="reorder_quantity" className="text-sm font-medium">Reorder Quantity</label>
                    <Input id="reorder_quantity" name="reorder_quantity" type="number" step="1" min="0" value={formData.reorder_quantity} onChange={handleChange} placeholder="0" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive inventory item?"
        description="This inventory item will be archived. It can be restored later."
        confirmLabel="Archive"
        onConfirm={handleArchive}
      />
    </div>
  )
}
