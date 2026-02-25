import { Plus, Search, Send } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

interface Submittal {
  id: string
  title: string
  reference_number: string | null
  submission_type: string
  status: string
  amount: number | null
  description: string | null
  submitted_at: string | null
  reviewed_at: string | null
  vendor_id: string
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
    .from('vendor_submissions')
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
        <Button><Plus className="h-4 w-4 mr-2" />New Submittal</Button>
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
                        {sub.reference_number && <span className="text-sm font-mono text-muted-foreground">{sub.reference_number}</span>}
                        <span className="font-medium">{sub.title}</span>
                        <Badge className={getStatusColor(sub.status)}>{sub.status}</Badge>
                        <Badge variant="outline" className="text-xs">{sub.submission_type}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {sub.submitted_at && `Submitted ${formatDate(sub.submitted_at)}`}
                        {sub.reviewed_at && ` • Reviewed ${formatDate(sub.reviewed_at)}`}
                        {sub.description && ` • ${sub.description}`}
                      </div>
                    </div>
                    {sub.amount != null && <span className="font-medium">{formatCurrency(sub.amount)}</span>}
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
