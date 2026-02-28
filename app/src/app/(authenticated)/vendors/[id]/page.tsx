'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Mail, MapPin, Phone, Save, Wrench } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { US_STATES } from '@/config/constants'
import { useVendor, useUpdateVendor, useDeleteVendor } from '@/hooks/use-vendors'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

interface VendorData {
  id: string
  name: string
  trade: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  tax_id: string | null
  notes: string | null
  is_active: boolean | null
  created_at: string | null
}

export default function VendorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const vendorId = params.id as string

  const { data: response, isLoading: loading, error: fetchError } = useVendor(vendorId)
  const updateVendor = useUpdateVendor(vendorId)
  const deleteVendor = useDeleteVendor()

  const vendor = (response as { data: VendorData } | undefined)?.data ?? null

  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [archiving, setArchiving] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    trade: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    tax_id: '',
    notes: '',
  })

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name,
        trade: vendor.trade || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        address: vendor.address || '',
        city: vendor.city || '',
        state: vendor.state || '',
        zip: vendor.zip || '',
        tax_id: vendor.tax_id || '',
        notes: vendor.notes || '',
      })
    }
  }, [vendor])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error('Company name is required'); return }

    setError(null)
    try {
      await updateVendor.mutateAsync({
        name: formData.name,
        trade: formData.trade || null,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zip: formData.zip || null,
        tax_id: formData.tax_id || null,
        notes: formData.notes || null,
      })
      toast.success('Vendor updated')
      setEditing(false)
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to save vendor')
    }
  }

  const handleDelete = async () => {
    try {
      setArchiving(true)
      await deleteVendor.mutateAsync(vendorId)
      toast.success('Vendor archived')
      router.push('/vendors')
      router.refresh()
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to archive vendor')
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

  if (!vendor) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/vendors" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Vendors
        </Link>
        <p className="text-destructive">{fetchError?.message || 'Vendor not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/vendors" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Vendors
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{vendor.name}</h1>
              {vendor.is_active === false && (
                <Badge variant="outline" className="text-xs text-muted-foreground">Inactive</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {vendor.trade || 'No trade'} — Vendor since {formatDate(vendor.created_at) || 'Unknown'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
            ) : (
              <>
                <Button onClick={() => { setEditing(false); setError(null) }} variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={updateVendor.isPending}>
                  {updateVendor.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
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
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  <span>{vendor.trade || 'No trade specified'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{vendor.email || 'No email'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{vendor.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {[vendor.address, vendor.city, vendor.state, vendor.zip].filter(Boolean).join(', ') || 'No address'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {vendor.tax_id && (
              <Card>
                <CardHeader><CardTitle>Tax Information</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Tax ID: {vendor.tax_id}</p>
                </CardContent>
              </Card>
            )}

            {vendor.notes && (
              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{vendor.notes}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)} disabled={archiving}>
                {archiving ? 'Archiving...' : 'Archive Vendor'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Vendor Information</CardTitle>
                <CardDescription>Update vendor details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Company Name <span className="text-red-500">*</span></label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="trade" className="text-sm font-medium">Trade</label>
                    <Input id="trade" name="trade" value={formData.trade} onChange={handleChange} placeholder="e.g., Plumbing, Electrical, HVAC" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Address</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium">Street Address</label>
                  <Input id="address" name="address" value={formData.address} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-2 col-span-2">
                    <label htmlFor="city" className="text-sm font-medium">City</label>
                    <Input id="city" name="city" value={formData.city} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="state" className="text-sm font-medium">State</label>
                    <select id="state" name="state" value={formData.state} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="">--</option>
                      {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="zip" className="text-sm font-medium">ZIP</label>
                    <Input id="zip" name="zip" value={formData.zip} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Tax & Notes</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="tax_id" className="text-sm font-medium">Tax ID / EIN</label>
                  <Input id="tax_id" name="tax_id" value={formData.tax_id} onChange={handleChange} placeholder="XX-XXXXXXX" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                  <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive vendor?"
        description="This vendor will be archived and can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
