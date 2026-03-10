'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Calendar, DollarSign, FileText, Loader2, MapPin, Plus, Save, ShoppingCart, Trash2, Truck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { usePurchaseOrder, useUpdatePurchaseOrder, useDeletePurchaseOrder, usePurchaseOrderLines, useCreatePoLine, useDeletePoLine } from '@/hooks/use-purchase-orders'
import { useJobs } from '@/hooks/use-jobs'
import { useVendors } from '@/hooks/use-vendors'
import { formatCurrency, formatDate, formatStatus, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

// ── Types ────────────────────────────────────────────────────────────

interface PurchaseOrderData {
  id: string
  po_number: string | null
  title: string | null
  status: string | null
  subtotal: number | null
  tax_amount: number | null
  shipping_amount: number | null
  total_amount: number | null
  delivery_date: string | null
  shipping_address: string | null
  terms: string | null
  notes: string | null
  job_id: string | null
  vendor_id: string | null
  approved_by: string | null
  approved_at: string | null
  sent_at: string | null
  created_by: string | null
  created_at: string | null
}

interface JobInfo {
  id: string
  name: string
  job_number: string | null
}

interface VendorInfo {
  id: string
  name: string
}

const PO_STATUSES = ['draft', 'pending_approval', 'approved', 'sent', 'partially_received', 'received', 'closed', 'voided']

// ── Component ────────────────────────────────────────────────────────

export default function PurchaseOrderDetailPage() {
  const params = useParams()
  const router = useRouter()

  const poId = params.id as string
  const { data: response, isLoading: loading, error: fetchError } = usePurchaseOrder(poId)
  const updatePo = useUpdatePurchaseOrder(poId)
  const deletePo = useDeletePurchaseOrder()
  const po = (response as { data: PurchaseOrderData } | undefined)?.data ?? null

  const { data: jobsResponse } = useJobs({ limit: 1000 } as Record<string, string | number | boolean | undefined>)
  const jobs = ((jobsResponse as { data: JobInfo[] } | undefined)?.data ?? []) as JobInfo[]
  const { data: vendorsResponse } = useVendors({ limit: 1000 } as Record<string, string | number | boolean | undefined>)
  const vendors = ((vendorsResponse as { data: VendorInfo[] } | undefined)?.data ?? []) as VendorInfo[]

  const { data: linesResponse } = usePurchaseOrderLines(poId)
  const poLines = (linesResponse as { data: { id: string; description: string; quantity: number; unit: string; unit_price: number; amount: number; received_quantity: number; cost_code_id: string | null; sort_order: number }[] } | undefined)?.data ?? []
  const createLine = useCreatePoLine(poId)
  const deleteLine = useDeletePoLine(poId)

  const job = jobs.find((j) => j.id === po?.job_id) ?? null
  const vendor = vendors.find((v) => v.id === po?.vendor_id) ?? null

  const [editing, setEditing] = useState(false)
  const [addingLine, setAddingLine] = useState(false)
  const [newLine, setNewLine] = useState({ description: '', quantity: '1', unit: 'ea', unit_price: '0' })
  const [error, setError] = useState<string | null>(null)
  const [archiving, setArchiving] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    po_number: '',
    title: '',
    status: '',
    job_id: '',
    vendor_id: '',
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
        po_number: po.po_number || '',
        title: po.title || '',
        status: po.status || 'draft',
        job_id: po.job_id || '',
        vendor_id: po.vendor_id || '',
        subtotal: po.subtotal != null ? String(po.subtotal) : '',
        tax_amount: po.tax_amount != null ? String(po.tax_amount) : '',
        shipping_amount: po.shipping_amount != null ? String(po.shipping_amount) : '',
        delivery_date: po.delivery_date || '',
        shipping_address: po.shipping_address || '',
        terms: po.terms || '',
        notes: po.notes || '',
      })
    }
  }, [po])

  // ── Handlers ──

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.title.trim()) { toast.error('Title is required'); return }

    setError(null)
    try {
      const subtotal = formData.subtotal ? parseFloat(formData.subtotal) : 0
      const taxAmount = formData.tax_amount ? parseFloat(formData.tax_amount) : 0
      const shippingAmount = formData.shipping_amount ? parseFloat(formData.shipping_amount) : 0
      const totalAmount = subtotal + taxAmount + shippingAmount

      await updatePo.mutateAsync({
        po_number: formData.po_number || null,
        title: formData.title || undefined,
        status: formData.status || undefined,
        job_id: formData.job_id || null,
        vendor_id: formData.vendor_id || null,
        subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        total_amount: totalAmount,
        delivery_date: formData.delivery_date || null,
        shipping_address: formData.shipping_address || null,
        terms: formData.terms || null,
        notes: formData.notes || null,
      })
      toast.success('Purchase order updated')
      setEditing(false)
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to save'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleArchive = async () => {
    try {
      setArchiving(true)
      await deletePo.mutateAsync(poId)
      toast.success('Purchase order archived')
      router.push('/purchase-orders')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to archive'
      setError(errorMessage)
      toast.error(errorMessage)
      setArchiving(false)
    }
  }

  const handleAddLine = async () => {
    if (!newLine.description.trim()) { toast.error('Description is required'); return }
    const qty = parseFloat(newLine.quantity) || 1
    const price = parseFloat(newLine.unit_price) || 0
    try {
      await createLine.mutateAsync({
        description: newLine.description,
        quantity: qty,
        unit: newLine.unit || 'ea',
        unit_price: price,
        amount: qty * price,
      })
      toast.success('Line item added')
      setNewLine({ description: '', quantity: '1', unit: 'ea', unit_price: '0' })
      setAddingLine(false)
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to add line')
    }
  }

  const handleDeleteLine = async (lineId: string) => {
    try {
      await deleteLine.mutateAsync(lineId)
      toast.success('Line item removed')
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to remove line')
    }
  }

  const selectClassName = 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
  const textareaClassName = 'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

  // ── Loading State ──

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // ── Not Found State ──

  if (!po) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/purchase-orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Purchase Orders
        </Link>
        <p className="text-destructive">{fetchError?.message || 'Purchase order not found'}</p>
      </div>
    )
  }

  // ── Main Render ──

  return (
    <div className="max-w-3xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-6">
        <Link href="/purchase-orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Purchase Orders
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{po.title || 'Untitled PO'}</h1>
              {po.status && (
                <Badge className={getStatusColor(po.status)}>
                  {formatStatus(po.status)}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {po.po_number || 'No PO number'} — Created {formatDate(po.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
            ) : (
              <>
                <Button onClick={() => { if (po) { setFormData({ po_number: po.po_number || '', title: po.title || '', status: po.status || 'draft', job_id: po.job_id || '', vendor_id: po.vendor_id || '', subtotal: po.subtotal != null ? String(po.subtotal) : '', tax_amount: po.tax_amount != null ? String(po.tax_amount) : '', shipping_amount: po.shipping_amount != null ? String(po.shipping_amount) : '', delivery_date: po.delivery_date || '', shipping_address: po.shipping_address || '', terms: po.terms || '', notes: po.notes || '' }) } setEditing(false); setError(null) }} variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={updatePo.isPending}>
                  {updatePo.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {fetchError && <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{fetchError.message}</div>}
      {error && <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            {/* ── View Mode ── */}

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  Financial Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="text-xs text-muted-foreground">Subtotal</p>
                    <p className="text-lg font-semibold text-foreground">{formatCurrency(po.subtotal)}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="text-xs text-muted-foreground">Tax</p>
                    <p className="text-lg font-semibold text-foreground">{formatCurrency(po.tax_amount)}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="text-xs text-muted-foreground">Shipping</p>
                    <p className="text-lg font-semibold text-foreground">{formatCurrency(po.shipping_amount)}</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-md">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(po.total_amount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    Line Items
                  </CardTitle>
                  {(po.status === 'draft' || po.status === 'pending_approval') && (
                    <Button size="sm" variant="outline" onClick={() => setAddingLine(true)}>
                      <Plus className="h-4 w-4 mr-1" />Add Line
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {poLines.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Description</th>
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">Qty</th>
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Unit</th>
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">Unit Price</th>
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">Amount</th>
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">Received</th>
                          {(po.status === 'draft' || po.status === 'pending_approval') && (
                            <th className="w-8" />
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {poLines.map((line) => (
                          <tr key={line.id}>
                            <td className="py-2 pr-3">{line.description}</td>
                            <td className="py-2 px-3 text-right">{line.quantity}</td>
                            <td className="py-2 px-3">{line.unit}</td>
                            <td className="py-2 px-3 text-right">{formatCurrency(line.unit_price)}</td>
                            <td className="py-2 px-3 text-right font-medium">{formatCurrency(line.amount)}</td>
                            <td className="py-2 px-3 text-right text-muted-foreground">{line.received_quantity}</td>
                            {(po.status === 'draft' || po.status === 'pending_approval') && (
                              <td className="py-2 pl-2">
                                <button onClick={() => handleDeleteLine(line.id)} className="text-muted-foreground hover:text-destructive" title="Remove line">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-border">
                          <td colSpan={4} className="py-2 pr-3 text-right font-medium">Total</td>
                          <td className="py-2 px-3 text-right font-bold">{formatCurrency(poLines.reduce((sum, l) => sum + l.amount, 0))}</td>
                          <td />
                          {(po.status === 'draft' || po.status === 'pending_approval') && <td />}
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No line items yet.</p>
                )}

                {/* Add Line Form */}
                {addingLine && (
                  <div className="mt-4 p-3 border border-border rounded-md space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="col-span-2 space-y-1">
                        <label className="text-xs text-muted-foreground">Description</label>
                        <Input value={newLine.description} onChange={(e) => setNewLine((p) => ({ ...p, description: e.target.value }))} placeholder="Item description" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Quantity</label>
                        <Input type="number" min="0" step="1" value={newLine.quantity} onChange={(e) => setNewLine((p) => ({ ...p, quantity: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Unit</label>
                        <Input value={newLine.unit} onChange={(e) => setNewLine((p) => ({ ...p, unit: e.target.value }))} placeholder="ea" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Unit Price</label>
                        <Input type="number" min="0" step="0.01" value={newLine.unit_price} onChange={(e) => setNewLine((p) => ({ ...p, unit_price: e.target.value }))} />
                      </div>
                      <div className="self-end text-sm text-muted-foreground">
                        = {formatCurrency((parseFloat(newLine.quantity) || 0) * (parseFloat(newLine.unit_price) || 0))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddLine} disabled={createLine.isPending}>
                        {createLine.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                        Add
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setAddingLine(false); setNewLine({ description: '', quantity: '1', unit: 'ea', unit_price: '0' }) }}>Cancel</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job & Vendor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                  PO Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">PO Number:</span>
                  <span>{po.po_number || 'Not assigned'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Job:</span>
                  <span>
                    {job
                      ? <Link href={`/jobs/${job.id}`} className="text-primary hover:underline">{job.job_number ? `${job.job_number} - ` : ''}{job.name}</Link>
                      : 'Not assigned'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Vendor:</span>
                  <span>{vendor?.name || 'Not assigned'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery */}
            {(po.delivery_date || po.shipping_address) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    Delivery
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {po.delivery_date && (
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Delivery Date:</span>
                      <span>{formatDate(po.delivery_date)}</span>
                    </div>
                  )}
                  {po.shipping_address && (
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">Address:</span>
                      <span className="whitespace-pre-wrap">{po.shipping_address}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            {(po.approved_at || po.sent_at) && (
              <Card>
                <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {po.approved_at && (
                    <p className="text-sm text-muted-foreground">Approved: {formatDate(po.approved_at)}</p>
                  )}
                  {po.sent_at && (
                    <p className="text-sm text-muted-foreground">Sent: {formatDate(po.sent_at)}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Terms */}
            {po.terms && (
              <Card>
                <CardHeader><CardTitle>Terms</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{po.terms}</p>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {po.notes && (
              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{po.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Archive */}
            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)} disabled={archiving}>
                {archiving ? 'Archiving...' : 'Archive Purchase Order'}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* ── Edit Mode ── */}

            {/* PO Details */}
            <Card>
              <CardHeader>
                <CardTitle>PO Details</CardTitle>
                <CardDescription>Update purchase order information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                    <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="po_number" className="text-sm font-medium">PO Number</label>
                    <Input id="po_number" name="po_number" value={formData.po_number} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className={selectClassName}>
                      {PO_STATUSES.map((s) => (
                        <option key={s} value={s}>{formatStatus(s)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="job_id" className="text-sm font-medium">Job</label>
                    <select id="job_id" name="job_id" value={formData.job_id} onChange={handleChange} className={selectClassName}>
                      <option value="">No job</option>
                      {jobs.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.job_number ? `${j.job_number} - ` : ''}{j.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="vendor_id" className="text-sm font-medium">Vendor</label>
                    <select id="vendor_id" name="vendor_id" value={formData.vendor_id} onChange={handleChange} className={selectClassName}>
                      <option value="">No vendor</option>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Details */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="subtotal" className="text-sm font-medium">Subtotal</label>
                    <Input id="subtotal" name="subtotal" type="number" step="0.01" min="0" value={formData.subtotal} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="tax_amount" className="text-sm font-medium">Tax</label>
                    <Input id="tax_amount" name="tax_amount" type="number" step="0.01" min="0" value={formData.tax_amount} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="shipping_amount" className="text-sm font-medium">Shipping</label>
                    <Input id="shipping_amount" name="shipping_amount" type="number" step="0.01" min="0" value={formData.shipping_amount} onChange={handleChange} />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Total: <span className="font-medium text-foreground">
                    {formatCurrency((parseFloat(formData.subtotal) || 0) + (parseFloat(formData.tax_amount) || 0) + (parseFloat(formData.shipping_amount) || 0))}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery */}
            <Card>
              <CardHeader><CardTitle>Delivery</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="delivery_date" className="text-sm font-medium">Delivery Date</label>
                    <Input id="delivery_date" name="delivery_date" type="date" value={formData.delivery_date} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="shipping_address" className="text-sm font-medium">Shipping Address</label>
                  <textarea id="shipping_address" aria-label="Shipping address" name="shipping_address" value={formData.shipping_address} onChange={handleChange} rows={2} className={textareaClassName} />
                </div>
              </CardContent>
            </Card>

            {/* Terms & Notes */}
            <Card>
              <CardHeader><CardTitle>Terms & Notes</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="terms" className="text-sm font-medium">Terms</label>
                  <textarea id="terms" aria-label="Terms" name="terms" value={formData.terms} onChange={handleChange} rows={3} className={textareaClassName} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                  <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className={textareaClassName} />
                </div>
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
        onConfirm={handleArchive}
      />
    </div>
  )
}
