'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { useChangeOrder, useUpdateChangeOrder, useDeleteChangeOrder } from '@/hooks/use-change-orders'
import { formatCurrency, formatDate, formatStatus, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

// -- Types --------------------------------------------------------------------

interface ChangeOrderData {
  id: string
  co_number: string | null
  title: string
  description: string | null
  change_type: string | null
  status: string | null
  amount: number | null
  cost_impact: number | null
  schedule_impact_days: number | null
  approved_by: string | null
  approved_at: string | null
  client_approved: boolean | null
  client_approved_at: string | null
  created_at: string | null
}

// -- Component ----------------------------------------------------------------

export default function ChangeOrderDetailPage() {
  const params = useParams()
  const router = useRouter()

  const coId = params.id as string
  const { data: response, isLoading: loading, error: fetchError } = useChangeOrder(coId)
  const updateCO = useUpdateChangeOrder(coId)
  const deleteCO = useDeleteChangeOrder()
  const changeOrder = (response as { data: ChangeOrderData } | undefined)?.data ?? null

  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    co_number: '',
    title: '',
    description: '',
    change_type: 'owner_requested',
    status: 'draft',
    amount: '',
    cost_impact: '',
    schedule_impact_days: '',
  })

  useEffect(() => {
    if (changeOrder) {
      setFormData({
        co_number: changeOrder.co_number || '',
        title: changeOrder.title,
        description: changeOrder.description || '',
        change_type: changeOrder.change_type || 'owner_requested',
        status: changeOrder.status || 'draft',
        amount: changeOrder.amount != null ? String(changeOrder.amount) : '',
        cost_impact: changeOrder.cost_impact != null ? String(changeOrder.cost_impact) : '',
        schedule_impact_days: changeOrder.schedule_impact_days != null ? String(changeOrder.schedule_impact_days) : '',
      })
    }
  }, [changeOrder])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.title.trim()) { toast.error('Title is required'); return }

    try {
      await updateCO.mutateAsync({
        co_number: formData.co_number || undefined,
        title: formData.title,
        description: formData.description || null,
        change_type: formData.change_type,
        status: formData.status,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        cost_impact: formData.cost_impact ? parseFloat(formData.cost_impact) : null,
        schedule_impact_days: formData.schedule_impact_days ? parseInt(formData.schedule_impact_days, 10) : null,
      } as Record<string, unknown>)

      toast.success('Change order updated')
      setEditing(false)
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to save change order')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteCO.mutateAsync(coId)
      toast.success('Change order archived')
      router.push('/change-orders')
      router.refresh()
    } catch (err) {
      const msg = (err as Error)?.message || 'Operation failed'
      toast.error(msg)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!changeOrder) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/change-orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Change Orders
        </Link>
        <p className="text-destructive">{fetchError?.message || 'Change order not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/change-orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Change Orders
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{changeOrder.title}</h1>
              <Badge className={getStatusColor(changeOrder.status || 'draft')}>{formatStatus(changeOrder.status || 'draft')}</Badge>
            </div>
            <p className="text-muted-foreground">
              {changeOrder.co_number ? `${changeOrder.co_number} \u00b7 ` : ''}
              {changeOrder.change_type ? `${formatStatus(changeOrder.change_type)} \u00b7 ` : ''}
              Created {formatDate(changeOrder.created_at) || 'Unknown'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
            ) : (
              <>
                <Button onClick={() => setEditing(false)} variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={updateCO.isPending}>
                  {updateCO.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
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
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{changeOrder.description || 'No description provided'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">CO Number</dt>
                    <dd className="font-medium">{changeOrder.co_number || 'None'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Change Type</dt>
                    <dd className="font-medium">{changeOrder.change_type ? formatStatus(changeOrder.change_type) : 'None'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Amount</dt>
                    <dd className="font-medium">{formatCurrency(changeOrder.amount)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Cost Impact</dt>
                    <dd className="font-medium">{formatCurrency(changeOrder.cost_impact)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Schedule Impact</dt>
                    <dd className="font-medium">{changeOrder.schedule_impact_days != null ? `${changeOrder.schedule_impact_days} day${changeOrder.schedule_impact_days !== 1 ? 's' : ''}` : 'None'}</dd>
                  </div>
                  {changeOrder.approved_at && (
                    <div>
                      <dt className="text-muted-foreground">Approved</dt>
                      <dd className="font-medium">{formatDate(changeOrder.approved_at)}</dd>
                    </div>
                  )}
                  {changeOrder.client_approved != null && (
                    <div>
                      <dt className="text-muted-foreground">Client Approved</dt>
                      <dd className="font-medium">
                        {changeOrder.client_approved ? 'Yes' : 'No'}
                        {changeOrder.client_approved_at ? ` (${formatDate(changeOrder.client_approved_at)})` : ''}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Change Order
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Change Order Details</CardTitle>
                <CardDescription>Update change order information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="co_number" className="text-sm font-medium">CO Number</label>
                    <Input id="co_number" name="co_number" value={formData.co_number} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="draft">Draft</option>
                      <option value="pending_approval">Pending Approval</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="voided">Voided</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                  <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={4} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="change_type" className="text-sm font-medium">Change Type</label>
                  <select id="change_type" name="change_type" value={formData.change_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="owner_requested">Owner Requested</option>
                    <option value="field_condition">Field Condition</option>
                    <option value="design_change">Design Change</option>
                    <option value="regulatory">Regulatory</option>
                    <option value="allowance">Allowance</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial &amp; Schedule Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="amount" className="text-sm font-medium">Amount ($)</label>
                    <Input id="amount" name="amount" type="number" step="0.01" min="0" value={formData.amount} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="cost_impact" className="text-sm font-medium">Cost Impact ($)</label>
                    <Input id="cost_impact" name="cost_impact" type="number" step="0.01" min="0" value={formData.cost_impact} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="schedule_impact_days" className="text-sm font-medium">Schedule Impact (days)</label>
                    <Input id="schedule_impact_days" name="schedule_impact_days" type="number" min="0" value={formData.schedule_impact_days} onChange={handleChange} />
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
        title="Archive change order?"
        description="This change order will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
