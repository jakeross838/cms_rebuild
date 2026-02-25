import Link from 'next/link'

import { Plus, Shield } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'

interface Warranty {
  id: string
  title: string
  status: string
  warranty_type: string | null
  start_date: string | null
  end_date: string | null
  description: string | null
  created_at: string | null
}

export default async function JobWarrantiesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: jobId } = await params
  const supabase = await createClient()

  const { data: warrantiesData } = await supabase
    .from('warranties')
    .select('*')
    .eq('job_id', jobId)
    .order('end_date', { ascending: true })

  const warranties = (warrantiesData || []) as Warranty[]

  const active = warranties.filter((w) => w.status === 'active').length
  const expired = warranties.filter((w) => w.status === 'expired').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Warranties</h1>
          <p className="text-muted-foreground">{warranties.length} warranties &bull; {active} active &bull; {expired} expired</p>
        </div>
        <Link href={`/jobs/${jobId}/warranties/new`}><Button><Plus className="h-4 w-4 mr-2" />Add Warranty</Button></Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            All Warranties
          </CardTitle>
        </CardHeader>
        <CardContent>
          {warranties.length > 0 ? (
            <div className="divide-y divide-border">
              {warranties.map((w) => (
                <div key={w.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{w.title}</span>
                        <Badge className={getStatusColor(w.status)}>{w.status}</Badge>
                        {w.warranty_type && <Badge variant="outline" className="text-xs">{w.warranty_type}</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {w.start_date && formatDate(w.start_date)}
                        {w.end_date && ` — ${formatDate(w.end_date)}`}
                        {w.description && ` • ${w.description}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No warranties for this job</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
