'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function NewLienWaiverPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    waiver_type: 'conditional_progress',
    status: 'draft',
    claimant_name: '',
    amount: '',
    through_date: '',
    check_number: '',
    notes: '',
  })

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
        .from('lien_waivers')
        .insert({
          company_id: companyId,
          job_id: jobId,
          waiver_type: formData.waiver_type,
          status: formData.status,
          claimant_name: formData.claimant_name || null,
          amount: formData.amount ? parseFloat(formData.amount) : null,
          through_date: formData.through_date || null,
          check_number: formData.check_number || null,
          notes: formData.notes || null,
          requested_by: user.id,
          requested_at: new Date().toISOString(),
        })

      if (insertError) throw insertError

      router.push(`/jobs/${jobId}/lien-waivers`)
      router.refresh()
    } catch (err) {
      setError((err as Error)?.message || 'Failed to create lien waiver')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/lien-waivers`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Lien Waivers
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Lien Waiver</h1>
        <p className="text-muted-foreground">Create a new lien waiver for this job</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Waiver Details</CardTitle>
            <CardDescription>Type, claimant, and amount</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="waiver_type" className="text-sm font-medium">Waiver Type <span className="text-red-500">*</span></label>
                <select id="waiver_type" name="waiver_type" value={formData.waiver_type} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="conditional_progress">Conditional Progress</option>
                  <option value="unconditional_progress">Unconditional Progress</option>
                  <option value="conditional_final">Conditional Final</option>
                  <option value="unconditional_final">Unconditional Final</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                  <option value="received">Received</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="claimant_name" className="text-sm font-medium">Claimant Name</label>
                <Input id="claimant_name" name="claimant_name" value={formData.claimant_name} onChange={handleChange} placeholder="e.g., ABC Plumbing Inc." />
              </div>
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">Amount ($)</label>
                <Input id="amount" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} placeholder="0.00" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="through_date" className="text-sm font-medium">Through Date</label>
                <Input id="through_date" name="through_date" type="date" value={formData.through_date} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="check_number" className="text-sm font-medium">Check Number</label>
                <Input id="check_number" name="check_number" value={formData.check_number} onChange={handleChange} placeholder="e.g., 10234" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Additional notes about this lien waiver..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href={`/jobs/${jobId}/lien-waivers`}><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Lien Waiver'}
          </Button>
        </div>
      </form>
    </div>
  )
}
