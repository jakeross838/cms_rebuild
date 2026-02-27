import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Plus, MessageSquare, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { escapeLike, formatDate, getStatusColor } from '@/lib/utils'
import type { Metadata } from 'next'

interface Communication {
  id: string
  subject: string | null
  message_body: string | null
  communication_type: string
  status: string
  priority: string | null
  recipient: string | null
  notes: string | null
  created_at: string | null
}

export const metadata: Metadata = { title: 'Communications' }

export default async function JobCommunicationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const { id: jobId } = await params
  const sp = await searchParams
  const page = Number(sp.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const { companyId, supabase } = await getServerAuth()

  const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
  if (!jobCheck) { notFound() }

  let query = supabase
    .from('communications')
    .select('*', { count: 'exact' })
    .eq('job_id', jobId)
    .is('deleted_at', null)

  if (sp.search) {
    const searchTerm = `%${escapeLike(sp.search)}%`
    query = query.or(`subject.ilike.${searchTerm},message_body.ilike.${searchTerm}`)
  }

  const { data: commsData, count, error: commsError } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (commsError) throw commsError
  const comms = (commsData || []) as Communication[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Communications</h1>
          <p className="text-muted-foreground">{comms.length} communications</p>
        </div>
        <Link href={`/jobs/${jobId}/communications/new`}><Button><Plus className="h-4 w-4 mr-2" />New Message</Button></Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search messages..." aria-label="Search messages" defaultValue={sp.search} className="pl-10" /></form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {comms.length > 0 ? (
            <div className="divide-y divide-border">
              {comms.map((comm) => (
                <Link key={comm.id} href={`/jobs/${jobId}/communications/${comm.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {comm.subject && <span className="font-medium">{comm.subject}</span>}
                        <Badge variant="outline" className="text-xs">{comm.communication_type}</Badge>
                        <Badge className={getStatusColor(comm.status)}>{comm.status}</Badge>
                        {comm.priority && <Badge variant="outline" className="text-xs">{comm.priority}</Badge>}
                      </div>
                      {comm.message_body && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{comm.message_body}</p>}
                      {comm.recipient && <p className="text-xs text-muted-foreground mt-1">To: {comm.recipient}</p>}
                    </div>
                    {comm.created_at && <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{formatDate(comm.created_at)}</span>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No communications for this job</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={page} totalPages={totalPages} basePath={`/jobs/${jobId}/communications`} searchParams={sp as Record<string, string | undefined>} />
    </div>
  )
}
