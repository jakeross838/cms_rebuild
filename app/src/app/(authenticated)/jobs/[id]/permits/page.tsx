import { Plus, FileCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'

interface Permit {
  id: string
  permit_number: string | null
  permit_type: string
  status: string
  jurisdiction: string | null
  applied_date: string | null
  issued_date: string | null
  expiration_date: string | null
  conditions: string | null
  notes: string | null
  created_at: string
}

export default async function JobPermitsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: jobId } = await params
  const supabase = await createClient()

  const { data: permitsData } = await supabase
    .from('permits')
    .select('*')
    .eq('job_id', jobId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const permits = (permitsData || []) as Permit[]

  const active = permits.filter((p) => p.status === 'active' || p.status === 'issued').length
  const pending = permits.filter((p) => p.status === 'pending' || p.status === 'applied').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Permits</h1>
          <p className="text-muted-foreground">{permits.length} permits &bull; {active} active &bull; {pending} pending</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Permit</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            All Permits
          </CardTitle>
        </CardHeader>
        <CardContent>
          {permits.length > 0 ? (
            <div className="divide-y divide-border">
              {permits.map((permit) => (
                <div key={permit.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {permit.permit_number && <span className="text-sm font-mono text-muted-foreground">#{permit.permit_number}</span>}
                        <span className="font-medium">{permit.permit_type}</span>
                        <Badge className={getStatusColor(permit.status)}>{permit.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {permit.jurisdiction && <span>{permit.jurisdiction}</span>}
                        {permit.applied_date && <span> &bull; Applied {formatDate(permit.applied_date)}</span>}
                        {permit.issued_date && <span> &bull; Issued {formatDate(permit.issued_date)}</span>}
                        {permit.expiration_date && <span> &bull; Expires {formatDate(permit.expiration_date)}</span>}
                      </div>
                      {permit.conditions && <p className="text-sm text-muted-foreground mt-1">{permit.conditions}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileCheck className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No permits tracked for this job</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
