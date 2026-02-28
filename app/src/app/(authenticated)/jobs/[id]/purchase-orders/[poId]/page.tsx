'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { usePurchaseOrder, useUpdatePurchaseOrder, useDeletePurchaseOrder } from '@/hooks/use-purchase-orders'
import { formatCurrency, formatDate, getStatusColor, formatStatus } from '@/lib/utils'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────

interface PurchaseOrderData {
  id: string
  po_number: string
  title: string
  vendor_id: string
  status: string
  subtotal: number
  tax_amount: number
  shipping_amount: number
  total_amount: number
  delivery_date: string | null
  shipping_address: string | null
  terms: string | null
  notes: string | null
  created_at: string
  vendor_name: string | null
}

interface POFormData {
  title: string
  status: string
  subtotal: string
  tax_amount: string
  shipping_amount: string
  delivery_date: string
  shipping_address: string
  terms: string
  notes: string
}

const STATUS_OPTIONS = ['draft', 'sent', 'acknowledged', 'partially_received', 'received', 'cancelled']

// ── Component ──────────────────────────────────────────────────

export default function PurchaseOrderDetailPage() {
  const params = useParams()
  const router = useRouter()

  const jobId = params.id as string
  const poId = params.poId as string

  const { data: response, isLoading: loading, error: fetchError } = usePurchaseOrder(poId)
  const updatePurchaseOrder = useUpdatePurchaseOrder(poId)
  const deletePurchaseOrder = useDeletePurchaseOrder()
  const po = (response as { data: PurchaseOrderData } | undefined)?.data ?? null

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [archiving, setArchiving] = useState(false)

  const [formData, setFormData] = useState<POFormData>({
    title: '',
    status: '',
    subtotal: '',
    tax_amount: '',
    shipping_amount: '',
    delivery_date: '',
    shipping_address: '',
    terms: '',
    notes: '',
  })

  useEffect(() => {
    if (po) {
      setFormData({
        title: po.title,
        status: po.status,
        subtotal: String(po.subtotal),
        tax_amount: String(po.tax_amount),
        shipping_amount: String(po.shipping_amount),
        delivery_date: po.delivery_date || '',
        shipping_address: po.shipping_address || '',
        terms: po.terms || '',
        notes: po.notes || '',
      })
    }
  }, [po])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const subtotal = Number(formData.subtotal) || 0
      const tax = Number(formData.tax_amount) || 0
      const shipping = Number(formData.shipping_amount) || 0

      await updatePurchaseOrder.mutateAsync({
        title: formData.title,
        status: formData.status,
        subtotal,
        tax_amount: tax,
        shipping_amount: shipping,
        total_amount: subtotal + tax + shipping,
        delivery_date: formData.delivery_date || null,
        shipping_address: formData.shipping_address || null,
        terms: formData.terms || null,
        notes: formData.notes || null,
      } as never)
      setSuccess(true)
      setEditing(false)
      toast.success('Updated')
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to save'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setArchiving(true)
      await deletePurchaseOrder.mutateAsync(poId)
      toast.success('Archived')
      router.push(`/jobs/${jobId}/purchase-orders`)
      router.refresh()
    } catch (err) {
      const msg = (err as Error)?.message || 'Operation failed'
      setError(msg)
      toast.error(msg)
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

  if (!po) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href={`/jobs/${jobId}/purchase-orders`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Purchase Orders
        </Link>
        <p className="text-destructive">{error || 'Purchase order not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/purchase-orders`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Purchase Orders
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{po.po_number}</h1>
              <Badge className={getStatusColor(po.status)}>
                {formatStatus(po.status)}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {po.title} {po.vendor_name ? `- ${po.vendor_name}` : ''}
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Purchase order updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-3">
                  <p className="text-sm text-muted-foreground">Subtotal</p>
                  <p className="text-lg font-bold">{formatCurrency(po.subtotal)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="text-sm text-muted-foreground">Tax</p>
                  <p className="text-lg font-bold">{formatCurrency(po.tax_amount)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="text-sm text-muted-foreground">Shipping</p>
                  <p className="text-lg font-bold">{formatCurrency(po.shipping_amount)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-lg font-bold">{formatCurrency(po.total_amount)}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Vendor</span>
                    <p className="font-medium">{po.vendor_name || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Delivery Date</span>
                    <p className="font-medium">{po.delivery_date ? formatDate(po.delivery_date) : 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Shipping Address</span>
                    <p className="font-medium">{po.shipping_address || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Terms</span>
                    <p className="font-medium">{po.terms || 'None'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created</span>
                    <p className="font-medium">{formatDate(po.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {po.notes && (
              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{po.notes}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)} disabled={archiving}>
                {archiving ? 'Archiving...' : 'Archive Purchase Order'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
                <CardDescription>Update purchase order details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                  <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{formatStatus(s)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="delivery_date" className="text-sm font-medium">Delivery Date</label>
                    <Input id="delivery_date" name="delivery_date" type="date" value={formData.delivery_date} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Amounts</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="subtotal" className="text-sm font-medium">Subtotal</label>
                    <Input id="subtotal" name="subtotal" type="number" step="0.01" value={formData.subtotal} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="tax_amount" className="text-sm font-medium">Tax</label>
                    <Input id="tax_amount" name="tax_amount" type="number" step="0.01" value={formData.tax_amount} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="shipping_amount" className="text-sm font-medium">Shipping</label>
                    <Input id="shipping_amount" name="shipping_amount" type="number" step="0.01" value={formData.shipping_amount} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Delivery & Terms</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="shipping_address" className="text-sm font-medium">Shipping Address</label>
                  <Input id="shipping_address" name="shipping_address" value={formData.shipping_address} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="terms" className="text-sm font-medium">Terms</label>
                  <Input id="terms" name="terms" value={formData.terms} onChange={handleChange} placeholder="e.g., Net 30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardContent>
                <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive purchase order?"
        description="This purchase order will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
