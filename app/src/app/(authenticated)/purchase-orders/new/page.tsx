'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCreatePurchaseOrder } from '@/hooks/use-purchase-orders'
import { useJobs } from '@/hooks/use-jobs'
import { useVendors } from '@/hooks/use-vendors'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

// ── Component ────────────────────────────────────────────────────────

export default function NewPurchaseOrderPage() {
  const router = useRouter()
  const createPO = useCreatePurchaseOrder()

  const [error, setError] = useState<string | null>(null)

  const { data: jobsResponse, isLoading: loadingOptions } = useJobs({ limit: 500 } as any)
  const jobs = ((jobsResponse as { data: { id: string; name: string; job_number: string | null }[] } | undefined)?.data ?? [])

  const { data: vendorsResponse } = useVendors({ limit: 500 } as any)
  const vendors = ((vendorsResponse as { data: { id: string; name: string }[] } | undefined)?.data ?? [])

  const [formData, setFormData] = useState({
    po_number: '',
    title: '',
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

  // ── Handlers ──

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (createPO.isPending) return
    setError(null)

    if (!formData.job_id) {
      setError('Job is required')
      return
    }
    if (!formData.vendor_id) {
      setError('Vendor is required')
      return
    }

    try {
      const subtotal = formData.subtotal ? parseFloat(formData.subtotal) : 0
      const taxAmount = formData.tax_amount ? parseFloat(formData.tax_amount) : 0
      const shippingAmount = formData.shipping_amount ? parseFloat(formData.shipping_amount) : 0
      const totalAmount = subtotal + taxAmount + shippingAmount

      await createPO.mutateAsync({
        job_id: formData.job_id,
        vendor_id: formData.vendor_id,
        po_number: formData.po_number || `PO-${Date.now()}`,
        title: formData.title,
        status: 'draft',
        subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        total_amount: totalAmount,
        delivery_date: formData.delivery_date || null,
        shipping_address: formData.shipping_address || null,
        terms: formData.terms || null,
        notes: formData.notes || null,
      })

      toast.success('Purchase order created')
      router.push('/purchase-orders')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create purchase order'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  }

  const selectClassName = 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/purchase-orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Purchase Orders
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Purchase Order</h1>
        <p className="text-muted-foreground">Create a new purchase order for a job</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        {/* ── PO Details ── */}
        <Card>
          <CardHeader>
            <CardTitle>PO Details</CardTitle>
            <CardDescription>Basic purchase order information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Framing Lumber Order" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="po_number" className="text-sm font-medium">PO Number</label>
                <Input id="po_number" name="po_number" value={formData.po_number} onChange={handleChange} placeholder="e.g., PO-2026-001" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="job_id" className="text-sm font-medium">Job <span className="text-red-500">*</span></label>
                <select
                  id="job_id"
                  name="job_id"
                  value={formData.job_id}
                  onChange={handleChange}
                  className={selectClassName}
                  required
                  disabled={loadingOptions}
                >
                  <option value="">{loadingOptions ? 'Loading...' : 'Select a job'}</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.job_number ? `${job.job_number} - ` : ''}{job.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="vendor_id" className="text-sm font-medium">Vendor <span className="text-red-500">*</span></label>
                <select
                  id="vendor_id"
                  name="vendor_id"
                  value={formData.vendor_id}
                  onChange={handleChange}
                  className={selectClassName}
                  required
                  disabled={loadingOptions}
                >
                  <option value="">{loadingOptions ? 'Loading...' : 'Select a vendor'}</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Financial Details ── */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Details</CardTitle>
            <CardDescription>Amounts and pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="subtotal" className="text-sm font-medium">Subtotal</label>
                <Input id="subtotal" name="subtotal" type="number" step="0.01" min="0" value={formData.subtotal} onChange={handleChange} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label htmlFor="tax_amount" className="text-sm font-medium">Tax</label>
                <Input id="tax_amount" name="tax_amount" type="number" step="0.01" min="0" value={formData.tax_amount} onChange={handleChange} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label htmlFor="shipping_amount" className="text-sm font-medium">Shipping</label>
                <Input id="shipping_amount" name="shipping_amount" type="number" step="0.01" min="0" value={formData.shipping_amount} onChange={handleChange} placeholder="0.00" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Total: <span className="font-medium text-foreground">
                {formatCurrency((parseFloat(formData.subtotal) || 0) + (parseFloat(formData.tax_amount) || 0) + (parseFloat(formData.shipping_amount) || 0))}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── Delivery ── */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery</CardTitle>
            <CardDescription>Delivery date and shipping address</CardDescription>
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
              <textarea
                id="shipping_address" aria-label="Shipping address"
                name="shipping_address"
                value={formData.shipping_address}
                onChange={handleChange}
                rows={2}
                placeholder="Delivery address for this order..."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Terms & Notes ── */}
        <Card>
          <CardHeader>
            <CardTitle>Terms & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="terms" className="text-sm font-medium">Terms</label>
              <textarea
                id="terms" aria-label="Terms"
                name="terms"
                value={formData.terms}
                onChange={handleChange}
                rows={3}
                placeholder="Payment terms, delivery conditions, etc."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">Notes</label>
              <textarea
                id="notes" aria-label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Internal notes about this purchase order..."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Actions ── */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/purchase-orders"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={createPO.isPending}>
            {createPO.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Purchase Order'}
          </Button>
        </div>
      </form>
    </div>
  )
}
