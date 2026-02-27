import type { Metadata } from 'next'
import Link from 'next/link'

import { Plus, Search, CheckSquare } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { escapeLike, formatDate, getStatusColor } from '@/lib/utils'

interface PunchItem {
  id: string
  title: string | null
  status: string | null
  priority: string | null
  category: string | null
  location: string | null
  room: string | null
  job_id: string
  due_date: string | null
  created_at: string | null
}

export const metadata: Metadata = { title: 'Punch Lists' }

export default async function PunchListsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const { companyId, supabase } = await getServerAuth()

  let query = supabase
    .from('punch_items')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (params.status) {
    query = query.eq('status', params.status)
  }

  if (params.search) {
    query = query.ilike('title', `%${escapeLike(params.search)}%`)
  }

  query = query.range(offset, offset + pageSize - 1)

  const { data: itemsData, count, error } = await query
  if (error) throw error
  const items = (itemsData || []) as PunchItem[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  const statusFilters = [
    { value: '', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'verified', label: 'Verified' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Punch Lists</h1>
          <p className="text-muted-foreground">{count || 0} total punch items</p>
        </div>
        <Link href="/punch-lists/new"><Button><Plus className="h-4 w-4 mr-2" />Add Item</Button></Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form><Input type="search" name="search" placeholder="Search punch items..." aria-label="Search punch items" defaultValue={params.search} className="pl-10" /></form>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {statusFilters.map((filter) => {
            const sp = new URLSearchParams()
            if (filter.value) sp.set('status', filter.value)
            if (params.search) sp.set('search', params.search)
            const qs = sp.toString()
            return (
              <Link key={filter.value} href={`/punch-lists${qs ? `?${qs}` : ''}`}>
                <Button variant={params.status === filter.value || (!params.status && !filter.value) ? 'default' : 'outline'} size="sm">{filter.label}</Button>
              </Link>
            )
          })}
        </div>
      </div>

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item) => (
            <Link key={item.id} href={`/punch-lists/${item.id}`} className="block hover:bg-accent/50 rounded-md transition-colors">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{item.title ?? 'Untitled'}</span>
                    <Badge className={getStatusColor(item.status ?? 'open')}>{(item.status ?? 'open').replace('_', ' ')}</Badge>
                    {item.priority && <Badge variant="outline" className="text-xs">{item.priority}</Badge>}
                  </div>
                  <div className="flex items-center gap-3 ml-6 mt-1 text-xs text-muted-foreground">
                    {item.location && <span>{item.location}</span>}
                    {item.room && <span>{item.room}</span>}
                    {item.category && <span>{item.category}</span>}
                    {item.due_date && <span>Due: {formatDate(item.due_date)}</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-lg font-medium text-foreground mb-1">No punch items found</p>
          <p className="text-muted-foreground mb-4">{params.search || params.status ? 'Try adjusting your filters' : 'All punch items across jobs will appear here'}</p>
          {!params.search && !params.status && (
            <Link href="/jobs">
              <Button>
                Go to Jobs
              </Button>
            </Link>
          )}
        </div>
      )}

      <ListPagination currentPage={page} totalPages={totalPages} basePath="/punch-lists" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
