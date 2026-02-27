'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function NewBudgetLinePage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const supabase = createClient()

  const { profile: authProfile, user: authUser } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    description: '',
    phase: '',
    estimated_amount: '',
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
      if (!authUser || !companyId) throw new Error('Not authenticated')

      // Verify job belongs to company
      const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
      if (!jobCheck) throw new Error('Job not found or access denied')

      // Find or create a budget for this job
      let budgetId: string
      const { data: existingBudget } = await supabase
        .from('budgets')
        .select('id')
        .eq('job_id', jobId)
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (existingBudget) {
        budgetId = (existingBudget as { id: string }).id
      } else {
        const { data: newBudget, error: budgetError } = await supabase
          .from('budgets')
          .insert({
            company_id: companyId,
            job_id: jobId,
            name: 'Primary Budget',
            status: 'draft',
            total_amount: 0,
            version: 1,
            created_by: authUser.id,
          })
          .select('id')
          .single()

        if (budgetError) throw budgetError
        budgetId = (newBudget as { id: string }).id
      }

      const { error: insertError } = await supabase
        .from('budget_lines')
        .insert({
          company_id: companyId,
          job_id: jobId,
          budget_id: budgetId,
          description: formData.description,
          phase: formData.phase || null,
          estimated_amount: formData.estimated_amount ? parseFloat(formData.estimated_amount) : 0,
          notes: formData.notes || null,
        })

      if (insertError) throw insertError

      toast.success('Budget line created')
      router.push(`/jobs/${jobId}/budget`)
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create budget line'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/jobs/${jobId}/budget`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Budget
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Budget Line</h1>
        <p className="text-muted-foreground">Add a new line item to the job budget</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Budget Line Details</CardTitle>
            <CardDescription>Description, phase, and estimated amount</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description <span className="text-red-500">*</span></label>
              <Input id="description" name="description" value={formData.description} onChange={handleChange} placeholder="e.g., Foundation concrete" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="phase" className="text-sm font-medium">Phase</label>
                <Input id="phase" name="phase" value={formData.phase} onChange={handleChange} placeholder="e.g., Site Work" />
              </div>
              <div className="space-y-2">
                <label htmlFor="estimated_amount" className="text-sm font-medium">Estimated Amount ($)</label>
                <Input id="estimated_amount" name="estimated_amount" type="number" step="0.01" min="0" value={formData.estimated_amount} onChange={handleChange} placeholder="0.00" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <textarea id="notes" aria-label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Additional notes about this budget line..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href={`/jobs/${jobId}/budget`}><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Budget Line'}
          </Button>
        </div>
      </form>
    </div>
  )
}
