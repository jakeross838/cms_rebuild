'use client'

import { useMemo, useState } from 'react'

import {
  Check,
  Edit3,
  Loader2,
  Minus,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  useInvoiceLineItems,
  useCreateLineItem,
  useUpdateLineItem,
  useDeleteLineItem,
} from '@/hooks/use-invoices'
import type { InvoiceLineItem } from '@/types/invoice-full'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface LineItemsTabProps {
  invoiceId: string
}

export function LineItemsTab({ invoiceId }: LineItemsTabProps) {
  const { data: response, isLoading } = useInvoiceLineItems(invoiceId)
  const createMutation = useCreateLineItem(invoiceId)
  const updateMutation = useUpdateLineItem(invoiceId)
  const deleteMutation = useDeleteLineItem(invoiceId)

  const lineItems = ((response as { data: InvoiceLineItem[] } | undefined)?.data ?? []) as InvoiceLineItem[]

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newItem, setNewItem] = useState({
    description: '',
    quantity: '1',
    unit: 'EA',
    unit_price: '',
    cost_code_label: '',
  })
  const [editItem, setEditItem] = useState({
    description: '',
    quantity: '',
    unit: '',
    unit_price: '',
    cost_code_label: '',
  })

  const total = useMemo(() => lineItems.reduce((sum, li) => sum + (li.amount ?? 0), 0), [lineItems])

  const handleAddItem = async () => {
    const qty = parseFloat(newItem.quantity) || 1
    const price = parseFloat(newItem.unit_price) || 0
    try {
      await createMutation.mutateAsync({
        description: newItem.description,
        quantity: qty,
        unit: newItem.unit || 'EA',
        unit_price: price,
        amount: qty * price,
        cost_code_label: newItem.cost_code_label || null,
      })
      toast.success('Line item added')
      setNewItem({ description: '', quantity: '1', unit: 'EA', unit_price: '', cost_code_label: '' })
      setShowAddForm(false)
    } catch {
      toast.error('Failed to add line item')
    }
  }

  const startEdit = (li: InvoiceLineItem) => {
    setEditingId(li.id)
    setEditItem({
      description: li.description,
      quantity: li.quantity.toString(),
      unit: li.unit,
      unit_price: li.unit_price.toString(),
      cost_code_label: li.cost_code_label ?? '',
    })
  }

  const handleUpdateItem = async (id: string) => {
    const qty = parseFloat(editItem.quantity) || 1
    const price = parseFloat(editItem.unit_price) || 0
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          description: editItem.description,
          quantity: qty,
          unit: editItem.unit || 'EA',
          unit_price: price,
          amount: qty * price,
          cost_code_label: editItem.cost_code_label || null,
        },
      })
      toast.success('Line item updated')
      setEditingId(null)
    } catch {
      toast.error('Failed to update line item')
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Line item deleted')
    } catch {
      toast.error('Failed to delete line item')
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{lineItems.length} line item{lineItems.length !== 1 ? 's' : ''}</h3>
        <Button size="sm" variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? <Minus className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showAddForm ? 'Cancel' : 'Add Line Item'}
        </Button>
      </div>

      {/* Add line item form */}
      {showAddForm && (
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <Input value={newItem.description} onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))} placeholder="Description" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Qty</label>
                <Input type="number" value={newItem.quantity} onChange={(e) => setNewItem((p) => ({ ...p, quantity: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Unit</label>
                <Input value={newItem.unit} onChange={(e) => setNewItem((p) => ({ ...p, unit: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Unit Price</label>
                <Input type="number" step="0.01" value={newItem.unit_price} onChange={(e) => setNewItem((p) => ({ ...p, unit_price: e.target.value }))} placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Cost Code</label>
                <Input value={newItem.cost_code_label} onChange={(e) => setNewItem((p) => ({ ...p, cost_code_label: e.target.value }))} placeholder="Optional" />
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <Button size="sm" onClick={handleAddItem} disabled={!newItem.description || createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Description</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-20">Qty</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-20">Unit</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-28">Unit Price</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-28">Amount</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-28">Cost Code</th>
                  <th className="px-4 py-2.5 w-20" />
                </tr>
              </thead>
              <tbody>
                {lineItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">No line items yet</td>
                  </tr>
                ) : (
                  lineItems.map((li) => (
                    editingId === li.id ? (
                      <tr key={li.id} className="border-b bg-muted/20">
                        <td className="px-4 py-2"><Input value={editItem.description} onChange={(e) => setEditItem((p) => ({ ...p, description: e.target.value }))} className="h-8" /></td>
                        <td className="px-4 py-2"><Input type="number" value={editItem.quantity} onChange={(e) => setEditItem((p) => ({ ...p, quantity: e.target.value }))} className="h-8 text-right" /></td>
                        <td className="px-4 py-2"><Input value={editItem.unit} onChange={(e) => setEditItem((p) => ({ ...p, unit: e.target.value }))} className="h-8" /></td>
                        <td className="px-4 py-2"><Input type="number" step="0.01" value={editItem.unit_price} onChange={(e) => setEditItem((p) => ({ ...p, unit_price: e.target.value }))} className="h-8 text-right" /></td>
                        <td className="px-4 py-2 text-right font-medium">{formatCurrency((parseFloat(editItem.quantity) || 0) * (parseFloat(editItem.unit_price) || 0))}</td>
                        <td className="px-4 py-2"><Input value={editItem.cost_code_label} onChange={(e) => setEditItem((p) => ({ ...p, cost_code_label: e.target.value }))} className="h-8" /></td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleUpdateItem(li.id)} disabled={updateMutation.isPending}>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingId(null)}>
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={li.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-2.5">{li.description}</td>
                        <td className="px-4 py-2.5 text-right">{li.quantity}</td>
                        <td className="px-4 py-2.5">{li.unit}</td>
                        <td className="px-4 py-2.5 text-right">{formatCurrency(li.unit_price)}</td>
                        <td className="px-4 py-2.5 text-right font-medium">{formatCurrency(li.amount)}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{li.cost_codes ? `${li.cost_codes.code}` : li.cost_code_label || '--'}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEdit(li)}>
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDeleteItem(li.id)} disabled={deleteMutation.isPending}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  ))
                )}
              </tbody>
              {lineItems.length > 0 && (
                <tfoot>
                  <tr className="bg-muted/50 font-medium">
                    <td className="px-4 py-2.5" colSpan={4}>Total</td>
                    <td className="px-4 py-2.5 text-right">{formatCurrency(total)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
