'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCreateLienWaiver } from '@/hooks/use-lien-waivers'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const WAIVER_TYPES = [
  'Conditional Progress',
  'Unconditional Progress',
  'Conditional Final',
  'Unconditional Final',
]

interface JobOption {
  id: string
  name: string
}

export default function NewLienWaiverPage() {
  const router = useRouter()
  const supabase = createClient()
  const createLienWaiver = useCreateLienWaiver()

  const { profile: authProfile } = useAuth()

  const companyId = authProfile?.company_id || ''
  const [error, setError] = useState<string | null>(null)
  const [jobs, setJobs] = useState<JobOption[]>([])

  const [formData, setFormData] = useState({
    claimant_name: '',
    waiver_type: 'Conditional Progress',
    job_id: '',
    amount: '',
    through_date: '',
    check_number: '',
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
        .order('name', { ascending: true })

      setJobs((data as JobOption[]) || [])
    }
    loadJobs()
  }, [companyId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (createLienWaiver.isPending) return
    setError(null)

    if (!formData.job_id) { setError('Please select a job'); return }

    try {
      await createLienWaiver.mutateAsync({
        job_id: formData.job_id,
        claimant_name: formData.claimant_name,
        waiver_type: formData.waiver_type,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        through_date: formData.through_date || null,
        check_number: formData.check_number || null,
        notes: formData.notes || null,
      })

      toast.success('Lien waiver created')
      router.push('/lien-waivers')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create lien waiver'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/lien-waivers" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Lien Waivers
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Lien Waiver</h1>
        <p className="text-muted-foreground">Create a new lien waiver record</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Waiver Details</CardTitle>
            <CardDescription>Basic lien waiver information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="claimant_name" className="text-sm font-medium">Claimant Name <span className="text-red-500">*</span></label>
              <Input id="claimant_name" name="claimant_name" value={formData.claimant_name} onChange={handleChange} placeholder="e.g., ABC Plumbing Inc." required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="job_id" className="text-sm font-medium">Job <span className="text-red-500">*</span></label>
                <select
                  id="job_id"
                  name="job_id"
                  value={formData.job_id}
                  onChange={handleChange}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select a job...</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>{job.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="waiver_type" className="text-sm font-medium">Waiver Type</label>
                <select
                  id="waiver_type"
                  name="waiver_type"
                  value={formData.waiver_type}
                  onChange={handleChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {WAIVER_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">Amount</label>
                <Input id="amount" name="amount" type="number" step="0.01" min="0" value={formData.amount} onChange={handleChange} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label htmlFor="through_date" className="text-sm font-medium">Through Date</label>
                <Input id="through_date" name="through_date" type="date" value={formData.through_date} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="check_number" className="text-sm font-medium">Check Number</label>
              <Input id="check_number" name="check_number" value={formData.check_number} onChange={handleChange} placeholder="e.g., 10542" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <textarea
              id="notes" aria-label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any notes about this lien waiver..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/lien-waivers"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={createLienWaiver.isPending}>
            {createLienWaiver.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Lien Waiver'}
          </Button>
        </div>
      </form>
    </div>
  )
}
