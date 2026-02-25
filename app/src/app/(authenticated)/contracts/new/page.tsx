'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

interface SelectOption {
  id: string
  label: string
}

export default function NewContractPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jobs, setJobs] = useState<SelectOption[]>([])
  const [clients, setClients] = useState<SelectOption[]>([])

  const [formData, setFormData] = useState({
    title: '',
    contract_number: '',
    contract_type: 'fixed_price',
    contract_value: '',
    description: '',
    job_id: '',
    client_id: '',
    start_date: '',
    end_date: '',
  })

  useEffect(() => {
    async function loadOptions() {
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id, name, job_number')
        .is('deleted_at', null)
        .order('name')

      setJobs((jobsData || []).map((j: { id: string; name: string; job_number: string | null }) => ({
        id: j.id,
        label: j.job_number ? `${j.job_number} — ${j.name}` : j.name,
      })))

      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name')
        .is('deleted_at', null)
        .order('name')

      setClients((clientsData || []).map((c: { id: string; name: string }) => ({
        id: c.id,
        label: c.name,
      })))
    }
    loadOptions()
  }, [supabase])

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
        .from('contracts')
        .insert({
          company_id: companyId,
          title: formData.title,
          contract_number: formData.contract_number,
          contract_type: formData.contract_type,
          status: 'draft',
          contract_value: formData.contract_value ? parseFloat(formData.contract_value) : null,
          description: formData.description || null,
          job_id: formData.job_id || null,
          client_id: formData.client_id || null,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          created_by: user.id,
        })

      if (insertError) throw insertError

      router.push('/contracts')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create contract')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/contracts" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Contracts
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Contract</h1>
        <p className="text-muted-foreground">Create a new contract</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Contract Details</CardTitle>
            <CardDescription>Title, number, and type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Smith Residence — Construction Agreement" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="contract_number" className="text-sm font-medium">Contract Number <span className="text-red-500">*</span></label>
                <Input id="contract_number" name="contract_number" value={formData.contract_number} onChange={handleChange} placeholder="CTR-2026-001" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="contract_type" className="text-sm font-medium">Type <span className="text-red-500">*</span></label>
                <select id="contract_type" name="contract_type" value={formData.contract_type} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="fixed_price">Fixed Price</option>
                  <option value="cost_plus">Cost Plus</option>
                  <option value="time_materials">Time & Materials</option>
                  <option value="unit_price">Unit Price</option>
                  <option value="subcontract">Subcontract</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="contract_value" className="text-sm font-medium">Contract Value</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input id="contract_value" name="contract_value" type="number" step="0.01" value={formData.contract_value} onChange={handleChange} placeholder="0.00" className="pl-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parties & Assignment</CardTitle>
            <CardDescription>Link to a job and client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="job_id" className="text-sm font-medium">Job</label>
                <select id="job_id" name="job_id" value={formData.job_id} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">No job</option>
                  {jobs.map((j) => <option key={j.id} value={j.id}>{j.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="client_id" className="text-sm font-medium">Client</label>
                <select id="client_id" name="client_id" value={formData.client_id} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">No client</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="start_date" className="text-sm font-medium">Start Date</label>
                <Input id="start_date" name="start_date" type="date" value={formData.start_date} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="end_date" className="text-sm font-medium">End Date</label>
                <Input id="end_date" name="end_date" type="date" value={formData.end_date} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Description</CardTitle></CardHeader>
          <CardContent>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Scope of work, special terms..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/contracts"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Contract'}
          </Button>
        </div>
      </form>
    </div>
  )
}
