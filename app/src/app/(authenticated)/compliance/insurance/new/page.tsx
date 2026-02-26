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

export default function NewInsurancePolicyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Dropdown data ──────────────────────────────────────────────
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([])

  const [formData, setFormData] = useState({
    vendor_id: '',
    insurance_type: 'general_liability',
    carrier_name: '',
    policy_number: '',
    coverage_amount: '',
    expiration_date: '',
    status: 'active',
  })

  useEffect(() => {
    async function loadDropdowns() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      const companyId = (profile as { company_id: string } | null)?.company_id
      if (!companyId) return

      const { data: vendorsData } = await supabase
        .from('vendors')
        .select('id, name')
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .order('name')

      if (vendorsData) setVendors(vendorsData)
    }
    loadDropdowns()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
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

      const { error: insertError } = await supabase
        .from('vendor_insurance')
        .insert({
          company_id: companyId,
          vendor_id: formData.vendor_id,
          insurance_type: formData.insurance_type,
          carrier_name: formData.carrier_name,
          policy_number: formData.policy_number,
          coverage_amount: formData.coverage_amount ? parseFloat(formData.coverage_amount) : null,
          expiration_date: formData.expiration_date,
          status: formData.status,
        })

      if (insertError) throw insertError

      toast.success('Insurance policy created')
      router.push('/compliance/insurance')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create insurance policy'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/compliance/insurance" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Insurance
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Insurance Policy</h1>
        <p className="text-muted-foreground">Track a vendor insurance certificate</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        {/* Policy Info */}
        <Card>
          <CardHeader>
            <CardTitle>Policy Information</CardTitle>
            <CardDescription>Vendor and insurance details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="vendor_id" className="text-sm font-medium">Vendor <span className="text-red-500">*</span></label>
                <select id="vendor_id" name="vendor_id" value={formData.vendor_id} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select a vendor...</option>
                  {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="insurance_type" className="text-sm font-medium">Insurance Type <span className="text-red-500">*</span></label>
                <select id="insurance_type" name="insurance_type" value={formData.insurance_type} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {[
                    { value: 'general_liability', label: 'General Liability' },
                    { value: 'workers_comp', label: 'Workers Compensation' },
                    { value: 'auto', label: 'Auto' },
                    { value: 'umbrella', label: 'Umbrella' },
                    { value: 'professional', label: 'Professional' },
                  ].map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="carrier_name" className="text-sm font-medium">Insurance Carrier <span className="text-red-500">*</span></label>
                <Input id="carrier_name" name="carrier_name" value={formData.carrier_name} onChange={handleChange} placeholder="e.g., State Farm, Liberty Mutual" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="policy_number" className="text-sm font-medium">Policy Number <span className="text-red-500">*</span></label>
                <Input id="policy_number" name="policy_number" value={formData.policy_number} onChange={handleChange} placeholder="e.g., POL-123456" required />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coverage & Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Coverage & Dates</CardTitle>
            <CardDescription>Coverage amount and expiration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="coverage_amount" className="text-sm font-medium">Coverage Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="coverage_amount" name="coverage_amount" type="number" step="0.01" value={formData.coverage_amount} onChange={handleChange} placeholder="0.00" className="pl-7" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="expiration_date" className="text-sm font-medium">Expiration Date <span className="text-red-500">*</span></label>
                <Input id="expiration_date" name="expiration_date" type="date" value={formData.expiration_date} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  {[
                    { value: 'active', label: 'Active' },
                    { value: 'expiring_soon', label: 'Expiring Soon' },
                    { value: 'expired', label: 'Expired' },
                    { value: 'not_on_file', label: 'Not on File' },
                  ].map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/compliance/insurance"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Add Insurance Policy'}
          </Button>
        </div>
      </form>
    </div>
  )
}
