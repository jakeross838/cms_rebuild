import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Plus, CheckSquare, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { safeOrIlike, formatDate, getStatusColor, formatStatus } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Punch List' }

interface PunchItem {
  id: string
  title: string | null
  description: string | null
  status: string | null
  priority: string | null
  category: string | null
  location: string | null
  room: string | null
  due_date: string | null
  completed_at: string | null
  created_at: string | null
}

export default async function PunchListPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const page = Number(sp.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const { companyId, supabase } = await getServerAuth()

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, name')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (jobError || !job) {
    notFound()
  }

  let itemsQuery = supabase
    .from('punch_items')
    .select('*', { count: 'exact' })
    .eq('job_id', id)
    .is('deleted_at', null)

  if (sp.search) {
    itemsQuery = itemsQuery.or(`title.ilike.${safeOrIlike(sp.search)},description.ilike.${safeOrIlike(sp.search)}`)
  }

  const { data: itemsData, count, error } = await itemsQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)
  if (error) throw error

  const items = (itemsData || []) as PunchItem[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  const open = items.filter((i) => i.status === 'open' || i.status === 'in_progress').length
  const completed = items.filter((i) => i.status === 'completed' || i.status === 'verified').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Punch List</h2>
          <p className="text-sm text-muted-foreground">{items.length} items</p>
        </div>
        <Link href={`/jobs/${id}/punch-list/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search punch list..." aria-label="Search punch list" defaultValue={sp.search} className="pl-10" /></form>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-3"><p className="text-sm text-muted-foreground">Total</p><p className="text-lg font-bold">{items.length}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-sm text-muted-foreground">Open</p><p className="text-lg font-bold text-amber-600">{open}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-sm text-muted-foreground">Completed</p><p className="text-lg font-bold text-green-600">{completed}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            All Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            <div className="divide-y divide-border">
              {items.map((item) => (
                <Link key={item.id} href={`/jobs/${id}/punch-list/${item.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.title ?? 'Untitled'}</span>
                    <Badge className={getStatusColor(item.status ?? 'open')}>{formatStatus((item.status ?? 'open'))}</Badge>
                    {item.priority && <Badge className={getStatusColor(item.priority)}>{formatStatus(item.priority)}</Badge>}
                  </div>
                  {item.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{item.description}</p>}
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {item.location && <span>{item.location}</span>}
                    {item.room && <span>{item.room}</span>}
                    {item.category && <span>{item.category}</span>}
                    {item.due_date && <span>Due: {formatDate(item.due_date)}</span>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No punch list items yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={page} totalPages={totalPages} basePath={`/jobs/${id}/punch-list`} searchParams={sp as Record<string, string | undefined>} />
    </div>
  )
}
