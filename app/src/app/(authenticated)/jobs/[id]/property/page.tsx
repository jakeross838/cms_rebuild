import { notFound, redirect } from 'next/navigation'

import { Home } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

interface JobPropertyData {
  id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  job_number: string | null
  status: string
  contract_amount: number | null
  contract_type: string | null
  start_date: string | null
  target_completion: string | null
  actual_completion: string | null
  notes: string | null
}

export default async function JobPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (!job) notFound()

  const j = job as JobPropertyData

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Home className="h-6 w-6" />
          Property Details
        </h1>
        <p className="text-muted-foreground">{j.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Address" value={j.address} />
            <Field label="City" value={j.city} />
            <Field label="State" value={j.state} />
            <Field label="Zip" value={j.zip} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Job Number" value={j.job_number} />
            <Field label="Status" value={j.status} />
            <Field label="Contract Type" value={j.contract_type} />
            <Field label="Contract Amount" value={j.contract_amount != null ? `$${j.contract_amount.toLocaleString()}` : null} />
            <Field label="Start Date" value={j.start_date} />
            <Field label="Target Completion" value={j.target_completion} />
            <Field label="Actual Completion" value={j.actual_completion} />
            <Field label="Notes" value={j.notes} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || 'Not specified'}</p>
    </div>
  )
}
