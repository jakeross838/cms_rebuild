'use client'

import { useEffect, useMemo, useState } from 'react'

import {
  AlertTriangle,
  Edit3,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  useInvoiceAllocations,
  useSaveAllocations,
} from '@/hooks/use-invoices'
import type { InvoiceAllocation } from '@/types/invoice-full'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface AllocationsTabProps {
  invoiceId: string
  invoiceAmount: number
}

export function AllocationsTab({ invoiceId, invoiceAmount }: AllocationsTabProps) {
  const { data: response, isLoading } = useInvoiceAllocations(invoiceId)
  const saveMutation = useSaveAllocations(invoiceId)

  const allocations = ((response as { data: InvoiceAllocation[] } | undefined)?.data ?? []) as InvoiceAllocation[]

  const [editMode, setEditMode] = useState(false)
  const [editRows, setEditRows] = useState<{
    id?: string
    job_id: string
    cost_code_id: string
    phase: string
    amount: string
    percent: string
    po_id: string
    description: string
  }[]>([])

  const allocatedTotal = useMemo(
    () => (editMode ? editRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0) : allocations.reduce((s, a) => s + a.amount, 0)),
    [editMode, editRows, allocations]
  )
  const difference = invoiceAmount - allocatedTotal

  useEffect(() => {
    if (allocations.length > 0 && editRows.length === 0) {
      setEditRows(
        allocations.map((a) => ({
          id: a.id,
          job_id: a.job_id ?? '',
          cost_code_id: a.cost_code_id ?? '',
          phase: a.phase ?? '',
          amount: a.amount.toString(),
          percent: a.percent?.toString() ?? '',
          po_id: a.po_id ?? '',
          description: a.description ?? '',
        }))
      )
    }
  }, [allocations, editRows.length])

  const startEdit = () => {
    setEditRows(
      allocations.length > 0
        ? allocations.map((a) => ({
            id: a.id,
            job_id: a.job_id ?? '',
            cost_code_id: a.cost_code_id ?? '',
            phase: a.phase ?? '',
            amount: a.amount.toString(),
            percent: a.percent?.toString() ?? '',
            po_id: a.po_id ?? '',
            description: a.description ?? '',
          }))
        : [{ job_id: '', cost_code_id: '', phase: '', amount: invoiceAmount.toString(), percent: '100', po_id: '', description: '' }]
    )
    setEditMode(true)
  }

  const addRow = () => {
    setEditRows((prev) => [...prev, { job_id: '', cost_code_id: '', phase: '', amount: '', percent: '', po_id: '', description: '' }])
  }

  const removeRow = (idx: number) => {
    setEditRows((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateRow = (idx: number, field: string, value: string) => {
    setEditRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)))
  }

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(
        editRows.map((r, i) => ({
          id: r.id,
          job_id: r.job_id || null,
          cost_code_id: r.cost_code_id || null,
          phase: r.phase || null,
          amount: parseFloat(r.amount) || 0,
          percent: r.percent ? parseFloat(r.percent) : null,
          po_id: r.po_id || null,
          description: r.description || null,
          sort_order: i,
        }))
      )
      toast.success('Allocations saved')
      setEditMode(false)
    } catch {
      toast.error('Failed to save allocations')
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">{allocations.length} allocation{allocations.length !== 1 ? 's' : ''}</h3>
          {Math.abs(difference) > 0.01 && (
            <Badge className="bg-warning-bg text-warning-dark">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {difference > 0 ? `${formatCurrency(difference)} unallocated` : `${formatCurrency(Math.abs(difference))} over-allocated`}
            </Badge>
          )}
        </div>
        {!editMode ? (
          <Button size="sm" variant="outline" onClick={startEdit}>
            <Edit3 className="h-4 w-4 mr-1" />Edit Allocations
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Save
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Job</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Cost Code</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-24">Phase</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-28">Amount</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-20">%</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">PO</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Description</th>
                  {editMode && <th className="px-4 py-2.5 w-12" />}
                </tr>
              </thead>
              <tbody>
                {editMode ? (
                  editRows.map((row, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-4 py-2"><Input value={row.job_id} onChange={(e) => updateRow(idx, 'job_id', e.target.value)} className="h-8" placeholder="Job ID" /></td>
                      <td className="px-4 py-2"><Input value={row.cost_code_id} onChange={(e) => updateRow(idx, 'cost_code_id', e.target.value)} className="h-8" placeholder="Cost Code ID" /></td>
                      <td className="px-4 py-2"><Input value={row.phase} onChange={(e) => updateRow(idx, 'phase', e.target.value)} className="h-8" /></td>
                      <td className="px-4 py-2"><Input type="number" step="0.01" value={row.amount} onChange={(e) => updateRow(idx, 'amount', e.target.value)} className="h-8 text-right" /></td>
                      <td className="px-4 py-2"><Input type="number" step="0.01" value={row.percent} onChange={(e) => updateRow(idx, 'percent', e.target.value)} className="h-8 text-right" /></td>
                      <td className="px-4 py-2"><Input value={row.po_id} onChange={(e) => updateRow(idx, 'po_id', e.target.value)} className="h-8" placeholder="PO ID" /></td>
                      <td className="px-4 py-2"><Input value={row.description} onChange={(e) => updateRow(idx, 'description', e.target.value)} className="h-8" /></td>
                      <td className="px-4 py-2">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => removeRow(idx)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : allocations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">No allocations yet</td>
                  </tr>
                ) : (
                  allocations.map((a) => (
                    <tr key={a.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-2.5">{a.jobs?.name ?? a.job_id ?? '--'}</td>
                      <td className="px-4 py-2.5">{a.cost_codes ? `${a.cost_codes.code} - ${a.cost_codes.name}` : a.cost_code_id ?? '--'}</td>
                      <td className="px-4 py-2.5">{a.phase ?? '--'}</td>
                      <td className="px-4 py-2.5 text-right font-medium">{formatCurrency(a.amount)}</td>
                      <td className="px-4 py-2.5 text-right">{a.percent != null ? `${a.percent}%` : '--'}</td>
                      <td className="px-4 py-2.5">{a.purchase_orders?.po_number ?? a.po_id ?? '--'}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{a.description ?? '--'}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {((editMode && editRows.length > 0) || (!editMode && allocations.length > 0)) && (
                <tfoot>
                  <tr className="bg-muted/50 font-medium">
                    <td className="px-4 py-2.5" colSpan={3}>Total</td>
                    <td className="px-4 py-2.5 text-right">{formatCurrency(allocatedTotal)}</td>
                    <td colSpan={editMode ? 4 : 3} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      {editMode && (
        <Button size="sm" variant="outline" onClick={addRow}>
          <Plus className="h-4 w-4 mr-1" />Add Row
        </Button>
      )}
    </div>
  )
}
