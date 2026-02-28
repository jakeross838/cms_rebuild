'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { useCreatePurchaseOrder } from '@/hooks/use-purchase-orders'
import { toast } from 'sonner'

type Vendor = { id: string; name: string }

export default function NewPurchaseOrderPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const createPurchaseOrder = useCreatePurchaseOrder()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vendors, setVendors] = useState<Vendor[]>([])

  const [formData, setFormData] = useState({
    po_number: '',
    title: '',
    vendor_id: '',
    status: 'draft',
    subtotal: '',
    tax_amount: '',
    shipping_amount: '',
    total_amount: '',
    delivery_date: '',
    shipping_address: '',
    terms: '',
    notes: '',
  })

  useEffect(() => {
    async function loadVendors() {
      if (!companyId) return

      const { data } = await supabase
        .from('vendors')
        .select('id, name')
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .order('name')

      if (data) setVendors(data as Vendor[])
    }
    loadVendors()
  }, [companyId])

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
      if (!formData.vendor_id) throw new Error('Please select a vendor')

      await createPurchaseOrder.mutateAsync({
        job_id: jobId,
        vendor_id: formData.vendor_id,
        po_number: formData.po_number,
        title: formData.title,
        status: formData.status,
        subtotal: formData.subtotal ? parseFloat(formData.subtotal) : null,
        tax_amount: formData.tax_amount ? parseFloat(formData.tax_amount) : null,
        shipping_amount: formData.shipping_amount ? parseFloat(formData.shipping_amount) : null,
        total_amount: formData.total_amount ? parseFloat(formData.total_amount) : null,
        delivery_date: formData.delivery_date || null,
        shipping_address: formData.shipping_address || null,
        terms: formData.terms || null,
        notes: formData.notes || null,
      })

      toast.success('Purchase order created')
      router.push(`/jobs/${jobId}/purchase-orders`)
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create purchase order'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/purchase-orders`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Purchase Orders
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Purchase Order</h1>
        <p className="text-muted-foreground">Create a new purchase order for this job</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>PO Details</CardTitle>
            <CardDescription>Number, title, and vendor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="po_number" className="text-sm font-medium">PO Number <span className="text-red-500">*</span></label>
                <Input id="po_number" name="po_number" value={formData.po_number} onChange={handleChange} placeholder="e.g., PO-001" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Lumber for framing" required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="vendor_id" className="text-sm font-medium">Vendor <span className="text-red-500">*</span></label>
                <select id="vendor_id" name="vendor_id" value={formData.vendor_id} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select a vendor...</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="draft">Draft</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="sent">Sent</option>
                  <option value="partially_received">Partially Received</option>
                  <option value="received">Received</option>
                  <option value="closed">Closed</option>
                  <option value="voided">Voided</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Amounts</CardTitle>
            <CardDescription>Subtotal, tax, shipping, and total</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="subtotal" className="text-sm font-medium">Subtotal ($)</label>
                <Input id="subtotal" name="subtotal" type="number" step="0.01" value={formData.subtotal} onChange={handleChange} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label htmlFor="tax_amount" className="text-sm font-medium">Tax ($)</label>
                <Input id="tax_amount" name="tax_amount" type="number" step="0.01" value={formData.tax_amount} onChange={handleChange} placeholder="0.00" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="shipping_amount" className="text-sm font-medium">Shipping ($)</label>
                <Input id="shipping_amount" name="shipping_amount" type="number" step="0.01" value={formData.shipping_amount} onChange={handleChange} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label htmlFor="total_amount" className="text-sm font-medium">Total ($)</label>
                <Input id="total_amount" name="total_amount" type="number" step="0.01" value={formData.total_amount} onChange={handleChange} placeholder="0.00" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery &amp; Terms</CardTitle>
            <CardDescription>Delivery date, shipping address, and terms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="delivery_date" className="text-sm font-medium">Delivery Date</label>
                <Input id="delivery_date" name="delivery_date" type="date" value={formData.delivery_date} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="shipping_address" className="text-sm font-medium">Shipping Address</label>
              <textarea id="shipping_address" aria-label="Shipping address" name="shipping_address" value={formData.shipping_address} onChange={handleChange} rows={2} placeholder="Delivery address..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <label htmlFor="terms" className="text-sm font-medium">Terms</label>
              <textarea id="terms" aria-label="Terms" name="terms" value={formData.terms} onChange={handleChange} rows={2} placeholder="Payment terms, delivery terms..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">Notes</label>
              <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={2} placeholder="Additional notes..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href={`/jobs/${jobId}/purchase-orders`}><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Purchase Order'}
          </Button>
        </div>
      </form>
    </div>
  )
}
