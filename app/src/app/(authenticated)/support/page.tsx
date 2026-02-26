import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Plus, HeadphonesIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ListPagination } from '@/components/ui/list-pagination'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'

interface TicketRow {
  id: string
  subject: string
  status: string
  priority: string | null
  category: string | null
  created_at: string
}

export default async function SupportPage({
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

  const query = supabase
    .from('support_tickets')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  const { data: ticketsData, count, error } = await query
  if (error) throw error

  const tickets = (ticketsData || []) as TicketRow[]
  const totalPages = Math.ceil((count || 0) / pageSize)
  const openCount = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Support</h1>
          <p className="text-muted-foreground">{count || 0} tickets &middot; {openCount} open</p>
        </div>
        <Link href="/support/new">
          <Button><Plus className="h-4 w-4 mr-2" />New Ticket</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeadphonesIcon className="h-5 w-5" />
            Support Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length > 0 ? (
            <div className="divide-y divide-border">
              {tickets.map((ticket) => (
                <Link key={ticket.id} href={`/support/${ticket.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{ticket.subject}</span>
                    <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
                    {ticket.priority === 'high' && <Badge className="bg-red-100 text-red-700 rounded">High</Badge>}
                    {ticket.category && <Badge variant="outline" className="text-xs">{ticket.category}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(ticket.created_at)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HeadphonesIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No support tickets</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={page} totalPages={totalPages} basePath="/support" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
