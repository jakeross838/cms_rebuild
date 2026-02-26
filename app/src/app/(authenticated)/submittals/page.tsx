import Link from 'next/link'

import { Plus, FileCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'

interface SubmittalRow {
  id: string
  submittal_number: string | null
  title: string
  status: string
  spec_section: string | null
  required_date: string | null
  job_id: string
  created_at: string
  jobs: { name: string } | null
}

export default async function SubmittalsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('submittals')
    .select('*, jobs(name)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,submittal_number.ilike.%${params.search}%`)
  }

  if (params.status) {
    query = query.eq('status', params.status)
  }

  const { data: submittalsData } = await query
  const submittals = (submittalsData || []) as SubmittalRow[]

  const pendingCount = submittals.filter((s) => s.status === 'pending' || s.status === 'submitted').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Submittals</h1>
          <p className="text-muted-foreground">
            {submittals.length} submittals &middot; {pendingCount} pending review
          </p>
        </div>
        <Link href="/submittals/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Submittal
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            All Submittals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submittals.length > 0 ? (
            <div className="divide-y divide-border">
              {submittals.map((submittal) => (
                <Link
                  key={submittal.id}
                  href={`/submittals/${submittal.id}`}
                  className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {submittal.submittal_number && (
                          <span className="text-xs font-mono text-muted-foreground">{submittal.submittal_number}</span>
                        )}
                        <span className="font-medium">{submittal.title}</span>
                        <Badge className={getStatusColor(submittal.status)}>{submittal.status.replace('_', ' ')}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {submittal.jobs?.name && <span>{submittal.jobs.name}</span>}
                        {submittal.spec_section && <span>Spec: {submittal.spec_section}</span>}
                        {submittal.required_date && <span>Due: {formatDate(submittal.required_date)}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileCheck className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No submittals yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create a submittal to track material and product approvals</p>
              <Link href="/submittals/new" className="text-sm font-medium text-primary hover:underline">Create your first submittal</Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
