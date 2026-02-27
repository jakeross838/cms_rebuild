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
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Payable Details' }


interface BillData {
  id: string
  company_id: string
  vendor_id: string
  bill_number: string
  bill_date: string
  due_date: string
  amount: number
  balance_due: number
  status: string
  job_id: string | null
  description: string | null
  received_date: string | null
  terms: string | null
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
}

interface VendorLookup {
  id: string
  name: string
}

interface JobLookup {
  id: string
  name: string
}

export default function BillDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [bill, setBill] = useState<BillData | null>(null)
  const [vendors, setVendors] = useState<VendorLookup[]>([])
  const [jobs, setJobs] = useState<JobLookup[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    bill_number: '',
    vendor_id: '',
    job_id: '',
    amount: '',
    balance_due: '',
    status: '',
    bill_date: '',
    due_date: '',
    received_date: '',
    terms: '',
    description: '',
  })

  useEffect(() => {
    async function loadData() {
      // Get current user's company_id for tenant-scoped dropdown queries
      if (!companyId) { setError('No company found'); setLoading(false); return }

      const [billRes, vendorsRes, jobsRes] = await Promise.all([
        supabase
          .from('ap_bills')
          .select('*')
          .eq('id', params.id as string)
          .is('deleted_at', null)
          .single(),
        supabase.from('vendors').select('id, name').eq('company_id', companyId).is('deleted_at', null).order('name'),
        supabase.from('jobs').select('id, name').eq('company_id', companyId).is('deleted_at', null).order('name'),
      ])

      if (billRes.error || !billRes.data) {
        setError('Bill not found')
        setLoading(false)
        return
      }

      const b = billRes.data as BillData
      setBill(b)
      setVendors((vendorsRes.data as VendorLookup[]) || [])
      setJobs((jobsRes.data as JobLookup[]) || [])
      setFormData({
        bill_number: b.bill_number,
        vendor_id: b.vendor_id,
        job_id: b.job_id || '',
        amount: String(b.amount),
        balance_due: String(b.balance_due),
        status: b.status,
        bill_date: b.bill_date,
        due_date: b.due_date,
        received_date: b.received_date || '',
        terms: b.terms || '',
        description: b.description || '',
      })
      setLoading(false)
    }
    loadData()
  }, [params.id, supabase, companyId])

  const vendorName = vendors.find((v) => v.id === bill?.vendor_id)?.name || 'Unknown Vendor'
  const jobName = jobs.find((j) => j.id === bill?.job_id)?.name

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
        .from('ap_bills')
        .update({
          bill_number: formData.bill_number,
          vendor_id: formData.vendor_id,
          job_id: formData.job_id || null,
          amount: parseFloat(formData.amount),
          balance_due: parseFloat(formData.balance_due),
          status: formData.status,
          bill_date: formData.bill_date,
          due_date: formData.due_date,
          received_date: formData.received_date || null,
          terms: formData.terms || null,
          description: formData.description || null,
        })
        .eq('id', params.id as string)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      setBill((prev) =>
        prev
          ? {
              ...prev,
              bill_number: formData.bill_number,
              vendor_id: formData.vendor_id,
              job_id: formData.job_id || null,
              amount: parseFloat(formData.amount),
              balance_due: parseFloat(formData.balance_due),
              status: formData.status,
              bill_date: formData.bill_date,
              due_date: formData.due_date,
              received_date: formData.received_date || null,
              terms: formData.terms || null,
              description: formData.description || null,
            }
          : prev
      )
      setSuccess(true)
      setEditing(false)
      toast.success('Saved')
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
    const { error: deleteError } = await supabase
      .from('ap_bills')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id as string)
      .eq('company_id', companyId)

    if (deleteError) {
      const errorMessage = 'Failed to archive bill'
      setError(errorMessage)
      toast.error(errorMessage)
      return
    }

    toast.success('Archived')
    router.push('/financial/payables')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!bill) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/financial/payables" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Payables
        </Link>
        <p className="text-destructive">{error || 'Bill not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/financial/payables" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Payables
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Bill #{bill.bill_number}</h1>
              <Badge className={`rounded ${getStatusColor(bill.status)}`}>{bill.status.replace(/_/g, ' ')}</Badge>
            </div>
            <p className="text-muted-foreground">{vendorName}{jobName ? ` -- ${jobName}` : ''}</p>
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
      {success && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Bill updated successfully</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader><CardTitle>Bill Details</CardTitle></CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Bill Number</dt>
                    <dd className="font-medium">{bill.bill_number}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Vendor</dt>
                    <dd className="font-medium">{vendorName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Job</dt>
                    <dd className="font-medium">{jobName || 'None'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd><Badge className={`rounded ${getStatusColor(bill.status)}`}>{bill.status.replace(/_/g, ' ')}</Badge></dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Amount</dt>
                    <dd className="font-medium">{formatCurrency(bill.amount)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Balance Due</dt>
                    <dd className="font-medium">{formatCurrency(bill.balance_due)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Bill Date</dt>
                    <dd className="font-medium">{formatDate(bill.bill_date)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Due Date</dt>
                    <dd className="font-medium">{formatDate(bill.due_date)}</dd>
                  </div>
                  {bill.received_date && (
                    <div>
                      <dt className="text-muted-foreground">Received Date</dt>
                      <dd className="font-medium">{formatDate(bill.received_date)}</dd>
                    </div>
                  )}
                  {bill.terms && (
                    <div>
                      <dt className="text-muted-foreground">Terms</dt>
                      <dd className="font-medium">{bill.terms}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {bill.description && (
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{bill.description}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowArchiveDialog(true)}>
                Archive Bill
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Bill Information</CardTitle>
                <CardDescription>Update bill details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="bill_number" className="text-sm font-medium">Bill Number <span className="text-red-500">*</span></label>
                    <Input id="bill_number" name="bill_number" value={formData.bill_number} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="vendor_id" className="text-sm font-medium">Vendor <span className="text-red-500">*</span></label>
                    <select id="vendor_id" name="vendor_id" value={formData.vendor_id} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="">Select vendor...</option>
                      {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="job_id" className="text-sm font-medium">Job</label>
                    <select id="job_id" name="job_id" value={formData.job_id} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="">No job</option>
                      {jobs.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="draft">Draft</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="paid">Paid</option>
                      <option value="partial">Partial</option>
                      <option value="overdue">Overdue</option>
                      <option value="void">Void</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="amount" className="text-sm font-medium">Amount <span className="text-red-500">*</span></label>
                    <Input id="amount" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="balance_due" className="text-sm font-medium">Balance Due <span className="text-red-500">*</span></label>
                    <Input id="balance_due" name="balance_due" type="number" step="0.01" value={formData.balance_due} onChange={handleChange} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="bill_date" className="text-sm font-medium">Bill Date <span className="text-red-500">*</span></label>
                    <Input id="bill_date" name="bill_date" type="date" value={formData.bill_date} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="due_date" className="text-sm font-medium">Due Date <span className="text-red-500">*</span></label>
                    <Input id="due_date" name="due_date" type="date" value={formData.due_date} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="received_date" className="text-sm font-medium">Received Date</label>
                    <Input id="received_date" name="received_date" type="date" value={formData.received_date} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="terms" className="text-sm font-medium">Terms</label>
                  <Input id="terms" name="terms" value={formData.terms} onChange={handleChange} placeholder="e.g., Net 30" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive bill?"
        description="This bill will be archived. It can be restored later."
        confirmLabel="Archive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
