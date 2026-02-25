'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Calendar, DollarSign, FileText, Loader2, MapPin, Save, ShoppingCart, Truck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

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

const PO_STATUSES = ['Draft', 'Pending', 'Approved', 'Sent', 'Received', 'Closed']

// ── Component ────────────────────────────────────────────────────────

export default function PurchaseOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [po, setPo] = useState<PurchaseOrderData | null>(null)
  const [job, setJob] = useState<JobInfo | null>(null)
  const [vendor, setVendor] = useState<VendorInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)

  // ── Options for edit mode selectors ──
  const [jobs, setJobs] = useState<JobInfo[]>([])
  const [vendors, setVendors] = useState<VendorInfo[]>([])

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

  // ── Load PO data ──

  useEffect(() => {
    async function loadPurchaseOrder() {
      const { data, error: fetchError } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('id', params.id as string)
        .is('deleted_at', null)
        .single()

      if (fetchError || !data) {
        setError('Purchase order not found')
        setLoading(false)
        return
      }

      const poData = data as PurchaseOrderData
      setPo(poData)
      setFormData({
        po_number: poData.po_number || '',
        title: poData.title || '',
        status: poData.status || 'Draft',
        job_id: poData.job_id || '',
        vendor_id: poData.vendor_id || '',
        subtotal: poData.subtotal != null ? String(poData.subtotal) : '',
        tax_amount: poData.tax_amount != null ? String(poData.tax_amount) : '',
        shipping_amount: poData.shipping_amount != null ? String(poData.shipping_amount) : '',
        delivery_date: poData.delivery_date || '',
        shipping_address: poData.shipping_address || '',
        terms: poData.terms || '',
        notes: poData.notes || '',
      })

      // Fetch related job and vendor for display
      if (poData.job_id) {
        const { data: jobData } = await supabase
          .from('jobs')
          .select('id, name, job_number')
          .eq('id', poData.job_id)
          .single()
        if (jobData) setJob(jobData as JobInfo)
      }

      if (poData.vendor_id) {
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('id, name')
          .eq('id', poData.vendor_id)
          .single()
        if (vendorData) setVendor(vendorData as VendorInfo)
      }

      setLoading(false)
    }
    loadPurchaseOrder()
  }, [params.id, supabase])

  // ── Load job/vendor options when entering edit mode ──

  useEffect(() => {
    if (!editing) return

    async function loadOptions() {
      const [jobsResult, vendorsResult] = await Promise.all([
        supabase.from('jobs').select('id, name, job_number').is('deleted_at', null).order('name'),
        supabase.from('vendors').select('id, name').is('deleted_at', null).order('name'),
      ])
      setJobs((jobsResult.data || []) as JobInfo[])
      setVendors((vendorsResult.data || []) as VendorInfo[])
    }
    loadOptions()
  }, [editing, supabase])

  // ── Handlers ──

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const subtotal = formData.subtotal ? parseFloat(formData.subtotal) : 0
      const taxAmount = formData.tax_amount ? parseFloat(formData.tax_amount) : 0
      const shippingAmount = formData.shipping_amount ? parseFloat(formData.shipping_amount) : 0
      const totalAmount = subtotal + taxAmount + shippingAmount

      const { error: updateError } = await supabase
        .from('purchase_orders')
        .update({
          po_number: formData.po_number || undefined,
          title: formData.title || undefined,
          status: formData.status || undefined,
          job_id: formData.job_id || undefined,
          vendor_id: formData.vendor_id || undefined,
          subtotal,
          tax_amount: taxAmount,
          shipping_amount: shippingAmount,
          total_amount: totalAmount,
          delivery_date: formData.delivery_date || undefined,
          shipping_address: formData.shipping_address || undefined,
          terms: formData.terms || undefined,
          notes: formData.notes || undefined,
        })
        .eq('id', params.id as string)

      if (updateError) throw updateError

      // Update local state
      setPo((prev) => prev ? {
        ...prev,
        po_number: formData.po_number || null,
        title: formData.title || null,
        status: formData.status || null,
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
      } : prev)

      // Update job/vendor display
      if (formData.job_id) {
        const found = jobs.find((j) => j.id === formData.job_id)
        if (found) setJob(found)
      } else {
        setJob(null)
      }
      if (formData.vendor_id) {
        const found = vendors.find((v) => v.id === formData.vendor_id)
        if (found) setVendor(found)
      } else {
        setVendor(null)
      }

      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError((err as Error)?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async () => {
    if (!confirm('Archive this purchase order? It can be restored later.')) return

    const { error: deleteError } = await supabase
      .from('purchase_orders')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id as string)

    if (deleteError) {
      setError('Failed to archive purchase order')
      return
    }

    router.push('/purchase-orders')
    router.refresh()
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
        <p className="text-destructive">{error || 'Purchase order not found'}</p>
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
                  {po.status}
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
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={handleArchive}>
                Archive Purchase Order
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
                        <option key={s} value={s}>{s}</option>
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
                    ${((parseFloat(formData.subtotal) || 0) + (parseFloat(formData.tax_amount) || 0) + (parseFloat(formData.shipping_amount) || 0)).toFixed(2)}
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
                  <textarea id="shipping_address" name="shipping_address" value={formData.shipping_address} onChange={handleChange} rows={2} className={textareaClassName} />
                </div>
              </CardContent>
            </Card>

            {/* Terms & Notes */}
            <Card>
              <CardHeader><CardTitle>Terms & Notes</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="terms" className="text-sm font-medium">Terms</label>
                  <textarea id="terms" name="terms" value={formData.terms} onChange={handleChange} rows={3} className={textareaClassName} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                  <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className={textareaClassName} />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
