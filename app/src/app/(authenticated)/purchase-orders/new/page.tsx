'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// ── Types ────────────────────────────────────────────────────────────

interface JobOption {
  id: string
  name: string
  job_number: string | null
}

interface VendorOption {
  id: string
  name: string
}

// ── Component ────────────────────────────────────────────────────────

export default function NewPurchaseOrderPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [jobs, setJobs] = useState<JobOption[]>([])
  const [vendors, setVendors] = useState<VendorOption[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)

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

  // ── Load jobs and vendors for selectors ──

  useEffect(() => {
    async function loadOptions() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      const companyId = (profile as { company_id: string } | null)?.company_id
      if (!companyId) return

      const [jobsResult, vendorsResult] = await Promise.all([
        supabase
          .from('jobs')
          .select('id, name, job_number')
          .eq('company_id', companyId)
          .is('deleted_at', null)
          .order('name'),
        supabase
          .from('vendors')
          .select('id, name')
          .eq('company_id', companyId)
          .is('deleted_at', null)
          .order('name'),
      ])

      setJobs((jobsResult.data || []) as JobOption[])
      setVendors((vendorsResult.data || []) as VendorOption[])
      setLoadingOptions(false)
    }
    loadOptions()
  }, [supabase])

  // ── Handlers ──

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.job_id) {
      setError('Job is required')
      return
    }
    if (!formData.vendor_id) {
      setError('Vendor is required')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      const companyId = (profile as { company_id: string } | null)?.company_id
      if (!companyId) throw new Error('No company found')

      const subtotal = formData.subtotal ? parseFloat(formData.subtotal) : 0
      const taxAmount = formData.tax_amount ? parseFloat(formData.tax_amount) : 0
      const shippingAmount = formData.shipping_amount ? parseFloat(formData.shipping_amount) : 0
      const totalAmount = subtotal + taxAmount + shippingAmount

      const { error: insertError } = await supabase
        .from('purchase_orders')
        .insert({
          company_id: companyId,
          job_id: formData.job_id,
          vendor_id: formData.vendor_id,
          po_number: formData.po_number || `PO-${Date.now()}`,
          title: formData.title,
          status: 'Draft',
          subtotal,
          tax_amount: taxAmount,
          shipping_amount: shippingAmount,
          total_amount: totalAmount,
          delivery_date: formData.delivery_date || undefined,
          shipping_address: formData.shipping_address || undefined,
          terms: formData.terms || undefined,
          notes: formData.notes || undefined,
          created_by: user.id,
        })

      if (insertError) throw insertError

      toast.success('Purchase order created')
      router.push('/purchase-orders')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create purchase order'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
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
                ${((parseFloat(formData.subtotal) || 0) + (parseFloat(formData.tax_amount) || 0) + (parseFloat(formData.shipping_amount) || 0)).toFixed(2)}
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
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Purchase Order'}
          </Button>
        </div>
      </form>
    </div>
  )
}
