import Link from 'next/link'

import { Plus, ClipboardCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'

interface PermitInspection {
  id: string
  inspection_type: string
  status: string
  scheduled_date: string | null
  scheduled_time: string | null
  inspector_name: string | null
  inspector_phone: string | null
  is_reinspection: boolean
  completed_at: string | null
  notes: string | null
  permit_id: string
  created_at: string
}

export default async function JobInspectionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: jobId } = await params
  const supabase = await createClient()

  const { data: inspectionsData } = await supabase
    .from('permit_inspections')
    .select('*')
    .eq('job_id', jobId)
    .order('scheduled_date', { ascending: true })

  const inspections = (inspectionsData || []) as PermitInspection[]

  const scheduled = inspections.filter((i) => i.status === 'scheduled').length
  const passed = inspections.filter((i) => i.status === 'passed').length
  const failed = inspections.filter((i) => i.status === 'failed').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inspections</h1>
          <p className="text-muted-foreground">
            {inspections.length} inspections &bull; {scheduled} scheduled &bull; {passed} passed &bull; {failed} failed
          </p>
        </div>
        <Link href={`/jobs/${jobId}/inspections/new`}><Button><Plus className="h-4 w-4 mr-2" />Schedule Inspection</Button></Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            All Inspections
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inspections.length > 0 ? (
            <div className="divide-y divide-border">
              {inspections.map((insp) => (
                <div key={insp.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{insp.inspection_type}</span>
                        <Badge className={getStatusColor(insp.status)}>{insp.status}</Badge>
                        {insp.is_reinspection && <Badge className="text-amber-700 bg-amber-100">Re-inspection</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {insp.scheduled_date && `Scheduled ${formatDate(insp.scheduled_date)}`}
                        {insp.scheduled_time && ` at ${insp.scheduled_time}`}
                        {insp.inspector_name && ` • Inspector: ${insp.inspector_name}`}
                        {insp.completed_at && ` • Completed ${formatDate(insp.completed_at)}`}
                      </div>
                      {insp.notes && <p className="text-sm text-muted-foreground mt-1">{insp.notes}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClipboardCheck className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No inspections scheduled for this job</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
