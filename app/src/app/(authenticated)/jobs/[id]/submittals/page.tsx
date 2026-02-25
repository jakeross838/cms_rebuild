import Link from 'next/link'

import { Plus, Search, Send } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'

interface Submittal {
  id: string
  submittal_number: string | null
  title: string
  description: string | null
  spec_section: string | null
  submitted_to: string | null
  submission_date: string | null
  required_date: string | null
  status: string
  priority: string | null
  notes: string | null
  created_at: string
}

export default async function JobSubmittalsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: jobId } = await params
  const supabase = await createClient()

  const { data: submittalsData } = await supabase
    .from('submittals')
    .select('*')
    .eq('job_id', jobId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const submittals = (submittalsData || []) as Submittal[]

  const pending = submittals.filter((s) => s.status === 'pending' || s.status === 'submitted').length
  const approved = submittals.filter((s) => s.status === 'approved').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Submittals</h1>
          <p className="text-muted-foreground">{submittals.length} submittals &bull; {pending} pending &bull; {approved} approved</p>
        </div>
        <Link href={`/jobs/${jobId}/submittals/new`}><Button><Plus className="h-4 w-4 mr-2" />New Submittal</Button></Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            All Submittals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submittals.length > 0 ? (
            <div className="divide-y divide-border">
              {submittals.map((sub) => (
                <div key={sub.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {sub.submittal_number && <span className="text-sm font-mono text-muted-foreground">{sub.submittal_number}</span>}
                        <span className="font-medium">{sub.title}</span>
                        <Badge className={getStatusColor(sub.status)}>{sub.status}</Badge>
                        {sub.priority && <Badge variant="outline" className="text-xs">{sub.priority}</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {sub.spec_section && <span>Spec {sub.spec_section}</span>}
                        {sub.submitted_to && <span> &bull; To: {sub.submitted_to}</span>}
                        {sub.submission_date && <span> &bull; Submitted {formatDate(sub.submission_date)}</span>}
                        {sub.description && <span> &bull; {sub.description}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Send className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No submittals for this job</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
