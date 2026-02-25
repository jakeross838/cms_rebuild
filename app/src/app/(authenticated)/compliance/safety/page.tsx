import Link from 'next/link'

import { Plus, Search, AlertTriangle, ClipboardCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'

interface SafetyIncident {
  id: string
  incident_number: string
  title: string
  incident_type: string
  severity: string
  status: string
  incident_date: string
  osha_recordable: boolean
  medical_treatment: boolean
  lost_work_days: number
  job_id: string
}

interface SafetyInspection {
  id: string
  inspection_number: string
  title: string
  inspection_type: string
  status: string
  inspection_date: string
  score: number | null
  passed_items: number
  failed_items: number
  total_items: number
}

export default async function SafetyPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; tab?: string }>
}) {
  const params = await searchParams
  const tab = params.tab || 'incidents'
  const supabase = await createClient()

  const [
    { data: incidentsData },
    { data: inspectionsData },
  ] = await Promise.all([
    supabase.from('safety_incidents').select('*').is('deleted_at', null).order('incident_date', { ascending: false }).limit(100),
    supabase.from('safety_inspections').select('*').is('deleted_at', null).order('inspection_date', { ascending: false }).limit(100),
  ])

  const incidents = (incidentsData || []) as SafetyIncident[]
  const inspections = (inspectionsData || []) as SafetyInspection[]

  const oshaRecordable = incidents.filter((i) => i.osha_recordable).length
  const openIncidents = incidents.filter((i) => i.status === 'open' || i.status === 'investigating').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Safety & Compliance</h1>
          <p className="text-muted-foreground">
            {incidents.length} incidents &bull; {inspections.length} inspections &bull; {oshaRecordable} OSHA recordable
          </p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Report Incident</Button>
      </div>

      <div className="flex gap-2">
        <Link href="/compliance/safety?tab=incidents">
          <Button variant={tab === 'incidents' ? 'default' : 'outline'} size="sm">Incidents ({incidents.length})</Button>
        </Link>
        <Link href="/compliance/safety?tab=inspections">
          <Button variant={tab === 'inspections' ? 'default' : 'outline'} size="sm">Inspections ({inspections.length})</Button>
        </Link>
      </div>

      {tab === 'incidents' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Safety Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incidents.length > 0 ? (
              <div className="divide-y divide-border">
                {incidents.map((inc) => (
                  <div key={inc.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-muted-foreground">{inc.incident_number}</span>
                          <span className="font-medium">{inc.title}</span>
                          <Badge className={getStatusColor(inc.status)}>{inc.status}</Badge>
                          <Badge variant="outline" className="text-xs">{inc.severity}</Badge>
                          {inc.osha_recordable && <Badge className="text-red-700 bg-red-100">OSHA</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatDate(inc.incident_date)} &bull; {inc.incident_type}
                          {inc.lost_work_days > 0 && ` • ${inc.lost_work_days} lost days`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No safety incidents recorded</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Safety Inspections
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
                          <span className="text-sm font-mono text-muted-foreground">{insp.inspection_number}</span>
                          <span className="font-medium">{insp.title}</span>
                          <Badge className={getStatusColor(insp.status)}>{insp.status}</Badge>
                          <Badge variant="outline" className="text-xs">{insp.inspection_type}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatDate(insp.inspection_date)}
                          {insp.score != null && ` • Score: ${insp.score}%`}
                          {` • ${insp.passed_items}/${insp.total_items} passed`}
                          {insp.failed_items > 0 && ` • ${insp.failed_items} failed`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ClipboardCheck className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No safety inspections recorded</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
