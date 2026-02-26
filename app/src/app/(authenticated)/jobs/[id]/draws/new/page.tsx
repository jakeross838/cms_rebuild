'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function NewDrawRequestPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    draw_number: '',
    application_date: today,
    period_to: today,
    contract_amount: '',
    total_completed: '',
    retainage_pct: '10',
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

      // Verify job belongs to company
      const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
      if (!jobCheck) throw new Error('Job not found or access denied')

      const contractAmount = formData.contract_amount ? parseFloat(formData.contract_amount) : 0
      const totalCompleted = formData.total_completed ? parseFloat(formData.total_completed) : 0
      const retainagePct = formData.retainage_pct ? parseFloat(formData.retainage_pct) : 10
      const retainageAmount = totalCompleted * (retainagePct / 100)
      const totalEarned = totalCompleted - retainageAmount
      const balanceToFinish = contractAmount - totalCompleted

      const { error: insertError } = await supabase
        .from('draw_requests')
        .insert({
          company_id: companyId,
          job_id: jobId,
          draw_number: parseInt(formData.draw_number, 10),
          application_date: formData.application_date,
          period_to: formData.period_to,
          status: 'draft',
          contract_amount: contractAmount,
          total_completed: totalCompleted,
          retainage_pct: retainagePct,
          retainage_amount: retainageAmount,
          total_earned: totalEarned,
          current_due: totalEarned,
          balance_to_finish: balanceToFinish,
          notes: formData.notes || null,
        })

      if (insertError) throw insertError

      router.push(`/jobs/${jobId}/draws`)
      router.refresh()
    } catch (err) {
      setError((err as Error)?.message || 'Failed to create draw request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/draws`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Draw Requests
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Draw Request</h1>
        <p className="text-muted-foreground">Create a draw request for this job</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Draw Details</CardTitle>
            <CardDescription>Draw number and dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="draw_number" className="text-sm font-medium">Draw Number <span className="text-red-500">*</span></label>
                <Input id="draw_number" name="draw_number" type="number" min="1" value={formData.draw_number} onChange={handleChange} placeholder="e.g., 1" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="application_date" className="text-sm font-medium">Application Date <span className="text-red-500">*</span></label>
                <Input id="application_date" name="application_date" type="date" value={formData.application_date} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="period_to" className="text-sm font-medium">Period To <span className="text-red-500">*</span></label>
                <Input id="period_to" name="period_to" type="date" value={formData.period_to} onChange={handleChange} required />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Amounts</CardTitle>
            <CardDescription>Contract value, completed work, and retainage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="contract_amount" className="text-sm font-medium">Contract Amount ($) <span className="text-red-500">*</span></label>
                <Input id="contract_amount" name="contract_amount" type="number" step="0.01" value={formData.contract_amount} onChange={handleChange} placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="total_completed" className="text-sm font-medium">Total Completed ($) <span className="text-red-500">*</span></label>
                <Input id="total_completed" name="total_completed" type="number" step="0.01" value={formData.total_completed} onChange={handleChange} placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="retainage_pct" className="text-sm font-medium">Retainage (%)</label>
                <Input id="retainage_pct" name="retainage_pct" type="number" step="0.1" min="0" max="100" value={formData.retainage_pct} onChange={handleChange} placeholder="10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Additional notes for this draw request..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href={`/jobs/${jobId}/draws`}><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Draw Request'}
          </Button>
        </div>
      </form>
    </div>
  )
}
