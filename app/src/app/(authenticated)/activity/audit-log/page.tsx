import Link from 'next/link'
import { redirect } from 'next/navigation'

import { ShieldCheck, Clock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ListPagination } from '@/components/ui/list-pagination'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Audit Log' }

interface AuditLogRow {
  id: string
  action: string
  table_name: string | null
  record_id: string | null
  ip_address: unknown
  created_at: string | null
  user_id: string | null
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ entity_type?: string; action?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  let query = supabase
    .from('audit_log')
    .select('*', { count: 'exact' })
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (params.entity_type) {
    query = query.eq('table_name', params.entity_type)
  }

  if (params.action) {
    query = query.eq('action', params.action)
  }

  query = query.range(offset, offset + pageSize - 1)

  const { data: logsData, count } = await query
  const logs = (logsData || []) as AuditLogRow[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
        <p className="text-muted-foreground">{count || 0} total entries</p>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/activity">
          <Badge variant="outline" className="cursor-pointer">Activity Feed</Badge>
        </Link>
        <Link href="/activity/audit-log">
          <Badge variant="default" className="cursor-pointer">Audit Log</Badge>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th scope="col" className="pb-2 pr-4 text-xs font-medium text-muted-foreground">Time</th>
                    <th scope="col" className="pb-2 pr-4 text-xs font-medium text-muted-foreground">User</th>
                    <th scope="col" className="pb-2 pr-4 text-xs font-medium text-muted-foreground">Action</th>
                    <th scope="col" className="pb-2 pr-4 text-xs font-medium text-muted-foreground">Entity</th>
                    <th scope="col" className="pb-2 text-xs font-medium text-muted-foreground">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-2 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="py-2 pr-4 text-sm">
                        {log.user_id ? log.user_id.slice(0, 8) + '...' : 'System'}
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant="outline" className="text-xs">{log.action}</Badge>
                      </td>
                      <td className="py-2 pr-4 text-xs text-muted-foreground">
                        {log.table_name}
                        {log.record_id && ` #${log.record_id.slice(0, 8)}`}
                      </td>
                      <td className="py-2 text-xs text-muted-foreground font-mono">
                        {String(log.ip_address || '—')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <ShieldCheck className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No audit entries</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={page} totalPages={totalPages} basePath="/activity/audit-log" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
