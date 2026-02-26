import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Activity, Clock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

interface AuditLogRow {
  id: string
  action: string
  table_name: string | null
  record_id: string | null
  ip_address: unknown
  created_at: string | null
  user_id: string | null
}

export const metadata: Metadata = { title: 'Activity' }

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ entity_type?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  let query = supabase
    .from('audit_log')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (params.entity_type) {
    query = query.eq('table_name', params.entity_type)
  }

  const { data: logsData } = await query
  const logs = (logsData || []) as AuditLogRow[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Activity Feed</h1>
        <p className="text-muted-foreground">{logs.length} recent actions</p>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/activity">
          <Badge variant={!params.entity_type ? 'default' : 'outline'} className="cursor-pointer">All</Badge>
        </Link>
        <Link href="/activity/audit-log">
          <Badge variant="outline" className="cursor-pointer">Audit Log</Badge>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <div className="divide-y divide-border">
              {logs.map((log) => (
                <div key={log.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {log.user_id ? log.user_id.slice(0, 8) + '...' : 'System'}
                        </span>
                        <Badge variant="outline" className="text-xs">{log.action}</Badge>
                        {log.table_name && (
                          <span className="text-xs text-muted-foreground">{log.table_name}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(log.created_at)}
                        {log.ip_address ? ` from ${String(log.ip_address)}` : null}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No activity yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
