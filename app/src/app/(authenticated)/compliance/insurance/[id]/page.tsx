'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

interface InsurancePolicyData {
  id: string
  vendor_id: string
  company_id: string
  insurance_type: string
  carrier_name: string
  policy_number: string
  coverage_amount: number | null
  expiration_date: string
  certificate_document_id: string | null
  status: string
  verified_at: string | null
  verified_by: string | null
  created_at: string | null
  updated_at: string | null
}

interface VendorLookup {
  id: string
  name: string
}

export default function InsurancePolicyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [policy, setPolicy] = useState<InsurancePolicyData | null>(null)
  const [vendors, setVendors] = useState<VendorLookup[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [archiving, setArchiving] = useState(false)

  const [formData, setFormData] = useState({
    vendor_id: '',
    insurance_type: '',
    carrier_name: '',
    policy_number: '',
    coverage_amount: '',
    expiration_date: '',
    status: '',
  })

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not authenticated'); setLoading(false); return }
      const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
      const companyId = profile?.company_id
      if (!companyId) { setError('No company found'); setLoading(false); return }

      const [policyRes, vendorsRes] = await Promise.all([
        supabase
          .from('vendor_insurance')
          .select('*')
          .eq('id', params.id as string)
          .single(),
        supabase.from('vendors').select('id, name').eq('company_id', companyId).is('deleted_at', null).order('name'),
      ])

      if (policyRes.error || !policyRes.data) {
        setError('Insurance policy not found')
        setLoading(false)
        return
      }

      const p = policyRes.data as InsurancePolicyData
      setPolicy(p)
      setVendors((vendorsRes.data as VendorLookup[]) || [])
      setFormData({
        vendor_id: p.vendor_id,
        insurance_type: p.insurance_type,
        carrier_name: p.carrier_name,
        policy_number: p.policy_number,
        coverage_amount: p.coverage_amount != null ? String(p.coverage_amount) : '',
        expiration_date: p.expiration_date,
        status: p.status,
      })
      setLoading(false)
    }
    loadData()
  }, [params.id, supabase])

  const vendorName = vendors.find((v) => v.id === policy?.vendor_id)?.name || 'Unknown Vendor'

  const isExpired = policy ? new Date(policy.expiration_date) < new Date() : false

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('vendor_insurance')
        .update({
          vendor_id: formData.vendor_id,
          insurance_type: formData.insurance_type,
          carrier_name: formData.carrier_name,
          policy_number: formData.policy_number,
          coverage_amount: formData.coverage_amount ? parseFloat(formData.coverage_amount) : null,
          expiration_date: formData.expiration_date,
          status: formData.status,
        })
        .eq('id', params.id as string)

      if (updateError) throw updateError

      setPolicy((prev) =>
        prev
          ? {
              ...prev,
              vendor_id: formData.vendor_id,
              insurance_type: formData.insurance_type,
              carrier_name: formData.carrier_name,
              policy_number: formData.policy_number,
              coverage_amount: formData.coverage_amount ? parseFloat(formData.coverage_amount) : null,
              expiration_date: formData.expiration_date,
              status: formData.status,
            }
          : prev
      )
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
    if (!window.confirm('Archive this insurance policy? It can be restored later.')) return
    setArchiving(true)
    const { error: archiveError } = await supabase
      .from('vendor_insurance')
      .update({ deleted_at: new Date().toISOString() } as Record<string, unknown>)
      .eq('id', params.id as string)
    if (archiveError) {
      setError('Failed to archive policy')
      setArchiving(false)
      return
    }
    router.push('/compliance/insurance')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!policy) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/compliance/insurance" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Insurance
        </Link>
        <p className="text-destructive">{error || 'Policy not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/compliance/insurance" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Insurance
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{policy.insurance_type.replace(/_/g, ' ')}</h1>
              <Badge className={`rounded ${getStatusColor(policy.status)}`}>{policy.status.replace(/_/g, ' ')}</Badge>
              {isExpired && (
                <Badge className="rounded bg-red-100 text-red-700">Expired</Badge>
              )}
            </div>
            <p className="text-muted-foreground">{vendorName} -- {policy.carrier_name}</p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <>
                <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
                <button onClick={handleArchive} disabled={archiving} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">{archiving ? 'Archiving...' : 'Archive'}</button>
              </>
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Policy updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader><CardTitle>Policy Details</CardTitle></CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Vendor</dt>
                    <dd className="font-medium">{vendorName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Insurance Type</dt>
                    <dd className="font-medium capitalize">{policy.insurance_type.replace(/_/g, ' ')}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Carrier</dt>
                    <dd className="font-medium">{policy.carrier_name}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Policy Number</dt>
                    <dd className="font-medium">{policy.policy_number}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Coverage Amount</dt>
                    <dd className="font-medium">{policy.coverage_amount != null ? formatCurrency(policy.coverage_amount) : 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Expiration Date</dt>
                    <dd className={`font-medium ${isExpired ? 'text-red-600' : ''}`}>
                      {formatDate(policy.expiration_date)}
                      {isExpired && ' (Expired)'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd><Badge className={`rounded ${getStatusColor(policy.status)}`}>{policy.status.replace(/_/g, ' ')}</Badge></dd>
                  </div>
                  {policy.verified_at && (
                    <div>
                      <dt className="text-muted-foreground">Verified</dt>
                      <dd className="font-medium">{formatDate(policy.verified_at)}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Policy Information</CardTitle>
                <CardDescription>Update insurance policy details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="vendor_id" className="text-sm font-medium">Vendor <span className="text-red-500">*</span></label>
                    <select id="vendor_id" name="vendor_id" value={formData.vendor_id} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="">Select vendor...</option>
                      {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="insurance_type" className="text-sm font-medium">Insurance Type <span className="text-red-500">*</span></label>
                    <select id="insurance_type" name="insurance_type" value={formData.insurance_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="general_liability">General Liability</option>
                      <option value="workers_compensation">Workers Compensation</option>
                      <option value="auto">Auto</option>
                      <option value="umbrella">Umbrella</option>
                      <option value="professional_liability">Professional Liability</option>
                      <option value="builders_risk">Builders Risk</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="carrier_name" className="text-sm font-medium">Carrier <span className="text-red-500">*</span></label>
                    <Input id="carrier_name" name="carrier_name" value={formData.carrier_name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="policy_number" className="text-sm font-medium">Policy Number <span className="text-red-500">*</span></label>
                    <Input id="policy_number" name="policy_number" value={formData.policy_number} onChange={handleChange} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="coverage_amount" className="text-sm font-medium">Coverage Amount</label>
                    <Input id="coverage_amount" name="coverage_amount" type="number" step="0.01" value={formData.coverage_amount} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="expiration_date" className="text-sm font-medium">Expiration Date <span className="text-red-500">*</span></label>
                    <Input id="expiration_date" name="expiration_date" type="date" value={formData.expiration_date} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
