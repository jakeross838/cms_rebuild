'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface JobOption {
  id: string
  name: string
}

export default function NewDrawRequestPage() {
  const router = useRouter()
  const supabase = createClient()

  const { profile: authProfile, user: authUser } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jobs, setJobs] = useState<JobOption[]>([])

  const [formData, setFormData] = useState({
    job_id: '',
    draw_number: '',
    application_date: new Date().toISOString().split('T')[0],
    period_to: '',
    contract_amount: '',
    total_completed: '',
    retainage_pct: '',
    current_due: '',
    lender_reference: '',
    notes: '',
  })

  useEffect(() => {
    async function loadJobs() {
      if (!companyId) return

      const { data } = await supabase
        .from('jobs')
        .select('id, name')
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .order('name')
        .limit(100)
      if (data) setJobs(data as JobOption[])
    }
    loadJobs()
  }, [supabase, companyId])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!authUser || !companyId) throw new Error('Not authenticated')

      if (!formData.draw_number || !formData.application_date || !formData.period_to) {
        throw new Error('Draw number, application date, and period to are required')
      }

      if (!formData.job_id) throw new Error('Job is required')

      const { error: insertError } = await supabase
        .from('draw_requests')
        .insert({
          company_id: companyId,
          job_id: formData.job_id,
          draw_number: parseInt(formData.draw_number, 10),
          application_date: formData.application_date,
          period_to: formData.period_to,
          status: 'draft',
          contract_amount: formData.contract_amount
            ? parseFloat(formData.contract_amount)
            : undefined,
          total_completed: formData.total_completed
            ? parseFloat(formData.total_completed)
            : undefined,
          retainage_pct: formData.retainage_pct
            ? parseFloat(formData.retainage_pct)
            : undefined,
          current_due: formData.current_due
            ? parseFloat(formData.current_due)
            : undefined,
          lender_reference: formData.lender_reference || undefined,
          notes: formData.notes || undefined,
        })
        .select()
        .single()

      if (insertError) throw insertError

      toast.success('Draw request created')
      router.push('/draw-requests')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create draw request'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/draw-requests"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Draw Requests
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          New Draw Request
        </h1>
        <p className="text-muted-foreground">
          Create a new AIA-format draw request
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Draw Details</CardTitle>
            <CardDescription>
              Application period and identification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="job_id" className="text-sm font-medium">
                Job <span className="text-red-500">*</span>
              </label>
              <select
                id="job_id"
                name="job_id"
                value={formData.job_id}
                onChange={handleChange}
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select a job...</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="draw_number" className="text-sm font-medium">
                  Draw Number <span className="text-red-500">*</span>
                </label>
                <Input
                  id="draw_number"
                  name="draw_number"
                  type="number"
                  value={formData.draw_number}
                  onChange={handleChange}
                  placeholder="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="application_date"
                  className="text-sm font-medium"
                >
                  Application Date <span className="text-red-500">*</span>
                </label>
                <Input
                  id="application_date"
                  name="application_date"
                  type="date"
                  value={formData.application_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="period_to" className="text-sm font-medium">
                  Period To <span className="text-red-500">*</span>
                </label>
                <Input
                  id="period_to"
                  name="period_to"
                  type="date"
                  value={formData.period_to}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="lender_reference"
                className="text-sm font-medium"
              >
                Lender Reference
              </label>
              <Input
                id="lender_reference"
                name="lender_reference"
                value={formData.lender_reference}
                onChange={handleChange}
                placeholder="e.g., Loan #12345"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Details</CardTitle>
            <CardDescription>
              Amounts for this draw application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="contract_amount"
                  className="text-sm font-medium"
                >
                  Contract Amount
                </label>
                <Input
                  id="contract_amount"
                  name="contract_amount"
                  type="number"
                  step="0.01"
                  value={formData.contract_amount}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="total_completed"
                  className="text-sm font-medium"
                >
                  Total Completed
                </label>
                <Input
                  id="total_completed"
                  name="total_completed"
                  type="number"
                  step="0.01"
                  value={formData.total_completed}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="retainage_pct" className="text-sm font-medium">
                  Retainage %
                </label>
                <Input
                  id="retainage_pct"
                  name="retainage_pct"
                  type="number"
                  step="0.01"
                  value={formData.retainage_pct}
                  onChange={handleChange}
                  placeholder="10.00"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="current_due" className="text-sm font-medium">
                  Current Due
                </label>
                <Input
                  id="current_due"
                  name="current_due"
                  type="number"
                  step="0.01"
                  value={formData.current_due}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              id="notes" aria-label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any notes about this draw request..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/draw-requests">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Draw Request'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
