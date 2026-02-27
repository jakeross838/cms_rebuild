import type { Metadata } from 'next'
import Link from 'next/link'

import { Plus, AlertTriangle, ClipboardCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { formatDate, getStatusColor , formatStatus } from '@/lib/utils'

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

export const metadata: Metadata = { title: 'Safety Compliance' }

export default async function SafetyPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; tab?: string; page?: string }>
}) {
  const params = await searchParams
  const tab = params.tab || 'incidents'
  const page = Number(params.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const { companyId, supabase } = await getServerAuth()

  const [
    { data: incidentsData, count: incidentsCount },
    { data: inspectionsData, count: inspectionsCount },
  ] = await Promise.all([
    tab === 'incidents'
      ? supabase.from('safety_incidents').select('*', { count: 'exact' }).is('deleted_at', null).eq('company_id', companyId).order('incident_date', { ascending: false }).range(offset, offset + pageSize - 1)
      : supabase.from('safety_incidents').select('*', { count: 'exact' }).is('deleted_at', null).eq('company_id', companyId).order('incident_date', { ascending: false }).limit(0),
    tab === 'inspections'
      ? supabase.from('safety_inspections').select('*', { count: 'exact' }).is('deleted_at', null).eq('company_id', companyId).order('inspection_date', { ascending: false }).range(offset, offset + pageSize - 1)
      : supabase.from('safety_inspections').select('*', { count: 'exact' }).is('deleted_at', null).eq('company_id', companyId).order('inspection_date', { ascending: false }).limit(0),
  ])

  const incidents = (incidentsData || []) as SafetyIncident[]
  const inspections = (inspectionsData || []) as SafetyInspection[]
  const totalPages = tab === 'incidents'
    ? Math.ceil((incidentsCount || 0) / pageSize)
    : Math.ceil((inspectionsCount || 0) / pageSize)

  const oshaRecordable = incidents.filter((i) => i.osha_recordable).length
  const openIncidents = incidents.filter((i) => i.status === 'open' || i.status === 'investigating').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Safety & Compliance</h1>
          <p className="text-muted-foreground">
            {incidentsCount || 0} incidents &bull; {inspectionsCount || 0} inspections &bull; {oshaRecordable} OSHA recordable
          </p>
        </div>
        <Link href="/compliance/safety/new"><Button><Plus className="h-4 w-4 mr-2" />Report Incident</Button></Link>
      </div>

      <div className="flex gap-2">
        <Link href="/compliance/safety?tab=incidents">
          <Button variant={tab === 'incidents' ? 'default' : 'outline'} size="sm">Incidents ({incidentsCount || 0})</Button>
        </Link>
        <Link href="/compliance/safety?tab=inspections">
          <Button variant={tab === 'inspections' ? 'default' : 'outline'} size="sm">Inspections ({inspectionsCount || 0})</Button>
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
                  <Link key={inc.id} href={`/compliance/safety/${inc.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-muted-foreground">{inc.incident_number}</span>
                          <span className="font-medium">{inc.title}</span>
                          <Badge className={getStatusColor(inc.status)}>{formatStatus(inc.status)}</Badge>
                          <Badge variant="outline" className="text-xs">{inc.severity}</Badge>
                          {inc.osha_recordable && <Badge className="text-red-700 bg-red-100">OSHA</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatDate(inc.incident_date)} &bull; {inc.incident_type}
                          {inc.lost_work_days > 0 && ` • ${inc.lost_work_days} lost days`}
                        </div>
                      </div>
                    </div>
                  </Link>
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
                  <Link key={insp.id} href={`/compliance/safety/${insp.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-muted/30 -mx-2 px-2 rounded-md transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-muted-foreground">{insp.inspection_number}</span>
                          <span className="font-medium">{insp.title}</span>
                          <Badge className={getStatusColor(insp.status)}>{formatStatus(insp.status)}</Badge>
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
                  </Link>
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

      <ListPagination currentPage={page} totalPages={totalPages} basePath="/compliance/safety" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
