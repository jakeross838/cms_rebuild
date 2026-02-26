import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ListPagination } from '@/components/ui/list-pagination'
import { MessageSquare } from 'lucide-react'

interface Communication {
  id: string
  subject: string
  communication_type: string
  status: string
  created_at: string
}

export default async function CommunicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
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

  const { data: communications, count } = await supabase
    .from('communications')
    .select('*', { count: 'exact' })
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  const items = (communications ?? []) as Communication[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Communications</h1>
          <p className="text-muted-foreground">Messages, emails, and notifications</p>
        </div>
        <Link href="/communications/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Communications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No communications yet</p>
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between py-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{item.subject}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.communication_type && (
                      <Badge variant="secondary">{item.communication_type}</Badge>
                    )}
                    <Badge variant="outline">{item.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={page} totalPages={totalPages} basePath="/communications" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
